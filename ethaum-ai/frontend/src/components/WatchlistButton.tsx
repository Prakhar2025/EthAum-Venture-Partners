"use client";

/**
 * WatchlistButton — reusable heart/bookmark component for product cards.
 *
 * Usage:
 *   <WatchlistButton productId={42} />
 *
 * - Shows filled heart if product is in watchlist, outline if not
 * - Handles API calls (POST / DELETE /api/v1/watchlist)
 * - Requires signed-in user (Clerk). Silent no-op if not signed in.
 */

import { useEffect, useState } from "react";
import { useUser } from "@clerk/nextjs";
import { Heart, Loader2 } from "lucide-react";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

interface WatchlistButtonProps {
    productId: number;
    className?: string;
    size?: "sm" | "md";
}

export function WatchlistButton({
    productId,
    className = "",
    size = "md",
}: WatchlistButtonProps) {
    const { user } = useUser();
    const [saved, setSaved]       = useState(false);
    const [loading, setLoading]   = useState(false);
    const [checked, setChecked]   = useState(false);

    // Check initial state
    useEffect(() => {
        if (!user) { setChecked(true); return; }
        fetch(`${API_BASE}/api/v1/watchlist/check/${productId}`, {
            headers: { "X-Clerk-User-Id": user.id },
        })
            .then((r) => r.json())
            .then((d) => { setSaved(!!d.saved); setChecked(true); })
            .catch(() => setChecked(true));
    }, [user, productId]);

    const toggle = async (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        if (!user || loading) return;

        setLoading(true);
        const wassaved = saved;
        setSaved(!wassaved); // Optimistic update

        try {
            if (wassaved) {
                await fetch(`${API_BASE}/api/v1/watchlist/${productId}`, {
                    method:  "DELETE",
                    headers: { "X-Clerk-User-Id": user.id },
                });
            } else {
                await fetch(`${API_BASE}/api/v1/watchlist`, {
                    method:  "POST",
                    headers: {
                        "Content-Type": "application/json",
                        "X-Clerk-User-Id": user.id,
                    },
                    body: JSON.stringify({ product_id: productId }),
                });
            }
        } catch {
            setSaved(wassaved); // Revert on error
        } finally {
            setLoading(false);
        }
    };

    const iconSize = size === "sm" ? "h-3.5 w-3.5" : "h-4 w-4";
    const btnSize  = size === "sm" ? "h-7 w-7"     : "h-8 w-8";

    if (!checked) return null; // Don't flash unstyled state

    return (
        <button
            onClick={toggle}
            disabled={loading || !user}
            title={saved ? "Remove from watchlist" : "Save to watchlist"}
            className={`flex items-center justify-center rounded-full border transition-all ${
                saved
                    ? "border-pink-200 bg-pink-50 text-pink-500 hover:bg-pink-100"
                    : "border-gray-200 bg-white text-gray-400 hover:border-pink-200 hover:text-pink-400"
            } disabled:cursor-not-allowed disabled:opacity-50 ${btnSize} ${className}`}
        >
            {loading
                ? <Loader2 className={`${iconSize} animate-spin`} />
                : <Heart className={`${iconSize} ${saved ? "fill-current" : ""}`} />
            }
        </button>
    );
}
