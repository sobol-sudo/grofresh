import { render, screen } from '@testing-library/react'
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
    expect(card).toHaveClass('cursor-pointer')
  })
})
