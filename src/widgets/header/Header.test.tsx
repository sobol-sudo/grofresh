/* eslint-disable react/display-name */
import { render, screen, fireEvent } from '@testing-library/react';
import Header from './Header';
import { useRouter } from 'next/router';
import { usePathname } from 'next/navigation';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import { cartReducer } from '@/entities/cart/model/cart.slice';
import { HeaderConfig, headerConfig, HeaderRoute } from './config';
import { useTelegram } from '@/shared/hooks/useTelegram/useTelegram';

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
// --- Minimal mock store for CartIcon ---
const createStore = () =>
  configureStore({
    reducer: { cart: cartReducer },
    preloadedState: {
      cart: { items: [], selectedProduct: null, },
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

  const renderHeader = (path: string) => {
    (usePathname as jest.Mock).mockReturnValue(path);
    return render(
      <Provider store={createStore()}>
        <Header />
      </Provider>
    );
  };

  // Tests generated dynamically from the config
  (Object.keys(headerConfig) as HeaderRoute[]).forEach((route) => {
    test(`renders correct elements for route ${route}`, () => {
      renderHeader(route);
      const config = headerConfig[route] as HeaderConfig;

      if (config?.user) expect(screen.getByTestId('user')).toBeInTheDocument();
      if (config?.backRoute) expect(screen.getByTestId('btn-navigate-back')).toBeInTheDocument();
      if (config?.centerName) expect(screen.getByTestId('center-name')).toBeInTheDocument();
      if (config?.dots) expect(screen.getByTestId('dots')).toBeInTheDocument();
      if (config?.notificationIcon) expect(screen.getByTestId('notification-icon'));
      if (config?.cartIcon) expect(screen.getByTestId('cart-icon')).toBeInTheDocument();

    });
  });

  test('renders nothing for unknown route', () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    renderHeader('/unknown' as any);

    expect(screen.queryByTestId('user')).toBeNull();
    expect(screen.queryByTestId('btn-navigate-back')).toBeNull();
    expect(screen.queryByTestId('center-name')).toBeNull();
    expect(screen.queryByTestId('dots')).toBeNull();
    expect(screen.queryByTestId('notification-icon')).toBeNull();
    expect(screen.queryByTestId('cart-icon')).toBeNull();
  });

  test('falls back to "/" if usePathname returns null', () => {
    mockUsePathname.mockReturnValue(null);

    const { container } = render(<Header />);

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
});
