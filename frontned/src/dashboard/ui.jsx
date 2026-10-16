import React from "react";

const SCROLL_CSS = `
html{scrollbar-width:thin;scrollbar-color:#fdba74 #fff7ed}
::-webkit-scrollbar{width:8px;height:8px}
::-webkit-scrollbar-track{background:#fff7ed}
::-webkit-scrollbar-thumb{background:#fdba74;border-radius:8px}
::-webkit-scrollbar-thumb:hover{background:#fb923c}
.nav-scroll{scrollbar-width:none}
.nav-scroll::-webkit-scrollbar{display:none}
@keyframes modalPop{from{opacity:0;transform:translateY(14px) scale(.98)}to{opacity:1;transform:none}}
.modal-pop{animation:modalPop .2s ease-out}
`;
export const GlobalStyle = () => <style>{SCROLL_CSS}</style>;

export const inputClass =
  "w-full rounded-lg border border-orange-200 bg-white px-3 py-2 text-[13px] text-slate-800 placeholder-slate-400 outline-none transition focus:border-orange-400 focus:ring-2 focus:ring-orange-300/40 disabled:cursor-not-allowed disabled:bg-orange-50 disabled:text-slate-400";

export function Toast({ toast }) {
  if (!toast) return null;
  const color = toast.type === "error" ? "bg-rose-600" : "bg-orange-500";
  return (
    <div className={`fixed right-5 top-5 z-[90] rounded-lg px-4 py-2.5 text-xs font-semibold text-white shadow-lg ${color}`}>
      {toast.msg}
    </div>
  );
}

export function PageHeader({ meta, count }) {
  return (
    <div className="mb-6 flex flex-wrap items-end justify-between gap-3 border-b border-orange-100 pb-5">
      <div>
        <p className="text-xs font-semibold text-orange-600">{meta.group}</p>
        <h1 className="mt-0.5 text-xl font-bold tracking-tight text-slate-900">{meta.title}</h1>
        <p className="mt-0.5 text-xs text-slate-500">{meta.desc}</p>
      </div>
      <div className="rounded-lg border border-orange-100 bg-white px-4 py-2 text-center">
        <p className="text-lg font-bold leading-tight text-orange-600">{count}</p>
        <p className="text-[10px] font-medium text-slate-400">Total</p>
      </div>
    </div>
  );
}


export function Card({ title, icon: Icon, right, children, className = "" }) {
  return (
    <div className={`rounded-xl border border-orange-100 bg-white p-4 sm:p-5 ${className}`}>
      {(title || right) && (
        <div className="mb-4 flex items-center justify-between gap-2">
          <h3 className="flex items-center gap-2 text-sm font-bold text-slate-900">
            {Icon && <Icon className="h-4 w-4 text-orange-500" />} {title}
          </h3>
          {right}
        </div>
      )}
      {children}
    </div>
  );
}

export function MiniBtn({ children, className = "", ...props }) {
  return (
    <button type="button" {...props}
      className={`inline-flex items-center gap-1 rounded-md border border-orange-200 bg-white px-2 py-1 text-[11px] font-semibold text-orange-600 transition hover:bg-orange-50 ${className}`}>
      {children}
    </button>
  );
}
