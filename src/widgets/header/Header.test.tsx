/* eslint-disable react/display-name */
import { render, screen, fireEvent } from '@testing-library/react';
import Header from './Header';
import { useRouter } from 'next/router';
import { usePathname } from 'next/navigation';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import { rootReducer } from '@/app/providers/store-provider/config/rootReducer';
import { HeaderConfig, headerConfig, HeaderRoute } from './config';
import { useTelegram } from '@/shared/hooks/useTelegram/useTelegram';
import { IProduct } from '@/entities/product';
import type { AppNotification } from '@/entities/notification';

// --- Mocks for next/router and next/navigation ---
jest.mock('next/router', () => ({
  useRouter: jest.fn(),
}));
jest.mock('next/navigation', () => ({
  usePathname: jest.fn(),
}));

jest.mock('@/shared/hooks/useTelegram/useTelegram', () => ({
  useTelegram: jest.fn(() => ({
    user: { name: 'Guest', photo_url: '' },
  })),
}));

// eslint-disable-next-line @typescript-eslint/no-explicit-any
jest.mock('@/shared/ui/Avatar/Avatar', () => (props: any) => (
  // eslint-disable-next-line @next/next/no-img-element
  <img data-testid="avatar" src={props.src} alt="avatar" />
));

// --- Mocks for the UI components ---
// eslint-disable-next-line @typescript-eslint/no-explicit-any
jest.mock('@/entities/cart/ui/CartIcon', () => (props: any) => (
  <button data-testid="cart-icon" {...props}>Cart</button>
));

// eslint-disable-next-line @typescript-eslint/no-explicit-any
jest.mock('@/shared/ui/IconButton', () => (props: any) => <button {...props} />);

// The bell and the overflow menu are deliberately NOT mocked: what they show is the
// point of them, and a stand-in would render whatever it was told to.

const product = (id: number, quantity: number): IProduct => ({
  id,
  src: `/images/products/${id}.png`,
  name: `Product ${id}`,
  unitValue: 1,
  unit: 'kg',
  price: 2.2,
  category: 'Fruits',
  category_id: 1,
  quantity,
});

const notification = (id: string, read: boolean): AppNotification => ({
  id,
  kind: 'order-placed',
  title: 'Order placed',
  message: 'An order was placed.',
  createdAt: '25 July, 03:45 PM',
  read,
  orderCode: id,
});

interface HeaderStoreOptions {
  cartItems?: IProduct[];
  notifications?: AppNotification[];
}

const createStore = ({ cartItems = [], notifications = [] }: HeaderStoreOptions = {}) =>
  configureStore({
    reducer: rootReducer,
    preloadedState: {
      cart: { items: cartItems, selectedProduct: null },
      notification: { items: notifications, isHydrated: true },
    },
  });

