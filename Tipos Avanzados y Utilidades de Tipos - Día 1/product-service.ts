import { isValidCreateProduct } from "./product.validation";
import { PhysicalProductMetadata, Product, ProductCategory, ProductSearchResult, UpdateProductRequest, ValidationResult } from "./product.types";
// Service con transformaciones automáticas
export class ProductService {
  constructor(private repository: any) { } // Repositorio genérico

  async createProduct<C extends ProductCategory>(data: unknown, category: C,): Promise<ValidationResult<Product<C>>> {
    if (!isValidCreateProduct(data, category)) {
      return {
        success: false,
        errors: "Invalid product data format",
      } as ValidationResult<never>;
    }

    const product: Product<C> = {
      id: `product_${Date.now()}`,
      ...data,
    };

    await this.repository.save(product);

    return {
      success: true,
      data: product,
    };
  }

  async updateProduct<C extends ProductCategory>(
    id: string,
    updates: UpdateProductRequest<C>,
  ): Promise<ValidationResult<Product<C>>> {
    const existingProduct = await this.repository.findById(id);

    if (!existingProduct) {
      return {
        success: false,
        errors: ["Product not found"],
      }as ValidationResult<never>;
    }

    // Deep merge con type safety
    const updatedProduct: Product<C> = {
      ...existingProduct,
      ...updates,
      metadata: {
        ...existingProduct.metadata,
        ...updates.metadata,
        ...(existingProduct.metadata && 'dimensions' in existingProduct.metadata ? {
          dimensions: {
            ...existingProduct.metadata.dimensions,
            ...(updates.metadata as PhysicalProductMetadata)?.dimensions
          }
        } : null),
      } as any // Necesario debido a la complejidad del tipo condicional
    };

    await this.repository.save(updatedProduct);

    return {
      success: true,
      data: updatedProduct,
    };
  }

  async searchProducts<C extends ProductCategory>(query: string): Promise<ProductSearchResult<C>[]> {
    const products = await this.repository.search(query);

    // Transformación automática a search result format
    return products.map((product: Product<C>) => ({
      id: product.id,
      name: product.name,
      price: product.price,
      category: product.category,
    }));
  }
}
