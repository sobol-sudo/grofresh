/**
 * Renders a count with its noun: `pluralize(1, 'product')` -> "1 product".
 *
 * The catalog screens print counts derived from the product list, and a count that
 * reads "1 products" undermines a number that is otherwise correct.
 */
export function pluralize(count: number, singular: string, plural = `${singular}s`): string {
  return `${count} ${count === 1 ? singular : plural}`;
}
