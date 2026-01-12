"use client";

import { useEffect, useState } from "react";
import { useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
    Shield, Users, Package, Star, ArrowUp,
    CheckCircle, XCircle, Trash2, RefreshCw,
    AlertTriangle
} from "lucide-react";
import Link from "next/link";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

interface Stats {
    total_products: number;
    total_users: number;
    total_reviews: number;
    total_upvotes: number;
    pending_products: number;
}

interface Product {
    id: number;
    name: string;
    category: string;
    trust_score: number;
    status: string;
    created_at: string;
}

interface User {
    id: string;
    email: string;
    full_name: string;
    role: string;
    created_at: string;
}

interface Review {
    id: number;
    product_id: number;
    rating: number;
    comment: string;
    reviewer_name: string;
    sentiment_score: number;
    verified: boolean;
}

export default function AdminPage() {
    const { user, isLoaded } = useUser();
    const router = useRouter();
    const [stats, setStats] = useState<Stats | null>(null);
    const [products, setProducts] = useState<Product[]>([]);
    const [users, setUsers] = useState<User[]>([]);
    const [reviews, setReviews] = useState<Review[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [activeTab, setActiveTab] = useState<"products" | "users" | "reviews">("products");

    useEffect(() => {
        if (isLoaded && user) {
            fetchAdminData();
        }
    }, [isLoaded, user]);

    const fetchAdminData = async () => {
        if (!user) return;
        setLoading(true);
        setError(null);

        try {
            const headers = { "X-Clerk-User-Id": user.id };

            // Fetch all data in parallel
            const [statsRes, productsRes, usersRes, reviewsRes] = await Promise.all([
                fetch(`${API_BASE}/api/v1/admin/stats`, { headers }),
                fetch(`${API_BASE}/api/v1/admin/products`, { headers }),
                fetch(`${API_BASE}/api/v1/admin/users`, { headers }),
                fetch(`${API_BASE}/api/v1/admin/reviews`, { headers }),
            ]);

            if (!statsRes.ok) {
                const errData = await statsRes.json();
                throw new Error(errData.detail || "Access denied");
            }

            setStats(await statsRes.json());
            setProducts(await productsRes.json());
            setUsers(await usersRes.json());
            setReviews(await reviewsRes.json());
        } catch (err) {
            setError(err instanceof Error ? err.message : "Failed to load admin data");
        } finally {
            setLoading(false);
        }
    };

    const handleProductAction = async (productId: number, action: "approve" | "reject" | "delete") => {
        if (!user) return;

        try {
            const method = action === "delete" ? "DELETE" : "POST";
            const endpoint = action === "delete"
                ? `${API_BASE}/api/v1/admin/products/${productId}`
                : `${API_BASE}/api/v1/admin/products/${productId}/${action}`;

            const res = await fetch(endpoint, {
                method,
                headers: { "X-Clerk-User-Id": user.id },
            });

            if (res.ok) {
                fetchAdminData(); // Refresh data
            }
        } catch (err) {
            console.error("Action failed:", err);
        }
    };

    const handleDeleteReview = async (reviewId: number) => {
        if (!user) return;

        try {
            await fetch(`${API_BASE}/api/v1/admin/reviews/${reviewId}`, {
                method: "DELETE",
                headers: { "X-Clerk-User-Id": user.id },
            });
            fetchAdminData();
        } catch (err) {
            console.error("Delete failed:", err);
        }
    };

    const handleVerifyReview = async (reviewId: number) => {
        if (!user) return;

        try {
            await fetch(`${API_BASE}/api/v1/admin/reviews/${reviewId}/verify`, {
                method: "POST",
                headers: { "X-Clerk-User-Id": user.id },
            });
            fetchAdminData();
        } catch (err) {
            console.error("Verify failed:", err);
        }
    };

    if (!isLoaded) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-violet-600"></div>
            </div>
        );
    }

    if (!user) {
        return (
            <div className="container mx-auto px-4 py-16 text-center">
                <Shield className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                <h1 className="text-2xl font-bold mb-4">Authentication Required</h1>
                <p className="text-gray-600 mb-8">Please sign in to access the admin dashboard.</p>
                <Link href="/">
                    <Button>Go to Homepage</Button>
                </Link>
            </div>
        );
    }

    if (error) {
        return (
            <div className="container mx-auto px-4 py-16 text-center">
                <AlertTriangle className="h-16 w-16 text-red-400 mx-auto mb-4" />
                <h1 className="text-2xl font-bold mb-4 text-red-600">Access Denied</h1>
                <p className="text-gray-600 mb-8">{error}</p>
                <Link href="/">
                    <Button>Go to Homepage</Button>
                </Link>
            </div>
        );
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-violet-600"></div>
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 py-8">
            {/* Header */}
            <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-3">
                    <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-violet-100">
                        <Shield className="h-6 w-6 text-violet-600" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
                        <p className="text-sm text-gray-500">Manage products, users, and reviews</p>
                    </div>
                </div>
                <Button onClick={fetchAdminData} variant="outline" size="sm">
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Refresh
                </Button>
            </div>

            {/* Stats Cards */}
            {stats && (
                <div className="grid gap-4 md:grid-cols-5 mb-8">
                    <Card>
                        <CardContent className="p-4 text-center">
                            <Package className="h-6 w-6 text-violet-600 mx-auto mb-2" />
                            <div className="text-2xl font-bold">{stats.total_products}</div>
                            <div className="text-xs text-gray-500">Products</div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="p-4 text-center">
                            <Users className="h-6 w-6 text-blue-600 mx-auto mb-2" />
                            <div className="text-2xl font-bold">{stats.total_users}</div>
                            <div className="text-xs text-gray-500">Users</div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="p-4 text-center">
                            <Star className="h-6 w-6 text-yellow-600 mx-auto mb-2" />
                            <div className="text-2xl font-bold">{stats.total_reviews}</div>
                            <div className="text-xs text-gray-500">Reviews</div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="p-4 text-center">
                            <ArrowUp className="h-6 w-6 text-orange-600 mx-auto mb-2" />
                            <div className="text-2xl font-bold">{stats.total_upvotes}</div>
                            <div className="text-xs text-gray-500">Upvotes</div>
                        </CardContent>
                    </Card>
                    <Card className={stats.pending_products > 0 ? "border-2 border-yellow-400" : ""}>
                        <CardContent className="p-4 text-center">
                            <AlertTriangle className={`h-6 w-6 mx-auto mb-2 ${stats.pending_products > 0 ? "text-yellow-600" : "text-gray-400"}`} />
                            <div className="text-2xl font-bold">{stats.pending_products}</div>
                            <div className="text-xs text-gray-500">Pending</div>
                        </CardContent>
                    </Card>
                </div>
            )}

            {/* Tabs */}
            <div className="flex gap-2 mb-6">
                <Button
                    variant={activeTab === "products" ? "default" : "outline"}
                    onClick={() => setActiveTab("products")}
                >
                    Products ({products.length})
                </Button>
                <Button
                    variant={activeTab === "users" ? "default" : "outline"}
                    onClick={() => setActiveTab("users")}
                >
                    Users ({users.length})
                </Button>
                <Button
                    variant={activeTab === "reviews" ? "default" : "outline"}
                    onClick={() => setActiveTab("reviews")}
                >
                    Reviews ({reviews.length})
                </Button>
            </div>

            {/* Products Table */}
            {activeTab === "products" && (
                <Card>
                    <CardHeader>
                        <CardTitle>All Products</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead className="text-left border-b">
                                    <tr>
                                        <th className="pb-2">Name</th>
                                        <th className="pb-2">Category</th>
                                        <th className="pb-2">Score</th>
                                        <th className="pb-2">Status</th>
                                        <th className="pb-2">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {products.map((product) => (
                                        <tr key={product.id} className="border-b">
                                            <td className="py-3 font-medium">{product.name}</td>
                                            <td className="py-3">{product.category}</td>
                                            <td className="py-3">{product.trust_score}</td>
                                            <td className="py-3">
                                                <Badge className={
                                                    product.status === "approved" ? "bg-green-100 text-green-700" :
                                                        product.status === "pending" ? "bg-yellow-100 text-yellow-700" :
                                                            "bg-red-100 text-red-700"
                                                }>
                                                    {product.status || "approved"}
                                                </Badge>
                                            </td>
                                            <td className="py-3">
                                                <div className="flex gap-1">
                                                    {product.status === "pending" && (
                                                        <>
                                                            <Button size="sm" variant="outline" className="text-green-600" onClick={() => handleProductAction(product.id, "approve")}>
                                                                <CheckCircle className="h-4 w-4" />
                                                            </Button>
                                                            <Button size="sm" variant="outline" className="text-red-600" onClick={() => handleProductAction(product.id, "reject")}>
                                                                <XCircle className="h-4 w-4" />
                                                            </Button>
                                                        </>
                                                    )}
                                                    <Button size="sm" variant="outline" className="text-red-600" onClick={() => handleProductAction(product.id, "delete")}>
                                                        <Trash2 className="h-4 w-4" />
                                                    </Button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Users Table */}
            {activeTab === "users" && (
                <Card>
                    <CardHeader>
                        <CardTitle>All Users</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead className="text-left border-b">
                                    <tr>
                                        <th className="pb-2">Name</th>
                                        <th className="pb-2">Email</th>
                                        <th className="pb-2">Role</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {users.map((u) => (
                                        <tr key={u.id} className="border-b">
                                            <td className="py-3 font-medium">{u.full_name || "—"}</td>
                                            <td className="py-3">{u.email}</td>
                                            <td className="py-3">
                                                <Badge className={
                                                    u.role === "admin" ? "bg-violet-100 text-violet-700" :
                                                        u.role === "founder" ? "bg-blue-100 text-blue-700" :
                                                            "bg-gray-100 text-gray-700"
                                                }>
                                                    {u.role}
                                                </Badge>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Reviews Table */}
            {activeTab === "reviews" && (
                <Card>
                    <CardHeader>
                        <CardTitle>All Reviews</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead className="text-left border-b">
                                    <tr>
                                        <th className="pb-2">Reviewer</th>
                                        <th className="pb-2">Rating</th>
                                        <th className="pb-2">Comment</th>
                                        <th className="pb-2">Sentiment</th>
                                        <th className="pb-2">Status</th>
                                        <th className="pb-2">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {reviews.map((review) => (
                                        <tr key={review.id} className="border-b">
                                            <td className="py-3 font-medium">{review.reviewer_name}</td>
                                            <td className="py-3">{"⭐".repeat(review.rating)}</td>
                                            <td className="py-3 max-w-xs truncate">{review.comment}</td>
                                            <td className="py-3">{Math.round(review.sentiment_score * 100)}%</td>
                                            <td className="py-3">
                                                {review.verified ? (
                                                    <Badge className="bg-green-100 text-green-700">Verified</Badge>
                                                ) : (
                                                    <Badge className="bg-gray-100 text-gray-700">Unverified</Badge>
                                                )}
                                            </td>
                                            <td className="py-3">
                                                <div className="flex gap-1">
                                                    {!review.verified && (
                                                        <Button size="sm" variant="outline" className="text-green-600" onClick={() => handleVerifyReview(review.id)}>
                                                            <CheckCircle className="h-4 w-4" />
                                                        </Button>
                                                    )}
                                                    <Button size="sm" variant="outline" className="text-red-600" onClick={() => handleDeleteReview(review.id)}>
                                                        <Trash2 className="h-4 w-4" />
                                                    </Button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </CardContent>
                </Card>
            )}
        </div>
    );
}
