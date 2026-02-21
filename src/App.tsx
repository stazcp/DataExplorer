import { useMemo, useState } from 'react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import './App.css'
import { DetailPanel } from './components/DetailPanel'
import { ProductList } from './components/ProductList'
import { PRODUCTS_PAGE_SIZE, SEARCH_DEBOUNCE_MS } from './constants'
import { useDebouncedValue } from './hooks/useDebouncedValue'
import { useProductsQuery } from './hooks/useProductsQuery'
import type { ProductSortField, SortOrder } from './types/products'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
})

function AppContent() {
  const [searchInput, setSearchInput] = useState('')
  const [page, setPage] = useState(1)
  const [sortBy, setSortBy] = useState<ProductSortField>('price')
  const [order, setOrder] = useState<SortOrder>('asc')
  const [selectedProductId, setSelectedProductId] = useState<number | null>(null)

  const debouncedSearch = useDebouncedValue(searchInput, SEARCH_DEBOUNCE_MS)

  const { data, isLoading, isFetching, isError, error } = useProductsQuery({
    search: debouncedSearch,
    page,
    limit: PRODUCTS_PAGE_SIZE,
    sortBy,
    order,
  })

  const totalPages = useMemo(() => {
    if (!data) {
      return 1
    }

    return Math.max(1, Math.ceil(data.total / PRODUCTS_PAGE_SIZE))
  }, [data])

  const effectivePage = Math.min(page, totalPages)

  return (
    <div className="app-shell">
      <header className="top-bar">
        <div>
          <p className="eyebrow">Take-Home Exercise</p>
          <h1>Data Explorer</h1>
          <p className="subtitle">
            React + TypeScript with deterministic async behavior and client-side caching.
          </p>
        </div>
        <div className="top-bar__meta">
          <span>{data?.total ?? 0} products</span>
          {isFetching ? <span className="refresh-indicator">Refreshing...</span> : null}
        </div>
      </header>

      <section className="control-row">
        <label>
          Search
          <input
            onChange={(event) => {
              setSearchInput(event.target.value)
              setPage(1)
            }}
            placeholder="Search products..."
            type="search"
            value={searchInput}
          />
        </label>

        <label>
          Sort by
          <select
            onChange={(event) => {
              setSortBy(event.target.value as ProductSortField)
              setPage(1)
            }}
            value={sortBy}
          >
            <option value="price">Price</option>
            <option value="rating">Rating</option>
          </select>
        </label>

        <label>
          Order
          <select
            onChange={(event) => {
              setOrder(event.target.value as SortOrder)
              setPage(1)
            }}
            value={order}
          >
            <option value="asc">Ascending</option>
            <option value="desc">Descending</option>
          </select>
        </label>
      </section>

      <main className="content-grid">
        <section className="list-column">
          <ProductList
            error={error}
            isError={isError}
            isFetching={isFetching}
            isLoading={isLoading}
            onSelect={setSelectedProductId}
            products={data?.products ?? []}
            selectedProductId={selectedProductId}
          />

          <footer className="pagination">
            <button
              disabled={page === 1 || (isLoading && !data)}
              onClick={() => setPage((current) => Math.max(1, current - 1))}
              type="button"
            >
              Previous
            </button>
            <span>
              Page {effectivePage} of {totalPages}
            </span>
            <button
              disabled={page >= totalPages || (isLoading && !data)}
              onClick={() => setPage((current) => Math.min(totalPages, current + 1))}
              type="button"
            >
              Next
            </button>
          </footer>

          {isError && data?.products.length ? (
            <p className="inline-error">{error?.message}</p>
          ) : null}
        </section>

        <DetailPanel onClose={() => setSelectedProductId(null)} productId={selectedProductId} />
      </main>
    </div>
  )
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AppContent />
      {import.meta.env.DEV ? (
        <ReactQueryDevtools buttonPosition="bottom-left" initialIsOpen={false} />
      ) : null}
    </QueryClientProvider>
  )
}

export default App
