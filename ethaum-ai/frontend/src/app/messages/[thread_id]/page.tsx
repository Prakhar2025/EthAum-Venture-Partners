"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { useParams } from "next/navigation";
import { useUser } from "@clerk/nextjs";
import Link from "next/link";
import {
    ArrowLeft,
    Send,
    Loader2,
    Package,
    Calendar,
} from "lucide-react";
import { Textarea } from "@/components/ui/textarea";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

interface Message {
    id:         string;
    from_user:  string;
    to_user:    string;
    thread_id:  string;
    product_id?: number;
    content:    string;
    read:       boolean;
    created_at: string;
}

function formatTime(iso: string): string {
    if (!iso) return "";
    const d = new Date(iso);
    const now = new Date();
    const isToday = d.toDateString() === now.toDateString();
    return isToday
        ? d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
        : d.toLocaleDateString([], { month: "short", day: "numeric" }) +
          " " + d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

export default function MessageThreadPage() {
    const params   = useParams();
    const threadId = decodeURIComponent(params.thread_id as string);
    const { user } = useUser();

    const [messages, setMessages] = useState<Message[]>([]);
    const [loading, setLoading]   = useState(true);
    const [content, setContent]   = useState("");
    const [sending, setSending]   = useState(false);
    const [error, setError]       = useState<string | null>(null);
    const bottomRef = useRef<HTMLDivElement>(null);

    // Derive other user + product from thread_id
    // thread_id format: "clerkA:clerkB" or "clerkA:clerkB#productId"
    const [productId, otherUserId] = (() => {
        const [pair, pidStr] = threadId.split("#");
        const others = pair.split(":").filter((u) => u !== user?.id);
        return [pidStr ? parseInt(pidStr) : null, others[0] ?? ""];
    })();

    const fetchMessages = useCallback(async () => {
        if (!user) return;
        try {
            const res = await fetch(`${API_BASE}/api/v1/messages/${encodeURIComponent(threadId)}`, {
                headers: { "X-Clerk-User-Id": user.id },
            });
            if (res.ok) {
                const data = await res.json();
                setMessages(Array.isArray(data) ? data : []);
            }
        } catch {
        } finally {
            setLoading(false);
        }
    }, [user, threadId]);

    useEffect(() => {
        fetchMessages();
        const interval = setInterval(fetchMessages, 10000);
        return () => clearInterval(interval);
    }, [fetchMessages]);

    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    const handleSend = async () => {
        if (!user || !content.trim() || sending) return;
        setSending(true);
        setError(null);
        try {
            const res = await fetch(`${API_BASE}/api/v1/messages`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "X-Clerk-User-Id": user.id,
                },
                body: JSON.stringify({
                    to_user:    otherUserId,
                    content:    content.trim(),
                    product_id: productId,
                }),
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.detail || "Failed to send");
            setContent("");
            setMessages((prev) => [...prev, data]);
            bottomRef.current?.scrollIntoView({ behavior: "smooth" });
        } catch (err) {
            setError(err instanceof Error ? err.message : "Failed to send");
        } finally {
            setSending(false);
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    if (!user) return (
        <div className="container mx-auto px-4 py-16 text-center">
            <p className="text-gray-500">Sign in to view messages.</p>
        </div>
    );

    // Get display name from first message
    const otherName = messages.find((m) => m.from_user !== user.id)
        ? "Other" : otherUserId.slice(0, 8) + "…";

    return (
        <div className="flex h-[calc(100vh-64px)] flex-col bg-gray-50">
            {/* Thread header */}
            <div className="flex items-center gap-3 border-b border-gray-200 bg-white px-4 py-3">
                <Link href="/messages" className="text-gray-400 hover:text-gray-700 transition-colors">
                    <ArrowLeft className="h-5 w-5" />
                </Link>
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-violet-100 to-indigo-100 text-sm font-bold text-violet-700">
                    {otherUserId.charAt(4)?.toUpperCase() ?? "?"}
                </div>
                <div className="flex-1">
                    <p className="text-sm font-semibold text-gray-900">Conversation</p>
                    {productId && (
                        <p className="flex items-center gap-1 text-xs text-violet-600">
                            <Package className="h-3 w-3" /> Re: Product #{productId}
                        </p>
                    )}
                </div>
                {productId && (
                    <Link href={`/product/${productId}`} className="rounded-lg border border-gray-200 px-2.5 py-1 text-xs font-medium text-gray-600 hover:bg-gray-50 transition-colors">
                        View Product
                    </Link>
                )}
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
                {loading ? (
                    <div className="flex justify-center py-10">
                        <Loader2 className="h-5 w-5 animate-spin text-violet-600" />
                    </div>
                ) : messages.length === 0 ? (
                    <p className="text-center text-sm text-gray-400 py-10">Start the conversation.</p>
                ) : (
                    messages.map((msg) => {
                        const isMe = msg.from_user === user.id;
                        return (
                            <div key={msg.id} className={`flex ${isMe ? "justify-end" : "justify-start"}`}>
                                <div className={`max-w-[75%] rounded-2xl px-4 py-2.5 ${isMe ? "bg-violet-600 text-white rounded-br-sm" : "bg-white border border-gray-200 text-gray-800 rounded-bl-sm shadow-sm"}`}>
                                    <p className="text-sm leading-relaxed whitespace-pre-wrap">{msg.content}</p>
                                    <p className={`mt-1 text-right text-[11px] ${isMe ? "text-violet-200" : "text-gray-400"}`}>
                                        {formatTime(msg.created_at)}
                                        {isMe && msg.read && <span className="ml-1">✓✓</span>}
                                    </p>
                                </div>
                            </div>
                        );
                    })
                )}
                <div ref={bottomRef} />
            </div>

            {/* Compose */}
            <div className="border-t border-gray-200 bg-white px-4 pb-4 pt-3">
                {error && <p className="mb-2 text-xs text-red-500">{error}</p>}
                <div className="flex items-end gap-2">
                    <Textarea
                        className="flex-1 min-h-[44px] max-h-32 resize-none text-sm"
                        placeholder="Type a message… (Enter to send, Shift+Enter for newline)"
                        value={content}
                        onChange={(e) => setContent(e.target.value)}
                        onKeyDown={handleKeyDown}
                        disabled={sending}
                        maxLength={4000}
                    />
                    <button
                        onClick={handleSend}
                        disabled={sending || !content.trim()}
                        className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-violet-600 text-white hover:bg-violet-700 disabled:opacity-40 transition-colors"
                    >
                        {sending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                    </button>
                </div>
                <p className="mt-1.5 text-right text-[11px] text-gray-400">
                    {content.length}/4000
                </p>
            </div>
        </div>
    );
}
