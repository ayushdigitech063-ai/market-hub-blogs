import React, { useState, useEffect, useMemo, useCallback, useDeferredValue } from "react";
import { Search, Pencil, Trash2, Plus } from "lucide-react";

import { API, authFetch } from "./config";
import { uniqueOptions } from "./fields";
import PostEditor from "./editor/PostEditor";
import { toLocalInput } from "./seo/seoUtils";

import { confirmAction } from "../utils/alerts";
import {
  emptyPost,
  biographyConfig,
  brandConfig,
  slidingCompanyConfig,
  latestArticleConfig,
  articleConfig,
  companyConfig,
  buildBlogArticleConfig,
} from "./postConfigs";

export const BLOG_TYPES = [
  { key: "biographies", label: "Biography", badge: "bg-orange-50 text-orange-700" },
  { key: "brands", label: "Brand", badge: "bg-sky-50 text-sky-700" },
  { key: "slidingCompanies", label: "Sliding Company", badge: "bg-violet-50 text-violet-700" },
  { key: "latestArticles", label: "Latest Article", badge: "bg-teal-50 text-teal-700" },
  { key: "articles", label: "Company Related Article", badge: "bg-rose-50 text-rose-700" },
  { key: "blogArticles", label: "Author Article", badge: "bg-lime-50 text-lime-700" },
  { key: "companies", label: "Company", badge: "bg-amber-50 text-amber-700" },
];

export const BLOG_KEYS = BLOG_TYPES.map((item) => item.key);

const META_OF = Object.fromEntries(BLOG_TYPES.map((item) => [item.key, item]));

const BASE_CONFIGS = {
  biographies: biographyConfig,
  brands: brandConfig,
  slidingCompanies: slidingCompanyConfig,
  latestArticles: latestArticleConfig,
  articles: articleConfig,
  companies: companyConfig,
  blogArticles: buildBlogArticleConfig([]),
};

const PAGE_SIZE = 30;

