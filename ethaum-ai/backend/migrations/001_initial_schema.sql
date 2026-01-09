-- EthAum AI Database Schema
-- Run this in Supabase SQL Editor (https://supabase.com/dashboard/project/tggbjxhzchfammmwnaqn/sql)

-- Products/Startups table
CREATE TABLE IF NOT EXISTS products (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    website VARCHAR(500),
    category VARCHAR(100),
    funding_stage VARCHAR(50),
    description TEXT,
    trust_score INTEGER DEFAULT 0,
    data_integrity INTEGER DEFAULT 0,
    market_traction INTEGER DEFAULT 0,
    user_sentiment INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Reviews table
CREATE TABLE IF NOT EXISTS reviews (
    id SERIAL PRIMARY KEY,
    product_id INTEGER REFERENCES products(id) ON DELETE CASCADE,
    rating INTEGER CHECK (rating >= 1 AND rating <= 5),
    comment TEXT,
    reviewer_name VARCHAR(255),
    sentiment_score DECIMAL(3,2) DEFAULT 0.5,
    verified BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Launches table
CREATE TABLE IF NOT EXISTS launches (
    id SERIAL PRIMARY KEY,
    product_id INTEGER REFERENCES products(id) ON DELETE CASCADE,
    upvotes INTEGER DEFAULT 0,
    rank INTEGER DEFAULT 0,
    launch_date DATE DEFAULT CURRENT_DATE,
    is_featured BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Deals table
CREATE TABLE IF NOT EXISTS deals (
    id SERIAL PRIMARY KEY,
    product_id INTEGER REFERENCES products(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    trial_days INTEGER DEFAULT 30,
    discount_percent INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Pilot Requests table
CREATE TABLE IF NOT EXISTS pilot_requests (
    id SERIAL PRIMARY KEY,
    deal_id INTEGER REFERENCES deals(id) ON DELETE CASCADE,
    company_name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    message TEXT,
    status VARCHAR(50) DEFAULT 'pending',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert sample data (same as current in-memory data)
INSERT INTO products (name, website, category, funding_stage, trust_score, data_integrity, market_traction, user_sentiment) VALUES
('NeuraTech', 'https://neuratech.ai', 'AI/ML', 'Series A', 92, 95, 90, 88),
('CloudSync', 'https://cloudsync.io', 'DevOps', 'Series B', 87, 90, 85, 82),
('FinLedger', 'https://finledger.com', 'FinTech', 'Series A', 78, 80, 75, 78);

-- Insert sample launches
INSERT INTO launches (product_id, upvotes, rank, is_featured) VALUES
(1, 33, 1, TRUE),
(2, 43, 2, TRUE),
(3, 53, 3, FALSE);

-- Insert sample deals
INSERT INTO deals (product_id, title, description, trial_days, discount_percent) VALUES
(1, 'NeuraTech Enterprise Pilot', 'Try our AI platform for 30 days', 30, 20),
(2, 'CloudSync DevOps Trial', 'Full access to DevOps suite', 45, 15),
(3, 'FinLedger FinTech POC', 'Proof of concept for financial services', 60, 25);

-- Insert sample reviews
INSERT INTO reviews (product_id, rating, comment, reviewer_name, sentiment_score, verified) VALUES
(1, 5, 'Excellent AI capabilities, transformed our workflow!', 'John D.', 0.92, TRUE),
(1, 4, 'Great product, minor learning curve', 'Sarah M.', 0.78, TRUE),
(2, 5, 'Best DevOps tool we have used', 'Mike T.', 0.95, TRUE),
(2, 4, 'Solid integration options', 'Lisa K.', 0.80, FALSE),
(3, 4, 'Good for financial tracking', 'David R.', 0.75, TRUE);

-- Enable Row Level Security (optional for now)
-- ALTER TABLE products ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE launches ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE deals ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE pilot_requests ENABLE ROW LEVEL SECURITY;
