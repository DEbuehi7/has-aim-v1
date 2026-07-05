export const AURA8_CATEGORIES = [
  "Fantasy",
  "Modern",
  "Romantic",
  "MILF",
  "Teen",
  "Asian",
  "Latina",
  "Blonde",
  "Ebony",
  "Redhead",
  "Skinny",
  "Thick",
  "Busty",
  "Submissive",
  "Dominant",
  "Athletic",
  "Caring",
  "Virgin",
  "College Student",
] as const;

export const AURA8_SORT_OPTIONS = ["newest", "trending", "most_viewed"] as const;

export type Aura8Sort = (typeof AURA8_SORT_OPTIONS)[number];

export interface Aura8ContentItem {
  id: string;
  title: string;
  description: string;
  image_url: string;
  video_url: string | null;
  thumbnail_url: string;
  category: string;
  tags: string[];
  views: number;
  created_at: string;
  updated_at: string;
}

export const CATEGORY_COLORS: Record<string, string> = {
  Fantasy: "#FF006E",
  Modern: "#4CC9F0",
  Romantic: "#FF5E78",
  MILF: "#F59E0B",
  Teen: "#84CC16",
  Asian: "#06B6D4",
  Latina: "#F97316",
  Blonde: "#EAB308",
  Ebony: "#8B5CF6",
  Redhead: "#EF4444",
  Skinny: "#22C55E",
  Thick: "#F43F5E",
  Busty: "#EC4899",
  Submissive: "#A855F7",
  Dominant: "#3B82F6",
  Athletic: "#14B8A6",
  Caring: "#10B981",
  Virgin: "#6366F1",
  "College Student": "#F472B6",
};

export const FALLBACK_CATEGORY_COLOR = "#9A9A9F";
