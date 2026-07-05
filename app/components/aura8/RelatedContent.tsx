"use client";

import type { Aura8ContentItem } from "@/lib/aura8/gallery";
import ContentCard from "./ContentCard";

interface RelatedContentProps {
  items: Aura8ContentItem[];
}

export default function RelatedContent({ items }: RelatedContentProps) {
  if (!items.length) return null;

  return (
    <section className="mt-8">
      <h2 className="mb-4 text-lg font-semibold text-[#E8E8F0]">Related Content</h2>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
        {items.slice(0, 6).map((item) => (
          <ContentCard key={item.id} item={item} />
        ))}
      </div>
    </section>
  );
}
