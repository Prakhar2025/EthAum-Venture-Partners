"use client";

import { useEffect, useState, useCallback } from "react";
import { useUser } from "@clerk/nextjs";
import { useSearchParams } from "next/navigation";
import {
    FileText,
    Download,
    Loader2,
    AlertCircle,
    Building2,
    ArrowLeft,
    Search,
    CheckCircle,
} from "lucide-react";
import Link from "next/link";

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

interface Product {
    id: number;
    name: string;
    trust_score: number;
    healthcare_category: string | null;
    revenue_stage: string | null;
    tagline: string | null;
}

interface GeneratedReport {
    productId: number;
    productName: string;
    generatedAt: Date;
}

export default function InvestorReportsPage() {
    const { user }       = useUser();
    const searchParams   = useSearchParams();
    const preselectedId  = searchParams.get("product");
    const preselectedName = searchParams.get("name");

    const [products,     setProducts]     = useState<Product[]>([]);
    const [search,       setSearch]       = useState("");
    const [loadingProds, setLoadingProds] = useState(true);
    const [generating,   setGenerating]   = useState<number | null>(null);
    const [error,        setError]        = useState<string | null>(null);
    const [generated,    setGenerated]    = useState<GeneratedReport[]>([]);
    const [planError,    setPlanError]    = useState(false);

    // Fetch marketplace products (healthcare focused)
    useEffect(() => {
        fetch(`${API}/api/v1/products?vertical=healthcare&sort=trust_score`)
            .then(r => r.json())
            .then(data => setProducts(Array.isArray(data) ? data : []))
            .catch(() => setProducts([]))
            .finally(() => setLoadingProds(false));
    }, []);

    const filteredProducts = products.filter(p =>
        !search || p.name.toLowerCase().includes(search.toLowerCase())
    );

    const handleGenerate = useCallback(async (productId: number, productName: string) => {
        if (!user) return;
        setGenerating(productId);
        setError(null);
        setPlanError(false);

        try {
            const res = await fetch(`${API}/api/v1/reports/generate/${productId}`, {
                method: "POST",
                headers: { "X-Clerk-User-Id": user.id },
            });

            if (res.status === 403) {
                setPlanError(true);
                setError("Due diligence reports require an active Investor plan. Upgrade at /pricing.");
                return;
            }
            if (!res.ok) {
                const err = await res.json().catch(() => ({ detail: "Unknown error" }));
                setError(err.detail || "Failed to generate report");
                return;
            }

            // Download PDF
            const blob = await res.blob();
            const url  = URL.createObjectURL(blob);
            const a    = document.createElement("a");
            a.href     = url;
            a.download = `ethaum_dd_${productName.toLowerCase().replace(/\s+/g, "_")}_${productId}.pdf`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);

            setGenerated(prev => [
                { productId, productName, generatedAt: new Date() },
                ...prev,
            ]);
        } catch {
            setError("Network error. Please try again.");
        } finally {
            setGenerating(null);
        }
    }, [user]);

    // Auto-trigger if arriving from investor dashboard with a pre-selected product
    useEffect(() => {
        if (preselectedId && preselectedName && user && products.length > 0) {
            const id = parseInt(preselectedId, 10);
            if (!isNaN(id) && !generating) {
                handleGenerate(id, preselectedName);
            }
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [preselectedId, preselectedName, user, products.length]);

    const wasGenerated = (id: number) => generated.some(g => g.productId === id);

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
                    <div className="flex items-start gap-4">
                        <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-600 to-teal-600 shadow-lg shadow-emerald-900/30">
                            <FileText className="h-6 w-6 text-white" />
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold text-white">Due Diligence Reports</h1>
                            <p className="text-sm text-slate-400 mt-0.5">
                                AI-generated Gartner-style reports — Trust Score analysis, compliance, review sentiment, and risk factors.
                            </p>
                        </div>
                    </div>
                </div>

                {/* Plan error banner */}
                {planError && (
                    <div className="mb-6 flex items-start gap-3 rounded-2xl border border-amber-500/30 bg-amber-600/10 p-4">
                        <AlertCircle className="h-5 w-5 shrink-0 text-amber-400 mt-0.5" />
                        <div>
                            <p className="font-semibold text-amber-300 text-sm">Investor Plan Required</p>
                            <p className="text-xs text-amber-400 mt-0.5">{error}</p>
                            <Link href="/pricing" className="mt-2 inline-flex text-xs font-semibold text-amber-300 hover:text-amber-200 underline">
                                View plans →
                            </Link>
                        </div>
                    </div>
                )}

                {/* General error */}
                {error && !planError && (
                    <div className="mb-6 flex items-center gap-3 rounded-2xl border border-red-500/30 bg-red-600/10 px-4 py-3 text-sm text-red-400">
                        <AlertCircle className="h-4 w-4 shrink-0" /> {error}
                    </div>
                )}

                {/* Generated this session */}
                {generated.length > 0 && (
                    <div className="mb-8">
                        <h2 className="mb-3 text-sm font-semibold text-slate-400 uppercase tracking-wider">Generated This Session</h2>
                        <div className="space-y-2">
                            {generated.map(g => (
                                <div
                                    key={g.productId}
                                    className="flex items-center gap-3 rounded-xl border border-emerald-500/20 bg-emerald-600/10 px-4 py-3"
                                >
                                    <CheckCircle className="h-4 w-4 shrink-0 text-emerald-400" />
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-semibold text-white">{g.productName}</p>
                                        <p className="text-xs text-slate-500">
                                            Downloaded at {g.generatedAt.toLocaleTimeString()}
                                        </p>
                                    </div>
                                    <button
                                        onClick={() => handleGenerate(g.productId, g.productName)}
                                        disabled={generating === g.productId}
                                        className="flex items-center gap-1.5 rounded-lg border border-emerald-500/30 px-3 py-1.5 text-xs font-semibold text-emerald-300 hover:bg-emerald-600/15 transition-all disabled:opacity-50"
                                    >
                                        {generating === g.productId
                                            ? <Loader2 className="h-3 w-3 animate-spin" />
                                            : <Download className="h-3 w-3" />}
                                        Re-download
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Product search + list */}
                <div>
                    <div className="mb-4 flex items-center justify-between">
                        <h2 className="text-lg font-bold text-white">Select a Startup</h2>
                        <span className="text-xs text-slate-500">{filteredProducts.length} startups</span>
                    </div>

                    <div className="relative mb-4">
                        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
                        <input
                            type="text"
                            placeholder="Search by startup name…"
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                            className="w-full rounded-xl border border-white/10 bg-white/[0.04] pl-9 pr-4 py-2.5 text-sm text-slate-200 placeholder:text-slate-600 focus:border-emerald-500/40 focus:outline-none"
                        />
                    </div>

                    {loadingProds ? (
                        <div className="space-y-3">
                            {[1, 2, 3].map(i => (
                                <div key={i} className="h-20 animate-pulse rounded-2xl border border-white/10 bg-white/[0.03]" />
                            ))}
                        </div>
                    ) : filteredProducts.length === 0 ? (
                        <div className="rounded-2xl border border-white/10 bg-white/[0.03] py-12 text-center text-slate-500">
                            No approved healthcare startups found.
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {filteredProducts.slice(0, 30).map(p => {
                                const isGen    = generating === p.id;
                                const wasDone  = wasGenerated(p.id);
                                const score    = p.trust_score ?? 0;
                                const scoreColor =
                                    score >= 80 ? "text-emerald-400" :
                                    score >= 60 ? "text-amber-400" :
                                    "text-red-400";

                                return (
                                    <div
                                        key={p.id}
                                        className={`flex items-center gap-4 rounded-2xl border px-5 py-4 backdrop-blur-sm transition-all ${
                                            wasDone
                                                ? "border-emerald-500/20 bg-emerald-600/5"
                                                : "border-white/10 bg-white/[0.03] hover:bg-white/[0.05]"
                                        }`}
                                    >
                                        {/* Score */}
                                        <div className="flex h-11 w-11 flex-shrink-0 flex-col items-center justify-center rounded-xl bg-white/[0.06]">
                                            <span className={`text-base font-extrabold leading-none ${scoreColor}`}>{score}</span>
                                            <span className="text-[8px] text-slate-600 uppercase">score</span>
                                        </div>

                                        {/* Info */}
                                        <div className="min-w-0 flex-1">
                                            <div className="flex items-center gap-2 flex-wrap">
                                                <p className="font-semibold text-white text-sm">{p.name}</p>
                                                {wasDone && (
                                                    <span className="text-[10px] font-semibold text-emerald-400 flex items-center gap-0.5">
                                                        <CheckCircle className="h-3 w-3" /> Downloaded
                                                    </span>
                                                )}
                                            </div>
                                            <div className="mt-0.5 flex items-center gap-2">
                                                {p.healthcare_category && (
                                                    <span className="text-[10px] text-slate-500">
                                                        {p.healthcare_category.replace(/_/g, " ")}
                                                    </span>
                                                )}
                                                {p.revenue_stage && (
                                                    <span className="text-[10px] text-slate-600">· {p.revenue_stage}</span>
                                                )}
                                            </div>
                                        </div>

                                        {/* Generate button */}
                                        <button
                                            id={`report-btn-${p.id}`}
                                            onClick={() => handleGenerate(p.id, p.name)}
                                            disabled={!!generating}
                                            className="flex flex-shrink-0 items-center gap-1.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 px-4 py-2 text-xs font-semibold text-white shadow-lg shadow-emerald-900/20 transition-all hover:shadow-emerald-900/40 disabled:opacity-50"
                                        >
                                            {isGen ? (
                                                <><Loader2 className="h-3 w-3 animate-spin" /> Generating…</>
                                            ) : (
                                                <><Download className="h-3 w-3" /> {wasDone ? "Re-download" : "Generate PDF"}</>
                                            )}
                                        </button>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>

                {/* Info footer */}
                <div className="mt-8 rounded-2xl border border-white/10 bg-white/[0.02] p-5">
                    <div className="flex items-start gap-3">
                        <Building2 className="h-4 w-4 shrink-0 text-slate-600 mt-0.5" />
                        <div>
                            <p className="text-xs font-semibold text-slate-400">About These Reports</p>
                            <p className="mt-1 text-xs text-slate-600 leading-relaxed">
                                Reports are generated on-demand using real EthAum platform data (Trust Score, reviews, compliance, upvotes) combined with Groq LLaMA AI analysis. Available exclusively to Investor plan subscribers. Reports do not constitute financial advice.
                            </p>
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
}
