import React, { useMemo, useRef, useState } from "react";
import { ArrowLeft, Settings, Image as ImageIcon, FolderOpen, KeyRound, Star } from "lucide-react";
import { Card, MiniBtn, inputClass } from "../ui";
import { Field, ImageField, ComboField } from "../fields";
import RichEditor from "./RichEditor";
import FaqEditor from "./FaqEditor";
import TocPreview from "./TocPreview";
import TagInput from "./TagInput";
import SeoPanel from "../seo/SeoPanel";
import SeoScore from "../seo/SeoScore";
import {
  resolveSeo, analyzeSeo, slugify, wordCount, readingMinutes, toLocalInput, STATUS_OPTIONS,
} from "../seo/seoUtils";

const Label = ({ children, required, right }) => (
  <div className="mb-1 flex items-center justify-between gap-2">
    <label className="text-xs font-semibold text-slate-600">
      {children}{required && <span className="ml-0.5 text-orange-500">*</span>}
    </label>
    {right}
  </div>
);

const ErrorText = ({ message, isError }) =>
  message ? (
    <p className={`mt-1 text-[11px] text-red-500 ${isError ? "font-bold" : "font-medium"}`}>{message}</p>
  ) : null;

const URL_FIELD_NAME = /url|link|website|linkedin|twitter|instagram|facebook|youtube/i;
const SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

const isValidUrl = (value) => {
  try {
    const url = new URL(value);
    return (url.protocol === "http:" || url.protocol === "https:") && url.hostname.includes(".");
  } catch {
    return false;
  }
};

const validateForm = (form, config, words) => {
  const errors = {};
  const text = (value) => String(value ?? "").trim();

  const title = text(form.title);
  if (!title) errors.title = "Title is required.";
  else if (title.length < 10) errors.title = `Title must be at least 10 characters (currently ${title.length}).`;
  else if (title.length > 70) errors.title = `Title must be 70 characters or fewer (currently ${title.length}).`;

  const slug = text(form.slug);
  if (!slug) errors.slug = "Slug is required.";
  else if (!SLUG_PATTERN.test(slug)) errors.slug = "Slug can only contain lowercase letters, numbers and single hyphens.";
  else if (slug.length > 75) errors.slug = `Slug must be 75 characters or fewer (currently ${slug.length}).`;

  config.extraFields.forEach((f) => {
    const value = text(form[f.name]);
    const label = f.label || f.name;
    if (f.required && !value) {
      errors[f.name] = f.type === "select" || f.type === "combo" ? `Please select a ${label.toLowerCase()}.` : `${label} is required.`;
    } else if (value && f.type === "number" && !/^\d+$/.test(value)) {
      errors[f.name] = `${label} must be a whole number.`;
    } else if (value && (f.type === "url" || URL_FIELD_NAME.test(f.name)) && !isValidUrl(value)) {
      errors[f.name] = "Enter a valid URL starting with http:// or https://";
    } else if (value && f.type !== "textarea" && f.type !== "image" && value.length > 200) {
      errors[f.name] = "This field must be 200 characters or fewer.";
    }
  });

  if (text(form.focusKeyword).length > 60) errors.focusKeyword = "Focus keyword must be 60 characters or fewer.";
  if (Array.isArray(form.secondaryKeywords) && form.secondaryKeywords.length > 10) {
    errors.secondaryKeywords = "Add up to 10 secondary keywords.";
  }

  if (text(form.excerpt).length > 300) {
    errors.excerpt = `Excerpt must be 300 characters or fewer (currently ${text(form.excerpt).length}).`;
  }

  if (words === 0) errors.contentHtml = "Blog content is required.";
  else if (words < 50) errors.contentHtml = `Content should be at least 50 words (currently ${words}).`;

  if (form.faqEnabled) {
    const faqs = Array.isArray(form.faqs) ? form.faqs : [];
    const incomplete = faqs.some((f) => Boolean(text(f.q)) !== Boolean(text(f.a)));
    const complete = faqs.some((f) => text(f.q) && text(f.a));
    if (incomplete) errors.faqs = "Each FAQ needs both a question and an answer.";
    else if (!complete) errors.faqs = "Add at least one FAQ or turn the FAQ section off.";
  }

  if (!text(form.status)) errors.status = "Please select a status.";
  if (!text(form.publishDate)) errors.publishDate = "Publish date is required.";

  const readTime = text(form.readTime);
  if (readTime && (!/^\d+$/.test(readTime) || Number(readTime) < 1 || Number(readTime) > 180)) {
    errors.readTime = "Reading time must be a whole number between 1 and 180.";
  }

  if (text(form.image) && !text(form.imageAlt)) errors.imageAlt = "Alt text is required when an image is added.";
  else if (text(form.imageAlt).length > 125) errors.imageAlt = "Alt text must be 125 characters or fewer.";

  if (!text(form.category)) errors.category = "Please select a category.";
  if (Array.isArray(form.tags) && form.tags.length > 15) errors.tags = "Add up to 15 tags.";

  return errors;
};

