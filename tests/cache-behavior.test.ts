import assert from 'node:assert/strict'
import test from 'node:test'
import {
  clearProductsCache,
  getProductsCacheKey,
  readProductsCache,
  writeProductsCache,
} from '../src/cache/productsCache'
import type { ProductListParams } from '../src/types/products'
import { sampleProductsResponse } from './fixtures'

test('cache behavior: key normalization + TTL expiration work correctly', () => {
  clearProductsCache()

  const baseParams: ProductListParams = {
    search: '  Phone  ',
    page: 1,
    limit: 12,
    sortBy: 'price',
    order: 'asc',
  }
  const normalizedParams: ProductListParams = {
    ...baseParams,
    search: 'phone',
  }

  const keyFromMixedCase = getProductsCacheKey(baseParams)
  const keyFromNormalized = getProductsCacheKey(normalizedParams)
  assert.equal(keyFromMixedCase, keyFromNormalized)

  const originalNow = Date.now
  let now = 1_700_000_000_000
  Date.now = () => now

  try {
    writeProductsCache(keyFromMixedCase, sampleProductsResponse)

    const fresh = readProductsCache(keyFromMixedCase, 60_000)
    assert.ok(fresh)
    assert.equal(fresh.isExpired, false)
    assert.equal(fresh.ageMs, 0)

    now += 61_000

    const expired = readProductsCache(keyFromMixedCase, 60_000)
    assert.ok(expired)
    assert.equal(expired.isExpired, true)
    assert.equal(expired.ageMs, 61_000)
  } finally {
    Date.now = originalNow
    clearProductsCache()
  }
})
