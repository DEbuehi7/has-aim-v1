"use client";

import { use, useEffect, useState } from "react";
import Link from "next/link";
import ContentGate from "@/app/components/content-gate";
import ContentPlayer from "@/app/components/aura8/ContentPlayer";
import RelatedContent from "@/app/components/aura8/RelatedContent";
import type { Aura8ContentItem } from "@/lib/aura8/gallery";

interface DetailResponse {
  item: Aura8ContentItem;
  related: Aura8ContentItem[];
}

function PlayerContent({ id }: { id: string }) {
  const [item, setItem] = useState<Aura8ContentItem | null>(null);
  const [related, setRelated] = useState<Aura8ContentItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);
      setError("");
      try {
        const res = await fetch(`/api/aura8/content/${id}`, { credentials: "include" });
        if (!res.ok) throw new Error("Not found");
        const data = (await res.json()) as DetailResponse;

        if (!cancelled) {
          setItem(data.item);
          setRelated(data.related || []);
        }

        await fetch(`/api/aura8/content/${id}/view`, {
          method: "POST",
          credentials: "include",
        });
      } catch {
        if (!cancelled) setError("Unable to load content.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();

    return () => {
      cancelled = true;
    };
  }, [id]);

  const handleSave = async () => {
    const res = await fetch("/api/aura8/user/library/save", {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ contentId: id, status: "saved" }),
    });

    if (!res.ok) {
      throw new Error("save-failed");
    }
  };

  return (
    <div className="min-h-screen bg-[#060608] px-4 py-6 text-[#E8E8F0] md:px-8">
      <div className="mx-auto w-full max-w-7xl">
        <div className="mb-4 flex items-center justify-between">
          <Link href="/aura8/gallery" className="text-sm text-[#FF006E]">← Back to Gallery</Link>
        </div>

        {loading && <div className="animate-pulse rounded-lg border border-[#1A1A1E] bg-[#0D0D0F] p-8" />}
        {error && <div className="rounded border border-[#EF444444] bg-[#220B12] p-3 text-sm text-[#FCA5A5]">{error}</div>}

        {!loading && item ? (
          <>
            <ContentPlayer item={item} onSave={handleSave} />
            <RelatedContent items={related} />
          </>
        ) : null}
      </div>
    </div>
  );
}

export default function Aura8GalleryPlayerPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);

  return (
    <ContentGate>
      <PlayerContent id={id} />
    </ContentGate>
  );
}
