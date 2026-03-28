"use client";

import { useEffect, useState, useCallback } from "react";
import { useUser } from "@clerk/nextjs";
import { useUserSync } from "@/hooks/useUserSync";
import {
    TrendingUp,
    Search,
    BookmarkPlus,
    BarChart3,
    FileText,
    MessageSquare,
    ArrowRight,
    Star,
    Zap,
    Filter,
    Flame,
    ChevronDown,
    ExternalLink,
    Loader2,
} from "lucide-react";
import Link from "next/link";
import {
    BarChart,
    Bar,
    LineChart,
    Line,
    XAxis,
    YAxis,
    Tooltip,
    ResponsiveContainer,
    CartesianGrid,
    Cell,
} from "recharts";

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

// ─── TYPES ───────────────────────────────────────────────────────────────────

interface Product {
    id: number;
    name: string;
    category: string;
    trust_score: number;
    revenue_stage: string | null;
    healthcare_category: string | null;
    compliance: string[];
    total_funding: string | null;
    description: string | null;
    tagline: string | null;
}

interface CategoryTrend {
    category: string;
    label: string;
    count: number;
    avg_trust_score: number;
    is_hot: boolean;
}

// ─── STAT CARD ────────────────────────────────────────────────────────────────

function StatCard({
    label,
    value,
    icon: Icon,
    sub,
    loading,
}: {
    label: string;
    value: string;
    icon: React.FC<{ className?: string }>;
    sub?: string;
    loading?: boolean;
}) {
    return (
        <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-5 backdrop-blur-sm">
            <div className="mb-3 flex items-center justify-between">
                <p className="text-xs font-semibold uppercase tracking-widest text-slate-500">{label}</p>
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-600/15">
                    <Icon className="h-4 w-4 text-emerald-400" />
                </div>
            </div>
            {loading ? (
                <div className="h-8 w-12 animate-pulse rounded-md bg-white/10" />
            ) : (
                <p className="text-3xl font-bold text-white">{value}</p>
            )}
            {sub && <p className="mt-1 text-xs text-slate-500">{sub}</p>}
        </div>
    );
}

// ─── PRODUCT ROW (Discovery Feed) ────────────────────────────────────────────

function ProductRow({ product, userId }: { product: Product; userId: string }) {
    const score = product.trust_score ?? 0;
    const scoreColor =
        score >= 80 ? "text-emerald-400" :
        score >= 60 ? "text-amber-400" :
        "text-red-400";

    return (
        <div className="group flex items-center gap-4 rounded-2xl border border-white/10 bg-white/[0.03] px-5 py-4 backdrop-blur-sm transition-all hover:bg-white/[0.06] hover:border-emerald-500/20">
            {/* Score badge */}
            <div className="flex h-12 w-12 flex-shrink-0 flex-col items-center justify-center rounded-xl bg-white/[0.06]">
                <span className={`text-lg font-extrabold leading-none ${scoreColor}`}>{score}</span>
                <span className="text-[9px] text-slate-600 uppercase tracking-wide">score</span>
            </div>

            {/* Info */}
            <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2 flex-wrap">
                    <p className="font-semibold text-white">{product.name}</p>
                    {product.healthcare_category && (
                        <span className="rounded-full border border-emerald-500/20 bg-emerald-600/10 px-2 py-0.5 text-[10px] font-medium text-emerald-300">
                            {product.healthcare_category.replace(/_/g, " ")}
                        </span>
                    )}
                    {product.revenue_stage && (
                        <span className="rounded-full border border-white/10 bg-white/[0.04] px-2 py-0.5 text-[10px] text-slate-400">
                            {product.revenue_stage.replace(/_/g, " ")}
                        </span>
                    )}
                </div>
                <p className="mt-0.5 truncate text-xs text-slate-500">
                    {product.tagline || product.description || "No description"}
                </p>
            </div>

            {/* Compliance chips */}
            <div className="hidden gap-1 sm:flex flex-shrink-0">
                {(product.compliance || []).slice(0, 2).map((c) => (
                    <span key={c} className="rounded-full bg-teal-600/10 border border-teal-500/20 px-2 py-0.5 text-[9px] font-semibold text-teal-300 uppercase">
                        {c}
                    </span>
                ))}
            </div>

            {/* Actions */}
            <div className="flex flex-shrink-0 items-center gap-2">
                <Link
                    href={`/product/${product.id}`}
                    className="flex items-center gap-1 rounded-lg border border-white/10 bg-white/[0.04] px-3 py-1.5 text-xs font-semibold text-slate-300 transition-all hover:border-emerald-500/30 hover:text-emerald-300"
                >
                    View <ExternalLink className="h-3 w-3" />
                </Link>
                <Link
                    href={`/dashboard/investor/reports?product=${product.id}&name=${encodeURIComponent(product.name)}`}
                    className="flex items-center gap-1 rounded-lg bg-emerald-600/15 border border-emerald-500/20 px-3 py-1.5 text-xs font-semibold text-emerald-300 transition-all hover:bg-emerald-600/25"
                >
                    <FileText className="h-3 w-3" /> Report
                </Link>
            </div>
        </div>
    );
}

