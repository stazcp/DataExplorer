import assert from 'node:assert/strict'
import test from 'node:test'
import type { ReactElement, ReactNode } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { ProductList } from '../src/components/ProductList'
import type { Product } from '../src/types/products'

const products: Product[] = [
  {
    id: 10,
    title: 'Alpha Watch',
    description: 'Fitness tracker',
    category: 'wearables',
    price: 129,
    discountPercentage: 5,
    rating: 4.2,
    stock: 16,
    tags: ['wearable'],
    images: ['https://example.com/watch.jpg'],
    thumbnail: 'https://example.com/watch-thumb.jpg',
  },
  {
    id: 11,
    title: 'Beta Earbuds',
    description: 'Noise-cancelling earbuds',
    category: 'audio',
    price: 89,
    discountPercentage: 11,
    rating: 4.7,
    stock: 32,
    tags: ['audio'],
    images: ['https://example.com/earbuds.jpg'],
    thumbnail: 'https://example.com/earbuds-thumb.jpg',
  },
]

function collectByType(node: ReactNode, elementType: string): ReactElement[] {
  const matches: ReactElement[] = []

  const walk = (value: ReactNode): void => {
    if (Array.isArray(value)) {
      value.forEach(walk)
      return
    }

    if (!value || typeof value !== 'object') {
      return
    }

    const candidate = value as ReactElement<{ children?: ReactNode }>
    if (candidate.type === elementType) {
      matches.push(candidate)
    }

    walk(candidate.props?.children)
  }

  walk(node)
  return matches
}

test('component-level: ProductList renders cards and emits selection callback', () => {
  let selectedProductId: number | null = null
  const tree = ProductList({
    products,
    isLoading: false,
    isFetching: false,
    isError: false,
    error: null,
    selectedProductId: null,
    onSelect: (productId) => {
      selectedProductId = productId
    },
  })

  const markup = renderToStaticMarkup(tree)
  assert.equal(markup.includes('Alpha Watch'), true)
  assert.equal(markup.includes('Beta Earbuds'), true)

  const buttons = collectByType(tree, 'button')
  assert.equal(buttons.length, 2)

  const secondButton = buttons[1] as ReactElement<{ onClick?: () => void }>
  const onClick = secondButton.props.onClick
  assert.equal(typeof onClick, 'function')
  onClick?.()

  assert.equal(selectedProductId, 11)
})
