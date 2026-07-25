import { configureStore } from '@reduxjs/toolkit';
import { rootReducer } from './rootReducer';
import { persistenceMiddleware } from './persistence.middleware';
import {
  placeOrder,
  hydrateOrders,
  readStoredOrders,
  ORDERS_STORAGE_KEY,
  Order,
} from '@/entities/order';
import {
  markAllNotificationsRead,
  hydrateNotifications,
  readStoredNotifications,
  NOTIFICATIONS_STORAGE_KEY,
} from '@/entities/notification';
import { toggleSelectedProduct } from '@/entities/cart/model/cart.slice';
import { IProduct } from '@/entities/product';

const product: IProduct = {
  id: 1,
  src: '/images/products/1.png',
  name: 'Product 1',
  unitValue: 1,
  unit: 'kg',
  price: 2.5,
  category: 'Vegetables',
  category_id: 1,
  quantity: 2,
};

const order: Order = {
  transactionCode: 'ABCDEFGHJK',
  placedAt: '24 July, 10:00 AM',
  paymentMethod: 'Mastercard •• 8802',
  items: [product],
  subtotal: '5.00',
  serviceFee: '1.50',
  total: '6.50',
};

const createStore = () =>
  configureStore({
    reducer: rootReducer,
    middleware: (getDefaultMiddleware) => getDefaultMiddleware().concat(persistenceMiddleware),
  });

describe('persistence middleware', () => {
  afterEach(() => {
    jest.restoreAllMocks();
    window.localStorage.clear();
  });

  it('writes the order history when an order is placed', () => {
    createStore().dispatch(placeOrder(order));

    expect(readStoredOrders()).toEqual([order]);
  });

  // Placing an order also produces a notification, which has to survive the reload too
  it('writes the notification the order produced', () => {
    createStore().dispatch(placeOrder(order));

    const stored = readStoredNotifications();
    expect(stored).toHaveLength(1);
    expect(stored[0].orderCode).toBe('ABCDEFGHJK');
    expect(stored[0].read).toBe(false);
  });

  it('persists the read flag when notifications are marked read', () => {
    const store = createStore();
    store.dispatch(placeOrder(order));
    store.dispatch(markAllNotificationsRead());

    expect(readStoredNotifications()[0].read).toBe(true);
  });

  // Everything written must survive a cold start, which is the whole point
  it('produces a history a fresh store can restore', () => {
    createStore().dispatch(placeOrder(order));

    const restored = createStore();
    restored.dispatch(hydrateOrders(readStoredOrders()));
    restored.dispatch(hydrateNotifications(readStoredNotifications()));

    expect(restored.getState().order.orders).toEqual([order]);
    expect(restored.getState().order.isHydrated).toBe(true);
    expect(restored.getState().notification.items).toHaveLength(1);
  });

  // The receipt is session-scoped: restoring history must not unlock /checkout-success
  it('restores history without restoring the receipt', () => {
    createStore().dispatch(placeOrder(order));

    const restored = createStore();
    restored.dispatch(hydrateOrders(readStoredOrders()));

    expect(restored.getState().order.orders).toHaveLength(1);
    expect(restored.getState().order.lastOrder).toBeNull();
  });

  // Writing back what was just read is pointless work on every page load
  it('does not write while hydrating', () => {
    const setItem = jest.spyOn(Storage.prototype, 'setItem');

    const store = createStore();
    store.dispatch(hydrateOrders([order]));
    store.dispatch(hydrateNotifications([]));

    expect(setItem).not.toHaveBeenCalled();
  });

  // Storing on every keystroke-sized action would be wasteful
  it('does not write for actions that leave the persisted slices alone', () => {
    const setItem = jest.spyOn(Storage.prototype, 'setItem');

    createStore().dispatch(toggleSelectedProduct(product));

    expect(setItem).not.toHaveBeenCalled();
  });

  // Blocked storage costs the user their history, never their checkout
  it('lets the order through when storage refuses the write', () => {
    jest.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new Error('QuotaExceededError');
    });

    const store = createStore();
    expect(() => store.dispatch(placeOrder(order))).not.toThrow();

    expect(store.getState().order.lastOrder).toEqual(order);
    expect(store.getState().order.orders).toHaveLength(1);
  });

  // A corrupted payload must not be handed to the reducer as if it were real
  it('restores nothing from a corrupted payload', () => {
    window.localStorage.setItem(ORDERS_STORAGE_KEY, '[{"transactionCode":');
    window.localStorage.setItem(NOTIFICATIONS_STORAGE_KEY, 'not json');

    const store = createStore();
    store.dispatch(hydrateOrders(readStoredOrders()));
    store.dispatch(hydrateNotifications(readStoredNotifications()));

    expect(store.getState().order.orders).toEqual([]);
    expect(store.getState().order.isHydrated).toBe(true);
    expect(store.getState().notification.items).toEqual([]);
    expect(store.getState().notification.isHydrated).toBe(true);
  });
});
