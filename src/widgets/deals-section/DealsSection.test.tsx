import { render, screen, fireEvent } from '@testing-library/react';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import { useRouter } from 'next/router';
import DealsSection from './DealsSection';
import { rootReducer } from '@/app/providers/store-provider/config/rootReducer';
import {
  selectDiscountedProducts,
  selectMaxDiscountPercent,
} from '@/entities/product/model/selectors';
import type { IProduct } from '@/entities/product';

jest.mock('next/router', () => ({
  useRouter: jest.fn(),
}));

jest.mock('next/image', () => ({
  __esModule: true,
  // eslint-disable-next-line @next/next/no-img-element
  default: ({ src, alt }: { src: string; alt: string }) => <img src={src} alt={alt} />,
}));

/*
  Mocked so the screen can be handed an offer that is not the one in the repo — the
  count and the headline have to follow the products, and against a single fixed
  catalog a hardcoded pair would look identical.
*/
jest.mock('@/entities/product/model/selectors', () => ({
  selectDiscountedProducts: jest.fn(),
  selectMaxDiscountPercent: jest.fn(),
  selectProductCountByCategory: jest.fn(),
}));

const mockedProducts = selectDiscountedProducts as jest.MockedFunction<
  typeof selectDiscountedProducts
>;
const mockedPercent = selectMaxDiscountPercent as jest.MockedFunction<
  typeof selectMaxDiscountPercent
>;

const product = (id: number, price: number, discountPercent: number): IProduct => ({
  id,
  src: `/images/products/${id}.png`,
  name: `Product ${id}`,
  unitValue: 1,
  unit: 'kg',
  price,
  category: 'Vegetables',
  category_id: 1,
  quantity: 0,
  discountPercent,
});

const push = jest.fn();

const renderDeals = () =>
  render(
    <Provider store={configureStore({ reducer: rootReducer })}>
      <DealsSection />
    </Provider>
  );

describe('DealsSection', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (useRouter as jest.Mock).mockReturnValue({ push });
  });

  describe('with products on offer', () => {
    beforeEach(() => {
      mockedProducts.mockReturnValue([
        product(1, 2.5, 20),
        product(2, 3.1, 20),
        product(3, 10, 10),
      ]);
      mockedPercent.mockReturnValue(20);
    });

    // A card for every discounted product, and nothing else
    it('renders one card per product on offer', () => {
      renderDeals();

      expect(screen.getAllByTestId('product-wrapper')).toHaveLength(3);
    });

    // The count is the length of the list directly below it
    it('counts what it renders', () => {
      renderDeals();

      expect(screen.getByTestId('deals-count')).toHaveTextContent('3 products on offer');
      expect(screen.getByTestId('deals-count').textContent).toContain(
        String(screen.getAllByTestId('product-wrapper').length)
      );
    });

    // "Up to" is the largest discount actually present, not a fixed string
    it('headlines the largest discount on offer', () => {
      renderDeals();

      expect(screen.getByTestId('deals-headline')).toHaveTextContent('Up to 20% off');
    });

    it('follows the data when the offer changes', () => {
      mockedProducts.mockReturnValue([product(1, 8, 45)]);
      mockedPercent.mockReturnValue(45);

      renderDeals();

      expect(screen.getByTestId('deals-headline')).toHaveTextContent('Up to 45% off');
      expect(screen.getByTestId('deals-count')).toHaveTextContent('1 product on offer');
    });

    // Every card on a deals screen has to actually be a deal
    it('shows a reduced price on every card', () => {
      renderDeals();

      const listPrices = screen.getAllByTestId('product-list-price');
      const badges = screen.getAllByTestId('product-discount-badge');

      expect(listPrices).toHaveLength(3);
      expect(badges).toHaveLength(3);
    });

    // The price on the card is the discounted one: 2.50 less 20% is 2.00
    it('prices the cards at the discount', () => {
      renderDeals();

      const prices = screen.getAllByTestId('product-price').map((node) => node.textContent);
      expect(prices).toEqual(['$2.00', '$2.48', '$9.00']);
    });

    it('renders no empty state while there are deals', () => {
      renderDeals();

      expect(screen.queryByTestId('deals-empty')).not.toBeInTheDocument();
    });
  });

  describe('with nothing on offer', () => {
    beforeEach(() => {
      mockedProducts.mockReturnValue([]);
      mockedPercent.mockReturnValue(0);
    });

    /*
      Reachable in practice: the banner hides itself when the offer is empty, but the
      route can still be typed or bookmarked. A blank screen under a "Fresh Deals"
      header is the failure this project exists to avoid.
    */
    it('explains itself rather than rendering an empty grid', () => {
      renderDeals();

      expect(screen.getByTestId('deals-empty')).toBeInTheDocument();
      expect(screen.getByText('No deals running right now')).toBeInTheDocument();
      expect(screen.queryByTestId('deals-grid')).not.toBeInTheDocument();
      expect(screen.queryByTestId('product-wrapper')).not.toBeInTheDocument();
    });

    // The empty state offers a way out, and it goes somewhere real
    it('offers the full catalog as a way on', () => {
      renderDeals();

      fireEvent.click(screen.getByRole('button', { name: /Browse all products/i }));

      expect(push).toHaveBeenCalledWith('/products');
    });

    // No count and no headline: there is nothing to count or headline
    it('states no figures it cannot back', () => {
      renderDeals();

      expect(screen.queryByTestId('deals-count')).not.toBeInTheDocument();
      expect(screen.queryByTestId('deals-headline')).not.toBeInTheDocument();
    });
  });
});
