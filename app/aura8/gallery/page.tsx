"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import ContentGate from "@/app/components/content-gate";
import ContentGrid from "@/app/components/aura8/ContentGrid";
import SearchFilterBar from "@/app/components/aura8/SearchFilterBar";
import CategoryTabs from "@/app/components/aura8/CategoryTabs";
import { AURA8_CATEGORIES, type Aura8ContentItem, type Aura8Sort } from "@/lib/aura8/gallery";

interface ListResponse {
  items: Aura8ContentItem[];
  page: number;
  limit: number;
  total: number;
  hasMore: boolean;
}

function GalleryContent() {
  const [query, setQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [sort, setSort] = useState<Aura8Sort>("newest");
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [items, setItems] = useState<Aura8ContentItem[]>([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const timeout = setTimeout(() => setDebouncedQuery(query.trim()), 250);
    return () => clearTimeout(timeout);
  }, [query]);

  const filterKey = useMemo(() => `${debouncedQuery}__${sort}__${selectedCategories.join("|")}`, [debouncedQuery, sort, selectedCategories]);

  useEffect(() => {
    setPage(1);
  }, [filterKey]);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setError("");
      if (page === 1) {
        setLoading(true);
      } else {
        setLoadingMore(true);
      }

      const params = new URLSearchParams({ page: String(page), limit: "12", sort });
      if (debouncedQuery) params.set("search", debouncedQuery);
      if (selectedCategories.length) params.set("categories", selectedCategories.join(","));

      try {
        const res = await fetch(`/api/aura8/content/list?${params.toString()}`, { credentials: "include" });
        if (!res.ok) throw new Error("Failed to fetch gallery");
        const data = (await res.json()) as ListResponse;

        if (!cancelled) {
          setItems((prev) => (page === 1 ? data.items : [...prev, ...data.items]));
          setHasMore(Boolean(data.hasMore));
        }
      } catch {
        if (!cancelled) setError("Unable to load gallery right now.");
      } finally {
        if (!cancelled) {
          setLoading(false);
          setLoadingMore(false);
        }
      }
    }

    load();

    return () => {
      cancelled = true;
    };
  }, [debouncedQuery, selectedCategories, sort, page]);

  const toggleCategory = (category: string) => {
    setSelectedCategories((prev) => (prev.includes(category) ? prev.filter((c) => c !== category) : [...prev, category]));
  };

  return (
    <div className="min-h-screen bg-[#060608] px-4 py-6 text-[#E8E8F0] md:px-8">
      <div className="mx-auto w-full max-w-7xl space-y-4">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">Aura8 Gallery</h1>
          <Link href="/aura8" className="text-sm text-[#FF006E]">Back to Aura8</Link>
        </div>

        <SearchFilterBar
          search={query}
          onSearchChange={setQuery}
          sort={sort}
          onSortChange={setSort}
          activeCategories={selectedCategories}
          onRemoveCategory={(category) => setSelectedCategories((prev) => prev.filter((c) => c !== category))}
          onClearSearch={() => setQuery("")}
        />

        <CategoryTabs categories={AURA8_CATEGORIES} selected={selectedCategories} onToggle={toggleCategory} />

        {error ? <div className="rounded border border-[#EF444444] bg-[#220B12] p-3 text-sm text-[#FCA5A5]">{error}</div> : null}

        <ContentGrid items={items} loading={loading} loadingMore={loadingMore} emptyMessage="No matches yet. Try removing filters." />

        {hasMore && (
          <div className="flex justify-center pt-2">
            <button
              onClick={() => setPage((p) => p + 1)}
              disabled={loadingMore}
              className="rounded-md border border-[#FF006E66] bg-[#FF006E22] px-4 py-2 text-sm font-semibold text-[#FF006E]"
            >
              {loadingMore ? "Loading..." : "Load More"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default function Aura8GalleryPage() {
  return (
    <ContentGate>
      <GalleryContent />
    </ContentGate>
  );
}
