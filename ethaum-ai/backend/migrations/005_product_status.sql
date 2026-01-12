-- Phase 4: Add product status for moderation
-- Run this in Supabase SQL Editor

-- Add status column to products
ALTER TABLE products 
ADD COLUMN IF NOT EXISTS status VARCHAR(20) DEFAULT 'approved';

-- Add index for faster queries
CREATE INDEX IF NOT EXISTS idx_products_status ON products(status);

-- Update existing products to approved (so they show in marketplace)
UPDATE products SET status = 'approved' WHERE status IS NULL;

-- Comment
COMMENT ON COLUMN products.status IS 'Product moderation status: pending, approved, rejected';
