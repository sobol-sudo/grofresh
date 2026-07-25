import { useMemo } from "react"
import Link from "next/link"
import { Product } from "@/entities/product"
import { MOCK_PRODUCTS } from "@/entities/product/config/mock"

/**
 * How many products the home page teaser shows before handing over to /products.
 *
 * "See all" is rendered only when the catalog is genuinely longer than this, so the
 * link can never lead to a screen the reader is already looking at.
 */
export const POPULAR_LIMIT = 8;

interface PopularNowProps {
  query?: string;
  categoryId?: number | null;
  onClearFilters?: () => void;
}

export default function PopularNow({ query = '', categoryId = null, onClearFilters }: PopularNowProps) {
  const trimmedQuery = query.trim();
  const isFiltered = trimmedQuery.length > 0 || categoryId !== null;

  const matches = useMemo(() => {
    const search = trimmedQuery.toLowerCase();

    return MOCK_PRODUCTS.filter((product) => {
      const matchesQuery = !search || product.name.toLowerCase().includes(search);
      const matchesCategory = categoryId === null || product.category_id === categoryId;

      return matchesQuery && matchesCategory;
    });
  }, [trimmedQuery, categoryId]);

  // Search and category results are never trimmed: the category screen prints a product
  // count per category, and that count has to match what actually lands on screen here.
  // Only the unfiltered teaser is cut short, and only then is "See all" offered.
  const products = isFiltered ? matches : matches.slice(0, POPULAR_LIMIT);
  const hasUnshownProducts = !isFiltered && matches.length > products.length;

  const emptyMessage = trimmedQuery
    ? `No products match "${trimmedQuery}"`
    : categoryId !== null
      ? 'No products in this category'
      : 'There are no products in the catalog yet';

  return (
    <div className="mt-3">
      <div className="container">
        <div className="flex justify-between items-center">
          <h4 className="h4-bold">{isFiltered ? 'Results' : 'Popular now'}</h4>

          {isFiltered && (
            <button className="small-regular underline cursor-pointer" onClick={onClearFilters}>
              Clear
            </button>
          )}

          {hasUnshownProducts && (
            <Link
              href="/products"
              className="small-regular underline"
              aria-label="See all products"
            >
              See all
            </Link>
          )}
        </div>

        {products.length === 0 ? (
          <p className="small-regular mt-[22px] text-center" data-testid="no-products">
            {emptyMessage}
          </p>
        ) : (
          <div className="flex flex-wrap justify-center gap-2.5 mt-[22px]">
            {products.map((product) => {
              return <Product key={product.id} product={product} />
            })}
          </div>
        )}
      </div>
    </div>
  )
}
