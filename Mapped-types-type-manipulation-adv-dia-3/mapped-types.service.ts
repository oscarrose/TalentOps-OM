import { CreateValidators, ToApiResponse, ToEventType } from "./catalog-types";
import {
  CatalogItem,
  Product,
  Service,
  Subscription,
} from "./catalog.interface";

// 7. Factory para crear instances
export class CatalogItemFactory {
  static createProduct(
    data: Omit<Product, "id" | "type" | "createdAt" | "updatedAt" | "version">
  ): Product {
    return {
      id: `product_${Date.now()}`,
      type: "product",
      createdAt: new Date(),
      updatedAt: new Date(),
      version: 1,
      ...data,
    };
  }

  static createService(
    data: Omit<Service, "id" | "type" | "createdAt" | "updatedAt" | "version">
  ): Service {
    return {
      id: `service_${Date.now()}`,
      type: "service",
      createdAt: new Date(),
      updatedAt: new Date(),
      version: 1,
      ...data,
    };
  }

  static createSubscription(
    data: Omit<
      Subscription,
      "id" | "type" | "createdAt" | "updatedAt" | "version"
    >
  ): Subscription {
    return {
      id: `subscription_${Date.now()}`,
      type: "subscription",
      createdAt: new Date(),
      updatedAt: new Date(),
      version: 1,
      ...data,
    };
  }
}

// 8. Type-safe processor que usa distributive conditional types
export class CatalogProcessor {
  static processItem<T extends CatalogItem>(item: T): ToApiResponse<T> {
    const { id, type, createdAt, updatedAt, version, ...data } = item;

    return {
      type: type as any,
      id,
      data: data as any,
      meta: {
        createdAt: createdAt.toISOString(),
        updatedAt: updatedAt.toISOString(),
        version,
      },
    } as ToApiResponse<T>;
  }

  static createEvent<T extends CatalogItem>(
    item: T,
    changes: Partial<
      Omit<T, "id" | "type" | "createdAt" | "updatedAt" | "version">
    >,
    userId: string
  ): ToEventType<T> {
    return {
      eventType: `${item.type}Changed` as any,
      entityId: item.id,
      changes,
      metadata: {
        timestamp: new Date(),
        userId,
        source: "catalog-service",
      },
    } as ToEventType<T>;
  }
}
export class CatalogValidator {
  static validateItem<T extends CatalogItem>(
    item: T,
    validators: CreateValidators<T>
  ): boolean {
    const validateRecursively = (obj: any, schema: any): boolean => {
      return Object.keys(schema).every((key) => {
        const rule = schema[key];
        const value = obj[key];
        if (typeof rule === "function") {
          return rule(value);
        }
        if (typeof rule === "object" && value) {
          return validateRecursively(value, rule);
        }
        return false;
      });
    };
    return validateRecursively(item, validators);
  }
}
