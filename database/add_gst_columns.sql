-- Migration: Add GST columns to orders and order_items
-- Adds columns to store inclusive GST breakdown details.

ALTER TABLE orders ADD COLUMN IF NOT EXISTS gst_amount DECIMAL(10, 2) DEFAULT 0.0;
ALTER TABLE order_items ADD COLUMN IF NOT EXISTS gst_amount DECIMAL(10, 2) DEFAULT 0.0;
ALTER TABLE order_items ADD COLUMN IF NOT EXISTS gst_rate DECIMAL(5, 2) DEFAULT 0.0;
