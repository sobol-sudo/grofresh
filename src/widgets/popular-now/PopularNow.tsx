import { useMemo } from "react"
import { Product } from "@/entities/product"
import { MOCK_PRODUCTS } from "@/entities/product/config/mock"

interface PopularNowProps {
  query?: string;
  categoryId?: number | null;
  onClearFilters?: () => void;
}

export default function PopularNow({ query = '', categoryId = null, onClearFilters }: PopularNowProps) {
  const trimmedQuery = query.trim();
  const isFiltered = trimmedQuery.length > 0 || categoryId !== null;

  const products = useMemo(() => {
    const search = trimmedQuery.toLowerCase();

    return MOCK_PRODUCTS.filter((product) => {
      const matchesQuery = !search || product.name.toLowerCase().includes(search);
      const matchesCategory = categoryId === null || product.category_id === categoryId;

      return matchesQuery && matchesCategory;
    });
  }, [trimmedQuery, categoryId]);

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
        </div>

        {products.length === 0 ? (
          <p className="small-regular mt-[22px] text-center" data-testid="no-products">
            {trimmedQuery
              ? `No products match "${trimmedQuery}"`
              : 'No products in this category'}
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
