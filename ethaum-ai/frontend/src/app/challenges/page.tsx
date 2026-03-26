"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { useUser } from "@clerk/nextjs";
import {
    Search,
    Plus,
    Filter,
    X,
    Clock,
    Trophy,
    Users,
    ChevronDown,
    ChevronUp,
    Loader2,
    Calendar,
    Globe,
    Shield,
    HeartPulse,
    Zap,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

// ─── TYPES ────────────────────────────────────────────────────────────────────

interface Challenge {
    id: string;
    posted_by: string;
    posted_by_name?: string;
    title: string;
    description?: string;
    vertical?: string;
    healthcare_category?: string;
    compliance_required?: string[];
    geography?: string[];
    stage_required?: string;
    prize_value?: string;
    deadline?: string;
    status: string;
    application_count: number;
    created_at?: string;
}

// ─── CONSTANTS ────────────────────────────────────────────────────────────────

const COMPLIANCE_LABELS: Record<string, string> = {
    hipaa: "HIPAA", fda: "FDA Cleared", ce_mark: "CE Mark",
    iso_13485: "ISO 13485", soc2: "SOC 2", gdpr: "GDPR",
};

const GEO_LABELS: Record<string, string> = {
    us: "🇺🇸 US", eu: "🇪🇺 EU", india: "🇮🇳 India",
    asean: "🌏 ASEAN", global: "🌍 Global",
};

const STATUS_CONFIG: Record<string, { label: string; className: string }> = {
    open:            { label: "Open",           className: "bg-emerald-100 text-emerald-700" },
    closed:          { label: "Closed",         className: "bg-gray-100 text-gray-500" },
    winner_selected: { label: "Winner Selected",className: "bg-violet-100 text-violet-700" },
};

// ─── DEADLINE COUNTDOWN ───────────────────────────────────────────────────────

function DeadlineChip({ deadline }: { deadline?: string }) {
    if (!deadline) return null;
    const d = new Date(deadline);
    const now = new Date();
    const diffDays = Math.ceil((d.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    const past = diffDays < 0;
    const urgent = diffDays >= 0 && diffDays <= 7;
    return (
        <span className={`inline-flex items-center gap-1 text-xs font-medium ${past ? "text-red-500" : urgent ? "text-amber-600" : "text-gray-500"}`}>
            <Clock className="h-3 w-3" />
            {past ? "Expired" : `${diffDays}d left`}
        </span>
    );
}

// ─── CHALLENGE CARD ───────────────────────────────────────────────────────────

function ChallengeCard({ challenge }: { challenge: Challenge }) {
    const status = STATUS_CONFIG[challenge.status] ?? { label: challenge.status, className: "bg-gray-100 text-gray-600" };
    return (
        <Link href={`/challenges/${challenge.id}`} className="group block">
            <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm transition-all hover:shadow-md hover:border-violet-200 hover:-translate-y-0.5">
                {/* Top row */}
                <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-violet-100 to-indigo-100 text-lg font-bold text-violet-600">
                            {(challenge.posted_by_name ?? "E").charAt(0)}
                        </div>
                        <div>
                            <p className="text-xs font-medium text-gray-400">{challenge.posted_by_name ?? "Enterprise"}</p>
                            <h3 className="font-semibold text-gray-900 group-hover:text-violet-600 leading-tight mt-0.5 line-clamp-2">
                                {challenge.title}
                            </h3>
                        </div>
                    </div>
                    <span className={`shrink-0 rounded-full px-2.5 py-0.5 text-xs font-semibold ${status.className}`}>
                        {status.label}
                    </span>
                </div>

                {/* Description preview */}
                {challenge.description && (
                    <p className="mt-3 text-sm text-gray-500 line-clamp-2">{challenge.description}</p>
                )}

                {/* Badges row */}
                <div className="mt-3 flex flex-wrap items-center gap-1.5">
                    {challenge.healthcare_category && (
                        <span className="inline-flex items-center gap-1 rounded-full bg-violet-100 px-2.5 py-0.5 text-xs font-medium text-violet-700">
                            <HeartPulse className="h-3 w-3" />{challenge.healthcare_category}
                        </span>
                    )}
                    {(challenge.compliance_required ?? []).slice(0, 2).map((c) => (
                        <span key={c} className="rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-medium text-blue-700">
                            {COMPLIANCE_LABELS[c] ?? c.toUpperCase()}
                        </span>
                    ))}
                    {(challenge.geography ?? []).slice(0, 2).map((g) => (
                        <span key={g} className="rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-medium text-gray-600">
                            {GEO_LABELS[g.toLowerCase()] ?? g}
                        </span>
                    ))}
                </div>

                {/* Bottom row */}
                <div className="mt-4 flex items-center justify-between border-t border-gray-50 pt-3">
                    <div className="flex items-center gap-4">
                        {challenge.prize_value && (
                            <span className="flex items-center gap-1 text-sm font-semibold text-violet-700">
                                <Trophy className="h-4 w-4" /> {challenge.prize_value}
                            </span>
                        )}
                        <span className="flex items-center gap-1 text-xs text-gray-400">
                            <Users className="h-3. w-3.5" /> {challenge.application_count} applied
                        </span>
                    </div>
                    <DeadlineChip deadline={challenge.deadline} />
                </div>
            </div>
        </Link>
    );
}

// ─── FILTER SIDEBAR ───────────────────────────────────────────────────────────

const HEALTHCARE_CATEGORIES = [
    "Chronic Disease Management","Cardiology","Mental Health Tech",
    "Diagnostics & Imaging AI","Hospital Management","Wellness & Preventive Care",
    "Telehealth / Remote Care","Medical Devices & IoT","Pharmacy & MedTech",
];

const COMPLIANCE_OPTIONS = [
    { value: "hipaa", label: "HIPAA" },{ value: "fda", label: "FDA Cleared" },
    { value: "ce_mark", label: "CE Mark" },{ value: "iso_13485", label: "ISO 13485" },
    { value: "soc2", label: "SOC 2" },{ value: "gdpr", label: "GDPR" },
];

function MultiCheck({
    options, selected, onChange,
}: { options: { value: string; label: string }[]; selected: string[]; onChange: (v: string[]) => void }) {
    const toggle = (val: string) =>
        onChange(selected.includes(val) ? selected.filter((v) => v !== val) : [...selected, val]);
    return (
        <div className="space-y-1.5">
            {options.map((opt) => (
                <label key={opt.value} className="flex items-center gap-2 cursor-pointer group">
                    <input type="checkbox" checked={selected.includes(opt.value)} onChange={() => toggle(opt.value)}
                        className="h-3.5 w-3.5 rounded border-gray-300 accent-violet-600" />
                    <span className="text-sm text-gray-600 group-hover:text-gray-900">{opt.label}</span>
                </label>
            ))}
        </div>
    );
}

function FilterSection({ title, children }: { title: string; children: React.ReactNode }) {
    const [open, setOpen] = useState(true);
    return (
        <div className="border-b border-gray-100 pb-4">
            <button onClick={() => setOpen(!open)} className="flex w-full items-center justify-between py-2 text-sm font-semibold text-gray-700">
                {title}
                {open ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
            </button>
            {open && <div className="mt-2">{children}</div>}
        </div>
    );
}

// ─── MAIN PAGE ────────────────────────────────────────────────────────────────

export default function ChallengesPage() {
    const { user } = useUser();
    const [challenges, setChallenges] = useState<Challenge[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [statusFilter, setStatusFilter] = useState<"open" | "all">("open");
    const [sortFilter, setSort] = useState<"latest" | "deadline">("latest");
    const [selectedCompliance, setSelectedCompliance] = useState<string[]>([]);
    const [selectedCategories, setSelectedCategories] = useState<string[]>([]);

    const fetchChallenges = useCallback(async () => {
        setLoading(true);
        try {
            const params = new URLSearchParams();
            params.set("status", statusFilter);
            params.set("sort", sortFilter);
            if (search) params.set("search", search);
            if (selectedCompliance.length) params.set("compliance", selectedCompliance.join(","));
            const res = await fetch(`${API_BASE}/api/v1/challenges?${params.toString()}`);
            const data = await res.json();
            let result: Challenge[] = Array.isArray(data) ? data : [];
            // Client-side category filter (backend doesn't support multi-category yet)
            if (selectedCategories.length) {
                result = result.filter((c) => c.healthcare_category && selectedCategories.includes(c.healthcare_category));
            }
            setChallenges(result);
        } catch {
            setChallenges([]);
        } finally {
            setLoading(false);
        }
    }, [search, statusFilter, sortFilter, selectedCompliance, selectedCategories]);

    useEffect(() => {
        const t = setTimeout(fetchChallenges, 250);
        return () => clearTimeout(t);
    }, [fetchChallenges]);

    const activeFilters = selectedCompliance.length + selectedCategories.length + (search ? 1 : 0);

    const sidebar = (
        <aside className="w-56 flex-shrink-0 space-y-4">
            <FilterSection title="Status">
                <div className="flex gap-2">
                    {(["open", "all"] as const).map((s) => (
                        <button key={s} onClick={() => setStatusFilter(s)}
                            className={`rounded-full px-3 py-1 text-xs font-semibold border transition-all capitalize ${statusFilter === s ? "bg-violet-600 text-white border-violet-600" : "bg-white text-gray-600 border-gray-200 hover:border-violet-300"}`}>
                            {s === "all" ? "All statuses" : "Open only"}
                        </button>
                    ))}
                </div>
            </FilterSection>

            <FilterSection title="Healthcare Category">
                <MultiCheck
                    options={HEALTHCARE_CATEGORIES.map((c) => ({ value: c, label: c }))}
                    selected={selectedCategories} onChange={setSelectedCategories} />
            </FilterSection>

            <FilterSection title="Compliance Required">
                <MultiCheck options={COMPLIANCE_OPTIONS} selected={selectedCompliance} onChange={setSelectedCompliance} />
            </FilterSection>

            {activeFilters > 0 && (
                <button onClick={() => { setSelectedCompliance([]); setSelectedCategories([]); setSearch(""); }}
                    className="flex w-full items-center justify-center gap-1.5 rounded-xl border border-red-200 bg-red-50 px-4 py-2 text-xs font-semibold text-red-600 hover:bg-red-100 transition-colors">
                    <X className="h-3.5 w-3.5" /> Clear filters ({activeFilters})
                </button>
            )}
        </aside>
    );

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Sticky topbar */}
            <div className="sticky top-0 z-20 border-b border-gray-200 bg-white/80 backdrop-blur-sm">
                <div className="container mx-auto flex flex-wrap items-center gap-3 px-4 py-3">
                    <div className="relative flex-1 max-w-md">
                        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                        <Input placeholder="Search challenges…" value={search} onChange={(e) => setSearch(e.target.value)}
                            className="pl-9 h-8 text-sm" />
                    </div>
                    <select value={sortFilter} onChange={(e) => setSort(e.target.value as "latest" | "deadline")}
                        className="h-8 rounded-lg border border-gray-200 bg-white px-3 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500/20">
                        <option value="latest">Latest first</option>
                        <option value="deadline">Deadline first</option>
                    </select>
                    {user && (
                        <Link href="/challenges/post">
                            <button className="flex h-8 items-center gap-1.5 rounded-lg bg-violet-600 px-4 text-sm font-semibold text-white hover:bg-violet-700 transition-colors">
                                <Plus className="h-4 w-4" /> Post Challenge
                            </button>
                        </Link>
                    )}
                    <p className="hidden sm:block text-sm text-gray-400 whitespace-nowrap">
                        {loading ? "…" : `${challenges.length} challenges`}
                    </p>
                </div>
            </div>

            <div className="container mx-auto px-4 py-6">
                {/* Page header */}
                <div className="mb-6">
                    <div className="flex items-center gap-2 mb-1">
                        <Zap className="h-5 w-5 text-violet-600" />
                        <h1 className="text-2xl font-bold text-gray-900">Innovation Challenges</h1>
                    </div>
                    <p className="text-gray-500 text-sm">Enterprise healthcare organizations seeking startup solutions.</p>
                </div>

                <div className="flex gap-6">
                    <div className="hidden lg:block">{sidebar}</div>

                    <div className="flex-1 min-w-0">
                        {loading ? (
                            <div className="flex items-center justify-center py-20">
                                <Loader2 className="h-6 w-6 animate-spin text-violet-600" />
                            </div>
                        ) : challenges.length === 0 ? (
                            <div className="rounded-2xl border border-gray-200 bg-white p-12 text-center">
                                <Zap className="mx-auto h-10 w-10 text-gray-300 mb-3" />
                                <h3 className="font-semibold text-gray-700 mb-1">No challenges match your filters</h3>
                                <p className="text-sm text-gray-500 mb-4">Try adjusting filters or be the first to post a challenge.</p>
                                {user && (
                                    <Link href="/challenges/post">
                                        <button className="rounded-xl bg-violet-600 px-4 py-2 text-sm font-semibold text-white hover:bg-violet-700 transition-colors">
                                            Post a Challenge
                                        </button>
                                    </Link>
                                )}
                            </div>
                        ) : (
                            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                                {challenges.map((c) => <ChallengeCard key={c.id} challenge={c} />)}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
