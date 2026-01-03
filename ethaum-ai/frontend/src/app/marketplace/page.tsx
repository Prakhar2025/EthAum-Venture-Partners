"use client";

import { useEffect, useState } from "react";
import { getProducts, getLeaderboard, Product, Launch } from "@/lib/api";
import { ProductCard } from "@/components/ProductCard";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";

export default function MarketplacePage() {
    const [products, setProducts] = useState<Product[]>([]);
    const [leaderboard, setLeaderboard] = useState<Launch[]>([]);
    const [search, setSearch] = useState("");
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchData() {
            try {
                const [productsData, leaderboardData] = await Promise.all([
                    getProducts(),
                    getLeaderboard(),
                ]);
                setProducts(productsData);
                setLeaderboard(leaderboardData);
            } catch (error) {
                console.error("Failed to fetch data:", error);
                // Use fallback data for demo
                setProducts([
                    { id: 1, name: "NeuraTech", website: "https://neuratech.ai", category: "AI/ML", funding_stage: "Series A", trust_score: 92 },
                    { id: 2, name: "CloudSync", website: "https://cloudsync.io", category: "DevOps", funding_stage: "Series B", trust_score: 87 },
                    { id: 3, name: "FinLedger", website: "https://finledger.com", category: "FinTech", funding_stage: "Series A", trust_score: 78 },
                ]);
            } finally {
                setLoading(false);
            }
        }
        fetchData();
    }, []);

    const getUpvotes = (productId: number) => {
        const launch = leaderboard.find((l) => l.product_id === productId);
        return launch?.upvotes;
    };

    const filteredProducts = products.filter((p) =>
        p.name.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div className="container mx-auto px-4 py-12">
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900">Marketplace</h1>
                <p className="mt-2 text-gray-600">
                    Discover high-trust startups verified by AI credibility scoring.
                </p>
            </div>

            {/* Search */}
            <div className="relative mb-8 max-w-md">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                <Input
                    placeholder="Search startups..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="pl-10"
                />
            </div>

            {/* Products Grid */}
            {loading ? (
                <div className="text-center text-gray-500">Loading...</div>
            ) : (
                <div className="space-y-4">
                    {filteredProducts.map((product) => (
                        <ProductCard
                            key={product.id}
                            id={product.id}
                            name={product.name}
                            category={product.category}
                            trustScore={product.trust_score}
                            upvotes={getUpvotes(product.id)}
                        />
                    ))}
                </div>
            )}

            {filteredProducts.length === 0 && !loading && (
                <div className="text-center text-gray-500">No startups found.</div>
            )}
        </div>
    );
}
