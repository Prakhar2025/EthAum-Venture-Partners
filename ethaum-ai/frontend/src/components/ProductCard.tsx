import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TrustScoreBadge } from "./TrustScoreBadge";
import { ArrowUp } from "lucide-react";

interface ProductCardProps {
    id: number;
    name: string;
    category: string;
    trustScore: number;
    upvotes?: number;
}

export function ProductCard({
    id,
    name,
    category,
    trustScore,
    upvotes,
}: ProductCardProps) {
    return (
        <Link href={`/product/${id}`}>
            <Card className="group cursor-pointer transition-all hover:shadow-md hover:border-violet-200">
                <CardContent className="flex items-center justify-between p-4">
                    <div className="flex items-center gap-4">
                        <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-gradient-to-br from-violet-100 to-indigo-100 text-lg font-bold text-violet-600">
                            {name.charAt(0)}
                        </div>
                        <div>
                            <h3 className="font-semibold text-gray-900 group-hover:text-violet-600">
                                {name}
                            </h3>
                            <Badge variant="secondary" className="mt-1">
                                {category}
                            </Badge>
                        </div>
                    </div>

                    <div className="flex items-center gap-6">
                        {upvotes !== undefined && (
                            <div className="flex items-center gap-1 text-gray-500">
                                <ArrowUp className="h-4 w-4" />
                                <span className="text-sm font-medium">{upvotes}</span>
                            </div>
                        )}
                        <TrustScoreBadge score={trustScore} size="sm" showLabel={false} />
                    </div>
                </CardContent>
            </Card>
        </Link>
    );
}
