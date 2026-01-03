"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { getProduct, getReviews, Product, Review } from "@/lib/api";
import { TrustScoreBadge } from "@/components/TrustScoreBadge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowUp, ExternalLink, Star } from "lucide-react";

export default function ProductDetailPage() {
    const params = useParams();
    const productId = Number(params.id);

    const [product, setProduct] = useState<Product | null>(null);
    const [reviews, setReviews] = useState<Review[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchData() {
            try {
                const [productData, reviewsData] = await Promise.all([
                    getProduct(productId),
                    getReviews(productId),
                ]);
                setProduct(productData);
                setReviews(reviewsData);
            } catch (error) {
                console.error("Failed to fetch:", error);
                // Fallback data
                setProduct({
                    id: productId,
                    name: "NeuraTech",
                    website: "https://neuratech.ai",
                    category: "AI/ML",
                    funding_stage: "Series A",
                    trust_score: 82,
                    score_breakdown: {
                        data_integrity: 100,
                        market_traction: 60,
                        user_sentiment: 80,
                    },
                    launch: {
                        is_launched: true,
                        upvotes: 23,
                        rank: 4,
                    },
                });
            } finally {
                setLoading(false);
            }
        }
        fetchData();
    }, [productId]);

    if (loading) {
        return (
            <div className="container mx-auto px-4 py-12 text-center text-gray-500">
                Loading...
            </div>
        );
    }

    if (!product) {
        return (
            <div className="container mx-auto px-4 py-12 text-center text-gray-500">
                Product not found.
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 py-12">
            {/* Header */}
            <div className="mb-8 flex flex-col gap-6 md:flex-row md:items-start md:justify-between">
                <div className="flex items-start gap-4">
                    <div className="flex h-16 w-16 items-center justify-center rounded-xl bg-gradient-to-br from-violet-100 to-indigo-100 text-2xl font-bold text-violet-600">
                        {product.name.charAt(0)}
                    </div>
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">{product.name}</h1>
                        <div className="mt-2 flex items-center gap-2">
                            <Badge>{product.category}</Badge>
                            <Badge variant="outline">{product.funding_stage}</Badge>
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-4">
                    <TrustScoreBadge score={product.trust_score} size="lg" />
                    <Button asChild>
                        <a href={product.website} target="_blank" rel="noopener noreferrer">
                            Visit Website
                            <ExternalLink className="ml-2 h-4 w-4" />
                        </a>
                    </Button>
                </div>
            </div>

            <div className="grid gap-8 lg:grid-cols-3">
                {/* Main Content */}
                <div className="lg:col-span-2 space-y-8">
                    {/* Score Breakdown */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Trust Score Breakdown</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                {product.score_breakdown && (
                                    <>
                                        <ScoreBar
                                            label="Data Integrity"
                                            value={product.score_breakdown.data_integrity}
                                            color="bg-emerald-500"
                                        />
                                        <ScoreBar
                                            label="Market Traction"
                                            value={product.score_breakdown.market_traction}
                                            color="bg-blue-500"
                                        />
                                        <ScoreBar
                                            label="User Sentiment"
                                            value={product.score_breakdown.user_sentiment}
                                            color="bg-violet-500"
                                        />
                                    </>
                                )}
                            </div>
                        </CardContent>
                    </Card>

                    {/* Reviews */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Reviews</CardTitle>
                        </CardHeader>
                        <CardContent>
                            {reviews.length > 0 ? (
                                <div className="space-y-4">
                                    {reviews.map((review) => (
                                        <div
                                            key={review.id}
                                            className="border-b pb-4 last:border-0"
                                        >
                                            <div className="flex items-center gap-2">
                                                {[...Array(5)].map((_, i) => (
                                                    <Star
                                                        key={i}
                                                        className={`h-4 w-4 ${i < review.rating
                                                                ? "fill-amber-400 text-amber-400"
                                                                : "text-gray-200"
                                                            }`}
                                                    />
                                                ))}
                                                <span className="text-sm text-gray-500">
                                                    Sentiment: {review.sentiment_score}
                                                </span>
                                            </div>
                                            <p className="mt-2 text-gray-600">{review.comment}</p>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-gray-500">No reviews yet.</p>
                            )}
                        </CardContent>
                    </Card>
                </div>

                {/* Sidebar */}
                <div className="space-y-6">
                    {/* Launch Stats */}
                    {product.launch && (
                        <Card>
                            <CardHeader>
                                <CardTitle>Launch Stats</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <ArrowUp className="h-5 w-5 text-orange-500" />
                                        <span className="text-2xl font-bold">
                                            {product.launch.upvotes}
                                        </span>
                                        <span className="text-gray-500">upvotes</span>
                                    </div>
                                    <Badge variant="secondary">Rank #{product.launch.rank}</Badge>
                                </div>
                            </CardContent>
                        </Card>
                    )}

                    {/* Credibility Badge */}
                    <Card className="bg-gradient-to-br from-violet-50 to-indigo-50">
                        <CardContent className="p-6 text-center">
                            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-white shadow-lg">
                                <span className="text-2xl font-bold text-violet-600">
                                    {product.trust_score}
                                </span>
                            </div>
                            <h3 className="mt-4 font-semibold text-gray-900">
                                EthAum Verified
                            </h3>
                            <p className="mt-1 text-sm text-gray-600">
                                This startup has been verified by our AI credibility system.
                            </p>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}

function ScoreBar({
    label,
    value,
    color,
}: {
    label: string;
    value: number;
    color: string;
}) {
    return (
        <div>
            <div className="mb-1 flex justify-between text-sm">
                <span className="text-gray-600">{label}</span>
                <span className="font-medium text-gray-900">{value}</span>
            </div>
            <div className="h-2 w-full overflow-hidden rounded-full bg-gray-100">
                <div
                    className={`h-full rounded-full ${color}`}
                    style={{ width: `${value}%` }}
                />
            </div>
        </div>
    );
}
