"use client";

import { useEffect, useState } from "react";
import { getProducts, getBadgeData, BadgeData, Product } from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { TrustScoreBadge } from "@/components/TrustScoreBadge";
import { Code, Copy, Check, Award, ExternalLink } from "lucide-react";

export default function BadgesPage() {
    const [products, setProducts] = useState<Product[]>([]);
    const [selectedProduct, setSelectedProduct] = useState<number | null>(null);
    const [badgeData, setBadgeData] = useState<BadgeData | null>(null);
    const [copied, setCopied] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchProducts() {
            try {
                const data = await getProducts();
                setProducts(data);
                if (data.length > 0) {
                    setSelectedProduct(data[0].id);
                }
            } catch (error) {
                console.error("Failed to fetch products:", error);
            } finally {
                setLoading(false);
            }
        }
        fetchProducts();
    }, []);

    useEffect(() => {
        async function fetchBadge() {
            if (!selectedProduct) return;
            const data = await getBadgeData(selectedProduct);
            setBadgeData(data);
        }
        fetchBadge();
    }, [selectedProduct]);

    const copyToClipboard = (code: string, type: string) => {
        navigator.clipboard.writeText(code);
        setCopied(type);
        setTimeout(() => setCopied(null), 2000);
    };

    const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

    return (
        <div className="container mx-auto px-4 py-12">
            {/* Header */}
            <div className="mb-8 text-center">
                <Badge className="mb-4 bg-emerald-100 text-emerald-700 hover:bg-emerald-100">
                    <Award className="mr-1 h-3 w-3" />
                    Credibility Widgets
                </Badge>
                <h1 className="text-4xl font-bold text-gray-900">Embeddable Badges</h1>
                <p className="mt-4 text-lg text-gray-600 max-w-2xl mx-auto">
                    Showcase your EthAum credibility score on your website. Embed trust badges to boost conversion rates.
                </p>
            </div>

            {loading ? (
                <div className="text-center text-gray-500">Loading...</div>
            ) : (
                <div className="grid gap-8 lg:grid-cols-3">
                    {/* Selector */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Select Startup</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-2">
                                {products.map((product) => (
                                    <button
                                        key={product.id}
                                        onClick={() => setSelectedProduct(product.id)}
                                        className={`w-full rounded-lg border p-3 text-left transition-all ${selectedProduct === product.id
                                                ? "border-violet-500 bg-violet-50"
                                                : "hover:border-gray-300"
                                            }`}
                                    >
                                        <div className="flex items-center justify-between">
                                            <span className="font-medium">{product.name}</span>
                                            <TrustScoreBadge score={product.trust_score} size="sm" showLabel={false} />
                                        </div>
                                        <p className="text-sm text-gray-500">{product.category}</p>
                                    </button>
                                ))}
                            </div>
                        </CardContent>
                    </Card>

                    {/* Preview & Codes */}
                    <div className="lg:col-span-2 space-y-6">
                        {badgeData && (
                            <>
                                {/* Badge Preview */}
                                <Card>
                                    <CardHeader>
                                        <CardTitle className="flex items-center justify-between">
                                            Badge Preview
                                            <Badge variant="secondary">{badgeData.badge.level}</Badge>
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="rounded-lg bg-gray-50 p-8 text-center">
                                            <iframe
                                                src={`${API_BASE}/api/v1/badges/${selectedProduct}/preview`}
                                                className="mx-auto h-32 w-80 border-0"
                                                title="Badge Preview"
                                            />
                                        </div>
                                        <div className="mt-4 flex items-center justify-center gap-4 text-sm text-gray-500">
                                            <span>Verified: {badgeData.badge.verified ? "Yes" : "No"}</span>
                                            <span>•</span>
                                            <span>Valid until: {badgeData.badge.valid_until}</span>
                                        </div>
                                    </CardContent>
                                </Card>

                                {/* Embed Codes */}
                                <Card>
                                    <CardHeader>
                                        <CardTitle className="flex items-center gap-2">
                                            <Code className="h-5 w-5" />
                                            Embed Codes
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent className="space-y-4">
                                        {/* HTML */}
                                        <div>
                                            <div className="flex items-center justify-between mb-2">
                                                <span className="text-sm font-medium text-gray-700">HTML</span>
                                                <Button
                                                    size="sm"
                                                    variant="ghost"
                                                    onClick={() => copyToClipboard(badgeData.embed_codes.html, "html")}
                                                >
                                                    {copied === "html" ? (
                                                        <Check className="h-4 w-4 text-emerald-500" />
                                                    ) : (
                                                        <Copy className="h-4 w-4" />
                                                    )}
                                                </Button>
                                            </div>
                                            <pre className="rounded-lg bg-gray-900 p-4 text-sm text-gray-100 overflow-x-auto">
                                                <code>{badgeData.embed_codes.html}</code>
                                            </pre>
                                        </div>

                                        {/* Markdown */}
                                        <div>
                                            <div className="flex items-center justify-between mb-2">
                                                <span className="text-sm font-medium text-gray-700">Markdown</span>
                                                <Button
                                                    size="sm"
                                                    variant="ghost"
                                                    onClick={() => copyToClipboard(badgeData.embed_codes.markdown, "markdown")}
                                                >
                                                    {copied === "markdown" ? (
                                                        <Check className="h-4 w-4 text-emerald-500" />
                                                    ) : (
                                                        <Copy className="h-4 w-4" />
                                                    )}
                                                </Button>
                                            </div>
                                            <pre className="rounded-lg bg-gray-900 p-4 text-sm text-gray-100 overflow-x-auto">
                                                <code>{badgeData.embed_codes.markdown}</code>
                                            </pre>
                                        </div>

                                        {/* React */}
                                        <div>
                                            <div className="flex items-center justify-between mb-2">
                                                <span className="text-sm font-medium text-gray-700">React Component</span>
                                                <Button
                                                    size="sm"
                                                    variant="ghost"
                                                    onClick={() => copyToClipboard(badgeData.embed_codes.react, "react")}
                                                >
                                                    {copied === "react" ? (
                                                        <Check className="h-4 w-4 text-emerald-500" />
                                                    ) : (
                                                        <Copy className="h-4 w-4" />
                                                    )}
                                                </Button>
                                            </div>
                                            <pre className="rounded-lg bg-gray-900 p-4 text-sm text-gray-100 overflow-x-auto">
                                                <code>{badgeData.embed_codes.react}</code>
                                            </pre>
                                        </div>
                                    </CardContent>
                                </Card>
                            </>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
