"use client";

import { useState } from "react";
import { useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
    Rocket,
    ArrowLeft,
    CheckCircle,
    Shield,
    Globe,
    HeartPulse,
    ChevronDown,
    ChevronUp,
    Loader2,
} from "lucide-react";
import Link from "next/link";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

// ─── CONSTANTS ────────────────────────────────────────────────────────────────

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
    { value: "hipaa",     label: "HIPAA" },
    { value: "fda",       label: "FDA Cleared" },
    { value: "ce_mark",   label: "CE Mark" },
    { value: "iso_13485", label: "ISO 13485" },
    { value: "soc2",      label: "SOC 2" },
    { value: "gdpr",      label: "GDPR" },
];

const GEOGRAPHY_OPTIONS = [
    { value: "us",     label: "United States" },
    { value: "eu",     label: "Europe" },
    { value: "india",  label: "India" },
    { value: "asean",  label: "ASEAN" },
    { value: "global", label: "Global" },
];

const REVENUE_STAGES = [
    { value: "",         label: "Select stage…" },
    { value: "seed",     label: "Seed" },
    { value: "series_a", label: "Series A" },
    { value: "series_b", label: "Series B" },
    { value: "series_c", label: "Series C" },
    { value: "series_d", label: "Series D" },
];

const TEAM_SIZES = ["1–10", "11–50", "51–200", "200+"];
const VERTICALS  = ["Healthcare", "EdTech", "FinTech", "SaaS", "Hardware", "Hospitality"];
const FUNDING_STAGES_V0 = ["Pre-Seed","Seed","Series A","Series B","Series C","Series D+"];
const INTEGRATIONS = ["Epic","Cerner","Salesforce","Stripe","AWS","Azure","GCP","Twilio","Slack","Teams"];

// ─── SMALL COMPONENTS ─────────────────────────────────────────────────────────

function FieldLabel({ htmlFor, children, optional }: { htmlFor: string; children: React.ReactNode; optional?: boolean }) {
    return (
        <Label htmlFor={htmlFor} className="block text-sm font-semibold text-gray-700">
            {children}{optional && <span className="ml-1 text-xs font-normal text-gray-400">(optional)</span>}
        </Label>
    );
}

function MultiToggle({
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
        <div className="flex flex-wrap gap-2">
            {options.map((opt) => (
                <button
                    key={opt.value}
                    type="button"
                    onClick={() => toggle(opt.value)}
                    className={`rounded-full px-3 py-1 text-xs font-semibold border transition-all ${
                        selected.includes(opt.value)
                            ? "bg-violet-600 text-white border-violet-600 shadow-sm"
                            : "bg-white text-gray-600 border-gray-200 hover:border-violet-300"
                    }`}
                >
                    {opt.label}
                </button>
            ))}
        </div>
    );
}

