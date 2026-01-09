"use client";

import { useUserSync } from "@/hooks/useUserSync";

/**
 * Component that syncs user to database when they log in.
 * This should be placed inside ClerkProvider in the layout.
 */
export function UserSyncProvider({ children }: { children: React.ReactNode }) {
    useUserSync();
    return <>{children}</>;
}
