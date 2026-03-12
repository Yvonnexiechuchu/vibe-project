"use client";

import { useState, useRef, useEffect } from "react";

interface ChatInputProps {
  onSubmit: (query: string) => void;
  disabled?: boolean;
  initialValue?: string;
}

export default function ChatInput({ onSubmit, disabled, initialValue }: ChatInputProps) {
  const [value, setValue] = useState(initialValue || "");
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (initialValue) setValue(initialValue);
  }, [initialValue]);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = Math.min(textareaRef.current.scrollHeight, 120) + "px";
    }
  }, [value]);

  const handleSubmit = () => {
    const trimmed = value.trim();
    if (!trimmed || disabled) return;
    onSubmit(trimmed);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <div className="relative w-full">
      <div className="flex items-end gap-2 rounded-2xl border border-border bg-surface p-3 shadow-sm transition-shadow focus-within:shadow-md focus-within:border-accent/30">
        <textarea
          ref={textareaRef}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="What are you in the mood for? e.g. &quot;Cozy Korean spot in Annandale for 4&quot;"
          disabled={disabled}
          rows={1}
          className="flex-1 resize-none bg-transparent text-foreground placeholder:text-text-tertiary focus:outline-none text-[16px] leading-relaxed"
        />
        <button
          onClick={handleSubmit}
          disabled={disabled || !value.trim()}
          className="flex-shrink-0 flex items-center justify-center w-10 h-10 rounded-xl bg-accent text-white transition-all hover:bg-accent-hover disabled:opacity-30 disabled:cursor-not-allowed active:scale-95"
          aria-label="Search"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <line x1="5" y1="12" x2="19" y2="12" />
            <polyline points="12 5 19 12 12 19" />
          </svg>
        </button>
      </div>
    </div>
  );
}
