import { readJson, writeJson } from '@/shared/lib/persistence';
import type { Order } from '../model/order.slice';

export const ORDERS_STORAGE_KEY = 'grofresh.orders.v1';

/**
 * Orders carry a snapshot of the products bought, so a stored receipt has to be
 * checked field by field. Anything that does not match is treated as foreign data
 * rather than coerced into an Order and rendered as a broken receipt.
 */
function isStoredProduct(value: unknown): boolean {
  if (typeof value !== 'object' || value === null) return false;
  const product = value as Record<string, unknown>;

  return (
    typeof product.id === 'number' &&
    typeof product.src === 'string' &&
    typeof product.name === 'string' &&
    typeof product.unitValue === 'number' &&
    typeof product.unit === 'string' &&
    typeof product.price === 'number' &&
    typeof product.category === 'string' &&
    typeof product.category_id === 'number' &&
    typeof product.quantity === 'number'
  );
}

function isStoredOrder(value: unknown): value is Order {
  if (typeof value !== 'object' || value === null) return false;
  const order = value as Record<string, unknown>;

  return (
    typeof order.transactionCode === 'string' &&
    typeof order.placedAt === 'string' &&
    typeof order.paymentMethod === 'string' &&
    typeof order.subtotal === 'string' &&
    typeof order.serviceFee === 'string' &&
    typeof order.total === 'string' &&
    Array.isArray(order.items) &&
    order.items.every(isStoredProduct)
  );
}

/**
 * Reads the persisted purchase history.
 *
 * A single malformed entry rejects the whole payload: half a history is harder to
 * reason about than none, and the next order written replaces the bad data anyway.
 *
 * @returns the stored orders, or an empty list when storage is unavailable,
 *          blocked, empty or corrupted.
 */
export function readStoredOrders(): Order[] {
  return (
    readJson<Order[]>(ORDERS_STORAGE_KEY, (value) =>
      Array.isArray(value) && value.every(isStoredOrder) ? (value as Order[]) : null
    ) ?? []
  );
}

export function writeStoredOrders(orders: Order[]): void {
  writeJson(ORDERS_STORAGE_KEY, orders);
}
