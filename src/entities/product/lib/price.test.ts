import { hasDiscount, discountedPrice, discountSavings } from './price';
import { MOCK_PRODUCTS, FRESH_DEALS_PERCENT } from '../config/mock';
import type { IProduct } from '../model/types';

const product = (overrides: Partial<IProduct> = {}): IProduct => ({
  id: 1,
  src: '/images/products/1.png',
  name: 'Product 1',
  unitValue: 1,
  unit: 'kg',
  price: 2.5,
  category: 'Vegetables',
  category_id: 1,
  quantity: 0,
  ...overrides,
});

describe('hasDiscount', () => {
  it('is false when the field is absent', () => {
    expect(hasDiscount(product())).toBe(false);
  });

  // A zero-percent promotion is not a promotion, and must not draw a badge
  it('is false for a zero discount', () => {
    expect(hasDiscount(product({ discountPercent: 0 }))).toBe(false);
  });

  it('is true for a real discount', () => {
    expect(hasDiscount(product({ discountPercent: 20 }))).toBe(true);
  });
});

describe('discountedPrice', () => {
  it('returns the list price when nothing is on offer', () => {
    expect(discountedPrice(product({ price: 3.99 }))).toBe(3.99);
  });

  it('takes the advertised percentage off', () => {
    expect(discountedPrice(product({ price: 2.5, discountPercent: 20 }))).toBe(2);
  });

  // 2.2 * 80 is 176.00000000000003 in binary floating point
  it('lands on a whole cent despite floating point error', () => {
    expect(discountedPrice(product({ price: 2.2, discountPercent: 20 }))).toBe(1.76);
  });

  it('never returns more decimals than a price can have', () => {
    const price = discountedPrice(product({ price: 2.19, discountPercent: 20 }));
    expect(price).toBe(Math.round(price * 100) / 100);
  });
});

describe('discountSavings', () => {
  it('is zero when nothing is on offer', () => {
    expect(discountSavings(product({ price: 3.99 }))).toBe(0);
  });

  it('is the difference between the list price and what is charged', () => {
    expect(discountSavings(product({ price: 3.1, discountPercent: 20 }))).toBe(0.62);
  });
});

// The home screen advertises "Fresh Deals — Today 20% OFF" on selected groceries.
// These assertions are what stop that banner from becoming a claim the catalog
// cannot back up.
describe('the Fresh Deals promotion the banner advertises', () => {
  const discounted = MOCK_PRODUCTS.filter(hasDiscount);

  it('actually discounts some products', () => {
    expect(discounted.length).toBeGreaterThan(0);
  });

  it('discounts every one of them by the advertised percentage', () => {
    expect(discounted.every((item) => item.discountPercent === FRESH_DEALS_PERCENT)).toBe(true);
  });

  it('advertises the percentage the banner states', () => {
    expect(FRESH_DEALS_PERCENT).toBe(20);
  });

  // "Selected groceries" means a selection, not the whole shop
  it('leaves the rest of the catalog at full price', () => {
    expect(discounted.length).toBeLessThan(MOCK_PRODUCTS.length);
  });

  // The promotion is the two fresh-produce categories, which is what makes it coherent
  it('covers exactly the fresh produce categories', () => {
    const categories = [...new Set(discounted.map((item) => item.category))].sort();
    expect(categories).toEqual(['Fruits', 'Vegetables']);

    const produce = MOCK_PRODUCTS.filter(
      (item) => item.category === 'Fruits' || item.category === 'Vegetables'
    );
    expect(discounted).toHaveLength(produce.length);
  });

  // A struck-through price and the price charged must agree to the cent
  it('prices every deal so the discount lands on a whole cent', () => {
    discounted.forEach((item) => {
      const charged = discountedPrice(item);
      expect(charged).toBe(Math.round(charged * 100) / 100);
      expect(Math.round(item.price * 100) % 5).toBe(0);
    });
  });

  it('charges less than the list price for every deal', () => {
    discounted.forEach((item) => {
      expect(discountedPrice(item)).toBeLessThan(item.price);
    });
  });

  // The original, the discount and the price charged have to be one consistent story
  it('keeps list price, savings and charged price arithmetically consistent', () => {
    discounted.forEach((item) => {
      expect(discountedPrice(item) + discountSavings(item)).toBeCloseTo(item.price, 10);
      expect(discountSavings(item)).toBeCloseTo(
        (item.price * FRESH_DEALS_PERCENT) / 100,
        10
      );
    });
  });
});
