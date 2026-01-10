"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useUser } from "@clerk/nextjs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Rocket } from "lucide-react";
import Link from "next/link";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export default function LaunchPage() {
    const { user, isLoaded } = useUser();
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [form, setForm] = useState({
        product_id: "",
        tagline: "",
        description: "",
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user) return;

        setLoading(true);
        setError(null);

        try {
            const response = await fetch(`${API_BASE}/api/v1/launches/`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "X-Clerk-User-Id": user.id,
                },
                body: JSON.stringify({
                    product_id: Number(form.product_id),
                }),
            });

            if (!response.ok) {
                const data = await response.json();
                throw new Error(data.detail || "Failed to launch");
            }

            setSuccess(true);
            setTimeout(() => router.push("/leaderboard"), 2000);
        } catch (err) {
            setError(err instanceof Error ? err.message : "Something went wrong");
        } finally {
            setLoading(false);
        }
    };

    if (!isLoaded) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-600"></div>
            </div>
        );
    }

    if (!user) {
        return (
            <div className="container mx-auto px-4 py-16 text-center">
                <h1 className="text-2xl font-bold mb-4">Sign In Required</h1>
                <p className="text-gray-600 mb-8">You need to sign in to launch your startup.</p>
                <Link href="/">
                    <Button>Go to Homepage</Button>
                </Link>
            </div>
        );
    }

    if (success) {
        return (
            <div className="container mx-auto flex min-h-[60vh] items-center justify-center px-4">
                <Card className="max-w-md text-center">
                    <CardContent className="p-8">
                        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100">
                            <Rocket className="h-8 w-8 text-emerald-600" />
                        </div>
                        <h2 className="mt-4 text-2xl font-bold text-gray-900">
                            Launch Submitted!
                        </h2>
                        <p className="mt-2 text-gray-600">
                            Your startup is now on the leaderboard. Redirecting...
                        </p>
                    </CardContent>
                </Card>
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 py-12">
            <div className="mx-auto max-w-2xl">
                <div className="mb-8 text-center">
                    <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-orange-100">
                        <Rocket className="h-8 w-8 text-orange-600" />
                    </div>
                    <h1 className="mt-4 text-3xl font-bold text-gray-900">
                        Launch Your Startup
                    </h1>
                    <p className="mt-2 text-gray-600">
                        Add your product to the leaderboard and collect upvotes.
                    </p>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>Launch Details</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSubmit} className="space-y-6">
                            {error && (
                                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                                    {error}
                                </div>
                            )}

                            <div>
                                <label className="mb-2 block text-sm font-medium text-gray-700">
                                    Product ID
                                </label>
                                <Input
                                    type="number"
                                    placeholder="Enter your product ID (from My Products)"
                                    value={form.product_id}
                                    onChange={(e) =>
                                        setForm({ ...form, product_id: e.target.value })
                                    }
                                    required
                                />
                                <p className="mt-1 text-xs text-gray-500">
                                    Find your product ID in <Link href="/my-products" className="text-violet-600 hover:underline">My Products</Link>
                                </p>
                            </div>

                            <Button
                                type="submit"
                                className="w-full bg-orange-600 hover:bg-orange-700"
                                disabled={loading}
                            >
                                {loading ? "Launching..." : "Launch to Leaderboard 🚀"}
                            </Button>
                        </form>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
