// Domain model complejo con union types
interface BaseEntity {
  id: string;
  createdAt: Date;
  updatedAt: Date;
  version: number;
}

export interface Product extends BaseEntity {
  type: 'product';
  name: string;
  price: number;
  category: string;
  inStock: boolean;
  metadata: {
    weight: number;
    dimensions: { width: number; height: number; depth: number };
    tags: string[];
  };
}

export interface Service extends BaseEntity {
  type: 'service';
  name: string;
  hourlyRate: number;
  category: string;
  available: boolean;
  metadata: {
    duration: number;
    requirements: string[];
    location: 'remote' | 'onsite' | 'hybrid';
  };
}

export interface Subscription extends BaseEntity {
  type: 'subscription';
  name: string;
  monthlyPrice: number;
  category: string;
  active: boolean;
  metadata: {
    features: string[];
    limits: { users: number; storage: number };
    billingCycle: 'monthly' | 'yearly';
  };
}

export type CatalogItem = Product | Service | Subscription;
