import React, { useState, useEffect, useMemo, useRef } from "react";
import {
  UserRound, Newspaper, Building2, PenLine, BookOpen, Smartphone, Layers,
  Menu, X, Search, Pencil, Trash2, LayoutDashboard, LogOut,
  Mail, Lock, KeyRound, User, ArrowRight, Database, Plus, UploadCloud, Loader2,
} from "lucide-react";

const API = "http://localhost:5000/api";


const TOKEN_KEY = "admin_token";

const authFetch = (url, opts = {}) => {
  const token = localStorage.getItem(TOKEN_KEY);
  return fetch(url, {
    ...opts,
    headers: { ...(opts.headers || {}), ...(token ? { Authorization: `Bearer ${token}` } : {}) },
  }).then((res) => {
    if (res.status === 401) {
      localStorage.removeItem(TOKEN_KEY);
      window.dispatchEvent(new Event("admin-logout"));
    }
    return res;
  });
};


const emptyBio = {
  name: "", slug: "", role: "", company: "", category: "", type: "",
  image: "", shortBio: "", description: "", born: "", birthplace: "",
  linkedin: "", twitter: "", instagram: "", website: "",
};
const emptySlidingCompany = {
  slug: "", name: "", imageURL: "", description: "", tagline: "VERIFIED PARTNER",
  blog: "", features: "", website: "", order: "", active: "true",
};
const emptyArticle = {
  id: "", slug: "", title: "", company: "", category: "", author: "", date: "",
  readTime: "", image: "", excerpt: "", content: "",
};
const emptyCompany = { name: "", slug: "", imageURL: "", description: "", startId: "", endId: "" };
const emptyBlogAuthor = {
  id: "", name: "", role: "", company: "", image: "", about: "", education: "",
  expertise: "", twitter: "", linkedin: "", instagram: "", youtube: "",
};
const emptyBlogArticle = {
  id: "", slug: "", title: "", category: "", authorId: "", date: "",
  readTime: "", image: "", excerpt: "", content: "",
};
const emptyBrand = {
  slug: "", name: "", brand: "", category: "", subCategory: "",
  imageUrl: "", description: "", blog: "", features: "", featured: "false", order: "",
};
const emptyLatestArticle = {
  slug: "", title: "", category: "", author: "Admin", date: "",
  readTime: "", image: "", excerpt: "", content: "", order: "", active: "true",
};


// Fixed dropdown options for Biographies (keep in sync with src/data/biographyFilters.js)
const BIO_CATEGORY_OPTIONS = [
  { value: "Business", label: "Business (includes CEOs)" },
  { value: "Sports", label: "Sports" },
  { value: "Entrepreneur", label: "Entrepreneur" },
  { value: "Actors", label: "Actors" },
];
const BIO_TYPE_OPTIONS = [
  { value: "ceo", label: "CEO" },
  { value: "sports", label: "Sports" },
  { value: "entrepreneur", label: "Entrepreneur" },
  { value: "actor", label: "Actor" },
];

