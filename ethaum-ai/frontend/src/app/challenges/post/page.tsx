"use client";

import { useState } from "react";
import { useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
    ArrowLeft,
    Zap,
    ChevronDown,
    ChevronUp,
    Loader2,
    CheckCircle,
    AlertCircle,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

// ─── CONSTANTS ────────────────────────────────────────────────────────────────

const COMPLIANCE_OPTIONS = [
    { value: "hipaa",     label: "HIPAA" },
    { value: "fda",       label: "FDA Cleared" },
    { value: "ce_mark",   label: "CE Mark" },
    { value: "iso_13485", label: "ISO 13485" },
    { value: "soc2",      label: "SOC 2" },
    { value: "gdpr",      label: "GDPR" },
];

const GEOGRAPHY_OPTIONS = [
    { value: "us",     label: "🇺🇸 United States" },
    { value: "eu",     label: "🇪🇺 Europe" },
    { value: "india",  label: "🇮🇳 India" },
    { value: "asean",  label: "🌏 ASEAN" },
    { value: "global", label: "🌍 Global" },
];

const STAGE_OPTIONS = [
    { value: "",         label: "Any stage" },
    { value: "seed",     label: "Seed" },
    { value: "series_a", label: "Series A" },
    { value: "series_b", label: "Series B" },
    { value: "series_c", label: "Series C" },
    { value: "series_d", label: "Series D" },
];

const VERTICALS = [
    { value: "healthcare",  label: "🏥 Healthcare" },
    { value: "edtech",      label: "📚 EdTech" },
    { value: "fintech",     label: "💳 FinTech" },
    { value: "saas",        label: "☁️ SaaS" },
    { value: "hardware",    label: "🔧 Hardware" },
    { value: "hospitality", label: "🏨 Hospitality" },
];

const HEALTHCARE_CATEGORIES = [
    "Chronic Disease Management","Cardiology","Mental Health Tech",
    "Diagnostics & Imaging AI","Hospital Management","Wellness & Preventive Care",
    "Telehealth / Remote Care","Medical Devices & IoT","Pharmacy & MedTech","EdTech for Healthcare",
];

// ─── SMALL HELPERS ────────────────────────────────────────────────────────────

function FieldLabel({ htmlFor, children, optional }: { htmlFor?: string; children: React.ReactNode; optional?: boolean }) {
    return (
        <Label htmlFor={htmlFor} className="block text-sm font-semibold text-gray-700">
            {children}{optional && <span className="ml-1 text-xs font-normal text-gray-400">(optional)</span>}
        </Label>
    );
}

function MultiToggle({ options, selected, onChange }: {
    options: { value: string; label: string }[];
    selected: string[];
    onChange: (v: string[]) => void;
}) {
    const toggle = (val: string) =>
        onChange(selected.includes(val) ? selected.filter((v) => v !== val) : [...selected, val]);
    return (
        <div className="flex flex-wrap gap-2">
            {options.map((opt) => (
                <button key={opt.value} type="button" onClick={() => toggle(opt.value)}
                    className={`rounded-full px-3 py-1 text-xs font-semibold border transition-all ${
                        selected.includes(opt.value) ? "bg-violet-600 text-white border-violet-600 shadow-sm" : "bg-white text-gray-600 border-gray-200 hover:border-violet-300"
                    }`}>
                    {opt.label}
                </button>
            ))}
        </div>
    );
}

function SectionToggle({ title, subtitle, open, onToggle, children }: {
    title: string; subtitle: string; open: boolean; onToggle: () => void; children: React.ReactNode;
}) {
    return (
        <div className="rounded-xl border border-gray-200 bg-white overflow-hidden">
            <button type="button" onClick={onToggle}
                className="flex w-full items-center justify-between px-5 py-4 text-left hover:bg-gray-50 transition-colors">
                <div>
                    <p className="font-semibold text-gray-800">{title}</p>
                    <p className="text-xs text-gray-500 mt-0.5">{subtitle}</p>
                </div>
                {open ? <ChevronUp className="h-4 w-4 text-gray-400" /> : <ChevronDown className="h-4 w-4 text-gray-400" />}
            </button>
            {open && <div className="border-t border-gray-100 px-5 py-4 space-y-4">{children}</div>}
        </div>
    );
}

// ─── MAIN PAGE ────────────────────────────────────────────────────────────────

export default function PostChallengePage() {
    const { user, isLoaded } = useUser();
    const router = useRouter();

    const [submitting, setSubmitting] = useState(false);
    const [success, setSuccess]       = useState(false);
    const [error, setError]           = useState<string | null>(null);
    const [showDetails, setShowDetails] = useState(false);

    // Form state
    const [title, setTitle]                   = useState("");
    const [description, setDescription]       = useState("");
    const [vertical, setVertical]             = useState("healthcare");
    const [healthcareCategory, setHcCategory] = useState("");
    const [compliance, setCompliance]         = useState<string[]>([]);
    const [geography, setGeography]           = useState<string[]>([]);
    const [stageRequired, setStageRequired]   = useState("");
    const [prizeValue, setPrizeValue]         = useState("");
    const [deadline, setDeadline]             = useState("");

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user) return;
        if (title.trim().length < 10) {
            setError("Challenge title must be at least 10 characters.");
            return;
        }
        setSubmitting(true);
        setError(null);
        try {
            const res = await fetch(`${API_BASE}/api/v1/challenges`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "X-Clerk-User-Id": user.id,
                },
                body: JSON.stringify({
                    title: title.trim(),
                    description: description.trim() || null,
                    vertical: vertical || null,
                    healthcare_category: vertical === "healthcare" ? healthcareCategory || null : null,
                    compliance_required: compliance.length ? compliance : null,
                    geography: geography.length ? geography : null,
                    stage_required: stageRequired || null,
                    prize_value: prizeValue.trim() || null,
                    deadline: deadline || null,
                }),
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.detail || "Failed to post challenge");
            setSuccess(true);
            setTimeout(() => router.push(`/challenges/${data.id}`), 1800);
        } catch (err) {
            setError(err instanceof Error ? err.message : "Something went wrong");
        } finally {
            setSubmitting(false);
        }
    };

    if (!isLoaded) return (
        <div className="flex items-center justify-center min-h-screen">
            <Loader2 className="h-6 w-6 animate-spin text-violet-600" />
        </div>
    );

    if (!user) return (
        <div className="container mx-auto px-4 py-16 text-center">
            <h1 className="text-2xl font-bold mb-4">Sign In Required</h1>
            <p className="text-gray-500 mb-6">You need to sign in as an enterprise user to post challenges.</p>
            <Link href="/sign-in"><Button>Sign In</Button></Link>
        </div>
    );

    if (success) return (
        <div className="container mx-auto px-4 py-16 text-center">
            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-emerald-100 mb-6">
                <CheckCircle className="h-10 w-10 text-emerald-600" />
            </div>
            <h1 className="text-2xl font-bold mb-2">Challenge Posted!</h1>
            <p className="text-gray-500">Startups can now apply. Redirecting to your challenge…</p>
        </div>
    );

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="container mx-auto px-4 py-8 max-w-xl">
                <Link href="/challenges" className="mb-6 flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-800 transition-colors">
                    <ArrowLeft className="h-4 w-4" /> Back to Challenges
                </Link>

                {/* Page header */}
                <div className="mb-6 flex items-center gap-4">
                    <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-violet-600 to-indigo-600 shadow">
                        <Zap className="h-5 w-5 text-white" />
                    </div>
                    <div>
                        <h1 className="text-xl font-bold text-gray-900">Post an Innovation Challenge</h1>
                        <p className="text-sm text-gray-500">Invite startups to solve your healthcare problem</p>
                    </div>
                </div>

                {error && (
                    <div className="mb-4 flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                        <AlertCircle className="h-4 w-4 mt-0.5 flex-shrink-0" /> {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                    {/* ── Core info ───────────────────────────────── */}
                    <div className="rounded-xl border border-gray-200 bg-white px-5 py-5 space-y-4">
                        <h2 className="text-xs font-bold uppercase tracking-widest text-gray-400">Challenge Details</h2>

                        <div className="space-y-1.5">
                            <FieldLabel htmlFor="title">Challenge Title *</FieldLabel>
                            <Input id="title" required placeholder="e.g. Remote Patient Monitoring Platform for Cardiology" value={title} onChange={(e) => setTitle(e.target.value)} />
                        </div>

                        <div className="space-y-1.5">
                            <FieldLabel htmlFor="description">Problem Statement <span className="text-gray-400 font-normal">(max 1000 chars)</span></FieldLabel>
                            <Textarea id="description" rows={5} maxLength={1000}
                                placeholder="Describe the innovation challenge, what problem you're trying to solve, what an ideal solution looks like, and evaluation criteria…"
                                value={description} onChange={(e) => setDescription(e.target.value)} />
                            <p className="text-right text-xs text-gray-400">{description.length}/1000</p>
                        </div>
                    </div>

                    {/* ── Vertical ────────────────────────────────── */}
                    <div className="rounded-xl border border-gray-200 bg-white px-5 py-5 space-y-3">
                        <h2 className="text-xs font-bold uppercase tracking-widest text-gray-400">Vertical</h2>
                        <div className="flex flex-wrap gap-2">
                            {VERTICALS.map((v) => (
                                <button key={v.value} type="button" onClick={() => setVertical(v.value)}
                                    className={`rounded-full px-3 py-1 text-sm font-semibold border transition-all ${vertical === v.value ? "bg-violet-600 text-white border-violet-600 shadow" : "bg-white text-gray-600 border-gray-200 hover:border-violet-300"}`}>
                                    {v.label}
                                </button>
                            ))}
                        </div>
                        {vertical === "healthcare" && (
                            <div className="space-y-1.5 pt-1">
                                <FieldLabel htmlFor="hc_cat">Healthcare Subcategory</FieldLabel>
                                <select id="hc_cat" value={healthcareCategory} onChange={(e) => setHcCategory(e.target.value)}
                                    className="w-full h-10 rounded-md border border-gray-200 bg-white px-3 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500/20">
                                    <option value="">Select category…</option>
                                    {HEALTHCARE_CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
                                </select>
                            </div>
                        )}
                    </div>

                    {/* ── Requirements (collapsible) ──────────────── */}
                    <SectionToggle title="Requirements & Preferences" subtitle="Compliance, geography, startup stage"
                        open={showDetails} onToggle={() => setShowDetails(!showDetails)}>
                        <div className="space-y-1.5">
                            <FieldLabel>Compliance Required</FieldLabel>
                            <MultiToggle options={COMPLIANCE_OPTIONS} selected={compliance} onChange={setCompliance} />
                        </div>
                        <div className="space-y-1.5">
                            <FieldLabel>Geography Preference</FieldLabel>
                            <MultiToggle options={GEOGRAPHY_OPTIONS} selected={geography} onChange={setGeography} />
                        </div>
                        <div className="space-y-1.5">
                            <FieldLabel htmlFor="stage">Preferred Startup Stage</FieldLabel>
                            <select id="stage" value={stageRequired} onChange={(e) => setStageRequired(e.target.value)}
                                className="w-full h-10 rounded-md border border-gray-200 bg-white px-3 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500/20">
                                {STAGE_OPTIONS.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
                            </select>
                        </div>
                    </SectionToggle>

                    {/* ── Prize & Deadline ─────────────────────────── */}
                    <div className="rounded-xl border border-gray-200 bg-white px-5 py-5 space-y-4">
                        <h2 className="text-xs font-bold uppercase tracking-widest text-gray-400">Prize & Timeline</h2>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-1.5">
                                <FieldLabel htmlFor="prize" optional>Estimated Contract Value</FieldLabel>
                                <Input id="prize" placeholder="e.g. $500K pilot" value={prizeValue} onChange={(e) => setPrizeValue(e.target.value)} />
                            </div>
                            <div className="space-y-1.5">
                                <FieldLabel htmlFor="deadline" optional>Application Deadline</FieldLabel>
                                <Input id="deadline" type="date" value={deadline} onChange={(e) => setDeadline(e.target.value)}
                                    min={new Date().toISOString().split("T")[0]} />
                            </div>
                        </div>
                    </div>

                    <Button type="submit" className="w-full bg-violet-600 hover:bg-violet-700 h-11 text-base font-semibold" disabled={submitting}>
                        {submitting ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Posting…</> : <><Zap className="h-4 w-4 mr-2" /> Post Challenge</>}
                    </Button>
                </form>
            </div>
        </div>
    );
}
