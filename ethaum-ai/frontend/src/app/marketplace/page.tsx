"use client";

import { useEffect, useState, useCallback } from "react";
import { getFilteredProducts, getLeaderboard, Product, Launch, ProductFilters } from "@/lib/api";
import { Input } from "@/components/ui/input";
import {
    Search,
    Filter,
    X,
    ChevronDown,
    ChevronUp,
    SlidersHorizontal,
    Heart,
    ExternalLink,
    ArrowUp,
    TrendingUp,
    Loader2,
} from "lucide-react";
import Link from "next/link";
import { TrustScoreBadge } from "@/components/TrustScoreBadge";

// ─── FILTER DATA ──────────────────────────────────────────────────────────────

const HEALTHCARE_CATEGORIES = [
    "Chronic Disease Management",
    "Cardiology",
    "Mental Health Tech",
    "Diagnostics & Imaging AI",
    "Hospital Management",
    "Wellness & Preventive Care",
    "Telehealth / Remote Care",
    "Medical Devices & IoT",
    "Pharmacy & MedTech",
    "EdTech for Healthcare",
];

const COMPLIANCE_OPTIONS = [
    { value: "hipaa", label: "HIPAA" },
    { value: "fda",   label: "FDA Cleared" },
    { value: "ce_mark", label: "CE Mark" },
    { value: "iso_13485", label: "ISO 13485" },
    { value: "soc2",  label: "SOC 2" },
    { value: "gdpr",  label: "GDPR" },
];

const REVENUE_STAGES = [
    { value: "seed",     label: "Seed" },
    { value: "series_a", label: "Series A" },
    { value: "series_b", label: "Series B" },
    { value: "series_c", label: "Series C" },
    { value: "series_d", label: "Series D" },
];

const GEOGRAPHY_OPTIONS = [
    { value: "us",     label: "🇺🇸 United States" },
    { value: "eu",     label: "🇪🇺 Europe" },
    { value: "india",  label: "🇮🇳 India" },
    { value: "asean",  label: "🌏 ASEAN" },
    { value: "global", label: "🌍 Global" },
];

const TRUST_THRESHOLDS = [
    { value: 0,  label: "Any" },
    { value: 60, label: "60+" },
    { value: 70, label: "70+" },
    { value: 80, label: "80+" },
    { value: 90, label: "90+" },
];

// ─── COMPLIANCE BADGE ─────────────────────────────────────────────────────────

const COMPLIANCE_COLOURS: Record<string, string> = {
    hipaa:     "bg-blue-100 text-blue-700 border-blue-200",
    fda:       "bg-emerald-100 text-emerald-700 border-emerald-200",
    ce_mark:   "bg-indigo-100 text-indigo-700 border-indigo-200",
    iso_13485: "bg-amber-100 text-amber-700 border-amber-200",
    soc2:      "bg-violet-100 text-violet-700 border-violet-200",
    gdpr:      "bg-rose-100 text-rose-700 border-rose-200",
};

