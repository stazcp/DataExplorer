import assert from 'node:assert/strict'
import test from 'node:test'
import { fetchProductEnrichment } from '../src/api/products'
import { sampleProduct } from './fixtures'

test('async behavior: enrichment rejects with AbortError when selection changes quickly', async () => {
  const controller = new AbortController()
  const enrichmentPromise = fetchProductEnrichment(sampleProduct, controller.signal)

  controller.abort()

  await assert.rejects(enrichmentPromise, (error: unknown) => {
    return error instanceof DOMException && error.name === 'AbortError'
  })
})
