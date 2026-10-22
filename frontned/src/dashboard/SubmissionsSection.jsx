import React, { useEffect, useState, useCallback } from "react";
import { Check, X, Bell } from "lucide-react";
import { API, authFetch } from "./config";
import { Card } from "./ui";


export function usePendingCount() {
  const [count, setCount] = useState(0);

  useEffect(() => {
    const load = () =>
      authFetch(`${API}/submissions?status=pending`)
        .then((r) => r.json())
        .then((d) => setCount(Array.isArray(d) ? d.length : 0))
        .catch(() => {});
    load();
    const t = setInterval(load, 30000);
    window.addEventListener("submissions-changed", load);
    return () => {
      clearInterval(t);
      window.removeEventListener("submissions-changed", load);
    };
  }, []);

  return count;
}

export default function SubmissionsSection() {
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState(null);
  const [error, setError] = useState("");

  const load = useCallback(() => {
    authFetch(`${API}/submissions?status=pending`)
      .then((r) => r.json())
      .then((d) => setList(Array.isArray(d) ? d : []))
      .catch(() => setError("Could not load submissions."))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    load();
    const t = setInterval(load, 30000);
    return () => clearInterval(t);
  }, [load]);

  const act = async (id, action) => {
    setBusyId(id);
    setError("");
    try {
      const res = await authFetch(`${API}/submissions/${id}/${action}`, { method: "PUT" });
      if (!res.ok) {
        const d = await res.json().catch(() => ({}));
        throw new Error(d.error || "Action failed");
      }
      setList((p) => p.filter((s) => s._id !== id));
      window.dispatchEvent(new Event("submissions-changed"));
    } catch (err) {
      setError(err.message);
    } finally {
      setBusyId(null);
    }
  };

  return (
    <Card title={`Blog Submissions (${list.length} pending)`}>
      {error && (
        <p className="mb-3 rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-xs font-semibold text-rose-700">{error}</p>
      )}

      {loading ? (
        <p className="py-6 text-center text-sm font-semibold text-slate-500">Loading...</p>
      ) : list.length === 0 ? (
        <p className="py-6 text-center text-sm text-slate-500">No pending blog submissions.</p>
      ) : (
        <div className="divide-y divide-orange-100">
          {list.map((s) => (
            <div key={s._id} className="flex flex-col gap-3 py-4 sm:flex-row sm:items-start sm:justify-between">
              <div className="min-w-0">
                <p className="flex items-center gap-2 text-sm font-bold text-slate-900">
                  <Bell className="h-3.5 w-3.5 shrink-0 text-orange-500" />
                  <span className="truncate">{s.title}</span>
                </p>
                <p className="mt-0.5 text-xs text-slate-500">
                  {s.name} · {s.email}
                  {s.category ? ` · ${s.category}` : ""} · {new Date(s.createdAt).toLocaleString("en-IN")}
                </p>
                <p className="mt-2 line-clamp-3 text-xs text-slate-600">{s.content}</p>
              </div>
              <div className="flex shrink-0 gap-2">
                <button
                  disabled={busyId === s._id}
                  onClick={() => act(s._id, "approve")}
                  className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-700 transition hover:bg-emerald-100 disabled:opacity-60"
                >
                  <Check className="h-3.5 w-3.5" /> Allow
                </button>
                <button
                  disabled={busyId === s._id}
                  onClick={() => act(s._id, "reject")}
                  className="inline-flex items-center gap-1.5 rounded-lg bg-rose-50 px-3 py-1.5 text-xs font-semibold text-rose-700 transition hover:bg-rose-100 disabled:opacity-60"
                >
                  <X className="h-3.5 w-3.5" /> Reject
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </Card>
  );
}