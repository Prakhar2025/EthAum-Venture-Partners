"use client";

import { useUser } from "@clerk/nextjs";
import { useUserSync } from "@/hooks/useUserSync";
import {
    Building2,
    Search,
    Filter,
    Lightbulb,
    MessageSquare,
    Heart,
    ArrowRight,
    Plus,
    BarChart3,
    CheckCircle2,
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
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600/15">
                    <Icon className="h-4 w-4 text-blue-400" />
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
            className="group relative flex flex-col gap-3 rounded-2xl border border-white/10 bg-white/[0.03] p-5 backdrop-blur-sm transition-all hover:bg-white/[0.06] hover:border-blue-500/30"
        >
            {badge && (
                <span className="absolute top-3 right-3 rounded-full bg-blue-600/20 px-2 py-0.5 text-[10px] font-semibold text-blue-300">
                    {badge}
                </span>
            )}
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-blue-600 to-cyan-600 shadow-lg shadow-blue-900/30">
                <Icon className="h-5 w-5 text-white" />
            </div>
            <div>
                <p className="font-semibold text-white">{title}</p>
                <p className="text-xs text-slate-500">{description}</p>
            </div>
            <ArrowRight className="h-4 w-4 text-slate-600 transition-transform group-hover:translate-x-1 group-hover:text-blue-400 self-end" />
        </Link>
    );
}

export default function EnterpriseDashboard() {
    const { user }    = useUser();
    const { profile } = useUserSync();

    const companyName = profile?.company_name ?? user?.firstName ?? "Enterprise";

    return (
        <div className="min-h-screen bg-[#0A0B14] antialiased">
            {/* Mesh gradient — blue/cyan tint for enterprise */}
            <div className="pointer-events-none fixed inset-0 overflow-hidden">
                <div className="absolute -top-40 -right-40 h-[600px] w-[600px] rounded-full bg-blue-600/15 blur-[120px]" />
                <div className="absolute bottom-0 -left-40 h-[500px] w-[500px] rounded-full bg-cyan-600/10 blur-[100px]" />
            </div>

            <div className="relative z-10 mx-auto max-w-6xl px-4 py-10 sm:px-6">

                {/* Header */}
                <div className="mb-10 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <div className="mb-1 inline-flex items-center gap-1.5 rounded-full border border-blue-500/30 bg-blue-600/10 px-3 py-1 text-xs font-semibold text-blue-300">
                            <Building2 className="h-3 w-3" /> Enterprise Buyer
                        </div>
                        <h1 className="text-3xl font-bold text-white mt-1">
                            {companyName}&apos;s Discovery Portal
                        </h1>
                        <p className="text-slate-400">
                            Find and vet the best healthcare startups for your innovation pipeline.
                        </p>
                    </div>

                    <Link
                        href="/challenges/new"
                        className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-600 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-blue-900/30 hover:shadow-blue-900/50 transition-all self-start sm:self-auto"
                    >
                        <Plus className="h-4 w-4" /> Post a Challenge
                    </Link>
                </div>

                {/* Stats */}
                <div className="mb-8 grid grid-cols-2 gap-4 lg:grid-cols-4">
                    <StatCard label="Startups Saved"      value="0" icon={Heart}        sub="Build your watchlist" />
                    <StatCard label="Pilot Requests"      value="0" icon={CheckCircle2}  sub="Pending responses" />
                    <StatCard label="Active Challenges"   value="0" icon={Lightbulb}    sub="Receiving applications" />
                    <StatCard label="Messages"            value="0" icon={MessageSquare} sub="Unread" />
                </div>

                {/* Primary actions */}
                <h2 className="mb-4 text-lg font-bold text-white">Discovery Tools</h2>
                <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    <ActionCard href="/marketplace"      icon={Search}       title="Discover Startups"      description="Browse with deep healthcare filters" badge="Primary" />
                    <ActionCard href="/challenges"       icon={Lightbulb}    title="Challenge Board"        description="Browse or post innovation challenges" />
                    <ActionCard href="/challenges/new"   icon={Plus}         title="Post a Challenge"       description="Receive targeted startup applications" />
                    <ActionCard href="/dashboard/enterprise/watchlist" icon={Heart}  title="My Watchlist"   description="Startups you've saved for review" />
                    <ActionCard href="/messages"         icon={MessageSquare} title="Inbox"                 description="Messages from founders" />
                    <ActionCard href="/insights"         icon={BarChart3}    title="Market Insights"        description="Category trends & analysis" />
                </div>

                {/* Filter preview banner */}
                <div className="rounded-2xl border border-blue-500/20 bg-gradient-to-br from-blue-600/10 to-cyan-600/10 p-6 backdrop-blur-sm">
                    <div className="flex items-start gap-4">
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-blue-600 to-cyan-600 flex-shrink-0">
                            <Filter className="h-5 w-5 text-white" />
                        </div>
                        <div className="flex-1">
                            <h3 className="font-bold text-white mb-1">Smart Filters — Coming Phase 2</h3>
                            <p className="text-sm text-slate-400 mb-4">
                                Filter startups by healthcare category, compliance (HIPAA, FDA, CE Mark), revenue stage, geography, team size, and minimum Trust Score. Find exactly what your innovation pipeline needs.
                            </p>
                            <Link href="/marketplace" className="inline-flex items-center gap-1.5 text-sm font-semibold text-blue-400 hover:text-blue-300 transition-colors">
                                Explore marketplace now <ArrowRight className="h-3.5 w-3.5" />
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
