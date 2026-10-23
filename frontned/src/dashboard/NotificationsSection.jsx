import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Check, X, Eye } from "lucide-react";
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
  const loadingRef = useRef(false);

  const configs = useMemo(() => buildConfigs({ authors }), [authors]);

  const setItemError = (id, msg) => setItemErrors((x) => ({ ...x, [id]: msg }));

  const load = useCallback(async () => {
    // Prevent overlapping requests from initial load + interval refresh.
    if (loadingRef.current) return;
    loadingRef.current = true;

    try {
      const res = await authFetch(`${API}/submissions`);
      if (!res.ok) throw new Error("Could not load submissions.");
      const data = await res.json();
      setList(Array.isArray(data) ? data : []);
      setError("");
    } catch {
      setError("Could not load submissions.");
    } finally {
      setLoading(false);
      loadingRef.current = false;
    }
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

  const refreshCounts = () => {
    window.dispatchEvent(new Event("submissions-changed"));
  };

  // Allow / Reject ke baad user ko mail
  const notifyDecision = (id) =>
    authFetch(`${API}/otp/decision`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    }).catch(() => {});

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
      // Update this row immediately; avoid waiting for another full-list request.
      setList((current) =>
        current.map((item) =>
          item._id === s._id ? { ...item, status: "approved" } : item
        )
      );
      refreshCounts();
      // Email notification is background work and should not delay the UI.
      void notifyDecision(s._id);
    } catch (err) {
      setItemError(s._id, err.message);
    } finally {
      setBusyId(null);
    }
  };

  const reject = async (s) => {
    const previousStatus = s.status;

    setBusyId(s._id);
    setItemError(s._id, "");

    // Optimistic UI: show rejection immediately while the server saves it.
    setList((current) =>
      current.map((item) =>
        item._id === s._id ? { ...item, status: "rejected" } : item
      )
    );

    try {
      const res = await authFetch(`${API}/submissions/${s._id}/reject`, {
        method: "PUT",
      });
      if (!res.ok) throw new Error("Reject failed");

      refreshCounts();
      void notifyDecision(s._id);
    } catch (err) {
      setList((current) =>
        current.map((item) =>
          item._id === s._id ? { ...item, status: previousStatus } : item
        )
      );
      setItemError(s._id, err.message || "Reject failed");
    } finally {
      setBusyId(null);
    }
  };

  const viewing = openId ? list.find((s) => s._id === openId) : null;
  const vf = viewing?.form || {};
  const detailRows = viewing
    ? [
        ["Name", viewing.name],
        ["Email", viewing.email],
        ["Address", viewing.address],
        ["Post type", TYPE_META[viewing.postType]?.label],
        ["Category", viewing.category],
        ["Role", vf.role],
        ["Slug", vf.slug],
        ["Submitted on", viewing.createdAt ? new Date(viewing.createdAt).toLocaleString("en-IN") : ""],
      ].filter(([, v]) => v)
    : [];

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
                      </div>
                    </div>

                    <div className="flex shrink-0 flex-col gap-2 sm:w-56">
                      {s.status !== "approved" && needsAuthor && (
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
                      {s.status !== "approved" && (
                        <div className="flex gap-2">
                          <button
                            disabled={busyId === s._id || (needsAuthor && !picked[s._id])}
                            onClick={() => approve(s)}
                            className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-lg bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-700 transition hover:bg-emerald-100 disabled:opacity-50"
                          >
                            {busyId === s._id ? (
                              <><span className="h-3 w-3 animate-spin rounded-full border-2 border-emerald-700/30 border-t-emerald-700" /> Publishing...</>
                            ) : (
                              <><Check className="h-3.5 w-3.5" /> Allow</>
                            )}
                          </button>
                          {s.status === "pending" && (
                            <button
                              disabled={busyId === s._id}
                              onClick={() => reject(s)}
                              className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-lg bg-rose-50 px-3 py-1.5 text-xs font-semibold text-rose-700 transition hover:bg-rose-100 disabled:opacity-50"
                            >
                              {busyId === s._id ? (
                                <><span className="h-3 w-3 animate-spin rounded-full border-2 border-rose-700/30 border-t-rose-700" /> Rejecting...</>
                              ) : (
                                <><X className="h-3.5 w-3.5" /> Reject</>
                              )}
                            </button>
                          )}
                        </div>
                      )}
                      <button
                        onClick={() => setOpenId(s._id)}
                        className="inline-flex items-center justify-center gap-1.5 rounded-lg bg-orange-50 px-3 py-1.5 text-xs font-semibold text-orange-600 transition hover:bg-orange-100"
                      >
                        <Eye className="h-3.5 w-3.5" /> View
                      </button>
                    </div>
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
                </div>
              );
            })}
          </div>
        )}
      </div>

      {viewing &&
        createPortal(
          <div
            className="fixed inset-0 z-[120] flex items-start justify-center overflow-y-auto bg-stone-900/60 p-3 backdrop-blur-sm sm:p-6"
            onClick={() => setOpenId(null)}
          >
            <div
              className="relative my-4 w-full max-w-3xl rounded-2xl bg-white p-5 shadow-2xl sm:p-6"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                type="button"
                onClick={() => setOpenId(null)}
                aria-label="Close"
                className="absolute right-3 top-3 flex h-8 w-8 items-center justify-center rounded-full bg-orange-50 text-slate-600 transition hover:bg-amber-100"
              >
                <X className="h-4 w-4" />
              </button>

              <div className="flex gap-3 pr-10">
                {vf.image && (
                  <img src={vf.image} alt="" className="h-16 w-16 shrink-0 rounded-xl border border-orange-100 object-cover" />
                )}
                <div className="min-w-0">
                  <h3 className="text-lg font-extrabold text-slate-900">{viewing.title}</h3>
                  <div className="mt-1 flex flex-wrap gap-2">
                    {TYPE_META[viewing.postType] && (
                      <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${TYPE_META[viewing.postType].badge}`}>
                        {TYPE_META[viewing.postType].label}
                      </span>
                    )}
                    <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${(STATUS[viewing.status] || STATUS.pending).cls}`}>
                      {(STATUS[viewing.status] || STATUS.pending).label}
                    </span>
                  </div>
                </div>
              </div>

              <div className="mt-5 rounded-xl border border-orange-100 bg-orange-50/40 p-4">
                <p className="mb-3 text-xs font-extrabold uppercase tracking-wider text-orange-600">User Details</p>
                <dl className="grid gap-x-6 gap-y-3 sm:grid-cols-2">
                  {detailRows.map(([label, value]) => (
                    <div key={label} className="min-w-0">
                      <dt className="text-[11px] font-semibold text-slate-500">{label}</dt>
                      <dd className="break-words text-sm font-semibold text-slate-900">{value}</dd>
                    </div>
                  ))}
                </dl>
                {vf.excerpt && (
                  <div className="mt-3">
                    <dt className="text-[11px] font-semibold text-slate-500">Summary</dt>
                    <dd className="text-sm text-slate-700">{vf.excerpt}</dd>
                  </div>
                )}
              </div>

              <p className="mb-2 mt-5 text-xs font-extrabold uppercase tracking-wider text-orange-600">Blog Content</p>
              <div
                className="max-h-[50vh] overflow-y-auto rounded-xl border border-orange-100 p-4 text-sm text-slate-700 [&_a]:text-orange-600 [&_h2]:mb-2 [&_h2]:text-base [&_h2]:font-bold [&_h3]:mb-2 [&_h3]:font-bold [&_img]:max-w-full [&_ol]:list-decimal [&_ol]:pl-5 [&_p]:mb-2 [&_ul]:list-disc [&_ul]:pl-5"
                dangerouslySetInnerHTML={{ __html: vf.contentHtml || "" }}
              />
            </div>
          </div>,
          document.body
        )}
    </div>
  );
}