function SectionToggle({
    title,
    subtitle,
    open,
    onToggle,
    children,
}: {
    title: string;
    subtitle: string;
    open: boolean;
    onToggle: () => void;
    children: React.ReactNode;
}) {
    return (
        <div className="rounded-xl border border-gray-200 bg-white overflow-hidden">
            <button
                type="button"
                onClick={onToggle}
                className="flex w-full items-center justify-between px-5 py-4 text-left hover:bg-gray-50 transition-colors"
            >
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

export default function SubmitProductPage() {
    const { user, isLoaded } = useUser();
    const router = useRouter();

    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isSuccess, setIsSuccess]       = useState(false);
    const [error, setError]               = useState<string | null>(null);

    const [showHealthcare, setShowHealthcare] = useState(false);
    const [showMedia, setShowMedia]           = useState(false);

    // ── CORE V0 FIELDS ───────────────────────────────────────────────────────
    const [name, setName]                 = useState("");
    const [website, setWebsite]           = useState("");
    const [category, setCategory]         = useState("HealthTech");
    const [fundingStage, setFundingStage] = useState("Series A");
    const [description, setDescription]  = useState("");

    // ── V2 HEALTHCARE FIELDS ─────────────────────────────────────────────────
    const [vertical, setVertical]                 = useState("healthcare");
    const [healthcareCategory, setHealthcareCategory] = useState("");
    const [compliance, setCompliance]             = useState<string[]>([]);
    const [revenueStage, setRevenueStage]         = useState("");
    const [geography, setGeography]               = useState<string[]>([]);
    const [teamSize, setTeamSize]                 = useState("");
    const [totalFunding, setTotalFunding]         = useState("");
    const [linkedinUrl, setLinkedinUrl]           = useState("");
    const [pitchDeckUrl, setPitchDeckUrl]         = useState("");
    const [demoVideoUrl, setDemoVideoUrl]         = useState("");
    const [integrations, setIntegrations]         = useState<string[]>([]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user) return;
        setIsSubmitting(true);
        setError(null);

        try {
            const response = await fetch(`${API_BASE}/api/v1/products`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "X-Clerk-User-Id": user.id,
                },
                body: JSON.stringify({
                    // V0
                    name,
                    website,
                    category,
                    funding_stage: fundingStage,
                    description,
                    // V2
                    vertical: vertical.toLowerCase(),
                    healthcare_category: vertical === "Healthcare" ? healthcareCategory : null,
                    compliance: compliance.length ? compliance : null,
                    revenue_stage: revenueStage || null,
                    geography: geography.length ? geography : null,
                    team_size: teamSize || null,
                    total_funding: totalFunding || null,
                    linkedin_url: linkedinUrl || null,
                    pitch_deck_url: pitchDeckUrl || null,
                    demo_video_url: demoVideoUrl || null,
                    integrations: integrations.length ? integrations : null,
                }),
            });

            if (!response.ok) {
                const data = await response.json();
                throw new Error(data.detail || "Failed to submit product");
            }

            setIsSuccess(true);
            setTimeout(() => router.push("/my-products"), 2000);
        } catch (err) {
            setError(err instanceof Error ? err.message : "Something went wrong");
        } finally {
            setIsSubmitting(false);
        }
    };

    if (!isLoaded) return (
        <div className="flex items-center justify-center min-h-screen">
            <Loader2 className="h-8 w-8 animate-spin text-violet-600" />
        </div>
    );

    if (!user) return (
        <div className="container mx-auto px-4 py-16 text-center">
            <h1 className="text-2xl font-bold mb-4">Sign In Required</h1>
            <p className="text-gray-600 mb-8">You need to sign in to submit your startup.</p>
            <Link href="/"><Button>Go to Homepage</Button></Link>
        </div>
    );

    if (isSuccess) return (
        <div className="container mx-auto px-4 py-16 text-center">
            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-emerald-100 mb-6">
                <CheckCircle className="h-10 w-10 text-emerald-500" />
            </div>
            <h1 className="text-2xl font-bold mb-2">Startup Submitted!</h1>
            <p className="text-gray-500">Your product is under review. Redirecting…</p>
        </div>
    );

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="container mx-auto px-4 py-8 max-w-2xl">
                {/* Back link */}
                <Link href="/marketplace" className="mb-6 flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-800 transition-colors">
                    <ArrowLeft className="h-4 w-4" /> Back to Marketplace
                </Link>

                {/* Page header */}
                <div className="mb-6 flex items-center gap-4">
                    <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-violet-600 to-indigo-600 shadow">
                        <Rocket className="h-5 w-5 text-white" />
                    </div>
                    <div>
                        <h1 className="text-xl font-bold text-gray-900">Submit Your Startup</h1>
                        <p className="text-sm text-gray-500">List your product on EthAum.ai healthcare marketplace</p>
                    </div>
                </div>

                {error && (
                    <div className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                    {/* ── SECTION 1: Core info (V0) ─────────────────────── */}
                    <div className="rounded-xl border border-gray-200 bg-white px-5 py-5 space-y-4">
                        <h2 className="text-sm font-bold uppercase tracking-widest text-gray-400">Basic Info</h2>

                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                            <div className="space-y-1.5">
                                <FieldLabel htmlFor="name">Startup Name *</FieldLabel>
                                <Input id="name" required placeholder="e.g. CareConnect AI" value={name} onChange={(e) => setName(e.target.value)} />
                            </div>
                            <div className="space-y-1.5">
                                <FieldLabel htmlFor="website">Website URL *</FieldLabel>
                                <Input id="website" type="url" required placeholder="https://yourcompany.com" value={website} onChange={(e) => setWebsite(e.target.value)} />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                            <div className="space-y-1.5">
                                <FieldLabel htmlFor="category">Category *</FieldLabel>
                                <select
                                    id="category"
                                    className="w-full h-10 rounded-md border border-gray-200 bg-white px-3 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-400"
                                    value={category}
                                    onChange={(e) => setCategory(e.target.value)}
                                >
                                    {["AI/ML","DevOps","FinTech","HealthTech","EdTech","MarTech","HRTech","E-commerce","SaaS","Other"].map((c) => (
                                        <option key={c} value={c}>{c}</option>
                                    ))}
                                </select>
                            </div>
                            <div className="space-y-1.5">
                                <FieldLabel htmlFor="funding_stage">Funding Stage *</FieldLabel>
                                <select
                                    id="funding_stage"
                                    className="w-full h-10 rounded-md border border-gray-200 bg-white px-3 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-400"
                                    value={fundingStage}
                                    onChange={(e) => setFundingStage(e.target.value)}
                                >
                                    {FUNDING_STAGES_V0.map((s) => <option key={s} value={s}>{s}</option>)}
                                </select>
                            </div>
                        </div>

                        <div className="space-y-1.5">
                            <FieldLabel htmlFor="description">Short Description <span className="text-gray-400 font-normal">(max 200 chars)</span></FieldLabel>
                            <Textarea
                                id="description"
                                rows={3}
                                maxLength={200}
                                placeholder="What problem does your startup solve?"
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                            />
                            <p className="text-right text-xs text-gray-400">{description.length}/200</p>
                        </div>
                    </div>

                    {/* ── SECTION 2: Vertical ───────────────────────────── */}
                    <div className="rounded-xl border border-gray-200 bg-white px-5 py-5 space-y-3">
                        <h2 className="text-sm font-bold uppercase tracking-widest text-gray-400">Vertical</h2>
                        <div className="flex flex-wrap gap-2">
                            {VERTICALS.map((v) => (
                                <button
                                    key={v}
                                    type="button"
                                    onClick={() => setVertical(v)}
                                    className={`rounded-full px-3 py-1 text-sm font-semibold border transition-all ${
                                        vertical === v
                                            ? "bg-violet-600 text-white border-violet-600 shadow"
                                            : "bg-white text-gray-600 border-gray-200 hover:border-violet-300"
                                    }`}
                                >
                                    {v === "Healthcare" ? "🏥 " : ""}{v}
                                </button>
                            ))}
                        </div>

                        {vertical === "Healthcare" && (
                            <div className="space-y-1.5 pt-1">
                                <FieldLabel htmlFor="hc_category">Healthcare Subcategory</FieldLabel>
                                <select
                                    id="hc_category"
                                    className="w-full h-10 rounded-md border border-gray-200 bg-white px-3 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500/20"
                                    value={healthcareCategory}
                                    onChange={(e) => setHealthcareCategory(e.target.value)}
                                >
                                    <option value="">Select category…</option>
                                    {HEALTHCARE_CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
                                </select>
                            </div>
                        )}
                    </div>

                    {/* ── SECTION 3: Healthcare depth (collapsible) ─────── */}
                    <SectionToggle
                        title="Healthcare Depth"
                        subtitle="Compliance, geography, stage, team"
                        open={showHealthcare}
                        onToggle={() => setShowHealthcare(!showHealthcare)}
                    >
                        {/* Compliance */}
                        <div className="space-y-1.5">
                            <FieldLabel htmlFor="compliance">Compliance Certifications</FieldLabel>
                            <MultiToggle options={COMPLIANCE_OPTIONS} selected={compliance} onChange={setCompliance} />
                        </div>

                        {/* Revenue stage + team size */}
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-1.5">
                                <FieldLabel htmlFor="revenue_stage">Revenue Stage</FieldLabel>
                                <select
                                    id="revenue_stage"
                                    className="w-full h-10 rounded-md border border-gray-200 bg-white px-3 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500/20"
                                    value={revenueStage}
                                    onChange={(e) => setRevenueStage(e.target.value)}
                                >
                                    {REVENUE_STAGES.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
                                </select>
                            </div>
                            <div className="space-y-1.5">
                                <FieldLabel htmlFor="team_size">Team Size</FieldLabel>
                                <select
                                    id="team_size"
                                    className="w-full h-10 rounded-md border border-gray-200 bg-white px-3 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500/20"
                                    value={teamSize}
                                    onChange={(e) => setTeamSize(e.target.value)}
                                >
                                    <option value="">Select…</option>
                                    {TEAM_SIZES.map((s) => <option key={s} value={s}>{s}</option>)}
                                </select>
                            </div>
                        </div>

                        {/* Total funding */}
                        <div className="space-y-1.5">
                            <FieldLabel htmlFor="total_funding">Total Funding Raised</FieldLabel>
                            <Input id="total_funding" placeholder="e.g. $2.5M" value={totalFunding} onChange={(e) => setTotalFunding(e.target.value)} />
                        </div>

                        {/* Geography */}
                        <div className="space-y-1.5">
                            <FieldLabel htmlFor="geography">Target Geography</FieldLabel>
                            <MultiToggle options={GEOGRAPHY_OPTIONS} selected={geography} onChange={setGeography} />
                        </div>

                        {/* Integrations */}
                        <div className="space-y-1.5">
                            <FieldLabel htmlFor="integrations">Key Integrations</FieldLabel>
                            <MultiToggle
                                options={INTEGRATIONS.map((i) => ({ value: i.toLowerCase(), label: i }))}
                                selected={integrations}
                                onChange={setIntegrations}
                            />
                        </div>
                    </SectionToggle>

                    {/* ── SECTION 4: Media & links (collapsible) ──────────── */}
                    <SectionToggle
                        title="Media & Links"
                        subtitle="LinkedIn, pitch deck, demo video"
                        open={showMedia}
                        onToggle={() => setShowMedia(!showMedia)}
                    >
                        <div className="space-y-1.5">
                            <FieldLabel htmlFor="linkedin" optional>LinkedIn Company URL</FieldLabel>
                            <Input id="linkedin" type="url" placeholder="https://linkedin.com/company/..." value={linkedinUrl} onChange={(e) => setLinkedinUrl(e.target.value)} />
                        </div>
                        <div className="space-y-1.5">
                            <FieldLabel htmlFor="pitch_deck" optional>Pitch Deck URL</FieldLabel>
                            <Input id="pitch_deck" type="url" placeholder="https://docsend.com/..." value={pitchDeckUrl} onChange={(e) => setPitchDeckUrl(e.target.value)} />
                        </div>
                        <div className="space-y-1.5">
                            <FieldLabel htmlFor="demo_video" optional>Demo Video URL</FieldLabel>
                            <Input id="demo_video" type="url" placeholder="https://loom.com/..." value={demoVideoUrl} onChange={(e) => setDemoVideoUrl(e.target.value)} />
                        </div>
                    </SectionToggle>

                    {/* ── SUBMIT ───────────────────────────────────────────── */}
                    <Button
                        type="submit"
                        className="w-full bg-violet-600 hover:bg-violet-700 h-11 text-base font-semibold"
                        disabled={isSubmitting}
                    >
                        {isSubmitting ? (
                            <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Submitting…</>
                        ) : (
                            <><Rocket className="h-4 w-4 mr-2" /> Submit Startup</>
                        )}
                    </Button>

                    {/* Trust indicators */}
                    <div className="flex items-center justify-center gap-6 text-xs text-gray-400">
                        <span className="flex items-center gap-1.5"><Shield className="h-3.5 w-3.5 text-violet-400" /> Secure & encrypted</span>
                        <span className="flex items-center gap-1.5"><Globe className="h-3.5 w-3.5 text-violet-400" /> GDPR compliant</span>
                        <span className="flex items-center gap-1.5"><HeartPulse className="h-3.5 w-3.5 text-violet-400" /> Healthcare-first</span>
                    </div>
                </form>
            </div>
        </div>
    );
}
