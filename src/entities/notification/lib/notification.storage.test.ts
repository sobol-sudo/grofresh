import {
  readStoredNotifications,
  writeStoredNotifications,
  NOTIFICATIONS_STORAGE_KEY,
} from './notification.storage';
import type { AppNotification } from '../model/notification.slice';

const notification: AppNotification = {
  id: 'order-placed:ABCDEFGHJK',
  kind: 'order-placed',
  title: 'Order placed',
  message: '3 items for $6.50, paid with Mastercard •• 8802.',
  createdAt: '24 July, 10:00 AM',
  read: false,
  orderCode: 'ABCDEFGHJK',
};

const store = (value: unknown) =>
  window.localStorage.setItem(NOTIFICATIONS_STORAGE_KEY, JSON.stringify(value));

describe('notification storage', () => {
  afterEach(() => {
    jest.restoreAllMocks();
    window.localStorage.clear();
  });

  it('round-trips a notification through storage', () => {
    writeStoredNotifications([notification]);
    expect(readStoredNotifications()).toEqual([notification]);
  });

  it('keeps the read flag, so a badge does not resurrect dismissed items', () => {
    writeStoredNotifications([{ ...notification, read: true }]);
    expect(readStoredNotifications()[0].read).toBe(true);
  });

  it('reads as an empty inbox when nothing was ever written', () => {
    expect(readStoredNotifications()).toEqual([]);
  });

  // The unread badge counts what comes back from here: a bad payload must read as zero
  it('falls back to an empty inbox on corrupted JSON', () => {
    window.localStorage.setItem(NOTIFICATIONS_STORAGE_KEY, 'not json at all');

    expect(() => readStoredNotifications()).not.toThrow();
    expect(readStoredNotifications()).toEqual([]);
  });

  it('falls back to an empty inbox when the payload is not an array', () => {
    store({ id: 'order-placed:ABCDEFGHJK' });
    expect(readStoredNotifications()).toEqual([]);
  });

  // "read" arriving as a string would make every item count as unread
  it('rejects the payload when a field has the wrong type', () => {
    store([{ ...notification, read: 'false' }]);
    expect(readStoredNotifications()).toEqual([]);
  });

  // A kind from a newer build would render as a blank row
  it('rejects a notification of an unknown kind', () => {
    store([{ ...notification, kind: 'delivery-arrived' }]);
    expect(readStoredNotifications()).toEqual([]);
  });

  it('reads as an empty inbox when storage is blocked', () => {
    jest.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
      throw new Error('SecurityError');
    });

    expect(() => readStoredNotifications()).not.toThrow();
    expect(readStoredNotifications()).toEqual([]);
  });

  it('does not throw when the write is rejected', () => {
    jest.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new Error('QuotaExceededError');
    });

    expect(() => writeStoredNotifications([notification])).not.toThrow();
  });
});
