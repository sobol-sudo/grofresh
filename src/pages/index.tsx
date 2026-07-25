import { useCallback, useState } from "react";
import { useRouter } from "next/router";
import useDebounce from "@/shared/hooks/useDebounce/useDebounce";
import SearchRecently from "@/features/search-recently";
import BrowseCategory from "@/widgets/browse-category";
import DiscountCard from "@/widgets/discount-card";
import PopularNow from "@/widgets/popular-now";

export default function Home() {
  const router = useRouter();
  const [search, setSearch] = useState('');
  const query = useDebounce(search, 150);

  // The category lives in the URL, so a filtered catalog is shareable and survives a reload.
  const rawCategory = Number(router.query.category);
  const categoryId = Number.isInteger(rawCategory) && rawCategory > 0 ? rawCategory : null;

  const selectCategory = useCallback((id: number) => {
    const nextCategory = id === categoryId ? undefined : id;

    router.replace(
      { pathname: '/', query: nextCategory ? { category: nextCategory } : {} },
      undefined,
      { shallow: true }
    );
  }, [categoryId, router]);

  const clearFilters = useCallback(() => {
    setSearch('');
    router.replace({ pathname: '/', query: {} }, undefined, { shallow: true });
  }, [router]);

  return (
    <div className="mt-[22px]">
      <div className="w-full">
        <div className="container">
          <SearchRecently value={search} onValueChange={setSearch} />
          <DiscountCard className="mt-[22px]"/>

        </div>
        <BrowseCategory
          className="mt-[22px] overflow-hidden"
          selectedCategoryId={categoryId}
          onSelectCategory={selectCategory}
        />
        <PopularNow query={query} categoryId={categoryId} onClearFilters={clearFilters} />
      </div>
    </div>
  );
}
