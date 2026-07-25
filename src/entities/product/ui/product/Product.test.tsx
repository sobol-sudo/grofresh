import { render, screen, fireEvent } from '@testing-library/react';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import { cartReducer, toggleCartItem, toggleSelectedProduct } from '@/entities/cart/model/cart.slice';
import Product from './Product';
import { IProduct } from '../../model/types';

// Mock next/image so it does not blow up in the test environment
jest.mock('next/image', () => {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const React = require('react');
  // eslint-disable-next-line @typescript-eslint/no-explicit-any, @next/next/no-img-element
  const MockedImage = (props: any) => <img {...props} alt={props.alt ?? 'mocked-image'} />;
  MockedImage.displayName = 'MockedImage';
  return { __esModule: true, default: MockedImage };
});

const mockProduct: IProduct = {
  id: 1,
  name: 'Spinach',
  unitValue: 1,
  unit: 'kg',
  price: 10,
  src: '/images/products/spinach.png',
  category: '',
  category_id: 1,
  quantity: 0
};

describe('Product Component', () => {

  // Renders the product details correctly
  test('renders product info correctly', () => {
    const store = configureStore({ reducer: { cart: cartReducer } });

    render(
      <Provider store={store}>
        <Product product={mockProduct} />
      </Provider>
    );

    expect(screen.getByText('Spinach')).toBeInTheDocument();
    expect(screen.getByText('1 kg')).toBeInTheDocument();
    // Money is always rendered to two decimals so a price and a struck-through
    // list price cannot line up as "$2" against "$2.5".
    expect(screen.getByText('$10.00')).toBeInTheDocument();

    // The image renders correctly
    const img = screen.getByAltText('Product') as HTMLImageElement;
    expect(img.src).toContain('/images/products/spinach.png');
  });

  // Clicking the button dispatches toggleCartItem
  test('dispatches toggleCartItem on button click', () => {
    const store = configureStore({ reducer: { cart: cartReducer } });
    store.dispatch = jest.fn();

    render(
      <Provider store={store}>
        <Product product={mockProduct} />
      </Provider>
    );

    const button = screen.getByRole('button');
    fireEvent.click(button);

    // dispatch was called with the right action
    expect(store.dispatch).toHaveBeenCalledWith(toggleCartItem(mockProduct));
  });

  // The outline class is applied when the product is selected
  test('applies outline class if product is current', () => {
    const store = configureStore({
      reducer: { cart: cartReducer },
      preloadedState: {
        cart: {
          items: [],
          selectedProduct: mockProduct
        }
      }
    });

    render(
      <Provider store={store}>
        <Product product={mockProduct} />
      </Provider>
    );

    const wrapper = screen.getByTestId('product-wrapper');
    expect(wrapper).toHaveClass('outline');
  });

  // The outline class is absent when the product is not selected
  test('does not apply outline class if product is not current', () => {
    const store = configureStore({ reducer: { cart: cartReducer } });

    render(
      <Provider store={store}>
        <Product product={mockProduct} />
      </Provider>
    );

    const wrapper = screen.getByText('Spinach').closest('div');
    expect(wrapper).not.toHaveClass('outline');
  });

});

describe('Product Component — selectProduct', () => {
  // Clicking the product card dispatches toggleSelectedProduct
  test('dispatches toggleSelectedProduct on product click', () => {
    const store = configureStore({ reducer: { cart: cartReducer } });
    store.dispatch = jest.fn(); // stub dispatch so we can assert on it

    render(
      <Provider store={store}>
        <Product product={mockProduct} />
      </Provider>
    );

    // Simulate a click on the area that triggers selectProduct
    const clickableArea = screen.getByText('Spinach').closest('.touch-manipulation');
    if (!clickableArea) throw new Error('Clickable area not found');

    fireEvent.click(clickableArea);

    // The right action was dispatched
    expect(store.dispatch).toHaveBeenCalledWith(toggleSelectedProduct(mockProduct));
  });

  // A single click dispatches exactly once (no double firing)
  test('calls dispatch only once on click', () => {
    const store = configureStore({ reducer: { cart: cartReducer } });
    store.dispatch = jest.fn();

    render(
      <Provider store={store}>
        <Product product={mockProduct} />
      </Provider>
    );

    const clickableArea = screen.getByText('Spinach').closest('.touch-manipulation');
    if (!clickableArea) throw new Error('Clickable area not found');

    fireEvent.click(clickableArea);

    expect(store.dispatch).toHaveBeenCalledTimes(1);
  });
});

describe('Product Component — promoted pricing', () => {
  const renderProduct = (product: IProduct) =>
    render(
      <Provider store={configureStore({ reducer: { cart: cartReducer } })}>
        <Product product={product} />
      </Provider>
    );

  const onOffer: IProduct = { ...mockProduct, price: 2.5, discountPercent: 20 };

  /*
    The home banner advertises a percentage off. Until this rendered, the discount
    existed only in the data: every card showed the list price and the cart charged
    it, so the sale was a claim with nothing behind it.
  */
  test('shows the discounted price as the price', () => {
    renderProduct(onOffer);

    expect(screen.getByTestId('product-price')).toHaveTextContent('$2.00');
  });

  // The saving is only legible next to what the product used to cost
  test('shows the list price struck through', () => {
    renderProduct(onOffer);

    const listPrice = screen.getByTestId('product-list-price');
    expect(listPrice).toHaveTextContent('$2.50');
    expect(listPrice.tagName).toBe('S');
  });

  // The badge reads off the product, so it cannot outlive the promotion
  test('badges the percentage the product actually carries', () => {
    renderProduct({ ...mockProduct, price: 10, discountPercent: 35 });

    expect(screen.getByTestId('product-discount-badge')).toHaveTextContent('-35%');
  });

  // A full-price product must not grow a struck-through price or a badge
  test('shows no discount furniture on a full-price product', () => {
    renderProduct(mockProduct);

    expect(screen.getByTestId('product-price')).toHaveTextContent('$10.00');
    expect(screen.queryByTestId('product-list-price')).not.toBeInTheDocument();
    expect(screen.queryByTestId('product-discount-badge')).not.toBeInTheDocument();
  });

  // Zero is not a promotion
  test('treats a zero discount as full price', () => {
    renderProduct({ ...mockProduct, price: 10, discountPercent: 0 });

    expect(screen.getByTestId('product-price')).toHaveTextContent('$10.00');
    expect(screen.queryByTestId('product-discount-badge')).not.toBeInTheDocument();
  });
});

describe('Product Component — IconButton variant warning', () => {
  // The button renders in orange when the product is already in the cart
  test('renders IconButton with warning color when product is in cart', () => {
    const preloadedState = {
      cart: {
        items: [mockProduct],
        selectedProduct: null
      }
    };

    const store = configureStore({
      reducer: { cart: cartReducer },
      preloadedState
    });

    render(
      <Provider store={store}>
        <Product product={mockProduct} />
      </Provider>
    );

    const button = screen.getByRole('button');

    expect(button).toHaveStyle('background-color: var(--color-orange-500)');
  });
});