import { selectDiscountedProducts, selectMaxDiscountPercent } from './selectors';
import { MOCK_PRODUCTS } from '../config/mock';
import type { IProduct } from './types';

const product = (id: number, discountPercent?: number): IProduct => ({
  id,
  src: `/images/products/${id}.png`,
  name: `Product ${id}`,
  unitValue: 1,
  unit: 'kg',
  price: 2.5,
  category: 'Vegetables',
  category_id: 1,
  quantity: 0,
  ...(discountPercent === undefined ? {} : { discountPercent }),
});

describe('selectDiscountedProducts', () => {
  it('returns only the products on promotion', () => {
    const products = [product(1, 20), product(2), product(3, 10)];

    expect(selectDiscountedProducts(products).map((item) => item.id)).toEqual([1, 3]);
  });

  it('returns nothing when no promotion is running', () => {
    expect(selectDiscountedProducts([product(1), product(2)])).toEqual([]);
  });

  // Defaults to the catalog, which is where the deals screen will read from
  it('reads the catalog by default and finds real deals in it', () => {
    const deals = selectDiscountedProducts();

    expect(deals.length).toBeGreaterThan(0);
    expect(deals.length).toBeLessThan(MOCK_PRODUCTS.length);
    expect(deals.every((item) => (item.discountPercent ?? 0) > 0)).toBe(true);
  });
});

describe('selectMaxDiscountPercent', () => {
  it('returns the highest active discount', () => {
    expect(selectMaxDiscountPercent([product(1, 10), product(2, 25), product(3)])).toBe(25);
  });

  // Zero is the signal to hide the banner rather than advertise an empty sale
  it('returns zero when nothing is on offer', () => {
    expect(selectMaxDiscountPercent([product(1), product(2)])).toBe(0);
  });

  it('returns the percentage the catalog actually offers', () => {
    expect(selectMaxDiscountPercent()).toBe(20);
  });
});
