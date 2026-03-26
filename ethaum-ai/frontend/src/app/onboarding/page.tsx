"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useUser } from "@clerk/nextjs";
import {
    Building2,
    Rocket,
    TrendingUp,
    ArrowRight,
    CheckCircle2,
    Shield,
    Globe,
    Users,
    ChevronLeft,
    Loader2,
} from "lucide-react";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

// ─── TYPES ────────────────────────────────────────────────────────────────────

type Role = "startup" | "enterprise" | "investor";

interface RoleCard {
    id: Role;
    title: string;
    subtitle: string;
    description: string;
    icon: React.FC<{ className?: string }>;
    gradient: string;
    border: string;
    features: string[];
}

// ─── ROLE CARDS ───────────────────────────────────────────────────────────────

const ROLES: RoleCard[] = [
    {
        id: "startup",
        title: "Startup Founder",
        subtitle: "Get discovered",
        description:
            "List your healthcare startup, collect verified reviews, run product launches, and connect with enterprise buyers and investors.",
        icon: Rocket,
        gradient: "from-violet-600 to-indigo-600",
        border: "border-violet-500",
        features: [
            "AI trust score",
            "Enterprise matchmaking",
            "Investor discovery",
            "Launch campaigns",
        ],
    },
    {
        id: "enterprise",
        title: "Enterprise Buyer",
        subtitle: "Find solutions",
        description:
            "Hospital, pharma, health system, or corporation? Discover and evaluate pre-vetted healthcare startups for your innovation pipeline.",
        icon: Building2,
        gradient: "from-blue-600 to-cyan-600",
        border: "border-blue-500",
        features: [
            "Deep healthcare filters",
            "Compliance verification",
            "Post innovation challenges",
            "Direct messaging",
        ],
    },
    {
        id: "investor",
        title: "Investor / VC",
        subtitle: "Source deals",
        description:
            "Discover high-potential healthcare startups, run due diligence with Trust Score data, and track your portfolio.",
        icon: TrendingUp,
        gradient: "from-emerald-600 to-teal-600",
        border: "border-emerald-500",
        features: [
            "Curated deal flow",
            "Trust Score analytics",
            "AI due diligence reports",
            "Trend dashboards",
        ],
    },
];

// ─── HEALTHCARE CATEGORIES ────────────────────────────────────────────────────

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
const COMPLIANCE_OPTIONS = ["HIPAA", "FDA Cleared", "CE Mark", "ISO 13485", "SOC 2", "GDPR"];
const GEOGRAPHY_OPTIONS   = ["US", "EU", "India", "ASEAN", "Global"];
const STAGE_OPTIONS       = ["Seed", "Series A", "Series B", "Series C", "Series D"];
const TEAM_SIZES          = ["1–10", "11–50", "51–200", "200+"];
const VERTICALS           = ["Healthcare", "EdTech", "FinTech", "SaaS", "Hardware", "Hospitality"];
const ENTERPRISE_INDUSTRIES = ["Hospital / Health System", "Pharma", "Insurance", "Corporate", "Government", "Other"];
const ENTERPRISE_SIZES    = ["100–500", "500–2000", "2000–10,000", "10,000+"];
const INVESTOR_STAGES     = ["Seed", "Series A", "Series B", "Series C", "Series D"];
const CHECK_SIZES         = ["< $250K", "$250K–$1M", "$1M–$5M", "$5M–$25M", "$25M+"];

// ─── UTILITY COMPONENTS ───────────────────────────────────────────────────────

