export interface ProductReview {
  rating: number
  comment: string
  date: string
  reviewerName: string
  reviewerEmail: string
}

export interface ProductDimensions {
  width: number
  height: number
  depth: number
}

export interface ProductMeta {
  createdAt: string
  updatedAt: string
  barcode: string
  qrCode: string
}

export interface Product {
  id: number
  title: string
  description: string
  category: string
  price: number
  discountPercentage: number
  rating: number
  stock: number
  tags: string[]
  brand?: string
  sku?: string
  weight?: number
  dimensions?: ProductDimensions
  warrantyInformation?: string
  shippingInformation?: string
  availabilityStatus?: string
  reviews?: ProductReview[]
  returnPolicy?: string
  minimumOrderQuantity?: number
  meta?: ProductMeta
  images: string[]
  thumbnail: string
}

export interface ProductsResponse {
  products: Product[]
  total: number
  skip: number
  limit: number
}

export type ProductSortField = 'price' | 'rating'
export type SortOrder = 'asc' | 'desc'

export interface ProductListParams {
  search: string
  page: number
  limit: number
  sortBy: ProductSortField
  order: SortOrder
}

export interface ProductEnrichment {
  demandScore: number
  inventoryHealth: 'Healthy' | 'Watch' | 'Critical'
  summary: string
  lastCalculatedAt: string
}
