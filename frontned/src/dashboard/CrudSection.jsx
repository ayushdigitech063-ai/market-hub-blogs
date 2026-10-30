import { useState, useEffect, useMemo } from "react";
import { Search, Pencil, Trash2, Plus, X } from "lucide-react";
import { authFetch } from "./config";
import { inputClass } from "./ui";
import { Field, uniqueOptions } from "./fields";
import Swal from "sweetalert2";
import { showSuccess, showError } from "../utils/toast";


export default function CrudSection({
  singular, fields, emptyForm, listUrl, createUrl, updateUrl, deleteUrl,
  getKey, toForm, toPayload, getRow, onCount, filters,
}) {
  const [items, setItems] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [editingKey, setEditingKey] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [listLoading, setListLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterValues, setFilterValues] = useState({});

  const editing = editingKey !== null;

  const fetchItems = async () => {
    try {
      const res = await authFetch(listUrl);
      const data = await res.json();
      setItems(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error(`Error fetching ${singular}:`, err);
    } finally {
      setListLoading(false);
    }
  };

  useEffect(() => {
    fetchItems();

  }, []);

  useEffect(() => {
    onCount(items.length);

  }, [items.length]);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const resetForm = () => {
    setForm(emptyForm);
    setEditingKey(null);
  };
  const openCreate = () => {
    resetForm();
    setShowForm(true);
  };
  const closeForm = () => {
    resetForm();
    setShowForm(false);
  };

  useEffect(() => {
    if (!showForm) return;
    const onKey = (e) => { if (e.key === "Escape") closeForm(); };
    document.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  
  }, [showForm]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await authFetch(editing ? updateUrl(editingKey) : createUrl, {
        method: editing ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(toPayload(form, items)),
      });
      if (res.ok) {
        showSuccess(editing ? `${singular} updated successfully!` : `${singular} posted successfully!`);
        closeForm();
        await fetchItems();
      } else {
        let msg = "Operation failed! Please check backend.";
        try {
          const data = await res.json();
          if (data.error) msg = data.error;
        } catch (_) {}
        showError(msg);
      }
    } catch (err) {
      console.error("Error saving data:", err);
      showError("Unable to connect to the server.");
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (item) => {
    setEditingKey(getKey(item));
    setForm(toForm(item));
    setShowForm(true);
  };

  const handleDelete = async (item) => {
    const confirmation = await Swal.fire({
      title: `Delete this ${singular}?`,
      text: "This action cannot be undone.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Yes, delete it",
      cancelButtonText: "Cancel",
      reverseButtons: true,
      confirmButtonColor: "#e11d48",
      cancelButtonColor: "#64748b",
    });

    if (!confirmation.isConfirmed) return;

    try {
      const res = await authFetch(deleteUrl(getKey(item)), { method: "DELETE" });

      if (res.ok) {
        setItems((prev) => prev.filter((i) => getKey(i) !== getKey(item)));
        if (editingKey === getKey(item)) closeForm();
        showSuccess(`${singular} deleted successfully!`);
      } else {
        let message = "Delete failed!";
        try {
          const data = await res.json();
          if (data.error) message = data.error;
        } catch (_) {}
        showError(message);
      }
    } catch (err) {
      console.error("Error deleting:", err);
      showError("Unable to connect to the server.");
    }
  };

  const filterOptions = useMemo(
    () => (filters || []).map((f) => ({
      ...f,
      options: f.options || uniqueOptions(items.map(f.get)).map((v) => ({ value: v, label: v })),
    })),
    [items, filters]
  );
  const fieldsWithOptions = useMemo(
    () => fields.map((f) =>
      f.type === "combo" ? { ...f, options: uniqueOptions(items.map((i) => i[f.name])) } : f
    ),
    [fields, items]
  );
  const activeFilters = Object.values(filterValues).some(Boolean);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return items.filter((i) => {
      const okFilters = (filters || []).every((f) => {
        const want = filterValues[f.key];
        return !want || String(f.get(i) ?? "").trim().toLowerCase() === want.toLowerCase();
      });
      if (!okFilters) return false;
      if (!q) return true;
      const r = getRow(i);
      return `${r.title} ${r.subtitle}`.toLowerCase().includes(q);
    });

  }, [items, search, filterValues]);

  return (
    <div className="space-y-5">
      <div className="flex flex-col items-start justify-between gap-3 rounded-xl border border-orange-100 bg-white px-5 py-4 sm:flex-row sm:items-center">
        <div>
<h2 className="text-sm font-bold text-slate-900">Want to add a new {singular}?</h2>
          <p className="text-xs text-slate-500">Do you want to add this</p>
        </div>
        <button type="button" onClick={openCreate}
          className="inline-flex items-center gap-1.5 rounded-lg bg-orange-500 px-4 py-2 text-xs font-semibold text-white shadow-sm transition hover:bg-orange-600">
          <Plus className="h-3.5 w-3.5" /> Add {singular}
        </button>
      </div>

      {showForm && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center bg-slate-900/30 p-4 backdrop-blur-[2px]"
          role="dialog" aria-modal="true">
          <div className="modal-pop flex max-h-[90vh] w-full max-w-3xl flex-col overflow-hidden rounded-2xl border border-orange-100 bg-white shadow-2xl shadow-slate-900/10">
            <div className="flex items-center justify-between border-b border-orange-100 bg-orange-50/60 px-5 py-3.5">
              <h2 className="text-sm font-bold text-slate-900">
                {editing ? `Edit ${singular}` : `Add New ${singular}`}
              </h2>
              <button type="button" onClick={closeForm} aria-label="Close form"
                className="rounded-lg p-1.5 text-slate-500 transition hover:bg-orange-100 hover:text-orange-700">
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="flex min-h-0 flex-1 flex-col">
              <div className="grid grid-cols-1 gap-4 overflow-y-auto p-5 md:grid-cols-2">
                {fieldsWithOptions.map((f) => (
                  <Field key={f.name} field={f} value={form[f.name]} onChange={handleChange} editing={editing} />
                ))}
              </div>
              <div className="flex justify-end gap-2.5 border-t border-orange-100 bg-white px-5 py-3">
                <button type="button" onClick={closeForm}
                  className="rounded-lg border border-orange-200 bg-white px-4 py-2 text-xs font-semibold text-slate-600 transition hover:bg-orange-50">
                  Cancel
                </button>
                <button type="submit" disabled={loading}
                  className="rounded-lg bg-orange-500 px-5 py-2 text-xs font-semibold text-white shadow-sm transition hover:bg-orange-600 disabled:opacity-60">
                  {loading ? "Processing..." : editing ? `Update ${singular}` : `Publish ${singular}`}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="rounded-xl border border-orange-100 bg-white p-5 md:p-6">
        <div className="mb-5 flex flex-col gap-3 border-b border-orange-100 pb-5 sm:flex-row sm:items-center sm:justify-between">
          <h2 className="text-sm font-bold text-slate-900">Manage Existing ({items.length})</h2>
          <div className="relative w-full sm:w-72">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-orange-400" />
            <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search..."
              className="w-full rounded-lg border border-orange-200 bg-white py-1.5 pl-9 pr-4 text-[13px] outline-none transition focus:border-orange-400 focus:ring-2 focus:ring-orange-300/40" />
          </div>
        </div>

        {filterOptions.length > 0 && (
          <div className="mb-5 flex flex-wrap items-end gap-3">
            {filterOptions.map((f) => (
              <div key={f.key} className="w-full sm:w-48">
                <label className="mb-1 block text-[11px] font-semibold text-slate-500">{f.label}</label>
                <select value={filterValues[f.key] || ""}
                  onChange={(e) => setFilterValues((v) => ({ ...v, [f.key]: e.target.value }))}
                  className={`${inputClass} py-1.5`}>
                  <option value="">All {f.label}</option>
                  {f.options.map((o) => (<option key={o.value} value={o.value}>{o.label}</option>))}
                </select>
              </div>
            ))}
            {activeFilters && (
              <button type="button" onClick={() => setFilterValues({})}
                className="rounded-lg border border-orange-200 bg-white px-3 py-1.5 text-xs font-semibold text-orange-600 transition hover:bg-orange-50">
                Clear filters
              </button>
            )}
            <p className="ml-auto text-[11px] font-medium text-slate-400">
              Showing {filtered.length} of {items.length}
            </p>
          </div>
        )}

        {listLoading ? (
          <p className="py-8 text-center text-sm font-semibold text-slate-500">Loading...</p>
        ) : filtered.length === 0 ? (
          <p className="py-8 text-center text-sm text-slate-500">
          {items.length === 0
  ? "Nothing here yet. Add your first item above!"
  : "No results match this search or filter."}
          </p>
        ) : (
          <div className="divide-y divide-orange-100">
            {filtered.map((item) => {
              const row = getRow(item);
              return (
                <div key={getKey(item)}
                  className="flex flex-col items-start justify-between gap-4 px-2 py-3 transition hover:bg-orange-50/60 sm:flex-row sm:items-center sm:rounded-lg">
                  <div className="flex min-w-0 items-center gap-4">
                    <img src={row.image || "https://via.placeholder.com/150"} alt={row.title}
                      className={`h-11 w-11 shrink-0 border border-orange-100 object-cover ${row.round ? "rounded-full" : "rounded-lg"}`} />
                    <div className="min-w-0">
                      <h3 className="truncate text-sm font-semibold text-slate-900">{row.title}</h3>
                      <p className="truncate text-xs text-slate-500">{row.subtitle}</p>
                    </div>
                  </div>
                  <div className="flex w-full justify-end gap-2 sm:w-auto">
                    <button onClick={() => handleEdit(item)}
                      className="inline-flex items-center gap-1.5 rounded-lg bg-amber-100 px-3 py-1.5 text-xs font-semibold text-amber-800 transition hover:bg-amber-200">
                      <Pencil className="h-3.5 w-3.5" /> Edit
                    </button>
                    <button onClick={() => handleDelete(item)}
                      className="inline-flex items-center gap-1.5 rounded-lg bg-rose-50 px-3 py-1.5 text-xs font-semibold text-rose-700 transition hover:bg-rose-100">
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
