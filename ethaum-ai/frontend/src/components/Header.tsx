"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
    SignInButton,
    SignUpButton,
    SignedIn,
    SignedOut,
    UserButton,
} from "@clerk/nextjs";
import {
    Sparkles,
    Zap,
    Scale,
    Award,
    TrendingUp,
    Rocket,
    Menu,
    X,
} from "lucide-react";
import { useState } from "react";

const NAV_LINKS = [
    { href: "/marketplace", label: "Marketplace", icon: null },
    { href: "/compare", label: "Compare", icon: Scale, color: "text-blue-500" },
    { href: "/deals", label: "Deals", icon: Zap, color: "text-orange-500", badge: "HOT" },
    { href: "/insights", label: "Insights", icon: Sparkles, color: "text-violet-500" },
    { href: "/analytics", label: "Analytics", icon: TrendingUp, color: "text-emerald-500" },
    { href: "/badges", label: "Badges", icon: Award, color: "text-amber-500" },
    { href: "/wizard", label: "Launch Wizard", icon: Rocket, color: "text-pink-500", badge: "AI" },
];

export function Header() {
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    return (
        <header className="sticky top-0 z-50 border-b bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/60">
            <div className="container mx-auto flex h-16 items-center justify-between px-4">
                <Link href="/" className="flex items-center gap-2">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-violet-600 to-indigo-600">
                        <span className="text-sm font-bold text-white">E</span>
                    </div>
                    <span className="text-xl font-semibold text-gray-900">EthAum AI</span>
                </Link>

                {/* Desktop Navigation */}
                <nav className="hidden items-center gap-1 lg:flex">
                    {NAV_LINKS.map((link) => (
                        <Link
                            key={link.href}
                            href={link.href}
                            className="flex items-center gap-1 rounded-md px-3 py-2 text-sm font-medium text-gray-600 transition-colors hover:bg-gray-50 hover:text-gray-900"
                        >
                            {link.icon && <link.icon className={`h-3.5 w-3.5 ${link.color}`} />}
                            {link.label}
                            {link.badge && (
                                <Badge className="ml-1 bg-orange-100 px-1.5 py-0 text-[10px] text-orange-700 hover:bg-orange-100">
                                    {link.badge}
                                </Badge>
                            )}
                        </Link>
                    ))}
                </nav>

                {/* Desktop Auth Buttons */}
                <div className="hidden items-center gap-3 lg:flex">
                    <SignedOut>
                        <SignInButton mode="modal">
                            <Button variant="outline" size="sm">
                                Sign In
                            </Button>
                        </SignInButton>
                        <SignUpButton mode="modal">
                            <Button size="sm" className="bg-violet-600 hover:bg-violet-700">
                                Get Started
                            </Button>
                        </SignUpButton>
                    </SignedOut>
                    <SignedIn>
                        <UserButton
                            afterSignOutUrl="/"
                            appearance={{
                                elements: {
                                    avatarBox: "w-8 h-8",
                                },
                            }}
                        />
                    </SignedIn>
                </div>

                {/* Mobile Menu Button */}
                <button
                    className="lg:hidden rounded-lg p-2 text-gray-600 hover:bg-gray-100"
                    onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                >
                    {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
                </button>
            </div>

            {/* Mobile Menu */}
            {mobileMenuOpen && (
                <div className="lg:hidden border-t bg-white">
                    <nav className="container mx-auto flex flex-col gap-1 p-4">
                        {NAV_LINKS.map((link) => (
                            <Link
                                key={link.href}
                                href={link.href}
                                onClick={() => setMobileMenuOpen(false)}
                                className="flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50"
                            >
                                {link.icon && <link.icon className={`h-4 w-4 ${link.color}`} />}
                                {link.label}
                                {link.badge && (
                                    <Badge className="bg-orange-100 px-1.5 py-0 text-[10px] text-orange-700">
                                        {link.badge}
                                    </Badge>
                                )}
                            </Link>
                        ))}
                        <div className="mt-4 flex flex-col gap-2 border-t pt-4">
                            <SignedOut>
                                <SignInButton mode="modal">
                                    <Button variant="outline" size="sm" className="w-full">
                                        Sign In
                                    </Button>
                                </SignInButton>
                                <SignUpButton mode="modal">
                                    <Button size="sm" className="w-full bg-violet-600 hover:bg-violet-700">
                                        Get Started
                                    </Button>
                                </SignUpButton>
                            </SignedOut>
                            <SignedIn>
                                <div className="flex justify-center">
                                    <UserButton afterSignOutUrl="/" />
                                </div>
                            </SignedIn>
                        </div>
                    </nav>
                </div>
            )}
        </header>
    );
}
