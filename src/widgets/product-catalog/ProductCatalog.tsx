import { Product } from "@/entities/product";
import { MOCK_PRODUCTS } from "@/entities/product/config/mock";
import { pluralize } from "@/shared/lib/pluralize";

/**
 * The whole catalog, behind "See all" on the home page's "Popular now" teaser.
 *
 * The teaser deliberately shows only its first few products; this is the screen that
 * shows the rest. The count in the header is the length of the list rendered directly
 * below it, so the two can never disagree.
 */
export default function ProductCatalog() {
  const products = MOCK_PRODUCTS;

  if (products.length === 0) {
    return (
      <div className="container">
        <p className="small-regular text-center mt-10 text-gray-500" data-testid="empty-catalog">
          There are no products in the catalog yet
        </p>
      </div>
    );
  }

  return (
    <div className="container">
      <p className="small-regular text-gray-500" data-testid="catalog-count">
        {pluralize(products.length, 'product')}
      </p>

      <div className="flex flex-wrap justify-center gap-2.5 mt-[22px]">
        {products.map((product) => (
          <Product key={product.id} product={product} />
        ))}
      </div>
    </div>
  );
}
