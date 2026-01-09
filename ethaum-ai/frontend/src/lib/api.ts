const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export interface Product {
    id: number;
    name: string;
    website: string;
    category: string;
    funding_stage: string;
    trust_score: number;
    score_breakdown?: {
        data_integrity: number;
        market_traction: number;
        user_sentiment: number;
    };
    launch?: {
        is_launched: boolean;
        upvotes: number;
        rank: number;
    };
}

export interface Launch {
    id: number;
    product_id: number;
    tagline: string;
    upvotes: number;
}

export interface Review {
    id: number;
    product_id: number;
    rating: number;
    comment: string;
    sentiment_score: number;
}

export interface QuadrantData {
    id: number;
    name: string;
    x: number;
    y: number;
    quadrant: string;
}

// Products
export async function getProducts(): Promise<Product[]> {
    const res = await fetch(`${API_BASE}/api/v1/products`);
    return res.json();
}

export async function getProduct(id: number): Promise<Product> {
    const res = await fetch(`${API_BASE}/api/v1/products/${id}`);
    return res.json();
}

// Launches
export async function getLeaderboard(): Promise<Launch[]> {
    const res = await fetch(`${API_BASE}/api/v1/launches/leaderboard`);
    return res.json();
}

export async function createLaunch(data: {
    product_id: number;
    tagline: string;
    description: string;
}): Promise<Launch> {
    const res = await fetch(`${API_BASE}/api/v1/launches`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
    });
    return res.json();
}

// Reviews
export async function getReviews(productId: number): Promise<Review[]> {
    const res = await fetch(`${API_BASE}/api/v1/reviews/${productId}`);
    return res.json();
}

export async function createReview(data: {
    product_id: number;
    rating: number;
    comment: string;
}): Promise<Review> {
    const res = await fetch(`${API_BASE}/api/v1/reviews`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
    });
    return res.json();
}

// Insights
export async function getQuadrantData(): Promise<QuadrantData[]> {
    try {
        const res = await fetch(`${API_BASE}/api/v1/insights/quadrant`);
        if (!res.ok) {
            throw new Error("Failed to fetch");
        }
        const json = await res.json();
        // Backend returns { products: [...] } - extract and transform
        if (json.products && Array.isArray(json.products)) {
            return json.products.map((p: { product: { id: number; name: string }; quadrant: string; coordinates: { x: number; y: number } }) => ({
                id: p.product.id,
                name: p.product.name,
                x: p.coordinates.x,
                y: p.coordinates.y,
                quadrant: p.quadrant,
            }));
        }
        return json;
    } catch {
        // Return mock data if endpoint not available
        return [
            { id: 1, name: "NeuraTech", x: 85, y: 90, quadrant: "Leaders" },
            { id: 2, name: "CloudSync", x: 75, y: 60, quadrant: "Challengers" },
            { id: 3, name: "FinLedger", x: 40, y: 80, quadrant: "Visionaries" },
            { id: 4, name: "DataPipe", x: 30, y: 35, quadrant: "Niche Players" },
        ];
    }
}

// Deals (AppSumo-Style)
export interface Deal {
    id: number;
    product_id: number;
    startup_name: string;
    pilot_title: string;
    description: string;
    ideal_buyer: string;
    credibility_score: number;
    pilot_duration: string;
    status: string;
}

export interface PilotRequestResponse {
    success: boolean;
    message: string;
    deal_id: number;
    company_name: string;
}

export async function getDeals(): Promise<Deal[]> {
    try {
        const res = await fetch(`${API_BASE}/api/v1/deals`);
        return res.json();
    } catch {
        return [];
    }
}

export async function requestPilot(data: {
    deal_id: number;
    company_name: string;
    contact_email: string;
}): Promise<PilotRequestResponse> {
    const res = await fetch(`${API_BASE}/api/v1/deals/request`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
    });
    return res.json();
}

// AI Matchmaking
export interface BuyerMatch {
    buyer_type: string;
    buyer_description: string;
    match_score: number;
    reasons: string[];
    recommendation: string;
}

export interface MatchmakingResult {
    startup: {
        id: number;
        name: string;
        category: string;
        trust_score: number;
    };
    ai_matchmaking: {
        algorithm: string;
        factors: string[];
    };
    recommended_buyers: BuyerMatch[];
    total_matches: number;
}

export async function getBuyerMatches(productId: number): Promise<MatchmakingResult | null> {
    try {
        const res = await fetch(`${API_BASE}/api/v1/matchmaking/${productId}`);
        if (!res.ok) return null;
        return res.json();
    } catch {
        return null;
    }
}

// Comparisons (G2-Style)
export interface ComparisonData {
    comparison: {
        startup_1: StartupMetrics;
        startup_2: StartupMetrics;
    };
    metrics_comparison: Record<string, { winner: string; values: Record<string, number>; unit?: string }>;
    recommendation: string;
}

