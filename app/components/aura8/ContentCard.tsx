"use client";

import Link from "next/link";
import { CATEGORY_COLORS, FALLBACK_CATEGORY_COLOR, type Aura8ContentItem } from "@/lib/aura8/gallery";

interface ContentCardProps {
  item: Aura8ContentItem;
}

export default function ContentCard({ item }: ContentCardProps) {
  const color = CATEGORY_COLORS[item.category] ?? FALLBACK_CATEGORY_COLOR;

  return (
    <Link href={`/aura8/gallery/${item.id}`} className="group block overflow-hidden rounded-lg border border-[#1A1A1E] bg-[#0D0D0F] transition hover:scale-[1.01] hover:border-[#FF006E66]">
      <div className="relative aspect-[4/5] overflow-hidden">
        <img
          src={item.thumbnail_url || item.image_url}
          alt={item.title}
          className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 transition group-hover:opacity-100" />
        <div className="absolute bottom-2 left-2 right-2 opacity-0 transition group-hover:opacity-100">
          <div className="text-[11px] text-[#E8E8F0]">{item.description?.slice(0, 90) || "Preview content"}</div>
        </div>
      </div>

      <div className="space-y-2 p-3">
        <div className="line-clamp-2 text-sm font-semibold text-[#E8E8F0]">{item.title}</div>
        <div className="flex items-center justify-between gap-2">
          <span
            className="rounded-full border px-2 py-0.5 text-[10px] font-semibold"
            style={{ borderColor: `${color}77`, color, background: `${color}22` }}
          >
            {item.category}
          </span>
          <span className="text-[10px] text-[#9A9A9F]">{(item.views ?? 0).toLocaleString()} views</span>
        </div>
      </div>
    </Link>
  );
}
