import { render, screen, fireEvent } from '@testing-library/react'
import BrowseCategory from './BrowseCategory'
import { MOCK_CATEGORIES } from './config/mock'

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

describe('BrowseCategory component', () => {
  // Renders the section heading
  test('renders section title', () => {
    render(<BrowseCategory />)
    expect(screen.getByText('Browse categories')).toBeInTheDocument()
  })

  // The "more" link pointed at a screen that does not exist
  test('renders no "more" link', () => {
    render(<BrowseCategory />)
    expect(screen.queryByText('more')).not.toBeInTheDocument()
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

  // A custom className is applied to the root container
  test('applies custom className', () => {
    const { container } = render(<BrowseCategory className="custom-class" />)
    expect(container.firstChild).toHaveClass('custom-class')
  })
})
