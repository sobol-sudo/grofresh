import { render, screen } from '@testing-library/react'
import DiscountCard from './DiscountCard'

// Mock next/image so it stays out of the way in tests
jest.mock('next/image', () => ({
  __esModule: true,
  default: ({ src, alt }: { src: string; alt: string }) => (
    // eslint-disable-next-line @next/next/no-img-element
    <img src={src} alt={alt} />
  ),
}))

// Mock the Button component
jest.mock('@/shared/ui/Button', () => ({
  __esModule: true,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  default: ({ children }: any) => <button>{children}</button>,
}))

describe('DiscountCard component', () => {
  // Renders the main copy
  test('renders discount text and description', () => {
    render(<DiscountCard />)

    expect(screen.getByText(/Fresh Deals/i)).toBeInTheDocument()
    expect(screen.getByText(/Today 20% OFF/i)).toBeInTheDocument()
    expect(screen.getByText(/Special prices on selected groceries/i)).toBeInTheDocument()
  })

  // Renders the "Explore deals" button
  test('renders the "Explore deals" button', () => {
    render(<DiscountCard />)
    expect(screen.getByRole('button', { name: /Explore deals/i })).toBeInTheDocument()
  })

  // Renders the image with the expected src and alt
  test('renders product discount image', () => {
    render(<DiscountCard />)
    const image = screen.getByAltText('Picture of the author')
    expect(image).toHaveAttribute('src', '/images/product-discount.png')
  })

  // Applies the className that was passed in
  test('applies custom className', () => {
    const { container } = render(<DiscountCard className="custom-class" />)
    expect(container.firstChild).toHaveClass('custom-class')
  })
})
