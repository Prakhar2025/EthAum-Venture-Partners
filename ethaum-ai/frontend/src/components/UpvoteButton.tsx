"use client";

import { useState } from "react";
import { useUser } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";
import { ArrowUp } from "lucide-react";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

interface UpvoteButtonProps {
    launchId: number;
    initialUpvotes: number;
    initialUserUpvoted?: boolean;
    onUpvoteChange?: (newCount: number, userUpvoted: boolean) => void;
}

export function UpvoteButton({
    launchId,
    initialUpvotes,
    initialUserUpvoted = false,
    onUpvoteChange
}: UpvoteButtonProps) {
    const { user } = useUser();
    const [upvotes, setUpvotes] = useState(initialUpvotes);
    const [userUpvoted, setUserUpvoted] = useState(initialUserUpvoted);
    const [isLoading, setIsLoading] = useState(false);

    const handleUpvote = async () => {
        if (!user) {
            alert("Please sign in to upvote");
            return;
        }

        setIsLoading(true);

        try {
            const response = await fetch(`${API_BASE}/api/v1/launches/${launchId}/upvote`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "X-Clerk-User-Id": user.id,
                },
            });

            if (response.ok) {
                const data = await response.json();
                setUpvotes(data.upvotes);
                setUserUpvoted(data.user_upvoted);
                onUpvoteChange?.(data.upvotes, data.user_upvoted);
            }
        } catch (error) {
            console.error("Upvote failed:", error);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Button
            variant={userUpvoted ? "default" : "outline"}
            size="sm"
            onClick={handleUpvote}
            disabled={isLoading}
            className={`flex items-center gap-1 ${userUpvoted
                    ? "bg-orange-500 hover:bg-orange-600 text-white border-orange-500"
                    : "hover:border-orange-500 hover:text-orange-500"
                }`}
        >
            <ArrowUp className={`h-4 w-4 ${isLoading ? "animate-pulse" : ""}`} />
            <span className="font-semibold">{upvotes}</span>
        </Button>
    );
}
