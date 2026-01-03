"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";

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

                <nav className="hidden items-center gap-6 md:flex">
                    <Link
                        href="/marketplace"
                        className="text-sm font-medium text-gray-600 hover:text-gray-900"
                    >
                        Marketplace
                    </Link>
                    <Link
                        href="/insights"
                        className="text-sm font-medium text-gray-600 hover:text-gray-900"
                    >
                        Insights
                    </Link>
                    <Link
                        href="/launch"
                        className="text-sm font-medium text-gray-600 hover:text-gray-900"
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
