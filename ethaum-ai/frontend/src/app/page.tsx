import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Rocket, Star, BarChart3, Shield, TrendingUp, Users } from "lucide-react";

export default function HomePage() {
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
              <Link href="/launch">
                <Button size="lg" variant="outline">
                  Launch a Startup
                </Button>
              </Link>
            </div>
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
                    Sentiment scoring
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
            <Link href="/launch">
              <Button size="lg" className="bg-violet-600 hover:bg-violet-700">
                Launch Your Startup Today
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
