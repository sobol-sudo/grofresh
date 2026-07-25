import {
  notificationReducer,
  markNotificationRead,
  markAllNotificationsRead,
  hydrateNotifications,
  selectNotifications,
  selectUnreadNotificationCount,
  selectNotificationsHydrated,
  MAX_STORED_NOTIFICATIONS,
  AppNotification,
  NotificationState,
} from './notification.slice';
import { placeOrder, Order } from '@/entities/order';
import { IProduct } from '@/entities/product';

const product = (id: number, quantity: number): IProduct => ({
  id,
  src: `/images/products/${id}.png`,
  name: `Product ${id}`,
  unitValue: 1,
  unit: 'kg',
  price: 2.5,
  category: 'Vegetables',
  category_id: 1,
  quantity,
});

const order: Order = {
  transactionCode: 'ABCDEFGHJK',
  placedAt: '24 July, 10:00 AM',
  paymentMethod: 'Mastercard •• 8802',
  items: [product(1, 2), product(2, 1)],
  subtotal: '6.00',
  serviceFee: '1.50',
  total: '7.50',
};

const stored: AppNotification = {
  id: 'order-placed:OLDCODE123',
  kind: 'order-placed',
  title: 'Order placed',
  message: '1 item for $3.00, paid with Card.',
  createdAt: '23 July, 09:00 AM',
  read: false,
  orderCode: 'OLDCODE123',
};

describe('notificationSlice', () => {
  // An inbox that starts with entries would be advertising events that never happened
  it('starts empty and un-hydrated', () => {
    const state = notificationReducer(undefined, { type: 'unknown' });

    expect(state.items).toEqual([]);
    expect(state.isHydrated).toBe(false);
  });
});

describe('notificationSlice reacting to placed orders', () => {
  // The only way to get a notification is for the event to actually happen
  it('creates a notification when an order is placed', () => {
    const state = notificationReducer(undefined, placeOrder(order));

    expect(state.items).toHaveLength(1);
    expect(state.items[0].kind).toBe('order-placed');
    expect(state.items[0].read).toBe(false);
  });

  // Everything shown comes from the order, so the notification cannot contradict the receipt
  it('describes the order it came from', () => {
    const [notification] = notificationReducer(undefined, placeOrder(order)).items;

    expect(notification.orderCode).toBe('ABCDEFGHJK');
    expect(notification.createdAt).toBe('24 July, 10:00 AM');
    expect(notification.message).toContain('3 items');
    expect(notification.message).toContain('$7.50');
    expect(notification.message).toContain('Mastercard •• 8802');
  });

  it('says "item" rather than "items" for a single item', () => {
    const single = { ...order, items: [product(1, 1)], total: '2.50' };
    const [notification] = notificationReducer(undefined, placeOrder(single)).items;

    expect(notification.message).toContain('1 item for');
    expect(notification.message).not.toContain('1 items');
  });

  it('puts the newest notification first', () => {
    const first = notificationReducer(undefined, placeOrder(order));
    const state = notificationReducer(
      first,
      placeOrder({ ...order, transactionCode: 'SECOND1234' })
    );

    expect(state.items.map((item) => item.orderCode)).toEqual(['SECOND1234', 'ABCDEFGHJK']);
  });

  // The id is derived from the order, so a replayed action cannot inflate the badge
  it('does not add a second notification for the same order', () => {
    const first = notificationReducer(undefined, placeOrder(order));
    const state = notificationReducer(first, placeOrder(order));

    expect(state.items).toHaveLength(1);
  });

  it('caps the inbox at MAX_STORED_NOTIFICATIONS', () => {
    const state = Array.from({ length: MAX_STORED_NOTIFICATIONS + 3 }).reduce<NotificationState>(
      (acc, _, index) =>
        notificationReducer(acc, placeOrder({ ...order, transactionCode: `CODE${index}` })),
      undefined as unknown as NotificationState
    );

    expect(state.items).toHaveLength(MAX_STORED_NOTIFICATIONS);
    expect(state.items[0].orderCode).toBe(`CODE${MAX_STORED_NOTIFICATIONS + 2}`);
  });
});

describe('notificationSlice read state', () => {
  it('marks a single notification read', () => {
    const placed = notificationReducer(undefined, placeOrder(order));
    const state = notificationReducer(placed, markNotificationRead(placed.items[0].id));

    expect(state.items[0].read).toBe(true);
  });

  // An id that is not in the inbox must be a no-op, not a crash
  it('ignores an unknown id', () => {
    const placed = notificationReducer(undefined, placeOrder(order));
    const state = notificationReducer(placed, markNotificationRead('does-not-exist'));

    expect(state.items[0].read).toBe(false);
  });

  it('marks every notification read', () => {
    const first = notificationReducer(undefined, placeOrder(order));
    const both = notificationReducer(first, placeOrder({ ...order, transactionCode: 'SECOND1234' }));
    const state = notificationReducer(both, markAllNotificationsRead());

    expect(state.items.every((item) => item.read)).toBe(true);
  });
});

describe('notificationSlice hydration', () => {
  it('restores stored notifications and flips the hydrated flag', () => {
    const state = notificationReducer(undefined, hydrateNotifications([stored]));

    expect(state.items).toEqual([stored]);
    expect(state.isHydrated).toBe(true);
  });

  // An empty read is still a read: the inbox must show its empty state, not a spinner
  it('flips the hydrated flag even when nothing was stored', () => {
    const state = notificationReducer(undefined, hydrateNotifications([]));

    expect(state.items).toEqual([]);
    expect(state.isHydrated).toBe(true);
  });

  it('keeps a session notification above the restored ones', () => {
    const placed = notificationReducer(undefined, placeOrder(order));
    const state = notificationReducer(placed, hydrateNotifications([stored]));

    expect(state.items.map((item) => item.orderCode)).toEqual(['ABCDEFGHJK', 'OLDCODE123']);
  });

  it('does not duplicate a notification already in memory', () => {
    const placed = notificationReducer(undefined, placeOrder(order));
    const restored = { ...placed.items[0] };
    const state = notificationReducer(placed, hydrateNotifications([restored]));

    expect(state.items).toHaveLength(1);
  });
});

describe('notificationSlice selectors', () => {
  const state = (items: AppNotification[]): { notification: NotificationState } => ({
    notification: { items, isHydrated: true },
  });

  it('selectNotifications returns the inbox', () => {
    expect(selectNotifications(state([stored]))).toEqual([stored]);
  });

  // The badge has to count real unread rows, never a hardcoded number
  it('selectUnreadNotificationCount counts only unread notifications', () => {
    const items = [
      stored,
      { ...stored, id: 'order-placed:B', read: true },
      { ...stored, id: 'order-placed:C', read: false },
    ];

    expect(selectUnreadNotificationCount(state(items))).toBe(2);
  });

  it('selectUnreadNotificationCount is zero for an empty inbox', () => {
    expect(selectUnreadNotificationCount(state([]))).toBe(0);
  });

  it('selectUnreadNotificationCount is zero once everything is read', () => {
    expect(selectUnreadNotificationCount(state([{ ...stored, read: true }]))).toBe(0);
  });

  it('selectNotificationsHydrated reports whether storage has been read', () => {
    expect(selectNotificationsHydrated(state([]))).toBe(true);
    expect(selectNotificationsHydrated({ notification: { items: [], isHydrated: false } })).toBe(
      false
    );
  });
});