describe('Header component', () => {
  const mockUsePathname = usePathname as jest.Mock;
  const pushMock = jest.fn();
  const backMock = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    (useRouter as jest.Mock).mockReturnValue({
      push: pushMock,
      back: backMock,
    });
  });

  const renderHeader = (path: string, options: HeaderStoreOptions = {}) => {
    (usePathname as jest.Mock).mockReturnValue(path);
    return render(
      <Provider store={createStore(options)}>
        <Header />
      </Provider>
    );
  };

  // Tests generated dynamically from the config
  (Object.keys(headerConfig) as HeaderRoute[]).forEach((route) => {
    test(`renders correct elements for route ${route}`, () => {
      // A stocked cart, so a route configured for the overflow menu actually gets one.
      renderHeader(route, { cartItems: [product(1, 1)] });
      const config = headerConfig[route] as HeaderConfig;

      if (config?.user) expect(screen.getByTestId('user')).toBeInTheDocument();
      if (config?.backRoute) expect(screen.getByTestId('btn-navigate-back')).toBeInTheDocument();
      if (config?.centerName) {
        expect(screen.getByTestId('center-name')).toHaveTextContent(config.title as string);
      }
      if (config?.cartIcon) expect(screen.getByTestId('cart-icon')).toBeInTheDocument();

      // The bell and the overflow menu appear where the config puts them and nowhere
      // else — every route used to be checked for their absence, because both were
      // dead. They are back, so the check is now that each is where it says it is.
      if (config?.notificationIcon) {
        expect(screen.getByTestId('notification-icon')).toBeInTheDocument();
      } else {
        expect(screen.queryByTestId('notification-icon')).toBeNull();
      }

      if (config?.dots) {
        expect(screen.getByTestId('dots')).toBeInTheDocument();
      } else {
        expect(screen.queryByTestId('dots')).toBeNull();
      }
    });

    test(`never invents a notification count on route ${route}`, () => {
      renderHeader(route, { cartItems: [product(1, 1)] });

      // Nothing is unread in this store. The badge that used to sit here said "2".
      expect(screen.queryByTestId('notification-badge')).toBeNull();
    });
  });

  test('renders nothing for unknown route', () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    renderHeader('/unknown' as any, { cartItems: [product(1, 1)] });

    expect(screen.queryByTestId('user')).toBeNull();
    expect(screen.queryByTestId('btn-navigate-back')).toBeNull();
    expect(screen.queryByTestId('center-name')).toBeNull();
    expect(screen.queryByTestId('dots')).toBeNull();
    expect(screen.queryByTestId('notification-icon')).toBeNull();
    expect(screen.queryByTestId('cart-icon')).toBeNull();
  });

  test('falls back to "/" if usePathname returns null', () => {
    mockUsePathname.mockReturnValue(null);

    const { container } = render(
      <Provider store={createStore()}>
        <Header />
      </Provider>
    );

    expect(container.querySelector('[data-testid="user"]')).toBeInTheDocument();
  });

  test('back button works correctly depending on history length', () => {
    renderHeader('/cart');
    const backButton = screen.getByTestId('btn-navigate-back');

    // history.length > 1
    Object.defineProperty(window, 'history', { value: { length: 2 }, writable: true });
    fireEvent.click(backButton);
    expect(backMock).toHaveBeenCalled();
    expect(pushMock).not.toHaveBeenCalled();

    jest.clearAllMocks();

    // history.length = 1
    Object.defineProperty(window, 'history', { value: { length: 1 }, writable: true });
    fireEvent.click(backButton);
    expect(pushMock).toHaveBeenCalledWith('/');
    expect(backMock).not.toHaveBeenCalled();
  });

  test('cart icon navigates to /cart on click', () => {
    renderHeader('/');
    const cartButton = screen.getByTestId('cart-icon');
    fireEvent.click(cartButton);
    expect(pushMock).toHaveBeenCalledWith('/cart');
  });

  test('renders user avatar with correct src and name when user exists', () => {
    (useTelegram as jest.Mock).mockReturnValue({
      user: { name: 'Alex', photo_url: 'https://example.com/photo.jpg' }
    });

    render(
      <Provider store={createStore()}>
        <Header />
      </Provider>
    );

    const avatarImg = screen.getByRole('img') as HTMLImageElement;
    const username = screen.getByTestId('name-user');

    expect(avatarImg.src).toBe('https://example.com/photo.jpg');
    expect(username).toHaveTextContent('Alex');
  });

  test('renders default avatar and name when user is undefined', () => {
    (useTelegram as jest.Mock).mockReturnValue({
      user: undefined
    });

    render(
      <Provider store={createStore()}>
        <Header />
      </Provider>
    );

    const avatarImg = screen.getByRole('img') as HTMLImageElement;
    const username = screen.getByTestId('name-user');

    expect(avatarImg.src).toContain('');
    expect(username).toHaveTextContent('Guest');
  });

  describe('notification bell', () => {
    test('opens the notifications screen', () => {
      renderHeader('/');

      fireEvent.click(screen.getByTestId('notification-icon'));

      expect(pushMock).toHaveBeenCalledWith('/notifications');
    });

    test('badges the real unread count', () => {
      renderHeader('/', {
        notifications: [notification('a', false), notification('b', false), notification('c', true)],
      });

      expect(screen.getByTestId('notification-badge')).toHaveTextContent('2');
    });

    test('carries no badge when the inbox has been read', () => {
      renderHeader('/', { notifications: [notification('a', true)] });

      expect(screen.queryByTestId('notification-badge')).toBeNull();
    });
  });

  describe('cart overflow menu', () => {
    test('is offered on the cart when there is something to clear', () => {
      renderHeader('/cart', { cartItems: [product(1, 2)] });

      expect(screen.getByTestId('dots')).toBeInTheDocument();
    });

    test('is not offered on an empty cart', () => {
      renderHeader('/cart', { cartItems: [] });

      expect(screen.queryByTestId('dots')).toBeNull();
    });
  });
});
