import { cn } from "@/lib/utils";

interface TrustScoreBadgeProps {
    score: number;
    size?: "sm" | "md" | "lg";
    showLabel?: boolean;
}

export function TrustScoreBadge({
    score,
    size = "md",
    showLabel = true,
}: TrustScoreBadgeProps) {
    const getColor = (score: number) => {
        if (score >= 80) return "text-emerald-600 bg-emerald-50 border-emerald-200";
        if (score >= 60) return "text-amber-600 bg-amber-50 border-amber-200";
        return "text-red-600 bg-red-50 border-red-200";
    };

    const sizeClasses = {
        sm: "h-8 w-8 text-xs",
        md: "h-12 w-12 text-sm",
        lg: "h-16 w-16 text-lg",
    };

    return (
        <div className="flex items-center gap-2">
            <div
                className={cn(
                    "flex items-center justify-center rounded-full border-2 font-bold",
                    getColor(score),
                    sizeClasses[size]
                )}
            >
                {score}
            </div>
            {showLabel && (
                <span className="text-xs font-medium text-gray-500">Trust Score</span>
            )}
        </div>
    );
}
