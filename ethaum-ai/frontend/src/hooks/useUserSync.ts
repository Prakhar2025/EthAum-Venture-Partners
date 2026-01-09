"use client";

import { useUser } from "@clerk/nextjs";
import { useEffect, useRef } from "react";
import { syncUser } from "@/lib/api";

/**
 * Hook to sync Clerk user to Supabase database.
 * Should be called in a component that renders when user is logged in.
 */
export function useUserSync() {
    const { user, isLoaded } = useUser();
    const hasSynced = useRef(false);

    useEffect(() => {
        if (!isLoaded || !user || hasSynced.current) return;

        const sync = async () => {
            try {
                await syncUser({
                    clerk_id: user.id,
                    email: user.primaryEmailAddress?.emailAddress || "",
                    full_name: user.fullName || undefined,
                    avatar_url: user.imageUrl || undefined,
                });
                hasSynced.current = true;
                console.log("User synced to database");
            } catch (error) {
                console.error("Failed to sync user:", error);
            }
        };

        sync();
    }, [isLoaded, user]);

    return { user, isLoaded };
}
