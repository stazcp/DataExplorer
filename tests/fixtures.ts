import type { Product, ProductsResponse } from '../src/types/products'

export const sampleProduct: Product = {
  id: 1,
  title: 'Sample Phone',
  description: 'A reliable test phone',
  category: 'smartphones',
  price: 499,
  discountPercentage: 8.5,
  rating: 4.6,
  stock: 24,
  tags: ['phone', 'electronics'],
  brand: 'Acme',
  images: ['https://example.com/image-1.jpg'],
  thumbnail: 'https://example.com/thumb-1.jpg',
}

export const sampleProductsResponse: ProductsResponse = {
  products: [sampleProduct],
  total: 1,
  skip: 0,
  limit: 12,
}
