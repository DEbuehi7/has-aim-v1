-- Aura8 v1 Phase 2: content gallery schema + seed

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'aura8_content_category') THEN
    CREATE TYPE aura8_content_category AS ENUM (
      'Fantasy', 'Modern', 'Romantic',
      'MILF', 'Teen', 'Asian', 'Latina', 'Blonde', 'Ebony', 'Redhead',
      'Skinny', 'Thick', 'Busty',
      'Submissive', 'Dominant', 'Athletic', 'Caring', 'Virgin', 'College Student'
    );
  END IF;
END
$$;

CREATE TABLE IF NOT EXISTS aura8_content (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text NOT NULL,
  image_url text NOT NULL,
  video_url text,
  thumbnail_url text NOT NULL,
  category aura8_content_category NOT NULL,
  tags text[] NOT NULL DEFAULT '{}',
  views integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS aura8_user_library (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_email text NOT NULL REFERENCES aura8_subscribers(email) ON DELETE CASCADE,
  content_id uuid NOT NULL REFERENCES aura8_content(id) ON DELETE CASCADE,
  saved_at timestamptz NOT NULL DEFAULT now(),
  status text NOT NULL DEFAULT 'saved',
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_email, content_id)
);

CREATE INDEX IF NOT EXISTS idx_aura8_content_category ON aura8_content(category);
CREATE INDEX IF NOT EXISTS idx_aura8_content_views ON aura8_content(views DESC);
CREATE INDEX IF NOT EXISTS idx_aura8_content_created ON aura8_content(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_aura8_user_library_email ON aura8_user_library(user_email);

WITH categories AS (
  SELECT ARRAY[
    'Fantasy', 'Modern', 'Romantic',
    'MILF', 'Teen', 'Asian', 'Latina', 'Blonde', 'Ebony', 'Redhead',
    'Skinny', 'Thick', 'Busty',
    'Submissive', 'Dominant', 'Athletic', 'Caring', 'Virgin', 'College Student'
  ]::text[] AS items
), generated_seed AS (
  SELECT
    gs,
    (SELECT items[((gs - 1) % array_length(items, 1)) + 1] FROM categories) AS category
  FROM generate_series(1, 40) AS gs
)
INSERT INTO aura8_content (title, description, image_url, video_url, thumbnail_url, category, tags, views, created_at, updated_at)
SELECT
  'Aura8 Demo Scene #' || gs,
  'Placeholder Aura8 gallery content for category ' || category || '. Built for browsing, filtering, and playback.',
  'https://picsum.photos/seed/aura8-image-' || gs || '/1280/720',
  CASE WHEN gs % 3 = 0 THEN 'https://samplelib.com/lib/preview/mp4/sample-5s.mp4' ELSE NULL END,
  'https://picsum.photos/seed/aura8-thumb-' || gs || '/640/360',
  category::aura8_content_category,
  ARRAY[lower(replace(category, ' ', '-')), 'aura8', CASE WHEN gs % 2 = 0 THEN 'featured' ELSE 'new' END],
  (gs * 117) % 9800,
  now() - make_interval(days => gs),
  now() - make_interval(days => gs / 2)
FROM generated_seed
WHERE NOT EXISTS (SELECT 1 FROM aura8_content LIMIT 1);
