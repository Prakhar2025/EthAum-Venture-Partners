"use client";

import { useEffect, useState } from "react";
import { getDeals, requestPilot, Deal } from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { TrustScoreBadge } from "@/components/TrustScoreBadge";
import { Briefcase, Clock, CheckCircle, X, Shield, Zap } from "lucide-react";

export default function DealsPage() {
    const [deals, setDeals] = useState<Deal[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedDeal, setSelectedDeal] = useState<Deal | null>(null);
    const [showModal, setShowModal] = useState(false);
    const [showSuccess, setShowSuccess] = useState(false);
    const [form, setForm] = useState({ company_name: "", contact_email: "" });
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        async function fetchDeals() {
            try {
                const data = await getDeals();
                setDeals(data);
            } catch (error) {
                console.error("Failed to fetch deals:", error);
            } finally {
                setLoading(false);
            }
        }
        fetchDeals();
    }, []);

    const handleRequestPilot = (deal: Deal) => {
        setSelectedDeal(deal);
        setShowModal(true);
        setForm({ company_name: "", contact_email: "" });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedDeal) return;

        setSubmitting(true);
        try {
            await requestPilot({
                deal_id: selectedDeal.id,
                company_name: form.company_name,
                contact_email: form.contact_email,
            });
            setShowModal(false);
            setShowSuccess(true);
            setTimeout(() => setShowSuccess(false), 5000);
        } catch (error) {
            console.error("Failed to submit:", error);
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="container mx-auto px-4 py-12">
            {/* Header */}
            <div className="mb-8 text-center">
                <Badge className="mb-4 bg-orange-100 text-orange-700 hover:bg-orange-100">
                    <Zap className="mr-1 h-3 w-3" />
                    AppSumo-Style Pilots
                </Badge>
                <h1 className="text-4xl font-bold text-gray-900">
                    Enterprise Pilot Deals
                </h1>
                <p className="mt-4 text-lg text-gray-600 max-w-2xl mx-auto">
                    Low-cost pilots backed by{" "}
                    <span className="font-semibold text-violet-600">
                        AI credibility scores
                    </span>
                    . Skip the lengthy sales cycles—start with verified, trust-scored
                    startups.
                </p>
            </div>

            {/* Value Props */}
            <div className="mb-12 grid gap-4 md:grid-cols-3">
                <div className="flex items-center gap-3 rounded-lg border bg-white p-4">
                    <Shield className="h-8 w-8 text-emerald-500" />
                    <div>
                        <p className="font-semibold text-gray-900">Credibility-Backed</p>
                        <p className="text-sm text-gray-500">AI-verified trust scores</p>
                    </div>
                </div>
                <div className="flex items-center gap-3 rounded-lg border bg-white p-4">
                    <Clock className="h-8 w-8 text-blue-500" />
                    <div>
                        <p className="font-semibold text-gray-900">Low-Risk Pilots</p>
                        <p className="text-sm text-gray-500">30-60 day trial periods</p>
                    </div>
                </div>
                <div className="flex items-center gap-3 rounded-lg border bg-white p-4">
                    <Briefcase className="h-8 w-8 text-violet-500" />
                    <div>
                        <p className="font-semibold text-gray-900">Enterprise-Ready</p>
                        <p className="text-sm text-gray-500">Targeted for your industry</p>
                    </div>
                </div>
            </div>

            {/* Success Message */}
            {showSuccess && (
                <div className="mb-8 rounded-lg border border-emerald-200 bg-emerald-50 p-4 text-center">
                    <CheckCircle className="mx-auto h-8 w-8 text-emerald-500" />
                    <p className="mt-2 font-semibold text-emerald-700">
                        Pilot Request Submitted! (Demo Mode)
                    </p>
                    <p className="text-sm text-emerald-600">
                        The startup will contact you within 24 hours.
                    </p>
                </div>
            )}

            {/* Deals Grid */}
            {loading ? (
                <div className="text-center text-gray-500">Loading deals...</div>
            ) : (
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {deals.map((deal) => (
                        <Card
                            key={deal.id}
                            className="group relative overflow-hidden transition-all hover:shadow-lg"
                        >
                            {deal.status === "limited" && (
                                <div className="absolute right-0 top-0 rounded-bl-lg bg-orange-500 px-3 py-1 text-xs font-bold text-white">
                                    LIMITED
                                </div>
                            )}
                            <CardHeader className="pb-2">
                                <div className="flex items-start justify-between">
                                    <div>
                                        <p className="text-sm font-medium text-violet-600">
                                            {deal.startup_name}
                                        </p>
                                        <CardTitle className="mt-1 text-lg">
                                            {deal.pilot_title}
                                        </CardTitle>
                                    </div>
                                    <TrustScoreBadge
                                        score={deal.credibility_score}
                                        size="sm"
                                        showLabel={false}
                                    />
                                </div>
                            </CardHeader>
                            <CardContent>
                                <p className="mb-4 text-sm text-gray-600 line-clamp-2">
                                    {deal.description}
                                </p>

                                <div className="mb-4 flex flex-wrap gap-2">
                                    <Badge variant="secondary">
                                        <Briefcase className="mr-1 h-3 w-3" />
                                        {deal.ideal_buyer}
                                    </Badge>
                                    <Badge variant="outline">
                                        <Clock className="mr-1 h-3 w-3" />
                                        {deal.pilot_duration}
                                    </Badge>
                                </div>

                                <Button
                                    onClick={() => handleRequestPilot(deal)}
                                    className="w-full bg-violet-600 hover:bg-violet-700"
                                >
                                    Request Pilot
                                </Button>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}

            {/* Modal */}
            {showModal && selectedDeal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
                    <Card className="w-full max-w-md">
                        <CardHeader className="relative">
                            <button
                                onClick={() => setShowModal(false)}
                                className="absolute right-4 top-4 text-gray-400 hover:text-gray-600"
                            >
                                <X className="h-5 w-5" />
                            </button>
                            <CardTitle>Request Pilot</CardTitle>
                            <p className="text-sm text-gray-500">
                                {selectedDeal.startup_name} - {selectedDeal.pilot_title}
                            </p>
                        </CardHeader>
                        <CardContent>
                            <form onSubmit={handleSubmit} className="space-y-4">
                                <div>
                                    <label className="mb-2 block text-sm font-medium text-gray-700">
                                        Company Name
                                    </label>
                                    <Input
                                        placeholder="Your company name"
                                        value={form.company_name}
                                        onChange={(e) =>
                                            setForm({ ...form, company_name: e.target.value })
                                        }
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="mb-2 block text-sm font-medium text-gray-700">
                                        Contact Email
                                    </label>
                                    <Input
                                        type="email"
                                        placeholder="you@company.com"
                                        value={form.contact_email}
                                        onChange={(e) =>
                                            setForm({ ...form, contact_email: e.target.value })
                                        }
                                        required
                                    />
                                </div>
                                <Button
                                    type="submit"
                                    className="w-full bg-violet-600 hover:bg-violet-700"
                                    disabled={submitting}
                                >
                                    {submitting ? "Submitting..." : "Submit Request"}
                                </Button>
                            </form>
                        </CardContent>
                    </Card>
                </div>
            )}
        </div>
    );
}
