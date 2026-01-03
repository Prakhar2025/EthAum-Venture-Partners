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
