/*
  # Create bundles table for Niche Bundler

  1. New Tables
    - `bundles`
      - `id` (uuid, primary key) - Unique bundle identifier
      - `title` (text) - Bundle display name
      - `handle` (text, unique) - URL-friendly unique identifier
      - `products` (jsonb) - Array of product configurations with IDs, titles, prices
      - `discount_type` (text) - Type of discount: 'percentage' or 'fixed'
      - `discount_value` (numeric) - Discount amount
      - `shop_domain` (text) - Shopify shop domain this bundle belongs to
      - `active` (boolean, default true) - Whether bundle is active
      - `created_at` (timestamptz) - Creation timestamp
      - `updated_at` (timestamptz) - Last update timestamp

  2. Security
    - Enable RLS on `bundles` table
    - Add policy for public read access to active bundles
    - Add policy for authenticated access to manage bundles

  3. Indexes
    - Index on `shop_domain` for faster shop-specific queries
    - Index on `handle` for faster handle lookups
    - Index on `active` for filtering active bundles
*/

CREATE TABLE IF NOT EXISTS bundles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  handle text UNIQUE NOT NULL,
  products jsonb DEFAULT '[]'::jsonb,
  discount_type text NOT NULL CHECK (discount_type IN ('percentage', 'fixed')),
  discount_value numeric NOT NULL CHECK (discount_value >= 0),
  shop_domain text NOT NULL,
  active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE bundles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can view active bundles"
  ON bundles
  FOR SELECT
  USING (active = true);

CREATE POLICY "Authenticated users can manage bundles"
  ON bundles
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE INDEX IF NOT EXISTS bundles_shop_domain_idx ON bundles(shop_domain);
CREATE INDEX IF NOT EXISTS bundles_handle_idx ON bundles(handle);
CREATE INDEX IF NOT EXISTS bundles_active_idx ON bundles(active);