const bioFields = [
  { name: "name", label: "Name / Title", placeholder: "e.g. Sundar Pichai", required: true },
  { name: "slug", label: "Slug (URL friendly name)", placeholder: "e.g. sundar-pichai", required: true },
  { name: "role", label: "Role / Designation", type: "combo", placeholder: "Select a role",
    hint: "Pick an existing designation, or choose '+ Add new...'." },
  { name: "company", label: "Company / Organization", placeholder: "e.g. Google" },
  { name: "category", label: "Category", type: "select", options: BIO_CATEGORY_OPTIONS,
    placeholder: "Select a category", hint: "Decides where the profile appears on the website." },
  { name: "type", label: "Type (for filtering routes)", type: "select", options: BIO_TYPE_OPTIONS,
    placeholder: "Select a type", hint: "Pick the type that matches the category." },
  { name: "image", type: "image", label: "Image", placeholder: "Paste direct image link here", span2: true },
  { name: "born", label: "Born Info", placeholder: "e.g. June 10, 1972" },
  { name: "birthplace", label: "Birthplace", placeholder: "e.g. Madurai, India" },
  { name: "linkedin", label: "LinkedIn Profile URL", placeholder: "https://linkedin.com/in/username" },
  { name: "twitter", label: "Twitter / X Profile URL", placeholder: "https://twitter.com/username" },
  { name: "instagram", label: "Instagram Profile URL", placeholder: "https://instagram.com/username" },
  { name: "website", label: "Personal Website URL", placeholder: "https://example.com" },
  { name: "shortBio", label: "Short Bio", type: "textarea", rows: 2, span2: true, placeholder: "Write a brief overview..." },
  { name: "description", label: "Full Blog Content / Description", type: "textarea", rows: 6, span2: true, placeholder: "Write full detailed biography or blog content here..." },
];
// Filter dropdowns shown above the Biographies list
const bioFilters = [
  { key: "category", label: "Category", get: (i) => i.category, options: BIO_CATEGORY_OPTIONS },
  { key: "type", label: "Type", get: (i) => i.type, options: BIO_TYPE_OPTIONS },
  { key: "role", label: "Role", get: (i) => i.role },
];
const slidingCompanyFields = [
  { name: "name", label: "Company Name", placeholder: "e.g. Google", required: true },
  { name: "slug", label: "Unique ID (Slug)", placeholder: "e.g. google", required: true, lockOnEdit: true },
  { name: "imageURL", type: "image", label: "Logo / Image", placeholder: "Paste direct image link", span2: true },
  { name: "tagline", label: "Card Tag (neeche wala text)", placeholder: "VERIFIED PARTNER" },
  { name: "website", label: "Website URL", placeholder: "https://example.com" },
  { name: "description", label: "Card Description", type: "textarea", rows: 2, span2: true, placeholder: "Card par dikhne wali short line" },
  { name: "blog", label: "Full Page Content", type: "textarea", rows: 10, span2: true,
    placeholder: "Detail page contant", hint: "Naya paragraph = khali line chhodo." },
  { name: "features", label: "Key Highlights", type: "textarea", rows: 5, span2: true,
    placeholder: "Cloud services\nAI tools", hint: "Har point nayi line me." },
];
const articleFields = [
  { name: "id", label: "Article ID (unique number)", type: "number", lockOnEdit: true, placeholder: "Khali chhodo to next ID auto lag jayegi" },
  { name: "slug", label: "Slug", placeholder: "e.g. microsoft-azure-cloud", required: true },
  { name: "title", label: "Title", placeholder: "Article ka title", required: true, span2: true },
  { name: "company", label: "Company Slug (optional)", placeholder: "e.g. microsoft, jpmorgan",
    hint: "Ye likhoge to article usi company ke page par dikhega." },
  { name: "category", label: "Category", placeholder: "e.g. Microsoft, SEO", required: true },
  { name: "author", label: "Author", placeholder: "e.g. Admin", required: true },
  { name: "date", label: "Date", placeholder: "e.g. October 7, 2026" },
  { name: "readTime", label: "Read Time", placeholder: "e.g. 6 min read" },
  { name: "image", type: "image", label: "Image", placeholder: "Paste direct image link here", span2: true },
  { name: "excerpt", label: "Excerpt (short summary)", type: "textarea", rows: 2, span2: true, placeholder: "Article ki ek-do line ki summary" },
  { name: "content", label: "Content", type: "textarea", rows: 10, span2: true,
    placeholder: "Article ka poora content yahan likho...",
    hint: "Naya paragraph = khali line chhodo  •  Heading = ### Heading  •  List = - point  •  Bold = **text**" },
];
const companyFields = [
  { name: "name", label: "Company Name", placeholder: "e.g. Microsoft", required: true },
  { name: "slug", label: "Slug (URL)", placeholder: "e.g. microsoft", required: true, lockOnEdit: true },
  { name: "imageURL", type: "image", label: "Image", placeholder: "Company card ki image ka link", required: true, span2: true },
  { name: "startId", label: "Start Article ID", type: "number", placeholder: "e.g. 101", required: true },
  { name: "endId", label: "End Article ID", type: "number", placeholder: "e.g. 110", required: true },
  { name: "description", label: "Description", type: "textarea", rows: 3, span2: true, required: true, placeholder: "Company ke baare me short description" },
];
const blogAuthorFields = [
  { name: "id", label: "Author ID", placeholder: "e.g. sudha-murty", required: true, lockOnEdit: true,
    hint: "Chhote akshar, bina space ke. Articles me yahi ID author ke naam se judti hai." },
  { name: "name", label: "Author Name", placeholder: "e.g. Sudha Murty", required: true },
  { name: "role", label: "Role", placeholder: "e.g. Author, Philanthropist & Educator" },
  { name: "company", label: "Organization", placeholder: "e.g. Independent Author" },
  { name: "image", type: "image", label: "Profile Picture", placeholder: "Paste direct image link here", span2: true },
  { name: "about", label: "About the Author", type: "textarea", rows: 4, span2: true, placeholder: "Author ke baare me likho..." },
  { name: "education", label: "Education / Background", placeholder: "e.g. MBA, IIM Calcutta", span2: true },
  { name: "expertise", label: "Expertise", placeholder: "Indian Mythology, Storytelling, Philosophy", span2: true,
    hint: "Comma (,) laga kar alag-alag likho." },
  { name: "twitter", label: "Twitter / X URL", placeholder: "https://x.com/username" },
  { name: "linkedin", label: "LinkedIn URL", placeholder: "https://linkedin.com/in/username" },
  { name: "instagram", label: "Instagram URL", placeholder: "https://instagram.com/username" },
  { name: "youtube", label: "YouTube URL", placeholder: "https://youtube.com/@channel" },
];
const latestArticleFields = [
  { name: "title", label: "Title", placeholder: "Article ka title", required: true, span2: true },
  { name: "slug", label: "Unique ID (Slug)", placeholder: "e.g. what-is-seo", required: true, lockOnEdit: true,
    hint: "Chhote akshar, bina space ke. Link /latest-article/<slug> banega." },
  { name: "category", label: "Category", placeholder: "e.g. SEO, AI Search", required: true },
  { name: "author", label: "Author", placeholder: "e.g. Admin" },
  { name: "date", label: "Date", placeholder: "e.g. October 8, 2026" },
  { name: "readTime", label: "Read Time", placeholder: "e.g. 6 min read" },
  { name: "order", label: "Order", type: "number", placeholder: "e.g. 1", hint: "Chota number pehle dikhega." },
  { name: "active", label: "Home par dikhana hai?", type: "select",
    options: [{ value: "true", label: "Haan" }, { value: "false", label: "Nahi" }] },
  { name: "image", type: "image", label: "Image", placeholder: "Paste direct image link", span2: true },
  { name: "excerpt", label: "Short Summary", type: "textarea", rows: 2, span2: true },
  { name: "content", label: "Full Article Content", type: "textarea", rows: 10, span2: true,
    hint: "Naya paragraph = khali line chhodo." },
];
const brandFields = [
  { name: "name", label: "Product / Article Title", placeholder: "e.g. Vivo X200 Pro", required: true, span2: true },
  { name: "slug", label: "Slug (URL)", placeholder: "e.g. vivo-x200-pro", required: true, lockOnEdit: true,
    hint: "Chhote akshar, bina space ke. Page ka link /brand/<slug> banta hai." },
  { name: "brand", label: "Brand", placeholder: "e.g. Jio, Vivo, Apple", required: true },
  { name: "category", label: "Category", placeholder: "e.g. Smartphones, Laptops", required: true },
  { name: "subCategory", label: "Sub Category", placeholder: "e.g. Flagship Phone" },
  { name: "imageUrl", type: "image", label: "Image", placeholder: "Paste direct image link here", span2: true },
  { name: "featured", label: "Home page par dikhana hai?", type: "select",
    options: [{ value: "true", label: "Haan, Featured me dikhao" }, { value: "false", label: "Nahi" }] },
  { name: "order", label: "Order (card position)", type: "number", placeholder: "e.g. 1", hint: "Chota number pehle dikhega." },
  { name: "description", label: "Short Description (card + overview)", type: "textarea", rows: 2, span2: true, placeholder: "Card par dikhne wali chhoti summary" },
  { name: "blog", label: "Full Blog Content", type: "textarea", rows: 10, span2: true,
    placeholder: "Poora blog yahan likho...", hint: "Naya paragraph = khali line chhodo." },
  { name: "features", label: "Key Features", type: "textarea", rows: 5, span2: true,
    placeholder: "4G connectivity\n1000 mAh battery\nPhysical keypad", hint: "Har feature nayi line me likho." },
];
const buildBlogArticleFields = (authorOptions) => [
  { name: "id", label: "Article ID", placeholder: "Khali chhodo to auto lag jayegi (art-078...)", lockOnEdit: true },
  { name: "slug", label: "Slug", placeholder: "e.g. sudha-murty-life-lessons", required: true, lockOnEdit: true,
    hint: "Chhote akshar, bina space ke. Ye article ke URL me aata hai." },
  { name: "title", label: "Title", placeholder: "Article ka title", required: true, span2: true },
  { name: "authorId", label: "Author", type: "select", options: authorOptions, placeholder: "Author chuno", required: true },
  { name: "category", label: "Category", placeholder: "e.g. Biography, Books & Literature", required: true },
  { name: "date", label: "Date", placeholder: "e.g. Oct 8, 2026" },
  { name: "readTime", label: "Read Time", placeholder: "e.g. 8 min read" },
  { name: "image", type: "image", label: "Image", placeholder: "Paste direct image link here", span2: true },
  { name: "excerpt", label: "Excerpt (short summary)", type: "textarea", rows: 2, span2: true, placeholder: "Article ki ek-do line ki summary" },
  { name: "content", label: "Content", type: "textarea", rows: 10, span2: true,
    placeholder: "Please Write The Full Aritcle contents", hint: "please do Write a spcae line between every paragraph" },
];


