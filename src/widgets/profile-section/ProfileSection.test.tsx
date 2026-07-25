/* eslint-disable @typescript-eslint/no-explicit-any */
import { render, screen, fireEvent } from '@testing-library/react';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import { useRouter } from 'next/router';
import ProfileSection from './ProfileSection';
import { rootReducer } from '@/app/providers/store-provider/config/rootReducer';
import type { Order } from '@/entities/order';
import type { AppNotification } from '@/entities/notification';
import { IProduct } from '@/entities/product';

/**
 * The account screen behind the Profile tab.
 *
 * The identity comes from Telegram and the numbers come from the persisted history,
 * so the two things worth proving are that the numbers are counted rather than
 * written down, and that the screen still says something sensible in a plain browser
 * where there is no Telegram user at all.
 *
 * The real useTelegram hook runs here — mocking it away would test the mock rather
 * than the degradation the tab actually depends on.
 */

jest.mock('next/router', () => ({
  useRouter: jest.fn(),
}));

jest.mock('next/navigation', () => ({
  usePathname: jest.fn(() => '/profile'),
}));

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

const order = (transactionCode: string, total: string, items: IProduct[]): Order => ({
  transactionCode,
  placedAt: '25 July, 03:45 PM',
  paymentMethod: 'Visa',
  items,
  subtotal: total,
  serviceFee: '1.50',
  total,
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

interface StoreOptions {
  orders?: Order[];
  ordersHydrated?: boolean;
  notifications?: AppNotification[];
  notificationsHydrated?: boolean;
}

const createStore = ({
  orders = [],
  ordersHydrated = true,
  notifications = [],
  notificationsHydrated = true,
}: StoreOptions = {}) =>
  configureStore({
    reducer: rootReducer,
    preloadedState: {
      order: { orders, lastOrder: null, isHydrated: ordersHydrated },
      notification: { items: notifications, isHydrated: notificationsHydrated },
    },
  });

const renderProfile = (options: StoreOptions = {}) => {
  const store = createStore(options);
  render(
    <Provider store={store}>
      <ProfileSection />
    </Provider>
  );
  return store;
};

const signInWithTelegram = (user: Record<string, unknown>) => {
  (window as any).Telegram = {
    WebApp: {
      initDataUnsafe: { user },
      ready: jest.fn(),
    },
  };
};

describe('ProfileSection', () => {
  const push = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    delete (window as any).Telegram;
    (useRouter as jest.Mock).mockReturnValue({ push });
  });

  describe('inside Telegram', () => {
    it('shows the name and photo Telegram handed over', () => {
      signInWithTelegram({
        first_name: 'Alex',
        last_name: 'Kolesnik',
        photo_url: 'https://t.me/alex/photo.jpg',
      });

      renderProfile();

      expect(screen.getByTestId('profile-name')).toHaveTextContent('Alex Kolesnik');
      expect(screen.getByTestId('profile-provenance')).toHaveTextContent('Signed in with Telegram');
      expect((screen.getByRole('img') as HTMLImageElement).src).toBe(
        'https://t.me/alex/photo.jpg'
      );
    });

    it('drops the guest explanation once there is a real user', () => {
      signInWithTelegram({ first_name: 'Alex' });

      renderProfile();

      expect(screen.queryByTestId('profile-guest-hint')).not.toBeInTheDocument();
    });
  });

  describe('outside Telegram', () => {
    // The normal case in a browser. The home header already falls back to "Guest";
    // a second, different answer on the profile would just look broken.
    it('falls back to the same "Guest" the home header uses', () => {
      renderProfile();

      expect(screen.getByTestId('profile-name')).toHaveTextContent('Guest');
      expect(screen.getByTestId('profile-provenance')).toHaveTextContent('Browsing as a guest');
    });

    it('says where a real name would have come from', () => {
      renderProfile();

      expect(screen.getByTestId('profile-guest-hint')).toHaveTextContent(
        /Open GroFresh inside Telegram/i
      );
    });

    it('still shows the history, because the history is not tied to an account', () => {
      renderProfile({ orders: [order('AB12CD34EF', '5.90', [product(1, 2)])] });

      expect(screen.getByTestId('profile-order-count')).toHaveTextContent('1');
      expect(screen.getByTestId('profile-last-order')).toHaveTextContent('AB12CD34EF');
    });
  });

  describe('order count', () => {
    it('counts the persisted history rather than announcing a number', () => {
      renderProfile({
        orders: [
          order('AAA1111111', '5.90', [product(1, 2)]),
          order('BBB2222222', '3.20', [product(2, 1)]),
          order('CCC3333333', '9.10', [product(3, 4)]),
        ],
      });

      expect(screen.getByTestId('profile-order-count')).toHaveTextContent('3');
      expect(screen.getByTestId('profile-order-count')).toHaveTextContent('Orders placed');
    });

    it('reads zero when nothing has been bought', () => {
      renderProfile();

      expect(screen.getByTestId('profile-order-count')).toHaveTextContent('0');
    });

    it('says "Order placed" for a single order', () => {
      renderProfile({ orders: [order('AAA1111111', '5.90', [product(1, 2)])] });

      expect(screen.getByTestId('profile-order-count')).toHaveTextContent('Order placed');
    });

    // A "0" that turns into "4" a frame later is worse than a dash that resolves.
    it('withholds the count until storage has been read', () => {
      renderProfile({ ordersHydrated: false });

      expect(screen.getByTestId('profile-order-count')).toHaveTextContent('—');
      expect(screen.getByTestId('profile-order-count')).not.toHaveTextContent('0');
    });
  });

  describe('last order', () => {
    it('summarises the most recent order from real numbers', () => {
      renderProfile({
        orders: [
          order('AAA1111111', '5.90', [product(1, 2), product(2, 3)]),
          order('BBB2222222', '3.20', [product(3, 1)]),
        ],
      });

      const panel = screen.getByTestId('profile-last-order');
      expect(panel).toHaveTextContent('$5.90');
      expect(panel).toHaveTextContent('AAA1111111');
      expect(panel).toHaveTextContent('5 items');
      expect(panel).toHaveTextContent('Visa');
      expect(panel).toHaveTextContent('25 July, 03:45 PM');
    });

    it('says "1 item" rather than "1 items"', () => {
      renderProfile({ orders: [order('AAA1111111', '2.20', [product(1, 1)])] });

      expect(screen.getByTestId('profile-last-order')).toHaveTextContent('1 item');
    });

    it('explains the absence instead of rendering an empty panel', () => {
      renderProfile();

      expect(screen.queryByTestId('profile-last-order')).not.toBeInTheDocument();
      expect(screen.getByTestId('profile-no-orders')).toHaveTextContent(/Nothing bought yet/i);
    });

    it('sends someone with no orders into the catalog', () => {
      renderProfile();

      fireEvent.click(screen.getByRole('button', { name: /browse the catalog/i }));

      expect(push).toHaveBeenCalledWith('/');
    });

    // Offering "browse the catalog" to someone whose orders are still being read would
    // be answering a question we have not asked yet.
    it('offers nothing while the history is still being read', () => {
      renderProfile({ ordersHydrated: false });

      expect(screen.getByTestId('profile-no-orders')).toHaveTextContent(/Looking for your past orders/i);
      expect(screen.queryByRole('button', { name: /browse the catalog/i })).not.toBeInTheDocument();
    });
  });

  describe('notifications tile', () => {
    it('counts the real inbox and leads to it', () => {
      renderProfile({
        notifications: [notification('a', false), notification('b', true)],
      });

      const tile = screen.getByTestId('profile-notifications-link');
      expect(tile).toHaveTextContent('2');
      expect(screen.getByTestId('profile-unread-marker')).toHaveTextContent('1 new');

      fireEvent.click(tile);
      expect(push).toHaveBeenCalledWith('/notifications');
    });

    it('shows no "new" marker when nothing is unread', () => {
      renderProfile({ notifications: [notification('a', true)] });

      expect(screen.queryByTestId('profile-unread-marker')).not.toBeInTheDocument();
    });

    it('withholds the count until storage has been read', () => {
      renderProfile({ notificationsHydrated: false });

      expect(screen.getByTestId('profile-notifications-link')).toHaveTextContent('—');
    });
  });
});
