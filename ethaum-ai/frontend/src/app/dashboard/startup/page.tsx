"use client";

import { useUser } from "@clerk/nextjs";
import { useUserSync } from "@/hooks/useUserSync";
import {
    Rocket,
    TrendingUp,
    Star,
    Package,
    ArrowRight,
    Plus,
    MessageSquare,
    Zap,
    BarChart3,
} from "lucide-react";
import Link from "next/link";

// ─── STAT CARD ────────────────────────────────────────────────────────────────
function StatCard({
    label,
    value,
    icon: Icon,
    delta,
}: {
    label: string;
    value: string;
    icon: React.FC<{ className?: string }>;
    delta?: string;
}) {
    return (
        <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-5 backdrop-blur-sm">
            <div className="flex items-center justify-between mb-3">
                <p className="text-xs font-semibold uppercase tracking-widest text-slate-500">{label}</p>
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-violet-600/15">
                    <Icon className="h-4 w-4 text-violet-400" />
                </div>
            </div>
            <p className="text-3xl font-bold text-white">{value}</p>
            {delta && <p className="mt-1 text-xs text-emerald-400">{delta}</p>}
        </div>
    );
}

// ─── QUICK ACTION CARD ─────────────────────────────────────────────────────────
function QuickAction({
    href,
    icon: Icon,
    title,
    description,
}: {
    href: string;
    icon: React.FC<{ className?: string }>;
    title: string;
    description: string;
}) {
    return (
        <Link
            href={href}
            className="group flex items-center gap-4 rounded-2xl border border-white/10 bg-white/[0.03] p-4 backdrop-blur-sm transition-all hover:bg-white/[0.06] hover:border-violet-500/30"
        >
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-violet-600 to-indigo-600 flex-shrink-0 shadow-lg shadow-violet-900/30">
                <Icon className="h-5 w-5 text-white" />
            </div>
            <div className="flex-1 min-w-0">
                <p className="font-semibold text-white text-sm">{title}</p>
                <p className="text-xs text-slate-500">{description}</p>
            </div>
            <ArrowRight className="h-4 w-4 text-slate-500 transition-transform group-hover:translate-x-1 group-hover:text-violet-400" />
        </Link>
    );
}

// ─── PAGE ─────────────────────────────────────────────────────────────────────
export default function StartupDashboard() {
    const { user }    = useUser();
    const { profile } = useUserSync();

    const firstName = user?.firstName ?? "Founder";

    return (
        <div className="min-h-screen bg-[#0A0B14] antialiased">
            {/* Mesh gradient */}
            <div className="pointer-events-none fixed inset-0 overflow-hidden">
                <div className="absolute -top-40 -right-40 h-[600px] w-[600px] rounded-full bg-violet-600/15 blur-[120px]" />
                <div className="absolute bottom-0 -left-40 h-[500px] w-[500px] rounded-full bg-indigo-600/10 blur-[100px]" />
            </div>

            <div className="relative z-10 mx-auto max-w-6xl px-4 py-10 sm:px-6">

                {/* Header */}
                <div className="mb-10 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <div className="mb-1 inline-flex items-center gap-1.5 rounded-full border border-violet-500/30 bg-violet-600/10 px-3 py-1 text-xs font-semibold text-violet-300">
                            <Rocket className="h-3 w-3" /> Startup Founder
                        </div>
                        <h1 className="text-3xl font-bold text-white mt-1">
                            Welcome back, {firstName} 👋
                        </h1>
                        <p className="text-slate-400">
                            {profile?.company_name ? `Managing ${profile.company_name}` : "Your startup command centre."}
                        </p>
                    </div>

                    <Link
                        href="/submit"
                        className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-violet-900/30 hover:shadow-violet-900/50 transition-all self-start sm:self-auto"
                    >
                        <Plus className="h-4 w-4" /> Submit startup
                    </Link>
                </div>

                {/* Stats grid */}
                <div className="mb-8 grid grid-cols-2 gap-4 lg:grid-cols-4">
                    <StatCard label="Trust Score"     value="—"  icon={TrendingUp} delta="Submit to get scored" />
                    <StatCard label="Total Reviews"   value="0"  icon={Star} />
                    <StatCard label="Upvotes"         value="0"  icon={Zap} />
                    <StatCard label="Products Listed" value="0"  icon={Package} />
                </div>

                {/* Quick actions */}
                <div className="mb-8">
                    <h2 className="mb-4 text-lg font-bold text-white">Quick Actions</h2>
                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                        <QuickAction href="/submit"       icon={Plus}         title="Submit Your Product"  description="Get listed on the marketplace" />
                        <QuickAction href="/my-products"  icon={Package}      title="Manage Products"      description="View and edit your listings" />
                        <QuickAction href="/launch"       icon={Rocket}       title="Launch Campaign"      description="Create a Product Hunt–style launch" />
                        <QuickAction href="/insights"     icon={BarChart3}    title="View Analytics"       description="Trust Score breakdown & trends" />
                        <QuickAction href="/marketplace"  icon={TrendingUp}   title="Browse Marketplace"   description="See how others are positioned" />
                        <QuickAction href="/messages"     icon={MessageSquare} title="Messages"            description="Connect with buyers & investors" />
                    </div>
                </div>

                {/* Getting started banner */}
                <div className="rounded-2xl border border-violet-500/20 bg-gradient-to-br from-violet-600/10 to-indigo-600/10 p-6 backdrop-blur-sm">
                    <h2 className="mb-1 text-lg font-bold text-white">Getting Started</h2>
                    <p className="mb-5 text-sm text-slate-400">Complete these steps to unlock full visibility on EthAum.</p>
                    <div className="space-y-3">
                        {[
                            { step: 1, label: "Submit your product", href: "/submit", done: false },
                            { step: 2, label: "Get your first 3 reviews", href: "/my-products", done: false },
                            { step: 3, label: "Run a launch campaign", href: "/launch", done: false },
                        ].map(({ step, label, href, done }) => (
                            <Link key={step} href={href} className="flex items-center gap-3 group">
                                <div className={`flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold transition-all ${done ? "bg-emerald-500 text-white" : "bg-white/10 text-slate-400 group-hover:bg-violet-600 group-hover:text-white"}`}>
                                    {done ? "✓" : step}
                                </div>
                                <span className={`text-sm ${done ? "line-through text-slate-500" : "text-slate-300 group-hover:text-white"}`}>{label}</span>
                                <ArrowRight className="h-3.5 w-3.5 text-slate-600 ml-auto transition-transform group-hover:translate-x-1 group-hover:text-violet-400" />
                            </Link>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
