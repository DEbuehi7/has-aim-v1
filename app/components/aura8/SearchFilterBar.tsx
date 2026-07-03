"use client";

import type { Aura8Sort } from "@/lib/aura8/gallery";

interface SearchFilterBarProps {
  search: string;
  onSearchChange: (value: string) => void;
  sort: Aura8Sort;
  onSortChange: (value: Aura8Sort) => void;
  activeCategories: string[];
  onRemoveCategory: (category: string) => void;
  onClearSearch: () => void;
}

export default function SearchFilterBar({
  search,
  onSearchChange,
  sort,
  onSortChange,
  activeCategories,
  onRemoveCategory,
  onClearSearch,
}: SearchFilterBarProps) {
  return (
    <div className="space-y-3 rounded-lg border border-[#1A1A1E] bg-[#0D0D0F] p-4">
      <div className="flex flex-col gap-3 md:flex-row">
        <input
          type="text"
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Search content..."
          className="h-10 flex-1 rounded-md border border-[#2A2A33] bg-[#060608] px-3 text-sm text-[#E8E8F0] outline-none placeholder:text-[#6A6A70] focus:border-[#FF006E77]"
        />

        <select
          value={sort}
          onChange={(e) => onSortChange(e.target.value as Aura8Sort)}
          className="h-10 rounded-md border border-[#2A2A33] bg-[#060608] px-3 text-sm text-[#E8E8F0]"
        >
          <option value="newest">Newest</option>
          <option value="trending">Trending</option>
          <option value="most_viewed">Most Viewed</option>
        </select>
      </div>

      <div className="flex flex-wrap gap-2">
        {search && (
          <button onClick={onClearSearch} className="rounded-full border border-[#FF006E77] bg-[#FF006E22] px-2 py-1 text-[11px] text-[#FF006E]">
            Search: {search} ×
          </button>
        )}

        {activeCategories.map((category) => (
          <button
            key={category}
            onClick={() => onRemoveCategory(category)}
            className="rounded-full border border-[#3A3A44] bg-[#111116] px-2 py-1 text-[11px] text-[#E8E8F0]"
          >
            {category} ×
          </button>
        ))}
      </div>
    </div>
  );
}
