import { readStoredOrders, writeStoredOrders, ORDERS_STORAGE_KEY } from './order.storage';
import type { Order } from '../model/order.slice';
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

const store = (value: unknown) =>
  window.localStorage.setItem(ORDERS_STORAGE_KEY, JSON.stringify(value));

describe('order storage', () => {
  afterEach(() => {
    jest.restoreAllMocks();
    window.localStorage.clear();
  });

  it('round-trips an order through storage', () => {
    writeStoredOrders([order]);
    expect(readStoredOrders()).toEqual([order]);
  });

  // A first-time visitor has nothing stored, which is not an error
  it('reads as an empty history when nothing was ever written', () => {
    expect(readStoredOrders()).toEqual([]);
  });

  // Truncated JSON must not take the app down on boot
  it('falls back to an empty history on corrupted JSON', () => {
    window.localStorage.setItem(ORDERS_STORAGE_KEY, '[{"transactionCode":');

    expect(() => readStoredOrders()).not.toThrow();
    expect(readStoredOrders()).toEqual([]);
  });

  // Valid JSON that is not a list of orders
  it('falls back to an empty history when the payload is not an array', () => {
    store({ transactionCode: 'ABCDEFGHJK' });
    expect(readStoredOrders()).toEqual([]);
  });

  // A receipt missing its totals would render blanks where money should be
  it('rejects the payload when an order is missing fields', () => {
    store([{ transactionCode: 'ABCDEFGHJK', placedAt: '24 July, 10:00 AM' }]);
    expect(readStoredOrders()).toEqual([]);
  });

  // Numbers stored as strings would break the arithmetic on the receipt
  it('rejects the payload when an item has the wrong field types', () => {
    store([{ ...order, items: [{ ...product, price: '2.50' }] }]);
    expect(readStoredOrders()).toEqual([]);
  });

  // One bad entry means the whole payload is untrustworthy
  it('rejects the whole payload when a single order is malformed', () => {
    store([order, { transactionCode: 'BROKEN' }]);
    expect(readStoredOrders()).toEqual([]);
  });

  it('reads as an empty history when storage is blocked', () => {
    jest.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
      throw new Error('SecurityError');
    });

    expect(() => readStoredOrders()).not.toThrow();
    expect(readStoredOrders()).toEqual([]);
  });

  it('does not throw when the write is rejected', () => {
    jest.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new Error('QuotaExceededError');
    });

    expect(() => writeStoredOrders([order])).not.toThrow();
  });
});
