import { render, screen, fireEvent } from '@testing-library/react'
import BrowseCategory from './BrowseCategory'
import type { Category } from './model/types'

// Mock CategoryCard so real images and styles are not rendered
jest.mock('./ui/category-card', () => ({
  __esModule: true,
  default: ({ category, isSelected, onSelect }: {
    category: { id: number; name: string };
    isSelected?: boolean;
    onSelect?: (id: number) => void;
  }) => (
    <div
      data-testid="category-card"
      data-selected={isSelected ? 'true' : 'false'}
      onClick={() => onSelect?.(category.id)}
    >
      {category.name}
    </div>
  ),
}))

// Swapped per test through a getter so the empty strip can be reached; every test
// other than that one runs against the real category list.
let mockCategories: Category[] = []
jest.mock('./config/mock', () => ({
  get MOCK_CATEGORIES() {
    return mockCategories
  },
}))

const MOCK_CATEGORIES: Category[] = jest.requireActual('./config/mock').MOCK_CATEGORIES

describe('BrowseCategory component', () => {
  beforeEach(() => {
    mockCategories = MOCK_CATEGORIES
  })

  // Renders the section heading
  test('renders section title', () => {
    render(<BrowseCategory />)
    expect(screen.getByText('Browse categories')).toBeInTheDocument()
  })

  // The strip runs off the edge of a phone; "See all" opens the full grid
  test('links to the full category screen', () => {
    render(<BrowseCategory />)

    const link = screen.getByRole('link', { name: 'See all categories' })
    expect(link).toHaveAttribute('href', '/categories')
  })

  // Every listed category maps to products
  test('lists only categories that have products', () => {
    render(<BrowseCategory />)
    expect(MOCK_CATEGORIES.map((category) => category.name)).toEqual([
      'Vegetables',
      'Meat',
      'Bakery',
      'Dairy',
      'Fruits',
    ])
  })

  // Selecting a card reports the category id upwards
  test('reports the selected category', () => {
    const onSelectCategory = jest.fn()
    render(<BrowseCategory onSelectCategory={onSelectCategory} />)

    fireEvent.click(screen.getAllByTestId('category-card')[1])

    expect(onSelectCategory).toHaveBeenCalledWith(MOCK_CATEGORIES[1].id)
  })

  // The selected category is marked as such
  test('marks the selected category', () => {
    render(<BrowseCategory selectedCategoryId={MOCK_CATEGORIES[2].id} />)

    const cards = screen.getAllByTestId('category-card')
    expect(cards[2]).toHaveAttribute('data-selected', 'true')
    expect(cards[0]).toHaveAttribute('data-selected', 'false')
  })

  // Renders one category card per entry in MOCK_CATEGORIES
  test('renders all category cards from mock data', () => {
    render(<BrowseCategory />)
    const categoryCards = screen.getAllByTestId('category-card')
    expect(categoryCards).toHaveLength(MOCK_CATEGORIES.length)

    // Card labels match the names in MOCK_CATEGORIES
    MOCK_CATEGORIES.forEach((category) => {
      expect(screen.getByText(category.name)).toBeInTheDocument()
    })
  })

  // Nothing to browse means nothing to open: the link goes with the list
  test('drops the link and explains itself when there are no categories', () => {
    mockCategories = []
    render(<BrowseCategory />)

    expect(screen.queryByRole('link', { name: 'See all categories' })).not.toBeInTheDocument()
    expect(screen.queryAllByTestId('category-card')).toHaveLength(0)
    expect(screen.getByTestId('no-categories')).toHaveTextContent('No categories to browse yet')
  })

  // A custom className is applied to the root container
  test('applies custom className', () => {
    const { container } = render(<BrowseCategory className="custom-class" />)
    expect(container.firstChild).toHaveClass('custom-class')
  })
})
