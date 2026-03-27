"use client";

import { useEffect, useState } from "react";
import { useUser } from "@clerk/nextjs";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
    CheckCircle,
    X,
    Zap,
    Loader2,
    Star,
    ArrowRight,
    CreditCard,
} from "lucide-react";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

// ─── PLAN DATA ────────────────────────────────────────────────────────────────

const PLANS = [
    {
        slug:        "free",
        name:        "Free",
        price:       0,
        period:      "forever",
        tagline:     "Get started — no credit card required",
        color:       "border-gray-200",
        btnClass:    "bg-gray-100 text-gray-700 hover:bg-gray-200",
        highlighted: false,
        features: [
            "Basic product listing",
            "Receive & display reviews",
            "Trust Score visibility",
            "Public marketplace profile",
        ],
        missing: [
            "Launch campaigns",
            "AI sentiment analysis",
            "Matchmaking",
            "Enterprise deal listings",
        ],
    },
    {
        slug:        "starter",
        name:        "Starter",
        price:       49,
        period:      "/ month",
        tagline:     "For early-stage startups ready to grow",
        color:       "border-violet-200",
        btnClass:    "bg-violet-100 text-violet-700 hover:bg-violet-200",
        highlighted: false,
        features: [
            "Everything in Free",
            "1 product launch / month",
            "Embeddable trust badge",
            "1 active enterprise deal listing",
            "Email support",
        ],
        missing: [
            "AI sentiment analysis",
            "Matchmaking",
            "Unlimited launches",
        ],
    },
    {
        slug:        "growth",
        name:        "Growth",
        price:       149,
        period:      "/ month",
        tagline:     "The full platform — at a fraction of competitor cost",
        color:       "border-violet-600 ring-2 ring-violet-500/30",
        btnClass:    "bg-violet-600 text-white hover:bg-violet-700 shadow-md",
        highlighted: true,
        badge:       "Most Popular",
        features: [
            "Everything in Starter",
            "Unlimited product launches",
            "AI-powered review sentiment",
            "Gartner-style quadrant view",
            "Validation reports",
            "AI matchmaking with buyers",
            "3 active enterprise deal listings",
            "Priority support",
        ],
        missing: [],
    },
    {
        slug:        "enterprise_buyer",
        name:        "Enterprise Buyer",
        price:       299,
        period:      "/ month",
        tagline:     "For healthcare enterprises sourcing innovation",
        color:       "border-indigo-200",
        btnClass:    "bg-indigo-600 text-white hover:bg-indigo-700",
        highlighted: false,
        features: [
            "Full marketplace discovery",
            "AI-powered startup matching",
            "Post innovation challenges",
            "Direct in-platform messaging",
            "Due diligence reports",
            "Compliance filter & verification",
        ],
        missing: [],
    },
    {
        slug:        "investor",
        name:        "Investor",
        price:       99,
        period:      "/ month",
        tagline:     "For healthcare-focused VCs and angels",
        color:       "border-amber-200",
        btnClass:    "bg-amber-500 text-white hover:bg-amber-600",
        highlighted: false,
        features: [
            "Full marketplace discovery",
            "Portfolio tracking dashboard",
            "Trust Score trend analysis",
            "Category trend dashboards",
            "Intro request to founders",
        ],
        missing: [],
    },
];

// ─── COMPARISON TABLE ─────────────────────────────────────────────────────────

const COMPARE_ROWS = [
    { label: "Product listing & reviews",    free: true,  starter: true,  growth: true,   ent: true,  inv: true  },
    { label: "Launch campaigns",             free: false, starter: "1/mo", growth: "∞",   ent: "∞",  inv: "—"   },
    { label: "Trust Score",                  free: true,  starter: true,  growth: true,   ent: true,  inv: true  },
    { label: "AI sentiment analysis",        free: false, starter: false, growth: true,   ent: true,  inv: false },
    { label: "AI matchmaking",               free: false, starter: false, growth: true,   ent: true,  inv: false },
    { label: "Enterprise deal listings",     free: false, starter: "1",   growth: "3",    ent: "∞",  inv: "—"   },
    { label: "Challenge board",              free: false, starter: false, growth: false,  ent: true,  inv: false },
    { label: "Direct messaging",             free: false, starter: false, growth: false,  ent: true,  inv: true  },
    { label: "Portfolio tracking",           free: false, starter: false, growth: false,  ent: false, inv: true  },
    { label: "Due diligence reports",        free: false, starter: false, growth: false,  ent: true,  inv: false },
    { label: "Gartner-style quadrant",       free: false, starter: false, growth: true,   ent: true,  inv: true  },
];

