import React, { useCallback, useEffect, useMemo, useState } from "react";
import { Check, X, ChevronDown, ChevronUp } from "lucide-react";
import { API, authFetch } from "./config";
import { inputClass } from "./ui";
import { BLOG_TYPES } from "./UnifiedBlogs";
import { buildConfigs } from "./submissionConfigs";


export function usePendingCount() {
  const [count, setCount] = useState(0);

  useEffect(() => {
    const load = () =>
      authFetch(`${API}/submissions/count`)
        .then((r) => r.json())
        .then((d) => setCount(Number(d.pending) || 0))
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

const STATUS = {
  pending: { label: "Pending", cls: "bg-amber-50 text-amber-700" },
  approved: { label: "Approved", cls: "bg-emerald-50 text-emerald-700" },
  rejected: { label: "Rejected", cls: "bg-rose-50 text-rose-700" },
};
const TABS = [
  { key: "all", label: "All" },
  { key: "pending", label: "Pending" },
  { key: "approved", label: "Approved" },
  { key: "rejected", label: "Rejected" },
];
const TYPE_META = Object.fromEntries(BLOG_TYPES.map((t) => [t.key, t]));

export default function NotificationsSection() {
  const [list, setList] = useState([]);
  const [authors, setAuthors] = useState([]);
  const [tab, setTab] = useState("all");
  const [openId, setOpenId] = useState(null);
  const [picked, setPicked] = useState({});
  const [busyId, setBusyId] = useState(null);
  const [error, setError] = useState("");
  const [itemErrors, setItemErrors] = useState({});
  const [loading, setLoading] = useState(true);

  const configs = useMemo(() => buildConfigs({ authors }), [authors]);

  // Allow/Reject ka error us blog ke card me hi dikhta hai
  const setItemError = (id, msg) => setItemErrors((x) => ({ ...x, [id]: msg }));

  const load = useCallback(() => {
    authFetch(`${API}/submissions`)
      .then((r) => r.json())
      .then((d) => setList(Array.isArray(d) ? d : []))
      .catch(() => setError("Could not load submissions."))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    load();
    authFetch(`${API}/blog-authors`)
      .then((r) => r.json())
      .then((d) => setAuthors(Array.isArray(d) ? d : []))
      .catch(() => {});
    const t = setInterval(load, 30000);
    return () => clearInterval(t);
  }, [load]);

  const counts = useMemo(
    () => ({
      all: list.length,
      pending: list.filter((s) => s.status === "pending").length,
      approved: list.filter((s) => s.status === "approved").length,
      rejected: list.filter((s) => s.status === "rejected").length,
    }),
    [list]
  );
  const visible = tab === "all" ? list : list.filter((s) => s.status === tab);

  const refresh = () => {
    load();
    window.dispatchEvent(new Event("submissions-changed"));
  };

  // Allow: admin panel wahi payload banata hai jo normally save par banta, phir sahi collection me save
  const approve = async (s) => {
    setBusyId(s._id);
    setItemError(s._id, "");
    try {
      const cfg = configs[s.postType];
      if (!cfg || !s.form) throw new Error("This submission is in an old format. Please reject it.");
      const isAuthorArticle = s.postType === "blogArticles";
      if (isAuthorArticle && !picked[s._id]) throw new Error("Please select an author.");

      const listRes = await authFetch(cfg.listUrl);
      const items = await listRes.json().catch(() => []);

      const form = {
        ...s.form,
        status: "published",
        featured: s.postType === "brands",
        ...(isAuthorArticle ? { authorId: picked[s._id] } : {}),
      };
      const res = await authFetch(cfg.createUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(cfg.toPayload(form, Array.isArray(items) ? items : [])),
      });
      if (!res.ok) {
        const d = await res.json().catch(() => ({}));
        throw new Error(d.error || "Could not publish this post.");
      }

      const mark = await authFetch(`${API}/submissions/${s._id}/approve`, { method: "PUT" });
      if (!mark.ok) throw new Error("Post published, but status could not be updated.");
      refresh();
    } catch (err) {
      setItemError(s._id, err.message);
    } finally {
      setBusyId(null);
    }
  };

  const reject = async (s) => {
    setBusyId(s._id);
    setItemError(s._id, "");
    try {
      const res = await authFetch(`${API}/submissions/${s._id}/reject`, { method: "PUT" });
      if (!res.ok) throw new Error("Reject failed");
      refresh();
    } catch (err) {
      setItemError(s._id, err.message);
    } finally {
      setBusyId(null);
    }
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap gap-2 rounded-xl border border-orange-100 bg-white p-3">
        {TABS.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition ${
              tab === t.key ? "bg-orange-500 text-white" : "bg-orange-50 text-slate-600 hover:bg-orange-100"
            }`}
          >
            {t.label} ({counts[t.key]})
          </button>
        ))}
      </div>

      {error && (
        <p className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-xs font-semibold text-rose-700">{error}</p>
      )}

      <div className="rounded-xl border border-orange-100 bg-white p-5">
        {loading ? (
          <p className="py-8 text-center text-sm font-semibold text-slate-500">Loading...</p>
        ) : visible.length === 0 ? (
          <p className="py-8 text-center text-sm text-slate-500">No submissions here.</p>
        ) : (
          <div className="divide-y divide-orange-100">
            {visible.map((s) => {
              const f = s.form || {};
              const st = STATUS[s.status] || STATUS.pending;
              const tm = TYPE_META[s.postType];
              const open = openId === s._id;
              const needsAuthor = s.postType === "blogArticles";
              return (
                <div key={s._id} className="py-4">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <div className="flex min-w-0 gap-3">
                      {f.image && (
                        <img src={f.image} alt="" className="h-14 w-14 shrink-0 rounded-lg border border-orange-100 object-cover" />
                      )}
                      <div className="min-w-0">
                        <p className="flex flex-wrap items-center gap-2 text-sm font-bold text-slate-900">
                          <span className="truncate">{s.title}</span>
                          {tm && (
                            <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${tm.badge}`}>{tm.label}</span>
                          )}
                          <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${st.cls}`}>{st.label}</span>
                        </p>
                        <p className="mt-0.5 text-xs text-slate-500">
                          {s.name} · {s.email}
                          {s.category ? ` · ${s.category}` : ""} · {new Date(s.createdAt).toLocaleString("en-IN")}
                        </p>
                        {f.excerpt && <p className="mt-1.5 line-clamp-2 text-xs text-slate-600">{f.excerpt}</p>}
                        <button
                          onClick={() => setOpenId(open ? null : s._id)}
                          className="mt-1.5 inline-flex items-center gap-1 text-xs font-semibold text-orange-600"
                        >
                          {open ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
                          {open ? "Hide content" : "View content"}
                        </button>
                      </div>
                    </div>

                    {s.status !== "approved" && (
                      <div className="flex shrink-0 flex-col gap-2 sm:w-56">
                        {needsAuthor && (
                          <select
                            value={picked[s._id] || ""}
                            onChange={(e) => setPicked((x) => ({ ...x, [s._id]: e.target.value }))}
                            className={inputClass}
                          >
                            <option value="">Select author to publish under</option>
                            {authors.map((a) => (
                              <option key={a.id} value={a.id}>{a.name}</option>
                            ))}
                          </select>
                        )}
                        <div className="flex gap-2">
                          <button
                            disabled={busyId === s._id || (needsAuthor && !picked[s._id])}
                            onClick={() => approve(s)}
                            className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-lg bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-700 transition hover:bg-emerald-100 disabled:opacity-50"
                          >
                            <Check className="h-3.5 w-3.5" /> Allow
                          </button>
                          {s.status === "pending" && (
                            <button
                              disabled={busyId === s._id}
                              onClick={() => reject(s)}
                              className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-lg bg-rose-50 px-3 py-1.5 text-xs font-semibold text-rose-700 transition hover:bg-rose-100 disabled:opacity-50"
                            >
                              <X className="h-3.5 w-3.5" /> Reject
                            </button>
                          )}
                        </div>
                      </div>
                    )}
                  </div>

                  {itemErrors[s._id] && s.status !== "approved" && (
                    <div className="mt-3 flex flex-wrap items-center justify-between gap-2 rounded-lg border border-rose-200 bg-rose-50 px-3 py-2">
                      <p className="text-xs font-semibold text-rose-700">{itemErrors[s._id]}</p>
                      <button
                        disabled={busyId === s._id}
                        onClick={() => reject(s)}
                        className="rounded-lg bg-rose-600 px-3 py-1 text-xs font-bold text-white transition hover:bg-rose-700 disabled:opacity-50"
                      >
                        {s.status === "rejected" ? "Keep rejected" : "Reject this post"}
                      </button>
                    </div>
                  )}

                  {open && (
                    // contentHtml backend par sanitize hoke save hota hai, isliye yaha render karna safe hai
                    <div
                      className="mt-3 max-h-96 overflow-y-auto rounded-lg border border-orange-100 bg-orange-50/30 p-4 text-sm text-slate-700 [&_a]:text-orange-600 [&_h2]:mb-2 [&_h2]:text-base [&_h2]:font-bold [&_h3]:mb-2 [&_h3]:font-bold [&_img]:max-w-full [&_ol]:list-decimal [&_ol]:pl-5 [&_p]:mb-2 [&_ul]:list-disc [&_ul]:pl-5"
                      dangerouslySetInnerHTML={{ __html: f.contentHtml || "" }}
                    />
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}