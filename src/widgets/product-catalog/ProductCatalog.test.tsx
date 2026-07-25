import { render, screen } from '@testing-library/react'
import ProductCatalog from './ProductCatalog'
import type { IProduct } from '@/entities/product'

jest.mock('@/entities/product', () => ({
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  Product: ({ product }: any) => <div data-testid="product-item">{product.name}</div>,
}))

// Swapped per test through a getter so the empty catalog can be reached here too.
let mockProducts: IProduct[] = []
jest.mock('@/entities/product/config/mock', () => ({
  get MOCK_PRODUCTS() {
    return mockProducts
  },
}))

const REAL_PRODUCTS: IProduct[] =
  jest.requireActual('@/entities/product/config/mock').MOCK_PRODUCTS

describe('ProductCatalog component', () => {
  beforeEach(() => {
    mockProducts = REAL_PRODUCTS
  })

  // This is the screen "See all" promises: the catalog, not a slice of it
  test('renders every product in the catalog', () => {
    render(<ProductCatalog />)

    expect(REAL_PRODUCTS.length).toBeGreaterThan(0)
    expect(screen.getAllByTestId('product-item')).toHaveLength(REAL_PRODUCTS.length)
    REAL_PRODUCTS.forEach((product) => {
      expect(screen.getByText(product.name)).toBeInTheDocument()
    })
  })

  // The headline count is the length of the list underneath it, so the two cannot drift
  test('states a count that matches the cards it renders', () => {
    render(<ProductCatalog />)

    const rendered = screen.getAllByTestId('product-item').length
    expect(screen.getByTestId('catalog-count')).toHaveTextContent(`${rendered} products`)
    expect(rendered).toBe(REAL_PRODUCTS.length)
  })

  test('uses the singular for a catalog of one', () => {
    mockProducts = REAL_PRODUCTS.slice(0, 1)
    render(<ProductCatalog />)

    expect(screen.getByTestId('catalog-count')).toHaveTextContent('1 product')
    expect(screen.getAllByTestId('product-item')).toHaveLength(1)
  })

  // An empty catalog says so instead of rendering a bare heading over nothing
  test('shows an empty state for an empty catalog', () => {
    mockProducts = []
    render(<ProductCatalog />)

    expect(screen.queryAllByTestId('product-item')).toHaveLength(0)
    expect(screen.queryByTestId('catalog-count')).not.toBeInTheDocument()
    expect(screen.getByTestId('empty-catalog')).toHaveTextContent(
      'There are no products in the catalog yet'
    )
  })
})
