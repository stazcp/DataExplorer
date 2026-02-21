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
  // staleTime is "time remaining until stale" for React Query, derived from cache TTL.
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
    queryFn: async ({ signal }: { signal: AbortSignal }) => {
      const response = await fetchProducts(normalizedParams, signal)
      // Keep the custom TTL cache in sync with successful network responses.
      writeProductsCache(cacheKey, response)
      return response
    },
    // Hydrate instantly from the custom cache when available.
    initialData: cachedState?.entry.data,
    staleTime: staleTimeMs,
    placeholderData: keepPreviousData,
    // Interpretation: once expired, refetch in background on query triggers (mount/key/manual),
    // not as a timer-driven auto-refetch while the same mounted view stays idle.
    refetchOnMount: cachedState?.isExpired ? 'always' : false,
    refetchOnWindowFocus: false,
    retry: 1,
  })
}
