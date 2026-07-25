import { render, screen, fireEvent } from '@testing-library/react'
import { useRouter } from 'next/router'
import CategoryGrid from './CategoryGrid'
import { MOCK_PRODUCTS } from '@/entities/product/config/mock'
import type { Category } from '../../model/types'

jest.mock('next/router', () => ({
  useRouter: jest.fn(),
}))

jest.mock('next/image', () => ({
  __esModule: true,
  // eslint-disable-next-line @next/next/no-img-element
  default: ({ src, alt }: { src: string; alt: string }) => <img src={src} alt={alt} />,
}))

// The category list is swapped per test through a getter, so the empty state can be
// reached without a second test file. The product catalog behind the counts stays real.
let mockCategories: Category[] = []
jest.mock('../../config/mock', () => ({
  get MOCK_CATEGORIES() {
    return mockCategories
  },
}))

const REAL_CATEGORIES: Category[] =
  jest.requireActual('../../config/mock').MOCK_CATEGORIES

describe('CategoryGrid component', () => {
  const push = jest.fn()

  beforeEach(() => {
    jest.clearAllMocks()
    mockCategories = REAL_CATEGORIES
      ; (useRouter as jest.Mock).mockReturnValue({ push })
  })

  // The point of the screen: every category, not the subset a phone-width strip fits
  test('renders every category in the catalog', () => {
    render(<CategoryGrid />)

    expect(REAL_CATEGORIES.length).toBeGreaterThan(0)
    expect(screen.getAllByTestId('category-card')).toHaveLength(REAL_CATEGORIES.length)
    REAL_CATEGORIES.forEach((category) => {
      expect(screen.getByText(category.name)).toBeInTheDocument()
    })
  })

  // Counts come from the catalog, they are not written down beside the card
  test('prints the real number of products in each category', () => {
    render(<CategoryGrid />)

    const counts = screen.getAllByTestId('category-count').map((node) => node.textContent)

    // The catalog as it stands today. Hardcoded on purpose: a count derived from the
    // same expression the component uses would agree with it even when both are wrong.
    expect(REAL_CATEGORIES.map((category) => category.name)).toEqual([
      'Vegetables', 'Meat', 'Bakery', 'Dairy', 'Fruits',
    ])
    expect(counts).toEqual(['3 products', '3 products', '4 products', '3 products', '4 products'])
  })

  // Whatever the catalog becomes, the counts on this screen must still add up to it
  test('accounts for the whole catalog across the categories', () => {
    render(<CategoryGrid />)

    const total = screen
      .getAllByTestId('category-count')
      .reduce((sum, node) => sum + Number(node.textContent?.split(' ')[0]), 0)

    expect(total).toBe(MOCK_PRODUCTS.length)
  })

  // A category with nothing in it reads "0 products" rather than being quietly dropped
  test('shows a zero count instead of hiding an empty category', () => {
    mockCategories = [{ id: 999, name: 'Frozen', image: '/images/categories/frozen.png' }]
    render(<CategoryGrid />)

    expect(screen.getByText('Frozen')).toBeInTheDocument()
    expect(screen.getByTestId('category-count')).toHaveTextContent('0 products')
  })

  // Tapping a card opens the existing ?category= catalog, not a second filtering path
  test('opens the filtered catalog for the tapped category', () => {
    render(<CategoryGrid />)

    fireEvent.click(screen.getAllByTestId('category-card')[2])

    expect(push).toHaveBeenCalledWith({
      pathname: '/',
      query: { category: REAL_CATEGORIES[2].id },
    })
  })

  // Every card navigates, not just the one the click test happens to pick
  test('every card navigates to its own category', () => {
    render(<CategoryGrid />)

    screen.getAllByTestId('category-card').forEach((card, index) => {
      fireEvent.click(card)
      expect(push).toHaveBeenNthCalledWith(index + 1, {
        pathname: '/',
        query: { category: REAL_CATEGORIES[index].id },
      })
    })

    expect(push).toHaveBeenCalledTimes(REAL_CATEGORIES.length)
  })

  // An empty list says so rather than rendering a blank screen
  test('shows an empty state when there are no categories', () => {
    mockCategories = []
    render(<CategoryGrid />)

    expect(screen.queryByTestId('category-grid')).not.toBeInTheDocument()
    expect(screen.getByTestId('no-categories')).toHaveTextContent('No categories to browse yet')
  })
})
