import {
  selectDiscountedProducts,
  selectMaxDiscountPercent,
  selectProductCountByCategory,
} from './selectors';
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

describe('selectProductCountByCategory', () => {
  const inCategory = (id: number, categoryId: number): IProduct => ({
    ...product(id),
    category_id: categoryId,
  });

  it('counts only the products in the given category', () => {
    const products = [inCategory(1, 1), inCategory(2, 2), inCategory(3, 1)];

    expect(selectProductCountByCategory(1, products)).toBe(2);
    expect(selectProductCountByCategory(2, products)).toBe(1);
  });

  // A category with nothing in it reports zero rather than being hidden from the screen
  it('returns zero for a category holding nothing', () => {
    expect(selectProductCountByCategory(99, [inCategory(1, 1)])).toBe(0);
  });

  // The counts printed on the category screen have to add up to the catalog
  it('partitions the whole catalog by default', () => {
    const categoryIds = [...new Set(MOCK_PRODUCTS.map((item) => item.category_id))];
    const total = categoryIds.reduce(
      (sum, categoryId) => sum + selectProductCountByCategory(categoryId),
      0
    );

    expect(total).toBe(MOCK_PRODUCTS.length);
  });

  // The count must equal what the ?category= filter puts on screen, or the two disagree
  it('agrees with filtering the catalog by the same field', () => {
    const categoryIds = [...new Set(MOCK_PRODUCTS.map((item) => item.category_id))];

    categoryIds.forEach((categoryId) => {
      const filtered = MOCK_PRODUCTS.filter((item) => item.category_id === categoryId);
      expect(selectProductCountByCategory(categoryId)).toBe(filtered.length);
    });
  });
});
