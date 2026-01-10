"use client";

import { useEffect, useState } from "react";
import { useUser } from "@clerk/nextjs";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { UpvoteButton } from "@/components/UpvoteButton";
import { Trophy, Flame, Rocket, TrendingUp } from "lucide-react";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

interface Launch {
    id: number;
    product_id: number;
    name: string;
    category: string;
    upvotes: number;
    rank: number;
    is_featured: boolean;
    user_upvoted?: boolean;
}

export default function LeaderboardPage() {
    const { user } = useUser();
    const [launches, setLaunches] = useState<Launch[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        fetchLeaderboard();
    }, [user]);

    const fetchLeaderboard = async () => {
        try {
            const headers: Record<string, string> = {};
            if (user) {
                headers["X-Clerk-User-Id"] = user.id;
            }

            const response = await fetch(`${API_BASE}/api/v1/launches/leaderboard`, {
                headers,
            });
            const data = await response.json();
            setLaunches(data);
        } catch (error) {
            console.error("Failed to fetch leaderboard:", error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleUpvoteChange = (launchId: number, newCount: number, userUpvoted: boolean) => {
        setLaunches(prev => prev.map(launch =>
            launch.id === launchId
                ? { ...launch, upvotes: newCount, user_upvoted: userUpvoted }
                : launch
        ).sort((a, b) => b.upvotes - a.upvotes));
    };

    if (isLoading) {
        return (
            <div className="container mx-auto px-4 py-12 text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-violet-600 mx-auto"></div>
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 py-12">
            <div className="mb-8 text-center">
                <div className="flex items-center justify-center gap-2 mb-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-orange-100">
                        <Trophy className="h-6 w-6 text-orange-600" />
                    </div>
                </div>
                <h1 className="text-3xl font-bold text-gray-900">Launch Leaderboard</h1>
                <p className="mt-2 text-gray-600">
                    Vote for your favorite startups. Sign in to upvote!
                </p>
            </div>

            {launches.length === 0 ? (
                <Card className="text-center py-12">
                    <CardContent>
                        <Rocket className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                        <p className="text-gray-500">No launches yet. Be the first to launch!</p>
                        <Link href="/submit" className="text-violet-600 hover:underline mt-2 inline-block">
                            Submit your startup →
                        </Link>
                    </CardContent>
                </Card>
            ) : (
                <div className="space-y-4 max-w-3xl mx-auto">
                    {launches.map((launch, index) => (
                        <Card
                            key={launch.id}
                            className={`transition-shadow hover:shadow-lg ${index === 0 ? "border-2 border-yellow-400 bg-yellow-50/30" :
                                    index === 1 ? "border-2 border-gray-300 bg-gray-50/30" :
                                        index === 2 ? "border-2 border-orange-300 bg-orange-50/30" : ""
                                }`}
                        >
                            <CardContent className="p-4">
                                <div className="flex items-center gap-4">
                                    {/* Rank */}
                                    <div className={`flex h-10 w-10 items-center justify-center rounded-full font-bold text-lg ${index === 0 ? "bg-yellow-400 text-white" :
                                            index === 1 ? "bg-gray-400 text-white" :
                                                index === 2 ? "bg-orange-400 text-white" :
                                                    "bg-gray-100 text-gray-600"
                                        }`}>
                                        {index + 1}
                                    </div>

                                    {/* Info */}
                                    <div className="flex-1">
                                        <Link
                                            href={`/product/${launch.product_id}`}
                                            className="font-semibold text-gray-900 hover:text-violet-600"
                                        >
                                            {launch.name}
                                        </Link>
                                        <div className="flex items-center gap-2 mt-1">
                                            <Badge variant="outline" className="text-xs">
                                                {launch.category}
                                            </Badge>
                                            {launch.is_featured && (
                                                <Badge className="bg-orange-100 text-orange-700 text-xs">
                                                    <Flame className="h-3 w-3 mr-1" />
                                                    Featured
                                                </Badge>
                                            )}
                                        </div>
                                    </div>

                                    {/* Upvote Button */}
                                    <UpvoteButton
                                        launchId={launch.id}
                                        initialUpvotes={launch.upvotes}
                                        initialUserUpvoted={launch.user_upvoted}
                                        onUpvoteChange={(count, voted) => handleUpvoteChange(launch.id, count, voted)}
                                    />
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}

            {/* Today's Stats */}
            {launches.length > 0 && (
                <div className="mt-12 grid grid-cols-3 gap-4 max-w-md mx-auto">
                    <Card className="text-center p-4">
                        <TrendingUp className="h-5 w-5 text-violet-600 mx-auto mb-1" />
                        <div className="text-2xl font-bold text-gray-900">{launches.length}</div>
                        <div className="text-xs text-gray-500">Launches</div>
                    </Card>
                    <Card className="text-center p-4">
                        <Trophy className="h-5 w-5 text-yellow-600 mx-auto mb-1" />
                        <div className="text-2xl font-bold text-gray-900">
                            {launches.reduce((sum, l) => sum + l.upvotes, 0)}
                        </div>
                        <div className="text-xs text-gray-500">Total Votes</div>
                    </Card>
                    <Card className="text-center p-4">
                        <Flame className="h-5 w-5 text-orange-600 mx-auto mb-1" />
                        <div className="text-2xl font-bold text-gray-900">
                            {launches[0]?.upvotes || 0}
                        </div>
                        <div className="text-xs text-gray-500">Top Votes</div>
                    </Card>
                </div>
            )}
        </div>
    );
}
