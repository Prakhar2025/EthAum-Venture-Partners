"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams } from "next/navigation";
import { getProduct, getReviews, getBuyerMatches, Product, Review, MatchmakingResult } from "@/lib/api";
import { TrustScoreBadge } from "@/components/TrustScoreBadge";
import { ReviewForm } from "@/components/ReviewForm";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
    ArrowUp,
    ExternalLink,
    Star,
    Sparkles,
    Users,
    CheckCircle,
    Shield,
    Globe,
    Linkedin,
    FileText,
    PlayCircle,
    Puzzle,
    MapPin,
    HeartPulse,
    TrendingUp,
} from "lucide-react";

// ─── COMPLIANCE COLOUR MAP ─────────────────────────────────────────────────────

const COMPLIANCE_COLOURS: Record<string, { bg: string; text: string; label: string }> = {
    hipaa:     { bg: "bg-blue-100",   text: "text-blue-700",   label: "HIPAA" },
    fda:       { bg: "bg-emerald-100",text: "text-emerald-700",label: "FDA Cleared" },
    ce_mark:   { bg: "bg-indigo-100", text: "text-indigo-700", label: "CE Mark" },
    iso_13485: { bg: "bg-amber-100",  text: "text-amber-700",  label: "ISO 13485" },
    soc2:      { bg: "bg-violet-100", text: "text-violet-700", label: "SOC 2" },
    gdpr:      { bg: "bg-rose-100",   text: "text-rose-700",   label: "GDPR" },
};

