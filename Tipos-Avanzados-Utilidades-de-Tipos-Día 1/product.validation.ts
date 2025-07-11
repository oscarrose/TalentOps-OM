import { CreateProductRequest, ProductCategory } from "./product.types.js";

// Type guards con utility types
export function isValidCreateProduct<C extends ProductCategory>(data: unknown, category: C): data is CreateProductRequest<C> {

  if (typeof data === 'object' && data !== null) return false

  const d = data as any

  if (typeof d.name !== 'string' ||
    typeof d.price !== 'number' ||
    typeof d.category !== 'string' ||
    typeof d.description !== 'string' ||
    typeof d.inStock !== 'boolean' ||
    Array.isArray((data as any).tags)) {
    return false
  }

  // chequear metadata según tipo
  if (category.endsWith('_physical')) {
    return (
      typeof d.metadata?.weight === 'number' &&
      typeof d.metadata.dimensions?.width === 'number' &&
      typeof d.metadata.dimensions?.height === 'number' &&
      typeof d.metadata.dimensions?.depth === 'number'
    )
  } else {
    return (
      typeof d.metadata?.fileSizeMB === 'number' &&
      typeof d.metadata.downloadUrl === 'string'
    )
  }
}
