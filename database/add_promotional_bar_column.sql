-- Add promotional_bar column to homepage_settings
-- Run this once in Supabase SQL Editor, then re-run the enable script.

ALTER TABLE homepage_settings
  ADD COLUMN IF NOT EXISTS promotional_bar jsonb;

-- Immediately enable the promo bar on the existing row
UPDATE homepage_settings
SET promotional_bar = '{
  "enabled": true,
  "text": "Free shipping on orders above Rs.999 · Use code ARTFREE",
  "linkText": "Shop Now",
  "link": "/browse",
  "bgColor": "#111827",
  "textColor": "#ffffff",
  "dismissible": true
}'::jsonb
WHERE id = (SELECT id FROM homepage_settings ORDER BY created_at DESC LIMIT 1);

-- Verify
SELECT id, promotional_bar FROM homepage_settings ORDER BY created_at DESC LIMIT 1;