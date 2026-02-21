import type { ProductListParams, ProductsResponse } from '../types/products'

export interface ProductsCacheEntry {
  data: ProductsResponse
  createdAt: number
}

export interface ProductsCacheState {
  entry: ProductsCacheEntry
  ageMs: number
  isExpired: boolean
}

const productsCache = new Map<string, ProductsCacheEntry>()

export function getProductsCacheKey(params: ProductListParams): string {
  return [
    params.search.trim().toLowerCase(),
    params.page,
    params.limit,
    params.sortBy,
    params.order,
  ].join('::')
}

export function readProductsCache(
  key: string,
  ttlMs: number,
): ProductsCacheState | undefined {
  const entry = productsCache.get(key)
  if (!entry) {
    return undefined
  }

  const ageMs = Date.now() - entry.createdAt
  return {
    entry,
    ageMs,
    isExpired: ageMs > ttlMs,
  }
}

export function writeProductsCache(key: string, data: ProductsResponse): void {
  productsCache.set(key, { data, createdAt: Date.now() })
}

export function clearProductsCache(): void {
  productsCache.clear()
}
