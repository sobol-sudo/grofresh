import Image from "next/image";
import { Category } from "../../../browse-category/model/types";

interface CategoryProps {
  category: Category;
  isSelected?: boolean;
  onSelect?: (id: number) => void;
}

export default function CategoryCard({ category, isSelected = false, onSelect }: CategoryProps) {
  return (
    <div
      className={`bg-white p-4 transition-colors ease-in-out rounded-[30px] shrink-0 flex flex-col gap-2.5 cursor-pointer hover:bg-flash-white ${isSelected ? 'outline outline-green-500' : ''}`}
      onClick={() => onSelect?.(category.id)}
      data-testid="category-card"
      aria-pressed={isSelected}
      role="button"
    >
      <Image
        src={category.image}
        width={65}
        height={65}
        priority
        style={{ width: 65, height: 65, objectFit: "contain" }}
        className="rounded-full" alt="category" />
      <p className="xtra-small-bold text-center">{category.name}</p>
    </div>
  )
}
