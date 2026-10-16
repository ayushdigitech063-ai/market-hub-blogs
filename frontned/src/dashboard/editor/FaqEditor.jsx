import React from "react";
import { HelpCircle, Plus, Trash2 } from "lucide-react";
import { Card, inputClass } from "../ui";

function Toggle({ checked, onChange, label }) {
  return (
    <button type="button" role="switch" aria-checked={checked} onClick={() => onChange(!checked)}
      className="inline-flex items-center gap-2 text-xs font-semibold text-slate-600">
      <span className={`relative h-5 w-9 rounded-full transition ${checked ? "bg-orange-500" : "bg-slate-300"}`}>
        <span className={`absolute top-0.5 h-4 w-4 rounded-full bg-white shadow transition-all ${checked ? "left-[18px]" : "left-0.5"}`} />
      </span>
      {label}
    </button>
  );
}
export { Toggle };


export default function FaqEditor({ enabled, faqs, onToggle, onChange }) {
  const update = (i, key, val) => onChange(faqs.map((f, idx) => (idx === i ? { ...f, [key]: val } : f)));

  return (
    <Card title="FAQ Section" icon={HelpCircle}
      right={<Toggle checked={enabled} onChange={onToggle} label={enabled ? "Enabled" : "Disabled"} />}>
      {!enabled ? (
        <p className="text-xs text-slate-500">
        Toggle on to display the FAQ accordion below the article (Google FAQ schema will also be attached automatically)        </p>
      ) : (
        <div className="space-y-3">
          {faqs.map((f, i) => (
            <div key={i} className="rounded-lg border border-orange-100 bg-orange-50/40 p-3">
              <div className="mb-2 flex items-center justify-between">
                <p className="text-[11px] font-bold text-orange-700">FAQ #{i + 1}</p>
                <button type="button" onClick={() => onChange(faqs.filter((_, idx) => idx !== i))}
                  className="inline-flex items-center gap-1 rounded-md bg-rose-50 px-2 py-1 text-[11px] font-semibold text-rose-700 hover:bg-rose-100">
                  <Trash2 className="h-3 w-3" /> Remove
                </button>
              </div>
           <input 
  value={f.q} 
  onChange={(e) => update(i, "q", e.target.value)}
  placeholder="Write question..." 
  className={`${inputClass} mb-2`} 
/>
<textarea 
  value={f.a} 
  onChange={(e) => update(i, "a", e.target.value)} 
  rows={3}
  placeholder="Write answer..." 
  className={inputClass} 
/>
            </div>
          ))}
          <button type="button" onClick={() => onChange([...faqs, { q: "", a: "" }])}
            className="inline-flex items-center gap-1.5 rounded-lg bg-orange-500 px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-orange-600">
            <Plus className="h-3.5 w-3.5" /> Add FAQ
          </button>
        </div>
      )}
    </Card>
  );
}
