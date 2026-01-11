"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TrustScoreBadge } from "@/components/TrustScoreBadge";
import { Rocket, Star, BarChart3, Shield, TrendingUp, Users, ArrowUp, Flame, Sparkles } from "lucide-react";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

interface TrendingProduct {
  id: number;
  name: string;
  category: string;
  trust_score: number;
  upvotes: number;
}

export default function HomePage() {
  const [trending, setTrending] = useState<TrendingProduct[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchTrending() {
      try {
        const res = await fetch(`${API_BASE}/api/v1/recommendations/trending`);
        const data = await res.json();
        setTrending(data.products || []);
      } catch (error) {
        console.error("Failed to fetch trending:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchTrending();
  }, []);

  return (
    <div>
      {/* Hero Section */}
      <section className="border-b bg-gradient-to-b from-violet-50 to-white">
        <div className="container mx-auto px-4 py-24 text-center">
          <div className="mx-auto max-w-3xl">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border bg-white px-4 py-2 text-sm font-medium text-gray-600 shadow-sm">
              <span className="flex h-2 w-2 rounded-full bg-emerald-500"></span>
              Trusted by 500+ growth-stage startups
            </div>

            <h1 className="text-5xl font-bold tracking-tight text-gray-900 sm:text-6xl">
              AI-Powered Credibility for{" "}
              <span className="bg-gradient-to-r from-violet-600 to-indigo-600 bg-clip-text text-transparent">
                Growth-Stage Startups
              </span>
            </h1>

            <p className="mt-6 text-lg leading-8 text-gray-600">
              Combine the best of Product Hunt, G2, and Gartner. Launch your
              startup, collect reviews, and build trust with AI-verified
              credibility scores.
            </p>

            <div className="mt-10 flex items-center justify-center gap-4">
              <Link href="/marketplace">
                <Button size="lg" className="bg-violet-600 hover:bg-violet-700">
                  Explore Marketplace
                </Button>
              </Link>
              <Link href="/submit">
                <Button size="lg" variant="outline">
                  Submit Startup
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Trending Section */}
      <section className="py-16 bg-gradient-to-r from-orange-50 via-white to-orange-50">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-center gap-3 mb-8">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-orange-100">
              <Flame className="h-5 w-5 text-orange-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900">Trending Now</h2>
            <Badge className="bg-orange-100 text-orange-700">🔥 Hot</Badge>
          </div>

          {loading ? (
            <div className="text-center text-gray-500">Loading trending products...</div>
          ) : trending.length > 0 ? (
            <div className="grid gap-4 md:grid-cols-3 max-w-4xl mx-auto">
              {trending.slice(0, 3).map((product, index) => (
                <Link key={product.id} href={`/product/${product.id}`}>
                  <Card className={`transition-all hover:shadow-lg hover:-translate-y-1 ${index === 0 ? "border-2 border-orange-300 bg-orange-50/30" : ""
                    }`}>
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-3">
                          <div className={`flex h-10 w-10 items-center justify-center rounded-lg font-bold text-white ${index === 0 ? "bg-gradient-to-br from-orange-500 to-red-500" :
                              index === 1 ? "bg-gradient-to-br from-violet-500 to-indigo-500" :
                                "bg-gradient-to-br from-blue-500 to-cyan-500"
                            }`}>
                            {product.name.charAt(0)}
                          </div>
                          <div>
                            <h3 className="font-semibold text-gray-900">{product.name}</h3>
                            <p className="text-sm text-gray-500">{product.category}</p>
                          </div>
                        </div>
                        <TrustScoreBadge score={product.trust_score} size="sm" />
                      </div>
                      <div className="mt-3 flex items-center justify-between">
                        <div className="flex items-center gap-1 text-orange-600">
                          <ArrowUp className="h-4 w-4" />
                          <span className="font-semibold">{product.upvotes}</span>
                          <span className="text-sm text-gray-500">upvotes</span>
                        </div>
                        {index === 0 && (
                          <Badge className="bg-yellow-100 text-yellow-700">
                            <Sparkles className="h-3 w-3 mr-1" />
                            #1 Today
                          </Badge>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          ) : (
            <div className="text-center text-gray-500">
              <p>No trending products yet.</p>
              <Link href="/submit" className="text-violet-600 hover:underline">
                Be the first to submit!
              </Link>
            </div>
          )}

          <div className="text-center mt-6">
            <Link href="/leaderboard">
              <Button variant="outline">
                View Full Leaderboard →
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24">
        <div className="container mx-auto px-4">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-gray-900">
              Everything you need to validate startups
            </h2>
            <p className="mt-4 text-lg text-gray-600">
              Three powerful systems, one unified platform.
            </p>
          </div>

          <div className="mt-16 grid gap-8 md:grid-cols-3">
            {/* Launch & Buzz */}
            <Card className="border-2 transition-colors hover:border-violet-200">
              <CardContent className="p-8">
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-orange-100">
                  <Rocket className="h-6 w-6 text-orange-600" />
                </div>
                <h3 className="mt-6 text-xl font-semibold text-gray-900">
                  Launch & Buzz
                </h3>
                <p className="mt-2 text-gray-600">
                  Product Hunt-style launches. Upvote promising startups and
                  track daily leaderboards.
                </p>
                <ul className="mt-6 space-y-3 text-sm text-gray-600">
                  <li className="flex items-center gap-2">
                    <TrendingUp className="h-4 w-4 text-orange-500" />
                    Daily launch rankings
                  </li>
                  <li className="flex items-center gap-2">
                    <Users className="h-4 w-4 text-orange-500" />
                    Community upvoting
                  </li>
                </ul>
              </CardContent>
            </Card>

            {/* Reviews & Trust */}
            <Card className="border-2 transition-colors hover:border-violet-200">
              <CardContent className="p-8">
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-emerald-100">
                  <Star className="h-6 w-6 text-emerald-600" />
                </div>
                <h3 className="mt-6 text-xl font-semibold text-gray-900">
                  Reviews & Trust
                </h3>
                <p className="mt-2 text-gray-600">
                  G2-style reviews with AI sentiment analysis. Build authentic
                  social proof.
                </p>
                <ul className="mt-6 space-y-3 text-sm text-gray-600">
                  <li className="flex items-center gap-2">
                    <Shield className="h-4 w-4 text-emerald-500" />
                    Verified reviews
                  </li>
                  <li className="flex items-center gap-2">
                    <BarChart3 className="h-4 w-4 text-emerald-500" />
                    AI sentiment scoring
                  </li>
                </ul>
              </CardContent>
            </Card>

            {/* Insights & Validation */}
            <Card className="border-2 transition-colors hover:border-violet-200">
              <CardContent className="p-8">
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-violet-100">
                  <BarChart3 className="h-6 w-6 text-violet-600" />
                </div>
                <h3 className="mt-6 text-xl font-semibold text-gray-900">
                  Insights & Validation
                </h3>
                <p className="mt-2 text-gray-600">
                  Gartner-style quadrants and AI credibility badges for
                  enterprise buyers.
                </p>
                <ul className="mt-6 space-y-3 text-sm text-gray-600">
                  <li className="flex items-center gap-2">
                    <TrendingUp className="h-4 w-4 text-violet-500" />
                    Emerging quadrants
                  </li>
                  <li className="flex items-center gap-2">
                    <Shield className="h-4 w-4 text-violet-500" />
                    Trust score badges
                  </li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="border-t bg-gray-50 py-24">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold text-gray-900">
            Ready to showcase your startup?
          </h2>
          <p className="mt-4 text-lg text-gray-600">
            Join 500+ startups building credibility with EthAum AI.
          </p>
          <div className="mt-8">
            <Link href="/submit">
              <Button size="lg" className="bg-violet-600 hover:bg-violet-700">
                Submit Your Startup Today
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
