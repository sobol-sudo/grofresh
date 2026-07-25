import CategoryCard from "./ui/category-card";
import { MOCK_CATEGORIES } from "./config/mock";

interface BrowseCategoryProps {
  className?: string;
  selectedCategoryId?: number | null;
  onSelectCategory?: (id: number) => void;
}

export default function BrowseCategory({ className, selectedCategoryId = null, onSelectCategory }: BrowseCategoryProps) {
  return (
    <div className={className}>
      <div className="flex justify-between container">
        <h4 className="h4-bold">Browse categories</h4>
      </div>
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
    </div>
  )
}
