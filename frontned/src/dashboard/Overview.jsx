import React from "react";
import { ArrowRight, Database } from "lucide-react";
import { OVERVIEW_ITEMS, DONUT_COLORS } from "./constants";

export default function Overview({ counts, admin, goTo }) {
  const total = OVERVIEW_ITEMS.reduce((sum, i) => sum + (counts[i.key] || 0), 0);
  const max = Math.max(1, ...OVERVIEW_ITEMS.map((i) => counts[i.key] || 0));
  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";
  const today = new Date().toLocaleDateString("en-IN", {
    weekday: "long", day: "numeric", month: "long", year: "numeric",
  });
  const pct = (n) => (total ? Math.round((n / total) * 100) : 0);

  let acc = 0;
  const stops = total
    ? OVERVIEW_ITEMS.map((it, i) => {
        const n = counts[it.key] || 0;
        const start = (acc / total) * 100;
        acc += n;
        const end = (acc / total) * 100;
        return `${DONUT_COLORS[i]} ${start}% ${end}%`;
      }).join(", ")
    : "#fed7aa 0% 100%";

  const ranked = OVERVIEW_ITEMS
    .map((it, i) => ({ ...it, n: counts[it.key] || 0, color: DONUT_COLORS[i] }))
    .sort((a, b) => b.n - a.n);

  return (
    <div className="space-y-6">

      <div className="relative overflow-hidden rounded-2xl border border-orange-100 bg-gradient-to-br from-orange-50 via-amber-50/70 to-white p-5 sm:p-7">
        <div className="pointer-events-none absolute -right-12 -top-12 h-44 w-44 rounded-full bg-orange-200/30" />
        <div className="pointer-events-none absolute -bottom-16 right-28 h-36 w-36 rounded-full bg-amber-200/30" />

        <div className="relative flex flex-wrap items-center justify-between gap-5">
          <div className="min-w-0">
            <p className="inline-flex items-center gap-2 rounded-full border border-orange-100 bg-white px-3 py-1 text-[11px] font-medium text-orange-700">
              {greeting} 👋 <span className="text-orange-200">|</span> {today}
            </p>
            <h1 className="mt-3 text-xl font-bold tracking-tight text-slate-900 sm:text-2xl">
              Welcome back, {admin?.name || "Admin"}
            </h1>
           
          </div>

          <div className="flex gap-2.5">
            <div className="rounded-xl border border-orange-100 bg-white px-4 py-3 text-center">
              <p className="text-xl font-bold leading-none text-slate-900">{OVERVIEW_ITEMS.length}</p>
              <p className="mt-1.5 text-[10px] font-semibold uppercase tracking-wider text-slate-400">Sections</p>
            </div>
            <div className="flex items-center gap-3 rounded-xl border border-orange-100 bg-white px-4 py-3">
              <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-orange-50 text-orange-500">
                <Database className="h-[18px] w-[18px]" />
              </span>
              <div>
                <p className="text-xl font-bold leading-none text-orange-600">{total}</p>
                <p className="mt-1.5 text-[10px] font-semibold uppercase tracking-wider text-slate-400">Total Entries</p>
              </div>
            </div>
          </div>
        </div>
      </div>

    
      <div>
        <div className="mb-3">
          <h2 className="text-base font-bold text-slate-900">Content Overview</h2>
         
        </div>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {OVERVIEW_ITEMS.map(({ key, label, group, Icon }, i) => {
            const n = counts[key] ?? 0;
            const color = DONUT_COLORS[i];
            return (
              <button key={key} onClick={() => goTo(key)}
                className="group rounded-xl border border-orange-100 bg-white p-4 text-left transition hover:border-orange-200 hover:shadow-md hover:shadow-orange-100/60">
                <div className="flex items-start justify-between">
                  <span className="flex h-9 w-9 items-center justify-center rounded-lg"
                    style={{ backgroundColor: `${color}1a`, color }}>
                    <Icon className="h-[18px] w-[18px]" />
                  </span>
                  <ArrowRight className="h-3.5 w-3.5 text-orange-300 transition group-hover:translate-x-0.5 group-hover:text-orange-500" />
                </div>

                <p className="mt-3 text-2xl font-bold text-slate-900">{n}</p>
                <p className="text-[13px] font-semibold text-slate-700">{label}</p>
                <p className="text-[11px] text-slate-400">{group}</p>

                <div className="mt-3 flex items-center gap-2">
                  <div className="h-1 flex-1 overflow-hidden rounded-full bg-orange-50">
                    <div className="h-full rounded-full" style={{ width: `${pct(n)}%`, backgroundColor: color }} />
                  </div>
                  <span className="text-[10px] font-semibold text-slate-400">{pct(n)}%</span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      <div className="rounded-xl border border-orange-100 bg-white p-5 sm:p-6">
        <h2 className="text-base font-bold text-slate-900">Content Distribution</h2>


        <div className="grid items-center gap-8 lg:grid-cols-[180px_1fr]">
          <div className="mx-auto">
            <div className="relative h-40 w-40 rounded-full" style={{ background: `conic-gradient(${stops})` }}>
              <div className="absolute inset-[24%] flex flex-col items-center justify-center rounded-full bg-white">
                <p className="text-2xl font-bold leading-none text-slate-900">{total}</p>
                <p className="mt-1 text-[10px] font-semibold uppercase tracking-wider text-slate-400">Total</p>
              </div>
            </div>
          </div>

          <div className="space-y-2.5">
            {ranked.map(({ key, label, n, color }) => (
              <button key={key} onClick={() => goTo(key)}
                className="flex w-full items-center gap-3 rounded-lg px-2 py-1 text-left transition hover:bg-orange-50/60">
                <span className="h-2.5 w-2.5 shrink-0 rounded-full" style={{ backgroundColor: color }} />
                <p className="w-32 shrink-0 truncate text-xs font-medium text-slate-700">{label}</p>
                <div className="h-2 flex-1 overflow-hidden rounded-full bg-orange-50">
                  <div className="h-full rounded-full transition-all duration-700"
                    style={{ width: `${(n / max) * 100}%`, backgroundColor: color }} />
                </div>
                <p className="w-7 text-right text-xs font-bold text-slate-800">{n}</p>
                <p className="w-9 text-right text-[11px] text-slate-400">{pct(n)}%</p>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
