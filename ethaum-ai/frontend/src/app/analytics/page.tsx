"use client";

import { useEffect, useState } from "react";
import { getAnalyticsDashboard, getTrends, AnalyticsDashboard } from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TrustScoreBadge } from "@/components/TrustScoreBadge";
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    PieChart,
    Pie,
    Cell,
} from "recharts";
import { TrendingUp, Users, Rocket, Briefcase, Star, ArrowUp } from "lucide-react";

const COLORS = ["#7c3aed", "#3b82f6", "#10b981", "#f59e0b"];

export default function AnalyticsPage() {
    const [dashboard, setDashboard] = useState<AnalyticsDashboard | null>(null);
    const [trends, setTrends] = useState<Record<string, unknown> | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchData() {
            const [dashboardData, trendsData] = await Promise.all([
                getAnalyticsDashboard(),
                getTrends(),
            ]);
            setDashboard(dashboardData);
            setTrends(trendsData);
            setLoading(false);
        }
        fetchData();
    }, []);

    if (loading) {
        return (
            <div className="container mx-auto px-4 py-12 text-center text-gray-500">
                Loading analytics...
            </div>
        );
    }

    if (!dashboard) {
        return (
            <div className="container mx-auto px-4 py-12 text-center text-gray-500">
                Failed to load analytics.
            </div>
        );
    }

    const fundingData = Object.entries(dashboard.funding_distribution).map(([stage, data]) => ({
        name: stage,
        value: data.count,
        percentage: data.percentage,
    }));

    return (
        <div className="container mx-auto px-4 py-12">
            {/* Header */}
            <div className="mb-8">
                <Badge className="mb-4 bg-violet-100 text-violet-700 hover:bg-violet-100">
                    <TrendingUp className="mr-1 h-3 w-3" />
                    Trend Dashboard
                </Badge>
                <h1 className="text-4xl font-bold text-gray-900">Analytics & Trends</h1>
                <p className="mt-2 text-gray-600">
                    Real-time insights into Series A-D startup ecosystem on EthAum AI
                </p>
            </div>

            {/* Overview Cards */}
            <div className="mb-8 grid gap-4 md:grid-cols-2 lg:grid-cols-5">
                <Card>
                    <CardContent className="p-4">
                        <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-violet-100">
                                <Users className="h-5 w-5 text-violet-600" />
                            </div>
                            <div>
                                <p className="text-2xl font-bold">{dashboard.overview.total_startups}</p>
                                <p className="text-sm text-gray-500">Total Startups</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="p-4">
                        <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-orange-100">
                                <Rocket className="h-5 w-5 text-orange-600" />
                            </div>
                            <div>
                                <p className="text-2xl font-bold">{dashboard.overview.total_launches_this_week}</p>
                                <p className="text-sm text-gray-500">Launches (Week)</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="p-4">
                        <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-100">
                                <ArrowUp className="h-5 w-5 text-emerald-600" />
                            </div>
                            <div>
                                <p className="text-2xl font-bold">{dashboard.overview.total_upvotes_this_week.toLocaleString()}</p>
                                <p className="text-sm text-gray-500">Upvotes (Week)</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="p-4">
                        <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100">
                                <Briefcase className="h-5 w-5 text-blue-600" />
                            </div>
                            <div>
                                <p className="text-2xl font-bold">{dashboard.overview.total_enterprise_pilots}</p>
                                <p className="text-sm text-gray-500">Pilots Active</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="p-4">
                        <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-amber-100">
                                <Star className="h-5 w-5 text-amber-600" />
                            </div>
                            <div>
                                <p className="text-2xl font-bold">{dashboard.overview.average_trust_score}</p>
                                <p className="text-sm text-gray-500">Avg Trust Score</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            <div className="grid gap-8 lg:grid-cols-2">
                {/* Trending Categories */}
                <Card>
                    <CardHeader>
                        <CardTitle>Trending Categories</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="h-64">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={dashboard.trending_categories} layout="vertical">
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis type="number" />
                                    <YAxis dataKey="name" type="category" width={80} />
                                    <Tooltip />
                                    <Bar dataKey="growth" fill="#7c3aed" radius={[0, 4, 4, 0]} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </CardContent>
                </Card>

                {/* Funding Distribution */}
                <Card>
                    <CardHeader>
                        <CardTitle>Funding Distribution</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="h-64">
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={fundingData}
                                        cx="50%"
                                        cy="50%"
                                        outerRadius={80}
                                        fill="#7c3aed"
                                        dataKey="value"
                                        label
                                    >
                                        {fundingData.map((_, index) => (
                                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                        ))}
                                    </Pie>
                                    <Tooltip />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                    </CardContent>
                </Card>

                {/* Top Performers */}
                <Card className="lg:col-span-2">
                    <CardHeader>
                        <CardTitle>Top Performers</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead>
                                    <tr className="border-b text-left text-sm text-gray-500">
                                        <th className="pb-3 font-medium">Startup</th>
                                        <th className="pb-3 font-medium">Trust Score</th>
                                        <th className="pb-3 font-medium">Upvotes</th>
                                        <th className="pb-3 font-medium">Pilots Requested</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {dashboard.top_performers.map((startup, index) => (
                                        <tr key={index} className="border-b last:border-0">
                                            <td className="py-4 font-medium">{startup.name}</td>
                                            <td className="py-4">
                                                <TrustScoreBadge score={startup.trust_score} size="sm" showLabel={false} />
                                            </td>
                                            <td className="py-4">
                                                <span className="flex items-center gap-1">
                                                    <ArrowUp className="h-4 w-4 text-orange-500" />
                                                    {startup.upvotes}
                                                </span>
                                            </td>
                                            <td className="py-4">
                                                <Badge variant="secondary">{startup.pilots_requested}</Badge>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
