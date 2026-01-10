"use client";

import { useEffect, useState } from "react";
import { useUser } from "@clerk/nextjs";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Plus, ExternalLink, Edit, TrendingUp, Eye } from "lucide-react";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

interface Product {
    id: number;
    name: string;
    website: string;
    category: string;
    funding_stage: string;
    trust_score: number;
    description?: string;
}

export default function MyProductsPage() {
    const { user, isLoaded } = useUser();
    const [products, setProducts] = useState<Product[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        if (user) {
            fetchMyProducts();
        }
    }, [user]);

    const fetchMyProducts = async () => {
        if (!user) return;

        try {
            const response = await fetch(`${API_BASE}/api/v1/products/my-products`, {
                headers: {
                    "X-Clerk-User-Id": user.id,
                },
            });
            const data = await response.json();
            setProducts(data);
        } catch (error) {
            console.error("Failed to fetch products:", error);
        } finally {
            setIsLoading(false);
        }
    };

    if (!isLoaded || isLoading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-violet-600"></div>
            </div>
        );
    }

    if (!user) {
        return (
            <div className="container mx-auto px-4 py-16 text-center">
                <h1 className="text-2xl font-bold mb-4">Sign In Required</h1>
                <p className="text-gray-600 mb-8">You need to sign in to view your products.</p>
                <Link href="/">
                    <Button>Go to Homepage</Button>
                </Link>
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">My Products</h1>
                    <p className="text-gray-600 mt-1">Manage your submitted startups</p>
                </div>
                <Link href="/submit">
                    <Button className="bg-violet-600 hover:bg-violet-700">
                        <Plus className="h-4 w-4 mr-2" />
                        Submit New Startup
                    </Button>
                </Link>
            </div>

            {products.length === 0 ? (
                <Card className="text-center py-16">
                    <CardContent>
                        <div className="flex justify-center mb-4">
                            <div className="h-16 w-16 rounded-full bg-violet-100 flex items-center justify-center">
                                <Plus className="h-8 w-8 text-violet-600" />
                            </div>
                        </div>
                        <h2 className="text-xl font-semibold mb-2">No Products Yet</h2>
                        <p className="text-gray-600 mb-6">Submit your first startup to get started</p>
                        <Link href="/submit">
                            <Button className="bg-violet-600 hover:bg-violet-700">
                                Submit Your First Startup
                            </Button>
                        </Link>
                    </CardContent>
                </Card>
            ) : (
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {products.map((product) => (
                        <Card key={product.id} className="hover:shadow-lg transition-shadow">
                            <CardHeader>
                                <div className="flex items-start justify-between">
                                    <div>
                                        <CardTitle className="text-lg">{product.name}</CardTitle>
                                        <div className="flex items-center gap-2 mt-2">
                                            <Badge variant="outline">{product.category}</Badge>
                                            <Badge variant="secondary">{product.funding_stage}</Badge>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-1 bg-violet-100 px-2 py-1 rounded-lg">
                                        <TrendingUp className="h-3 w-3 text-violet-600" />
                                        <span className="text-sm font-semibold text-violet-600">
                                            {product.trust_score}
                                        </span>
                                    </div>
                                </div>
                            </CardHeader>
                            <CardContent>
                                {product.description && (
                                    <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                                        {product.description}
                                    </p>
                                )}
                                <div className="flex items-center gap-2">
                                    <Link href={`/product/${product.id}`} className="flex-1">
                                        <Button variant="outline" size="sm" className="w-full">
                                            <Eye className="h-4 w-4 mr-1" />
                                            View
                                        </Button>
                                    </Link>
                                    <a
                                        href={product.website}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="flex-1"
                                    >
                                        <Button variant="outline" size="sm" className="w-full">
                                            <ExternalLink className="h-4 w-4 mr-1" />
                                            Website
                                        </Button>
                                    </a>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    );
}
