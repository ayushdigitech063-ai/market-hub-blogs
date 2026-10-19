import React, { useMemo, useState } from "react";
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
export default function PostEditor({ config, form, setForm, editing, saving, categories, onSave, onCancel, submitLabel }) {
  const [slugTouched, setSlugTouched] = useState(editing);

  const segment = config.urlSegment ? config.urlSegment(form) : "";
  const resolved = useMemo(() => resolveSeo(form, config.urlPrefix, segment), [form, config.urlPrefix, segment]);
  const analysis = useMemo(() => analyzeSeo(form, resolved), [form, resolved]);
  const words = useMemo(() => wordCount(form.contentHtml), [form.contentHtml]);

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

  const slugLocked = editing && config.lockSlugOnEdit;
 const publishLabel = submitLabel || (form.status === "published" ? (editing ? "Update Post" : "Publish Post") : "Save Draft");

  return (
    <form onSubmit={onSave} className="space-y-5">
      {/* TOP BAR */}
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
              <div className="md:col-span-2">
                <Label required>Title</Label>
                <input name="title" value={form.title} onChange={onTitle} required
                  placeholder="Article  title" className={inputClass} />
              </div>
              <div className="md:col-span-2">
                <Label required>Slug (URL)</Label>
                <input name="slug" value={form.slug} onChange={onSlug} required disabled={slugLocked}
                  placeholder="Slug Build Automatically" className={inputClass} />
                <p className="mt-1 text-[11px] text-slate-400">
                  {config.urlPrefix}/{segment || form.slug || "your-slug"}
                  {slugLocked && " • Edit me slug change nahi hota."}
                </p>
              </div>
              {config.extraFields.map((f) => (
                <Field key={f.name} field={f} value={form[f.name]} onChange={onFlat} editing={editing} />
              ))}
            </div>
          </Card>

          <Card title="Focus & Secondary Keywords" icon={KeyRound}>
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <Label>Focus Keyword</Label>
                <input value={form.focusKeyword} onChange={(e) => patch({ focusKeyword: e.target.value })}
                  placeholder="e.g. digital marketing" className={inputClass} />
                <p className="mt-1 text-[11px] text-slate-400">Main keyword for this article (only one).</p>
              </div>
              <div>
                <Label>Secondary Keywords</Label>
                <TagInput value={form.secondaryKeywords} onChange={(v) => patch({ secondaryKeywords: v })}
                  placeholder="Type keyword and press Enter or comma..." />
                <p className="mt-1 text-[11px] text-slate-400">Related keywords (as many as you like).</p>
              </div>
            </div>
          </Card>

          <Card title="Excerpt (short summary)">
            <textarea value={form.excerpt} onChange={(e) => patch({ excerpt: e.target.value })} rows={3}
              placeholder="A line summary of the article (leave blank to auto-generate from content)"
              className={inputClass} />
          </Card>

          <Card title="Blog Content"
            right={<span className="text-[11px] font-semibold text-slate-400">{words} words</span>}>
            <RichEditor value={form.contentHtml} onChange={(v) => patch({ contentHtml: v })} />
            <p className="mt-2 text-[11px] text-slate-400">
Use Heading 2 / Heading 3 for subheadings; the Table of Contents will be generated from them
            </p>
          </Card>

          <TocPreview html={form.contentHtml} enabled={form.showToc} onToggle={(v) => patch({ showToc: v })} />

          <FaqEditor enabled={form.faqEnabled} faqs={form.faqs}
            onToggle={(v) => patch({ faqEnabled: v, faqs: v && form.faqs.length === 0 ? [{ q: "", a: "" }] : form.faqs })}
            onChange={(faqs) => patch({ faqs })} />

          <SeoPanel post={form} resolved={resolved} urlPrefix={config.urlPrefix} onSeoChange={onSeoChange} />
        </div>


        <div className="min-w-0 space-y-5 xl:sticky xl:top-16">
          <SeoScore result={analysis} />

          <Card title="Publishing" icon={Settings}>
            <div className="space-y-4">
              <div>
                <Label required>Status</Label>
                <select value={form.status} onChange={(e) => patch({ status: e.target.value })} className={inputClass}>
                  {STATUS_OPTIONS.map((o) => (<option key={o.value} value={o.value}>{o.label}</option>))}
                </select>
              </div>
              <div>
                <Label right={<MiniBtn onClick={() => patch({ publishDate: toLocalInput() })}>Set to Current Time</MiniBtn>}>
                  Publish Date
                </Label>
                <input type="datetime-local" value={form.publishDate}
                  onChange={(e) => patch({ publishDate: e.target.value })} className={inputClass} />
              </div>
              <div>
                <Label right={<MiniBtn onClick={() => patch({ readTime: String(readingMinutes(form.contentHtml)) })}>Auto Fetch</MiniBtn>}>
                  Reading Time
                </Label>
                <div className="flex items-center gap-2">
                  <input type="number" min="1" value={form.readTime}
                    onChange={(e) => patch({ readTime: e.target.value })} placeholder="auto"
                    className={`${inputClass} w-24`} />
                  <span className="text-xs text-slate-500">min read</span>
                </div>
              </div>
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
            <div className="mt-3">
              <Label required={!!form.image}>Alt Text</Label>
              <input value={form.imageAlt} onChange={(e) => patch({ imageAlt: e.target.value })}
                required={!!form.image} placeholder="Describe the image for accessibility & SEO"
                className={inputClass} />
            </div>
          </Card>

          <Card title="Category & Tags" icon={FolderOpen}>
            <div className="space-y-4">
              <div>
                <Label required>Category</Label>
                <ComboField field={{ name: "category", label: "Category", options: categories, placeholder: "— Select Category —" }}
                  value={form.category} onChange={onFlat} />
              </div>
              <div>
                <Label>Tags</Label>
                <TagInput value={form.tags} onChange={(v) => patch({ tags: v })}
                  placeholder="Type tag and press Enter or comma..." />
              </div>
            </div>
          </Card>
        </div>
      </div>
    </form>
  );
}
