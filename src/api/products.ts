import type {
  Product,
  ProductEnrichment,
  ProductListParams,
  ProductsResponse,
} from '../types/products'

const API_BASE_URL = 'https://dummyjson.com'

export async function fetchProducts(
  params: ProductListParams,
  signal?: AbortSignal,
): Promise<ProductsResponse> {
  const search = params.search.trim()
  const endpoint = search.length > 0 ? '/products/search' : '/products'
  const queryParams = new URLSearchParams({
    limit: String(params.limit),
    skip: String((params.page - 1) * params.limit),
    sortBy: params.sortBy,
    order: params.order,
  })

  if (search.length > 0) {
    queryParams.set('q', search)
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}?${queryParams.toString()}`, {
    signal,
  })

  if (!response.ok) {
    throw new Error(`Failed to load products (${response.status})`)
  }

  return (await response.json()) as ProductsResponse
}

export async function fetchProductById(
  productId: number,
  signal?: AbortSignal,
): Promise<Product> {
  const response = await fetch(`${API_BASE_URL}/products/${productId}`, { signal })

  if (!response.ok) {
    throw new Error(`Failed to load product #${productId} (${response.status})`)
  }

  return (await response.json()) as Product
}

export async function fetchProductEnrichment(
  product: Product,
  signal?: AbortSignal,
): Promise<ProductEnrichment> {
  const simulatedDelayMs = 700 + (product.id % 4) * 250
  await wait(simulatedDelayMs, signal)

  const demandScore = Math.max(
    0,
    Math.min(100, Math.round(product.rating * 18 + product.stock * 0.25)),
  )
  const inventoryHealth =
    product.stock < 10 ? 'Critical' : product.stock < 35 ? 'Watch' : 'Healthy'

  return {
    demandScore,
    inventoryHealth,
    summary: `${product.title} has a ${demandScore}/100 demand score and ${inventoryHealth.toLowerCase()} inventory coverage.`,
    lastCalculatedAt: new Date().toISOString(),
  }
}

function wait(ms: number, signal?: AbortSignal): Promise<void> {
  return new Promise((resolve, reject) => {
    const timeoutId = setTimeout(() => {
      cleanup()
      resolve()
    }, ms)

    const onAbort = () => {
      cleanup()
      reject(new DOMException('Request aborted', 'AbortError'))
    }

    const cleanup = () => {
      clearTimeout(timeoutId)
      signal?.removeEventListener('abort', onAbort)
    }

    if (signal?.aborted) {
      onAbort()
      return
    }

    signal?.addEventListener('abort', onAbort, { once: true })
  })
}
