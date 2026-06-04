-- Add order fields to reviews table
-- This migration adds support for order-item based reviews

-- Add order_id column to reviews table
ALTER TABLE reviews 
ADD COLUMN IF NOT EXISTS order_id TEXT;

-- Add order_item_id column to reviews table
ALTER TABLE reviews 
ADD COLUMN IF NOT EXISTS order_item_id TEXT;

-- Add indexes for better performance when querying reviews by order
CREATE INDEX IF NOT EXISTS idx_reviews_order_id ON reviews(order_id);
CREATE INDEX IF NOT EXISTS idx_reviews_order_item_id ON reviews(order_item_id);

-- Add comments to document the new fields
COMMENT ON COLUMN reviews.order_id IS 'ID of the order this review is for';
COMMENT ON COLUMN reviews.order_item_id IS 'ID of the specific order item this review is for';
