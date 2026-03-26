"use client";

import { useEffect, useState } from "react";
import { useUser } from "@clerk/nextjs";
import Link from "next/link";
import {
    Heart,
    ExternalLink,
    Loader2,
    Trash2,
    ShieldCheck,
    Zap,
    HeartOff,
} from "lucide-react";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

interface WatchlistItem {
    id:                          string;
    product_id:                  number;
    product_name?:               string;
    product_category?:           string;
    product_trust_score?:        number;
    product_website?:            string;
    product_healthcare_category?: string;
    product_compliance?:         string[];
    created_at:                  string;
}

const COMPLIANCE_LABELS: Record<string, string> = {
    hipaa: "HIPAA", fda: "FDA Cleared", ce_mark: "CE Mark",
    iso_13485: "ISO 13485", soc2: "SOC 2", gdpr: "GDPR",
};

export default function WatchlistPage() {
    const { user } = useUser();
    const [items, setItems]     = useState<WatchlistItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [removing, setRemoving] = useState<number | null>(null);

    useEffect(() => {
        if (!user) { setLoading(false); return; }
        fetch(`${API_BASE}/api/v1/watchlist`, {
            headers: { "X-Clerk-User-Id": user.id },
        })
            .then((r) => r.json())
            .then((d) => setItems(Array.isArray(d) ? d : []))
            .catch(() => setItems([]))
            .finally(() => setLoading(false));
    }, [user]);

    const handleRemove = async (productId: number) => {
        if (!user) return;
        setRemoving(productId);
        try {
            await fetch(`${API_BASE}/api/v1/watchlist/${productId}`, {
                method: "DELETE",
                headers: { "X-Clerk-User-Id": user.id },
            });
            setItems((prev) => prev.filter((i) => i.product_id !== productId));
        } finally {
            setRemoving(null);
        }
    };

    if (!user) return (
        <div className="container mx-auto px-4 py-16 text-center">
            <p className="text-gray-500">Sign in to view your watchlist.</p>
        </div>
    );

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="container mx-auto px-4 py-8 max-w-4xl">
                {/* Header */}
                <div className="mb-6 flex items-center gap-3">
                    <Heart className="h-5 w-5 text-pink-500" />
                    <h1 className="text-xl font-bold text-gray-900">Watchlist</h1>
                    <span className="rounded-full bg-gray-100 px-2 py-0.5 text-xs font-semibold text-gray-600">
                        {items.length} saved
                    </span>
                </div>

                {loading ? (
                    <div className="flex justify-center py-20">
                        <Loader2 className="h-6 w-6 animate-spin text-violet-600" />
                    </div>
                ) : items.length === 0 ? (
                    <div className="rounded-2xl border border-gray-200 bg-white p-12 text-center">
                        <HeartOff className="mx-auto h-10 w-10 text-gray-300 mb-3" />
                        <h3 className="font-semibold text-gray-700 mb-1">No saved startups yet</h3>
                        <p className="text-sm text-gray-500 mb-4">Click the heart icon on any product card to save it here.</p>
                        <Link href="/marketplace">
                            <button className="rounded-xl bg-violet-600 px-4 py-2 text-sm font-semibold text-white hover:bg-violet-700 transition-colors">
                                Browse Marketplace
                            </button>
                        </Link>
                    </div>
                ) : (
                    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                        {items.map((item) => (
                            <div key={item.id} className="group relative rounded-2xl border border-gray-100 bg-white p-5 shadow-sm hover:shadow-md hover:border-violet-200 transition-all">
                                {/* Remove button */}
                                <button
                                    onClick={() => handleRemove(item.product_id)}
                                    disabled={removing === item.product_id}
                                    className="absolute right-3 top-3 rounded-lg p-1.5 text-gray-300 opacity-0 group-hover:opacity-100 hover:bg-red-50 hover:text-red-500 transition-all disabled:opacity-50"
                                    title="Remove from watchlist"
                                >
                                    {removing === item.product_id
                                        ? <Loader2 className="h-3.5 w-3.5 animate-spin" />
                                        : <Trash2 className="h-3.5 w-3.5" />
                                    }
                                </button>

                                {/* Avatar + name */}
                                <div className="flex items-center gap-3 mb-3">
                                    <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-violet-100 to-indigo-100 text-base font-bold text-violet-600">
                                        {(item.product_name ?? "P").charAt(0)}
                                    </div>
                                    <div>
                                        <Link href={`/product/${item.product_id}`}>
                                            <h3 className="font-semibold text-gray-900 hover:text-violet-600 transition-colors line-clamp-1">
                                                {item.product_name ?? `Product #${item.product_id}`}
                                            </h3>
                                        </Link>
                                        {item.product_healthcare_category && (
                                            <p className="text-xs text-gray-400">{item.product_healthcare_category}</p>
                                        )}
                                    </div>
                                </div>

                                {/* Trust score */}
                                {item.product_trust_score !== undefined && (
                                    <div className="mb-3 flex items-center gap-1.5">
                                        <div className="h-1.5 flex-1 rounded-full bg-gray-100 overflow-hidden">
                                            <div
                                                className="h-full rounded-full bg-violet-500"
                                                style={{ width: `${Math.min(item.product_trust_score, 100)}%` }}
                                            />
                                        </div>
                                        <span className="text-xs font-bold text-violet-700">{item.product_trust_score}</span>
                                    </div>
                                )}

                                {/* Compliance badges */}
                                {(item.product_compliance ?? []).length > 0 && (
                                    <div className="flex flex-wrap gap-1 mb-3">
                                        {(item.product_compliance ?? []).slice(0, 3).map((c) => (
                                            <span key={c} className="flex items-center gap-0.5 rounded-full bg-blue-50 px-2 py-0.5 text-[10px] font-semibold text-blue-700">
                                                <ShieldCheck className="h-2.5 w-2.5" />
                                                {COMPLIANCE_LABELS[c] ?? c.toUpperCase()}
                                            </span>
                                        ))}
                                    </div>
                                )}

                                {/* Actions */}
                                <div className="flex items-center gap-2 mt-3 pt-3 border-t border-gray-50">
                                    <Link href={`/product/${item.product_id}`} className="flex-1">
                                        <button className="w-full rounded-lg bg-violet-50 px-3 py-1.5 text-xs font-semibold text-violet-700 hover:bg-violet-100 transition-colors">
                                            View Profile
                                        </button>
                                    </Link>
                                    {item.product_website && (
                                        <a href={item.product_website} target="_blank" rel="noopener noreferrer"
                                            className="rounded-lg border border-gray-200 p-1.5 hover:bg-gray-50 transition-colors">
                                            <ExternalLink className="h-3.5 w-3.5 text-gray-400" />
                                        </a>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
