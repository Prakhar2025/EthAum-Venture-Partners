"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useUser } from "@clerk/nextjs";
import Link from "next/link";
import {
    ArrowLeft,
    Trophy,
    Users,
    Clock,
    Calendar,
    Shield,
    Globe,
    HeartPulse,
    MapPin,
    CheckCircle,
    AlertCircle,
    Loader2,
    ExternalLink,
    ChevronRight,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

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

interface MyProduct {
    id: number;
    name: string;
    trust_score: number;
}

// ─── CONSTANTS ────────────────────────────────────────────────────────────────

const COMPLIANCE_COLORS: Record<string, string> = {
    hipaa: "bg-blue-100 text-blue-700", fda: "bg-emerald-100 text-emerald-700",
    ce_mark: "bg-indigo-100 text-indigo-700", iso_13485: "bg-amber-100 text-amber-700",
    soc2: "bg-violet-100 text-violet-700", gdpr: "bg-rose-100 text-rose-700",
};
const COMPLIANCE_LABELS: Record<string, string> = {
    hipaa: "HIPAA", fda: "FDA Cleared", ce_mark: "CE Mark",
    iso_13485: "ISO 13485", soc2: "SOC 2", gdpr: "GDPR",
};
const GEO_LABELS: Record<string, string> = {
    us: "🇺🇸 United States", eu: "🇪🇺 Europe", india: "🇮🇳 India",
    asean: "🌏 ASEAN", global: "🌍 Global",
};

// ─── COUNTDOWN HELPER ─────────────────────────────────────────────────────────

function deadlineLabel(deadline?: string) {
    if (!deadline) return null;
    const d = new Date(deadline);
    const now = new Date();
    const diffDays = Math.ceil((d.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    if (diffDays < 0) return { text: "Deadline passed", urgent: true };
    if (diffDays === 0) return { text: "Closes today!", urgent: true };
    if (diffDays <= 7) return { text: `${diffDays} days left`, urgent: true };
    return { text: `${diffDays} days left`, urgent: false };
};

// ─── APPLICATION FORM ─────────────────────────────────────────────────────────

function ApplicationForm({
    challengeId,
    onSuccess,
}: {
    challengeId: string;
    onSuccess: () => void;
}) {
    const { user } = useUser();
    const [myProducts, setMyProducts] = useState<MyProduct[]>([]);
    const [selectedProduct, setSelectedProduct] = useState<number | null>(null);
    const [solution, setSolution] = useState("");
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [loadingProducts, setLoadingProducts] = useState(true);

    useEffect(() => {
        if (!user) return;
        fetch(`${API_BASE}/api/v1/products/my-products`, {
            headers: { "X-Clerk-User-Id": user.id },
        })
            .then((r) => r.json())
            .then((d) => setMyProducts(Array.isArray(d) ? d : []))
            .catch(() => setMyProducts([]))
            .finally(() => setLoadingProducts(false));
    }, [user]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user || selectedProduct === null) return;
        if (solution.trim().length < 30) {
            setError("Please write at least 30 characters describing your solution.");
            return;
        }
        setSubmitting(true);
        setError(null);
        try {
            const res = await fetch(`${API_BASE}/api/v1/challenges/${challengeId}/apply`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "X-Clerk-User-Id": user.id,
                },
                body: JSON.stringify({
                    product_id: selectedProduct,
                    solution_description: solution.trim(),
                }),
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.detail || "Failed to submit");
            onSuccess();
        } catch (err) {
            setError(err instanceof Error ? err.message : "Something went wrong");
        } finally {
            setSubmitting(false);
        }
    };

    if (!user) {
        return (
            <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-center">
                <p className="text-sm font-medium text-amber-700">Sign in to apply to this challenge</p>
                <Link href="/sign-in">
                    <Button className="mt-3 bg-violet-600 hover:bg-violet-700 h-8 px-4 text-sm">Sign In</Button>
                </Link>
            </div>
        );
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            {/* Product selector */}
            <div className="space-y-1.5">
                <Label className="text-sm font-semibold text-gray-700">Apply with which product? *</Label>
                {loadingProducts ? (
                    <div className="flex items-center gap-2 text-sm text-gray-400"><Loader2 className="h-4 w-4 animate-spin" /> Loading your products…</div>
                ) : myProducts.length === 0 ? (
                    <div className="rounded-xl border border-gray-200 bg-gray-50 p-4 text-center">
                        <p className="text-sm text-gray-500 mb-2">You haven&apos;t submitted any products yet.</p>
                        <Link href="/submit">
                            <button type="button" className="rounded-lg bg-violet-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-violet-700">
                                Submit a Product
                            </button>
                        </Link>
                    </div>
                ) : (
                    <div className="space-y-2">
                        {myProducts.map((p) => (
                            <label key={p.id} className={`flex items-center gap-3 rounded-xl border p-3 cursor-pointer transition-all ${selectedProduct === p.id ? "border-violet-500 bg-violet-50" : "border-gray-200 bg-white hover:border-violet-300"}`}>
                                <input type="radio" name="product" value={p.id} checked={selectedProduct === p.id}
                                    onChange={() => setSelectedProduct(p.id)} className="accent-violet-600" />
                                <div className="flex-1">
                                    <p className="font-semibold text-gray-900 text-sm">{p.name}</p>
                                </div>
                                <span className="text-sm font-bold text-violet-600">{p.trust_score}</span>
                            </label>
                        ))}
                    </div>
                )}
            </div>

            {/* Solution description */}
            <div className="space-y-1.5">
                <Label className="text-sm font-semibold text-gray-700">How does your product solve this challenge? *</Label>
                <Textarea rows={5} placeholder="Describe your solution, how it addresses the challenge requirements, and any relevant case studies…"
                    value={solution} onChange={(e) => setSolution(e.target.value)} maxLength={2000} />
                <p className="text-right text-xs text-gray-400">{solution.length}/2000</p>
            </div>

            {error && (
                <div className="flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 px-3 py-2.5 text-sm text-red-700">
                    <AlertCircle className="h-4 w-4 mt-0.5 flex-shrink-0" /> {error}
                </div>
            )}

            <Button type="submit" disabled={submitting || selectedProduct === null}
                className="w-full bg-violet-600 hover:bg-violet-700 h-10 font-semibold">
                {submitting ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Submitting…</> : "Submit Application"}
            </Button>
        </form>
    );
}

// ─── MAIN PAGE ────────────────────────────────────────────────────────────────

export default function ChallengeDetailPage() {
    const params = useParams();
    const challengeId = params.id as string;
    const { user } = useUser();

    const [challenge, setChallenge] = useState<Challenge | null>(null);
    const [loading, setLoading] = useState(true);
    const [applied, setApplied] = useState(false);

    useEffect(() => {
        fetch(`${API_BASE}/api/v1/challenges/${challengeId}`)
            .then((r) => r.json())
            .then((data) => setChallenge(data))
            .catch(() => {})
            .finally(() => setLoading(false));
    }, [challengeId]);

    if (loading) return (
        <div className="flex items-center justify-center min-h-screen">
            <Loader2 className="h-6 w-6 animate-spin text-violet-600" />
        </div>
    );
    if (!challenge) return (
        <div className="container mx-auto px-4 py-16 text-center">
            <p className="text-gray-500">Challenge not found.</p>
            <Link href="/challenges"><Button className="mt-4">Back to Challenges</Button></Link>
        </div>
    );

    const deadline = challenge.deadline ? deadlineLabel(challenge.deadline) : null;
    const isOwner = user?.id === challenge.posted_by;
    const isOpen = challenge.status === "open";

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="container mx-auto px-4 py-8 max-w-4xl">
                <Link href="/challenges" className="mb-6 flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-800 transition-colors">
                    <ArrowLeft className="h-4 w-4" /> Back to Challenges
                </Link>

                <div className="grid gap-6 lg:grid-cols-3">
                    {/* ── MAIN CONTENT ─────────────────────────────────── */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Header card */}
                        <div className="rounded-2xl border border-gray-200 bg-white p-6">
                            <div className="flex items-start gap-4">
                                <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-violet-100 to-indigo-100 text-lg font-bold text-violet-600">
                                    {(challenge.posted_by_name ?? "E").charAt(0)}
                                </div>
                                <div className="flex-1">
                                    <p className="text-xs font-medium text-gray-400">{challenge.posted_by_name ?? "Enterprise"}</p>
                                    <h1 className="mt-0.5 text-2xl font-bold text-gray-900 leading-tight">{challenge.title}</h1>
                                </div>
                                <span className={`shrink-0 rounded-full px-3 py-1 text-xs font-semibold capitalize ${
                                    isOpen ? "bg-emerald-100 text-emerald-700" :
                                    challenge.status === "winner_selected" ? "bg-violet-100 text-violet-700" :
                                    "bg-gray-100 text-gray-500"
                                }`}>
                                    {challenge.status.replace("_", " ")}
                                </span>
                            </div>

                            {/* Badges */}
                            <div className="mt-4 flex flex-wrap gap-2">
                                {challenge.healthcare_category && (
                                    <span className="inline-flex items-center gap-1 rounded-full bg-violet-100 px-2.5 py-0.5 text-xs font-semibold text-violet-700">
                                        <HeartPulse className="h-3 w-3" /> {challenge.healthcare_category}
                                    </span>
                                )}
                                {(challenge.compliance_required ?? []).map((c) => (
                                    <span key={c} className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold ${COMPLIANCE_COLORS[c] ?? "bg-gray-100 text-gray-600"}`}>
                                        <Shield className="h-3 w-3" /> {COMPLIANCE_LABELS[c] ?? c.toUpperCase()}
                                    </span>
                                ))}
                                {(challenge.geography ?? []).map((g) => (
                                    <span key={g} className="inline-flex items-center gap-1 rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-medium text-gray-600">
                                        <MapPin className="h-3 w-3" /> {GEO_LABELS[g.toLowerCase()] ?? g}
                                    </span>
                                ))}
                                {challenge.stage_required && (
                                    <span className="rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-semibold text-blue-700 capitalize">
                                        {challenge.stage_required.replace("_", " ")}
                                    </span>
                                )}
                            </div>
                        </div>

                        {/* Brief */}
                        {challenge.description && (
                            <div className="rounded-2xl border border-gray-200 bg-white p-6">
                                <h2 className="text-sm font-bold uppercase tracking-widest text-gray-400 mb-3">Challenge Brief</h2>
                                <p className="text-gray-700 leading-relaxed whitespace-pre-line">{challenge.description}</p>
                            </div>
                        )}

                        {/* Apply section */}
                        {!isOwner && (
                            <div className="rounded-2xl border-2 border-violet-200 bg-white p-6">
                                <h2 className="text-base font-bold text-gray-900 mb-4">
                                    {applied ? "✅ Application Submitted!" : isOpen ? "Apply with Your Product" : "Applications Closed"}
                                </h2>
                                {applied ? (
                                    <div className="flex items-center gap-2 text-emerald-700 text-sm font-medium">
                                        <CheckCircle className="h-5 w-5" />
                                        Your application has been submitted. The enterprise will review all applications and reach out to shortlisted startups.
                                    </div>
                                ) : isOpen ? (
                                    <ApplicationForm challengeId={challengeId} onSuccess={() => setApplied(true)} />
                                ) : (
                                    <p className="text-sm text-gray-500">This challenge is no longer accepting applications.</p>
                                )}
                            </div>
                        )}

                        {/* Enterprise management link */}
                        {isOwner && (
                            <Link href={`/challenges/${challengeId}/applications`}>
                                <div className="flex items-center justify-between rounded-2xl border border-violet-200 bg-violet-50 p-4 hover:bg-violet-100 transition-colors cursor-pointer">
                                    <div>
                                        <p className="font-semibold text-violet-900">Review Applications</p>
                                        <p className="text-sm text-violet-600">{challenge.application_count} submissions received</p>
                                    </div>
                                    <ChevronRight className="h-5 w-5 text-violet-600" />
                                </div>
                            </Link>
                        )}
                    </div>

                    {/* ── SIDEBAR ───────────────────────────────────────── */}
                    <div className="space-y-4">
                        {/* Quick stats */}
                        <div className="rounded-2xl border border-gray-200 bg-white p-5 space-y-4">
                            {challenge.prize_value && (
                                <div>
                                    <p className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-1">Prize / Contract</p>
                                    <p className="flex items-center gap-1.5 text-xl font-bold text-violet-700">
                                        <Trophy className="h-5 w-5" /> {challenge.prize_value}
                                    </p>
                                </div>
                            )}
                            <div>
                                <p className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-1">Applications</p>
                                <p className="flex items-center gap-1.5 text-lg font-bold text-gray-800">
                                    <Users className="h-4 w-4 text-gray-400" /> {challenge.application_count}
                                </p>
                            </div>
                            {challenge.deadline && (
                                <div>
                                    <p className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-1">Deadline</p>
                                    <p className={`flex items-center gap-1.5 text-sm font-semibold ${deadline?.urgent ? "text-red-600" : "text-gray-800"}`}>
                                        <Clock className="h-4 w-4" />
                                        {deadline?.text} ({new Date(challenge.deadline).toLocaleDateString()})
                                    </p>
                                </div>
                            )}
                            {challenge.stage_required && (
                                <div>
                                    <p className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-1">Startup Stage</p>
                                    <p className="text-sm font-medium text-gray-800 capitalize">{challenge.stage_required.replace("_", " ")}</p>
                                </div>
                            )}
                        </div>

                        {/* Compliance required */}
                        {(challenge.compliance_required ?? []).length > 0 && (
                            <div className="rounded-2xl border border-gray-200 bg-white p-5">
                                <p className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-3">Compliance Required</p>
                                <div className="space-y-2">
                                    {(challenge.compliance_required ?? []).map((c) => (
                                        <div key={c} className={`inline-flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm font-semibold ${COMPLIANCE_COLORS[c] ?? "bg-gray-100 text-gray-600"}`}>
                                            <Shield className="h-3.5 w-3.5" /> {COMPLIANCE_LABELS[c] ?? c.toUpperCase()}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
