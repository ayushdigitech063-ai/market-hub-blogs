import React, { useState } from "react";
import { X } from "lucide-react";


export default function TagInput({ value = [], onChange, placeholder }) {
  const [text, setText] = useState("");

  const add = (raw) => {
    const items = String(raw).split(",").map((s) => s.trim()).filter(Boolean);
    if (!items.length) return;
    const next = [...value];
    items.forEach((t) => {
      if (!next.some((x) => x.toLowerCase() === t.toLowerCase())) next.push(t);
    });
    onChange(next);
    setText("");
  };

  const onKeyDown = (e) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      add(text);
    } else if (e.key === "Backspace" && !text && value.length) {
      onChange(value.slice(0, -1));
    }
  };

  return (
    <div className="flex flex-wrap items-center gap-1.5 rounded-lg border border-orange-200 bg-white px-2 py-1.5 focus-within:border-orange-400 focus-within:ring-2 focus-within:ring-orange-300/40">
      {value.map((t) => (
        <span key={t} className="inline-flex items-center gap-1 rounded-full bg-orange-100 px-2.5 py-0.5 text-[11px] font-semibold text-orange-800">
          {t}
          <button type="button" onClick={() => onChange(value.filter((x) => x !== t))} aria-label={`Remove ${t}`}>
            <X className="h-3 w-3" />
          </button>
        </span>
      ))}
      <input
        value={text}
        onChange={(e) => setText(e.target.value)}
        onKeyDown={onKeyDown}
        onBlur={() => add(text)}
        placeholder={value.length ? "" : placeholder}
        className="min-w-[8rem] flex-1 bg-transparent px-1 py-1 text-[13px] text-slate-800 outline-none placeholder-slate-400"
      />
    </div>
  );
}
