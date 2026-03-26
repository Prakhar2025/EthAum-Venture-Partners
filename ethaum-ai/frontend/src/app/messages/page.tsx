"use client";

import { useEffect, useState, useCallback } from "react";
import { useUser } from "@clerk/nextjs";
import Link from "next/link";
import { MessageSquare, Circle, Loader2, Inbox } from "lucide-react";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

interface Conversation {
    thread_id:       string;
    other_user_id:   string;
    other_user_name: string;
    product_id?:     number;
    product_name?:   string;
    last_message:    string;
    last_message_at: string;
    unread_count:    number;
}

function timeAgo(iso: string): string {
    if (!iso) return "";
    const diff = Date.now() - new Date(iso).getTime();
    const m = Math.floor(diff / 60000);
    if (m < 1)  return "just now";
    if (m < 60) return `${m}m ago`;
    const h = Math.floor(m / 60);
    if (h < 24) return `${h}h ago`;
    return `${Math.floor(h / 24)}d ago`;
}

export default function MessagesInboxPage() {
    const { user } = useUser();
    const [convos, setConvos]   = useState<Conversation[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchInbox = useCallback(async () => {
        if (!user) return;
        try {
            const res = await fetch(`${API_BASE}/api/v1/messages/inbox`, {
                headers: { "X-Clerk-User-Id": user.id },
            });
            const data = await res.json();
            setConvos(Array.isArray(data) ? data : []);
        } catch {
            setConvos([]);
        } finally {
            setLoading(false);
        }
    }, [user]);

    useEffect(() => {
        fetchInbox();
        // Poll every 15 seconds
        const interval = setInterval(fetchInbox, 15000);
        return () => clearInterval(interval);
    }, [fetchInbox]);

    if (!user) return (
        <div className="container mx-auto px-4 py-16 text-center">
            <p className="text-gray-500">Sign in to view your messages.</p>
        </div>
    );

    const totalUnread = convos.reduce((sum, c) => sum + c.unread_count, 0);

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="container mx-auto px-4 py-8 max-w-2xl">
                {/* Header */}
                <div className="mb-6 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <MessageSquare className="h-5 w-5 text-violet-600" />
                        <h1 className="text-xl font-bold text-gray-900">Messages</h1>
                        {totalUnread > 0 && (
                            <span className="rounded-full bg-violet-600 px-1.5 py-0.5 text-xs font-bold text-white">
                                {totalUnread}
                            </span>
                        )}
                    </div>
                    <button onClick={fetchInbox} className="text-xs text-gray-400 hover:text-violet-600 transition-colors">
                        Refresh
                    </button>
                </div>

                {loading ? (
                    <div className="flex justify-center py-20">
                        <Loader2 className="h-6 w-6 animate-spin text-violet-600" />
                    </div>
                ) : convos.length === 0 ? (
                    <div className="rounded-2xl border border-gray-200 bg-white p-12 text-center">
                        <Inbox className="mx-auto h-10 w-10 text-gray-300 mb-3" />
                        <h3 className="font-semibold text-gray-700 mb-1">No messages yet</h3>
                        <p className="text-sm text-gray-500">Enterprise buyers and investors can start a conversation from your product page.</p>
                    </div>
                ) : (
                    <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white divide-y divide-gray-50">
                        {convos.map((c) => (
                            <Link key={c.thread_id} href={`/messages/${encodeURIComponent(c.thread_id)}`}>
                                <div className={`flex items-start gap-4 px-5 py-4 hover:bg-gray-50 transition-colors ${c.unread_count > 0 ? "bg-violet-50/40" : ""}`}>
                                    {/* Avatar */}
                                    <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-violet-100 to-indigo-100 text-sm font-bold text-violet-700">
                                        {(c.other_user_name ?? "?").charAt(0).toUpperCase()}
                                    </div>

                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center justify-between gap-2">
                                            <p className={`text-sm font-semibold truncate ${c.unread_count > 0 ? "text-gray-900" : "text-gray-700"}`}>
                                                {c.other_user_name}
                                            </p>
                                            <span className="shrink-0 text-xs text-gray-400">{timeAgo(c.last_message_at)}</span>
                                        </div>
                                        {c.product_name && (
                                            <p className="text-xs text-violet-600 font-medium truncate">{c.product_name}</p>
                                        )}
                                        <p className={`text-sm truncate ${c.unread_count > 0 ? "text-gray-800 font-medium" : "text-gray-500"}`}>
                                            {c.last_message}
                                        </p>
                                    </div>

                                    {c.unread_count > 0 && (
                                        <Circle className="h-2.5 w-2.5 flex-shrink-0 fill-violet-600 text-violet-600 mt-1.5" />
                                    )}
                                </div>
                            </Link>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
