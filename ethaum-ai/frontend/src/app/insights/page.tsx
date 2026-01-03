"use client";

import { useEffect, useState } from "react";
import { getQuadrantData, QuadrantData } from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
    ScatterChart,
    Scatter,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    Cell,
    ReferenceLine,
} from "recharts";

const QUADRANT_COLORS: Record<string, string> = {
    Leaders: "#10b981",
    Challengers: "#f59e0b",
    Visionaries: "#8b5cf6",
    "Niche Players": "#6b7280",
};

export default function InsightsPage() {
    const [data, setData] = useState<QuadrantData[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchData() {
            try {
                const quadrantData = await getQuadrantData();
                setData(quadrantData);
            } catch (error) {
                console.error("Failed to fetch:", error);
            } finally {
                setLoading(false);
            }
        }
        fetchData();
    }, []);

    return (
        <div className="container mx-auto px-4 py-12">
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900">
                    Emerging Quadrants
                </h1>
                <p className="mt-2 text-gray-600">
                    Gartner-style analysis of startups by market traction and innovation.
                </p>
            </div>

            <div className="grid gap-8 lg:grid-cols-4">
                {/* Quadrant Chart */}
                <Card className="lg:col-span-3">
                    <CardHeader>
                        <CardTitle>Startup Positioning</CardTitle>
                    </CardHeader>
                    <CardContent>
                        {loading ? (
                            <div className="flex h-96 items-center justify-center text-gray-500">
                                Loading...
                            </div>
                        ) : (
                            <div className="h-96">
                                <ResponsiveContainer width="100%" height="100%">
                                    <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
                                        <CartesianGrid strokeDasharray="3 3" />
                                        <XAxis
                                            type="number"
                                            dataKey="x"
                                            name="Market Traction"
                                            domain={[0, 100]}
                                            label={{
                                                value: "Market Traction →",
                                                position: "bottom",
                                                offset: 0,
                                            }}
                                        />
                                        <YAxis
                                            type="number"
                                            dataKey="y"
                                            name="Innovation"
                                            domain={[0, 100]}
                                            label={{
                                                value: "Innovation →",
                                                angle: -90,
                                                position: "left",
                                            }}
                                        />
                                        <ReferenceLine x={50} stroke="#e5e7eb" strokeWidth={2} />
                                        <ReferenceLine y={50} stroke="#e5e7eb" strokeWidth={2} />
                                        <Tooltip
                                            content={({ active, payload }) => {
                                                if (active && payload && payload.length) {
                                                    const item = payload[0].payload as QuadrantData;
                                                    return (
                                                        <div className="rounded-lg border bg-white p-3 shadow-lg">
                                                            <p className="font-semibold">{item.name}</p>
                                                            <p className="text-sm text-gray-600">
                                                                {item.quadrant}
                                                            </p>
                                                            <p className="text-xs text-gray-500">
                                                                Traction: {item.x} | Innovation: {item.y}
                                                            </p>
                                                        </div>
                                                    );
                                                }
                                                return null;
                                            }}
                                        />
                                        <Scatter data={data}>
                                            {data.map((entry, index) => (
                                                <Cell
                                                    key={index}
                                                    fill={QUADRANT_COLORS[entry.quadrant] || "#6b7280"}
                                                />
                                            ))}
                                        </Scatter>
                                    </ScatterChart>
                                </ResponsiveContainer>
                            </div>
                        )}

                        {/* Quadrant Labels */}
                        <div className="mt-4 grid grid-cols-2 gap-4 text-sm">
                            <div className="rounded-lg bg-gray-50 p-3">
                                <span className="font-medium text-gray-500">Visionaries</span>
                                <p className="text-xs text-gray-400">High innovation, low traction</p>
                            </div>
                            <div className="rounded-lg bg-emerald-50 p-3">
                                <span className="font-medium text-emerald-600">Leaders</span>
                                <p className="text-xs text-gray-400">High innovation & traction</p>
                            </div>
                            <div className="rounded-lg bg-gray-50 p-3">
                                <span className="font-medium text-gray-500">Niche Players</span>
                                <p className="text-xs text-gray-400">Focused, emerging</p>
                            </div>
                            <div className="rounded-lg bg-amber-50 p-3">
                                <span className="font-medium text-amber-600">Challengers</span>
                                <p className="text-xs text-gray-400">High traction, evolving</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Legend */}
                <Card>
                    <CardHeader>
                        <CardTitle>Legend</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-3">
                            {Object.entries(QUADRANT_COLORS).map(([label, color]) => (
                                <div key={label} className="flex items-center gap-3">
                                    <div
                                        className="h-3 w-3 rounded-full"
                                        style={{ backgroundColor: color }}
                                    />
                                    <span className="text-sm text-gray-600">{label}</span>
                                </div>
                            ))}
                        </div>

                        <div className="mt-6 border-t pt-6">
                            <h4 className="font-medium text-gray-900">Startups</h4>
                            <ul className="mt-3 space-y-2">
                                {data.map((item) => (
                                    <li
                                        key={item.id}
                                        className="flex items-center justify-between text-sm"
                                    >
                                        <span>{item.name}</span>
                                        <span
                                            className="rounded px-2 py-0.5 text-xs text-white"
                                            style={{
                                                backgroundColor:
                                                    QUADRANT_COLORS[item.quadrant] || "#6b7280",
                                            }}
                                        >
                                            {item.quadrant}
                                        </span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
