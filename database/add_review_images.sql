-- Add images field to reviews table
-- This migration adds support for review images

-- Add images column to reviews table
ALTER TABLE reviews 
ADD COLUMN IF NOT EXISTS images TEXT[] DEFAULT '{}';

-- Add index for better performance when querying reviews with images
CREATE INDEX IF NOT EXISTS idx_reviews_images ON reviews USING GIN(images);

-- Add comment to document the new field
COMMENT ON COLUMN reviews.images IS 'Array of image URLs uploaded with the review';
