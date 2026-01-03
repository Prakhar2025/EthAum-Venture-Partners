"use client";

import { useEffect, useState } from "react";
import { getComparisonStartups, compareStartups, ComparisonData } from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { TrustScoreBadge } from "@/components/TrustScoreBadge";
import { ArrowRight, CheckCircle, Trophy, Scale, Shield, Zap } from "lucide-react";

export default function ComparePage() {
    const [startups, setStartups] = useState<{ id: number; name: string; category: string; trust_score: number }[]>([]);
    const [selected1, setSelected1] = useState<number | null>(null);
    const [selected2, setSelected2] = useState<number | null>(null);
    const [comparison, setComparison] = useState<ComparisonData | null>(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        async function fetchStartups() {
            const data = await getComparisonStartups();
            setStartups(data.startups);
            if (data.startups.length >= 2) {
                setSelected1(data.startups[0].id);
                setSelected2(data.startups[1].id);
            }
        }
        fetchStartups();
    }, []);

    const handleCompare = async () => {
        if (!selected1 || !selected2) return;
        setLoading(true);
        const data = await compareStartups(selected1, selected2);
        setComparison(data);
        setLoading(false);
    };

    useEffect(() => {
        if (selected1 && selected2 && selected1 !== selected2) {
            handleCompare();
        }
    }, [selected1, selected2]);

    return (
        <div className="container mx-auto px-4 py-12">
            {/* Header */}
            <div className="mb-8 text-center">
                <Badge className="mb-4 bg-blue-100 text-blue-700 hover:bg-blue-100">
                    <Scale className="mr-1 h-3 w-3" />
                    G2-Style Comparisons
                </Badge>
                <h1 className="text-4xl font-bold text-gray-900">Compare Startups</h1>
                <p className="mt-4 text-lg text-gray-600 max-w-2xl mx-auto">
                    Enterprise-focused side-by-side comparison with ROI metrics, integration capabilities, and security certifications.
                </p>
            </div>

            {/* Selector */}
            <div className="mb-8 flex flex-col md:flex-row items-center justify-center gap-4">
                <select
                    value={selected1 || ""}
                    onChange={(e) => setSelected1(Number(e.target.value))}
                    className="rounded-lg border bg-white px-4 py-2 text-gray-900 shadow-sm"
                >
                    {startups.map((s) => (
                        <option key={s.id} value={s.id} disabled={s.id === selected2}>
                            {s.name}
                        </option>
                    ))}
                </select>
                <span className="text-gray-400 font-bold">VS</span>
                <select
                    value={selected2 || ""}
                    onChange={(e) => setSelected2(Number(e.target.value))}
                    className="rounded-lg border bg-white px-4 py-2 text-gray-900 shadow-sm"
                >
                    {startups.map((s) => (
                        <option key={s.id} value={s.id} disabled={s.id === selected1}>
                            {s.name}
                        </option>
                    ))}
                </select>
            </div>

            {loading && (
                <div className="text-center text-gray-500">Loading comparison...</div>
            )}

            {comparison && (
                <div className="space-y-8">
                    {/* Comparison Cards */}
                    <div className="grid gap-6 md:grid-cols-2">
                        {/* Startup 1 */}
                        <Card className="border-2 border-violet-200">
                            <CardHeader className="text-center">
                                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-xl bg-gradient-to-br from-violet-100 to-indigo-100 text-2xl font-bold text-violet-600">
                                    {comparison.comparison.startup_1.name.charAt(0)}
                                </div>
                                <CardTitle className="mt-4">{comparison.comparison.startup_1.name}</CardTitle>
                                <Badge>{comparison.comparison.startup_1.category}</Badge>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <span className="text-gray-600">Trust Score</span>
                                    <TrustScoreBadge score={comparison.comparison.startup_1.trust_score} size="sm" />
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-gray-600">ROI</span>
                                    <span className="font-bold text-emerald-600">{comparison.comparison.startup_1.roi_percentage}%</span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-gray-600">Implementation</span>
                                    <span className="font-medium">{comparison.comparison.startup_1.avg_implementation_days} days</span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-gray-600">Integrations</span>
                                    <span className="font-medium">{comparison.comparison.startup_1.integration_count}</span>
                                </div>
                                <div className="pt-4 border-t">
                                    <p className="text-sm text-gray-500">{comparison.comparison.startup_1.ideal_for}</p>
                                </div>
                                <div className="flex flex-wrap gap-1">
                                    {comparison.comparison.startup_1.security_certifications.map((cert) => (
                                        <Badge key={cert} variant="outline" className="text-xs">
                                            <Shield className="mr-1 h-3 w-3" />
                                            {cert}
                                        </Badge>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>

                        {/* Startup 2 */}
                        <Card className="border-2 border-blue-200">
                            <CardHeader className="text-center">
                                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-xl bg-gradient-to-br from-blue-100 to-cyan-100 text-2xl font-bold text-blue-600">
                                    {comparison.comparison.startup_2.name.charAt(0)}
                                </div>
                                <CardTitle className="mt-4">{comparison.comparison.startup_2.name}</CardTitle>
                                <Badge>{comparison.comparison.startup_2.category}</Badge>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <span className="text-gray-600">Trust Score</span>
                                    <TrustScoreBadge score={comparison.comparison.startup_2.trust_score} size="sm" />
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-gray-600">ROI</span>
                                    <span className="font-bold text-emerald-600">{comparison.comparison.startup_2.roi_percentage}%</span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-gray-600">Implementation</span>
                                    <span className="font-medium">{comparison.comparison.startup_2.avg_implementation_days} days</span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-gray-600">Integrations</span>
                                    <span className="font-medium">{comparison.comparison.startup_2.integration_count}</span>
                                </div>
                                <div className="pt-4 border-t">
                                    <p className="text-sm text-gray-500">{comparison.comparison.startup_2.ideal_for}</p>
                                </div>
                                <div className="flex flex-wrap gap-1">
                                    {comparison.comparison.startup_2.security_certifications.map((cert) => (
                                        <Badge key={cert} variant="outline" className="text-xs">
                                            <Shield className="mr-1 h-3 w-3" />
                                            {cert}
                                        </Badge>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Winner Metrics */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Trophy className="h-5 w-5 text-amber-500" />
                                Metric Winners
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                                {Object.entries(comparison.metrics_comparison).map(([metric, data]) => (
                                    <div key={metric} className="rounded-lg border p-4 text-center">
                                        <p className="text-sm text-gray-500 capitalize">{metric.replace(/_/g, " ")}</p>
                                        <p className="mt-1 font-bold text-violet-600">{data.winner}</p>
                                        <CheckCircle className="mx-auto mt-2 h-5 w-5 text-emerald-500" />
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>

                    {/* AI Recommendation */}
                    <Card className="bg-gradient-to-r from-violet-50 to-indigo-50 border-violet-200">
                        <CardContent className="p-6">
                            <div className="flex items-start gap-4">
                                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-violet-100">
                                    <Zap className="h-6 w-6 text-violet-600" />
                                </div>
                                <div>
                                    <h3 className="font-semibold text-gray-900">AI Recommendation</h3>
                                    <p className="mt-1 text-gray-600">{comparison.recommendation}</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            )}
        </div>
    );
}
