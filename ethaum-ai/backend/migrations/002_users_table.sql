-- EthAum AI - Users Table Migration
-- Run this in Supabase SQL Editor

-- Users table to store user profiles with roles
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    clerk_id VARCHAR(255) UNIQUE NOT NULL,
    email VARCHAR(255) NOT NULL,
    full_name VARCHAR(255),
    avatar_url TEXT,
    role VARCHAR(50) DEFAULT 'buyer' CHECK (role IN ('founder', 'buyer', 'admin')),
    company_name VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_users_clerk_id ON users(clerk_id);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);

-- Add user_id foreign key to existing tables
ALTER TABLE products ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES users(id);
ALTER TABLE reviews ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES users(id);
ALTER TABLE pilot_requests ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES users(id);

-- Enable Row Level Security
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Policy: Users can read all users (for public profiles)
CREATE POLICY "Users are viewable by everyone" ON users
    FOR SELECT USING (true);

-- Policy: Users can update their own profile
CREATE POLICY "Users can update own profile" ON users
    FOR UPDATE USING (clerk_id = current_setting('request.jwt.claims', true)::json->>'sub');

-- Policy: Allow insert for new users
CREATE POLICY "Allow insert for authenticated users" ON users
    FOR INSERT WITH CHECK (true);
