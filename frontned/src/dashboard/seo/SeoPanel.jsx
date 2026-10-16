import React, { useState } from "react";
import { Search, Share2, Globe, AtSign, Eye, Zap, CornerDownLeft, Monitor, Smartphone, Sparkles } from "lucide-react";
import { Card, MiniBtn, inputClass } from "../ui";
import { SITE_URL } from "../config";
import { ROBOTS_OPTIONS, SCHEMA_OPTIONS, LANGUAGE_OPTIONS, TWITTER_CARD_OPTIONS } from "./seoUtils";

const host = SITE_URL.replace(/^https?:\/\//, "");

function Label({ children, right }) {
  return (
    <div className="mb-1 flex items-center justify-between gap-2">
      <label className="text-xs font-semibold text-slate-600">{children}</label>
      {right}
    </div>
  );
}


function SeoInput({ label, value, onChange, autoValue, autoText, syncLabel, onSync, multiline, counter, hint, rows = 3, placeholder }) {
  const Tag = multiline ? "textarea" : "input";
  const shown = value || autoValue || "";
  return (
    <div>
      <Label right={onSync && (
        <MiniBtn onClick={onSync}><CornerDownLeft className="h-3 w-3" /> {syncLabel}</MiniBtn>
      )}>
        {label}
      </Label>
      <Tag value={value} onChange={(e) => onChange(e.target.value)} rows={multiline ? rows : undefined}
        placeholder={placeholder || autoText} className={inputClass} />
      <div className="mt-1 flex items-center justify-between gap-2">
        <p className="flex items-center gap-1 text-[11px] text-orange-600">
          <Zap className="h-3 w-3" />
          {value ? "Manual" : `Auto → ${autoText}`}
        </p>
        {counter && (
          <p className={`text-[11px] font-semibold ${
            shown.length >= counter[0] && shown.length <= counter[1] ? "text-emerald-600" : "text-slate-400"
          }`}>
            {shown.length} / {counter[1]}
          </p>
        )}
      </div>
      {hint && <p className="text-[11px] text-slate-400">{hint}</p>}
    </div>
  );
}

function SelectField({ label, value, onChange, options }) {
  return (
    <div>
      <Label>{label}</Label>
      <select value={value} onChange={(e) => onChange(e.target.value)} className={inputClass}>
        {options.map((o) => (<option key={o.value} value={o.value}>{o.label}</option>))}
      </select>
    </div>
  );
}

function SocialCard({ image, title, description, platform, twitter, cardType }) {
  return (
    <div className="max-w-md overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
      <div className="flex h-40 items-center justify-center bg-slate-100">
        {image ? (
          <img src={image} alt="" className="h-full w-full object-cover" />
        ) : (
          <p className="px-4 text-center text-xs text-slate-400">No image — Featured Image will auto-fill</p>
        )}
      </div>
      <div className="space-y-0.5 px-4 py-3">
        {!twitter && <p className="text-[10px] uppercase tracking-wide text-slate-400">{host}</p>}
        <p className="line-clamp-2 text-sm font-bold text-slate-900">{title || "Blog Post Title"}</p>
        <p className="line-clamp-2 text-xs text-slate-500">
          {description || (twitter ? "Twitter card description." : "Meta description will appear here.")}
        </p>
        {twitter && (
          <p className="flex items-center gap-1 pt-1 text-[11px] text-slate-400"><AtSign className="h-3 w-3" /> {host}</p>
        )}
      </div>
      <p className="flex items-center gap-1.5 border-t border-slate-100 bg-slate-50 px-4 py-1.5 text-[10px] text-slate-400">
        {twitter ? <AtSign className="h-3 w-3" /> : <Globe className="h-3 w-3" />}
        {platform}{cardType ? ` · ${cardType}` : ""}
      </p>
    </div>
  );
}

export default function SeoPanel({ post, resolved, urlPrefix, onSeoChange }) {
  const [device, setDevice] = useState("desktop");
  const seo = post.seo;
  const set = (key) => (v) => onSeoChange({ [key]: v });

  const fetchAllSocial = () =>
    onSeoChange({
      ogTitle: resolved.metaTitle,
      ogDescription: resolved.metaDescription,
      ogImage: post.image || "",
      twitterTitle: resolved.metaTitle,
      twitterDescription: resolved.metaDescription,
      twitterImage: post.image || "",
    });

  const googleTitle = resolved.metaTitle || "Blog Post Title";
  const googleDesc = resolved.metaDescription || "Your meta description will appear here in search results.";
  const crumb = resolved.urlPath ? `${host} › ${urlPrefix.replace(/^\//, "")} › ${resolved.urlPath}` : `${host} › blogs › your-blog-slug`;

  return (
    <>

      <Card title="SEO Settings" icon={Search}
        right={
          <MiniBtn onClick={() => onSeoChange({ metaTitle: "", metaDescription: "", canonicalUrl: "" })}>
            <Sparkles className="h-3 w-3" /> Reset to Auto
          </MiniBtn>
        }>
        <div className="grid gap-4 md:grid-cols-2">
          <div className="md:col-span-2">
            <SeoInput label="Meta Title" value={seo.metaTitle} onChange={set("metaTitle")}
              autoValue={resolved.auto.metaTitle} autoText={resolved.auto.metaTitle || "Blog title se"}
              placeholder="Auto-fetches from Blog Title" counter={[30, 60]}
              syncLabel="Sync from Title" onSync={() => set("metaTitle")(resolved.auto.metaTitle)} />
          </div>
          <div className="md:col-span-2">
            <SeoInput label="Meta Description" multiline rows={3} value={seo.metaDescription}
              onChange={set("metaDescription")} autoValue={resolved.auto.metaDescription}
              autoText={resolved.auto.metaDescription || "Excerpt / content se"}
              placeholder="Auto-fetches from Excerpt or Content" counter={[120, 160]}
              syncLabel="Sync from Excerpt" onSync={() => set("metaDescription")(resolved.auto.metaDescription)} />
          </div>
          <div className="md:col-span-2">
            <SeoInput label="Canonical URL" value={seo.canonicalUrl} onChange={set("canonicalUrl")}
              autoValue={resolved.auto.canonicalUrl} autoText={resolved.auto.canonicalUrl || `${SITE_URL}${urlPrefix}/<slug>`}
              placeholder={`${SITE_URL}${urlPrefix}/your-slug`}
              syncLabel="Sync from Slug" onSync={() => set("canonicalUrl")(resolved.auto.canonicalUrl)}
              hint="Leave blank to auto-generate from slug, or enter your URL manually." />
          </div>
          <SelectField label="Robots Meta" value={seo.robots} onChange={set("robots")} options={ROBOTS_OPTIONS} />
          <SelectField label="Schema Type" value={seo.schemaType} onChange={set("schemaType")} options={SCHEMA_OPTIONS} />
          <SelectField label="Language" value={seo.language} onChange={set("language")} options={LANGUAGE_OPTIONS} />
        </div>
      </Card>


      <Card title="Open Graph & Twitter Social Tags" icon={Share2}
        right={
          <button type="button" onClick={fetchAllSocial}
            className="inline-flex items-center gap-1.5 rounded-lg border border-orange-300 bg-orange-50 px-3 py-1.5 text-xs font-bold text-orange-700 transition hover:bg-orange-100">
            <Zap className="h-3.5 w-3.5" /> Auto Fetch All Social Tags
          </button>
        }>
        <p className="mb-4 flex items-center gap-2 rounded-lg border border-orange-100 bg-orange-50/60 px-3 py-2 text-xs text-orange-800">
          <Sparkles className="h-4 w-4 shrink-0" />
<span><b>Auto-Fetch Mode:</b> OG & Twitter tags will auto-fill from Meta Title, Meta Description & Featured Image when left blank.</span>
        </p>

        <p className="mb-3 border-l-4 border-orange-400 bg-orange-50/50 px-3 py-2 text-xs font-bold text-slate-800">
          Open Graph Tags <span className="font-normal text-slate-400">— Facebook, LinkedIn, WhatsApp, Telegram</span>
        </p>
        <div className="space-y-4">
          <SeoInput label="og:title" value={seo.ogTitle} onChange={set("ogTitle")}
            autoValue={resolved.metaTitle} autoText={resolved.metaTitle || "Meta Title"}
            placeholder="Auto-fetches from Meta Title"
            syncLabel="Sync from Meta Title" onSync={() => set("ogTitle")(resolved.metaTitle)} />
          <SeoInput label="og:description" multiline rows={3} value={seo.ogDescription} onChange={set("ogDescription")}
            autoValue={resolved.metaDescription} autoText={resolved.metaDescription || "Meta Description"}
            placeholder="Auto-fetches from Meta Description"
            syncLabel="Sync from Meta Desc" onSync={() => set("ogDescription")(resolved.metaDescription)} />
          <SeoInput label="og:image (Recommended: 1200×630px)" value={seo.ogImage} onChange={set("ogImage")}
            autoValue={post.image} autoText="Featured Image" placeholder="Auto-fetches Featured Image"
            syncLabel="Sync Featured Image" onSync={() => set("ogImage")(post.image || "")} />
        </div>

        <p className="mb-3 mt-6 border-l-4 border-sky-400 bg-sky-50/50 px-3 py-2 text-xs font-bold text-slate-800">
          Twitter / X Tags <span className="font-normal text-slate-400">— twitter:card, title, description, image</span>
        </p>
        <div className="space-y-4">
          <SelectField label="twitter:card" value={seo.twitterCard} onChange={set("twitterCard")} options={TWITTER_CARD_OPTIONS} />
          <SeoInput label="twitter:title" value={seo.twitterTitle} onChange={set("twitterTitle")}
            autoValue={resolved.ogTitle} autoText="OG Title / Meta Title" placeholder="Auto-fetches from OG Title"
            syncLabel="Sync from OG Title" onSync={() => set("twitterTitle")(resolved.ogTitle)} />
          <SeoInput label="twitter:description" multiline rows={3} value={seo.twitterDescription}
            onChange={set("twitterDescription")} autoValue={resolved.ogDescription} autoText="OG Description"
            placeholder="Auto-fetches from OG Description"
            syncLabel="Sync from OG Desc" onSync={() => set("twitterDescription")(resolved.ogDescription)} />
          <SeoInput label="twitter:image" value={seo.twitterImage} onChange={set("twitterImage")}
            autoValue={resolved.ogImage} autoText="OG Image / Featured Image" placeholder="Auto-fetches OG Image"
            syncLabel="Sync from OG Image" onSync={() => set("twitterImage")(resolved.ogImage)} />
        </div>

        <p className="mb-3 mt-6 flex items-center gap-2 text-xs font-bold text-slate-500">
          <Eye className="h-4 w-4" /> Live Social Card Preview
        </p>
        <div className="grid gap-4 md:grid-cols-2">
          <SocialCard image={resolved.ogImage} title={resolved.ogTitle} description={resolved.ogDescription}
            platform="Facebook / LinkedIn Preview" />
          <SocialCard twitter image={resolved.twitterImage} title={resolved.twitterTitle}
            description={resolved.twitterDescription} platform="Twitter / X Card Preview" cardType={seo.twitterCard} />
        </div>
      </Card>


      <Card title="Google Search Preview" icon={Globe}
        right={
          <div className="inline-flex overflow-hidden rounded-lg border border-orange-200 text-[11px] font-semibold">
            {[["desktop", Monitor, "Desktop"], ["mobile", Smartphone, "Mobile"]].map(([key, Icon, label]) => (
              <button key={key} type="button" onClick={() => setDevice(key)}
                className={`inline-flex items-center gap-1 px-3 py-1.5 transition ${
                  device === key ? "bg-orange-500 text-white" : "bg-white text-slate-600 hover:bg-orange-50"
                }`}>
                <Icon className="h-3.5 w-3.5" /> {label}
              </button>
            ))}
          </div>
        }>
        <div className={`rounded-xl border border-slate-200 bg-white p-4 ${device === "mobile" ? "max-w-[360px]" : "max-w-2xl"}`}>
          <div className="flex items-center gap-2.5">
            <span className="flex h-7 w-7 items-center justify-center rounded-full bg-orange-100 text-xs font-bold text-orange-600">
              {host.charAt(0).toUpperCase()}
            </span>
            <div className="min-w-0">
              <p className="truncate text-sm text-slate-800">{host}</p>
              <p className="truncate text-xs text-slate-500">{crumb}</p>
            </div>
          </div>
          <p className={`mt-2 font-medium text-blue-700 ${device === "mobile" ? "text-base" : "text-xl"} line-clamp-2`}>
            {googleTitle}
          </p>
          <p className="mt-1 line-clamp-3 text-sm text-slate-600">{googleDesc}</p>
        </div>
      </Card>
    </>
  );
}
