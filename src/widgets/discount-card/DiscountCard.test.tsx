import { render, screen } from '@testing-library/react'
import DiscountCard from './DiscountCard'
import {
  selectDiscountedProducts,
  selectMaxDiscountPercent,
} from '@/entities/product/model/selectors'
import type { IProduct } from '@/entities/product'

// Mock next/image so it stays out of the way in tests
jest.mock('next/image', () => ({
  __esModule: true,
  default: ({ src, alt }: { src: string; alt: string }) => (
    // eslint-disable-next-line @next/next/no-img-element
    <img src={src} alt={alt} />
  ),
}))

/*
  The selectors are mocked so the banner can be shown catalogs it does not have.
  That is the point of this file: the headline percent and the product count are
  claims, and a claim is only trustworthy if it changes when the thing it describes
  changes. Hardcoding "20%" back into the markup passes against the real catalog and
  fails every case below.
*/
jest.mock('@/entities/product/model/selectors', () => ({
  selectDiscountedProducts: jest.fn(),
  selectMaxDiscountPercent: jest.fn(),
  selectProductCountByCategory: jest.fn(),
}))

const mockedProducts = selectDiscountedProducts as jest.MockedFunction<
  typeof selectDiscountedProducts
>
const mockedPercent = selectMaxDiscountPercent as jest.MockedFunction<
  typeof selectMaxDiscountPercent
>

/** A catalog of `count` products; only how many there are matters to the banner. */
const productsOnOffer = (count: number) =>
  Array.from({ length: count }, (_, index) => ({ id: index + 1 })) as IProduct[]

const setOffer = (count: number, percent: number) => {
  mockedProducts.mockReturnValue(productsOnOffer(count))
  mockedPercent.mockReturnValue(percent)
}

describe('DiscountCard component', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    setOffer(7, 20)
  })

  // Renders the main copy
  test('renders discount text and description', () => {
    render(<DiscountCard />)

    expect(screen.getByText(/Fresh Deals/i)).toBeInTheDocument()
    expect(screen.getByText(/Today 20% OFF/i)).toBeInTheDocument()
    expect(screen.getByTestId('discount-card-subtitle')).toHaveTextContent(
      'Special prices on 7 groceries'
    )
  })

  // The headline is the catalog's largest discount, not a number typed into the markup
  test('states the percent the catalog actually offers', () => {
    setOffer(3, 15)
    render(<DiscountCard />)

    expect(screen.getByText(/Today 15% OFF/i)).toBeInTheDocument()
    expect(screen.queryByText(/20% OFF/i)).not.toBeInTheDocument()
  })

  // The count is the number of discounted products, and it reads as English
  test('counts the products on offer', () => {
    setOffer(1, 10)
    render(<DiscountCard />)

    expect(screen.getByTestId('discount-card-subtitle')).toHaveTextContent(
      'Special prices on 1 grocery'
    )
  })

  // The banner is a way in now, and it leads to the screen listing these products
  test('links to the deals screen', () => {
    render(<DiscountCard />)

    const cta = screen.getByTestId('explore-deals')
    expect(cta).toHaveTextContent('Explore deals')
    expect(cta).toHaveAttribute('href', '/deals')
  })

  /*
    The original defect in its first costume: this banner used to advertise a sale
    behind a button that opened nothing. The rule that replaced it is that the offer
    decides whether the banner exists at all — with nothing discounted there is no
    sale to announce and no screen worth opening, so there is no card and no link.
  */
  test('renders nothing when no product is discounted', () => {
    setOffer(0, 0)
    const { container } = render(<DiscountCard className="custom-class" />)

    expect(container).toBeEmptyDOMElement()
    expect(screen.queryByText(/Fresh Deals/i)).not.toBeInTheDocument()
    expect(screen.queryByTestId('explore-deals')).not.toBeInTheDocument()
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