function CompareCell({ val }: { val: boolean | string }) {
    if (val === true)  return <CheckCircle className="mx-auto h-4 w-4 text-emerald-500" />;
    if (val === false) return <X           className="mx-auto h-4 w-4 text-gray-300"    />;
    return <span className="text-xs font-semibold text-violet-700">{val}</span>;
}

// ─── PLAN CARD ────────────────────────────────────────────────────────────────

function PlanCard({
    plan,
    currentPlan,
    onUpgrade,
    loading,
}: {
    plan: typeof PLANS[0];
    currentPlan: string;
    onUpgrade: (slug: string) => void;
    loading: string | null;
}) {
    const isCurrent = currentPlan === plan.slug;
    const isFree    = plan.slug === "free";

    return (
        <div className={`relative flex flex-col rounded-2xl border-2 bg-white p-6 transition-shadow hover:shadow-lg ${plan.color}`}>
            {plan.badge && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-violet-600 px-3 py-0.5 text-xs font-bold text-white shadow">
                    {plan.badge}
                </div>
            )}

            <div className="mb-4">
                <h2 className="text-lg font-bold text-gray-900">{plan.name}</h2>
                <p className="mt-0.5 text-xs text-gray-500">{plan.tagline}</p>
            </div>

            <div className="mb-5">
                <span className="text-3xl font-extrabold text-gray-900">
                    {plan.price === 0 ? "Free" : `$${plan.price}`}
                </span>
                {plan.price > 0 && <span className="text-sm text-gray-500 ml-1">{plan.period}</span>}
            </div>

            {/* CTA */}
            {isCurrent ? (
                <div className="mb-5 flex items-center gap-1.5 rounded-xl bg-emerald-50 px-4 py-2.5 text-sm font-semibold text-emerald-700">
                    <CheckCircle className="h-4 w-4" /> Current Plan
                </div>
            ) : isFree ? (
                <div className="mb-5 rounded-xl bg-gray-100 px-4 py-2.5 text-center text-sm font-semibold text-gray-500">
                    Default
                </div>
            ) : (
                <button
                    onClick={() => onUpgrade(plan.slug)}
                    disabled={loading === plan.slug}
                    className={`mb-5 flex w-full items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold transition-colors ${plan.btnClass} disabled:opacity-50`}
                >
                    {loading === plan.slug
                        ? <><Loader2 className="h-4 w-4 animate-spin" /> Redirecting…</>
                        : <><CreditCard className="h-4 w-4" /> Upgrade to {plan.name}</>
                    }
                </button>
            )}

            {/* Features */}
            <ul className="flex-1 space-y-2">
                {plan.features.map((f) => (
                    <li key={f} className="flex items-start gap-2 text-sm text-gray-700">
                        <CheckCircle className="mt-0.5 h-3.5 w-3.5 shrink-0 text-emerald-500" />
                        {f}
                    </li>
                ))}
                {(plan.missing ?? []).map((f) => (
                    <li key={f} className="flex items-start gap-2 text-sm text-gray-400 line-through">
                        <X className="mt-0.5 h-3.5 w-3.5 shrink-0 text-gray-300" />
                        {f}
                    </li>
                ))}
            </ul>
        </div>
    );
}

// ─── MAIN PAGE ────────────────────────────────────────────────────────────────

