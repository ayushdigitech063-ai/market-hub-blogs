
import React, { useState, useEffect, useMemo } from "react";
import { Search, Pencil, Trash2, Plus } from "lucide-react";
import { authFetch } from "./config";
import { uniqueOptions } from "./fields";
import PostEditor from "./editor/PostEditor";
import { emptyPost } from "./postConfigs";
import { toLocalInput } from "./seo/seoUtils";
import { confirmAction } from "../utils/alerts";
import { showSuccess, showError } from "../utils/toast";

export default function PostSection({ config, notify, onCount }) {
  const [items, setItems] = useState([]);
  const [listLoading, setListLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [view, setView] = useState("list");
  const [editingKey, setEditingKey] = useState(null);
  const [form, setForm] = useState(null);
  const [saving, setSaving] = useState(false);

  const editing = editingKey !== null;

  const fetchItems = async () => {
    try {
      const res = await authFetch(config.listUrl);

      if (!res.ok) {
        throw new Error(`Failed to load ${config.singular}`);
      }

      const data = await res.json();
      setItems(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error(`Error fetching ${config.singular}:`, err);
      showError(`Unable to load ${config.singular}. Please try again.`);
    } finally {
      setListLoading(false);
    }
  };

  useEffect(() => {
    setListLoading(true);
    fetchItems();
  }, [config.listUrl]);

  useEffect(() => {
    if (typeof onCount === "function") {
      onCount(items.length);
    }
  }, [items.length, onCount]);

  const categories = useMemo(
    () => uniqueOptions(items.map((item) => item.category)),
    [items]
  );

  const openCreate = () => {
    setEditingKey(null);

    setForm({
      ...emptyPost,
      ...config.extraDefaults,
      publishDate: toLocalInput(),
      seo: { ...emptyPost.seo },
    });

    setView("edit");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const openEdit = (item) => {
    setEditingKey(config.getKey(item));
    setForm(config.toForm(item));
    setView("edit");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const closeEditor = () => {
    setView("list");
    setEditingKey(null);
    setForm(null);
  };

  const handleSave = async (e) => {
    e.preventDefault();

    if (!form?.category?.trim()) {
      showError("Please select a category.");
      return;
    }

    setSaving(true);

    try {
      const res = await authFetch(
        editing ? config.updateUrl(editingKey) : config.createUrl,
        {
          method: editing ? "PUT" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(config.toPayload(form, items)),
        }
      );

      if (res.ok) {
        showSuccess(
          editing
            ? `${config.singular} updated successfully!`
            : `${config.singular} saved successfully!`
        );

        closeEditor();
        await fetchItems();
      } else {
        let message = "Operation failed. Please try again.";

        try {
          const data = await res.json();
          if (data.error) message = data.error;
        } catch {
          // Keep the default error message if the response isn't JSON.
        }

        showError(message);
      }
    } catch (err) {
      console.error("Error saving data:", err);
      showError("Unable to connect to the server.");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (item) => {
    const confirmed = await confirmAction({
      title: `Delete ${config.singular}?`,
      text: `Are you sure you want to delete this ${config.singular}? This action cannot be undone.`,
      confirmButtonText: "Yes, Delete",
      cancelButtonText: "Cancel",
      icon: "warning",
    });

    if (!confirmed) return;

    try {
      const res = await authFetch(
        config.deleteUrl(config.getKey(item)),
        { method: "DELETE" }
      );

      if (res.ok) {
        setItems((previous) =>
          previous.filter(
            (current) => config.getKey(current) !== config.getKey(item)
          )
        );

        showSuccess(`${config.singular} deleted successfully!`);
      } else {
        let message = "Delete failed!";

        try {
          const data = await res.json();
          if (data.error) message = data.error;
        } catch {
          // Keep the default error message.
        }

        showError(message);
      }
    } catch (err) {
      console.error("Error deleting:", err);
      showError("Unable to connect to the server.");
    }
  };

  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase();

    if (!query) return items;

    return items.filter((item) => {
      const row = config.getRow(item);

      return `${row.title} ${row.subtitle}`
        .toLowerCase()
        .includes(query);
    });
  }, [items, search, config]);

  if (view === "edit" && form) {
    return (
      <PostEditor
        config={config}
        form={form}
        setForm={setForm}
        editing={editing}
        saving={saving}
        categories={categories}
        onSave={handleSave}
        onCancel={closeEditor}
      />
    );
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-col items-start justify-between gap-3 rounded-xl border border-orange-100 bg-white px-5 py-4 sm:flex-row sm:items-center">
        <div>
          <h2 className="text-sm font-bold text-slate-900">
            Want to add a new {config.singular}?
          </h2>
          <p className="text-xs text-slate-500">
            Create and manage your content here.
          </p>
        </div>

        <button
          type="button"
          onClick={openCreate}
          className="inline-flex items-center gap-1.5 rounded-lg bg-orange-500 px-4 py-2 text-xs font-semibold text-white shadow-sm transition hover:bg-orange-600"
        >
          <Plus className="h-3.5 w-3.5" />
          Add {config.singular}
        </button>
      </div>

      <div className="rounded-xl border border-orange-100 bg-white p-5 md:p-6">
        <div className="mb-5 flex flex-col gap-3 border-b border-orange-100 pb-5 sm:flex-row sm:items-center sm:justify-between">
          <h2 className="text-sm font-bold text-slate-900">
            Manage Existing ({items.length})
          </h2>

          <div className="relative w-full sm:w-72">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-orange-400" />

            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search..."
              className="w-full rounded-lg border border-orange-200 bg-white py-1.5 pl-9 pr-4 text-[13px] outline-none transition focus:border-orange-400 focus:ring-2 focus:ring-orange-300/40"
            />
          </div>
        </div>

        {listLoading ? (
          <p className="py-8 text-center text-sm font-semibold text-slate-500">
            Loading...
          </p>
        ) : filtered.length === 0 ? (
          <p className="py-8 text-center text-sm text-slate-500">
            {items.length === 0
              ? "Nothing here yet. Add your first item above!"
              : "No results match this search."}
          </p>
        ) : (
          <div className="divide-y divide-orange-100">
            {filtered.map((item) => {
              const row = config.getRow(item);
              const draft = item.status === "draft";

              return (
                <div
                  key={config.getKey(item)}
                  className="flex flex-col items-start justify-between gap-4 px-2 py-3 transition hover:bg-orange-50/60 sm:flex-row sm:items-center sm:rounded-lg"
                >
                  <div className="flex min-w-0 items-center gap-4">
                    <img
                      src={row.image || "https://via.placeholder.com/150"}
                      alt={row.title || config.singular}
                      className="h-11 w-11 shrink-0 rounded-lg border border-orange-100 object-cover"
                    />

                    <div className="min-w-0">
                      <h3 className="flex items-center gap-2 truncate text-sm font-semibold text-slate-900">
                        <span className="truncate">{row.title}</span>

                        <span
                          className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-bold ${
                            draft
                              ? "bg-slate-100 text-slate-500"
                              : "bg-emerald-50 text-emerald-700"
                          }`}
                        >
                          {draft ? "Draft" : "Published"}
                        </span>
                      </h3>

                      <p className="truncate text-xs text-slate-500">
                        {row.subtitle}
                      </p>
                    </div>
                  </div>

                  <div className="flex w-full justify-end gap-2 sm:w-auto">
                    <button
                      type="button"
                      onClick={() => openEdit(item)}
                      className="inline-flex items-center gap-1.5 rounded-lg bg-amber-100 px-3 py-1.5 text-xs font-semibold text-amber-800 transition hover:bg-amber-200"
                    >
                      <Pencil className="h-3.5 w-3.5" />
                      Edit
                    </button>

                    <button
                      type="button"
                      onClick={() => handleDelete(item)}
                      className="inline-flex items-center gap-1.5 rounded-lg bg-rose-50 px-3 py-1.5 text-xs font-semibold text-rose-700 transition hover:bg-rose-100"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                      Delete
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
