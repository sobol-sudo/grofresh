import Link from "next/link";
import CategoryCard from "./ui/category-card";
import { MOCK_CATEGORIES } from "./config/mock";

interface BrowseCategoryProps {
  className?: string;
  selectedCategoryId?: number | null;
  onSelectCategory?: (id: number) => void;
}

export default function BrowseCategory({ className, selectedCategoryId = null, onSelectCategory }: BrowseCategoryProps) {
  const hasCategories = MOCK_CATEGORIES.length > 0;

  return (
    <div className={className}>
      <div className="flex justify-between items-center container">
        <h4 className="h4-bold">Browse categories</h4>
        {/* Only offered when there is a list to open: an empty strip has nothing to see. */}
        {hasCategories && (
          <Link
            href="/categories"
            className="small-regular underline"
            aria-label="See all categories"
          >
            See all
          </Link>
        )}
      </div>

      {hasCategories ? (
        <div className="mx-auto flex pl-lg pr-lg pb-2.5 max-w-(--breakpoint-md) mt-[22px] gap-2.5 minimal-scroll">
          {MOCK_CATEGORIES.map((category) => (
            <CategoryCard
              key={category.id}
              category={category}
              isSelected={category.id === selectedCategoryId}
              onSelect={onSelectCategory}
            />
          ))}
        </div>
      ) : (
        <p className="small-regular container mt-[22px] text-gray-500" data-testid="no-categories">
          No categories to browse yet
        </p>
      )}
    </div>
  )
}