const META = {
  biographies: { group: "Website Content", title: "Biographies", desc: "Pleaase Manage Your Biography profiles ." },
  articles: { group: "Website Content", title: "Articles", desc: "Please Manage Your Company Profile." },
  companies: { group: "Website Content", title: "Companies", desc: "Please Msnage Companies Cards Articles" },
  authors: { group: "Author Blog", title: "Authors", desc: "Please Manage Author Profile " },
  blogArticles: { group: "Author Blog", title: "Author Articles", desc: "Please Manage Author Articles" },
  brands: { group: "Brands & Products", title: "Brands & Products", desc: "Please Manage Brands Cards of Home page" },
  slidingCompanies: { group: "Sliding Companies", title: "Sliding Companies", desc: "Please Manage Home PageSliding Section" },
  latestArticles: { group: "Latest Articles", title: "Latest Articles", desc: "Please Manage Your Home page Latest Articles." },
};
const NAV = [
  { group: "Main", items: [{ key: "overview", label: "Overview", Icon: LayoutDashboard }] },
  { group: "Website Content", items: [
    { key: "biographies", label: "Biographies", Icon: UserRound },
    { key: "articles", label: "Articles", Icon: Newspaper },
    { key: "companies", label: "Companies", Icon: Building2 },
  ] },
  { group: "Author Blog", items: [
    { key: "authors", label: "Authors", Icon: PenLine },
    { key: "blogArticles", label: "Author Articles", Icon: BookOpen },
  ] },
  { group: "Latest Articles", items: [{ key: "latestArticles", label: "Latest Articles", Icon: Newspaper }] },
  { group: "Brands & Products", items: [{ key: "brands", label: "Brands", Icon: Smartphone }] },
  { group: "Sliding Companies", items: [{ key: "slidingCompanies", label: "Sliding Companies", Icon: Layers }] },
];


const SCROLL_CSS = `
html{scrollbar-width:thin;scrollbar-color:#fdba74 #fff7ed}
::-webkit-scrollbar{width:8px;height:8px}
::-webkit-scrollbar-track{background:#fff7ed}
::-webkit-scrollbar-thumb{background:#fdba74;border-radius:8px}
::-webkit-scrollbar-thumb:hover{background:#fb923c}
.nav-scroll{scrollbar-width:none}
.nav-scroll::-webkit-scrollbar{display:none}
@keyframes modalPop{from{opacity:0;transform:translateY(14px) scale(.98)}to{opacity:1;transform:none}}
.modal-pop{animation:modalPop .2s ease-out}
`;
const GlobalStyle = () => <style>{SCROLL_CSS}</style>;


const inputClass =
  "w-full rounded-lg border border-orange-200 bg-white px-3 py-2 text-[13px] text-slate-800 placeholder-slate-400 outline-none transition focus:border-orange-400 focus:ring-2 focus:ring-orange-300/40 disabled:cursor-not-allowed disabled:bg-orange-50 disabled:text-slate-400";

const MAX_IMAGE_MB = 5;

// Image field: device se choose / drag-drop karke upload (multer backend), ya link paste karo
function ImageField({ field, value, onChange }) {
  const inputRef = useRef(null);
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [error, setError] = useState("");

  const setValue = (v) => onChange({ target: { name: field.name, value: v } });

  const upload = async (file) => {
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setError("Sirf image file chuno (JPG, PNG, WEBP, GIF).");
      return;
    }
    if (file.size > MAX_IMAGE_MB * 1024 * 1024) {
      setError(`Image ${MAX_IMAGE_MB}MB se choti honi chahiye.`);
      return;
    }
    setError("");
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append("image", file); // backend me upload.single("image")
      const res = await authFetch(`${API}/upload`, { method: "POST", body: fd });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) setError(data.error || "Upload fail ho gaya.");
      else setValue(data.url);
    } catch (err) {
      setError("Server se connect nahi ho paya.");
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  };

  const onDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    upload(e.dataTransfer.files?.[0]);
  };

  return (
    <div className="space-y-2">
      <div
        onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onDrop={onDrop}
        className={`flex items-center gap-4 rounded-xl border border-dashed p-3 transition ${
          dragOver ? "border-orange-400 bg-orange-50" : "border-orange-200 bg-orange-50/30"
        }`}
      >
        {value ? (
          <img src={value} alt="Preview"
            className="h-16 w-16 shrink-0 rounded-lg border border-orange-100 bg-white object-cover" />
        ) : (
          <span className="flex h-16 w-16 shrink-0 items-center justify-center rounded-lg bg-orange-100/60 text-orange-500">
            <UploadCloud className="h-6 w-6" />
          </span>
        )}

        <div className="min-w-0 flex-1">
          <p className="text-xs font-semibold text-slate-700">
            {uploading ? "Upload ho rahi hai..." : value ? "Image set hai" : "Image yahan drag & drop karo"}
          </p>
          <p className="text-[11px] text-slate-400">JPG, PNG, WEBP, GIF • max {MAX_IMAGE_MB}MB</p>
          <div className="mt-2 flex flex-wrap gap-2">
            <button type="button" disabled={uploading} onClick={() => inputRef.current?.click()}
              className="inline-flex items-center gap-1.5 rounded-lg bg-orange-500 px-3 py-1.5 text-[11px] font-semibold text-white transition hover:bg-orange-600 disabled:opacity-60">
              {uploading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <UploadCloud className="h-3.5 w-3.5" />}
              {value ? "Change image" : "Choose from device"}
            </button>
            {value && !uploading && (
              <button type="button" onClick={() => setValue("")}
                className="inline-flex items-center gap-1.5 rounded-lg bg-rose-50 px-3 py-1.5 text-[11px] font-semibold text-rose-700 transition hover:bg-rose-100">
                <Trash2 className="h-3.5 w-3.5" /> Remove
              </button>
            )}
          </div>
        </div>

        <input ref={inputRef} type="file" accept="image/*" onChange={(e) => upload(e.target.files?.[0])} className="hidden" />
      </div>

      {/* link paste karna ho to */}
      <input type="text" name={field.name} value={value} onChange={onChange} required={field.required}
        placeholder="Ya image ka link yahan paste karo" className={inputClass} />
      {error && <p className="text-[11px] font-medium text-rose-600">{error}</p>}
    </div>
  );
}

// Unique values from existing data (case-insensitive, so "Ceo" and "ceo" count as one)
const uniqueOptions = (values) => {
  const seen = new Map();
  values.forEach((v) => {
    const s = String(v ?? "").trim();
    if (s && !seen.has(s.toLowerCase())) seen.set(s.toLowerCase(), s);
  });
  return [...seen.values()].sort((a, b) => a.localeCompare(b));
};

const NEW_VALUE = "__new__";

// Dropdown of values already in use, plus an "Add new" option
function ComboField({ field, value, onChange }) {
  const options = field.options || [];
  const [custom, setCustom] = useState(false);
  const matched = options.find((o) => o.toLowerCase() === String(value || "").toLowerCase());
  const isCustom = custom || (value !== "" && !matched);
  const setValue = (v) => onChange({ target: { name: field.name, value: v } });

  return (
    <div className="space-y-2">
      <select
        value={isCustom ? NEW_VALUE : matched || ""}
        onChange={(e) => {
          if (e.target.value === NEW_VALUE) {
            setCustom(true);
            setValue("");
          } else {
            setCustom(false);
            setValue(e.target.value);
          }
        }}
        className={inputClass}
      >
        <option value="">{field.placeholder || "Select"}</option>
        {options.map((o) => (<option key={o} value={o}>{o}</option>))}
        <option value={NEW_VALUE}>+ Add new...</option>
      </select>
      {isCustom && (
        <input type="text" value={value} onChange={(e) => setValue(e.target.value)} autoFocus
          placeholder={`Enter new ${field.label.split(" ")[0].toLowerCase()}`} className={inputClass} />
      )}
    </div>
  );
}

