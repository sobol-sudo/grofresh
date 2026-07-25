import { render, screen } from '@testing-library/react'
import BrowseCategory from './BrowseCategory'
import { MOCK_CATEGORIES } from './config/mock'

// Mock CategoryCard so real images and styles are not rendered
jest.mock('./ui/category-card', () => ({
  __esModule: true,
  default: ({ category }: { category: { name: string } }) => (
    <div data-testid="category-card">{category.name}</div>
  ),
}))

describe('BrowseCategory component', () => {
  // Renders the section heading
  test('renders section title', () => {
    render(<BrowseCategory />)
    expect(screen.getByText('Browse categories')).toBeInTheDocument()
  })

  // Renders the "more" button
  test('renders "more" button', () => {
    render(<BrowseCategory />)
    expect(screen.getByText('more')).toBeInTheDocument()
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
