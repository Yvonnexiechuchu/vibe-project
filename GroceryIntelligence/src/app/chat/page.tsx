"use client";

import { useRef, useState } from "react";
import { Card } from "@/components/ui/Card";
import { IconButton } from "@/components/ui/IconButton";
import { Input } from "@/components/ui/Input";
import { Screen } from "@/components/ui/Screen";
import { SendIcon, SparkleIcon } from "@/components/Icon";
import { askQuestion } from "@/lib/client-api";

type Msg = { role: "user" | "assistant"; text: string };

const SUGGESTIONS = [
  "Where should I buy organic spinach?",
  "How much did I spend on produce last month?",
  "Is organic milk worth it for me?",
  "What's my best-ever price on eggs?",
];

export default function ChatPage() {
  const [q, setQ] = useState("");
  const [msgs, setMsgs] = useState<Msg[]>([]);
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  async function onSend(text?: string) {
    const question = (text ?? q).trim();
    if (!question) return;
    setMsgs((m) => [...m, { role: "user", text: question }]);
    setQ("");
    setLoading(true);
    try {
      const answer = await askQuestion(question);
      setMsgs((m) => [...m, { role: "assistant", text: answer }]);
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Failed";
      setMsgs((m) => [...m, { role: "assistant", text: `⚠︎ ${msg}` }]);
    } finally {
      setLoading(false);
      requestAnimationFrame(() => {
        scrollRef.current?.scrollTo({
          top: scrollRef.current.scrollHeight,
          behavior: "smooth",
        });
      });
    }
  }

  return (
    <Screen>
      <div className="px-6 pt-10 pb-2 safe-area-top">
        <p className="text-caption text-[var(--ink-300)]">Ask anything</p>
        <h1 className="text-h1 mt-1 flex items-center gap-2">
          Your data <SparkleIcon />
        </h1>
      </div>

      <div ref={scrollRef} className="px-6 mt-2 flex-1 overflow-y-auto no-scrollbar pb-4">
        {msgs.length === 0 && (
          <div className="mt-4 space-y-3">
            <p className="text-meta text-[var(--ink-800)]">Try one of these:</p>
            <div className="flex flex-wrap gap-2">
              {SUGGESTIONS.map((s) => (
                <button
                  key={s}
                  onClick={() => onSend(s)}
                  className="ink-border ink-shadow rounded-full bg-white text-ink text-[13px] font-extrabold px-4 h-10 ink-press text-left"
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        )}

        <div className="mt-4 flex flex-col gap-3">
          {msgs.map((m, i) => (
            <Card
              key={i}
              color={m.role === "user" ? "ink" : "white"}
              className="animate-fade-in-up"
            >
              {m.role === "assistant" ? (
                <MarkdownLite text={m.text} />
              ) : (
                <p className="text-body">{m.text}</p>
              )}
            </Card>
          ))}
          {loading && (
            <Card color="white">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-ink animate-pulse" />
                <span className="w-2 h-2 rounded-full bg-ink animate-pulse [animation-delay:120ms]" />
                <span className="w-2 h-2 rounded-full bg-ink animate-pulse [animation-delay:240ms]" />
              </div>
            </Card>
          )}
        </div>
      </div>

      <div className="sticky bottom-[92px] px-6 pt-2 pb-2 bg-white">
        <div className="flex items-center gap-3">
          <Input
            placeholder="Ask about prices, stores, trends…"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") onSend();
            }}
          />
          <IconButton
            size="lg"
            color="ink"
            onClick={() => onSend()}
            disabled={loading || !q.trim()}
            aria-label="Send"
          >
            <SendIcon />
          </IconButton>
        </div>
      </div>
    </Screen>
  );
}

/** A tiny markdown renderer — bold, bullet lists, line breaks. No external dep. */
function MarkdownLite({ text }: { text: string }) {
  const lines = text.split("\n");
  return (
    <div className="space-y-2">
      {lines.map((line, i) => {
        if (!line.trim()) return <div key={i} className="h-1" />;
        const bulletMatch = line.match(/^\s*[-•*]\s+(.*)$/);
        if (bulletMatch) {
          return (
            <div key={i} className="flex gap-2 text-body">
              <span className="text-[var(--ink-300)]">•</span>
              <span className="flex-1">{renderBold(bulletMatch[1])}</span>
            </div>
          );
        }
        const headingMatch = line.match(/^(#{1,3})\s+(.*)$/);
        if (headingMatch) {
          const level = headingMatch[1].length;
          const cls = level === 1 ? "text-h2" : level === 2 ? "text-h3" : "text-body";
          return (
            <p key={i} className={cls}>
              {renderBold(headingMatch[2])}
            </p>
          );
        }
        return (
          <p key={i} className="text-body">
            {renderBold(line)}
          </p>
        );
      })}
    </div>
  );
}

function renderBold(s: string) {
  const parts = s.split(/(\*\*[^*]+\*\*)/);
  return parts.map((p, i) =>
    p.startsWith("**") && p.endsWith("**") ? (
      <strong key={i} className="font-extrabold">
        {p.slice(2, -2)}
      </strong>
    ) : (
      <span key={i}>{p}</span>
    )
  );
}
