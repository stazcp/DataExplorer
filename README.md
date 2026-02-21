# Data Explorer

Take-home exercise for a React + TypeScript product explorer using DummyJSON.

## API
- Base list: `https://dummyjson.com/products`
- Search: `https://dummyjson.com/products/search`
- Detail: `https://dummyjson.com/products/{id}`

## Stack
- React + TypeScript + Vite
- TanStack Query (request orchestration)
- Custom in-memory TTL cache for list responses
- TanStack Query Devtools inspector (development only)

## Run
```bash
pnpm install
pnpm dev
```

## Query Inspector
- The TanStack Query inspector is mounted in dev mode via `ReactQueryDevtools`.
- Open the floating button in the bottom-left of the app to inspect query keys, cache data, status, and refetch activity.

## State Management Approach
- Local UI state in `src/App.tsx` controls search text, page, sort field/order, and selected product.
- Server state uses TanStack Query hooks:
  - `useProductsQuery` for list/search/sort/pagination
  - `useProductDetailQuery` for panel detail fetch
  - Panel enrichment query keyed by product ID

## Caching Strategy
- Query key + cache key include `search + page + limit + sortBy + order`
- TTL defaults to 60 seconds
- Fresh cache serves immediately and suppresses refetch
- Expired cache hydrates immediately and triggers background refetch
- Parameter changes invalidate naturally through key changes

## Race Conditions
- List: TanStack Query dedupe + request cancellation through `AbortSignal`
- Panel enrichment: async call consumes query `AbortSignal`, so switching products prevents stale enrichment writes

## Testing
Run tests:
```bash
pnpm test
```

Included tests:
- Async behavior test: enrichment abort safety when user switches selection quickly
- Cache behavior test: normalized keying and TTL expiration
- Component-level test: product list rendering + click callback behavior

## Tradeoffs Within Time Limit
- Focused on async correctness and predictable request behavior over visual polish.
- Kept dependencies intentionally small and avoided adding a larger state-management library.
- Used lightweight in-memory cache (simple and explicit) instead of persistence/storage plugins.

## Improvements With More Time
- Add integration tests around debounced search + pagination with full fetch mocking.
- Add request prefetching for likely next page and selected product details.
- Add accessibility and keyboard interaction improvements for list/panel navigation.
- Add richer cache observability metrics (hit/miss/expired counters) in the UI.

## Exercise Notes
Detailed implementation notes are tracked in `PROJECT_DETAILS.md`.
