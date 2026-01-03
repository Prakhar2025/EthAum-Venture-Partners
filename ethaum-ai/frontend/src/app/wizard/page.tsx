"use client";

import { useState } from "react";
import { generateLaunchTemplate, LaunchTemplateResult } from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
    Sparkles,
    Clock,
    Lightbulb,
    Copy,
    Check,
    Image,
    Calendar,
    Rocket,
} from "lucide-react";

export default function LaunchWizardPage() {
    const [form, setForm] = useState({
        startup_name: "",
        category: "AI/ML",
        one_liner: "",
        target_audience: "",
    });
    const [result, setResult] = useState<LaunchTemplateResult | null>(null);
    const [loading, setLoading] = useState(false);
    const [copied, setCopied] = useState<string | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        const data = await generateLaunchTemplate(form);
        setResult(data);
        setLoading(false);
    };

    const copyToClipboard = (text: string, id: string) => {
        navigator.clipboard.writeText(text);
        setCopied(id);
        setTimeout(() => setCopied(null), 2000);
    };

    return (
        <div className="container mx-auto px-4 py-12">
            {/* Header */}
            <div className="mb-8 text-center">
                <Badge className="mb-4 bg-violet-100 text-violet-700 hover:bg-violet-100">
                    <Sparkles className="mr-1 h-3 w-3" />
                    AI-Powered
                </Badge>
                <h1 className="text-4xl font-bold text-gray-900">Launch Wizard</h1>
                <p className="mt-4 text-lg text-gray-600 max-w-2xl mx-auto">
                    Generate AI-powered launch templates, taglines, and scheduling recommendations for your Product Hunt-style launch.
                </p>
            </div>

            <div className="grid gap-8 lg:grid-cols-2">
                {/* Input Form */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Rocket className="h-5 w-5 text-violet-600" />
                            Launch Details
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="mb-2 block text-sm font-medium text-gray-700">
                                    Startup Name
                                </label>
                                <Input
                                    placeholder="e.g., NeuraTech"
                                    value={form.startup_name}
                                    onChange={(e) => setForm({ ...form, startup_name: e.target.value })}
                                    required
                                />
                            </div>

                            <div>
                                <label className="mb-2 block text-sm font-medium text-gray-700">
                                    Category
                                </label>
                                <select
                                    value={form.category}
                                    onChange={(e) => setForm({ ...form, category: e.target.value })}
                                    className="w-full rounded-lg border bg-white px-4 py-2"
                                >
                                    <option value="AI/ML">AI/ML</option>
                                    <option value="DevOps">DevOps</option>
                                    <option value="FinTech">FinTech</option>
                                    <option value="Security">Security</option>
                                    <option value="HealthTech">HealthTech</option>
                                </select>
                            </div>

                            <div>
                                <label className="mb-2 block text-sm font-medium text-gray-700">
                                    One-Liner Description
                                </label>
                                <Textarea
                                    placeholder="Describe your product in one sentence..."
                                    value={form.one_liner}
                                    onChange={(e) => setForm({ ...form, one_liner: e.target.value })}
                                    required
                                />
                            </div>

                            <div>
                                <label className="mb-2 block text-sm font-medium text-gray-700">
                                    Target Audience (Optional)
                                </label>
                                <Input
                                    placeholder="e.g., Enterprise CTOs, Growth Teams"
                                    value={form.target_audience}
                                    onChange={(e) => setForm({ ...form, target_audience: e.target.value })}
                                />
                            </div>

                            <Button
                                type="submit"
                                className="w-full bg-violet-600 hover:bg-violet-700"
                                disabled={loading}
                            >
                                {loading ? (
                                    <>
                                        <Sparkles className="mr-2 h-4 w-4 animate-spin" />
                                        Generating...
                                    </>
                                ) : (
                                    <>
                                        <Sparkles className="mr-2 h-4 w-4" />
                                        Generate Launch Template
                                    </>
                                )}
                            </Button>
                        </form>
                    </CardContent>
                </Card>

                {/* AI Confidence */}
                {result && (
                    <Card className="bg-gradient-to-br from-violet-50 to-indigo-50 border-violet-200">
                        <CardContent className="p-6 text-center">
                            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-white shadow-lg">
                                <span className="text-2xl font-bold text-violet-600">
                                    {Math.round(result.ai_confidence * 100)}%
                                </span>
                            </div>
                            <h3 className="mt-4 font-semibold text-gray-900">AI Confidence</h3>
                            <p className="mt-1 text-sm text-gray-600">
                                Based on successful launch patterns in {result.input.category}
                            </p>
                        </CardContent>
                    </Card>
                )}
            </div>

            {/* Results */}
            {result && (
                <div className="mt-8 space-y-6">
                    {/* Taglines */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Lightbulb className="h-5 w-5 text-amber-500" />
                                Suggested Taglines
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-3">
                                {result.ai_generated.taglines.map((tagline, i) => (
                                    <div
                                        key={i}
                                        className="flex items-center justify-between rounded-lg border p-3"
                                    >
                                        <span className="text-gray-700">{tagline}</span>
                                        <Button
                                            size="sm"
                                            variant="ghost"
                                            onClick={() => copyToClipboard(tagline, `tagline-${i}`)}
                                        >
                                            {copied === `tagline-${i}` ? (
                                                <Check className="h-4 w-4 text-emerald-500" />
                                            ) : (
                                                <Copy className="h-4 w-4" />
                                            )}
                                        </Button>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>

                    {/* Descriptions */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Launch Descriptions</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                {result.ai_generated.descriptions.map((desc, i) => (
                                    <div key={i} className="relative rounded-lg border p-4">
                                        <pre className="whitespace-pre-wrap text-sm text-gray-600">
                                            {desc}
                                        </pre>
                                        <Button
                                            size="sm"
                                            variant="ghost"
                                            className="absolute top-2 right-2"
                                            onClick={() => copyToClipboard(desc, `desc-${i}`)}
                                        >
                                            {copied === `desc-${i}` ? (
                                                <Check className="h-4 w-4 text-emerald-500" />
                                            ) : (
                                                <Copy className="h-4 w-4" />
                                            )}
                                        </Button>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>

                    <div className="grid gap-6 md:grid-cols-2">
                        {/* Timing */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Calendar className="h-5 w-5 text-blue-500" />
                                    Optimal Launch Timing
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="rounded-lg bg-blue-50 p-4 text-center">
                                    <p className="text-2xl font-bold text-blue-600">
                                        {result.ai_generated.timing.day}
                                    </p>
                                    <p className="text-lg text-gray-600">
                                        at {result.ai_generated.timing.time}
                                    </p>
                                    <p className="mt-2 text-sm text-gray-500">
                                        {result.ai_generated.timing.reason}
                                    </p>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Assets */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Image className="h-5 w-5 text-emerald-500" />
                                    Recommended Assets
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <ul className="space-y-2">
                                    {result.ai_generated.recommended_assets.map((asset, i) => (
                                        <li key={i} className="flex items-center gap-2 text-sm text-gray-600">
                                            <Check className="h-4 w-4 text-emerald-500" />
                                            {asset}
                                        </li>
                                    ))}
                                </ul>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Tips */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Lightbulb className="h-5 w-5 text-amber-500" />
                                Launch Tips
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="grid gap-3 md:grid-cols-2">
                                {result.ai_generated.launch_tips.map((tip, i) => (
                                    <div key={i} className="flex items-start gap-2 rounded-lg border p-3">
                                        <span className="flex h-6 w-6 items-center justify-center rounded-full bg-amber-100 text-xs font-bold text-amber-600">
                                            {i + 1}
                                        </span>
                                        <span className="text-sm text-gray-600">{tip}</span>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                </div>
            )}
        </div>
    );
}
