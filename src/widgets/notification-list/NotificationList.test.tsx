import { render, screen, fireEvent, act } from '@testing-library/react';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import { useRouter } from 'next/router';
import NotificationList from './NotificationList';
import { rootReducer } from '@/app/providers/store-provider/config/rootReducer';
import { placeOrder, type Order } from '@/entities/order';
import {
  hydrateNotifications,
  selectUnreadNotificationCount,
  type AppNotification,
} from '@/entities/notification';
import { IProduct } from '@/entities/product';

/**
 * The screen the bell opens.
 *
 * Placing an order is the only thing that fills it, so the list has to hold up in
 * three states: before storage has been read, when there is genuinely nothing, and
 * when real orders have been placed.
 */

jest.mock('next/router', () => ({
  useRouter: jest.fn(),
}));

jest.mock('next/navigation', () => ({
  usePathname: jest.fn(() => '/notifications'),
}));

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
  message: `2 items for $5.90, paid with Visa. (${id})`,
  createdAt: '25 July, 03:45 PM',
  read,
  orderCode: id,
});

const createStore = (items: AppNotification[] = [], isHydrated = true) =>
  configureStore({
    reducer: rootReducer,
    preloadedState: { notification: { items, isHydrated } },
  });

const renderList = (store: ReturnType<typeof createStore>) => {
  render(
    <Provider store={store}>
      <NotificationList />
    </Provider>
  );
  return store;
};

describe('NotificationList', () => {
  const push = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    (useRouter as jest.Mock).mockReturnValue({ push });
  });

  describe('before storage has been read', () => {
    // "Nothing stored yet" and "storage not read yet" are different screens; showing the
    // empty state to someone who does have notifications would be a lie in the other
    // direction.
    it('waits instead of claiming the inbox is empty', () => {
      renderList(createStore([], false));

      expect(screen.getByTestId('notifications-loading')).toBeInTheDocument();
      expect(screen.queryByTestId('notifications-empty')).not.toBeInTheDocument();
    });

    it('does not mark a not-yet-restored inbox as read', () => {
      const store = createStore([], false);
      renderList(store);

      act(() => {
        store.dispatch(hydrateNotifications([notification('AB12CD34EF', false)]));
      });

      // The notification arrived after mount, and it still counts as unread until the
      // screen has actually had a chance to show it.
      expect(screen.getByTestId('notification-item')).toBeInTheDocument();
      expect(screen.getByTestId('notification-new-marker')).toBeInTheDocument();
    });
  });

  describe('with nothing to show', () => {
    it('renders a designed empty state, not a blank screen', () => {
      renderList(createStore([]));

      const empty = screen.getByTestId('notifications-empty');
      expect(empty).toBeInTheDocument();
      expect(screen.getByText('No notifications yet')).toBeInTheDocument();
      expect(
        screen.getByText(/Order confirmations land here/i)
      ).toBeInTheDocument();
      expect(screen.queryByTestId('notification-item')).not.toBeInTheDocument();
    });

    it('offers a way out that leads somewhere real', () => {
      renderList(createStore([]));

      fireEvent.click(screen.getByRole('button', { name: /browse the catalog/i }));

      expect(push).toHaveBeenCalledWith('/');
    });
  });

  describe('with real notifications', () => {
    it('lists what placing an order produced', () => {
      const store = createStore([]);
      renderList(store);

      act(() => {
        store.dispatch(placeOrder(order('AB12CD34EF')));
      });

      expect(screen.getAllByTestId('notification-item')).toHaveLength(1);
      expect(screen.getByText('2 items for $5.90, paid with Visa.')).toBeInTheDocument();
      expect(screen.getByTestId('notification-order-code')).toHaveTextContent('AB12CD34EF');
      expect(screen.queryByTestId('notifications-empty')).not.toBeInTheDocument();
    });

    it('renders every stored notification, newest first', () => {
      renderList(
        createStore([notification('newest', false), notification('oldest', true)])
      );

      const items = screen.getAllByTestId('notification-item');
      expect(items).toHaveLength(2);
      expect(items[0]).toHaveTextContent('newest');
      expect(items[1]).toHaveTextContent('oldest');
    });

    it('states the count it is actually rendering', () => {
      renderList(createStore([notification('a', true), notification('b', true)]));

      expect(screen.getByTestId('notifications-count')).toHaveTextContent('2 notifications');
      expect(screen.getAllByTestId('notification-item')).toHaveLength(2);
    });

    it('says "1 notification" rather than "1 notifications"', () => {
      renderList(createStore([notification('a', true)]));

      expect(screen.getByTestId('notifications-count')).toHaveTextContent('1 notification');
    });
  });

  describe('marking read', () => {
    it('clears the unread count by opening the screen', () => {
      const store = createStore([notification('a', false), notification('b', false)]);
      expect(selectUnreadNotificationCount(store.getState())).toBe(2);

      renderList(store);

      expect(selectUnreadNotificationCount(store.getState())).toBe(0);
    });

    // Clearing the badge and dropping every marker in the same frame would hide the one
    // thing the user opened the screen to see.
    it('still marks the rows that were waiting when you arrived', () => {
      renderList(createStore([notification('a', false), notification('b', true)]));

      const items = screen.getAllByTestId('notification-item');
      expect(items[0]).toHaveAttribute('data-unread', 'true');
      expect(items[1]).toHaveAttribute('data-unread', 'false');
      expect(screen.getAllByTestId('notification-new-marker')).toHaveLength(1);
    });

    it('marks nothing new when everything had already been read', () => {
      renderList(createStore([notification('a', true), notification('b', true)]));

      expect(screen.queryByTestId('notification-new-marker')).not.toBeInTheDocument();
    });
  });

  // There is no order detail screen to open, and a row that navigates nowhere is the
  // control this app already had to remove once.
  it('renders rows as records rather than as controls', () => {
    renderList(createStore([notification('a', false)]));

    const item = screen.getByTestId('notification-item');
    expect(item.tagName).toBe('LI');
    expect(item.querySelector('button')).toBeNull();
    expect(item.querySelector('a')).toBeNull();
  });
});
