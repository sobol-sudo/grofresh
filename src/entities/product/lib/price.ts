import type { IProduct } from '../model/types';

/** Whether a promotion is currently running on this product. */
export function hasDiscount(product: IProduct): boolean {
  return typeof product.discountPercent === 'number' && product.discountPercent > 0;
}

/**
 * What the product actually costs right now, rounded to whole cents.
 *
 * Every price shown to the customer and every total charged has to come from this
 * one function, otherwise a struck-through list price and a cart total can quietly
 * disagree about what the discount was.
 */
export function discountedPrice(product: IProduct): number {
  if (!hasDiscount(product)) return product.price;

  const percent = product.discountPercent as number;
  return Math.round(product.price * (100 - percent)) / 100;
}

/** How much the promotion saves, in currency units. Zero when nothing is discounted. */
export function discountSavings(product: IProduct): number {
  return Math.round((product.price - discountedPrice(product)) * 100) / 100;
}