export default function PostEditor({ config, form, setForm, editing, saving, categories, onSave, onCancel, submitLabel }) {
  const [slugTouched, setSlugTouched] = useState(editing);
  const [submitted, setSubmitted] = useState(false);
  const formRef = useRef(null);

  const segment = config.urlSegment ? config.urlSegment(form) : "";
  const resolved = useMemo(() => resolveSeo(form, config.urlPrefix, segment), [form, config.urlPrefix, segment]);
  const analysis = useMemo(() => analyzeSeo(form, resolved), [form, resolved]);
  const words = useMemo(() => wordCount(form.contentHtml), [form.contentHtml]);
  const errors = useMemo(() => validateForm(form, config, words), [form, config, words]);
  const errorCount = Object.keys(errors).length;

  const showError = (name) => (submitted && errors[name] ? errors[name] : "");
  const inputCls = (name) => (showError(name) ? `${inputClass} !border-red-400` : inputClass);

  const guard = (name, children, className = "") => (
    <div
      className={className}
      data-invalid={showError(name) ? "true" : undefined}
    >
      {children}
      <ErrorText message={showError(name)} isError />
    </div>
  );

  const patch = (p) => setForm((f) => ({ ...f, ...p }));
  const onFlat = (e) => patch({ [e.target.name]: e.target.value });
  const onSeoChange = (p) => setForm((f) => ({ ...f, seo: { ...f.seo, ...p } }));

  const onTitle = (e) => {
    const title = e.target.value;
    patch(slugTouched ? { title } : { title, slug: slugify(title) });
  };
  const onSlug = (e) => {
    setSlugTouched(true);
    patch({ slug: slugify(e.target.value) });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitted(true);
    if (errorCount > 0) {
      setTimeout(() => {
        formRef.current
          ?.querySelector('[data-invalid="true"]')
          ?.scrollIntoView({ behavior: "smooth", block: "center" });
      }, 50);
      return;
    }
    onSave(e);
  };

  const slugLocked = editing && config.lockSlugOnEdit;
  const publishLabel = submitLabel || (form.status === "published" ? (editing ? "Update Post" : "Publish Post") : "Save Draft");

  return (
    <form ref={formRef} onSubmit={handleSubmit} noValidate className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-orange-100 bg-white px-4 py-3">
        <div className="flex items-center gap-3">
          <button type="button" onClick={onCancel}
            className="inline-flex items-center gap-1.5 rounded-lg border border-orange-200 px-3 py-1.5 text-xs font-semibold text-slate-600 transition hover:bg-orange-50">
            <ArrowLeft className="h-3.5 w-3.5" /> Back
          </button>
          <h2 className="text-sm font-bold text-slate-900">
            {editing ? `Edit ${config.singular}` : `Add New ${config.singular}`}
          </h2>
        </div>
        <div className="flex items-center gap-2">
          {submitted && errorCount > 0 && (
            <span className="text-[11px] font-semibold text-red-500">
              Please fix {errorCount} {errorCount === 1 ? "error" : "errors"}
            </span>
          )}
          <span className="hidden text-[11px] font-semibold text-slate-400 sm:inline">
            {words} words • SEO {analysis.score}/100
          </span>
          <button type="submit" disabled={saving}
            className="rounded-lg bg-orange-500 px-5 py-2 text-xs font-semibold text-white shadow-sm transition hover:bg-orange-600 disabled:opacity-60">
            {saving ? "Processing..." : publishLabel}
          </button>
        </div>
      </div>

      <div className="grid items-start gap-5 xl:grid-cols-[minmax(0,1fr)_340px]">

        <div className="min-w-0 space-y-5">
          <Card title="Basic Details">
            <div className="grid gap-4 md:grid-cols-2">
              {guard("title", (
                <>
                  <Label required>Title</Label>
                  <input name="title" value={form.title} onChange={onTitle}
                    placeholder="Article  title" className={inputCls("title")} />
                </>
              ), "md:col-span-2")}
              <div
                className="md:col-span-2"
                data-invalid={showError("slug") ? "true" : undefined}
              >
                  <Label required>Slug (URL)</Label>
                  <input name="slug" value={form.slug} onChange={onSlug} disabled={slugLocked}
                    placeholder="Slug Build Automatically" className={inputCls("slug")} />
                  <ErrorText message={showError("slug")} isError />
                  <p className="mt-1 text-[11px] text-slate-400">
                    {config.urlPrefix}/{segment || form.slug || "your-slug"}
                    {slugLocked && " • The slug cannot be changed while editing."}
                  </p>
              </div>
              {config.extraFields.map((f) => (
                <div
                  key={f.name}
                  className={f.type === "textarea" ? "md:col-span-2" : ""}
                  data-invalid={showError(f.name) ? "true" : undefined}
                >
                  <Field field={f} value={form[f.name]} onChange={onFlat} editing={editing} />
                  <ErrorText message={showError(f.name)} isError />
                </div>
              ))}
            </div>
          </Card>

          <Card title="Focus & Secondary Keywords" icon={KeyRound}>
            <div className="grid gap-4 md:grid-cols-2">
              {guard("focusKeyword", (
                <>
                  <Label>Focus Keyword</Label>
                  <input value={form.focusKeyword} onChange={(e) => patch({ focusKeyword: e.target.value })}
                    placeholder="e.g. digital marketing" className={inputCls("focusKeyword")} />
                </>
              ))}
              {guard("secondaryKeywords", (
                <>
                  <Label>Secondary Keywords</Label>
                  <TagInput value={form.secondaryKeywords} onChange={(v) => patch({ secondaryKeywords: v })}
                    placeholder="Type keyword and press Enter or comma..." />
                </>
              ))}
            </div>
          </Card>

          <Card title="Excerpt (short summary)">
            {guard("excerpt", (
              <>
                <textarea value={form.excerpt} onChange={(e) => patch({ excerpt: e.target.value })} rows={3}
                  placeholder="A line summary of the article (leave blank to auto-generate from content)"
                  className={inputCls("excerpt")} />
              </>
            ))}
          </Card>

          <Card title="Blog Content"
            right={<span className="text-[11px] font-semibold text-slate-400">{words} words</span>}>
            {guard("contentHtml", (
              <RichEditor value={form.contentHtml} onChange={(v) => patch({ contentHtml: v })} />
            ))}
            <p className="mt-2 text-[11px] text-slate-400">
              Use Heading 2 / Heading 3 for subheadings; the Table of Contents will be generated from them
            </p>
          </Card>

          <TocPreview html={form.contentHtml} enabled={form.showToc} onToggle={(v) => patch({ showToc: v })} />

          {guard("faqs", (
            <FaqEditor enabled={form.faqEnabled} faqs={form.faqs}
              onToggle={(v) => patch({ faqEnabled: v, faqs: v && form.faqs.length === 0 ? [{ q: "", a: "" }] : form.faqs })}
              onChange={(faqs) => patch({ faqs })} />
          ))}

          <SeoPanel post={form} resolved={resolved} urlPrefix={config.urlPrefix} onSeoChange={onSeoChange} />
        </div>

        <div className="min-w-0 space-y-5 xl:sticky xl:top-16">
          <SeoScore result={analysis} />

          <Card title="Publishing" icon={Settings}>
            <div className="space-y-4">
              {guard("status", (
                <>
                  <Label required>Status</Label>
                  <select value={form.status} onChange={(e) => patch({ status: e.target.value })} className={inputCls("status")}>
                    {STATUS_OPTIONS.map((o) => (<option key={o.value} value={o.value}>{o.label}</option>))}
                  </select>
                </>
              ))}
              {guard("publishDate", (
                <>
                  <Label required right={<MiniBtn onClick={() => patch({ publishDate: toLocalInput() })}>Set to Current Time</MiniBtn>}>
                    Publish Date
                  </Label>
                  <input type="datetime-local" value={form.publishDate}
                    onChange={(e) => patch({ publishDate: e.target.value })} className={inputCls("publishDate")} />
                </>
              ))}
              {guard("readTime", (
                <>
                  <Label right={<MiniBtn onClick={() => patch({ readTime: String(readingMinutes(form.contentHtml)) })}>Auto Fetch</MiniBtn>}>
                    Reading Time
                  </Label>
                  <div className="flex items-center gap-2">
                    <input type="number" min="1" max="180" value={form.readTime}
                      onChange={(e) => patch({ readTime: e.target.value })} placeholder="auto"
                      className={`${inputCls("readTime")} w-24`} />
                    <span className="text-xs text-slate-500">min read</span>
                  </div>
                </>
              ))}
              <label className="flex items-center gap-2 text-xs font-semibold text-slate-700">
                <input type="checkbox" checked={form.allowComments}
                  onChange={(e) => patch({ allowComments: e.target.checked })} className="h-4 w-4 accent-orange-500" />
                Allow Comments
              </label>
              <label className="flex items-center gap-2 text-xs font-semibold text-slate-700">
                <input type="checkbox" checked={form.featured}
                  onChange={(e) => patch({ featured: e.target.checked })} className="h-4 w-4 accent-orange-500" />
                <Star className="h-3.5 w-3.5 text-amber-500" /> Featured Post
              </label>
            </div>
          </Card>

          <Card title="Featured Image" icon={ImageIcon}>
            <p className="mb-2 text-[11px] font-semibold text-emerald-600">Recommended Size: 1200 × 630 px (1.91:1 ratio)</p>
            <ImageField field={{ name: "image" }} value={form.image} onChange={onFlat} />
            {guard("imageAlt", (
              <>
                <Label required={!!form.image}>Alt Text</Label>
                <input value={form.imageAlt} onChange={(e) => patch({ imageAlt: e.target.value })}
                  placeholder="Describe the image for accessibility & SEO"
                  className={inputCls("imageAlt")} />
              </>
            ), "mt-3")}
          </Card>

          <Card title="Category & Tags" icon={FolderOpen}>
            <div className="space-y-4">
              {guard("category", (
                <>
                  <Label required>Category</Label>
                  <ComboField field={{ name: "category", label: "Category", options: categories, placeholder: "— Select Category —" }}
                    value={form.category} onChange={onFlat} />
                </>
              ))}
              {guard("tags", (
                <>
                  <Label>Tags</Label>
                  <TagInput value={form.tags} onChange={(v) => patch({ tags: v })}
                    placeholder="Type tag and press Enter or comma..." />
                </>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </form>
  );
}