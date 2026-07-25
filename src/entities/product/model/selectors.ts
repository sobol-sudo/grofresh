import { MOCK_PRODUCTS } from '../config/mock';
import { hasDiscount } from '../lib/price';
import type { IProduct } from './types';

/**
 * Every product currently on promotion.
 *
 * The catalog is static, so this reads the product list directly rather than the
 * store; the `products` parameter exists so callers can narrow an already-filtered
 * list and so the behaviour is testable without touching the mock data.
 */
export function selectDiscountedProducts(products: IProduct[] = MOCK_PRODUCTS): IProduct[] {
  return products.filter(hasDiscount);
}

/**
 * The headline discount, so the deals banner can state a number that the catalog
 * actually backs instead of hardcoding one. Returns 0 when nothing is on offer,
 * which is the signal to hide the banner rather than advertise an empty sale.
 */
export function selectMaxDiscountPercent(products: IProduct[] = MOCK_PRODUCTS): number {
  return selectDiscountedProducts(products).reduce(
    (highest, product) => Math.max(highest, product.discountPercent ?? 0),
    0
  );
}

/**
 * How many products a category actually holds.
 *
 * The category screen prints this next to every card, and tapping the card opens
 * `/?category=<id>`, which filters the same list by the same field. The number and
 * the screen it leads to are therefore derived from one source and cannot drift:
 * a category with nothing in it reads "0 products" rather than being hidden.
 */
export function selectProductCountByCategory(
  categoryId: number,
  products: IProduct[] = MOCK_PRODUCTS
): number {
  return products.filter((product) => product.category_id === categoryId).length;
}
