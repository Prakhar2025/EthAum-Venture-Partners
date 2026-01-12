"use client";

import Link from "next/link";
import { useEffect, useState, useRef } from "react";
import { useUser } from "@clerk/nextjs";
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
    TrendingUp,
    Rocket,
    Menu,
    X,
    Plus,
    Package,
    Shield,
    Zap,
    Scale,
    Award,
    BarChart3,
    ChevronDown,
} from "lucide-react";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

// Primary navigation links
const PRIMARY_LINKS = [
    { href: "/marketplace", label: "Marketplace" },
    { href: "/leaderboard", label: "Leaderboard", badge: "🔥" },
    { href: "/compare", label: "Compare" },
];

// Tools dropdown items
const TOOLS_LINKS = [
    { href: "/deals", label: "Deals", icon: Zap, description: "Enterprise deals" },
    { href: "/insights", label: "Insights", icon: Sparkles, description: "Quadrant view" },
    { href: "/analytics", label: "Analytics", icon: BarChart3, description: "Trends & stats" },
    { href: "/badges", label: "Badges", icon: Award, description: "Embed widgets" },
    { href: "/wizard", label: "Launch Wizard", icon: Rocket, description: "AI templates" },
];

export function Header() {
    const { user } = useUser();
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [toolsOpen, setToolsOpen] = useState(false);
    const [isAdmin, setIsAdmin] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    // Check if user is admin
    useEffect(() => {
        async function checkAdmin() {
            if (!user) {
                setIsAdmin(false);
                return;
            }
            try {
                const res = await fetch(`${API_BASE}/api/v1/admin/stats`, {
                    headers: { "X-Clerk-User-Id": user.id },
                });
                setIsAdmin(res.ok);
            } catch {
                setIsAdmin(false);
            }
        }
        checkAdmin();
    }, [user]);

    // Close dropdown when clicking outside
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setToolsOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    return (
        <header className="sticky top-0 z-50 border-b bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/60">
            <div className="container mx-auto flex h-16 items-center justify-between px-4">
                {/* Logo */}
                <Link href="/" className="flex items-center gap-2">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-violet-600 to-indigo-600">
                        <span className="text-sm font-bold text-white">E</span>
                    </div>
                    <span className="text-xl font-semibold text-gray-900">EthAum AI</span>
                </Link>

                {/* Desktop Navigation */}
                <nav className="hidden items-center gap-1 lg:flex">
                    {PRIMARY_LINKS.map((link) => (
                        <Link
                            key={link.href}
                            href={link.href}
                            className="rounded-md px-3 py-2 text-sm font-medium text-gray-600 transition-colors hover:bg-gray-50 hover:text-gray-900"
                        >
                            {link.label}
                            {link.badge && (
                                <Badge className="ml-1 bg-orange-100 px-1.5 py-0 text-[10px] text-orange-700">
                                    {link.badge}
                                </Badge>
                            )}
                        </Link>
                    ))}

                    {/* Tools Dropdown - Fixed with proper click handling */}
                    <div className="relative" ref={dropdownRef}>
                        <button
                            onClick={() => setToolsOpen(!toolsOpen)}
                            className="flex items-center gap-1 rounded-md px-3 py-2 text-sm font-medium text-gray-600 transition-colors hover:bg-gray-50 hover:text-gray-900"
                        >
                            Tools
                            <ChevronDown className={`h-4 w-4 transition-transform ${toolsOpen ? "rotate-180" : ""}`} />
                        </button>

                        {toolsOpen && (
                            <div className="absolute left-0 top-full mt-1 w-56 rounded-lg border bg-white p-2 shadow-lg z-50">
                                {TOOLS_LINKS.map((link) => (
                                    <Link
                                        key={link.href}
                                        href={link.href}
                                        className="flex items-start gap-3 rounded-md p-2 hover:bg-gray-50 transition-colors"
                                        onClick={() => setToolsOpen(false)}
                                    >
                                        <link.icon className="h-5 w-5 text-violet-600 mt-0.5 flex-shrink-0" />
                                        <div>
                                            <div className="font-medium text-gray-900">{link.label}</div>
                                            <div className="text-xs text-gray-500">{link.description}</div>
                                        </div>
                                    </Link>
                                ))}
                            </div>
                        )}
                    </div>
                </nav>

                {/* Desktop Auth Section */}
                <div className="hidden items-center gap-2 lg:flex">
                    <SignedOut>
                        <SignInButton mode="modal">
                            <Button variant="outline" size="sm">Sign In</Button>
                        </SignInButton>
                        <SignUpButton mode="modal">
                            <Button size="sm" className="bg-violet-600 hover:bg-violet-700">
                                Get Started
                            </Button>
                        </SignUpButton>
                    </SignedOut>

                    <SignedIn>
                        <Link
                            href="/submit"
                            className="flex items-center gap-1.5 rounded-md px-3 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors"
                        >
                            <Plus className="h-4 w-4 text-green-500" />
                            Submit
                        </Link>
                        <Link
                            href="/my-products"
                            className="flex items-center gap-1.5 rounded-md px-3 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors"
                        >
                            <Package className="h-4 w-4 text-violet-500" />
                            My Products
                        </Link>

                        {/* Admin - Only visible to admins */}
                        {isAdmin && (
                            <Link
                                href="/admin"
                                className="flex items-center gap-1.5 rounded-md bg-violet-100 px-3 py-2 text-sm font-medium text-violet-700 hover:bg-violet-200 transition-colors"
                            >
                                <Shield className="h-4 w-4" />
                                Admin
                            </Link>
                        )}

                        <UserButton
                            afterSignOutUrl="/"
                            appearance={{ elements: { avatarBox: "h-8 w-8" } }}
                        />
                    </SignedIn>
                </div>

                {/* Mobile Menu Button */}
                <button className="lg:hidden p-2" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
                    {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
                </button>
            </div>

            {/* Mobile Menu */}
            {mobileMenuOpen && (
                <div className="border-t bg-white lg:hidden">
                    <nav className="container mx-auto px-4 py-4 space-y-1">
                        {PRIMARY_LINKS.map((link) => (
                            <Link
                                key={link.href}
                                href={link.href}
                                className="block rounded-md px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
                                onClick={() => setMobileMenuOpen(false)}
                            >
                                {link.label}
                            </Link>
                        ))}

                        <div className="border-t pt-2 mt-2">
                            <p className="px-3 py-1 text-xs font-semibold text-gray-400 uppercase">Tools</p>
                            {TOOLS_LINKS.map((link) => (
                                <Link
                                    key={link.href}
                                    href={link.href}
                                    className="flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
                                    onClick={() => setMobileMenuOpen(false)}
                                >
                                    <link.icon className="h-4 w-4 text-violet-600" />
                                    {link.label}
                                </Link>
                            ))}
                        </div>

                        <SignedIn>
                            <div className="border-t pt-2 mt-2">
                                <Link href="/submit" className="block rounded-md px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50" onClick={() => setMobileMenuOpen(false)}>
                                    Submit Startup
                                </Link>
                                <Link href="/my-products" className="block rounded-md px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50" onClick={() => setMobileMenuOpen(false)}>
                                    My Products
                                </Link>
                                {isAdmin && (
                                    <Link href="/admin" className="block rounded-md px-3 py-2 text-sm font-medium text-violet-700 hover:bg-violet-50" onClick={() => setMobileMenuOpen(false)}>
                                        Admin Dashboard
                                    </Link>
                                )}
                            </div>
                        </SignedIn>

                        <SignedOut>
                            <div className="border-t pt-4 mt-2 flex gap-2">
                                <SignInButton mode="modal">
                                    <Button variant="outline" className="flex-1">Sign In</Button>
                                </SignInButton>
                                <SignUpButton mode="modal">
                                    <Button className="flex-1 bg-violet-600 hover:bg-violet-700">Get Started</Button>
                                </SignUpButton>
                            </div>
                        </SignedOut>
                    </nav>
                </div>
            )}
        </header>
    );
}
