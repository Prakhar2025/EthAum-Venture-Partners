"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { useUser } from "@clerk/nextjs";
import Link from "next/link";
import {
    ArrowLeft,
    Users,
    CheckCircle,
    XCircle,
    Trophy,
    Clock,
    Loader2,
    AlertCircle,
    ExternalLink,
    Star,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

// ─── TYPES ────────────────────────────────────────────────────────────────────

interface Application {
    id: string;
    challenge_id: string;
    product_id: number;
    product_name?: string;
    product_trust_score?: number;
    product_website?: string;
    applicant_id: string;
    solution_description?: string;
    status: string;
    created_at?: string;
}

interface Challenge {
    id: string;
    title: string;
    status: string;
    application_count: number;
}

// ─── STATUS CONFIG ────────────────────────────────────────────────────────────

const STATUS_CONFIG: Record<string, { label: string; className: string }> = {
    pending:     { label: "Pending",     className: "bg-amber-100 text-amber-700" },
    shortlisted: { label: "Shortlisted", className: "bg-blue-100 text-blue-700" },
    winner:      { label: "Winner 🏆",   className: "bg-violet-100 text-violet-700 font-bold" },
    rejected:    { label: "Rejected",    className: "bg-red-100 text-red-500" },
};

// ─── APPLICATION CARD ─────────────────────────────────────────────────────────

function ApplicationCard({
    app,
    challengeId,
    onStatusChange,
}: {
    app: Application;
    challengeId: string;
    onStatusChange: (id: string, status: string) => void;
}) {
    const { user } = useUser();
    const [updating, setUpdating] = useState(false);
    const [expanded, setExpanded] = useState(false);

    const status = STATUS_CONFIG[app.status] ?? { label: app.status, className: "bg-gray-100 text-gray-500" };

    const updateStatus = async (newStatus: string) => {
        if (!user) return;
        setUpdating(true);
        try {
            const res = await fetch(
                `${API_BASE}/api/v1/challenges/${challengeId}/applications/${app.id}`,
                {
                    method: "PATCH",
                    headers: {
                        "Content-Type": "application/json",
                        "X-Clerk-User-Id": user.id,
                    },
                    body: JSON.stringify({ status: newStatus }),
                }
            );
            if (res.ok) onStatusChange(app.id, newStatus);
        } catch {
            // no-op
        } finally {
            setUpdating(false);
        }
    };

    return (
        <div className={`rounded-2xl border bg-white p-5 transition-all ${app.status === "winner" ? "border-violet-300 shadow-md" : "border-gray-100 shadow-sm"}`}>
            {/* Header */}
            <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-violet-100 to-indigo-100 text-lg font-bold text-violet-600 flex-shrink-0">
                        {(app.product_name ?? "S").charAt(0)}
                    </div>
                    <div>
                        <div className="flex items-center gap-2">
                            <h3 className="font-semibold text-gray-900">{app.product_name ?? `Product #${app.product_id}`}</h3>
                            {app.product_trust_score !== undefined && (
                                <span className="flex items-center gap-0.5 text-xs font-bold text-violet-600">
                                    <Star className="h-3 w-3" /> {app.product_trust_score}
                                </span>
                            )}
                        </div>
                        <p className="text-xs text-gray-400">
                            Applied {app.created_at ? new Date(app.created_at).toLocaleDateString() : ""}
                        </p>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <span className={`rounded-full px-2.5 py-0.5 text-xs ${status.className}`}>{status.label}</span>
                    {app.product_website && (
                        <a href={app.product_website} target="_blank" rel="noopener noreferrer"
                            className="rounded-lg border border-gray-200 p-1.5 hover:bg-gray-50 transition-colors">
                            <ExternalLink className="h-3.5 w-3.5 text-gray-400" />
                        </a>
                    )}
                </div>
            </div>

            {/* Solution preview */}
            {app.solution_description && (
                <div className="mt-3">
                    <p className={`text-sm text-gray-600 leading-relaxed ${!expanded ? "line-clamp-3" : ""}`}>
                        {app.solution_description}
                    </p>
                    {(app.solution_description?.length ?? 0) > 200 && (
                        <button onClick={() => setExpanded(!expanded)} className="mt-1 text-xs font-medium text-violet-600 hover:underline">
                            {expanded ? "Show less" : "Read more"}
                        </button>
                    )}
                </div>
            )}

            {/* Actions */}
            {app.status !== "winner" && (
                <div className="mt-4 flex flex-wrap gap-2 border-t border-gray-50 pt-3">
                    {app.status !== "shortlisted" && (
                        <button onClick={() => updateStatus("shortlisted")} disabled={updating}
                            className="flex items-center gap-1.5 rounded-lg border border-blue-200 bg-blue-50 px-3 py-1.5 text-xs font-semibold text-blue-700 hover:bg-blue-100 transition-colors disabled:opacity-50">
                            {updating ? <Loader2 className="h-3 w-3 animate-spin" /> : <CheckCircle className="h-3.5 w-3.5" />}
                            Shortlist
                        </button>
                    )}
                    <button onClick={() => updateStatus("winner")} disabled={updating}
                        className="flex items-center gap-1.5 rounded-lg border border-violet-200 bg-violet-50 px-3 py-1.5 text-xs font-semibold text-violet-700 hover:bg-violet-100 transition-colors disabled:opacity-50">
                        {updating ? <Loader2 className="h-3 w-3 animate-spin" /> : <Trophy className="h-3.5 w-3.5" />}
                        Select Winner
                    </button>
                    {app.status !== "rejected" && (
                        <button onClick={() => updateStatus("rejected")} disabled={updating}
                            className="flex items-center gap-1.5 rounded-lg border border-red-200 bg-red-50 px-3 py-1.5 text-xs font-semibold text-red-600 hover:bg-red-100 transition-colors disabled:opacity-50">
                            {updating ? <Loader2 className="h-3 w-3 animate-spin" /> : <XCircle className="h-3.5 w-3.5" />}
                            Reject
                        </button>
                    )}
                    {app.status === "rejected" && (
                        <button onClick={() => updateStatus("pending")} disabled={updating}
                            className="flex items-center gap-1.5 rounded-lg border border-gray-200 bg-gray-50 px-3 py-1.5 text-xs font-medium text-gray-600 hover:bg-gray-100 transition-colors disabled:opacity-50">
                            Undo Rejection
                        </button>
                    )}
                </div>
            )}

            {app.status === "winner" && (
                <div className="mt-4 flex items-center gap-2 border-t border-violet-100 pt-3">
                    <Trophy className="h-4 w-4 text-violet-600" />
                    <p className="text-sm font-semibold text-violet-700">Winner selected — challenge closed</p>
                </div>
            )}
        </div>
    );
}

// ─── MAIN PAGE ────────────────────────────────────────────────────────────────

export default function ChallengeApplicationsPage() {
    const params      = useParams();
    const challengeId = params.id as string;
    const { user }    = useUser();

    const [challenge, setChallenge]       = useState<Challenge | null>(null);
    const [applications, setApplications] = useState<Application[]>([]);
    const [loading, setLoading]           = useState(true);
    const [filterStatus, setFilterStatus] = useState<"all" | "pending" | "shortlisted" | "winner" | "rejected">("all");
    const [error, setError]               = useState<string | null>(null);

    useEffect(() => {
        if (!user) return;
        (async () => {
            setLoading(true);
            try {
                const [challengeRes, appsRes] = await Promise.all([
                    fetch(`${API_BASE}/api/v1/challenges/${challengeId}`),
                    fetch(`${API_BASE}/api/v1/challenges/${challengeId}/applications`, {
                        headers: { "X-Clerk-User-Id": user.id },
                    }),
                ]);
                const challengeData = await challengeRes.json();
                const appsData      = await appsRes.json();
                if (!challengeRes.ok || !appsRes.ok) throw new Error(appsData.detail || "Failed to load");
                setChallenge(challengeData);
                setApplications(Array.isArray(appsData) ? appsData : []);
            } catch (err) {
                setError(err instanceof Error ? err.message : "Failed to load");
            } finally {
                setLoading(false);
            }
        })();
    }, [challengeId, user]);

    const handleStatusChange = (appId: string, newStatus: string) => {
        setApplications((prev) => prev.map((a) => a.id === appId ? { ...a, status: newStatus } : a));
    };

    const filtered = filterStatus === "all" ? applications : applications.filter((a) => a.status === filterStatus);
    const counts   = {
        all:         applications.length,
        pending:     applications.filter((a) => a.status === "pending").length,
        shortlisted: applications.filter((a) => a.status === "shortlisted").length,
        winner:      applications.filter((a) => a.status === "winner").length,
        rejected:    applications.filter((a) => a.status === "rejected").length,
    };

    if (!user) return (
        <div className="container mx-auto px-4 py-16 text-center">
            <p className="text-gray-500">Sign in to view applications.</p>
        </div>
    );

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="container mx-auto px-4 py-8 max-w-3xl">
                <Link href={`/challenges/${challengeId}`} className="mb-6 flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-800 transition-colors">
                    <ArrowLeft className="h-4 w-4" /> Back to Challenge
                </Link>

                {/* Header */}
                <div className="mb-6">
                    <div className="flex items-center gap-2 mb-1">
                        <Users className="h-5 w-5 text-violet-600" />
                        <h1 className="text-xl font-bold text-gray-900">Applications Review</h1>
                    </div>
                    {challenge && <p className="text-sm text-gray-500">{challenge.title}</p>}
                </div>

                {error && (
                    <div className="mb-4 flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                        <AlertCircle className="h-4 w-4 mt-0.5 flex-shrink-0" /> {error}
                    </div>
                )}

                {/* Status filter tabs */}
                <div className="mb-4 flex flex-wrap gap-2">
                    {(["all", "pending", "shortlisted", "winner", "rejected"] as const).map((s) => (
                        <button key={s} onClick={() => setFilterStatus(s)}
                            className={`rounded-full px-3 py-1 text-xs font-semibold border transition-all capitalize ${filterStatus === s ? "bg-violet-600 text-white border-violet-600" : "bg-white text-gray-600 border-gray-200 hover:border-violet-300"}`}>
                            {s === "all" ? `All (${counts.all})` : `${s.charAt(0).toUpperCase() + s.slice(1)} (${counts[s]})`}
                        </button>
                    ))}
                </div>

                {loading ? (
                    <div className="flex justify-center py-20">
                        <Loader2 className="h-6 w-6 animate-spin text-violet-600" />
                    </div>
                ) : filtered.length === 0 ? (
                    <div className="rounded-2xl border border-gray-200 bg-white p-12 text-center">
                        <Users className="mx-auto h-10 w-10 text-gray-300 mb-3" />
                        <h3 className="font-semibold text-gray-700 mb-1">
                            {filterStatus === "all" ? "No applications yet" : `No ${filterStatus} applications`}
                        </h3>
                        <p className="text-sm text-gray-500">
                            {filterStatus === "all" ? "Share your challenge with startups to receive applications." : "Change the filter to see other applications."}
                        </p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {filtered.map((app) => (
                            <ApplicationCard key={app.id} app={app} challengeId={challengeId} onStatusChange={handleStatusChange} />
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