export default function PricingPage() {
    const { user } = useUser();
    const router   = useRouter();
    const [currentPlan, setCurrentPlan]  = useState("free");
    const [planStatus,  setPlanStatus]   = useState("active");
    const [loadingPlan, setLoadingPlan]  = useState<string | null>(null);
    const [successMsg,  setSuccessMsg]   = useState<string | null>(null);
    const [errorMsg,    setErrorMsg]     = useState<string | null>(null);

    // Detect success/cancel query params from Stripe redirect
    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        if (params.get("success")) setSuccessMsg("🎉 Subscription activated! Your plan has been upgraded.");
        if (params.get("canceled")) setErrorMsg("Payment was canceled. You can try again anytime.");
    }, []);

    // Fetch current subscription
    useEffect(() => {
        if (!user) return;
        fetch(`${API_BASE}/api/v1/payments/subscription`, {
            headers: { "X-Clerk-User-Id": user.id },
        })
            .then((r) => r.json())
            .then((d) => { setCurrentPlan(d.plan ?? "free"); setPlanStatus(d.status ?? "active"); })
            .catch(() => {});
    }, [user]);

    const handleUpgrade = async (planSlug: string) => {
        if (!user) { router.push("/sign-in"); return; }
        setLoadingPlan(planSlug);
        setErrorMsg(null);
        try {
            const res = await fetch(`${API_BASE}/api/v1/payments/create-checkout`, {
                method: "POST",
                headers: { "Content-Type": "application/json", "X-Clerk-User-Id": user.id },
                body: JSON.stringify({ plan: planSlug }),
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.detail || "Failed to start checkout");
            window.location.href = data.checkout_url;
        } catch (err) {
            setErrorMsg(err instanceof Error ? err.message : "Something went wrong");
            setLoadingPlan(null);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Hero */}
            <div className="bg-gradient-to-br from-violet-700 via-violet-600 to-indigo-600 px-4 py-16 text-center text-white">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-white/20 backdrop-blur mb-4">
                    <Zap className="h-6 w-6" />
                </div>
                <h1 className="text-4xl font-extrabold tracking-tight">
                    What costs $1,000+/month across 4 platforms
                </h1>
                <p className="mt-2 text-lg font-semibold text-violet-200">
                    G2 + Product Hunt + Gartner + AppSumo → we do it all for{" "}
                    <span className="underline decoration-violet-300">$149</span>.
                </p>
                <p className="mt-3 text-sm text-violet-300">
                    The only healthcare-specific B2B marketplace. Verified Trust Scores, compliance filters, AI matching.
                </p>
            </div>

            <div className="container mx-auto px-4 py-10">
                {/* Status banners */}
                {successMsg && (
                    <div className="mb-6 flex items-center gap-3 rounded-xl border border-emerald-200 bg-emerald-50 px-5 py-3 text-sm font-semibold text-emerald-700">
                        <CheckCircle className="h-5 w-5 shrink-0" /> {successMsg}
                    </div>
                )}
                {errorMsg && (
                    <div className="mb-6 rounded-xl border border-red-200 bg-red-50 px-5 py-3 text-sm text-red-700">
                        {errorMsg}
                    </div>
                )}

                {/* Plan grid */}
                <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-5 mb-14">
                    {PLANS.map((plan) => (
                        <PlanCard
                            key={plan.slug}
                            plan={plan}
                            currentPlan={currentPlan}
                            onUpgrade={handleUpgrade}
                            loading={loadingPlan}
                        />
                    ))}
                </div>

                {/* Comparison table */}
                <div className="mb-14">
                    <h2 className="mb-5 text-center text-2xl font-bold text-gray-900">Detailed Comparison</h2>
                    <div className="overflow-x-auto rounded-2xl border border-gray-200 bg-white shadow-sm">
                        <table className="min-w-full text-sm">
                            <thead>
                                <tr className="border-b border-gray-100 bg-gray-50">
                                    <th className="px-5 py-3 text-left font-semibold text-gray-500">Feature</th>
                                    {["Free", "Starter", "Growth", "Enterprise", "Investor"].map((h) => (
                                        <th key={h} className="px-4 py-3 text-center text-xs font-bold text-gray-600">{h}</th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                                {COMPARE_ROWS.map((row) => (
                                    <tr key={row.label} className="hover:bg-gray-50/50">
                                        <td className="px-5 py-2.5 font-medium text-gray-700">{row.label}</td>
                                        <td className="px-4 py-2.5 text-center"><CompareCell val={row.free}    /></td>
                                        <td className="px-4 py-2.5 text-center"><CompareCell val={row.starter} /></td>
                                        <td className="px-4 py-2.5 text-center bg-violet-50/40"><CompareCell val={row.growth}  /></td>
                                        <td className="px-4 py-2.5 text-center"><CompareCell val={row.ent}     /></td>
                                        <td className="px-4 py-2.5 text-center"><CompareCell val={row.inv}     /></td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* vs Competitors */}
                <div className="mb-12">
                    <h2 className="mb-5 text-center text-2xl font-bold text-gray-900">How We Compare</h2>
                    <div className="overflow-x-auto rounded-2xl border border-gray-200 bg-white shadow-sm">
                        <table className="min-w-full text-sm">
                            <thead>
                                <tr className="border-b border-gray-100 bg-gray-50">
                                    <th className="px-5 py-3 text-left font-semibold text-gray-500">Platform</th>
                                    <th className="px-4 py-3 text-center font-semibold text-gray-500">Price/mo</th>
                                    <th className="px-4 py-3 text-center font-semibold text-gray-500">Healthcare Focus</th>
                                    <th className="px-4 py-3 text-center font-semibold text-gray-500">Trust Score</th>
                                    <th className="px-4 py-3 text-center font-semibold text-gray-500">Compliance Filter</th>
                                    <th className="px-4 py-3 text-center font-semibold text-gray-500">AI Matching</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                                {[
                                    { name: "EthAum AI",    price: "$149",  hc: true,  ts: true,  cf: true,  ai: true,  highlight: true },
                                    { name: "G2",           price: "$1,000+",hc: false, ts: false, cf: false, ai: false },
                                    { name: "Product Hunt", price: "$599+", hc: false, ts: false, cf: false, ai: false },
                                    { name: "Gartner",      price: "$3,000+",hc: false, ts: false, cf: false, ai: false },
                                    { name: "AppSumo",      price: "$499+", hc: false, ts: false, cf: false, ai: false },
                                ].map((row) => (
                                    <tr key={row.name} className={row.highlight ? "bg-violet-50/60 font-semibold" : "hover:bg-gray-50/50"}>
                                        <td className="px-5 py-2.5 text-gray-800">
                                            {row.highlight && <Star className="mr-1.5 inline h-3.5 w-3.5 text-violet-500" />}
                                            {row.name}
                                        </td>
                                        <td className="px-4 py-2.5 text-center text-gray-700">{row.price}</td>
                                        <td className="px-4 py-2.5 text-center"><CompareCell val={row.hc} /></td>
                                        <td className="px-4 py-2.5 text-center"><CompareCell val={row.ts} /></td>
                                        <td className="px-4 py-2.5 text-center"><CompareCell val={row.cf} /></td>
                                        <td className="px-4 py-2.5 text-center"><CompareCell val={row.ai} /></td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* FAQ / CTA */}
                <div className="rounded-2xl bg-gradient-to-br from-violet-600 to-indigo-600 p-10 text-center text-white">
                    <h2 className="text-2xl font-extrabold mb-2">Ready to upgrade?</h2>
                    <p className="text-violet-200 text-sm mb-6">All plans include a 14-day money-back guarantee. No lock-in.</p>
                    {!user ? (
                        <Link href="/sign-up">
                            <button className="inline-flex items-center gap-2 rounded-xl bg-white px-6 py-2.5 font-bold text-violet-700 hover:bg-violet-50 transition-colors">
                                Get Started Free <ArrowRight className="h-4 w-4" />
                            </button>
                        </Link>
                    ) : (
                        <button
                            onClick={() => handleUpgrade("growth")}
                            disabled={loadingPlan === "growth" || currentPlan !== "free"}
                            className="inline-flex items-center gap-2 rounded-xl bg-white px-6 py-2.5 font-bold text-violet-700 hover:bg-violet-50 transition-colors disabled:opacity-50"
                        >
                            {currentPlan !== "free"
                                ? `You're on ${PLANS.find(p => p.slug === currentPlan)?.name ?? currentPlan}`
                                : <><Zap className="h-4 w-4" /> Upgrade to Growth — $149/mo</>
                            }
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}
