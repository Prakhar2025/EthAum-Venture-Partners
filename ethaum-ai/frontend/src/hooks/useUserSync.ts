"use client";

import { useUser } from "@clerk/nextjs";
import { useEffect, useRef, useState } from "react";
import { useRouter, usePathname } from "next/navigation";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

interface UserProfile {
    role_v2: string | null;
    onboarding_complete: boolean;
    role: string;
    company_name: string | null;
    verified: boolean;
}

/**
 * Syncs Clerk user to Supabase on first load, then fetches full profile
 * including V2 onboarding state. Redirects to /onboarding when not complete.
 */
export function useUserSync() {
    const { user, isLoaded } = useUser();
    const hasSynced = useRef(false);
    const router = useRouter();
    const pathname = usePathname();
    const [profile, setProfile] = useState<UserProfile | null>(null);

    useEffect(() => {
        if (!isLoaded || !user || hasSynced.current) return;

        const sync = async () => {
            try {
                // Step 1 — Sync Clerk user to Supabase (upsert)
                await fetch(`${API_BASE}/api/v1/users/sync`, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        "X-Clerk-User-Id": user.id,
                    },
                    body: JSON.stringify({
                        clerk_id: user.id,
                        email: user.primaryEmailAddress?.emailAddress ?? "",
                        full_name: user.fullName ?? undefined,
                        avatar_url: user.imageUrl ?? undefined,
                    }),
                });

                // Step 2 — Fetch full profile including V2 onboarding state
                const meRes = await fetch(`${API_BASE}/api/v1/users/me`, {
                    headers: { "X-Clerk-User-Id": user.id },
                });

                if (meRes.ok) {
                    const data = await meRes.json();
                    setProfile({
                        role_v2: data.role_v2 ?? null,
                        onboarding_complete: data.onboarding_complete ?? false,
                        role: data.role ?? "buyer",
                        company_name: data.company_name ?? null,
                        verified: data.verified ?? false,
                    });

                    // Step 3 — Redirect to onboarding if not complete
                    // Skip if already on onboarding, sign-in, sign-up, or public pages
                    const skipPaths = ["/onboarding", "/sign-in", "/sign-up", "/"];
                    const isPublic =
                        skipPaths.some((p) => pathname === p) ||
                        pathname.startsWith("/marketplace") ||
                        pathname.startsWith("/product") ||
                        pathname.startsWith("/compare") ||
                        pathname.startsWith("/insights") ||
                        pathname.startsWith("/analytics") ||
                        pathname.startsWith("/badges");

                    if (!data.onboarding_complete && !isPublic) {
                        router.push("/onboarding");
                    }
                }

                hasSynced.current = true;
                console.log("[useUserSync] User synced ✓");
            } catch (error) {
                console.error("[useUserSync] Failed to sync user:", error);
            }
        };

        sync();
    }, [isLoaded, user, pathname, router]);

    return { user, isLoaded, profile };
}
