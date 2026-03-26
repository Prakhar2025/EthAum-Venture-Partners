/**
 * EthAum AI — Role-Based Middleware (Phase 1)
 *
 * Strategy:
 *  - Public routes are accessible to everyone (match V0 behaviour).
 *  - /onboarding is accessible to any authenticated user.
 *  - /dashboard/startup|enterprise|investor are gated by role_v2
 *    read from Clerk publicMetadata (set by the backend onboarding router).
 *  - /admin stays gated by existing admin check (unchanged from V0).
 */

import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

// ── Public routes (no auth required) ────────────────────────────────────────
const isPublicRoute = createRouteMatcher([
    "/",
    "/marketplace(.*)",
    "/product/(.*)",
    "/compare(.*)",
    "/insights(.*)",
    "/analytics(.*)",
    "/badges(.*)",
    "/sign-in(.*)",
    "/sign-up(.*)",
]);

// ── Role-gated dashboard routes ──────────────────────────────────────────────
const isStartupRoute   = createRouteMatcher(["/dashboard/startup(.*)"]);
const isEnterpriseRoute = createRouteMatcher(["/dashboard/enterprise(.*)"]);
const isInvestorRoute   = createRouteMatcher(["/dashboard/investor(.*)"]);
const isDashboardRoute  = createRouteMatcher(["/dashboard(.*)"]);
const isOnboardingRoute = createRouteMatcher(["/onboarding(.*)"]);

/** Map each role to its canonical dashboard path. */
const ROLE_DASHBOARD: Record<string, string> = {
    startup:    "/dashboard/startup",
    enterprise: "/dashboard/enterprise",
    investor:   "/dashboard/investor",
    admin:      "/admin",
};

export default clerkMiddleware(async (auth, request) => {
    const { userId, sessionClaims } = await auth();

    // ── 1. Unauthenticated access to protected routes ──────────────────────
    if (!isPublicRoute(request)) {
        if (!userId) {
            // Let Clerk handle the redirect to sign-in
            await auth.protect();
            return;
        }
    }

    // ── 2. Skip middleware for public routes & unauthenticated users ───────
    if (!userId || isPublicRoute(request)) return NextResponse.next();

    // ── 3. Read role_v2 from Clerk publicMetadata (zero-latency, Edge-safe) ─
    // publicMetadata is set by backend after onboarding via Clerk Backend API.
    const publicMeta = (sessionClaims?.["publicMetadata"] as Record<string, string>) ?? {};
    const roleV2: string | undefined = publicMeta["role_v2"];

    // ── 4. Onboarding gate ─────────────────────────────────────────────────
    // If user hasn't completed onboarding and is trying to access a dashboard,
    // redirect them to /onboarding. Skip if they're already there.
    if (!roleV2 && isDashboardRoute(request) && !isOnboardingRoute(request)) {
        return NextResponse.redirect(new URL("/onboarding", request.url));
    }

    // ── 5. Role-based dashboard enforcement ───────────────────────────────
    if (roleV2 && isDashboardRoute(request)) {
        const canonicalDash = ROLE_DASHBOARD[roleV2] ?? "/dashboard/startup";

        // Block wrong-role access and redirect to their own dashboard
        if (isStartupRoute(request) && roleV2 !== "startup" && roleV2 !== "admin") {
            return NextResponse.redirect(new URL(canonicalDash, request.url));
        }
        if (isEnterpriseRoute(request) && roleV2 !== "enterprise" && roleV2 !== "admin") {
            return NextResponse.redirect(new URL(canonicalDash, request.url));
        }
        if (isInvestorRoute(request) && roleV2 !== "investor" && roleV2 !== "admin") {
            return NextResponse.redirect(new URL(canonicalDash, request.url));
        }
    }

    return NextResponse.next();
});

export const config = {
    matcher: [
        // Skip Next.js internals and all static files
        "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
        // Always run for API routes
        "/(api|trpc)(.*)",
    ],
};
