import { render, screen, fireEvent } from '@testing-library/react';
import PopularNow from './PopularNow';

// Mock the Product component so these tests do not depend on its logic
jest.mock('@/entities/product', () => ({
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  Product: ({ product }: any) => (
    <div data-testid="product-item">{product.name}</div>
  ),
}));

// Mock the product list
jest.mock('@/entities/product/config/mock', () => ({
  MOCK_PRODUCTS: [
    { id: 1, name: 'Apples', category_id: 5 },
    { id: 2, name: 'Bananas', category_id: 5 },
    { id: 3, name: 'Oranges', category_id: 5 },
    { id: 4, name: 'Baby Spinach', category_id: 1 },
  ],
}));

describe('PopularNow component', () => {
  // Renders the heading; the "more" link pointed at a screen that does not exist
  test('renders heading and no "more" link', () => {
    render(<PopularNow />);

    expect(screen.getByText('Popular now')).toBeInTheDocument();
    expect(screen.queryByText('more')).not.toBeInTheDocument();
  });

  // Renders every product from MOCK_PRODUCTS
  test('renders all mock products', () => {
    render(<PopularNow />);

    const products = screen.getAllByTestId('product-item');
    expect(products).toHaveLength(4);
    expect(products[0]).toHaveTextContent('Apples');
    expect(products[1]).toHaveTextContent('Bananas');
    expect(products[2]).toHaveTextContent('Oranges');
  });

  // The catalog narrows to the search query
  test('filters products by the search query', () => {
    render(<PopularNow query="spin" />);

    const products = screen.getAllByTestId('product-item');
    expect(products).toHaveLength(1);
    expect(products[0]).toHaveTextContent('Baby Spinach');
  });

  // The catalog narrows to the selected category
  test('filters products by category', () => {
    render(<PopularNow categoryId={5} />);

    expect(screen.getAllByTestId('product-item')).toHaveLength(3);
    expect(screen.queryByText('Baby Spinach')).not.toBeInTheDocument();
  });

  // Search and category compose
  test('applies the query and the category together', () => {
    render(<PopularNow query="an" categoryId={5} />);

    const products = screen.getAllByTestId('product-item');
    expect(products).toHaveLength(2);
    expect(products[0]).toHaveTextContent('Bananas');
    expect(products[1]).toHaveTextContent('Oranges');
  });

  // A query with no matches says so instead of silently showing everything
  test('shows an empty state when nothing matches', () => {
    render(<PopularNow query="zzz" />);

    expect(screen.queryAllByTestId('product-item')).toHaveLength(0);
    expect(screen.getByTestId('no-products')).toHaveTextContent('No products match "zzz"');
  });

  // Filters can be cleared from the results header
  test('offers a way to clear an active filter', () => {
    const onClearFilters = jest.fn();
    render(<PopularNow query="spin" onClearFilters={onClearFilters} />);

    expect(screen.getByText('Results')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Clear' }));

    expect(onClearFilters).toHaveBeenCalledTimes(1);
  });

  // The container and overall structure are correct
  test('has correct container structure', () => {
    const { container } = render(<PopularNow />);
    expect(container.querySelector('.container')).toBeInTheDocument();
    expect(container.querySelector('h4')).toHaveTextContent('Popular now');
  });
});
