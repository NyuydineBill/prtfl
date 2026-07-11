"use client";

import { useEffect, useRef, useState } from "react";
import { MessageCircle, X, Send } from "lucide-react";
import { profile } from "@/lib/data/profile";

type Message = { role: "user" | "assistant"; content: string };

const GREETING: Message = {
  role: "assistant",
  content: `Hi! Ask me anything about ${profile.name.split(" ")[0]}'s projects, experience, or skills.`,
};

export function ChatWidget() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([GREETING]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, open]);

  async function handleSend() {
    const text = input.trim();
    if (!text || loading) return;

    const nextMessages = [...messages, { role: "user" as const, content: text }];
    setMessages(nextMessages);
    setInput("");
    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: nextMessages }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Something went wrong");
      setMessages((prev) => [...prev, { role: "assistant", content: data.reply }]);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed bottom-4 left-4 right-4 z-50 flex flex-col items-end sm:left-auto sm:bottom-5 sm:right-5 [padding-bottom:env(safe-area-inset-bottom)]">
      {open && (
        <div className="mb-3 flex h-[min(30rem,75dvh)] w-full max-w-full flex-col overflow-hidden rounded-lg border border-border bg-surface shadow-2xl sm:w-[22rem]">
          <div className="flex shrink-0 items-center justify-between border-b border-border px-4 py-3">
            <span className="font-mono text-xs uppercase tracking-wider text-accent">
              Ask about my work
            </span>
            <button
              type="button"
              onClick={() => setOpen(false)}
              aria-label="Close chat"
              className="text-muted hover:text-foreground"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-4">
            <div className="flex flex-col gap-3">
              {messages.map((m, i) => (
                <div
                  key={i}
                  className={`max-w-[85%] break-words rounded-lg px-3 py-2 text-sm leading-relaxed ${
                    m.role === "user"
                      ? "self-end bg-accent text-background"
                      : "self-start border border-border bg-surface-high text-foreground"
                  }`}
                >
                  {m.content}
                </div>
              ))}
              {loading && (
                <div className="self-start rounded-lg border border-border bg-surface-high px-3 py-2 text-sm text-muted">
                  Thinking…
                </div>
              )}
              {error && <p className="text-sm text-red-400">{error}</p>}
            </div>
          </div>

          <div className="flex shrink-0 items-center gap-2 border-t border-border p-3">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleSend();
              }}
              placeholder="Ask a question…"
              className="min-w-0 flex-1 rounded-md border border-border bg-surface-high px-3 py-2 text-base text-foreground outline-none focus:border-accent sm:text-sm"
            />
            <button
              type="button"
              onClick={handleSend}
              disabled={loading || !input.trim()}
              aria-label="Send"
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-accent text-background hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <Send className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}

      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-label={open ? "Close chat" : "Open chat"}
        className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-accent text-background shadow-xl transition-transform hover:-translate-y-0.5 sm:h-14 sm:w-14"
      >
        {open ? <X className="h-5 w-5" /> : <MessageCircle className="h-5 w-5" />}
      </button>
    </div>
  );
}
