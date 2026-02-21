import { keepPreviousData, useQuery } from '@tanstack/react-query'
import { fetchProducts } from '../api/products'
import { readProductsCache, getProductsCacheKey, writeProductsCache } from '../cache/productsCache'
import { PRODUCTS_CACHE_TTL_MS } from '../constants'
import type { ProductListParams, ProductsResponse } from '../types/products'

export function useProductsQuery(params: ProductListParams) {
  const normalizedParams: ProductListParams = {
    ...params,
    search: params.search.trim(),
  }
  const cacheKey = getProductsCacheKey(normalizedParams)
  const cachedState = readProductsCache(cacheKey, PRODUCTS_CACHE_TTL_MS)
  const staleTimeMs =
    cachedState && !cachedState.isExpired
      ? Math.max(PRODUCTS_CACHE_TTL_MS - cachedState.ageMs, 0)
      : 0

  return useQuery<ProductsResponse, Error>({
    queryKey: [
      'products',
      normalizedParams.search,
      normalizedParams.page,
      normalizedParams.limit,
      normalizedParams.sortBy,
      normalizedParams.order,
    ],
    queryFn: async ({ signal }) => {
      const response = await fetchProducts(normalizedParams, signal)
      writeProductsCache(cacheKey, response)
      return response
    },
    initialData: cachedState?.entry.data,
    staleTime: staleTimeMs,
    placeholderData: keepPreviousData,
    refetchOnMount: cachedState?.isExpired ? 'always' : false,
    refetchOnWindowFocus: false,
    retry: 1,
  })
}
