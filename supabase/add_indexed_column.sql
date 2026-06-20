-- Migration script to add 'is_indexed' column to seo_scores table
ALTER TABLE public.seo_scores ADD COLUMN IF NOT EXISTS is_indexed BOOLEAN NOT NULL DEFAULT false;
