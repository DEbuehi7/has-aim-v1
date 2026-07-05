"use client";

import type { Aura8ContentItem } from "@/lib/aura8/gallery";
import ContentCard from "./ContentCard";

interface ContentGridProps {
  items: Aura8ContentItem[];
  loading: boolean;
  loadingMore: boolean;
  emptyMessage?: string;
}

function SkeletonCard() {
  return <div className="animate-pulse rounded-lg border border-[#1A1A1E] bg-[#0D0D0F] aspect-[4/5]" />;
}

export default function ContentGrid({ items, loading, loadingMore, emptyMessage = "No content found." }: ContentGridProps) {
  const showEmpty = !loading && items.length === 0;

  return (
    <div>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
        {loading && items.length === 0 && Array.from({ length: 8 }).map((_, i) => <SkeletonCard key={`s-${i}`} />)}
        {items.map((item) => (
          <ContentCard key={item.id} item={item} />
        ))}
      </div>

      {showEmpty && <div className="rounded-lg border border-[#1A1A1E] bg-[#0D0D0F] p-6 text-center text-sm text-[#9A9A9F]">{emptyMessage}</div>}

      {loadingMore && (
        <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <SkeletonCard key={`m-${i}`} />
          ))}
        </div>
      )}
    </div>
  );
}
