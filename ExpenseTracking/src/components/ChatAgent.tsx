"use client";

import { useState, useRef, useEffect } from "react";
import { ChatMessage } from "@/lib/types";

export default function ChatAgent() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!input.trim() || loading) return;

    const userMsg: ChatMessage = { role: "user", content: input.trim() };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setLoading(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: [...messages, userMsg] }),
      });

      if (!res.ok) throw new Error("Failed to get response");

      const reader = res.body?.getReader();
      const decoder = new TextDecoder();
      let assistantContent = "";

      setMessages((prev) => [...prev, { role: "assistant", content: "" }]);

      while (reader) {
        const { done, value } = await reader.read();
        if (done) break;
        assistantContent += decoder.decode(value, { stream: true });
        setMessages((prev) => {
          const updated = [...prev];
          updated[updated.length - 1] = { role: "assistant", content: assistantContent };
          return updated;
        });
      }
    } catch {
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: "Sorry, something went wrong. Please check your API key in .env.local." },
      ]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-sand/30 flex flex-col h-[500px]">
      <div className="p-5 border-b border-sand/20">
        <h2 className="text-lg font-semibold text-dark-blue">Financial Q&A Agent</h2>
        <p className="text-sm text-slate-blue">Ask anything about your spending (supports Chinese & English)</p>
      </div>

      <div ref={scrollRef} className="flex-1 overflow-auto p-5 space-y-4">
        {messages.length === 0 && (
          <div className="text-center text-sand text-sm py-10">
            <p>Try asking:</p>
            <div className="mt-3 space-y-2">
              {["What subscriptions can I cancel?", "我的餐饮支出有什么优化空间?", "Compare my monthly spending trends"].map((q) => (
                <button
                  key={q}
                  onClick={() => setInput(q)}
                  className="block mx-auto px-3 py-1.5 rounded-lg bg-cream hover:bg-sand/20 text-slate-blue text-xs transition-colors"
                >
                  {q}
                </button>
              ))}
            </div>
          </div>
        )}
        {messages.map((msg, i) => (
          <div key={i} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
            <div
              className={`max-w-[80%] rounded-2xl px-4 py-3 text-sm whitespace-pre-wrap ${
                msg.role === "user"
                  ? "bg-slate-blue text-white"
                  : "bg-cream text-foreground"
              }`}
            >
              {msg.content}
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex justify-start">
            <div className="bg-cream rounded-2xl px-4 py-3">
              <div className="flex gap-1">
                <span className="w-2 h-2 bg-slate-blue rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                <span className="w-2 h-2 bg-slate-blue rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                <span className="w-2 h-2 bg-slate-blue rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
              </div>
            </div>
          </div>
        )}
      </div>

      <form onSubmit={handleSubmit} className="p-4 border-t border-sand/20 flex gap-3">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask about your expenses..."
          className="flex-1 px-4 py-2.5 rounded-xl border border-sand/40 bg-cream/50 focus:outline-none focus:border-slate-blue text-sm"
        />
        <button
          type="submit"
          disabled={loading || !input.trim()}
          className="px-5 py-2.5 rounded-xl bg-slate-blue text-white text-sm font-medium hover:bg-dark-blue disabled:opacity-40 transition-colors"
        >
          Send
        </button>
      </form>
    </div>
  );
}
