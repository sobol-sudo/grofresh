import { useRouter } from "next/router";
import CategoryCard from "../category-card";
import { MOCK_CATEGORIES } from "../../config/mock";
import { selectProductCountByCategory } from "@/entities/product";
import { pluralize } from "@/shared/lib/pluralize";

/**
 * The full category list behind "See all" on the home row.
 *
 * The home row is a horizontal strip that runs off the edge of a phone screen; this
 * lays every category out at once and adds the one thing the strip cannot show — how
 * many products each category actually holds. Tapping a card opens the catalog already
 * filtered to that category, which is the same `?category=` route the home row drives,
 * so there is exactly one filtering mechanism in the app.
 */
export default function CategoryGrid() {
  const router = useRouter();

  const openCategory = (id: number) => {
    router.push({ pathname: '/', query: { category: id } });
  };

  if (MOCK_CATEGORIES.length === 0) {
    return (
      <p className="small-regular text-center mt-10 text-gray-500" data-testid="no-categories">
        No categories to browse yet
      </p>
    );
  }

  return (
    <div className="flex flex-wrap justify-center gap-2.5" data-testid="category-grid">
      {MOCK_CATEGORIES.map((category) => {
        const productCount = selectProductCountByCategory(category.id);

        return (
          <div key={category.id} className="flex flex-col items-center">
            <CategoryCard category={category} onSelect={openCategory} />
            <span className="h6-regular text-gray-500" data-testid="category-count">
              {pluralize(productCount, 'product')}
            </span>
          </div>
        );
      })}
    </div>
  );
}