export interface StartupMetrics {
    id: number;
    name: string;
    category: string;
    trust_score: number;
    pricing_tier: string;
    avg_implementation_days: number;
    roi_percentage: number;
    integration_count: number;
    support_sla: string;
    security_certifications: string[];
    key_features: string[];
    ideal_for: string;
}

export async function getComparisonStartups(): Promise<{ startups: { id: number; name: string; category: string; trust_score: number }[] }> {
    try {
        const res = await fetch(`${API_BASE}/api/v1/comparisons`);
        return res.json();
    } catch {
        return { startups: [] };
    }
}

export async function compareStartups(id1: number, id2: number): Promise<ComparisonData | null> {
    try {
        const res = await fetch(`${API_BASE}/api/v1/comparisons/${id1}/vs/${id2}`);
        if (!res.ok) return null;
        return res.json();
    } catch {
        return null;
    }
}

// Embeddable Badges
export interface BadgeData {
    product: { id: number; name: string; trust_score: number };
    badge: { level: string; verified: boolean; issued_date: string; valid_until: string };
    embed_codes: { html: string; markdown: string; react: string };
    preview_url: string;
}

export async function getBadgeData(productId: number): Promise<BadgeData | null> {
    try {
        const res = await fetch(`${API_BASE}/api/v1/badges/${productId}`);
        if (!res.ok) return null;
        return res.json();
    } catch {
        return null;
    }
}

// AI Launch Templates
export interface LaunchTemplateResult {
    input: { startup_name: string; category: string };
    ai_generated: {
        taglines: string[];
        descriptions: string[];
        timing: { day: string; time: string; reason: string };
        recommended_assets: string[];
        launch_tips: string[];
    };
    ai_confidence: number;
}

export async function generateLaunchTemplate(data: {
    startup_name: string;
    category: string;
    one_liner: string;
    target_audience?: string;
}): Promise<LaunchTemplateResult | null> {
    try {
        const res = await fetch(`${API_BASE}/api/v1/templates/generate`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(data),
        });
        return res.json();
    } catch {
        return null;
    }
}

export async function getSchedulingRecommendations(): Promise<Record<string, unknown> | null> {
    try {
        const res = await fetch(`${API_BASE}/api/v1/templates/scheduling`);
        return res.json();
    } catch {
        return null;
    }
}

// Analytics
export interface AnalyticsDashboard {
    overview: {
        total_startups: number;
        total_launches_this_week: number;
        total_upvotes_this_week: number;
        total_enterprise_pilots: number;
        average_trust_score: number;
    };
    trending_categories: { name: string; growth: number; startups: number }[];
    top_performers: { name: string; trust_score: number; upvotes: number; pilots_requested: number }[];
    funding_distribution: Record<string, { count: number; percentage: number }>;
}

export async function getAnalyticsDashboard(): Promise<AnalyticsDashboard | null> {
    try {
        const res = await fetch(`${API_BASE}/api/v1/analytics/dashboard`);
        return res.json();
    } catch {
        return null;
    }
}

export async function getTrends(): Promise<Record<string, unknown> | null> {
    try {
        const res = await fetch(`${API_BASE}/api/v1/analytics/trends`);
        return res.json();
    } catch {
        return null;
    }
}

// ========== USER MANAGEMENT ==========

export type UserRole = 'founder' | 'buyer' | 'admin';

export interface User {
    id: string;
    clerk_id: string;
    email: string;
    full_name: string | null;
    avatar_url: string | null;
    role: UserRole;
    company_name: string | null;
}

export interface UserSync {
    clerk_id: string;
    email: string;
    full_name?: string;
    avatar_url?: string;
    role?: UserRole;
    company_name?: string;
}

export async function syncUser(userData: UserSync): Promise<User | null> {
    try {
        const res = await fetch(`${API_BASE}/api/v1/users/sync`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(userData),
        });
        return res.json();
    } catch {
        return null;
    }
}

export async function getCurrentUser(clerkUserId: string): Promise<User | null> {
    try {
        const res = await fetch(`${API_BASE}/api/v1/users/me`, {
            headers: { 'X-Clerk-User-Id': clerkUserId },
        });
        if (!res.ok) return null;
        return res.json();
    } catch {
        return null;
    }
}

export async function updateUserProfile(
    clerkUserId: string,
    data: { full_name?: string; company_name?: string }
): Promise<User | null> {
    try {
        const res = await fetch(`${API_BASE}/api/v1/users/me`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'X-Clerk-User-Id': clerkUserId,
            },
            body: JSON.stringify(data),
        });
        return res.json();
    } catch {
        return null;
    }
}
