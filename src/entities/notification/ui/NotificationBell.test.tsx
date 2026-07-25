import { render, screen, fireEvent, act } from '@testing-library/react';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import NotificationBell from './NotificationBell';
import { rootReducer } from '@/app/providers/store-provider/config/rootReducer';
import { placeOrder, type Order } from '@/entities/order';
import { markNotificationRead, type AppNotification } from '@/entities/notification';
import { IProduct } from '@/entities/product';

/**
 * The badge this component replaces was hardcoded to "2": it announced two waiting
 * notifications on a screen that had never produced one. Every test here is about the
 * number being real, and about there being nothing at all to read when it is zero.
 */

const product: IProduct = {
  id: 1,
  src: '/images/products/1.png',
  name: 'Bananas',
  unitValue: 1,
  unit: 'kg',
  price: 2.2,
  category: 'Fruits',
  category_id: 1,
  quantity: 2,
};

const order = (transactionCode: string): Order => ({
  transactionCode,
  placedAt: '25 July, 03:45 PM',
  paymentMethod: 'Visa',
  items: [product],
  subtotal: '4.40',
  serviceFee: '1.50',
  total: '5.90',
});

const notification = (id: string, read: boolean): AppNotification => ({
  id,
  kind: 'order-placed',
  title: 'Order placed',
  message: '2 items for $5.90, paid with Visa.',
  createdAt: '25 July, 03:45 PM',
  read,
  orderCode: id,
});

const createStore = (items: AppNotification[] = []) =>
  configureStore({
    reducer: rootReducer,
    preloadedState: { notification: { items, isHydrated: true } },
  });

const renderBell = (
  store: ReturnType<typeof createStore>,
  onClick: () => void = jest.fn()
) => {
  render(
    <Provider store={store}>
      <NotificationBell onClick={onClick} />
    </Provider>
  );
  return store;
};

describe('NotificationBell', () => {
  it('renders no badge at all when nothing is unread', () => {
    renderBell(createStore());

    expect(screen.getByTestId('notification-icon')).toBeInTheDocument();
    // Not "hidden", not "0" — absent. A stale number in the DOM is the bug being fixed.
    expect(screen.queryByTestId('notification-badge')).not.toBeInTheDocument();
    expect(screen.getByTestId('notification-icon')).not.toHaveTextContent(/\d/);
  });

  it('renders no badge when every notification has been read', () => {
    renderBell(createStore([notification('a', true), notification('b', true)]));

    expect(screen.queryByTestId('notification-badge')).not.toBeInTheDocument();
  });

  it('shows the number of unread notifications, not the number of notifications', () => {
    renderBell(
      createStore([notification('a', false), notification('b', true), notification('c', false)])
    );

    expect(screen.getByTestId('notification-badge')).toHaveTextContent('2');
  });

  it('counts what placing an order actually produced', () => {
    const store = createStore();
    renderBell(store);

    expect(screen.queryByTestId('notification-badge')).not.toBeInTheDocument();

    act(() => {
      store.dispatch(placeOrder(order('AB12CD34EF')));
    });
    expect(screen.getByTestId('notification-badge')).toHaveTextContent('1');

    act(() => {
      store.dispatch(placeOrder(order('GH56IJ78KL')));
    });
    expect(screen.getByTestId('notification-badge')).toHaveTextContent('2');
  });

  it('drops back to no badge once the last unread one is read', () => {
    const store = createStore([notification('a', false)]);
    renderBell(store);

    expect(screen.getByTestId('notification-badge')).toHaveTextContent('1');

    act(() => {
      store.dispatch(markNotificationRead('a'));
    });

    expect(screen.queryByTestId('notification-badge')).not.toBeInTheDocument();
  });

  it('caps the printed number but keeps the exact count in the accessible name', () => {
    const many = Array.from({ length: 12 }, (_, index) => notification(`n-${index}`, false));
    renderBell(createStore(many));

    expect(screen.getByTestId('notification-badge')).toHaveTextContent('9+');
    expect(screen.getByRole('button', { name: 'Notifications, 12 unread' })).toBeInTheDocument();
  });

  it('names itself without a count when there is nothing waiting', () => {
    renderBell(createStore());

    expect(screen.getByRole('button', { name: 'Notifications' })).toBeInTheDocument();
  });

  it('hands the click to its owner so the header decides where the bell leads', () => {
    const onClick = jest.fn();
    renderBell(createStore(), onClick);

    fireEvent.click(screen.getByTestId('notification-icon'));

    expect(onClick).toHaveBeenCalledTimes(1);
  });
});
