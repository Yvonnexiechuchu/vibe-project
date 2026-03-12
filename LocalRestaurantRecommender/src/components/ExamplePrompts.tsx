"use client";

import { EXAMPLE_PROMPTS } from "@/lib/constants";

interface ExamplePromptsProps {
  onSelect: (prompt: string) => void;
}

export default function ExamplePrompts({ onSelect }: ExamplePromptsProps) {
  return (
    <div className="flex flex-wrap gap-2 justify-center">
      {EXAMPLE_PROMPTS.map((prompt, i) => (
        <button
          key={i}
          onClick={() => onSelect(prompt)}
          className="px-3.5 py-2 text-sm rounded-full border border-border bg-surface text-text-secondary hover:bg-accent-light hover:text-accent hover:border-accent/20 transition-all active:scale-[0.97]"
        >
          {prompt}
        </button>
      ))}
    </div>
  );
}