function ComplianceBadge({ value }: { value: string }) {
    const label = COMPLIANCE_OPTIONS.find((c) => c.value === value.toLowerCase())?.label ?? value.toUpperCase();
    const colour = COMPLIANCE_COLOURS[value.toLowerCase()] ?? "bg-gray-100 text-gray-600 border-gray-200";
    return (
        <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold ${colour}`}>
            {label}
        </span>
    );
}

// ─── FILTER SIDEBAR SECTION ───────────────────────────────────────────────────

function FilterSection({
    title,
    defaultOpen = true,
    children,
}: {
    title: string;
    defaultOpen?: boolean;
    children: React.ReactNode;
}) {
    const [open, setOpen] = useState(defaultOpen);
    return (
        <div className="border-b border-gray-100 pb-4">
            <button
                onClick={() => setOpen(!open)}
                className="flex w-full items-center justify-between py-2 text-sm font-semibold text-gray-700 hover:text-gray-900"
            >
                {title}
                {open ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
            </button>
            {open && <div className="mt-2 space-y-1.5">{children}</div>}
        </div>
    );
}

function MultiCheck({
    options,
    selected,
    onChange,
}: {
    options: { value: string; label: string }[];
    selected: string[];
    onChange: (v: string[]) => void;
}) {
    const toggle = (val: string) =>
        onChange(selected.includes(val) ? selected.filter((v) => v !== val) : [...selected, val]);
    return (
        <>
            {options.map((opt) => (
                <label key={opt.value} className="flex items-center gap-2 cursor-pointer group">
                    <input
                        type="checkbox"
                        checked={selected.includes(opt.value)}
                        onChange={() => toggle(opt.value)}
                        className="h-3.5 w-3.5 rounded border-gray-300 text-violet-600 accent-violet-600"
                    />
                    <span className="text-sm text-gray-600 group-hover:text-gray-900">{opt.label}</span>
                </label>
            ))}
        </>
    );
}

// ─── PRODUCT CARD V2 ──────────────────────────────────────────────────────────

function ProductCardV2({
    product,
    upvotes,
}: {
    product: Product;
    upvotes?: number;
}) {
    return (
        <Link href={`/product/${product.id}`} className="group block">
            <div className="flex items-center gap-4 rounded-2xl border border-gray-100 bg-white p-4 shadow-sm transition-all hover:shadow-md hover:border-violet-200 hover:-translate-y-0.5">
                {/* Logo placeholder */}
                <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-violet-100 to-indigo-100 text-lg font-bold text-violet-600">
                    {product.name.charAt(0)}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-gray-900 group-hover:text-violet-600 truncate">
                        {product.name}
                    </h3>
                    <div className="mt-1 flex flex-wrap items-center gap-1.5">
                        {product.category && (
                            <span className="rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-medium text-gray-600">
                                {product.category}
                            </span>
                        )}
                        {product.healthcare_category && (
                            <span className="rounded-full bg-violet-100 px-2.5 py-0.5 text-xs font-medium text-violet-700">
                                {product.healthcare_category}
                            </span>
                        )}
                        {product.revenue_stage && (
                            <span className="rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-medium text-blue-600">
                                {product.revenue_stage.replace("_", " ").toUpperCase()}
                            </span>
                        )}
                        {(product.compliance ?? []).slice(0, 2).map((c) => (
                            <ComplianceBadge key={c} value={c} />
                        ))}
                    </div>
                    {product.description && (
                        <p className="mt-1 text-xs text-gray-500 truncate max-w-sm">{product.description}</p>
                    )}
                </div>

                {/* Right side */}
                <div className="flex flex-col items-end gap-2 flex-shrink-0">
                    <TrustScoreBadge score={product.trust_score} size="sm" showLabel={false} />
                    {upvotes !== undefined && (
                        <div className="flex items-center gap-1 text-gray-400 text-xs font-medium">
                            <ArrowUp className="h-3 w-3" />
                            {upvotes}
                        </div>
                    )}
                </div>
            </div>
        </Link>
    );
}

// ─── MAIN PAGE ────────────────────────────────────────────────────────────────

const SORT_OPTIONS = [
    { value: "trust_score", label: "Trust Score" },
    { value: "latest",      label: "Newest First" },
    { value: "name",        label: "A → Z" },
];

export default function MarketplacePage() {
    const [products, setProducts]   = useState<Product[]>([]);
    const [leaderboard, setLeaderboard] = useState<Launch[]>([]);
    const [loading, setLoading]     = useState(true);
    const [sidebarOpen, setSidebarOpen] = useState(false);

    // Filter state
    const [filters, setFilters] = useState<ProductFilters>({
        vertical: "healthcare",
        sort: "trust_score",
    });
    const [searchInput, setSearchInput] = useState("");
    const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
    const [selectedCompliance, setSelectedCompliance]  = useState<string[]>([]);
    const [selectedStages, setSelectedStages]          = useState<string[]>([]);
    const [selectedGeos, setSelectedGeos]              = useState<string[]>([]);
    const [trustMin, setTrustMin]                      = useState(0);

    const activeFilterCount =
        selectedCategories.length +
        selectedCompliance.length +
        selectedStages.length +
        selectedGeos.length +
        (trustMin > 0 ? 1 : 0) +
        (searchInput ? 1 : 0);

    // Build & fire query whenever filter state changes
    const fetchProducts = useCallback(async () => {
        setLoading(true);
        try {
            const [productsData, leaderboardData] = await Promise.all([
                getFilteredProducts({
                    ...filters,
                    healthcare_category: selectedCategories.length ? selectedCategories : undefined,
                    compliance: selectedCompliance.length ? selectedCompliance : undefined,
                    revenue_stage: selectedStages.length ? selectedStages : undefined,
                    geography: selectedGeos.length ? selectedGeos : undefined,
                    trust_score_min: trustMin > 0 ? trustMin : undefined,
                    search: searchInput || undefined,
                }),
                getLeaderboard(),
            ]);
            setProducts(productsData);
            setLeaderboard(leaderboardData);
        } catch {
            setProducts([]);
        } finally {
            setLoading(false);
        }
    }, [filters, selectedCategories, selectedCompliance, selectedStages, selectedGeos, trustMin, searchInput]);

    useEffect(() => {
        const t = setTimeout(fetchProducts, 200);
        return () => clearTimeout(t);
    }, [fetchProducts]);

    const getUpvotes = (productId: number) =>
        leaderboard.find((l) => l.product_id === productId)?.upvotes;

    const resetFilters = () => {
        setSelectedCategories([]);
        setSelectedCompliance([]);
        setSelectedStages([]);
        setSelectedGeos([]);
        setTrustMin(0);
        setSearchInput("");
    };

    // ── FILTER SIDEBAR ────────────────────────────────────────────────────────
    const sidebar = (
        <aside className="w-60 flex-shrink-0 space-y-4">
            {/* Vertical toggle */}
            <div>
                <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-gray-400">Vertical</p>
                <div className="flex gap-2">
                    {["healthcare", "all"].map((v) => (
                        <button
                            key={v}
                            onClick={() => setFilters((f) => ({ ...f, vertical: v === "all" ? undefined : v }))}
                            className={`rounded-lg px-3 py-1.5 text-xs font-semibold capitalize transition-all border ${
                                (filters.vertical ?? "all") === v
                                    ? "bg-violet-600 text-white border-violet-600 shadow"
                                    : "bg-white text-gray-600 border-gray-200 hover:border-violet-300"
                            }`}
                        >
                            {v === "all" ? "All verticals" : "🏥 Healthcare"}
                        </button>
                    ))}
                </div>
            </div>

            {filters.vertical === "healthcare" && (
                <FilterSection title="Healthcare Category">
                    <MultiCheck
                        options={HEALTHCARE_CATEGORIES.map((c) => ({ value: c, label: c }))}
                        selected={selectedCategories}
                        onChange={setSelectedCategories}
                    />
                </FilterSection>
            )}

            <FilterSection title="Compliance / Certifications">
                <MultiCheck options={COMPLIANCE_OPTIONS} selected={selectedCompliance} onChange={setSelectedCompliance} />
            </FilterSection>

            <FilterSection title="Revenue Stage">
                <MultiCheck options={REVENUE_STAGES} selected={selectedStages} onChange={setSelectedStages} />
            </FilterSection>

            <FilterSection title="Geography">
                <MultiCheck options={GEOGRAPHY_OPTIONS} selected={selectedGeos} onChange={setSelectedGeos} />
            </FilterSection>

            <FilterSection title="Minimum Trust Score">
                <div className="flex flex-wrap gap-2">
                    {TRUST_THRESHOLDS.map(({ value, label }) => (
                        <button
                            key={value}
                            onClick={() => setTrustMin(value)}
                            className={`rounded-full px-3 py-1 text-xs font-semibold border transition-all ${
                                trustMin === value
                                    ? "bg-violet-600 text-white border-violet-600"
                                    : "bg-white text-gray-600 border-gray-200 hover:border-violet-300"
                            }`}
                        >
                            {label}
                        </button>
                    ))}
                </div>
            </FilterSection>

            {activeFilterCount > 0 && (
                <button
                    onClick={resetFilters}
                    className="flex w-full items-center justify-center gap-1.5 rounded-xl border border-red-200 bg-red-50 px-4 py-2 text-xs font-semibold text-red-600 hover:bg-red-100 transition-colors"
                >
                    <X className="h-3.5 w-3.5" /> Clear all filters ({activeFilterCount})
                </button>
            )}
        </aside>
    );

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Top bar */}
            <div className="sticky top-0 z-20 border-b border-gray-200 bg-white/80 backdrop-blur-sm">
                <div className="container mx-auto flex items-center gap-4 px-4 py-3">
                    {/* Search */}
                    <div className="relative flex-1 max-w-lg">
                        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                        <Input
                            placeholder="Search healthcare startups…"
                            value={searchInput}
                            onChange={(e) => setSearchInput(e.target.value)}
                            className="pl-9 h-8 text-sm"
                        />
                        {searchInput && (
                            <button
                                onClick={() => setSearchInput("")}
                                className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                            >
                                <X className="h-3.5 w-3.5" />
                            </button>
                        )}
                    </div>

                    {/* Sort */}
                    <select
                        value={filters.sort}
                        onChange={(e) => setFilters((f) => ({ ...f, sort: e.target.value as ProductFilters["sort"] }))}
                        className="h-8 rounded-lg border border-gray-200 bg-white px-3 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-violet-500/20"
                    >
                        {SORT_OPTIONS.map((o) => (
                            <option key={o.value} value={o.value}>{o.label}</option>
                        ))}
                    </select>

                    {/* Mobile filter toggle */}
                    <button
                        onClick={() => setSidebarOpen(!sidebarOpen)}
                        className="flex items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-3 h-8 text-sm font-medium text-gray-600 hover:border-violet-300 lg:hidden"
                    >
                        <Filter className="h-3.5 w-3.5" />
                        Filters
                        {activeFilterCount > 0 && (
                            <span className="flex h-4 w-4 items-center justify-center rounded-full bg-violet-600 text-[10px] text-white">
                                {activeFilterCount}
                            </span>
                        )}
                    </button>

                    {/* Results count */}
                    <p className="hidden sm:block text-sm text-gray-500 whitespace-nowrap">
                        {loading ? "…" : `${products.length} startups`}
                    </p>
                </div>
            </div>

            <div className="container mx-auto px-4 py-6">
                {/* Header */}
                <div className="mb-6">
                    <div className="flex items-center gap-2 mb-1">
                        <TrendingUp className="h-5 w-5 text-violet-600" />
                        <h1 className="text-2xl font-bold text-gray-900">Healthcare Marketplace</h1>
                    </div>
                    <p className="text-gray-500 text-sm">
                        Discover verified healthcare startups — filtered by compliance, stage, and geography.
                    </p>
                </div>

                <div className="flex gap-6">
                    {/* Sidebar — desktop */}
                    <div className="hidden lg:block">{sidebar}</div>

                    {/* Mobile sidebar overlay */}
                    {sidebarOpen && (
                        <div className="fixed inset-0 z-40 lg:hidden">
                            <div className="absolute inset-0 bg-black/40" onClick={() => setSidebarOpen(false)} />
                            <div className="absolute left-0 top-0 h-full w-72 overflow-y-auto bg-white p-5 shadow-2xl">
                                <div className="mb-4 flex items-center justify-between">
                                    <h2 className="font-bold text-gray-900">Filters</h2>
                                    <button onClick={() => setSidebarOpen(false)}>
                                        <X className="h-5 w-5 text-gray-500" />
                                    </button>
                                </div>
                                {sidebar}
                            </div>
                        </div>
                    )}

                    {/* Products list */}
                    <div className="flex-1 min-w-0">
                        {loading ? (
                            <div className="flex items-center justify-center py-20">
                                <Loader2 className="h-6 w-6 animate-spin text-violet-600" />
                            </div>
                        ) : products.length === 0 ? (
                            <div className="rounded-2xl border border-gray-200 bg-white p-12 text-center">
                                <SlidersHorizontal className="mx-auto h-10 w-10 text-gray-300 mb-3" />
                                <h3 className="font-semibold text-gray-700 mb-1">No startups match your filters</h3>
                                <p className="text-sm text-gray-500 mb-4">Try removing some filters to see more results.</p>
                                <button
                                    onClick={resetFilters}
                                    className="rounded-xl bg-violet-600 px-4 py-2 text-sm font-semibold text-white hover:bg-violet-700 transition-colors"
                                >
                                    Clear all filters
                                </button>
                            </div>
                        ) : (
                            <div className="space-y-3">
                                {products.map((product) => (
                                    <ProductCardV2
                                        key={product.id}
                                        product={product}
                                        upvotes={getUpvotes(product.id)}
                                    />
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
