"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Sparkles, Zap } from "lucide-react";

export function Header() {
    return (
        <header className="border-b bg-white">
            <div className="container mx-auto flex h-16 items-center justify-between px-4">
                <Link href="/" className="flex items-center gap-2">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-violet-600 to-indigo-600">
                        <span className="text-sm font-bold text-white">E</span>
                    </div>
                    <span className="text-xl font-semibold text-gray-900">EthAum AI</span>
                </Link>

                <nav className="hidden items-center gap-1 md:flex">
                    <Link
                        href="/marketplace"
                        className="px-3 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 rounded-md hover:bg-gray-50"
                    >
                        Marketplace
                    </Link>
                    <Link
                        href="/deals"
                        className="px-3 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 rounded-md hover:bg-gray-50 flex items-center gap-1"
                    >
                        <Zap className="h-3 w-3 text-orange-500" />
                        Deals
                        <Badge className="ml-1 bg-orange-100 text-orange-700 hover:bg-orange-100 text-xs px-1.5 py-0">
                            NEW
                        </Badge>
                    </Link>
                    <Link
                        href="/insights"
                        className="px-3 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 rounded-md hover:bg-gray-50 flex items-center gap-1"
                    >
                        <Sparkles className="h-3 w-3 text-violet-500" />
                        AI Insights
                    </Link>
                    <Link
                        href="/launch"
                        className="px-3 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 rounded-md hover:bg-gray-50"
                    >
                        Launch
                    </Link>
                </nav>

                <div className="flex items-center gap-3">
                    <Button variant="outline" size="sm">
                        Sign In
                    </Button>
                    <Button size="sm" className="bg-violet-600 hover:bg-violet-700">
                        Get Started
                    </Button>
                </div>
            </div>
        </header>
    );
}
