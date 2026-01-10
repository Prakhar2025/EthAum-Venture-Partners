"use client";

import { useState } from "react";
import { useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Rocket, ArrowLeft, CheckCircle } from "lucide-react";
import Link from "next/link";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

const CATEGORIES = [
    "AI/ML",
    "DevOps",
    "FinTech",
    "HealthTech",
    "EdTech",
    "MarTech",
    "HRTech",
    "E-commerce",
    "SaaS",
    "Other",
];

const FUNDING_STAGES = [
    "Pre-Seed",
    "Seed",
    "Series A",
    "Series B",
    "Series C",
    "Series D+",
];

export default function SubmitProductPage() {
    const { user, isLoaded } = useUser();
    const router = useRouter();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const [formData, setFormData] = useState({
        name: "",
        website: "",
        category: "AI/ML",
        funding_stage: "Series A",
        description: "",
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user) return;

        setIsSubmitting(true);
        setError(null);

        try {
            const response = await fetch(`${API_BASE}/api/v1/products`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "X-Clerk-User-Id": user.id,
                },
                body: JSON.stringify(formData),
            });

            if (!response.ok) {
                const data = await response.json();
                throw new Error(data.detail || "Failed to submit product");
            }

            setIsSuccess(true);
            setTimeout(() => {
                router.push("/my-products");
            }, 2000);
        } catch (err) {
            setError(err instanceof Error ? err.message : "Something went wrong");
        } finally {
            setIsSubmitting(false);
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
                <h1 className="text-2xl font-bold mb-4">Sign In Required</h1>
                <p className="text-gray-600 mb-8">You need to sign in to submit your startup.</p>
                <Link href="/">
                    <Button>Go to Homepage</Button>
                </Link>
            </div>
        );
    }

    if (isSuccess) {
        return (
            <div className="container mx-auto px-4 py-16 text-center">
                <div className="flex justify-center mb-6">
                    <CheckCircle className="h-16 w-16 text-green-500" />
                </div>
                <h1 className="text-2xl font-bold mb-4">Startup Submitted Successfully!</h1>
                <p className="text-gray-600">Redirecting to your products...</p>
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 py-8 max-w-2xl">
            <Link href="/marketplace" className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6">
                <ArrowLeft className="h-4 w-4" />
                Back to Marketplace
            </Link>

            <Card>
                <CardHeader>
                    <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-violet-600 to-indigo-600">
                            <Rocket className="h-5 w-5 text-white" />
                        </div>
                        <div>
                            <CardTitle>Submit Your Startup</CardTitle>
                            <CardDescription>
                                List your SaaS product on EthAum AI marketplace
                            </CardDescription>
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-6">
                        {error && (
                            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                                {error}
                            </div>
                        )}

                        <div className="space-y-2">
                            <Label htmlFor="name">Startup Name *</Label>
                            <Input
                                id="name"
                                placeholder="e.g., NeuraTech"
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                required
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="website">Website URL *</Label>
                            <Input
                                id="website"
                                type="url"
                                placeholder="https://yourcompany.com"
                                value={formData.website}
                                onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                                required
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="category">Category *</Label>
                                <select
                                    id="category"
                                    className="w-full h-10 px-3 rounded-md border border-gray-200 bg-white text-sm"
                                    value={formData.category}
                                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                                >
                                    {CATEGORIES.map((cat) => (
                                        <option key={cat} value={cat}>{cat}</option>
                                    ))}
                                </select>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="funding_stage">Funding Stage *</Label>
                                <select
                                    id="funding_stage"
                                    className="w-full h-10 px-3 rounded-md border border-gray-200 bg-white text-sm"
                                    value={formData.funding_stage}
                                    onChange={(e) => setFormData({ ...formData, funding_stage: e.target.value })}
                                >
                                    {FUNDING_STAGES.map((stage) => (
                                        <option key={stage} value={stage}>{stage}</option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="description">Description</Label>
                            <Textarea
                                id="description"
                                placeholder="Tell us about your startup, its mission, and what makes it unique..."
                                rows={4}
                                value={formData.description}
                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                            />
                        </div>

                        <Button
                            type="submit"
                            className="w-full bg-violet-600 hover:bg-violet-700"
                            disabled={isSubmitting}
                        >
                            {isSubmitting ? (
                                <>
                                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                    Submitting...
                                </>
                            ) : (
                                <>
                                    <Rocket className="h-4 w-4 mr-2" />
                                    Submit Startup
                                </>
                            )}
                        </Button>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
}
