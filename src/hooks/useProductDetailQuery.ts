import { useQuery } from '@tanstack/react-query'
import { fetchProductById } from '../api/products'
import type { Product } from '../types/products'

export function useProductDetailQuery(productId: number | null) {
  return useQuery<Product, Error>({
    queryKey: ['product', productId],
    queryFn: ({ signal }) => fetchProductById(productId as number, signal),
    enabled: productId !== null,
    staleTime: 60_000,
    refetchOnWindowFocus: false,
    retry: 1,
  })
}
