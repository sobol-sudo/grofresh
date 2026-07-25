import { pluralize } from './pluralize';

describe('pluralize', () => {
  it('uses the singular for exactly one', () => {
    expect(pluralize(1, 'product')).toBe('1 product');
  });

  it('uses the plural for everything else', () => {
    expect(pluralize(0, 'product')).toBe('0 products');
    expect(pluralize(2, 'product')).toBe('2 products');
    expect(pluralize(17, 'product')).toBe('17 products');
  });

  it('accepts an irregular plural', () => {
    expect(pluralize(2, 'category', 'categories')).toBe('2 categories');
    expect(pluralize(1, 'category', 'categories')).toBe('1 category');
  });
});
