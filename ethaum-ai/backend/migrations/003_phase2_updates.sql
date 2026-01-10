-- EthAum AI - Phase 2 Schema Updates
-- Run this in Supabase SQL Editor

-- Add description column to products table
ALTER TABLE products ADD COLUMN IF NOT EXISTS description TEXT;

-- Add tagline column for Product Hunt style launches
ALTER TABLE products ADD COLUMN IF NOT EXISTS tagline VARCHAR(200);

-- Make sure products table has user_id foreign key (already added in migration 002)
-- This is just a check to ensure it exists
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'products' AND column_name = 'user_id'
    ) THEN
        ALTER TABLE products ADD COLUMN user_id UUID REFERENCES users(id);
    END IF;
END $$;

-- Add reviewer_name to reviews table if not exists
ALTER TABLE reviews ADD COLUMN IF NOT EXISTS reviewer_name VARCHAR(255) DEFAULT 'Anonymous';

-- Add user_id to reviews table for linking reviews to users
ALTER TABLE reviews ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES users(id);

-- Create index for faster user product lookups
CREATE INDEX IF NOT EXISTS idx_products_user_id ON products(user_id);
CREATE INDEX IF NOT EXISTS idx_reviews_user_id ON reviews(user_id);