function ComplianceBadge({ value }: { value: string }) {
    const cfg = COMPLIANCE_COLOURS[value.toLowerCase()];
    const label = cfg?.label ?? value.toUpperCase();
    const cls   = cfg ? `${cfg.bg} ${cfg.text}` : "bg-gray-100 text-gray-600";
    return (
        <span className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-semibold ${cls}`}>
            <Shield className="h-3 w-3" /> {label}
        </span>
    );
}

// ─── GEO LABEL MAP ────────────────────────────────────────────────────────────

const GEO_LABELS: Record<string, string> = {
    us: "🇺🇸 United States",
    eu: "🇪🇺 Europe",
    india: "🇮🇳 India",
    asean: "🌏 ASEAN",
    global: "🌍 Global",
};

const STAGE_LABELS: Record<string, string> = {
    seed: "Seed", series_a: "Series A", series_b: "Series B",
    series_c: "Series C", series_d: "Series D",
};

// ─── SCORE BAR ────────────────────────────────────────────────────────────────

function ScoreBar({ label, value, color }: { label: string; value: number; color: string }) {
    return (
        <div>
            <div className="mb-1 flex justify-between text-sm">
                <span className="text-gray-600">{label}</span>
                <span className="font-medium text-gray-900">{value}</span>
            </div>
            <div className="h-2 w-full overflow-hidden rounded-full bg-gray-100">
                <div className={`h-full rounded-full ${color}`} style={{ width: `${value}%` }} />
            </div>
        </div>
    );
}

// ─── SIMILAR PRODUCTS ─────────────────────────────────────────────────────────

function SimilarProducts({ productId }: { productId: number }) {
    const [similar, setSimilar] = useState<{ id: number; name: string; category: string; trust_score: number; similarity_score: number }[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
        fetch(`${API_BASE}/api/v1/recommendations/similar/${productId}`)
            .then((r) => r.json())
            .then((data) => setSimilar(data.products || []))
            .catch(() => {})
            .finally(() => setLoading(false));
    }, [productId]);

    if (loading || similar.length === 0) return null;

    return (
        <div className="mt-12">
            <div className="flex items-center gap-2 mb-6">
                <Sparkles className="h-5 w-5 text-violet-600" />
                <h2 className="text-xl font-bold text-gray-900">You Might Also Like</h2>
            </div>
            <div className="grid gap-4 md:grid-cols-3">
                {similar.slice(0, 3).map((p) => (
                    <a key={p.id} href={`/product/${p.id}`}>
                        <Card className="transition-all hover:shadow-lg hover:-translate-y-1">
                            <CardContent className="p-4">
                                <div className="flex items-center gap-3">
                                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-violet-100 to-indigo-100 font-bold text-violet-600">
                                        {p.name.charAt(0)}
                                    </div>
                                    <div className="flex-1">
                                        <h3 className="font-semibold text-gray-900">{p.name}</h3>
                                        <p className="text-sm text-gray-500">{p.category}</p>
                                    </div>
                                    <div className="text-right">
                                        <div className="text-lg font-bold text-violet-600">{p.trust_score}</div>
                                        <div className="text-xs text-gray-400">{p.similarity_score}% match</div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </a>
                ))}
            </div>
        </div>
    );
}

// ─── MAIN PAGE ────────────────────────────────────────────────────────────────

export default function ProductDetailPage() {
    const params    = useParams();
    const productId = Number(params.id);

    const [product, setProduct]         = useState<Product | null>(null);
    const [reviews, setReviews]         = useState<Review[]>([]);
    const [matchmaking, setMatchmaking] = useState<MatchmakingResult | null>(null);
    const [loading, setLoading]         = useState(true);

    useEffect(() => {
        async function fetchData() {
            try {
                const [productData, reviewsData, matchData] = await Promise.all([
                    getProduct(productId),
                    getReviews(productId),
                    getBuyerMatches(productId),
                ]);
                setProduct(productData);
                setReviews(reviewsData);
                setMatchmaking(matchData);
            } catch {
                setProduct({
                    id: productId,
                    name: "NeuraTech",
                    website: "https://neuratech.ai",
                    category: "AI/ML",
                    funding_stage: "Series A",
                    trust_score: 82,
                    score_breakdown: { data_integrity: 100, market_traction: 60, user_sentiment: 80 },
                    launch: { is_launched: true, upvotes: 23, rank: 4 },
                });
            } finally {
                setLoading(false);
            }
        }
        fetchData();
    }, [productId]);

    if (loading) return (
        /* ── Product page skeleton ─────────────────────────────────────────── */
        <div className="container mx-auto px-4 py-12 animate-pulse">
            {/* Header skeleton */}
            <div className="mb-8 flex flex-col gap-6 md:flex-row md:items-start md:justify-between">
                <div className="flex items-start gap-4">
                    <div className="h-16 w-16 flex-shrink-0 rounded-xl bg-gray-200" />
                    <div className="space-y-3 pt-1">
                        <div className="h-7 w-48 rounded-full bg-gray-200" />
                        <div className="flex gap-2">
                            <div className="h-5 w-20 rounded-full bg-gray-100" />
                            <div className="h-5 w-16 rounded-full bg-gray-100" />
                        </div>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    <div className="h-12 w-20 rounded-2xl bg-gray-200" />
                    <div className="h-10 w-32 rounded-xl bg-gray-100" />
                </div>
            </div>

            {/* Body skeleton */}
            <div className="grid gap-8 lg:grid-cols-3">
                <div className="lg:col-span-2 space-y-6">
                    {/* Card 1 */}
                    <div className="rounded-xl border border-gray-100 bg-white p-6 space-y-3">
                        <div className="h-5 w-24 rounded-full bg-gray-200" />
                        <div className="space-y-2">
                            <div className="h-3 w-full rounded-full bg-gray-100" />
                            <div className="h-3 w-5/6 rounded-full bg-gray-100" />
                            <div className="h-3 w-4/6 rounded-full bg-gray-100" />
                        </div>
                    </div>
                    {/* Card 2 */}
                    <div className="rounded-xl border border-gray-100 bg-white p-6 space-y-4">
                        <div className="h-5 w-40 rounded-full bg-gray-200" />
                        {[1, 2, 3].map(i => (
                            <div key={i} className="space-y-1.5">
                                <div className="flex justify-between">
                                    <div className="h-3 w-28 rounded-full bg-gray-100" />
                                    <div className="h-3 w-8 rounded-full bg-gray-100" />
                                </div>
                                <div className="h-2 w-full rounded-full bg-gray-100" />
                            </div>
                        ))}
                    </div>
                </div>
                {/* Sidebar skeleton */}
                <div className="space-y-4">
                    <div className="rounded-xl border border-gray-100 bg-white p-6">
                        <div className="flex flex-col items-center gap-3">
                            <div className="h-20 w-20 rounded-full bg-gray-200" />
                            <div className="h-4 w-28 rounded-full bg-gray-200" />
                            <div className="h-3 w-36 rounded-full bg-gray-100" />
                        </div>
                    </div>
                    <div className="rounded-xl border border-gray-100 bg-white p-6 space-y-2">
                        <div className="h-4 w-24 rounded-full bg-gray-200" />
                        <div className="h-3 w-full rounded-full bg-gray-100" />
                        <div className="h-3 w-3/4 rounded-full bg-gray-100" />
                    </div>
                </div>
            </div>
        </div>
    );
    if (!product)  return <div className="container mx-auto px-4 py-12 text-center text-gray-500">Product not found.</div>;

    const hasHealthcareData =
        (product.healthcare_category) ||
        (product.compliance?.length) ||
        (product.geography?.length) ||
        (product.revenue_stage) ||
        (product.team_size) ||
        (product.total_funding);

    return (
        <div className="container mx-auto px-4 py-12">
            {/* ── HEADER ─────────────────────────────────────────────────── */}
            <div className="mb-8 flex flex-col gap-4">
                <div className="flex items-start gap-4">
                    <div className="flex h-14 w-14 sm:h-16 sm:w-16 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-violet-100 to-indigo-100 text-xl sm:text-2xl font-bold text-violet-600">
                        {product.name.charAt(0)}
                    </div>
                    <div className="flex-1 min-w-0">
                        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 break-words">{product.name}</h1>
                        <div className="mt-2 flex flex-wrap items-center gap-2">
                            <Badge>{product.category}</Badge>
                            <Badge variant="outline">{product.funding_stage}</Badge>
                            {/* V2 badges */}
                            {product.vertical && product.vertical !== "healthcare" && (
                                <span className="rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-medium text-gray-600 capitalize">
                                    {product.vertical}
                                </span>
                            )}
                            {product.healthcare_category && (
                                <span className="inline-flex items-center gap-1 rounded-full bg-violet-100 px-2.5 py-0.5 text-xs font-semibold text-violet-700">
                                    <HeartPulse className="h-3 w-3" /> {product.healthcare_category}
                                </span>
                            )}
                            {product.revenue_stage && (
                                <span className="rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-semibold text-blue-700 capitalize">
                                    {STAGE_LABELS[product.revenue_stage] ?? product.revenue_stage}
                                </span>
                            )}
                        </div>
                        {/* Compliance badges row */}
                        {product.compliance && product.compliance.length > 0 && (
                            <div className="mt-2 flex flex-wrap gap-1.5">
                                {product.compliance.map((c) => <ComplianceBadge key={c} value={c} />)}
                            </div>
                        )}
                    </div>
                </div>

                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
                    <TrustScoreBadge score={product.trust_score} size="lg" />
                    <Button asChild className="w-full sm:w-auto">
                        <a href={product.website} target="_blank" rel="noopener noreferrer">
                            Visit Website <ExternalLink className="ml-2 h-4 w-4" />
                        </a>
                    </Button>
                </div>
            </div>

            <div className="grid gap-8 lg:grid-cols-3">
                {/* ── MAIN CONTENT ──────────────────────────────────────── */}
                <div className="lg:col-span-2 space-y-8">
                    {/* Description */}
                    {product.description && (
                        <Card>
                            <CardHeader><CardTitle>About</CardTitle></CardHeader>
                            <CardContent>
                                <p className="text-gray-600 leading-relaxed">{product.description}</p>
                            </CardContent>
                        </Card>
                    )}

                    {/* ── HEALTHCARE INTELLIGENCE CARD (V2) ────────────── */}
                    {hasHealthcareData && (
                        <Card className="border-2 border-violet-100 bg-gradient-to-br from-violet-50/50 to-white">
                            <CardHeader>
                                <div className="flex items-center gap-2">
                                    <HeartPulse className="h-5 w-5 text-violet-600" />
                                    <CardTitle>Healthcare Intelligence</CardTitle>
                                </div>
                            </CardHeader>
                            <CardContent>
                                <dl className="grid grid-cols-2 gap-x-6 gap-y-4 sm:grid-cols-3">
                                    {product.healthcare_category && (
                                        <div>
                                            <dt className="text-xs font-semibold uppercase tracking-widest text-gray-400">Category</dt>
                                            <dd className="mt-1 text-sm font-medium text-gray-800">{product.healthcare_category}</dd>
                                        </div>
                                    )}
                                    {product.revenue_stage && (
                                        <div>
                                            <dt className="text-xs font-semibold uppercase tracking-widest text-gray-400">Revenue Stage</dt>
                                            <dd className="mt-1 text-sm font-medium text-gray-800">{STAGE_LABELS[product.revenue_stage] ?? product.revenue_stage}</dd>
                                        </div>
                                    )}
                                    {product.team_size && (
                                        <div>
                                            <dt className="text-xs font-semibold uppercase tracking-widest text-gray-400">Team Size</dt>
                                            <dd className="mt-1 text-sm font-medium text-gray-800">{product.team_size} people</dd>
                                        </div>
                                    )}
                                    {product.total_funding && (
                                        <div>
                                            <dt className="text-xs font-semibold uppercase tracking-widest text-gray-400">Total Funding</dt>
                                            <dd className="mt-1 text-sm font-medium text-gray-800">{product.total_funding}</dd>
                                        </div>
                                    )}
                                    {product.geography && product.geography.length > 0 && (
                                        <div className="col-span-2 sm:col-span-3">
                                            <dt className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-1.5">Geography</dt>
                                            <dd className="flex flex-wrap gap-1.5">
                                                {product.geography.map((g) => (
                                                    <span key={g} className="inline-flex items-center gap-1 rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-medium text-gray-600">
                                                        <MapPin className="h-3 w-3" /> {GEO_LABELS[g.toLowerCase()] ?? g}
                                                    </span>
                                                ))}
                                            </dd>
                                        </div>
                                    )}
                                    {product.compliance && product.compliance.length > 0 && (
                                        <div className="col-span-2 sm:col-span-3">
                                            <dt className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-1.5">Compliance</dt>
                                            <dd className="flex flex-wrap gap-1.5">
                                                {product.compliance.map((c) => <ComplianceBadge key={c} value={c} />)}
                                            </dd>
                                        </div>
                                    )}
                                </dl>
                            </CardContent>
                        </Card>
                    )}

                    {/* Integrations */}
                    {product.integrations && product.integrations.length > 0 && (
                        <Card>
                            <CardHeader>
                                <div className="flex items-center gap-2">
                                    <Puzzle className="h-5 w-5 text-violet-600" />
                                    <CardTitle>Integrations</CardTitle>
                                </div>
                            </CardHeader>
                            <CardContent>
                                <div className="flex flex-wrap gap-2">
                                    {product.integrations.map((i) => (
                                        <span key={i} className="rounded-lg border border-gray-200 bg-gray-50 px-3 py-1.5 text-sm font-medium text-gray-700 capitalize">
                                            {i}
                                        </span>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    )}

                    {/* Trust Score Breakdown */}
                    <Card>
                        <CardHeader><CardTitle>Trust Score Breakdown</CardTitle></CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                {product.score_breakdown && (
                                    <>
                                        <ScoreBar label="Data Integrity"  value={product.score_breakdown.data_integrity}  color="bg-emerald-500" />
                                        <ScoreBar label="Market Traction" value={product.score_breakdown.market_traction} color="bg-blue-500" />
                                        <ScoreBar label="User Sentiment"  value={product.score_breakdown.user_sentiment}  color="bg-violet-500" />
                                    </>
                                )}
                            </div>
                        </CardContent>
                    </Card>

                    {/* AI-Recommended Enterprise Buyers */}
                    <Card className="border-2 border-violet-200 bg-gradient-to-br from-violet-50/50 to-white">
                        <CardHeader>
                            <div className="flex items-center gap-2">
                                <Sparkles className="h-5 w-5 text-violet-600" />
                                <CardTitle>AI-Recommended Enterprise Buyers</CardTitle>
                                <Badge className="bg-violet-100 text-violet-700 hover:bg-violet-100">Explainable AI</Badge>
                            </div>
                            <p className="text-sm text-gray-500 mt-1">Powered by heuristic scoring based on category, trust, and traction</p>
                        </CardHeader>
                        <CardContent>
                            {matchmaking && matchmaking.recommended_buyers.length > 0 ? (
                                <div className="space-y-4">
                                    {matchmaking.recommended_buyers.map((buyer, index) => (
                                        <div key={index} className="rounded-lg border bg-white p-4">
                                            <div className="flex items-start justify-between">
                                                <div className="flex items-center gap-3">
                                                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-violet-100">
                                                        <Users className="h-5 w-5 text-violet-600" />
                                                    </div>
                                                    <div>
                                                        <p className="font-semibold text-gray-900">{buyer.buyer_type}</p>
                                                        <p className="text-sm text-gray-500">{buyer.buyer_description}</p>
                                                    </div>
                                                </div>
                                                <div className="text-right">
                                                    <span className="text-2xl font-bold text-violet-600">{buyer.match_score}%</span>
                                                    <p className="text-xs text-gray-500">Match Score</p>
                                                </div>
                                            </div>
                                            <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-gray-100">
                                                <div className="h-full rounded-full bg-gradient-to-r from-violet-500 to-indigo-500" style={{ width: `${buyer.match_score}%` }} />
                                            </div>
                                            <div className="mt-3 flex flex-wrap gap-2">
                                                {buyer.reasons.map((reason, i) => (
                                                    <Badge key={i} variant="secondary" className="text-xs">
                                                        <CheckCircle className="mr-1 h-3 w-3" /> {reason}
                                                    </Badge>
                                                ))}
                                            </div>
                                            <p className="mt-2 text-sm font-medium text-violet-600">{buyer.recommendation}</p>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-gray-500">No buyer matches found.</p>
                            )}
                        </CardContent>
                    </Card>

                    {/* Reviews */}
                    <Card>
                        <CardHeader><CardTitle>Reviews ({reviews.length})</CardTitle></CardHeader>
                        <CardContent>
                            {reviews.length > 0 ? (
                                <div className="space-y-4">
                                    {reviews.map((review) => (
                                        <div key={review.id} className="border-b pb-4 last:border-0">
                                            <div className="flex items-center gap-2">
                                                {[...Array(5)].map((_, i) => (
                                                    <Star key={i} className={`h-4 w-4 ${i < review.rating ? "fill-amber-400 text-amber-400" : "text-gray-200"}`} />
                                                ))}
                                                <span className="text-sm text-gray-500">Sentiment: {review.sentiment_score}</span>
                                            </div>
                                            <p className="mt-2 text-gray-600">{review.comment}</p>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-gray-500">No reviews yet. Be the first to review!</p>
                            )}
                        </CardContent>
                    </Card>

                    <ReviewForm
                        productId={productId}
                        onReviewSubmitted={() => getReviews(productId).then(setReviews)}
                    />
                </div>

                {/* ── SIDEBAR ───────────────────────────────────────────── */}
                <div className="space-y-6">
                    {/* Launch Stats */}
                    {product.launch && (
                        <Card>
                            <CardHeader><CardTitle>Launch Stats</CardTitle></CardHeader>
                            <CardContent>
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <ArrowUp className="h-5 w-5 text-orange-500" />
                                        <span className="text-2xl font-bold">{product.launch.upvotes}</span>
                                        <span className="text-gray-500">upvotes</span>
                                    </div>
                                    <Badge variant="secondary">Rank #{product.launch.rank}</Badge>
                                </div>
                            </CardContent>
                        </Card>
                    )}

                    {/* EthAum Verified badge */}
                    <Card className="bg-gradient-to-br from-violet-50 to-indigo-50">
                        <CardContent className="p-6 text-center">
                            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-white shadow-lg">
                                <span className="text-2xl font-bold text-violet-600">{product.trust_score}</span>
                            </div>
                            <h3 className="mt-4 font-semibold text-gray-900">EthAum Verified</h3>
                            <p className="mt-1 text-sm text-gray-600">Verified by our AI credibility system.</p>
                        </CardContent>
                    </Card>

                    {/* Demo video */}
                    {product.demo_video_url && (
                        <Card>
                            <CardHeader>
                                <div className="flex items-center gap-2">
                                    <PlayCircle className="h-4 w-4 text-violet-600" />
                                    <CardTitle className="text-base">Demo Video</CardTitle>
                                </div>
                            </CardHeader>
                            <CardContent>
                                <a
                                    href={product.demo_video_url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex items-center gap-2 rounded-lg bg-violet-50 px-4 py-3 text-sm font-medium text-violet-700 hover:bg-violet-100 transition-colors"
                                >
                                    <PlayCircle className="h-4 w-4" /> Watch Demo
                                </a>
                            </CardContent>
                        </Card>
                    )}

                    {/* Links */}
                    {(product.linkedin_url || product.pitch_deck_url) && (
                        <Card>
                            <CardHeader><CardTitle className="text-base">Resources</CardTitle></CardHeader>
                            <CardContent className="space-y-2">
                                {product.linkedin_url && (
                                    <a href={product.linkedin_url} target="_blank" rel="noopener noreferrer"
                                        className="flex items-center gap-2 text-sm text-blue-600 hover:underline">
                                        <Linkedin className="h-4 w-4" /> LinkedIn
                                    </a>
                                )}
                                {product.pitch_deck_url && (
                                    <a href={product.pitch_deck_url} target="_blank" rel="noopener noreferrer"
                                        className="flex items-center gap-2 text-sm text-gray-700 hover:text-violet-600 hover:underline">
                                        <FileText className="h-4 w-4" /> Pitch Deck
                                    </a>
                                )}
                            </CardContent>
                        </Card>
                    )}

                    {/* AI Matchmaking quick stats */}
                    {matchmaking && (
                        <Card className="border-violet-200">
                            <CardContent className="p-4">
                                <div className="flex items-center gap-2 mb-2">
                                    <Sparkles className="h-4 w-4 text-violet-600" />
                                    <span className="font-semibold text-gray-900">AI Matchmaking</span>
                                </div>
                                <p className="text-sm text-gray-600">
                                    <span className="font-bold text-violet-600">{matchmaking.total_matches}</span> enterprise buyer matches found
                                </p>
                                <p className="text-xs text-gray-500 mt-1">{matchmaking.ai_matchmaking.algorithm}</p>
                            </CardContent>
                        </Card>
                    )}

                    {/* Geography quick view */}
                    {product.geography && product.geography.length > 0 && (
                        <Card>
                            <CardHeader>
                                <div className="flex items-center gap-2">
                                    <Globe className="h-4 w-4 text-violet-600" />
                                    <CardTitle className="text-base">Markets</CardTitle>
                                </div>
                            </CardHeader>
                            <CardContent>
                                <div className="flex flex-wrap gap-1.5">
                                    {product.geography.map((g) => (
                                        <span key={g} className="rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-medium text-gray-600">
                                            {GEO_LABELS[g.toLowerCase()] ?? g}
                                        </span>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    )}
                </div>
            </div>

            <SimilarProducts productId={productId} />
        </div>
    );
}