function Field({ field, value, onChange, editing }) {
  const disabled = editing && field.lockOnEdit;
  let options = field.options || [];
  if (field.type === "select" && value && !options.some((o) => o.value === value)) {
    options = [...options, { value, label: value }];
  }
  return (
    <div className={field.span2 ? "md:col-span-2" : ""}>
      <label className="mb-1 block text-xs font-semibold text-slate-600">
        {field.label}
        {field.required && <span className="ml-0.5 text-orange-500">*</span>}
      </label>
      {field.type === "image" ? (
        <ImageField field={field} value={value} onChange={onChange} />
      ) : field.type === "combo" ? (
        <ComboField field={field} value={value} onChange={onChange} />
      ) : field.type === "textarea" ? (
        <textarea name={field.name} value={value} onChange={onChange} rows={field.rows || 3}
          required={field.required} placeholder={field.placeholder} className={inputClass} />
      ) : field.type === "select" ? (
        <select name={field.name} value={value} onChange={onChange} required={field.required} className={inputClass}>
          <option value="">{field.placeholder || "Select"}</option>
          {options.map((o) => (<option key={o.value} value={o.value}>{o.label}</option>))}
        </select>
      ) : (
        <input type={field.type || "text"} name={field.name} value={value} onChange={onChange}
          required={field.required} disabled={disabled} placeholder={field.placeholder} className={inputClass} />
      )}
      {field.hint && <p className="mt-1 text-[11px] text-slate-400">{field.hint}</p>}
      {disabled && <p className="mt-1 text-[11px] text-slate-400">Edit me ye field change nahi hoti.</p>}
    </div>
  );
}

function Toast({ toast }) {
  if (!toast) return null;
  const color = toast.type === "error" ? "bg-rose-600" : "bg-orange-500";
  return (
    <div className={`fixed right-5 top-5 z-[90] rounded-lg px-4 py-2.5 text-xs font-semibold text-white shadow-lg ${color}`}>
      {toast.msg}
    </div>
  );
}

function PageHeader({ meta, count }) {
  return (
    <div className="mb-6 flex flex-wrap items-end justify-between gap-3 border-b border-orange-100 pb-5">
      <div>
        <p className="text-xs font-semibold text-orange-600">{meta.group}</p>
        <h1 className="mt-0.5 text-xl font-bold tracking-tight text-slate-900">{meta.title}</h1>
        <p className="mt-0.5 text-xs text-slate-500">{meta.desc}</p>
      </div>
      <div className="rounded-lg border border-orange-100 bg-white px-4 py-2 text-center">
        <p className="text-lg font-bold leading-tight text-orange-600">{count}</p>
        <p className="text-[10px] font-medium text-slate-400">Total</p>
      </div>
    </div>
  );
}

// =====================================================
// OVERVIEW (main dashboard)
// =====================================================
const OVERVIEW_ITEMS = [
  { key: "biographies", label: "Biographies", group: "Website Content", Icon: UserRound, tone: "from-orange-500 to-orange-400" },
  { key: "articles", label: "Articles", group: "Website Content", Icon: Newspaper, tone: "from-amber-500 to-amber-400" },
  { key: "companies", label: "Companies", group: "Website Content", Icon: Building2, tone: "from-yellow-500 to-yellow-400" },
  { key: "authors", label: "Authors", group: "Author Blog", Icon: PenLine, tone: "from-orange-400 to-amber-400" },
  { key: "blogArticles", label: "Author Articles", group: "Author Blog", Icon: BookOpen, tone: "from-amber-400 to-yellow-400" },
  { key: "latestArticles", label: "Latest Articles", group: "Latest Articles", Icon: Newspaper, tone: "from-orange-500 to-amber-500" },
  { key: "brands", label: "Brands", group: "Brands & Products", Icon: Smartphone, tone: "from-amber-500 to-orange-400" },
  { key: "slidingCompanies", label: "Sliding Companies", group: "Sliding Companies", Icon: Layers, tone: "from-yellow-500 to-orange-400" },
];

const DONUT_COLORS = [
  "#f97316", "#f59e0b", "#eab308", "#fb923c",
  "#fbbf24", "#ea580c", "#d97706", "#facc15",
];

