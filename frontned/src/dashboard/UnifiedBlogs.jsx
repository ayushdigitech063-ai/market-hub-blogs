import React, { useState, useEffect, useMemo } from "react";
import { Search, Pencil, Trash2, Plus } from "lucide-react";
import { API, authFetch } from "./config";
import { uniqueOptions } from "./fields";
import PostEditor from "./editor/PostEditor";
import {
  emptyPost, biographyConfig, brandConfig, slidingCompanyConfig,
  latestArticleConfig, articleConfig, companyConfig, buildBlogArticleConfig,
} from "./postConfigs";
import { toLocalInput } from "./seo/seoUtils";

// Ek hi blog page: category dropdown se type select hota hai
export const BLOG_TYPES = [
  { key: "biographies", label: "Biography", badge: "bg-orange-50 text-orange-700" },
  { key: "brands", label: "Brand", badge: "bg-sky-50 text-sky-700" },
  { key: "slidingCompanies", label: "Sliding Company", badge: "bg-violet-50 text-violet-700" },
  { key: "latestArticles", label: "Latest Article", badge: "bg-teal-50 text-teal-700" },
  { key: "articles", label: "Company Related Article", badge: "bg-rose-50 text-rose-700" },
  { key: "blogArticles", label: "Author Article", badge: "bg-lime-50 text-lime-700" },
  { key: "companies", label: "Company", badge: "bg-amber-50 text-amber-700" },
];
export const BLOG_KEYS = BLOG_TYPES.map((t) => t.key);
const META_OF = Object.fromEntries(BLOG_TYPES.map((t) => [t.key, t]));

const selectClass =
  "w-full rounded-lg border border-orange-200 bg-white px-3 py-2 text-[13px] text-slate-800 outline-none transition focus:border-orange-400 focus:ring-2 focus:ring-orange-300/40 disabled:cursor-not-allowed disabled:bg-orange-50 disabled:text-slate-500";

// Naya form: type badalne par common fields (title, content, seo...) carry ho jate hain
const newForm = (cfg, prev) => {
  const base = {
    ...emptyPost,
    ...cfg.extraDefaults,
    publishDate: toLocalInput(),
    seo: { ...emptyPost.seo },
  };
  if (!prev) return base;
  const carry = {};
  Object.keys(emptyPost).forEach((k) => {
    if (k !== "category" && k !== "seo") carry[k] = prev[k];
  });
  return { ...base, ...carry, seo: prev.seo || base.seo };
};

