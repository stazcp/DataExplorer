import { useQuery } from '@tanstack/react-query'
import { fetchProductEnrichment } from '../api/products'
import { useProductDetailQuery } from '../hooks/useProductDetailQuery'
import type { ProductEnrichment } from '../types/products'

interface DetailPanelProps {
  productId: number | null
  onClose: () => void
}

type EnrichmentStatus = 'idle' | 'loading' | 'success' | 'error'

export function DetailPanel({ productId, onClose }: DetailPanelProps) {
  const { data: product, isLoading, isError, error } = useProductDetailQuery(productId)
  const enrichmentQuery = useQuery<ProductEnrichment, Error>({
    queryKey: ['product-enrichment', product?.id],
    queryFn: ({ signal }) => {
      if (!product) {
        throw new Error('No product selected.')
      }

      return fetchProductEnrichment(product, signal)
    },
    enabled: Boolean(product),
    refetchOnWindowFocus: false,
    retry: 0,
  })
  const enrichmentStatus: EnrichmentStatus = !product
    ? 'idle'
    : enrichmentQuery.isPending
      ? 'loading'
      : enrichmentQuery.isError
        ? 'error'
        : 'success'

  if (productId === null) {
    return (
      <aside className="detail-panel detail-panel--empty">
        <h2>Product Details</h2>
        <p>Select a product to inspect details and enrichment output.</p>
      </aside>
    )
  }

  return (
    <aside className="detail-panel">
      <div className="detail-panel__header">
        <h2>Product Details</h2>
        <button onClick={onClose} type="button">
          Close
        </button>
      </div>

      {isLoading ? <p className="panel-status">Loading selected product...</p> : null}
      {isError ? <p className="panel-status panel-status--error">{error?.message}</p> : null}

      {product ? (
        <>
          <img alt={product.title} className="detail-panel__image" src={product.thumbnail} />
          <h3>{product.title}</h3>
          <p>{product.description}</p>

          <dl className="detail-grid">
            <div>
              <dt>Category</dt>
              <dd>{product.category}</dd>
            </div>
            <div>
              <dt>Price</dt>
              <dd>${product.price.toFixed(2)}</dd>
            </div>
            <div>
              <dt>Rating</dt>
              <dd>{product.rating.toFixed(1)}</dd>
            </div>
            <div>
              <dt>Stock</dt>
              <dd>{product.stock}</dd>
            </div>
          </dl>

          <section className="enrichment">
            <h4>Enrichment</h4>
            {enrichmentStatus === 'loading' ? <p>Calculating enrichment...</p> : null}
            {enrichmentStatus === 'error' ? (
              <p className="panel-status panel-status--error">{enrichmentQuery.error?.message}</p>
            ) : null}
            {enrichmentStatus === 'success' && enrichmentQuery.data ? (
              <>
                <p>{enrichmentQuery.data.summary}</p>
                <ul>
                  <li>Demand score: {enrichmentQuery.data.demandScore}</li>
                  <li>Inventory health: {enrichmentQuery.data.inventoryHealth}</li>
                </ul>
              </>
            ) : null}
          </section>
        </>
      ) : null}
    </aside>
  )
}
