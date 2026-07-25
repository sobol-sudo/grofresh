import { render, screen } from '@testing-library/react';
import PopularNow, { POPULAR_LIMIT } from './PopularNow';

/**
 * The home page teaser against a catalog longer than it shows.
 *
 * This lives apart from PopularNow.test.tsx because the two need different catalogs
 * and a module mock is fixed for the whole file: that suite covers a catalog the
 * teaser fits entirely, this one covers a catalog it has to cut short.
 */

jest.mock('@/entities/product', () => ({
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  Product: ({ product }: any) => <div data-testid="product-item">{product.name}</div>,
}));

const mockCatalog = Array.from({ length: 12 }, (_, index) => ({
  id: index + 1,
  name: `Product ${index + 1}`,
  category_id: index < 6 ? 1 : 2,
}));

jest.mock('@/entities/product/config/mock', () => ({
  get MOCK_PRODUCTS() {
    return mockCatalog;
  },
}));

describe('PopularNow teaser', () => {
  test('the fixture is longer than the teaser shows', () => {
    expect(mockCatalog.length).toBeGreaterThan(POPULAR_LIMIT);
  });

  // The home page is a teaser, not the catalog
  test('shows only the first POPULAR_LIMIT products', () => {
    render(<PopularNow />);

    const rendered = screen.getAllByTestId('product-item');
    expect(rendered).toHaveLength(POPULAR_LIMIT);
    expect(rendered[0]).toHaveTextContent('Product 1');
    expect(rendered[POPULAR_LIMIT - 1]).toHaveTextContent(`Product ${POPULAR_LIMIT}`);
    expect(screen.queryByText(`Product ${POPULAR_LIMIT + 1}`)).not.toBeInTheDocument();
  });

  // The restored link, and where it goes
  test('offers "See all" pointing at the full catalog screen', () => {
    render(<PopularNow />);

    expect(screen.getByRole('link', { name: 'See all products' })).toHaveAttribute('href', '/products');
  });

  // A search that matches more than the teaser limit must not be cut down to it:
  // the count printed on the category screen has to be what actually appears here.
  test('never trims a filtered result set', () => {
    render(<PopularNow categoryId={1} />);

    expect(screen.getAllByTestId('product-item')).toHaveLength(6);
    expect(screen.getByText('Results')).toBeInTheDocument();
  });

  test('does not offer "See all" while a filter is active', () => {
    render(<PopularNow query="Product" />);

    expect(screen.getAllByTestId('product-item')).toHaveLength(mockCatalog.length);
    expect(screen.queryByRole('link', { name: 'See all products' })).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Clear' })).toBeInTheDocument();
  });
});
