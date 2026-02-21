# Data Explorer

Take-home exercise scaffold for a React + TypeScript product explorer using DummyJSON.

## API
- Base list: `https://dummyjson.com/products`
- Search: `https://dummyjson.com/products/search`
- Detail: `https://dummyjson.com/products/{id}`

## Stack
- React + TypeScript + Vite
- TanStack Query (request orchestration)
- Custom in-memory TTL cache for list responses

## Run
```bash
pnpm install
pnpm dev
```

## Current Scaffold
- Product list shell with debounced search, sorting, and pagination controls
- Loading/error states for list and panel
- Detail side panel with product fetch by ID
- Secondary async enrichment flow with abort-safe stale-result prevention
- Typed API contracts in `src/types/products.ts`

## Cache Strategy
- Query key + cache key include `search + page + limit + sortBy + order`
- TTL defaults to 60 seconds
- Fresh cache serves immediately and suppresses refetch
- Expired cache hydrates immediately and triggers background refetch

## Race Condition Strategy
- List: TanStack Query dedupe + request cancellation through `AbortSignal`
- Panel enrichment: `AbortController` cleanup on product switch/unmount

## Exercise Notes
Additional implementation notes are tracked in `PROJECT_DETAILS.md`.
