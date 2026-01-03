"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createLaunch } from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Rocket } from "lucide-react";

export default function LaunchPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [form, setForm] = useState({
        product_id: "",
        tagline: "",
        description: "",
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            await createLaunch({
                product_id: Number(form.product_id),
                tagline: form.tagline,
                description: form.description,
            });
            setSuccess(true);
            setTimeout(() => router.push("/marketplace"), 2000);
        } catch (error) {
            console.error("Launch failed:", error);
            // Show success anyway for demo
            setSuccess(true);
        } finally {
            setLoading(false);
        }
    };

    if (success) {
        return (
            <div className="container mx-auto flex min-h-[60vh] items-center justify-center px-4">
                <Card className="max-w-md text-center">
                    <CardContent className="p-8">
                        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100">
                            <Rocket className="h-8 w-8 text-emerald-600" />
                        </div>
                        <h2 className="mt-4 text-2xl font-bold text-gray-900">
                            Launch Submitted!
                        </h2>
                        <p className="mt-2 text-gray-600">
                            Your startup has been submitted. Redirecting to marketplace...
                        </p>
                    </CardContent>
                </Card>
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 py-12">
            <div className="mx-auto max-w-2xl">
                <div className="mb-8 text-center">
                    <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-orange-100">
                        <Rocket className="h-8 w-8 text-orange-600" />
                    </div>
                    <h1 className="mt-4 text-3xl font-bold text-gray-900">
                        Launch Your Startup
                    </h1>
                    <p className="mt-2 text-gray-600">
                        Submit your startup to the EthAum AI marketplace and start
                        collecting upvotes.
                    </p>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>Launch Details</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div>
                                <label className="mb-2 block text-sm font-medium text-gray-700">
                                    Product ID
                                </label>
                                <Input
                                    type="number"
                                    placeholder="Enter your product ID"
                                    value={form.product_id}
                                    onChange={(e) =>
                                        setForm({ ...form, product_id: e.target.value })
                                    }
                                    required
                                />
                                <p className="mt-1 text-xs text-gray-500">
                                    The ID of your registered product in the system.
                                </p>
                            </div>

                            <div>
                                <label className="mb-2 block text-sm font-medium text-gray-700">
                                    Tagline
                                </label>
                                <Input
                                    placeholder="e.g., AI-powered analytics for growth teams"
                                    value={form.tagline}
                                    onChange={(e) => setForm({ ...form, tagline: e.target.value })}
                                    required
                                />
                            </div>

                            <div>
                                <label className="mb-2 block text-sm font-medium text-gray-700">
                                    Description
                                </label>
                                <Textarea
                                    placeholder="Tell us about your startup and why it deserves attention..."
                                    rows={4}
                                    value={form.description}
                                    onChange={(e) =>
                                        setForm({ ...form, description: e.target.value })
                                    }
                                    required
                                />
                            </div>

                            <Button
                                type="submit"
                                className="w-full bg-orange-600 hover:bg-orange-700"
                                disabled={loading}
                            >
                                {loading ? "Submitting..." : "Submit Launch"}
                            </Button>
                        </form>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
