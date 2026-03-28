"use client";

import { useEffect, useState } from "react";
import { useUser } from "@clerk/nextjs";
import {
    BookmarkPlus,
    ArrowLeft,
    ExternalLink,
    FileText,
    Trash2,
    Loader2,
    Star,
} from "lucide-react";
import Link from "next/link";

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

interface WatchlistItem {
    id: string;
    product_id: number;
    product?: {
        id: number;
        name: string;
        trust_score: number;
        healthcare_category: string | null;
        revenue_stage: string | null;
        tagline: string | null;
        compliance: string[];
    };
}

export default function InvestorWatchlistPage() {
    const { user } = useUser();

    const [items,    setItems]    = useState<WatchlistItem[]>([]);
    const [loading,  setLoading]  = useState(true);
    const [removing, setRemoving] = useState<string | null>(null);

    const fetchWatchlist = () => {
        if (!user) return;
        setLoading(true);
        fetch(`${API}/api/v1/watchlist`, {
            headers: { "X-Clerk-User-Id": user.id },
        })
            .then(r => r.json())
            .then(data => setItems(Array.isArray(data) ? data : []))
            .catch(() => setItems([]))
            .finally(() => setLoading(false));
    };

    useEffect(() => { fetchWatchlist(); }, [user]);

    const handleRemove = async (productId: number) => {
        if (!user) return;
        setRemoving(String(productId));
        try {
            await fetch(`${API}/api/v1/watchlist/${productId}`, {
                method: "DELETE",
                headers: { "X-Clerk-User-Id": user.id },
            });
            setItems(prev => prev.filter(i => i.product_id !== productId));
        } catch {
            /* no-op */
        } finally {
            setRemoving(null);
        }
    };

    const avgScore = items.length
        ? Math.round(
              items.reduce((acc, i) => acc + (i.product?.trust_score ?? 70), 0) / items.length
          )
        : null;

    return (
        <div className="min-h-screen bg-[#0A0B14] antialiased">
            <div className="pointer-events-none fixed inset-0 overflow-hidden">
                <div className="absolute -top-40 -right-40 h-[600px] w-[600px] rounded-full bg-emerald-600/15 blur-[120px]" />
                <div className="absolute bottom-0 -left-40 h-[500px] w-[500px] rounded-full bg-teal-600/10 blur-[100px]" />
            </div>

            <div className="relative z-10 mx-auto max-w-4xl px-4 py-10 sm:px-6">

                {/* Header */}
                <div className="mb-8">
                    <Link
                        href="/dashboard/investor"
                        className="mb-4 inline-flex items-center gap-1.5 text-xs text-slate-500 hover:text-emerald-400 transition-colors"
                    >
                        <ArrowLeft className="h-3.5 w-3.5" /> Back to Investor Dashboard
                    </Link>
                    <div className="flex items-start justify-between gap-4">
                        <div className="flex items-start gap-4">
                            <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-600 to-teal-600 shadow-lg shadow-emerald-900/30">
                                <BookmarkPlus className="h-6 w-6 text-white" />
                            </div>
                            <div>
                                <h1 className="text-2xl font-bold text-white">My Watchlist</h1>
                                <p className="text-sm text-slate-400 mt-0.5">
                                    Healthcare startups you are tracking for potential investment.
                                </p>
                            </div>
                        </div>
                        <Link
                            href="/marketplace"
                            className="hidden sm:flex items-center gap-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 px-4 py-2 text-xs font-semibold text-white shadow-lg shadow-emerald-900/30 hover:shadow-emerald-900/50 transition-all flex-shrink-0"
                        >
                            <BookmarkPlus className="h-3.5 w-3.5" /> Add More
                        </Link>
                    </div>
                </div>

                {/* Summary stat */}
                {!loading && items.length > 0 && (
                    <div className="mb-6 grid grid-cols-2 gap-4 sm:grid-cols-3">
                        <div className="rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3">
                            <p className="text-xs text-slate-500 uppercase tracking-wider">Tracked</p>
                            <p className="mt-1 text-2xl font-bold text-white">{items.length}</p>
                            <p className="text-xs text-slate-600">startups</p>
                        </div>
                        <div className="rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3">
                            <p className="text-xs text-slate-500 uppercase tracking-wider">Portfolio Avg</p>
                            <p className={`mt-1 text-2xl font-bold ${
                                (avgScore ?? 0) >= 80 ? "text-emerald-400" :
                                (avgScore ?? 0) >= 60 ? "text-amber-400" : "text-red-400"
                            }`}>{avgScore ?? "—"}</p>
                            <p className="text-xs text-slate-600">trust score</p>
                        </div>
                        <div className="hidden sm:block rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3">
                            <p className="text-xs text-slate-500 uppercase tracking-wider">Reports</p>
                            <p className="mt-1 text-2xl font-bold text-white">—</p>
                            <p className="text-xs text-slate-600">generated</p>
                        </div>
                    </div>
                )}

                {/* List */}
                {loading ? (
                    <div className="space-y-3">
                        {[1, 2, 3].map(i => (
                            <div key={i} className="h-24 animate-pulse rounded-2xl border border-white/10 bg-white/[0.03]" />
                        ))}
                    </div>
                ) : items.length === 0 ? (
                    <div className="flex flex-col items-center justify-center gap-4 rounded-2xl border border-white/10 bg-white/[0.03] py-16 text-center">
                        <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.04]">
                            <BookmarkPlus className="h-6 w-6 text-slate-600" />
                        </div>
                        <div>
                            <p className="font-semibold text-white">No startups tracked yet</p>
                            <p className="mt-1 text-sm text-slate-500">
                                Browse the marketplace and click the bookmark icon to add startups.
                            </p>
                        </div>
                        <Link
                            href="/marketplace"
                            className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-emerald-500 transition-colors"
                        >
                            Browse Marketplace
                        </Link>
                    </div>
                ) : (
                    <div className="space-y-3">
                        {items.map(item => {
                            const product  = item.product;
                            const score    = product?.trust_score ?? 0;
                            const scoreColor =
                                score >= 80 ? "text-emerald-400" :
                                score >= 60 ? "text-amber-400" : "text-red-400";

                            return (
                                <div
                                    key={item.id}
                                    className="flex items-center gap-4 rounded-2xl border border-white/10 bg-white/[0.03] px-5 py-4 backdrop-blur-sm transition-all hover:bg-white/[0.05]"
                                >
                                    {/* Score */}
                                    <div className="flex h-12 w-12 flex-shrink-0 flex-col items-center justify-center rounded-xl bg-white/[0.06]">
                                        <Star className="mb-0.5 h-3 w-3 text-slate-600" />
                                        <span className={`text-lg font-extrabold leading-none ${scoreColor}`}>
                                            {score}
                                        </span>
                                    </div>

                                    {/* Info */}
                                    <div className="min-w-0 flex-1">
                                        <div className="flex items-center gap-2 flex-wrap">
                                            <p className="font-semibold text-white">
                                                {product?.name ?? `Product #${item.product_id}`}
                                            </p>
                                            {product?.healthcare_category && (
                                                <span className="rounded-full border border-emerald-500/20 bg-emerald-600/10 px-2 py-0.5 text-[10px] font-medium text-emerald-300">
                                                    {product.healthcare_category.replace(/_/g, " ")}
                                                </span>
                                            )}
                                        </div>
                                        <div className="mt-1 flex items-center gap-2 flex-wrap">
                                            {(product?.compliance ?? []).slice(0, 3).map(c => (
                                                <span key={c} className="text-[10px] uppercase font-medium text-teal-400">
                                                    {c}
                                                </span>
                                            ))}
                                            {product?.revenue_stage && (
                                                <span className="text-xs text-slate-500">
                                                    {product.revenue_stage.replace(/_/g, " ")}
                                                </span>
                                            )}
                                        </div>
                                    </div>

                                    {/* Actions */}
                                    <div className="flex flex-shrink-0 items-center gap-2">
                                        <Link
                                            href={`/product/${item.product_id}`}
                                            className="flex items-center gap-1 rounded-lg border border-white/10 bg-white/[0.04] px-3 py-1.5 text-xs font-semibold text-slate-300 transition-all hover:border-emerald-500/30 hover:text-emerald-300"
                                        >
                                            <ExternalLink className="h-3 w-3" /> View
                                        </Link>
                                        <Link
                                            href={`/dashboard/investor/reports?product=${item.product_id}&name=${encodeURIComponent(product?.name ?? "")}`}
                                            className="flex items-center gap-1 rounded-lg border border-emerald-500/20 bg-emerald-600/10 px-3 py-1.5 text-xs font-semibold text-emerald-300 transition-all hover:bg-emerald-600/20"
                                        >
                                            <FileText className="h-3 w-3" /> Report
                                        </Link>
                                        <button
                                            id={`remove-watchlist-${item.product_id}`}
                                            onClick={() => handleRemove(item.product_id)}
                                            disabled={removing === String(item.product_id)}
                                            className="flex items-center gap-1 rounded-lg border border-red-500/20 bg-red-600/10 px-3 py-1.5 text-xs font-semibold text-red-400 transition-all hover:bg-red-600/20 disabled:opacity-50"
                                        >
                                            {removing === String(item.product_id) ? (
                                                <Loader2 className="h-3 w-3 animate-spin" />
                                            ) : (
                                                <Trash2 className="h-3 w-3" />
                                            )}
                                        </button>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
}
