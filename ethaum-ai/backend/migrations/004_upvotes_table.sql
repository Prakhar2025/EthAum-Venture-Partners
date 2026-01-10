-- EthAum AI - Upvotes Table for User Tracking
-- Run this in Supabase SQL Editor

-- Create upvotes table to track who voted for what
CREATE TABLE IF NOT EXISTS upvotes (
    id SERIAL PRIMARY KEY,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    product_id INTEGER REFERENCES products(id) ON DELETE CASCADE,
    launch_id INTEGER REFERENCES launches(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, product_id),
    UNIQUE(user_id, launch_id)
);

-- Create indexes for faster lookups
CREATE INDEX IF NOT EXISTS idx_upvotes_user_id ON upvotes(user_id);
CREATE INDEX IF NOT EXISTS idx_upvotes_product_id ON upvotes(product_id);
CREATE INDEX IF NOT EXISTS idx_upvotes_launch_id ON upvotes(launch_id);
