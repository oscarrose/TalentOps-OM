import { DeepPartial } from 'typeorm';

// Template literal types 
type CategoryType = 'physical' | 'digital';
type BaseCategory  = 'clothing' | 'electronics' | 'ebooks' | 'software';

export type ProductCategory = `${BaseCategory}_${CategoryType}`;

export interface PhysicalProductMetadata {
  weight: number
  dimensions: {
    width: number
    height: number
    depth: number
  }
}


export interface DigitalProductMetadata {
  fileSizeMB: number
  downloadUrl: string
  licenseKey?: string
}

type MetadataFor<C extends ProductCategory> =
  C extends `${infer _Base}_physical` ? PhysicalProductMetadata :
  C extends `${infer _Base}_digital`  ? DigitalProductMetadata :
  never


export interface Product<C extends ProductCategory> {
  id: string;
  name: string;
  price: number;
  category: C;
  description: string;
  inStock: boolean;
  tags: string[];
  metadata: MetadataFor<C>;
}


// Transformaciones declarativas
export type CreateProductRequest<C extends ProductCategory> = Omit<Product<C>, 'id'>;
export type UpdateProductRequest<C extends ProductCategory> = DeepPartial<Omit<Product<C>, 'id'>>;

export type ProductSummary<C extends ProductCategory> = Pick<Product<C>, 'id' | 'name' | 'price' | 'inStock'>;

export type ProductSearchResult<C extends ProductCategory> = Pick<Product<C>, 'id' | 'name' | 'price' | 'category'>;

// Validation system con conditional types
export type ValidationResult<T> = T extends object 
  ? { success: true; data: T; errors?: never }
  : { success: false; data?: never; errors: string[] };

