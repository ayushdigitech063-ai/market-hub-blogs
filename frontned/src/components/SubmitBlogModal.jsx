import React, { useEffect, useMemo, useRef, useState } from "react";
import { X } from "lucide-react";
import { API } from "../dashboard/config";
import { uniqueOptions } from "../dashboard/fields";
import { inputClass } from "../dashboard/ui";
import PostEditor from "../dashboard/editor/PostEditor";
import { emptyPost } from "../dashboard/postConfigs";
import { BLOG_TYPES } from "../dashboard/UnifiedBlogs";
import { buildConfigs } from "../dashboard/submissionConfigs";
import { toLocalInput } from "../dashboard/seo/seoUtils";

const STORAGE_KEY = "blogSubmissionIds";

// extraDefaults har type ke liye fixed hain, isliye static map kaafi hai
const baseConfigs = buildConfigs();

// Public user ID / author nahi chunta - admin approve karte waqt khud set hota hai
const strip = (cfg) => ({
  ...cfg,
  extraFields: cfg.extraFields.filter((f) => f.name !== "id" && f.name !== "authorId"),
});

// UnifiedBlogs wala hi logic: type badalne par title, content, SEO carry ho jate hain
const newForm = (cfg, prev) => {
  const base = {
    ...emptyPost,
    ...cfg.extraDefaults,
    status: "published",
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

const readIds = () => {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
  } catch {
    return [];
  }
};

export default function SubmitBlogModal({ onClose }) {
  const [activeType, setActiveType] = useState(BLOG_TYPES[0].key);
  const [form, setForm] = useState(() => newForm(baseConfigs[BLOG_TYPES[0].key]));
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);
  const [existing, setExisting] = useState([]);
  const [companies, setCompanies] = useState([]);
  const overlayRef = useRef(null);

  const cfg = useMemo(
    () => strip(buildConfigs({ companies })[activeType]),
    [companies, activeType]
  );

  useEffect(() => {
    document.body.style.overflow = "hidden";
    fetch(`${API}/companies`)
      .then((r) => r.json())
      .then((d) => setCompanies(Array.isArray(d) ? d : []))
      .catch(() => {});
    return () => {
      document.body.style.overflow = "";
    };
  }, []);

  // Category dropdown ke options us type ke existing posts se
  useEffect(() => {
    fetch(baseConfigs[activeType].listUrl)
      .then((r) => r.json())
      .then((d) => setExisting(Array.isArray(d) ? d : []))
      .catch(() => setExisting([]));
  }, [activeType]);

  const categories = useMemo(
    () => uniqueOptions(existing.map((i) => i.category)),
    [existing]
  );

  const changeType = (t) => {
    setActiveType(t);
    setForm((prev) => newForm(baseConfigs[t], prev));
  };

  const fail = (msg) => {
    setError(msg);
    overlayRef.current?.scrollTo({ top: 0, behavior: "smooth" });
  };

  const onSave = async (e) => {
    e.preventDefault();
    setError("");
    if (!name.trim() || !email.trim()) return fail("Please enter your name and email.");
    if (!form.category.trim()) return fail("Please select a category.");
    if (!form.contentHtml.replace(/<[^>]*>/g, "").trim()) return fail("Please write the blog content.");

    setSaving(true);
    const ctrl = new AbortController();
    const timer = setTimeout(() => ctrl.abort(), 30000);
    try {
      const res = await fetch(`${API}/submissions`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, postType: activeType, form }),
        signal: ctrl.signal,
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) return fail(data.error || "Submit failed. Please try again.");

      localStorage.setItem(STORAGE_KEY, JSON.stringify([...readIds(), data.id]));
      window.dispatchEvent(new Event("submission-added"));
      setDone(true);
      setTimeout(onClose, 3000);
    } catch (err) {
      fail(
        err.name === "AbortError"
          ? "The server is taking too long. Please try again."
          : "Could not connect to the server."
      );
    } finally {
      clearTimeout(timer);
      setSaving(false);
    }
  };

  return (
   <div
  ref={overlayRef}
  className="fixed inset-0 z-[100] overflow-y-auto overscroll-contain bg-stone-900/60 p-3 backdrop-blur-sm sm:p-6 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
>
    <div className="relative mx-auto max-w-6xl rounded-3xl bg-orange-50 p-4 shadow-2xl sm:p-6">
        <button
          type="button"
          onClick={onClose}
          aria-label="Close"
          className="absolute right-4 top-4 z-10 flex h-9 w-9 items-center justify-center rounded-full bg-white text-slate-600 shadow transition hover:bg-amber-100"
        >
          <X className="h-4 w-4" />
        </button>

        {done ? (
          <div className="mx-auto my-16 max-w-md rounded-2xl border border-green-200 bg-green-50 p-6 text-center">
            <p className="text-sm font-bold text-green-700">✓ Your blog post is going on processing</p>
            <p className="mt-1 text-xs text-green-700/80">
              You will see an update on the site once the admin reviews it.
            </p>
            <button
              type="button"
              onClick={onClose}
              className="mt-4 rounded-full bg-green-600 px-5 py-2 text-xs font-bold text-white"
            >
              Close
            </button>
          </div>
        ) : (
          <>
            <div className="mb-5 border-b border-orange-200 pb-4 pr-12">
              <p className="text-[11px] font-extrabold uppercase tracking-[0.2em] text-orange-600">
                Share your knowledge
              </p>
              <h2 className="mt-1 text-2xl font-extrabold text-slate-900">Post Your Blog</h2>
              <p className="mt-1 text-sm text-slate-600">
                Create your article and submit it for admin approval before publication.
              </p>
            </div>

            {error && (
              <div className="mb-4 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-xs font-semibold text-rose-700">
                {error}
              </div>
            )}

            <div className="mb-4 grid gap-4 rounded-xl border border-orange-100 bg-white p-4 sm:grid-cols-2">
              <div>
                <label className="mb-1 block text-xs font-semibold text-slate-600">
                  Your Name <span className="text-orange-500">*</span>
                </label>
                <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Enter your name" className={inputClass} />
              </div>
              <div>
                <label className="mb-1 block text-xs font-semibold text-slate-600">
                  Email Address <span className="text-orange-500">*</span>
                </label>
                <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Enter your email" className={inputClass} />
              </div>
            </div>

            <div className="mb-4 flex flex-col gap-3 rounded-xl border border-orange-100 bg-white px-5 py-4 sm:flex-row sm:items-center">
              <div className="sm:w-64">
                <label className="mb-1 block text-xs font-semibold text-slate-600">
                  Post Category <span className="text-orange-500">*</span>
                </label>
                <select value={activeType} onChange={(e) => changeType(e.target.value)} className={inputClass}>
                  {BLOG_TYPES.map((t) => (
                    <option key={t.key} value={t.key}>{t.label}</option>
                  ))}
                </select>
              </div>
              <p className="text-[11px] text-slate-400">
                Select a category; the extra fields below change accordingly. Title, content and SEO stay the same.
              </p>
            </div>

            <PostEditor
              key={activeType}
              config={cfg}
              form={form}
              setForm={setForm}
              editing={false}
              saving={saving}
              categories={categories}
              onSave={onSave}
              onCancel={onClose}
              submitLabel="Submit for Approval"
            />
          </>
        )}
      </div>
    </div>
  );
}