function MultiCheckbox({
    label,
    options,
    selected,
    onChange,
}: {
    label: string;
    options: string[];
    selected: string[];
    onChange: (vals: string[]) => void;
}) {
    const toggle = (opt: string) => {
        onChange(selected.includes(opt) ? selected.filter((v) => v !== opt) : [...selected, opt]);
    };
    return (
        <div className="space-y-2">
            <label className="block text-sm font-semibold text-slate-300">{label}</label>
            <div className="flex flex-wrap gap-2">
                {options.map((opt) => (
                    <button
                        key={opt}
                        type="button"
                        onClick={() => toggle(opt)}
                        className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-all border ${
                            selected.includes(opt)
                                ? "bg-violet-600 border-violet-500 text-white shadow-lg shadow-violet-900/30"
                                : "bg-white/5 border-white/15 text-slate-300 hover:border-violet-500/50 hover:text-white"
                        }`}
                    >
                        {opt}
                    </button>
                ))}
            </div>
        </div>
    );
}

function FormInput({
    label,
    placeholder,
    value,
    onChange,
    required,
    type = "text",
}: {
    label: string;
    placeholder?: string;
    value: string;
    onChange: (v: string) => void;
    required?: boolean;
    type?: string;
}) {
    return (
        <div className="space-y-1.5">
            <label className="block text-sm font-semibold text-slate-300">
                {label} {required && <span className="text-violet-400">*</span>}
            </label>
            <input
                type={type}
                required={required}
                value={value}
                onChange={(e) => onChange(e.target.value)}
                placeholder={placeholder}
                className="w-full rounded-xl bg-white/5 border border-white/15 px-4 py-2.5 text-sm text-white placeholder-slate-500 outline-none transition focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20"
            />
        </div>
    );
}

function FormSelect({
    label,
    options,
    value,
    onChange,
    required,
}: {
    label: string;
    options: string[];
    value: string;
    onChange: (v: string) => void;
    required?: boolean;
}) {
    return (
        <div className="space-y-1.5">
            <label className="block text-sm font-semibold text-slate-300">
                {label} {required && <span className="text-violet-400">*</span>}
            </label>
            <select
                required={required}
                value={value}
                onChange={(e) => onChange(e.target.value)}
                className="w-full rounded-xl bg-white/5 border border-white/15 px-4 py-2.5 text-sm text-white outline-none transition focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20 [&>option]:bg-slate-900"
            >
                <option value="">Select…</option>
                {options.map((o) => (
                    <option key={o} value={o}>{o}</option>
                ))}
            </select>
        </div>
    );
}

// ─── ROLE-SPECIFIC FORMS ──────────────────────────────────────────────────────

function StartupForm({
    onChange,
}: {
    onChange: (data: Record<string, unknown>) => void;
}) {
    const [companyName, setCompanyName] = useState("");
    const [productName, setProductName] = useState("");
    const [websiteUrl, setWebsiteUrl]   = useState("");
    const [linkedinUrl, setLinkedinUrl] = useState("");
    const [vertical, setVertical]       = useState("");
    const [stage, setStage]             = useState("");
    const [healthcateg, setHealthcateg] = useState("");
    const [compliance, setCompliance]   = useState<string[]>([]);
    const [geography, setGeography]     = useState<string[]>([]);
    const [teamSize, setTeamSize]       = useState("");
    const [funding, setFunding]         = useState("");
    const [description, setDescription] = useState("");

    const update = (partial: Record<string, unknown>) => {
        onChange({
            company_name: companyName,
            product_name: productName,
            website_url: websiteUrl,
            linkedin_url: linkedinUrl,
            vertical,
            revenue_stage: stage,
            healthcare_category: healthcateg,
            compliance,
            geography,
            team_size: teamSize,
            total_funding: funding,
            short_description: description,
            ...partial,
        });
    };

    const field =
        (setter: (v: string) => void, key: string) =>
        (v: string) => {
            setter(v);
            update({ [key]: v });
        };

    return (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <FormInput label="Company Name" required placeholder="Acme Health Inc." value={companyName} onChange={field(setCompanyName, "company_name")} />
            <FormInput label="Product / Startup Name" required placeholder="AcmeHealth AI" value={productName} onChange={field(setProductName, "product_name")} />
            <FormInput label="Website URL" required type="url" placeholder="https://acmehealth.com" value={websiteUrl} onChange={field(setWebsiteUrl, "website_url")} />
            <FormInput label="LinkedIn URL" placeholder="https://linkedin.com/company/..." value={linkedinUrl} onChange={field(setLinkedinUrl, "linkedin_url")} />
            <div className="sm:col-span-2">
                <FormSelect label="Vertical" required options={VERTICALS} value={vertical} onChange={field(setVertical, "vertical")} />
            </div>
            {vertical === "Healthcare" && (
                <div className="sm:col-span-2">
                    <FormSelect label="Healthcare Category" options={HEALTHCARE_CATEGORIES} value={healthcateg} onChange={field(setHealthcateg, "healthcare_category")} />
                </div>
            )}
            <FormSelect label="Revenue Stage" options={STAGE_OPTIONS} value={stage} onChange={field(setStage, "revenue_stage")} />
            <FormSelect label="Team Size" options={TEAM_SIZES} value={teamSize} onChange={field(setTeamSize, "team_size")} />
            <FormInput label="Total Funding Raised" placeholder="e.g. $2.5M" value={funding} onChange={field(setFunding, "total_funding")} />
            <div className="sm:col-span-2">
                <MultiCheckbox label="Compliance Certifications" options={COMPLIANCE_OPTIONS} selected={compliance} onChange={(v) => { setCompliance(v); update({ compliance: v }); }} />
            </div>
            <div className="sm:col-span-2">
                <MultiCheckbox label="Target Geography" options={GEOGRAPHY_OPTIONS} selected={geography} onChange={(v) => { setGeography(v); update({ geography: v }); }} />
            </div>
            <div className="sm:col-span-2 space-y-1.5">
                <label className="block text-sm font-semibold text-slate-300">Short Description <span className="text-slate-500">(max 200 chars)</span></label>
                <textarea
                    maxLength={200}
                    rows={3}
                    value={description}
                    onChange={(e) => { setDescription(e.target.value); update({ short_description: e.target.value }); }}
                    placeholder="What problem does your startup solve?"
                    className="w-full rounded-xl bg-white/5 border border-white/15 px-4 py-2.5 text-sm text-white placeholder-slate-500 outline-none transition focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20 resize-none"
                />
                <p className="text-right text-xs text-slate-500">{description.length}/200</p>
            </div>
        </div>
    );
}

function EnterpriseForm({ onChange }: { onChange: (data: Record<string, unknown>) => void }) {
    const [companyName, setCompanyName] = useState("");
    const [website, setWebsite]         = useState("");
    const [industry, setIndustry]       = useState("");
    const [companySize, setCompanySize] = useState("");
    const [contactName, setContactName] = useState("");
    const [contactTitle, setContactTitle] = useState("");
    const [geography, setGeography]     = useState<string[]>([]);
    const [lookingFor, setLookingFor]   = useState<string[]>([]);

    const update = (partial: Record<string, unknown>) => {
        onChange({
            company_name: companyName,
            company_website: website,
            industry,
            company_size: companySize,
            contact_name: contactName,
            contact_title: contactTitle,
            geography,
            looking_for: lookingFor,
            ...partial,
        });
    };

    const field = (setter: (v: string) => void, key: string) => (v: string) => {
        setter(v); update({ [key]: v });
    };

    return (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <FormInput label="Company Name" required placeholder="Memorial Health System" value={companyName} onChange={field(setCompanyName, "company_name")} />
            <FormInput label="Company Website" required type="url" placeholder="https://memorialhealth.org" value={website} onChange={field(setWebsite, "company_website")} />
            <FormSelect label="Industry" required options={ENTERPRISE_INDUSTRIES} value={industry} onChange={field(setIndustry, "industry")} />
            <FormSelect label="Company Size" options={ENTERPRISE_SIZES} value={companySize} onChange={field(setCompanySize, "company_size")} />
            <FormInput label="Contact Name" placeholder="Dr. Jane Smith" value={contactName} onChange={field(setContactName, "contact_name")} />
            <FormInput label="Contact Title" placeholder="Chief Innovation Officer" value={contactTitle} onChange={field(setContactTitle, "contact_title")} />
            <div className="sm:col-span-2">
                <MultiCheckbox label="Target Geography" options={GEOGRAPHY_OPTIONS} selected={geography} onChange={(v) => { setGeography(v); update({ geography: v }); }} />
            </div>
            <div className="sm:col-span-2">
                <MultiCheckbox label="What are you looking for?" options={HEALTHCARE_CATEGORIES} selected={lookingFor} onChange={(v) => { setLookingFor(v); update({ looking_for: v }); }} />
            </div>
        </div>
    );
}

function InvestorForm({ onChange }: { onChange: (data: Record<string, unknown>) => void }) {
    const [fundName, setFundName]     = useState("");
    const [fundWebsite, setFundWeb]   = useState("");
    const [linkedinUrl, setLinkedin]  = useState("");
    const [checkSize, setCheckSize]   = useState("");
    const [stageFocus, setStageFocus] = useState<string[]>([]);
    const [sectorFocus, setSectorFocus] = useState<string[]>(["Healthcare"]);
    const [geoFocus, setGeoFocus]     = useState<string[]>([]);

    const update = (partial: Record<string, unknown>) => {
        onChange({
            fund_name: fundName,
            fund_website: fundWebsite,
            linkedin_url: linkedinUrl,
            check_size: checkSize,
            stage_focus: stageFocus,
            sector_focus: sectorFocus,
            geography_focus: geoFocus,
            ...partial,
        });
    };

    const field = (setter: (v: string) => void, key: string) => (v: string) => {
        setter(v); update({ [key]: v });
    };

    return (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <FormInput label="Fund / Firm Name" required placeholder="Horizon Health Ventures" value={fundName} onChange={field(setFundName, "fund_name")} />
            <FormInput label="Fund Website" type="url" placeholder="https://horizonhealth.vc" value={fundWebsite} onChange={field(setFundWeb, "fund_website")} />
            <FormInput label="LinkedIn URL" placeholder="https://linkedin.com/in/..." value={linkedinUrl} onChange={field(setLinkedin, "linkedin_url")} />
            <FormSelect label="Typical Check Size" options={CHECK_SIZES} value={checkSize} onChange={field(setCheckSize, "check_size")} />
            <div className="sm:col-span-2">
                <MultiCheckbox label="Investment Stage Focus" options={INVESTOR_STAGES} selected={stageFocus} onChange={(v) => { setStageFocus(v); update({ stage_focus: v }); }} />
            </div>
            <div className="sm:col-span-2">
                <MultiCheckbox label="Sector Focus" options={VERTICALS} selected={sectorFocus} onChange={(v) => { setSectorFocus(v); update({ sector_focus: v }); }} />
            </div>
            <div className="sm:col-span-2">
                <MultiCheckbox label="Geography Focus" options={GEOGRAPHY_OPTIONS} selected={geoFocus} onChange={(v) => { setGeoFocus(v); update({ geography_focus: v }); }} />
            </div>
        </div>
    );
}

// ─── MAIN PAGE ────────────────────────────────────────────────────────────────

export default function OnboardingPage() {
    const { user } = useUser();
    const router   = useRouter();

    const [step, setStep]           = useState<1 | 2 | 3>(1);
    const [selectedRole, setSelectedRole] = useState<Role | null>(null);
    const [formData, setFormData]   = useState<Record<string, unknown>>({});
    const [loading, setLoading]     = useState(false);
    const [error, setError]         = useState<string | null>(null);

    const selectedCard = ROLES.find((r) => r.id === selectedRole);

    const handleRoleSelect = (role: Role) => {
        setSelectedRole(role);
        setStep(2);
    };

    const handleSubmit = async () => {
        if (!user || !selectedRole) return;
        setLoading(true);
        setError(null);

        try {
            const payload = {
                role_v2: selectedRole,
                company_name: (formData.company_name as string) ?? (formData.fund_name as string) ?? null,
                company_website: (formData.company_website as string) ?? (formData.fund_website as string) ?? null,
                data: formData,
            };

            const res = await fetch(`${API_BASE}/api/v1/onboarding`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "X-Clerk-User-Id": user.id,
                },
                body: JSON.stringify(payload),
            });

            if (!res.ok) {
                const err = await res.json();
                throw new Error(err.detail ?? "Onboarding failed. Please try again.");
            }

            const data = await res.json();
            setStep(3);

            // Small delay so user sees completion screen before redirect
            setTimeout(() => {
                router.push(data.redirect_to ?? `/dashboard/${selectedRole}`);
            }, 1800);
        } catch (err: unknown) {
            setError(err instanceof Error ? err.message : "Something went wrong.");
        } finally {
            setLoading(false);
        }
    };

    // ── STEP 3: SUCCESS ───────────────────────────────────────────────────────
    if (step === 3) {
        return (
            <div className="min-h-screen bg-[#0A0B14] flex items-center justify-center">
                {/* Mesh gradient */}
                <div className="pointer-events-none fixed inset-0 overflow-hidden">
                    <div className="absolute -top-40 -right-40 h-[600px] w-[600px] rounded-full bg-violet-600/20 blur-[120px]" />
                    <div className="absolute -bottom-40 -left-40 h-[600px] w-[600px] rounded-full bg-indigo-600/15 blur-[120px]" />
                </div>
                <div className="relative z-10 text-center space-y-4">
                    <div className="inline-flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-violet-600 to-indigo-600 shadow-2xl shadow-violet-900/40 mx-auto">
                        <CheckCircle2 className="h-10 w-10 text-white" />
                    </div>
                    <h1 className="text-3xl font-bold text-white">You&apos;re all set!</h1>
                    <p className="text-slate-400 text-lg">Redirecting to your dashboard…</p>
                    <div className="flex justify-center">
                        <Loader2 className="h-5 w-5 animate-spin text-violet-400" />
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#0A0B14] antialiased">
            {/* Ambient mesh gradient */}
            <div className="pointer-events-none fixed inset-0 overflow-hidden">
                <div className="absolute -top-40 -right-40 h-[700px] w-[700px] rounded-full bg-violet-600/18 blur-[130px]" />
                <div className="absolute top-1/2 -left-60 h-[500px] w-[500px] rounded-full bg-indigo-600/12 blur-[110px]" />
                <div className="absolute -bottom-40 right-1/3 h-[500px] w-[500px] rounded-full bg-violet-700/10 blur-[100px]" />
            </div>

            <div className="relative z-10 mx-auto max-w-5xl px-4 py-16 sm:px-6">
                {/* Header */}
                <div className="mb-12 text-center">
                    <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-violet-500/30 bg-violet-600/10 px-4 py-1.5 text-sm font-medium text-violet-300 backdrop-blur-sm">
                        <Shield className="h-3.5 w-3.5" />
                        EthAum.ai — Healthcare Marketplace
                    </div>
                    <h1 className="text-4xl font-bold tracking-tight text-white sm:text-5xl">
                        {step === 1 ? (
                            <>How will you use <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-400 to-indigo-400">EthAum</span>?</>
                        ) : (
                            <>Tell us about your <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-400 to-indigo-400">{selectedCard?.title}</span></>
                        )}
                    </h1>
                    <p className="mt-3 text-lg text-slate-400">
                        {step === 1
                            ? "Choose your role to get a personalised experience."
                            : "Fill in the details to set up your profile."}
                    </p>
                </div>

                {/* Progress bar */}
                <div className="mb-10 flex items-center justify-center gap-3">
                    {[1, 2].map((s) => (
                        <div key={s} className="flex items-center gap-3">
                            <div
                                className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-semibold transition-all ${
                                    step >= s
                                        ? "bg-violet-600 text-white shadow-lg shadow-violet-900/40"
                                        : "bg-white/5 text-slate-500 border border-white/10"
                                }`}
                            >
                                {step > s ? <CheckCircle2 className="h-4 w-4" /> : s}
                            </div>
                            <span className={`text-sm font-medium ${step >= s ? "text-white" : "text-slate-500"}`}>
                                {s === 1 ? "Choose role" : "Your profile"}
                            </span>
                            {s < 2 && <div className="h-px w-12 bg-white/10" />}
                        </div>
                    ))}
                </div>

                {/* ── STEP 1: ROLE SELECTION ─────────────────────────────────────────────── */}
                {step === 1 && (
                    <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
                        {ROLES.map((role) => {
                            const Icon = role.icon;
                            return (
                                <button
                                    key={role.id}
                                    onClick={() => handleRoleSelect(role.id)}
                                    className={`group relative flex flex-col rounded-2xl border bg-white/[0.03] p-6 text-left backdrop-blur-sm transition-all duration-300 hover:bg-white/[0.06] hover:scale-[1.02] hover:shadow-2xl hover:${role.border.replace("border-", "shadow-")} ${role.border}/30 hover:border-opacity-60`}
                                >
                                    {/* Gradient glow on hover */}
                                    <div className={`absolute inset-0 rounded-2xl bg-gradient-to-br ${role.gradient} opacity-0 group-hover:opacity-[0.06] transition-opacity`} />

                                    <div className={`inline-flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br ${role.gradient} shadow-lg mb-4`}>
                                        <Icon className="h-6 w-6 text-white" />
                                    </div>

                                    <div className="mb-1 text-xs font-semibold uppercase tracking-widest text-slate-500">
                                        {role.subtitle}
                                    </div>
                                    <h3 className="mb-2 text-xl font-bold text-white">{role.title}</h3>
                                    <p className="mb-5 text-sm leading-relaxed text-slate-400">{role.description}</p>

                                    <ul className="mt-auto space-y-2">
                                        {role.features.map((f) => (
                                            <li key={f} className="flex items-center gap-2 text-xs text-slate-400">
                                                <CheckCircle2 className="h-3.5 w-3.5 text-violet-400 flex-shrink-0" />
                                                {f}
                                            </li>
                                        ))}
                                    </ul>

                                    <div className="mt-6 flex items-center gap-1 text-sm font-semibold text-violet-400 group-hover:text-violet-300 transition-colors">
                                        Select this role <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                                    </div>
                                </button>
                            );
                        })}
                    </div>
                )}

                {/* ── STEP 2: ROLE-SPECIFIC FORM ─────────────────────────────────────────── */}
                {step === 2 && selectedRole && (
                    <div className="mx-auto max-w-2xl">
                        {/* Back button */}
                        <button
                            onClick={() => setStep(1)}
                            className="mb-6 flex items-center gap-1.5 text-sm text-slate-400 hover:text-white transition-colors"
                        >
                            <ChevronLeft className="h-4 w-4" /> Change role
                        </button>

                        {/* Role badge */}
                        {selectedCard && (
                            <div className="mb-6 flex items-center gap-3">
                                <div className={`flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br ${selectedCard.gradient}`}>
                                    <selectedCard.icon className="h-5 w-5 text-white" />
                                </div>
                                <div>
                                    <p className="text-xs font-semibold uppercase tracking-widest text-slate-500">Selected role</p>
                                    <p className="font-bold text-white">{selectedCard.title}</p>
                                </div>
                            </div>
                        )}

                        {/* Glassmorphism form card */}
                        <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-6 backdrop-blur-sm shadow-2xl">
                            {selectedRole === "startup"    && <StartupForm    onChange={setFormData} />}
                            {selectedRole === "enterprise" && <EnterpriseForm onChange={setFormData} />}
                            {selectedRole === "investor"   && <InvestorForm   onChange={setFormData} />}

                            {/* Error */}
                            {error && (
                                <div className="mt-4 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">
                                    {error}
                                </div>
                            )}

                            {/* Submit button */}
                            <button
                                onClick={handleSubmit}
                                disabled={loading}
                                className="mt-6 w-full flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-violet-900/30 transition-all hover:shadow-violet-900/50 hover:from-violet-500 hover:to-indigo-500 disabled:cursor-not-allowed disabled:opacity-60"
                            >
                                {loading ? (
                                    <>
                                        <Loader2 className="h-4 w-4 animate-spin" />
                                        Setting up your profile…
                                    </>
                                ) : (
                                    <>
                                        Complete Setup <ArrowRight className="h-4 w-4" />
                                    </>
                                )}
                            </button>

                            {/* Trust indicators */}
                            <div className="mt-4 flex items-center justify-center gap-5 text-xs text-slate-500">
                                <div className="flex items-center gap-1.5">
                                    <Shield className="h-3.5 w-3.5 text-violet-500" />
                                    Secure & encrypted
                                </div>
                                <div className="flex items-center gap-1.5">
                                    <Globe className="h-3.5 w-3.5 text-violet-500" />
                                    GDPR compliant
                                </div>
                                <div className="flex items-center gap-1.5">
                                    <Users className="h-3.5 w-3.5 text-violet-500" />
                                    Edit anytime
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