function Overview({ counts, admin, goTo }) {
  const total = OVERVIEW_ITEMS.reduce((sum, i) => sum + (counts[i.key] || 0), 0);
  const max = Math.max(1, ...OVERVIEW_ITEMS.map((i) => counts[i.key] || 0));
  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";
  const today = new Date().toLocaleDateString("en-IN", {
    weekday: "long", day: "numeric", month: "long", year: "numeric",
  });
  const pct = (n) => (total ? Math.round((n / total) * 100) : 0);

  let acc = 0;
  const stops = total
    ? OVERVIEW_ITEMS.map((it, i) => {
        const n = counts[it.key] || 0;
        const start = (acc / total) * 100;
        acc += n;
        const end = (acc / total) * 100;
        return `${DONUT_COLORS[i]} ${start}% ${end}%`;
      }).join(", ")
    : "#fed7aa 0% 100%";

  const ranked = OVERVIEW_ITEMS
    .map((it, i) => ({ ...it, n: counts[it.key] || 0, color: DONUT_COLORS[i] }))
    .sort((a, b) => b.n - a.n);

  return (
    <div className="space-y-6">
      {/* HERO (light) */}
      <div className="relative overflow-hidden rounded-2xl border border-orange-100 bg-gradient-to-br from-orange-50 via-amber-50/70 to-white p-5 sm:p-7">
        <div className="pointer-events-none absolute -right-12 -top-12 h-44 w-44 rounded-full bg-orange-200/30" />
        <div className="pointer-events-none absolute -bottom-16 right-28 h-36 w-36 rounded-full bg-amber-200/30" />

        <div className="relative flex flex-wrap items-center justify-between gap-5">
          <div className="min-w-0">
            <p className="inline-flex items-center gap-2 rounded-full border border-orange-100 bg-white px-3 py-1 text-[11px] font-medium text-orange-700">
              {greeting} 👋 <span className="text-orange-200">|</span> {today}
            </p>
            <h1 className="mt-3 text-xl font-bold tracking-tight text-slate-900 sm:text-2xl">
              Welcome back, {admin?.name || "Admin"}
            </h1>
            <p className="mt-1 text-xs text-slate-500 sm:text-[13px]">
              Aapki website ke saare content ka ek nazar me overview.
            </p>
          </div>

          <div className="flex gap-2.5">
            <div className="rounded-xl border border-orange-100 bg-white px-4 py-3 text-center">
              <p className="text-xl font-bold leading-none text-slate-900">{OVERVIEW_ITEMS.length}</p>
              <p className="mt-1.5 text-[10px] font-semibold uppercase tracking-wider text-slate-400">Sections</p>
            </div>
            <div className="flex items-center gap-3 rounded-xl border border-orange-100 bg-white px-4 py-3">
              <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-orange-50 text-orange-500">
                <Database className="h-[18px] w-[18px]" />
              </span>
              <div>
                <p className="text-xl font-bold leading-none text-orange-600">{total}</p>
                <p className="mt-1.5 text-[10px] font-semibold uppercase tracking-wider text-slate-400">Total Entries</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* STAT CARDS */}
      <div>
        <div className="mb-3">
          <h2 className="text-base font-bold text-slate-900">Content Overview</h2>
          <p className="text-xs text-slate-500">Kisi bhi card par click karke us section me jao</p>
        </div>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {OVERVIEW_ITEMS.map(({ key, label, group, Icon }, i) => {
            const n = counts[key] ?? 0;
            const color = DONUT_COLORS[i];
            return (
              <button key={key} onClick={() => goTo(key)}
                className="group rounded-xl border border-orange-100 bg-white p-4 text-left transition hover:border-orange-200 hover:shadow-md hover:shadow-orange-100/60">
                <div className="flex items-start justify-between">
                  <span className="flex h-9 w-9 items-center justify-center rounded-lg"
                    style={{ backgroundColor: `${color}1a`, color }}>
                    <Icon className="h-[18px] w-[18px]" />
                  </span>
                  <ArrowRight className="h-3.5 w-3.5 text-orange-300 transition group-hover:translate-x-0.5 group-hover:text-orange-500" />
                </div>

                <p className="mt-3 text-2xl font-bold text-slate-900">{n}</p>
                <p className="text-[13px] font-semibold text-slate-700">{label}</p>
                <p className="text-[11px] text-slate-400">{group}</p>

                <div className="mt-3 flex items-center gap-2">
                  <div className="h-1 flex-1 overflow-hidden rounded-full bg-orange-50">
                    <div className="h-full rounded-full" style={{ width: `${pct(n)}%`, backgroundColor: color }} />
                  </div>
                  <span className="text-[10px] font-semibold text-slate-400">{pct(n)}%</span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* DISTRIBUTION */}
      <div className="rounded-xl border border-orange-100 bg-white p-5 sm:p-6">
        <h2 className="text-base font-bold text-slate-900">Content Distribution</h2>
        <p className="mb-5 text-xs text-slate-500">Kaunsa section kitna bhara hua hai</p>

        <div className="grid items-center gap-8 lg:grid-cols-[180px_1fr]">
          <div className="mx-auto">
            <div className="relative h-40 w-40 rounded-full" style={{ background: `conic-gradient(${stops})` }}>
              <div className="absolute inset-[24%] flex flex-col items-center justify-center rounded-full bg-white">
                <p className="text-2xl font-bold leading-none text-slate-900">{total}</p>
                <p className="mt-1 text-[10px] font-semibold uppercase tracking-wider text-slate-400">Total</p>
              </div>
            </div>
          </div>

          <div className="space-y-2.5">
            {ranked.map(({ key, label, n, color }) => (
              <button key={key} onClick={() => goTo(key)}
                className="flex w-full items-center gap-3 rounded-lg px-2 py-1 text-left transition hover:bg-orange-50/60">
                <span className="h-2.5 w-2.5 shrink-0 rounded-full" style={{ backgroundColor: color }} />
                <p className="w-32 shrink-0 truncate text-xs font-medium text-slate-700">{label}</p>
                <div className="h-2 flex-1 overflow-hidden rounded-full bg-orange-50">
                  <div className="h-full rounded-full transition-all duration-700"
                    style={{ width: `${(n / max) * 100}%`, backgroundColor: color }} />
                </div>
                <p className="w-7 text-right text-xs font-bold text-slate-800">{n}</p>
                <p className="w-9 text-right text-[11px] text-slate-400">{pct(n)}%</p>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}


function AuthInput({ icon: Icon, ...props }) {
  return (
    <div className="relative">
      <Icon className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-orange-400" />
      <input {...props} className={`${inputClass} pl-10`} />
    </div>
  );
}

function AuthScreen({ mode, onAuth }) {
  const isRegister = mode === "register";
  const [form, setForm] = useState({ name: "", email: "", password: "", secretKey: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const submit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const body = isRegister ? form : { email: form.email, password: form.password };
      const res = await fetch(`${API}/auth/${mode}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Kuch galat ho gaya.");
      } else {
        localStorage.setItem(TOKEN_KEY, data.token);
        if (isRegister) window.location.assign("/admin");
        else onAuth(data.admin);
      }
    } catch (err) {
      setError("Server se connect nahi ho paya.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-orange-100 via-amber-50 to-yellow-100 px-4 py-10">
      <GlobalStyle />
      <div className="w-full max-w-md overflow-hidden rounded-2xl border border-orange-200 bg-white shadow-xl shadow-orange-200/50">
        <div className="bg-gradient-to-r from-orange-400 to-amber-400 px-8 py-8 text-center text-white">
          <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-white/25">
            <LayoutDashboard className="h-7 w-7" />
          </span>
          <h1 className="mt-4 text-2xl font-bold">{isRegister ? "Create Admin Account" : "Admin Login"}</h1>
          <p className="mt-1 text-sm text-white/90">
            {isRegister ? "Naya admin account banao" : "Apne account me login karo"}
          </p>
        </div>

        <div className="p-8">
          <form onSubmit={submit} className="space-y-4" autoComplete="off">
            {isRegister && (
              <AuthInput icon={User} name="name" value={form.name} onChange={handleChange}
                placeholder="Full name" required />
            )}
            <AuthInput icon={Mail} type="email" name="email" value={form.email} onChange={handleChange}
              placeholder="Email address" required />
            <AuthInput icon={Lock} type="password" name="password" value={form.password} onChange={handleChange}
              placeholder="Password" autoComplete={isRegister ? "new-password" : "current-password"} required />
            {isRegister && (
              <AuthInput icon={KeyRound} type="password" name="secretKey" value={form.secretKey}
                onChange={handleChange} placeholder="Admin secret key" autoComplete="new-password" required />
            )}

            {error && (
              <p className="rounded-lg bg-rose-50 px-3 py-2 text-sm font-medium text-rose-600">{error}</p>
            )}

            <button type="submit" disabled={loading}
              className="w-full rounded-lg bg-gradient-to-r from-orange-500 to-amber-500 py-3 text-sm font-bold text-white shadow-md shadow-orange-300/50 transition hover:from-orange-600 hover:to-amber-600 disabled:opacity-60">
              {loading ? "Please wait..." : isRegister ? "Create Account" : "Login"}
            </button>
          </form>

    
        </div>
      </div>
    </div>
  );
}


function CrudSection({
  singular, fields, emptyForm, listUrl, createUrl, updateUrl, deleteUrl,
  getKey, toForm, toPayload, getRow, onCount, notify, filters,
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
        notify(editing ? `${singular} updated successfully!` : `${singular} posted successfully!`);
        closeForm();
        fetchItems();
      } else {
        let msg = "Operation failed! Please check backend.";
        try {
          const data = await res.json();
          if (data.error) msg = data.error;
        } catch (_) {}
        notify(msg, "error");
      }
    } catch (err) {
      console.error("Error saving data:", err);
      notify("Server se connect nahi ho paya.", "error");
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
    if (!window.confirm(`Kya aap sach mein is ${singular} ko delete karna chahte hain?`)) return;
    try {
      const res = await authFetch(deleteUrl(getKey(item)), { method: "DELETE" });
      if (res.ok) {
        setItems((prev) => prev.filter((i) => getKey(i) !== getKey(item)));
        if (editingKey === getKey(item)) closeForm();
        notify(`${singular} deleted successfully!`);
      } else {
        notify("Delete failed!", "error");
      }
    } catch (err) {
      console.error("Error deleting:", err);
      notify("Server se connect nahi ho paya.", "error");
    }
  };

  // Options for the list filter dropdowns (built from existing data)
  const filterOptions = useMemo(
    () => (filters || []).map((f) => ({
      ...f,
      // Fixed options if given, otherwise the values already used in the data
      options: f.options || uniqueOptions(items.map(f.get)).map((v) => ({ value: v, label: v })),
    })),
    [items, filters]
  );
  // Options for the form's "combo" fields (Category / Type)
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
    // eslint-disable-next-line
  }, [items, search, filterValues]);

  return (
    <div className="space-y-5">
      {/* ADD BUTTON (form popup tabhi khulega jab ispe click karoge) */}
      <div className="flex flex-col items-start justify-between gap-3 rounded-xl border border-orange-100 bg-white px-5 py-4 sm:flex-row sm:items-center">
        <div>
          <h2 className="text-sm font-bold text-slate-900">New {singular} add karna hai?</h2>
          <p className="text-xs text-slate-500">Button par click karo, form popup me khulega.</p>
        </div>
        <button type="button" onClick={openCreate}
          className="inline-flex items-center gap-1.5 rounded-lg bg-orange-500 px-4 py-2 text-xs font-semibold text-white shadow-sm transition hover:bg-orange-600">
          <Plus className="h-3.5 w-3.5" /> Add {singular}
        </button>
      </div>

      {/* MODAL FORM */}
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

      {/* LIST */}
      <div className="rounded-xl border border-orange-100 bg-white p-5 md:p-6">
        <div className="mb-5 flex flex-col gap-3 border-b border-orange-100 pb-5 sm:flex-row sm:items-center sm:justify-between">
          <h2 className="text-sm font-bold text-slate-900">Manage Existing ({items.length})</h2>
          <div className="relative w-full sm:w-72">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-orange-400" />
            <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search..."
              className="w-full rounded-lg border border-orange-200 bg-white py-1.5 pl-9 pr-4 text-[13px] outline-none transition focus:border-orange-400 focus:ring-2 focus:ring-orange-300/40" />
          </div>
        </div>

        {/* FILTER DROPDOWNS */}
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
            {items.length === 0 ? "Abhi kuch nahi hai. Upar se pehla add karo!" : "No results match this search or filter."}
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


function BlogArticlesSection({ active, notify, onCount }) {
  const [authors, setAuthors] = useState([]);

  useEffect(() => {
    if (!active) return;
    authFetch(`${API}/blog-authors`)
      .then((r) => r.json())
      .then((d) => setAuthors(Array.isArray(d) ? d : []))
      .catch((err) => console.error("Error fetching authors:", err));
  }, [active]);

  const fields = useMemo(
    () => buildBlogArticleFields(authors.map((a) => ({ value: a.id, label: a.name }))),
    [authors]
  );
  const authorName = (id) => authors.find((a) => a.id === id)?.name || id;

  return (
    <CrudSection
      singular="Author Article"
      fields={fields}
      emptyForm={emptyBlogArticle}
      listUrl={`${API}/blog-articles`}
      createUrl={`${API}/blog-articles`}
      updateUrl={(key) => `${API}/blog-articles/slug/${key}`}
      deleteUrl={(key) => `${API}/blog-articles/slug/${key}`}
      getKey={(item) => item.slug}
      toForm={(item) => ({
        id: item.id ?? "",
        slug: item.slug || "",
        title: item.title || "",
        authorId: item.authorId || "",
        category: item.category || "",
        date: item.date || "",
        readTime: item.readTime || "",
        image: item.image || "",
        excerpt: item.excerpt || "",
        content: Array.isArray(item.content) ? item.content.join("\n\n") : item.content || "",
      })}
      toPayload={(form, items) => {
        const nums = items
          .map((a) => /^art-(\d+)$/.exec(String(a.id)))
          .filter(Boolean)
          .map((m) => Number(m[1]));
        const next = (nums.length ? Math.max(...nums) : 0) + 1;
        return {
          id: String(form.id).trim() || `art-${String(next).padStart(3, "0")}`,
          slug: form.slug.trim(),
          title: form.title.trim(),
          authorId: form.authorId,
          category: form.category.trim(),
          date: form.date.trim(),
          readTime: form.readTime.trim(),
          image: form.image.trim(),
          excerpt: form.excerpt.trim(),
          content: form.content.split(/\n\s*\n/).map((p) => p.trim()).filter(Boolean),
        };
      }}
      getRow={(item) => ({
        image: item.image,
        title: item.title,
        subtitle: `${authorName(item.authorId)} • ${item.category || "General"} • ${item.date || ""}`,
      })}
      onCount={onCount}
      notify={notify}
    />
  );
}


function Dashboard({ admin, onLogout }) {
  const [tab, setTab] = useState("overview");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [counts, setCounts] = useState({
    biographies: 0, articles: 0, companies: 0, brands: 0,
    authors: 0, blogArticles: 0, latestArticles: 0, slidingCompanies: 0,
  });
  const [toast, setToast] = useState(null);

  const notify = (msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };
  const setCount = (key) => (n) => setCounts((c) => ({ ...c, [key]: n }));
  const goTo = (key) => {
    setTab(key);
    setSidebarOpen(false);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div className="min-h-screen bg-orange-50/30 lg:flex">
      <GlobalStyle />
      <Toast toast={toast} />

      {/* MOBILE TOP BAR */}
      <div className="sticky top-0 z-40 flex items-center justify-between border-b border-orange-200 bg-white px-4 py-3 lg:hidden">
        <div className="flex items-center gap-2">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-orange-400 to-amber-400 text-white">
            <LayoutDashboard className="h-4 w-4" />
          </span>
          <span className="text-sm font-bold text-slate-900">Admin Panel</span>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={onLogout}
            className="inline-flex items-center gap-1.5 rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-xs font-semibold text-rose-600"
            aria-label="Logout">
            <LogOut className="h-4 w-4" /> Logout
          </button>
          <button onClick={() => setSidebarOpen(true)}
            className="rounded-lg border border-orange-200 p-2 text-orange-600" aria-label="Open menu">
            <Menu className="h-5 w-5" />
          </button>
        </div>
      </div>

      {sidebarOpen && (
        <div className="fixed inset-0 z-40 bg-slate-900/40 backdrop-blur-sm lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      {/* SIDEBAR */}
      <aside className={`fixed inset-y-0 left-0 z-50 flex w-72 flex-col border-r border-orange-200 bg-white transition-transform duration-300 lg:sticky lg:top-0 lg:h-screen lg:shrink-0 lg:translate-x-0 ${
        sidebarOpen ? "translate-x-0" : "-translate-x-full"
      }`}>
        <div className="flex items-center justify-between border-b border-orange-100 bg-orange-50/60 px-5 py-5">
          <div className="flex items-center gap-3">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-orange-500 text-white">
              <LayoutDashboard className="h-5 w-5" />
            </span>
            <div>
              <p className="text-sm font-bold leading-tight text-slate-900">Admin Panel</p>
              <p className="text-[11px] font-medium text-slate-500">Control Center</p>
            </div>
          </div>
          <button onClick={() => setSidebarOpen(false)}
            className="rounded-lg p-1.5 text-slate-500 hover:bg-orange-100 lg:hidden" aria-label="Close menu">
            <X className="h-5 w-5" />
          </button>
        </div>

        <nav className="nav-scroll flex-1 space-y-6 overflow-y-auto px-4 py-6">
          {NAV.map((section) => (
            <div key={section.group}>
              <p className="mb-1.5 px-3 text-[10px] font-semibold uppercase tracking-wider text-orange-400">{section.group}</p>
              <ul className="space-y-1">
                {section.items.map(({ key, label, Icon }) => {
                  const isActive = tab === key;
                  return (
                    <li key={key}>
                      <button onClick={() => goTo(key)}
                        className={`flex w-full items-center gap-3 rounded-lg px-3 py-2 text-[13px] font-medium transition ${
                          isActive
                            ? "bg-orange-100/80 text-orange-700"
                            : "text-slate-600 hover:bg-orange-50 hover:text-orange-600"
                        }`}>
                        <Icon className="h-[18px] w-[18px] shrink-0" />
                        <span className="flex-1 text-left">{label}</span>
                        {counts[key] !== undefined && (
                          <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${
                            isActive ? "bg-white text-orange-700" : "bg-amber-100 text-amber-700"
                          }`}>
                            {counts[key]}
                          </span>
                        )}
                      </button>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </nav>

        <div className="border-t border-orange-100 p-4">
          <div className="flex items-center gap-3 rounded-lg bg-orange-50 px-3 py-2.5">
            <span className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-orange-400 to-amber-400 text-sm font-bold text-white">
              {(admin?.name || "A").charAt(0).toUpperCase()}
            </span>
            <div className="min-w-0">
              <p className="truncate text-[13px] font-semibold text-slate-900">{admin?.name}</p>
              <p className="truncate text-[11px] text-slate-500">{admin?.email}</p>
            </div>
          </div>
        </div>
      </aside>

      {/* MAIN */}
      <main className="min-w-0 flex-1">
        {/* DESKTOP TOP BAR (logout yahan hai) */}
        <div className="sticky top-0 z-30 hidden items-center justify-end border-b border-orange-200 bg-white/90 px-10 py-3 backdrop-blur lg:flex">
          <button onClick={onLogout}
            className="inline-flex items-center gap-2 rounded-lg border border-rose-100 bg-rose-50 px-3.5 py-1.5 text-xs font-semibold text-rose-600 transition hover:bg-rose-100">
            <LogOut className="h-4 w-4" /> Logout
          </button>
        </div>

        <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-10 lg:py-10">
          {/* OVERVIEW */}
          <div className={tab === "overview" ? "" : "hidden"}>
            <Overview counts={counts} admin={admin} goTo={goTo} />
          </div>

          {/* BIOGRAPHIES */}
          <div className={tab === "biographies" ? "" : "hidden"}>
            <PageHeader meta={META.biographies} count={counts.biographies} />
            <CrudSection
              singular="Biography"
              filters={bioFilters}
              fields={bioFields}
              emptyForm={emptyBio}
              listUrl={`${API}/biographies`}
              createUrl={`${API}/biographies/add`}
              updateUrl={(key) => `${API}/biographies/update/${key}`}
              deleteUrl={(key) => `${API}/biographies/delete/${key}`}
              getKey={(item) => item._id || item.id}
              toForm={(item) => Object.keys(emptyBio).reduce((acc, k) => ({ ...acc, [k]: item[k] || "" }), {})}
              toPayload={(form) => form}
              getRow={(item) => ({
                image: item.image,
                title: item.name,
                subtitle: `${item.role || ""}${item.company ? ` • ${item.company}` : ""} | Category: ${item.category || "General"}`,
              })}
              onCount={setCount("biographies")}
              notify={notify}
            />
          </div>

          {/* ARTICLES */}
          <div className={tab === "articles" ? "" : "hidden"}>
            <PageHeader meta={META.articles} count={counts.articles} />
            <CrudSection
              singular="Article"
              fields={articleFields}
              emptyForm={emptyArticle}
              listUrl={`${API}/articles`}
              createUrl={`${API}/articles`}
              updateUrl={(key) => `${API}/articles/${key}`}
              deleteUrl={(key) => `${API}/articles/${key}`}
              getKey={(item) => item.id}
              toForm={(item) => Object.keys(emptyArticle).reduce((acc, k) => ({ ...acc, [k]: item[k] ?? "" }), {})}
              toPayload={(form, items) => {
                const nextId = items.reduce((max, a) => Math.max(max, Number(a.id) || 0), 0) + 1;
                return { ...form, id: form.id === "" ? nextId : Number(form.id) };
              }}
              getRow={(item) => ({
                image: item.image,
                title: item.title,
                subtitle: `ID ${item.id} • ${item.category || "General"} • ${item.author || ""}`,
              })}
              onCount={setCount("articles")}
              notify={notify}
            />
          </div>

          {/* COMPANIES */}
          <div className={tab === "companies" ? "" : "hidden"}>
            <PageHeader meta={META.companies} count={counts.companies} />
            <CrudSection
              singular="Company"
              fields={companyFields}
              emptyForm={emptyCompany}
              listUrl={`${API}/companies`}
              createUrl={`${API}/companies`}
              updateUrl={(key) => `${API}/companies/${key}`}
              deleteUrl={(key) => `${API}/companies/${key}`}
              getKey={(item) => item.slug}
              toForm={(item) => Object.keys(emptyCompany).reduce((acc, k) => ({ ...acc, [k]: item[k] ?? "" }), {})}
              toPayload={(form) => ({ ...form, startId: Number(form.startId), endId: Number(form.endId) })}
              getRow={(item) => ({
                image: item.imageURL,
                title: item.name,
                subtitle: `/${item.slug} • Article IDs ${item.startId} - ${item.endId}`,
              })}
              onCount={setCount("companies")}
              notify={notify}
            />
          </div>

          {/* AUTHORS */}
          <div className={tab === "authors" ? "" : "hidden"}>
            <PageHeader meta={META.authors} count={counts.authors} />
            <CrudSection
              singular="Author"
              fields={blogAuthorFields}
              emptyForm={emptyBlogAuthor}
              listUrl={`${API}/blog-authors`}
              createUrl={`${API}/blog-authors`}
              updateUrl={(key) => `${API}/blog-authors/${key}`}
              deleteUrl={(key) => `${API}/blog-authors/${key}`}
              getKey={(item) => item.id}
              toForm={(item) => ({
                id: item.id || "",
                name: item.name || "",
                role: item.role || "",
                company: item.company || "",
                image: item.image || "",
                about: item.about || "",
                education: item.education || "",
                expertise: Array.isArray(item.expertise) ? item.expertise.join(", ") : "",
                twitter: item.social?.twitter || "",
                linkedin: item.social?.linkedin || "",
                instagram: item.social?.instagram || "",
                youtube: item.social?.youtube || "",
              })}
              toPayload={(form) => {
                const social = {};
                ["twitter", "linkedin", "instagram", "youtube"].forEach((k) => {
                  if (form[k].trim()) social[k] = form[k].trim();
                });
                return {
                  id: form.id.trim(),
                  name: form.name.trim(),
                  role: form.role.trim(),
                  company: form.company.trim(),
                  image: form.image.trim(),
                  about: form.about.trim(),
                  education: form.education.trim(),
                  expertise: form.expertise.split(",").map((s) => s.trim()).filter(Boolean),
                  social,
                };
              }}
              getRow={(item) => ({
                image: item.image,
                round: true,
                title: item.name,
                subtitle: `${item.role || ""}${item.company ? ` • ${item.company}` : ""}`,
              })}
              onCount={setCount("authors")}
              notify={notify}
            />
          </div>

          {/* AUTHOR ARTICLES */}
          <div className={tab === "blogArticles" ? "" : "hidden"}>
            <PageHeader meta={META.blogArticles} count={counts.blogArticles} />
            <BlogArticlesSection
              active={tab === "blogArticles"}
              notify={notify}
              onCount={setCount("blogArticles")}
            />
          </div>

          {/* BRANDS */}
          <div className={tab === "brands" ? "" : "hidden"}>
            <PageHeader meta={META.brands} count={counts.brands} />
            <CrudSection
              singular="Brand Product"
              fields={brandFields}
              emptyForm={emptyBrand}
              listUrl={`${API}/brands`}
              createUrl={`${API}/brands`}
              updateUrl={(key) => `${API}/brands/${key}`}
              deleteUrl={(key) => `${API}/brands/${key}`}
              getKey={(item) => item.slug}
              toForm={(item) => ({
                slug: item.slug || "",
                name: item.name || item.articleTitle || "",
                brand: item.brand || "",
                category: item.category || "",
                subCategory: item.subCategory || "",
                imageUrl: item.imageUrl || "",
                description: item.description || item.shortDescription || "",
                blog: item.blog || item.articleContent || "",
                features: Array.isArray(item.features) ? item.features.join("\n") : "",
                featured: String(!!item.featured),
                order: item.order ?? "",
              })}
              toPayload={(form, items) => {
                const nextOrder = items.reduce((max, a) => Math.max(max, Number(a.order) || 0), 0) + 1;
                return {
                  slug: form.slug.trim(),
                  name: form.name.trim(),
                  brand: form.brand.trim(),
                  category: form.category.trim(),
                  subCategory: form.subCategory.trim(),
                  imageUrl: form.imageUrl.trim(),
                  description: form.description.trim(),
                  blog: form.blog.trim(),
                  features: form.features.split("\n").map((s) => s.trim()).filter(Boolean),
                  featured: form.featured === "true",
                  order: form.order === "" ? nextOrder : Number(form.order),
                };
              }}
              getRow={(item) => ({
                image: item.imageUrl,
                title: item.name || item.articleTitle,
                subtitle: `${item.brand || ""} • ${item.category || "General"} • ${
                  item.featured ? "⭐ Featured" : "Not featured"
                } • Order ${item.order ?? 0}`,
              })}
              onCount={setCount("brands")}
              notify={notify}
            />
          </div>

          {/* LATEST ARTICLES */}
          <div className={tab === "latestArticles" ? "" : "hidden"}>
            <PageHeader meta={META.latestArticles} count={counts.latestArticles} />
            <CrudSection
              singular="Latest Article"
              fields={latestArticleFields}
              emptyForm={emptyLatestArticle}
              listUrl={`${API}/latest-articles?all=true`}
              createUrl={`${API}/latest-articles`}
              updateUrl={(key) => `${API}/latest-articles/${key}`}
              deleteUrl={(key) => `${API}/latest-articles/${key}`}
              getKey={(item) => item.slug}
              toForm={(item) => ({
                slug: item.slug || "",
                title: item.title || "",
                category: item.category || "",
                author: item.author || "",
                date: item.date || "",
                readTime: item.readTime || "",
                image: item.image || "",
                excerpt: item.excerpt || "",
                content: item.content || "",
                order: item.order ?? "",
                active: String(item.active !== false),
              })}
              toPayload={(form, items) => {
                const nextOrder = items.reduce((m, a) => Math.max(m, Number(a.order) || 0), 0) + 1;
                return {
                  slug: form.slug.trim().toLowerCase(),
                  title: form.title.trim(),
                  category: form.category.trim(),
                  author: form.author.trim() || "Admin",
                  date: form.date.trim(),
                  readTime: form.readTime.trim(),
                  image: form.image.trim(),
                  excerpt: form.excerpt.trim(),
                  content: form.content.trim(),
                  order: form.order === "" ? nextOrder : Number(form.order),
                  active: form.active === "true",
                };
              }}
              getRow={(item) => ({
                image: item.image,
                title: item.title,
                subtitle: `/${item.slug} • ${item.category} • ${item.active ? "Visible" : "Hidden"} • Order ${item.order ?? 0}`,
              })}
              onCount={setCount("latestArticles")}
              notify={notify}
            />
          </div>

          {/* SLIDING COMPANIES */}
          <div className={tab === "slidingCompanies" ? "" : "hidden"}>
            <PageHeader meta={META.slidingCompanies} count={counts.slidingCompanies} />
            <CrudSection
              singular="Sliding Company"
              fields={slidingCompanyFields}
              emptyForm={emptySlidingCompany}
              listUrl={`${API}/sliding-companies?all=true`}
              createUrl={`${API}/sliding-companies`}
              updateUrl={(key) => `${API}/sliding-companies/${key}`}
              deleteUrl={(key) => `${API}/sliding-companies/${key}`}
              getKey={(item) => item.slug}
              toForm={(item) => ({
                slug: item.slug || "",
                name: item.name || "",
                imageURL: item.imageURL || "",
                description: item.description || "",
                tagline: item.tagline || "",
                blog: item.blog || "",
                features: Array.isArray(item.features) ? item.features.join("\n") : "",
                website: item.website || "",
                order: item.order ?? "",
                active: String(item.active !== false),
              })}
              toPayload={(form, items) => {
                const nextOrder = items.reduce((m, a) => Math.max(m, Number(a.order) || 0), 0) + 1;
                return {
                  slug: form.slug.trim().toLowerCase(),
                  name: form.name.trim(),
                  imageURL: form.imageURL.trim(),
                  description: form.description.trim(),
                  tagline: form.tagline.trim() || "VERIFIED PARTNER",
                  blog: form.blog.trim(),
                  features: form.features.split("\n").map((s) => s.trim()).filter(Boolean),
                  website: form.website.trim(),
                  order: form.order === "" ? nextOrder : Number(form.order),
                  active: form.active === "true",
                };
              }}
              getRow={(item) => ({
                image: item.imageURL,
                title: item.name,
                subtitle: `/${item.slug} • ${item.active ? "Visible" : "Hidden"} • Order ${item.order ?? 0}`,
              })}
              onCount={setCount("slidingCompanies")}
              notify={notify}
            />
          </div>
        </div>
      </main>
    </div>
  );
}

// =====================================================
// ADMIN GATE: login nahi hai to AuthScreen, warna Dashboard
// =====================================================
export default function AdminDashboard() {
  const [admin, setAdmin] = useState(null);
  const [checking, setChecking] = useState(true);

  const logout = () => {
    localStorage.removeItem(TOKEN_KEY);
    setAdmin(null);
  };

  useEffect(() => {
    const onForcedLogout = () => setAdmin(null);
    window.addEventListener("admin-logout", onForcedLogout);

    const token = localStorage.getItem(TOKEN_KEY);
    if (!token) {
      setChecking(false);
    } else {
      authFetch(`${API}/auth/me`)
        .then((r) => (r.ok ? r.json() : null))
        .then((d) => d && setAdmin(d.admin))
        .catch(() => {})
        .finally(() => setChecking(false));
    }
    return () => window.removeEventListener("admin-logout", onForcedLogout);
  }, []);

  const isRegisterPage = window.location.pathname.replace(/\/+$/, "") === "/admin/register";
  if (isRegisterPage) return <AuthScreen mode="register" onAuth={setAdmin} />;

  if (checking) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-orange-50 text-sm font-semibold text-orange-600">
        Loading...
      </div>
    );
  }

  return admin ? <Dashboard admin={admin} onLogout={logout} /> : <AuthScreen mode="login" onAuth={setAdmin} />;
}