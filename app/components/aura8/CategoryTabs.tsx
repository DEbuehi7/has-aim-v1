"use client";

interface CategoryTabsProps {
  categories: readonly string[];
  selected: string[];
  onToggle: (category: string) => void;
}

export default function CategoryTabs({ categories, selected, onToggle }: CategoryTabsProps) {
  return (
    <div className="overflow-x-auto pb-2">
      <div className="flex min-w-max gap-2">
        {categories.map((category) => {
          const active = selected.includes(category);
          return (
            <button
              key={category}
              onClick={() => onToggle(category)}
              className="rounded-full border px-3 py-1 text-xs font-semibold transition"
              style={{
                borderColor: active ? "#FF006E" : "#2A2A33",
                background: active ? "#FF006E22" : "#0D0D0F",
                color: active ? "#FF006E" : "#9A9A9F",
              }}
            >
              {category}
            </button>
          );
        })}
      </div>
    </div>
  );
}