// ─── CUSTOM TOOLTIP ───────────────────────────────────────────────────────────

function ChartTooltip({ active, payload, label }: any) {
    if (!active || !payload?.length) return null;
    return (
        <div className="rounded-xl border border-white/10 bg-[#0f172a]/95 px-3 py-2 text-xs text-white shadow-xl backdrop-blur-sm">
            <p className="mb-1 font-semibold text-emerald-300">{label}</p>
            {payload.map((entry: any) => (
                <p key={entry.dataKey} className="text-slate-300">
                    {entry.name}: <span className="font-bold text-white">{entry.value}</span>
                </p>
            ))}
        </div>
    );
}

// ─── MAIN PAGE ────────────────────────────────────────────────────────────────

const SORT_OPTIONS = [
    { value: "trust_score", label: "Trust Score" },
    { value: "latest",      label: "Latest" },
];

const TREND_FILTERS = ["All", "Rising", "Stable", "Falling"] as const;
type TrendFilter = typeof TREND_FILTERS[number];

export default function InvestorDashboard() {
    const { user }    = useUser();
    const { profile } = useUserSync();

    const fundName = profile?.company_name ?? user?.firstName ?? "Investor";

    // ── Stats state ──────────────────────────────────────────────────────────
    const [watchlistCount,  setWatchlistCount]  = useState<number | null>(null);
    const [introCount,      setIntroCount]      = useState<number | null>(null);
    const [reportCount,     setReportCount]     = useState(0);
    const [statsLoading,    setStatsLoading]    = useState(true);

    // ── Discovery state ──────────────────────────────────────────────────────
    const [products,        setProducts]        = useState<Product[]>([]);
    const [search,          setSearch]          = useState("");
    const [sort,            setSort]            = useState("trust_score");
    const [trendFilter,     setTrendFilter]     = useState<TrendFilter>("All");
    const [discLoading,     setDiscLoading]     = useState(true);

    // ── Trends state ─────────────────────────────────────────────────────────
    const [trends,          setTrends]          = useState<CategoryTrend[]>([]);
    const [platformAvg,     setPlatformAvg]     = useState<number>(0);
    const [trendsLoading,   setTrendsLoading]   = useState(true);

    // ── Fetch stats ──────────────────────────────────────────────────────────
    useEffect(() => {
        if (!user) return;
        const h = { "X-Clerk-User-Id": user.id };

        Promise.all([
            fetch(`${API}/api/v1/watchlist`, { headers: h }).then(r => r.json()),
            fetch(`${API}/api/v1/messages/inbox`, { headers: h }).then(r => r.json()),
        ])
            .then(([wl, msgs]) => {
                setWatchlistCount(Array.isArray(wl) ? wl.length : 0);
                const sent = Array.isArray(msgs)
                    ? msgs.filter((m: any) => m.from_user === user.id).length
                    : 0;
                setIntroCount(sent);
            })
            .catch(() => { setWatchlistCount(0); setIntroCount(0); })
            .finally(() => setStatsLoading(false));
    }, [user]);

    // ── Fetch discovery products ──────────────────────────────────────────────
    const fetchProducts = useCallback(() => {
        setDiscLoading(true);
        const params = new URLSearchParams({ sort, vertical: "healthcare" });
        if (search) params.set("search", search);

        fetch(`${API}/api/v1/products?${params}`)
            .then(r => r.json())
            .then((data: Product[]) => {
                if (!Array.isArray(data)) { setProducts([]); return; }

                // Client-side trust score trend filter
                let filtered = data;
                if (trendFilter === "Rising")  filtered = data.filter(p => p.trust_score >= 80);
                if (trendFilter === "Stable")  filtered = data.filter(p => p.trust_score >= 60 && p.trust_score < 80);
                if (trendFilter === "Falling") filtered = data.filter(p => p.trust_score < 60);

                setProducts(filtered);
            })
            .catch(() => setProducts([]))
            .finally(() => setDiscLoading(false));
    }, [sort, search, trendFilter]);

    useEffect(() => { fetchProducts(); }, [fetchProducts]);

    // ── Fetch category trends ─────────────────────────────────────────────────
    useEffect(() => {
        if (!user) return;
        fetch(`${API}/api/v1/reports/investor/trends`, {
            headers: { "X-Clerk-User-Id": user.id },
        })
            .then(r => r.json())
            .then(d => {
                setTrends(d.categories || []);
                setPlatformAvg(d.avg_platform_trust_score || 0);
            })
            .catch(() => {})
            .finally(() => setTrendsLoading(false));
    }, [user]);

    const barData = trends.slice(0, 7).map(t => ({
        name:  t.label.length > 14 ? t.label.slice(0, 14) + "…" : t.label,
        label: t.label,
        count: t.count,
        score: t.avg_trust_score,
        hot:   t.is_hot,
    }));

    return (
        <div className="min-h-screen bg-[#0A0B14] antialiased">
            {/* Ambient gradient */}
            <div className="pointer-events-none fixed inset-0 overflow-hidden">
                <div className="absolute -top-40 -right-40 h-[600px] w-[600px] rounded-full bg-emerald-600/15 blur-[120px]" />
                <div className="absolute bottom-0 -left-40 h-[500px] w-[500px] rounded-full bg-teal-600/10 blur-[100px]" />
            </div>

            <div className="relative z-10 mx-auto max-w-6xl px-4 py-10 sm:px-6">

                {/* ── HEADER ─────────────────────────────────────────────── */}
                <div className="mb-10 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <div className="mb-1 inline-flex items-center gap-1.5 rounded-full border border-emerald-500/30 bg-emerald-600/10 px-3 py-1 text-xs font-semibold text-emerald-300">
                            <TrendingUp className="h-3 w-3" /> Investor / VC
                        </div>
                        <h1 className="text-3xl font-bold text-white mt-1">
                            {fundName}&apos;s Deal Flow
                        </h1>
                        <p className="text-slate-400">
                            AI-powered healthcare startup discovery with live Trust Scores.
                        </p>
                    </div>
                    <Link
                        href="/marketplace"
                        className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-emerald-900/30 hover:shadow-emerald-900/50 transition-all self-start sm:self-auto"
                    >
                        Browse All <ArrowRight className="h-4 w-4" />
                    </Link>
                </div>

                {/* ── STAT CARDS ──────────────────────────────────────────── */}
                <div className="mb-8 grid grid-cols-2 gap-4 lg:grid-cols-4">
                    <StatCard label="Watchlist"       value={watchlistCount !== null ? String(watchlistCount) : "—"} icon={BookmarkPlus}  sub="Startups tracked"      loading={statsLoading} />
                    <StatCard label="Intro Requests"  value={introCount     !== null ? String(introCount)     : "—"} icon={MessageSquare} sub="Sent to founders"      loading={statsLoading} />
                    <StatCard label="Platform Avg"    value={platformAvg ? `${platformAvg}` : "—"}                   icon={Star}          sub="Avg Trust Score"       loading={trendsLoading} />
                    <StatCard label="Due Diligence"   value={String(reportCount)}                                     icon={FileText}      sub="Reports generated" />
                </div>

                {/* ── SECTION: DISCOVERY FEED ─────────────────────────────── */}
                <div className="mb-10">
                    <h2 className="mb-4 text-lg font-bold text-white">Healthcare Deal Flow</h2>

                    {/* Controls bar */}
                    <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                        {/* Search */}
                        <div className="relative flex-1 max-w-sm">
                            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
                            <input
                                type="text"
                                placeholder="Search startups…"
                                value={search}
                                onChange={e => setSearch(e.target.value)}
                                className="w-full rounded-xl border border-white/10 bg-white/[0.04] pl-9 pr-4 py-2 text-sm text-slate-200 placeholder:text-slate-600 focus:border-emerald-500/40 focus:outline-none"
                            />
                        </div>

                        <div className="flex items-center gap-2 flex-wrap">
                            {/* Trust Score trend pills */}
                            <div className="flex items-center gap-1">
                                <Filter className="h-3.5 w-3.5 text-slate-500" />
                                {TREND_FILTERS.map(tf => (
                                    <button
                                        key={tf}
                                        onClick={() => setTrendFilter(tf)}
                                        className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-all ${
                                            trendFilter === tf
                                                ? "bg-emerald-600 text-white"
                                                : "border border-white/10 bg-white/[0.04] text-slate-400 hover:text-white"
                                        }`}
                                    >
                                        {tf}
                                    </button>
                                ))}
                            </div>

                            {/* Sort */}
                            <div className="relative">
                                <select
                                    value={sort}
                                    onChange={e => setSort(e.target.value)}
                                    className="appearance-none rounded-xl border border-white/10 bg-white/[0.04] py-1.5 pl-3 pr-7 text-xs text-slate-300 focus:outline-none"
                                >
                                    {SORT_OPTIONS.map(o => (
                                        <option key={o.value} value={o.value}>{o.label}</option>
                                    ))}
                                </select>
                                <ChevronDown className="pointer-events-none absolute right-2 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-500" />
                            </div>
                        </div>
                    </div>

                    {/* Product list */}
                    {discLoading ? (
                        <div className="space-y-3">
                            {[1,2,3,4].map(i => (
                                <div key={i} className="h-20 animate-pulse rounded-2xl border border-white/10 bg-white/[0.03]" />
                            ))}
                        </div>
                    ) : products.length === 0 ? (
                        <div className="rounded-2xl border border-white/10 bg-white/[0.03] py-12 text-center text-slate-500">
                            No startups match the current filters.
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {products.slice(0, 20).map(p => (
                                <ProductRow key={p.id} product={p} userId={user?.id ?? ""} />
                            ))}
                        </div>
                    )}
                </div>

                {/* ── SECTION: CATEGORY TRENDS ────────────────────────────── */}
                <div className="mb-10">
                    <div className="mb-5 flex items-center justify-between">
                        <h2 className="text-lg font-bold text-white">Healthcare Category Trends</h2>
                        <span className="text-xs text-slate-500">Live from platform data</span>
                    </div>

                    {trendsLoading ? (
                        <div className="grid gap-4 lg:grid-cols-2">
                            <div className="h-64 animate-pulse rounded-2xl border border-white/10 bg-white/[0.03]" />
                            <div className="h-64 animate-pulse rounded-2xl border border-white/10 bg-white/[0.03]" />
                        </div>
                    ) : trends.length === 0 ? (
                        <div className="rounded-2xl border border-white/10 bg-white/[0.03] py-12 text-center text-slate-500">
                            No trend data available yet — approval more products to see charts.
                        </div>
                    ) : (
                        <div className="grid gap-4 lg:grid-cols-2">
                            {/* Bar Chart — Startups per category */}
                            <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5 backdrop-blur-sm">
                                <div className="mb-4 flex items-center gap-2">
                                    <BarChart3 className="h-4 w-4 text-emerald-400" />
                                    <p className="text-sm font-semibold text-white">Startups per Category</p>
                                </div>
                                <ResponsiveContainer width="100%" height={220}>
                                    <BarChart data={barData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                                        <CartesianGrid strokeDasharray="3 3" stroke="#ffffff08" />
                                        <XAxis
                                            dataKey="name"
                                            tick={{ fill: "#64748b", fontSize: 10 }}
                                            tickLine={false}
                                            axisLine={false}
                                        />
                                        <YAxis
                                            tick={{ fill: "#64748b", fontSize: 10 }}
                                            tickLine={false}
                                            axisLine={false}
                                            allowDecimals={false}
                                        />
                                        <Tooltip content={<ChartTooltip />} cursor={{ fill: "#ffffff06" }} />
                                        <Bar dataKey="count" name="Startups" radius={[4, 4, 0, 0]}>
                                            {barData.map((entry, index) => (
                                                <Cell
                                                    key={`cell-${index}`}
                                                    fill={entry.hot ? "#10b981" : "#14b8a6"}
                                                    fillOpacity={entry.hot ? 1 : 0.6}
                                                />
                                            ))}
                                        </Bar>
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>

                            {/* Line Chart — Avg Trust Score per category */}
                            <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5 backdrop-blur-sm">
                                <div className="mb-4 flex items-center gap-2">
                                    <TrendingUp className="h-4 w-4 text-teal-400" />
                                    <p className="text-sm font-semibold text-white">Avg Trust Score by Category</p>
                                </div>
                                <ResponsiveContainer width="100%" height={220}>
                                    <LineChart data={barData} margin={{ top: 0, right: 8, left: -20, bottom: 0 }}>
                                        <CartesianGrid strokeDasharray="3 3" stroke="#ffffff08" />
                                        <XAxis
                                            dataKey="name"
                                            tick={{ fill: "#64748b", fontSize: 10 }}
                                            tickLine={false}
                                            axisLine={false}
                                        />
                                        <YAxis
                                            domain={[0, 100]}
                                            tick={{ fill: "#64748b", fontSize: 10 }}
                                            tickLine={false}
                                            axisLine={false}
                                        />
                                        <Tooltip content={<ChartTooltip />} />
                                        <Line
                                            type="monotone"
                                            dataKey="score"
                                            name="Avg Trust Score"
                                            stroke="#10b981"
                                            strokeWidth={2}
                                            dot={{ fill: "#10b981", r: 4 }}
                                            activeDot={{ r: 6, fill: "#34d399" }}
                                        />
                                    </LineChart>
                                </ResponsiveContainer>
                            </div>
                        </div>
                    )}

                    {/* Hot this month badges */}
                    {trends.filter(t => t.is_hot).length > 0 && (
                        <div className="mt-4 flex flex-wrap gap-2">
                            {trends.filter(t => t.is_hot).map(t => (
                                <div
                                    key={t.category}
                                    className="flex items-center gap-1.5 rounded-full border border-amber-500/30 bg-amber-600/10 px-3 py-1 text-xs font-semibold text-amber-300"
                                >
                                    <Flame className="h-3 w-3" /> Hot this month: {t.label}
                                    <span className="text-amber-500">({t.count} startups)</span>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* ── SECTION: QUICK LINKS ────────────────────────────────── */}
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                    {[
                        { href: "/dashboard/investor/watchlist", icon: BookmarkPlus,  title: "My Watchlist",          desc: "Startups you're tracking" },
                        { href: "/dashboard/investor/reports",   icon: FileText,      title: "Due Diligence Reports", desc: "AI-generated investor reports" },
                        { href: "/messages",                     icon: MessageSquare, title: "Intro Requests",        desc: "Direct connection with founders" },
                        { href: "/leaderboard",                  icon: Star,          title: "Trust Score Leaders",   desc: "Top-ranked healthcare startups" },
                        { href: "/insights",                     icon: BarChart3,     title: "Market Insights",       desc: "Gartner-style quadrant analysis" },
                        { href: "/challenges",                   icon: Zap,           title: "Challenge Board",       desc: "Active enterprise innovation challenges" },
                    ].map(({ href, icon: Icon, title, desc }) => (
                        <Link
                            key={href}
                            href={href}
                            className="group flex items-center gap-4 rounded-2xl border border-white/10 bg-white/[0.03] p-4 backdrop-blur-sm transition-all hover:bg-white/[0.06] hover:border-emerald-500/30"
                        >
                            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-600 to-teal-600 flex-shrink-0 shadow-lg shadow-emerald-900/30">
                                <Icon className="h-5 w-5 text-white" />
                            </div>
                            <div className="min-w-0 flex-1">
                                <p className="font-semibold text-white text-sm">{title}</p>
                                <p className="text-xs text-slate-500">{desc}</p>
                            </div>
                            <ArrowRight className="h-4 w-4 text-slate-600 transition-transform group-hover:translate-x-1 group-hover:text-emerald-400" />
                        </Link>
                    ))}
                </div>

            </div>
        </div>
    );
}
