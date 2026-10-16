import React, { useState } from "react";
import { AlertTriangle, CheckCircle2 } from "lucide-react";
import { Card } from "../ui";

export default function SeoScore({ result }) {
  const [showAll, setShowAll] = useState(false);
  const { score, tips, label, color } = result;
  const visible = showAll ? tips : tips.slice(0, 5);
  const r = 52;
  const c = 2 * Math.PI * r;

  return (
    <Card title="SEO Score">
      <div className="flex flex-col items-center">
        <div className="relative h-36 w-36">
          <svg viewBox="0 0 120 120" className="h-full w-full -rotate-90">
            <circle cx="60" cy="60" r={r} fill="none" stroke="#ffedd5" strokeWidth="10" />
            <circle cx="60" cy="60" r={r} fill="none" stroke={color} strokeWidth="10" strokeLinecap="round"
              strokeDasharray={c} strokeDashoffset={c - (score / 100) * c}
              style={{ transition: "stroke-dashoffset .5s" }} />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-3xl font-bold" style={{ color }}>{score}</span>
            <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">out of 100</span>
          </div>
        </div>
        <span className="mt-3 rounded-full border px-3 py-0.5 text-[11px] font-bold"
          style={{ color, borderColor: `${color}55`, backgroundColor: `${color}14` }}>
          {label}
        </span>
      </div>

      <div className="mt-5 flex items-center justify-between">
        <p className="text-[11px] font-semibold text-slate-500">SEO Improvement Tips</p>
        <p className="text-[11px] font-bold text-orange-600">{tips.length} remaining</p>
      </div>

      {tips.length === 0 ? (
        <p className="mt-3 flex items-center gap-2 rounded-lg bg-emerald-50 px-3 py-2 text-xs font-semibold text-emerald-700">
          <CheckCircle2 className="h-4 w-4" /> Sab kuch perfect hai!
        </p>
      ) : (
        <ul className="mt-2 space-y-2">
          {visible.map((t) => (
            <li key={t} className="flex items-start gap-2 rounded-lg border border-orange-100 bg-orange-50/50 px-3 py-2 text-xs text-slate-700">
              <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0 text-amber-500" /> {t}
            </li>
          ))}
        </ul>
      )}

      {tips.length > 5 && (
        <button type="button" onClick={() => setShowAll((v) => !v)}
          className="mt-3 w-full rounded-lg border border-orange-200 bg-orange-50 py-2 text-xs font-bold text-orange-700 transition hover:bg-orange-100">
          {showAll ? "Show less" : `+ ${tips.length - 5} more suggestions (Click to view all)`}
        </button>
      )}
    </Card>
  );
}
