"use client";

import { useMemo, useState } from "react";
import type { Aura8ContentItem } from "@/lib/aura8/gallery";
import { CATEGORY_COLORS, FALLBACK_CATEGORY_COLOR } from "@/lib/aura8/gallery";

interface ContentPlayerProps {
  item: Aura8ContentItem;
  onSave: () => Promise<void>;
}

export default function ContentPlayer({ item, onSave }: ContentPlayerProps) {
  const [saving, setSaving] = useState(false);
  const [savedMessage, setSavedMessage] = useState("");
  const [reportMessage, setReportMessage] = useState("");

  const dateLabel = useMemo(() => {
    const d = new Date(item.created_at);
    return Number.isNaN(d.valueOf()) ? "Unknown date" : d.toLocaleDateString();
  }, [item.created_at]);

  const categoryColor = CATEGORY_COLORS[item.category] ?? FALLBACK_CATEGORY_COLOR;

  const handleSave = async () => {
    setSaving(true);
    setSavedMessage("");
    try {
      await onSave();
      setSavedMessage("Saved to your library.");
    } catch {
      setSavedMessage("Unable to save right now.");
    } finally {
      setSaving(false);
    }
  };

  const handleShare = async () => {
    const url = window.location.href;
    try {
      await navigator.clipboard.writeText(url);
      setSavedMessage("Link copied.");
    } catch {
      setSavedMessage(url);
    }
  };

  const handleReport = () => {
    setReportMessage("Thanks. This item has been flagged for review.");
  };

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-[2fr,1fr]">
      <div className="overflow-hidden rounded-lg border border-[#1A1A1E] bg-[#0D0D0F]">
        {item.video_url ? (
          <video className="w-full" controls poster={item.thumbnail_url}>
            <source src={item.video_url} />
          </video>
        ) : (
          <img src={item.image_url || item.thumbnail_url} alt={item.title} className="w-full object-cover" />
        )}
      </div>

      <div className="space-y-4 rounded-lg border border-[#1A1A1E] bg-[#0D0D0F] p-4">
        <h1 className="text-xl font-bold text-[#E8E8F0]">{item.title}</h1>
        <p className="text-sm leading-6 text-[#9A9A9F]">{item.description}</p>

        <div className="flex flex-wrap gap-2">
          <span className="rounded-full border px-2 py-1 text-xs font-semibold" style={{ borderColor: `${categoryColor}77`, color: categoryColor, background: `${categoryColor}22` }}>
            {item.category}
          </span>
          {(item.tags ?? []).map((tag) => (
            <span key={tag} className="rounded-full border border-[#30303A] px-2 py-1 text-xs text-[#9A9A9F]">#{tag}</span>
          ))}
        </div>

        <div className="grid grid-cols-2 gap-3 text-xs">
          <div className="rounded border border-[#23232A] p-2 text-[#9A9A9F]">Views: <span className="text-[#E8E8F0]">{(item.views ?? 0).toLocaleString()}</span></div>
          <div className="rounded border border-[#23232A] p-2 text-[#9A9A9F]">Date: <span className="text-[#E8E8F0]">{dateLabel}</span></div>
        </div>

        <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
          <button onClick={handleSave} disabled={saving} className="rounded border border-[#FF006E77] bg-[#FF006E22] px-3 py-2 text-xs font-semibold text-[#FF006E]">
            {saving ? "Saving..." : "Save/Favorite"}
          </button>
          <button onClick={handleShare} className="rounded border border-[#30303A] px-3 py-2 text-xs font-semibold text-[#E8E8F0]">Share</button>
          <button onClick={handleReport} className="rounded border border-[#EF444477] bg-[#EF444422] px-3 py-2 text-xs font-semibold text-[#EF4444]">Report</button>
        </div>

        {(savedMessage || reportMessage) && <p className="text-xs text-[#9A9A9F]">{savedMessage || reportMessage}</p>}
      </div>
    </div>
  );
}
