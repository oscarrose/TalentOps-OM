import { CatalogItem, Product } from "./catalog.interface";

// 1. Crear API response types
export type ToApiResponse<T> = T extends { type: infer U }
  ? {
      type: U;
      id: T["id"];
      data: Omit<T, "id" | "type" | "createdAt" | "updatedAt" | "version">;
      meta: {
        createdAt: string;
        updatedAt: string;
        version: number;
      };
    }
  : never;

export type CatalogApiResponses = ToApiResponse<CatalogItem>;

// 2. Crear update request types
export type ToUpdateRequest<T> = T extends { type: infer U }
  ? {
      type: U;
      updates: Partial<
        Omit<T, "id" | "type" | "createdAt" | "updatedAt" | "version">
      >;
      reason?: string;
    }
  : never;

export type CatalogUpdateRequests = ToUpdateRequest<CatalogItem>;

// 3. Mapped type para crear validation schemas
export type CreateValidationSchema<T> = {
  [K in keyof T]: T[K] extends string
    ? { type: "string"; required: boolean; pattern?: RegExp }
    : T[K] extends number
    ? { type: "number"; required: boolean; min?: number; max?: number }
    : T[K] extends boolean
    ? { type: "boolean"; required: boolean }
    : T[K] extends Date
    ? { type: "date"; required: boolean }
    : T[K] extends object
    ? {
        type: "object";
        required: boolean;
        schema: CreateValidationSchema<T[K]>;
      }
    : { type: "any"; required: boolean };
};

// 4. Distributive transformation para crear event types
export type ToEventType<T> = T extends { type: infer U }
  ? {
      eventType: `${string & U}Changed`;
      entityId: string;
      changes: Partial<
        Omit<T, "id" | "type" | "createdAt" | "updatedAt" | "version">
      >;
      metadata: {
        timestamp: Date;
        userId: string;
        source: string;
      };
    }
  : never;

export type CatalogEvents = ToEventType<CatalogItem>;

// 5. Mapped type para crear getters y setters
export type CreateAccessors<T> = {
  [K in keyof T as K extends
    | "id"
    | "type"
    | "createdAt"
    | "updatedAt"
    | "version"
    ? never
    : `get${Capitalize<string & K>}`]: () => T[K];
} & {
  [K in keyof T as K extends
    | "id"
    | "type"
    | "createdAt"
    | "updatedAt"
    | "version"
    ? never
    : `set${Capitalize<string & K>}`]: (value: T[K]) => void;
};

// 6. Sistema de serialization
export type CreateSerializers<T> = {
  [K in keyof T]: T[K] extends Date
    ? (value: T[K]) => string
    : T[K] extends object
    ? (value: T[K]) => Record<string, any>
    : (value: T[K]) => T[K];
};

//  Sistema de validación automática con mapped types
export type CreateValidators<T> = {
  [K in keyof T]: T[K] extends (infer U)[] //✅ array
    ? (value: T[K]) => boolean
    : // ✅ Tipos primitivos
    T[K] extends string
    ? (value: T[K]) => boolean
    : T[K] extends number
    ? (value: T[K]) => boolean
    : T[K] extends boolean
    ? (value: T[K]) => boolean
    : T[K] extends Date
    ? (value: T[K]) => boolean
    : T[K] extends object
    ? CreateValidators<T[K]>
    : // ✅ Fallback genérico
      (value: T[K]) => boolean;
};

export const DefaultValidators: CreateValidators<Omit<Product, "type">> = {
  name: (value) => typeof value === "string" && value.length > 0,
  price: (value) => typeof value === "number" && value >= 0,
  category: (value) => typeof value === "string" && value.length > 0,
  inStock: (value) => typeof value === "boolean",
  id: (value) => typeof value === "string" && value.length > 0,
  createdAt: (value) => value instanceof Date,
  updatedAt: (value) => value instanceof Date,
  version: (value) => typeof value === "number",
  metadata: {
    weight: (value) => typeof value === "number" && value > 0,
    tags: (value) =>
      Array.isArray(value) && value.every((v) => typeof v === "string"),
    dimensions: {
      width: (value) => typeof value === "number" && value > 0,
      height: (value) => typeof value === "number" && value > 0,
      depth: (value) => typeof value === "number" && value > 0,
    },
  },
};