import React, { useState } from "react";
import { API } from "../dashboard/config";

const STORAGE_KEY = "blogSubmissionIds";
const empty = { name: "", email: "", title: "", category: "", image: "", content: "" };

const inputClass =
  "w-full rounded-xl border border-amber-200 bg-amber-50/40 px-4 py-3 text-xs text-stone-900 outline-none transition focus:border-amber-500 focus:bg-white focus:ring-4 focus:ring-amber-400/20";
const labelClass = "mb-1.5 block text-xs font-semibold text-stone-700";

const readIds = () => {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
  } catch {
    return [];
  }
};

export default function BlogSubmitModal({ open, onClose }) {
  const [form, setForm] = useState(empty);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);

  if (!open) return null;

  const set = (k) => (e) => setForm((p) => ({ ...p, [k]: e.target.value }));

  const close = () => {
    setDone(false);
    setError("");
    onClose();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`${API}/submissions`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || "Submit failed. Please try again.");

      localStorage.setItem(STORAGE_KEY, JSON.stringify([...readIds(), data.id]));
      window.dispatchEvent(new Event("submission-added"));
      setForm(empty);
      setDone(true);
      setTimeout(close, 2500);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-stone-900/50 p-4 backdrop-blur-sm">
      <div className="relative max-h-[92vh] w-full max-w-lg overflow-y-auto rounded-3xl border border-amber-100 bg-white p-7 shadow-2xl">
        <div className="absolute inset-x-0 top-0 h-1.5 bg-gradient-to-r from-amber-400 via-orange-500 to-amber-400" />

        <button
          type="button"
          onClick={close}
          className="absolute right-4 top-5 flex h-8 w-8 items-center justify-center rounded-full bg-stone-100 text-sm font-bold text-stone-500 transition hover:bg-amber-100 hover:text-amber-800"
        >
          ✕
        </button>

        <div className="mb-5 text-center">
          <h3 className="text-xl font-extrabold text-stone-900">Post Your Blog</h3>
          <p className="mt-1.5 text-xs text-stone-500">
            Your blog will be published after admin approval.
          </p>
        </div>

        {done ? (
          <div className="rounded-2xl border border-green-200 bg-green-50 p-4 text-center text-xs font-semibold text-green-700">
            ✓ Your blog post is going on processing
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className={labelClass}>Your Name *</label>
                <input required value={form.name} onChange={set("name")} placeholder="Enter your name" className={inputClass} />
              </div>
              <div>
                <label className={labelClass}>Email Address *</label>
                <input required type="email" value={form.email} onChange={set("email")} placeholder="Enter your email" className={inputClass} />
              </div>
              
            </div>

            <div>
              <label className={labelClass}>Blog Title *</label>
              <input required value={form.title} onChange={set("title")} placeholder="Enter blog title" className={inputClass} />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className={labelClass}>Category</label>
                <input value={form.category} onChange={set("category")} placeholder="e.g. Business" className={inputClass} />
              </div>
              <div>
                <label className={labelClass}>Image URL</label>
                <input value={form.image} onChange={set("image")} placeholder="https://..." className={inputClass} />
              </div>
            </div>

            <div>
              <label className={labelClass}>Blog Content *</label>
              <textarea required rows={7} value={form.content} onChange={set("content")} placeholder="Write your blog here..." className={inputClass} />
            </div>

            {error && (
              <div className="rounded-xl border border-rose-200 bg-rose-50 p-3 text-xs font-semibold text-rose-700">
                {error}
              </div>
            )}

            <div className="flex justify-end gap-2 pt-2">
              <button type="button" onClick={close} className="rounded-full border border-stone-200 px-5 py-2.5 text-xs font-semibold text-stone-600 transition hover:bg-stone-50">
                Cancel
              </button>
              <button type="submit" disabled={loading} className="rounded-full bg-gradient-to-r from-amber-500 via-orange-500 to-amber-500 px-6 py-2.5 text-xs font-bold text-white shadow-md shadow-orange-500/30 transition hover:-translate-y-0.5 hover:shadow-lg disabled:opacity-60">
                {loading ? "Submitting..." : "Submit Blog"}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}