const FALLBACK_IMAGE =
  "data:image/svg+xml;charset=UTF-8," +
  encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" width="120" height="120">
      <rect width="100%" height="100%" fill="#fff7ed"/>
      <text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle"
        fill="#c2410c" font-size="12">No Image</text>
    </svg>`
  );

const selectClass =
  "w-full min-w-0 rounded-lg border border-orange-200 bg-white px-3 py-2 text-[13px] text-slate-800 outline-none transition focus:border-orange-400 focus:ring-2 focus:ring-orange-300/40 disabled:cursor-not-allowed disabled:bg-orange-50 disabled:text-slate-500";

const buttonBase =
  "inline-flex min-h-9 items-center justify-center gap-1.5 rounded-lg px-3 py-2 text-xs font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-400 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50";

const text = (value) => (value == null ? "" : String(value));

const emptyData = () => Object.fromEntries(BLOG_KEYS.map((key) => [key, []]));

async function errorMessage(response, fallback) {
  try {
    const body = await response.json();
    return body?.error || body?.message || fallback;
  } catch {
    return fallback;
  }
}

async function requestArray(url, label) {
  const response = await authFetch(url);

  if (!response.ok) {
    throw new Error(await errorMessage(response, `Failed to load ${label}.`));
  }

  const result = await response.json();

  if (!Array.isArray(result)) {
    throw new Error(`Unexpected response format for ${label}.`);
  }

  return result;
}

const requestList = (key) => requestArray(BASE_CONFIGS[key].listUrl, META_OF[key].label);

function newForm(config, previous) {
  const base = {
    ...emptyPost,
    ...(config?.extraDefaults || {}),
    publishDate: toLocalInput(),
    seo: { ...(emptyPost.seo || {}) },
  };

  if (!previous) return base;

  const carried = {};
  Object.keys(emptyPost).forEach((key) => {
    if (key !== "category" && key !== "seo") carried[key] = previous[key];
  });

  return { ...base, ...carried, seo: { ...base.seo, ...(previous.seo || {}) } };
}

function LoadingState() {
  return (
    <div className="py-10 text-center" role="status" aria-live="polite">
      <div className="mx-auto mb-3 h-7 w-7 animate-spin rounded-full border-2 border-orange-200 border-t-orange-500" />
      <p className="text-sm font-semibold text-slate-500">Loading content...</p>
    </div>
  );
}

function EmptyState({ hasPosts, hasSearch, onClearSearch }) {
  return (
    <div className="py-10 text-center">
      <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-orange-50">
        <Search aria-hidden="true" className="h-5 w-5 text-orange-400" />
      </div>

      <p className="text-sm font-semibold text-slate-700">
        {hasPosts
          ? "No results match this search or category."
          : "Nothing here yet. Add your first item above!"}
      </p>

      {hasSearch && (
        <button
          type="button"
          onClick={onClearSearch}
          className="mt-3 text-xs font-semibold text-orange-600 hover:text-orange-700"
        >
          Clear search
        </button>
      )}
    </div>
  );
}

function PostRow({ meta, item, row, isDeleting, busy, onEdit, onDelete }) {
  const isDraft = item.status === "draft";
  const title = text(row?.title).trim() || "Untitled";
  const subtitle = text(row?.subtitle);

  return (
    <article className="flex flex-col items-start justify-between gap-4 px-2 py-4 transition hover:bg-orange-50/60 sm:flex-row sm:items-center sm:rounded-lg">
      <div className="flex w-full min-w-0 items-center gap-3 sm:gap-4">
        <img
          src={text(row?.image).trim() || FALLBACK_IMAGE}
          alt=""
          loading="lazy"
          decoding="async"
          onError={(event) => {
            event.currentTarget.onerror = null;
            event.currentTarget.src = FALLBACK_IMAGE;
          }}
          className="h-11 w-11 shrink-0 rounded-lg border border-orange-100 bg-orange-50 object-cover"
        />

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="max-w-full break-words text-sm font-semibold text-slate-900">{title}</h3>

            <span className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-bold ${meta.badge}`}>
              {meta.label}
            </span>

            <span
              className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-bold ${
                isDraft ? "bg-slate-100 text-slate-500" : "bg-emerald-50 text-emerald-700"
              }`}
            >
              {isDraft ? "Draft" : "Published"}
            </span>
          </div>

          {subtitle && <p className="mt-1 break-words text-xs leading-5 text-slate-500">{subtitle}</p>}
        </div>
      </div>

      <div className="flex w-full shrink-0 justify-end gap-2 sm:w-auto">
        <button
          type="button"
          onClick={onEdit}
          disabled={busy}
          aria-label={`Edit ${title}`}
          className={`${buttonBase} bg-amber-100 text-amber-800 hover:bg-amber-200`}
        >
          <Pencil aria-hidden="true" className="h-3.5 w-3.5" />
          Edit
        </button>

        <button
          type="button"
          onClick={onDelete}
          disabled={busy}
          aria-label={`Delete ${title}`}
          className={`${buttonBase} bg-rose-50 text-rose-700 hover:bg-rose-100`}
        >
          {isDeleting ? (
            <span
              className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-rose-300 border-t-rose-700"
              aria-hidden="true"
            />
          ) : (
            <Trash2 aria-hidden="true" className="h-3.5 w-3.5" />
          )}
          {isDeleting ? "Deleting..." : "Delete"}
        </button>
      </div>
    </article>
  );
}

export default function UnifiedBlogs({ type, setType, counts = {}, notify, setCount }) {
  const [data, setData] = useState(emptyData);
  const [authors, setAuthors] = useState([]);
  const [pending, setPending] = useState(BLOG_KEYS.length); // lists still loading
  const [failed, setFailed] = useState([]);
  const [search, setSearch] = useState("");
  const [limit, setLimit] = useState(PAGE_SIZE);

  const [view, setView] = useState("list");
  const [activeType, setActiveType] = useState("biographies");
  const [editingKey, setEditingKey] = useState(null);
  const [form, setForm] = useState(null);
  const [saving, setSaving] = useState(false);
  const [deletingKey, setDeletingKey] = useState(null);

  const editing = editingKey !== null;
  const filterType = BLOG_KEYS.includes(type) ? type : null;
  const query = useDeferredValue(search.trim().toLowerCase());

  const showToast = useCallback(
    (message, variant = "success") => {
      if (typeof notify === "function") notify(message, variant);
    },
    [notify]
  );

  const configs = useMemo(() => {
    const companyOptions = data.companies
      .filter((company) => company?.slug && company?.name)
      .map((company) => ({ value: company.slug, label: company.name }));

    return {
      ...BASE_CONFIGS,
      articles: {
        ...articleConfig,
        singular: "Company Article",
        extraFields: (articleConfig.extraFields || []).map((field) =>
          field.name === "company"
            ? {
                ...field,
                label: "Company",
                type: "select",
                options: companyOptions,
                placeholder: "Select a company (optional)",
                hint: "The article will appear in the Related Articles section on the page of the company you select.",
              }
            : field
        ),
      },
      companies: { ...companyConfig, extraFields: [] },
      blogArticles: buildBlogArticleConfig(authors),
    };
  }, [data.companies, authors]);

  const cfg = configs[activeType];

  // Authors are only needed inside the editor, so they load on demand.
  const loadAuthors = useCallback(() => {
    requestArray(`${API}/blog-authors`, "authors")
      .then(setAuthors)
      .catch((error) => console.error("Unable to load authors:", error));
  }, []);

  // Each list loads independently and shows up as soon as it arrives,
  // so the slowest request no longer blocks the whole screen.
  useEffect(() => {
    let cancelled = false;
    const order = filterType ? [filterType, ...BLOG_KEYS.filter((k) => k !== filterType)] : BLOG_KEYS;

    order.forEach((key) => {
      requestList(key)
        .then((result) => {
          if (!cancelled) setData((previous) => ({ ...previous, [key]: result }));
        })
        .catch((error) => {
          console.error(`Failed to load ${key}:`, error);
          if (!cancelled) setFailed((previous) => [...previous, META_OF[key].label]);
        })
        .finally(() => {
          if (!cancelled) setPending((count) => count - 1);
        });
    });

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (typeof setCount !== "function") return;

    BLOG_KEYS.forEach((key) => {
      const update = setCount(key);
      if (typeof update === "function") update(data[key].length);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data]);

  useEffect(() => setLimit(PAGE_SIZE), [query, filterType]);

  const reloadType = async (key) => {
    const result = await requestList(key);
    setData((previous) => ({ ...previous, [key]: result }));
  };

  const openEditor = (targetType, key, nextForm) => {
    setActiveType(targetType);
    setEditingKey(key);
    setForm(nextForm);
    setView("edit");
    window.scrollTo({ top: 0, behavior: "smooth" });
    loadAuthors();
  };

  const openCreate = () => {
    const targetType = filterType || "biographies";
    openEditor(targetType, null, newForm(configs[targetType]));
  };

  const openEdit = (targetType, item) => {
    const config = configs[targetType];

    try {
      openEditor(targetType, config.getKey(item), config.toForm(item));
    } catch (error) {
      console.error("Unable to open editor:", error);
      showToast("Unable to open this item for editing.", "error");
    }
  };

  const closeEditor = () => {
    setView("list");
    setEditingKey(null);
    setForm(null);
  };

  const changeType = (targetType) => {
    if (editing || !BLOG_KEYS.includes(targetType)) return;

    setActiveType(targetType);
    setForm((previous) => newForm(configs[targetType], previous));
  };

  const handleSave = async (event) => {
    event.preventDefault();

    if (saving || !cfg || !form) return;

    if (!text(form.category).trim()) {
      showToast("Please select a category.", "error");
      return;
    }

    setSaving(true);

    try {
      const response = await authFetch(editing ? cfg.updateUrl(editingKey) : cfg.createUrl, {
        method: editing ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(cfg.toPayload(form, data[activeType])),
      });

      if (!response.ok) {
        showToast(await errorMessage(response, "Operation failed. Please check the backend."), "error");
        return;
      }

      showToast(`${cfg.singular} ${editing ? "updated" : "saved"} successfully!`);

      const savedType = activeType;
      closeEditor();

      try {
        await reloadType(savedType);
      } catch (error) {
        console.error("Saved, but the list could not refresh:", error);
        showToast("Saved, but the list could not refresh. Please refresh the page.", "warning");
      }
    } catch (error) {
      console.error("Error saving content:", error);
      showToast("Unable to connect to the server or save the content.", "error");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (targetType, item, itemKey) => {
    const config = configs[targetType];

    if (deletingKey !== null) return;

    if (itemKey == null || itemKey === "") {
      showToast("This item does not have a valid identifier.", "error");
      return;
    }

  const confirmed = await confirmAction({
  title: `Delete ${config.singular}?`,
  text: `Are you sure you want to delete this ${config.singular}?`,
  confirmButtonText: "Yes, Delete",
  cancelButtonText: "Cancel",
  icon: "warning",
});

if (!confirmed) return;

    setDeletingKey(`${targetType}:${itemKey}`);

    try {
      const response = await authFetch(config.deleteUrl(itemKey), { method: "DELETE" });

      if (!response.ok) {
        showToast(await errorMessage(response, "Delete failed. Please try again."), "error");
        return;
      }

      setData((previous) => ({
        ...previous,
        [targetType]: previous[targetType].filter((entry) => config.getKey(entry) !== itemKey),
      }));

      showToast(`${config.singular} deleted successfully!`);
    } catch (error) {
      console.error("Error deleting content:", error);
      showToast("Unable to connect to the server.", "error");
    } finally {
      setDeletingKey(null);
    }
  };

  // Rows are built once per data change, not on every keystroke.
  const allEntries = useMemo(
    () =>
      BLOG_KEYS.flatMap((key) =>
        data[key].map((item) => {
          const row = configs[key].getRow(item);
          return {
            key,
            item,
            row,
            itemKey: configs[key].getKey(item),
            searchText: `${text(row?.title)} ${text(row?.subtitle)}`.toLowerCase(),
          };
        })
      ),
    [data, configs]
  );

  const entries = useMemo(
    () =>
      allEntries.filter(
        (entry) => (!filterType || entry.key === filterType) && (!query || entry.searchText.includes(query))
      ),
    [allEntries, filterType, query]
  );

  const total = allEntries.length;
  const visibleEntries = entries.slice(0, limit);
  const isLoading = pending > 0 && total === 0;

  const categories = useMemo(
    () => uniqueOptions(data[activeType].map((item) => item?.category)),
    [data, activeType]
  );

  if (view === "edit" && form) {
    return (
      <div>
        <div className="mb-4 flex flex-col gap-3 rounded-xl border border-orange-100 bg-white px-5 py-4 sm:flex-row sm:items-center">
          <div className="sm:w-64">
            <label htmlFor="post-category-type" className="mb-1 block text-xs font-semibold text-slate-600">
              Post Category <span className="text-orange-500">*</span>
            </label>

            <select
              id="post-category-type"
              value={activeType}
              disabled={editing || saving}
              onChange={(event) => changeType(event.target.value)}
              className={selectClass}
            >
              {BLOG_TYPES.map((item) => (
                <option key={item.key} value={item.key}>
                  {item.label}
                </option>
              ))}
            </select>
          </div>

          <p className="text-[11px] leading-5 text-slate-400">
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

  return (
    <div className="space-y-5">
      <div className="flex flex-col items-start justify-between gap-3 rounded-xl border border-orange-100 bg-white px-5 py-4 sm:flex-row sm:items-center">
        <h2 className="text-sm font-bold text-slate-900">Do you want to add a new post?</h2>

        <button
          type="button"
          onClick={openCreate}
          className={`${buttonBase} bg-orange-500 text-white shadow-sm hover:bg-orange-600`}
        >
          <Plus aria-hidden="true" className="h-3.5 w-3.5" />
          Add New Post
        </button>
      </div>

      <section className="rounded-xl border border-orange-100 bg-white p-4 sm:p-5 md:p-6">
        <div className="mb-5 flex flex-col gap-3 border-b border-orange-100 pb-5 lg:flex-row lg:items-center lg:justify-between">
          <h2 className="text-sm font-bold text-slate-900">
            Manage Existing ({entries.length}
            {filterType ? ` of ${total}` : ""})
            {pending > 0 && !isLoading && (
              <span className="ml-2 text-xs font-medium text-slate-400">Loading more...</span>
            )}
          </h2>

          <div className="flex w-full flex-col gap-2 sm:flex-row lg:w-auto">
            <label className="sr-only" htmlFor="blog-type-filter">
              Filter by category
            </label>

            <select
              id="blog-type-filter"
              value={filterType || "all"}
              onChange={(event) => setType(event.target.value)}
              className={`${selectClass} sm:w-56`}
            >
              <option value="all">All Categories ({total})</option>

              {BLOG_TYPES.map((item) => (
                <option key={item.key} value={item.key}>
                  {item.label} ({counts[item.key] ?? 0})
                </option>
              ))}
            </select>

            <div className="relative w-full sm:w-64">
              <Search
                aria-hidden="true"
                className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-orange-400"
              />

              <label className="sr-only" htmlFor="blog-search">
                Search posts
              </label>

              <input
                id="blog-search"
                type="search"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search..."
                className="w-full rounded-lg border border-orange-200 bg-white py-2 pl-9 pr-4 text-[13px] outline-none transition focus:border-orange-400 focus:ring-2 focus:ring-orange-300/40"
              />
            </div>
          </div>
        </div>

        {failed.length > 0 && (
          <div
            role="alert"
            className="mb-4 flex flex-col gap-3 rounded-lg border border-rose-200 bg-rose-50 p-3 text-xs text-rose-700 sm:flex-row sm:items-center sm:justify-between"
          >
            <p>Unable to load: {failed.join(", ")}. Please refresh and try again.</p>

            <button
              type="button"
              onClick={() => window.location.reload()}
              className="shrink-0 font-bold underline"
            >
              Refresh page
            </button>
          </div>
        )}

        {isLoading ? (
          <LoadingState />
        ) : entries.length === 0 && pending === 0 ? (
          <EmptyState hasPosts={total > 0} hasSearch={Boolean(search)} onClearSearch={() => setSearch("")} />
        ) : (
          <>
            <div className="divide-y divide-orange-100">
              {visibleEntries.map(({ key, item, row, itemKey }) => {
                const requestKey = `${key}:${itemKey}`;

                return (
                  <PostRow
                    key={requestKey}
                    meta={META_OF[key]}
                    item={item}
                    row={row}
                    isDeleting={deletingKey === requestKey}
                    busy={deletingKey !== null}
                    onEdit={() => openEdit(key, item)}
                    onDelete={() => handleDelete(key, item, itemKey)}
                  />
                );
              })}
            </div>

            {entries.length > limit && (
              <div className="pt-4 text-center">
                <button
                  type="button"
                  onClick={() => setLimit((current) => current + PAGE_SIZE)}
                  className={`${buttonBase} bg-orange-50 text-orange-700 hover:bg-orange-100`}
                >
                  Show more ({entries.length - limit} remaining)
                </button>
              </div>
            )}
          </>
        )}
      </section>
    </div>
  );
}