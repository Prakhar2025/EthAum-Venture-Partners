"use client";

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
    Plus,
    Star,
    Zap,
} from "lucide-react";
import Link from "next/link";

function StatCard({
    label,
    value,
    icon: Icon,
    sub,
}: {
    label: string;
    value: string;
    icon: React.FC<{ className?: string }>;
    sub?: string;
}) {
    return (
        <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-5 backdrop-blur-sm">
            <div className="mb-3 flex items-center justify-between">
                <p className="text-xs font-semibold uppercase tracking-widest text-slate-500">{label}</p>
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-600/15">
                    <Icon className="h-4 w-4 text-emerald-400" />
                </div>
            </div>
            <p className="text-3xl font-bold text-white">{value}</p>
            {sub && <p className="mt-1 text-xs text-slate-500">{sub}</p>}
        </div>
    );
}

function ActionCard({
    href,
    icon: Icon,
    title,
    description,
    badge,
}: {
    href: string;
    icon: React.FC<{ className?: string }>;
    title: string;
    description: string;
    badge?: string;
}) {
    return (
        <Link
            href={href}
            className="group relative flex flex-col gap-3 rounded-2xl border border-white/10 bg-white/[0.03] p-5 backdrop-blur-sm transition-all hover:bg-white/[0.06] hover:border-emerald-500/30"
        >
            {badge && (
                <span className="absolute top-3 right-3 rounded-full bg-emerald-600/20 px-2 py-0.5 text-[10px] font-semibold text-emerald-300">
                    {badge}
                </span>
            )}
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-600 to-teal-600 shadow-lg shadow-emerald-900/30">
                <Icon className="h-5 w-5 text-white" />
            </div>
            <div>
                <p className="font-semibold text-white">{title}</p>
                <p className="text-xs text-slate-500">{description}</p>
            </div>
            <ArrowRight className="h-4 w-4 text-slate-600 transition-transform group-hover:translate-x-1 group-hover:text-emerald-400 self-end" />
        </Link>
    );
}

export default function InvestorDashboard() {
    const { user }    = useUser();
    const { profile } = useUserSync();

    const fundName = profile?.company_name ?? user?.firstName ?? "Investor";

    return (
        <div className="min-h-screen bg-[#0A0B14] antialiased">
            {/* Mesh gradient — emerald/teal tint for investor */}
            <div className="pointer-events-none fixed inset-0 overflow-hidden">
                <div className="absolute -top-40 -right-40 h-[600px] w-[600px] rounded-full bg-emerald-600/15 blur-[120px]" />
                <div className="absolute bottom-0 -left-40 h-[500px] w-[500px] rounded-full bg-teal-600/10 blur-[100px]" />
            </div>

            <div className="relative z-10 mx-auto max-w-6xl px-4 py-10 sm:px-6">

                {/* Header */}
                <div className="mb-10 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <div className="mb-1 inline-flex items-center gap-1.5 rounded-full border border-emerald-500/30 bg-emerald-600/10 px-3 py-1 text-xs font-semibold text-emerald-300">
                            <TrendingUp className="h-3 w-3" /> Investor / VC
                        </div>
                        <h1 className="text-3xl font-bold text-white mt-1">
                            {fundName}&apos;s Deal Flow
                        </h1>
                        <p className="text-slate-400">
                            Discover high-potential healthcare startups with AI-powered Trust Scores.
                        </p>
                    </div>

                    <Link
                        href="/marketplace"
                        className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-emerald-900/30 hover:shadow-emerald-900/50 transition-all self-start sm:self-auto"
                    >
                        <Plus className="h-4 w-4" /> Discover Startups
                    </Link>
                </div>

                {/* Stats */}
                <div className="mb-8 grid grid-cols-2 gap-4 lg:grid-cols-4">
                    <StatCard label="Watchlist"       value="0"  icon={BookmarkPlus} sub="Startups tracked" />
                    <StatCard label="Intro Requests"  value="0"  icon={MessageSquare} sub="Sent to founders" />
                    <StatCard label="Avg Trust Score" value="—"  icon={Star}         sub="Portfolio average" />
                    <StatCard label="Due Diligence"   value="0"  icon={FileText}     sub="Reports generated" />
                </div>

                {/* Tools */}
                <h2 className="mb-4 text-lg font-bold text-white">Investor Tools</h2>
                <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    <ActionCard href="/marketplace"                    icon={Search}      title="Discover Startups"     description="Browse curated healthcare deal flow" badge="Primary" />
                    <ActionCard href="/dashboard/investor/watchlist"   icon={BookmarkPlus} title="My Watchlist"         description="Startups you're tracking" />
                    <ActionCard href="/insights"                        icon={BarChart3}   title="Category Trends"       description="Which sectors are growing fastest" />
                    <ActionCard href="/dashboard/investor/reports"     icon={FileText}    title="Due Diligence Reports" description="AI-generated Gartner-style reports" />
                    <ActionCard href="/messages"                        icon={MessageSquare} title="Intro Requests"      description="Connect directly with founders" />
                    <ActionCard href="/leaderboard"                    icon={TrendingUp}  title="Trust Score Leaderboard" description="Top-ranked healthcare startups" />
                </div>

                {/* AI Due Diligence preview */}
                <div className="rounded-2xl border border-emerald-500/20 bg-gradient-to-br from-emerald-600/10 to-teal-600/10 p-6 backdrop-blur-sm">
                    <div className="flex items-start gap-4">
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-600 to-teal-600 flex-shrink-0">
                            <Zap className="h-5 w-5 text-white" />
                        </div>
                        <div className="flex-1">
                            <h3 className="font-bold text-white mb-1">AI Due Diligence — Coming Phase 6</h3>
                            <p className="text-sm text-slate-400 mb-4">
                                Generate on-demand PDF due diligence reports for any healthcare startup. Trust Score analysis, review sentiment summary, compliance status, market positioning, and risk factors — all in one click.
                            </p>
                            <Link href="/marketplace" className="inline-flex items-center gap-1.5 text-sm font-semibold text-emerald-400 hover:text-emerald-300 transition-colors">
                                Browse deal flow now <ArrowRight className="h-3.5 w-3.5" />
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
