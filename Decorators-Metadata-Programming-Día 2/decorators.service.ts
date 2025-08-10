
import 'reflect-metadata';

export class DatabaseTransaction{
  async commit() {
    console.log('[DB] Transaction committed');
  }
  async rollback() {
    console.log('[DB] Transaction rolled back');
  }
}

class Database{
  async beginTransaction(): Promise<DatabaseTransaction> {
    console.log('[DB] Transaction started');
    return new DatabaseTransaction();
  }
}
const db = new Database();
// Transaction decorator con rollback y commit
export function Transaction(){
  return function (target:any, propertyKey: string, descriptor: PropertyDescriptor){
    const originalMethod = descriptor.value;

     descriptor.value = async function(...args: any[]){
      const transaction = await db.beginTransaction();
      try {
        const result = await originalMethod.apply(this, [...args, transaction]);
        await transaction.commit();
        return result;
        
      } catch (error) {
        await transaction.rollback();
        throw error;
      }
    }
    return descriptor;
  }
}

// Validation decorator con schema support
export function Validate(schema: any) {
  return function (target: any, propertyKey: string, descriptor: PropertyDescriptor) {
    const originalMethod = descriptor.value;
    
    descriptor.value = async function (...args: any[]) {
      // Validar argumentos contra schema
      for (let i = 0; i < args.length; i++) {
        const result = schema.validate(args[i]);
        if (result.error) {
          throw new ValidationError(`Validation failed for parameter ${i}: ${result.error.message}`);
        }
      }
      
      return originalMethod.apply(this, args);
    };
    
    return descriptor;
  };
}

// Cache decorator con TTL y key generation
export function Cache(options: { ttl: number; keyGenerator?: (...args: any[]) => string }) {
  return function (target: any, propertyKey: string, descriptor: PropertyDescriptor) {
    const originalMethod = descriptor.value;
    const cache = new Map<string, { value: any; expiry: number }>();
    
    descriptor.value = async function (...args: any[]) {
      // Generar cache key
      const key = options.keyGenerator 
        ? options.keyGenerator(...args)
        : `${target.constructor.name}.${propertyKey}:${JSON.stringify(args)}`;
      
      // Verificar cache
      const cached = cache.get(key);
      if (cached && cached.expiry > Date.now()) {
        console.log(`Cache hit for key: ${key}`);
        return cached.value;
      }
      
      // Ejecutar método original
      const result = await originalMethod.apply(this, args);
      
      // Guardar en cache
      cache.set(key, {
        value: result,
        expiry: Date.now() + (options.ttl * 1000)
      });
      
      console.log(`Cache miss for key: ${key}, result cached`);
      return result;
    };
    
    return descriptor;
  };
}

// Logging decorator con performance metrics
export function Log(options: { level: 'debug' | 'info' | 'warn' | 'error' } = { level: 'info' }) {

  return function (target: any, propertyKey: string, descriptor: PropertyDescriptor) {
    const originalMethod = descriptor.value;
    
    descriptor.value = async function (...args: any[]) {
   
      const startTime = Date.now();
      const className = target.constructor.name;
      
      console.log(`[${options.level.toUpperCase()}] ${className}.${propertyKey} called with args:`, args);
      
      try {
        const result = await originalMethod.apply(this, args);
        const duration = Date.now() - startTime;
        
        console.log(`[${options.level.toUpperCase()}] ${className}.${propertyKey} completed in ${duration}ms`);
        return result;
        
      } catch (error) {
        const duration = Date.now() - startTime;
        console.error(`[ERROR] ${className}.${propertyKey} failed after ${duration}ms:`, error);
        throw error;
      }
    };
    
    return descriptor;
  };
}

// Retry decorator para resilience
export function Retry(options: { attempts: number; delay: number; backoff?: number }) {
  return function (target: any, propertyKey: string, descriptor: PropertyDescriptor) {
    const originalMethod = descriptor.value;
    
    descriptor.value = async function (...args: any[]) {
      let lastError: Error;
      
      for (let attempt = 1; attempt <= options.attempts; attempt++) {
        try {
          return await originalMethod.apply(this, args);
        } catch (error) {
          lastError = error as Error;
          
          if (attempt === options.attempts) {
            throw error;
          }
          
          const delay = options.delay * Math.pow(options.backoff || 1, attempt - 1);
          console.log(`Attempt ${attempt} failed, retrying in ${delay}ms...`);
          await new Promise(resolve => setTimeout(resolve, delay));
        }
      }
      
      throw lastError!;
    };
    
    return descriptor;
  };
}

// Schema simple para validation
export const CreateUserSchema = {
  validate: (data: any) => {
    if (!data || typeof data !== 'object') {
      return { error: { message: 'Data must be an object' } };
    }
    
    if (!data.email || typeof data.email !== 'string') {
      return { error: { message: 'Email is required and must be a string' } };
    }
    
    if (!data.name || typeof data.name !== 'string') {
      return { error: { message: 'Name is required and must be a string' } };
    }
    
    return { error: null };
  }
};

class ValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ValidationError';
  }
}