export default function UnifiedBlogs({ type, setType, counts, notify, setCount }) {
  const [data, setData] = useState(() =>
    Object.fromEntries(BLOG_KEYS.map((k) => [k, []]))
  );
  const [authors, setAuthors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [view, setView] = useState("list");
  const [activeType, setActiveType] = useState("biographies");
  const [editingKey, setEditingKey] = useState(null);
  const [form, setForm] = useState(null);
  const [saving, setSaving] = useState(false);

  // Author Article ka config authors par depend karta hai
  const configs = useMemo(() => {
    const companyOptions = data.companies.map((c) => ({ value: c.slug, label: c.name }));
    return {
      biographies: biographyConfig,
      brands: brandConfig,
      slidingCompanies: slidingCompanyConfig,
      latestArticles: latestArticleConfig,
      // Company Article: company ek dropdown se select hoti hai
      articles: {
        ...articleConfig,
        singular: "Company Article",
        extraFields: articleConfig.extraFields.map((f) =>
          f.name === "company"
            ? {
                ...f,
                label: "Company",
                type: "select",
                options: companyOptions,
                placeholder: "Select a company (optional)",
               hint: "The article will appear in the Related Articles section on the page of the company you select.",
              }
            : f
        ),
      },
      // Company form me Start/End Article ID ab nahi aati
      companies: { ...companyConfig, extraFields: [] },
      blogArticles: buildBlogArticleConfig(authors),
    };
  }, [authors, data.companies]);

  const editing = editingKey !== null;
  const cfg = configs[activeType];

  const fetchType = async (k) => {
    try {
      const res = await authFetch(configs[k].listUrl);
      const d = await res.json();
      setData((p) => ({ ...p, [k]: Array.isArray(d) ? d : [] }));
    } catch (err) {
      console.error(`Error fetching ${configs[k].singular}:`, err);
    }
  };

  const fetchAuthors = () =>
    authFetch(`${API}/blog-authors`)
      .then((r) => r.json())
      .then((d) => setAuthors(Array.isArray(d) ? d : []))
      .catch((err) => console.error("Error fetching authors:", err));

  useEffect(() => {
    Promise.all(BLOG_KEYS.map(fetchType)).finally(() => setLoading(false));
    fetchAuthors();
  }, []);

  // Sidebar / Overview ke counts update
  useEffect(() => {
    BLOG_KEYS.forEach((k) => setCount(k)(data[k].length));
  }, [data]);

  const categories = useMemo(
    () => uniqueOptions(data[activeType].map((i) => i.category)),
    [data, activeType]
  );

  const openCreate = () => {
    fetchAuthors();
    const t = BLOG_KEYS.includes(type) ? type : "biographies";
    setActiveType(t);
    setEditingKey(null);
    setForm(newForm(configs[t]));
    setView("edit");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const openEdit = (t, item) => {
    fetchAuthors();
    setActiveType(t);
    setEditingKey(configs[t].getKey(item));
    setForm(configs[t].toForm(item));
    setView("edit");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const closeEditor = () => {
    setView("list");
    setEditingKey(null);
    setForm(null);
  };

  const changeType = (t) => {
    if (t === "blogArticles") fetchAuthors();
    setActiveType(t);
    setForm((prev) => newForm(configs[t], prev));
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!form.category.trim()) {
      notify("Category select karo.", "error");
      return;
    }
    setSaving(true);
    try {
      const res = await authFetch(editing ? cfg.updateUrl(editingKey) : cfg.createUrl, {
        method: editing ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(cfg.toPayload(form, data[activeType])),
      });
      if (res.ok) {
        notify(editing ? `${cfg.singular} updated successfully!` : `${cfg.singular} saved successfully!`);
        const saved = activeType;
        closeEditor();
        fetchType(saved);
      } else {
        let msg = "Operation failed! Please check backend.";
        try {
          const d = await res.json();
          if (d.error) msg = d.error;
        } catch (_) {}
        notify(msg, "error");
      }
    } catch (err) {
      console.error("Error saving data:", err);
      notify("Unable to connect to the server.", "error");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (t, item) => {
    const c = configs[t];
    if (!window.confirm(`Are you sure you want to delete this ${c.singular}?`)) return;
    try {
      const res = await authFetch(c.deleteUrl(c.getKey(item)), { method: "DELETE" });
      if (res.ok) {
        setData((p) => ({ ...p, [t]: p[t].filter((i) => c.getKey(i) !== c.getKey(item)) }));
        notify(`${c.singular} deleted successfully!`);
      } else {
        notify("Delete failed!", "error");
      }
    } catch (err) {
      console.error("Error deleting:", err);
      notify("Unable to connect to the server.", "error");
    }
  };

  const entries = useMemo(() => {
    const q = search.trim().toLowerCase();
    const keys = BLOG_KEYS.includes(type) ? [type] : BLOG_KEYS;
    return keys
      .flatMap((k) => data[k].map((item) => ({ t: k, item })))
      .filter(({ t, item }) => {
        if (!q) return true;
        const r = configs[t].getRow(item);
        return `${r.title} ${r.subtitle}`.toLowerCase().includes(q);
      });
  }, [data, type, search, configs]);

  const total = BLOG_KEYS.reduce((s, k) => s + data[k].length, 0);

  /* ---------------- EDITOR VIEW ---------------- */
  if (view === "edit" && form) {
    return (
      <div>
        <div className="mb-4 flex flex-col gap-3 rounded-xl border border-orange-100 bg-white px-5 py-4 sm:flex-row sm:items-center">
          <div className="sm:w-64">
            <label className="mb-1 block text-xs font-semibold text-slate-600">
              Post Category <span className="text-orange-500">*</span>
            </label>
            <select
              value={activeType}
              disabled={editing}
              onChange={(e) => changeType(e.target.value)}
              className={selectClass}
            >
              {BLOG_TYPES.map((t) => (
                <option key={t.key} value={t.key}>{t.label}</option>
              ))}
            </select>
          </div>
          <p className="text-[11px] text-slate-400">
  {editing
    ? "The category cannot be changed while editing."
    : "Select a category to update the additional fields below accordingly. The title, content, and SEO settings remain the same."}
</p>
        </div>

        <PostEditor
          key={activeType}
          config={cfg}
          form={form}
          setForm={setForm}
          editing={editing}
          saving={saving}
          categories={categories}
          onSave={handleSave}
          onCancel={closeEditor}
        />
      </div>
    );
  }

  /* ---------------- LIST VIEW ---------------- */
  return (
    <div className="space-y-5">
      <div className="flex flex-col items-start justify-between gap-3 rounded-xl border border-orange-100 bg-white px-5 py-4 sm:flex-row sm:items-center">
        <h2 className="text-sm font-bold text-slate-900">Do you want to add a new post?</h2>
        <button
          type="button"
          onClick={openCreate}
          className="inline-flex items-center gap-1.5 rounded-lg bg-orange-500 px-4 py-2 text-xs font-semibold text-white shadow-sm transition hover:bg-orange-600"
        >
          <Plus className="h-3.5 w-3.5" /> Add New Post
        </button>
      </div>

      <div className="rounded-xl border border-orange-100 bg-white p-5 md:p-6">
        <div className="mb-5 flex flex-col gap-3 border-b border-orange-100 pb-5 lg:flex-row lg:items-center lg:justify-between">
          <h2 className="text-sm font-bold text-slate-900">
            Manage Existing ({entries.length}{BLOG_KEYS.includes(type) ? ` of ${total}` : ""})
          </h2>
          <div className="flex w-full flex-col gap-2 sm:flex-row lg:w-auto">
            <select
              value={BLOG_KEYS.includes(type) ? type : "all"}
              onChange={(e) => setType(e.target.value)}
              className={`${selectClass} sm:w-56`}
            >
              <option value="all">All Categories ({total})</option>
              {BLOG_TYPES.map((t) => (
                <option key={t.key} value={t.key}>{t.label} ({counts[t.key] ?? 0})</option>
              ))}
            </select>
            <div className="relative w-full sm:w-64">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-orange-400" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search..."
                className="w-full rounded-lg border border-orange-200 bg-white py-2 pl-9 pr-4 text-[13px] outline-none transition focus:border-orange-400 focus:ring-2 focus:ring-orange-300/40"
              />
            </div>
          </div>
        </div>

        {loading ? (
          <p className="py-8 text-center text-sm font-semibold text-slate-500">Loading...</p>
        ) : entries.length === 0 ? (
          <p className="py-8 text-center text-sm text-slate-500">
            {total === 0 ? "Abhi kuch nahi hai. Upar se pehla add karo!" : "No results match this search or category."}
          </p>
        ) : (
          <div className="divide-y divide-orange-100">
            {entries.map(({ t, item }) => {
              const c = configs[t];
              const row = c.getRow(item);
              const draft = item.status === "draft";
              const tm = META_OF[t];
              return (
                <div
                  key={`${t}:${c.getKey(item)}`}
                  className="flex flex-col items-start justify-between gap-4 px-2 py-3 transition hover:bg-orange-50/60 sm:flex-row sm:items-center sm:rounded-lg"
                >
                  <div className="flex min-w-0 items-center gap-4">
                    <img
                      src={row.image || "https://via.placeholder.com/150"}
                      alt={row.title}
                      className="h-11 w-11 shrink-0 rounded-lg border border-orange-100 object-cover"
                    />
                    <div className="min-w-0">
                      <h3 className="flex items-center gap-2 truncate text-sm font-semibold text-slate-900">
                        <span className="truncate">{row.title}</span>
                        <span className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-bold ${tm.badge}`}>
                          {tm.label}
                        </span>
                        <span
                          className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-bold ${
                            draft ? "bg-slate-100 text-slate-500" : "bg-emerald-50 text-emerald-700"
                          }`}
                        >
                          {draft ? "Draft" : "Published"}
                        </span>
                      </h3>
                      <p className="truncate text-xs text-slate-500">{row.subtitle}</p>
                    </div>
                  </div>
                  <div className="flex w-full justify-end gap-2 sm:w-auto">
                    <button
                      onClick={() => openEdit(t, item)}
                      className="inline-flex items-center gap-1.5 rounded-lg bg-amber-100 px-3 py-1.5 text-xs font-semibold text-amber-800 transition hover:bg-amber-200"
                    >
                      <Pencil className="h-3.5 w-3.5" /> Edit
                    </button>
                    <button
                      onClick={() => handleDelete(t, item)}
                      className="inline-flex items-center gap-1.5 rounded-lg bg-rose-50 px-3 py-1.5 text-xs font-semibold text-rose-700 transition hover:bg-rose-100"
                    >
                      <Trash2 className="h-3.5 w-3.5" /> Delete
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}