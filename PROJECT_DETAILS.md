# Take-Home Exercise: Data Explorer with Intelligent Client Caching

Build a small React + TypeScript app using the public API from DummyJSON:
`https://dummyjson.com/products`

Use the API as-is (no custom backend layer).

## Requirements

### 1. Product List
- Pagination
- Search (debounced)
- Sorting (price or rating)
- Proper loading and error states
- Avoid duplicate requests and race conditions

### 2. Client-Side Cache (Key Requirement)
Implement a lightweight cache:
- Keyed by search + page + sort
- TTL (e.g., 60 seconds)
- Background refetch when expired
- Correct invalidation when parameters change

### 3. Detail Panel
- Clicking a product opens a side panel
- Show product details
- Trigger a secondary async enrichment call (may be simulated with a delay)
- Prevent stale enrichment results if switching quickly
- Keep loading state isolated to the panel

### 4. Testing
Include at least 3 meaningful tests:
- One async behavior test
- One cache behavior test
- One component-level test

### 5. Deliverables
Provide a GitHub repo and a README explaining:
- State management approach
- Caching strategy
- How race conditions were handled
- Tradeoffs made within the time limit
- What you would improve with more time

## Evaluation Focus
Architecture quality, async correctness, and decision-making matter more than UI polish.

## API Snapshot (Reviewed)
Primary list endpoint:
- `GET /products`
- Supports pagination via `limit` and `skip`

Search endpoint:
- `GET /products/search?q={term}&limit={n}&skip={n}`

Sorting:
- `sortBy=price|rating`
- `order=asc|desc`

Single product:
- `GET /products/{id}`

Observed response shape includes:
- Envelope: `products`, `total`, `skip`, `limit`
- Product fields: `id`, `title`, `description`, `category`, `price`, `discountPercentage`, `rating`, `stock`, `tags`, `brand`, `thumbnail`, `images`, and additional metadata (`dimensions`, `reviews`, `meta`, etc.)

## Typed Contract (Scaffolded)
Defined in `src/types/products.ts`:
- `Product`
- `ProductsResponse`
- `ProductSortField` (`price | rating`)
- `SortOrder` (`asc | desc`)
- `ProductListParams`
- `ProductEnrichment` (secondary async panel model)

## Architecture Direction
Minimal external libraries:
- React + TypeScript
- TanStack Query for request orchestration/deduplication
- Custom in-memory TTL cache layered on top of TanStack Query

State ownership:
- App-level UI state: search text, page, sort, selected product
- Query state: product list + product detail loading/error lifecycles
- Panel-local async behavior: enrichment call is isolated in panel query state

## Caching Strategy
Custom cache in `src/cache/productsCache.ts`:
- Cache key: normalized `search + page + limit + sortBy + order`
- TTL: `60_000ms` (`PRODUCTS_CACHE_TTL_MS`)
- Behavior:
  - Fresh cache: hydrate query immediately, skip network refetch
  - Expired cache: hydrate stale data immediately, trigger background refetch
  - Parameter changes: naturally invalidate by key change

TanStack integration in `src/hooks/useProductsQuery.ts`:
- Uses query keys aligned to cache key inputs
- Uses `initialData` from custom cache for instant paint
- Uses computed `staleTime` from cache age
- Uses fetch `AbortSignal` to reduce race-condition risk

## Race Condition Handling
List requests:
- Query key isolation prevents cross-parameter contamination
- TanStack Query deduplicates same-key in-flight requests
- `AbortSignal` passed to `fetch` supports cancellation when queries are superseded

Detail enrichment:
- Secondary async call is panel-local (`fetchProductEnrichment`)
- TanStack query cancellation via `AbortSignal` prevents stale writes on fast switching
- Enrichment loading/error does not block product list UI

## UI Scaffold Status
Implemented:
- List page scaffold with search, sort, pagination, loading, and error views
- Product selection and detail side panel
- Secondary enrichment async workflow with stale-result protection
- Responsive layout for desktop/mobile

Next:
- Keep adding integration coverage for debounced search + pagination edge cases
- Add prefetch strategies and richer cache instrumentation if time allows

## Implemented Test Coverage
- Async behavior: enrichment abort path rejects with `AbortError` when canceled quickly
- Cache behavior: key normalization and TTL expiry assertions
- Component-level: `ProductList` rendering + selection callback behavior
