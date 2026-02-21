import type { Product } from '../types/products'

interface ProductListProps {
  products: Product[]
  isLoading: boolean
  isFetching: boolean
  isError: boolean
  error: Error | null
  selectedProductId: number | null
  onSelect: (productId: number) => void
}

export function ProductList({
  products,
  isLoading,
  isFetching,
  isError,
  error,
  selectedProductId,
  onSelect,
}: ProductListProps) {
  if (isLoading && products.length === 0) {
    return <div className="state-card">Loading products...</div>
  }

  if (isError && products.length === 0) {
    return <div className="state-card state-card--error">{error?.message}</div>
  }

  if (products.length === 0) {
    return <div className="state-card">No products matched this search.</div>
  }

  return (
    <div className="product-list-wrap">
      {isFetching ? <p className="list-status">Refreshing data...</p> : null}
      <ul className="product-list">
        {products.map((product) => {
          const isSelected = selectedProductId === product.id
          return (
            <li key={product.id}>
              <button
                className={`product-card${isSelected ? ' product-card--selected' : ''}`}
                onClick={() => onSelect(product.id)}
                type="button"
              >
                <img alt={product.title} src={product.thumbnail} />
                <div className="product-card__content">
                  <h3>{product.title}</h3>
                  <p>{product.description}</p>
                  <div className="product-card__meta">
                    <span>${product.price.toFixed(2)}</span>
                    <span>{product.rating.toFixed(1)} rating</span>
                  </div>
                </div>
              </button>
            </li>
          )
        })}
      </ul>
    </div>
  )
}
