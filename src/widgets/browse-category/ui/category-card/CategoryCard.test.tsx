import { render, screen, fireEvent } from '@testing-library/react'
import CategoryCard from './CategoryCard'
import { Category } from '../../../browse-category/model/types'

// Mock next/image so Next.js SSR specifics do not break the tests
jest.mock('next/image', () => ({
  __esModule: true,
  // eslint-disable-next-line @next/next/no-img-element
  default: ({ src, alt }: { src: string; alt: string }) => <img src={src} alt={alt} />,
}))

// Mock category data
const mockCategory: Category = {
  id: 1,
  name: 'Fruits',
  image: '/images/categories/fruits.png',
}

describe('CategoryCard component', () => {
  // Renders the category name
  test('renders category name', () => {
    render(<CategoryCard category={mockCategory} />)
    expect(screen.getByText('Fruits')).toBeInTheDocument()
  })

  // Renders the image with the expected src and alt
  test('renders category image', () => {
    render(<CategoryCard category={mockCategory} />)
    const image = screen.getByAltText('category')
    expect(image).toHaveAttribute('src', mockCategory.image)
  })

  // The card carries the base style and hover classes
  test('has correct base styles', () => {
    const { container } = render(<CategoryCard category={mockCategory} />)
    const card = container.firstChild as HTMLElement
    expect(card).toHaveClass('bg-white')
    expect(card).toHaveClass('hover:bg-flash-white')
  })

  // The clickable styling is backed by a real handler
  test('reports its id when clicked', () => {
    const onSelect = jest.fn()
    render(<CategoryCard category={mockCategory} onSelect={onSelect} />)

    fireEvent.click(screen.getByTestId('category-card'))

    expect(onSelect).toHaveBeenCalledWith(mockCategory.id)
  })

  // Selection is visible, not just internal state
  test('shows an active state when selected', () => {
    const { rerender } = render(<CategoryCard category={mockCategory} />)
    expect(screen.getByTestId('category-card')).toHaveAttribute('aria-pressed', 'false')

    rerender(<CategoryCard category={mockCategory} isSelected />)
    const card = screen.getByTestId('category-card')
    expect(card).toHaveAttribute('aria-pressed', 'true')
    expect(card).toHaveClass('outline-green-500')
  })
})
