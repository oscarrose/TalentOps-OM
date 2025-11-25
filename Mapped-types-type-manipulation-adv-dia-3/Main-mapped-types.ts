
// Sistema de transformaciones usando mapped types y distributive conditional types

import { CatalogItemFactory, CatalogProcessor } from "./mapped-types.service";

// Uso del sistema
const product = CatalogItemFactory.createProduct({
  name: 'Laptop',
  price: 999,
  category: 'Electronics',
  inStock: true,
  metadata: {
    weight: 2.5,
    dimensions: { width: 30, height: 20, depth: 2 },
    tags: ['laptop', 'computer', 'portable']
  }
});

const apiResponse = CatalogProcessor.processItem(product);
const event = CatalogProcessor.createEvent(product, { price: 899 }, 'user123');

console.log('API Response:', apiResponse);
console.log('Event:', event);