import { API } from "./config";
import {
  emptySeo, resolveSeo, htmlToParagraphs, readingMinutes,
  toLocalInput, formatDisplayDate, slugify,
} from "./seo/seoUtils";
import { BIO_TYPE_OPTIONS } from "./constants";



const escapeHtml = (s) =>
  String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");


export const legacyToHtml = (content) => {
  const paras = Array.isArray(content)
    ? content
    : String(content || "").split(/\n\s*\n/);
  return paras.map((p) => String(p).trim()).filter(Boolean).map((p) => `<p>${escapeHtml(p)}</p>`).join("\n");
};

export const emptyPost = {
  slug: "", title: "", contentHtml: "", excerpt: "",
  focusKeyword: "", secondaryKeywords: [],
  faqEnabled: false, faqs: [], showToc: true,
  status: "draft", publishDate: "", readTime: "",
  allowComments: true, featured: false,
  image: "", imageAlt: "", category: "", tags: [],
  seo: { ...emptySeo },
};

const baseToForm = (item) => {
  const s = item.seo || {};
  return {
    slug: item.slug || "",
    title: item.title || "",
    contentHtml: item.contentHtml || legacyToHtml(item.content),
    excerpt: item.excerpt || "",
    focusKeyword: item.focusKeyword || "",
    secondaryKeywords: item.secondaryKeywords || [],
    faqEnabled: !!item.faqEnabled,
    faqs: item.faqs || [],
    showToc: item.showToc ?? true,
   
    status: item.status || "published",
    publishDate: item.publishDate ? toLocalInput(item.publishDate) : toLocalInput(),
    readTime: String(parseInt(item.readTime, 10) || ""),
    allowComments: item.allowComments ?? true,
    featured: !!item.featured,
    image: item.image || "",
    imageAlt: item.imageAlt || "",
    category: item.category || "",
    tags: item.tags || [],
    seo: {
      ...emptySeo,
      robots: s.robots || emptySeo.robots,
      schemaType: s.schemaType || emptySeo.schemaType,
      language: s.language || emptySeo.language,
      twitterCard: s.twitterCard || emptySeo.twitterCard,
      ...(item.seoManual || {}),
    },
  };
};

const basePayload = (form, urlPrefix, legacyContent, segment = "") => {
  const resolved = resolveSeo(form, urlPrefix, segment);
  const html = form.contentHtml || "";
  const minutes = parseInt(form.readTime, 10) || readingMinutes(html);
  const publishDate = form.publishDate ? new Date(form.publishDate) : new Date();

  return {
    slug: resolved.slug.trim().toLowerCase(),
    title: form.title.trim(),
    category: form.category.trim(),
    image: form.image.trim(),
    imageAlt: form.imageAlt.trim(),
    excerpt: form.excerpt.trim() || resolved.auto.metaDescription,

    content: legacyContent(htmlToParagraphs(html)),
    contentHtml: html,
    focusKeyword: form.focusKeyword.trim(),
    secondaryKeywords: form.secondaryKeywords,
    faqEnabled: form.faqEnabled,
    faqs: form.faqs.filter((f) => f.q.trim() && f.a.trim()),
    showToc: form.showToc,
    status: form.status,
    publishDate: publishDate.toISOString(),
    date: formatDisplayDate(publishDate),
    readTime: `${minutes} min read`,
    allowComments: form.allowComments,
    featured: form.featured,
    tags: form.tags,

    seo: {
      metaTitle: resolved.metaTitle,
      metaDescription: resolved.metaDescription,
      canonicalUrl: resolved.canonicalUrl,
      robots: resolved.robots,
      schemaType: resolved.schemaType,
      language: resolved.language,
      ogTitle: resolved.ogTitle,
      ogDescription: resolved.ogDescription,
      ogImage: resolved.ogImage,
      twitterCard: resolved.twitterCard,
      twitterTitle: resolved.twitterTitle,
      twitterDescription: resolved.twitterDescription,
      twitterImage: resolved.twitterImage,
    },

    seoManual: form.seo,
  };
};


export const latestArticleConfig = {
  key: "latestArticles",
  singular: "Latest Article",
  urlPrefix: "/latest-article",
  listUrl: `${API}/latest-articles?all=true`,
  createUrl: `${API}/latest-articles`,
  updateUrl: (key) => `${API}/latest-articles/${key}`,
  deleteUrl: (key) => `${API}/latest-articles/${key}`,
  getKey: (item) => item.slug,
  lockSlugOnEdit: true,
  extraFields: [
    { name: "author", label: "Author", placeholder: "e.g. Admin" },
    { name: "order", label: "Order", type: "number", placeholder: "e.g. 1", hint: "Smaller numbers appear first." },
    { name: "active", label: "Show on Home?", type: "select",
      options: [{ value: "true", label: "Yes" }, { value: "false", label: "No" }] },
  ],
  extraDefaults: { author: "Admin", order: "", active: "true" },
  toForm: (item) => ({
   
    ...baseToForm({ ...item, content: stripCompanyPack(item.content), ...latestPackOf(item) }),
    author: item.author || "",
    order: item.order ?? "",
    active: String(item.active !== false),
  }),
  toPayload: (form, items) => {
    const nextOrder = items.reduce((m, a) => Math.max(m, Number(a.order) || 0), 0) + 1;
    const base = basePayload(form, "/latest-article", (p) => p.join("\n\n"));
    return {
      ...base,
  
      content: packCompanyDescription(base.content, {
        html: form.contentHtml || "",
        faqs: base.faqs,
        faqEnabled: base.faqEnabled,
        meta: {
          imageAlt: base.imageAlt,
          focusKeyword: base.focusKeyword,
          secondaryKeywords: base.secondaryKeywords,
          tags: base.tags,
          status: base.status,
          publishDate: base.publishDate,
          readTime: base.readTime,
          showToc: base.showToc,
          allowComments: base.allowComments,
          featured: base.featured,
          seoManual: base.seoManual,
          seo: base.seo,
        },
      }),
      author: form.author.trim() || "Admin",
      order: form.order === "" ? nextOrder : Number(form.order),
      active: form.active === "true",
    };
  },
  getRow: (item) => ({
    image: item.image,
    title: item.title,
    subtitle: `/${item.slug} • ${item.category || "General"} • ${item.active === false ? "Hidden" : "Visible"} • Order ${item.order ?? 0}`,
  }),
};

export const articleConfig = {
  key: "articles",
  singular: "Article",
  urlPrefix: "/article",
  listUrl: `${API}/articles`,
  createUrl: `${API}/articles`,
  updateUrl: (key) => `${API}/articles/${key}`,
  deleteUrl: (key) => `${API}/articles/${key}`,
  getKey: (item) => item.id,
  lockSlugOnEdit: false,

  urlSegment: (form) => (form.id ? String(form.id) : ""),
  extraFields: [
    { name: "id", label: "Article ID (unique number)", type: "number", lockOnEdit: true,
      placeholder: "Leave empty to auto-assign the next ID" },
    { name: "company", label: "Company Slug (optional)", placeholder: "e.g. microsoft, jpmorgan",
      hint: "If set, the article will appear on that company's page." },
    { name: "author", label: "Author", placeholder: "e.g. Admin", required: true },
  ],
  extraDefaults: { id: "", company: "", author: "" },
  toForm: (item) => ({
    ...baseToForm(item),
    id: item.id ?? "",
    company: item.company || "",
    author: item.author || "",
  }),
  toPayload: (form, items) => {
    const nextId = items.reduce((max, a) => Math.max(max, Number(a.id) || 0), 0) + 1;
    const id = form.id === "" ? nextId : Number(form.id);
    return {
      ...basePayload(form, "/article", (p) => p.join("\n\n"), String(id)),
      id,
      company: form.company.trim(),
      author: form.author.trim(),
    };
  },
  getRow: (item) => ({
    image: item.image,
    title: item.title,
    subtitle: `ID ${item.id} • ${item.category || "General"} • ${item.author || ""}`,
  }),
};


export const buildBlogArticleConfig = (authors) => {
  const authorName = (id) => authors.find((a) => a.id === id)?.name || id;
  return {
    key: "blogArticles",
    singular: "Author Article",
    urlPrefix: "/articles",
    listUrl: `${API}/blog-articles`,
    createUrl: `${API}/blog-articles`,
    updateUrl: (key) => `${API}/blog-articles/slug/${key}`,
    deleteUrl: (key) => `${API}/blog-articles/slug/${key}`,
    getKey: (item) => item.slug,
    lockSlugOnEdit: true,
    extraFields: [
      { name: "authorId", label: "Author", type: "select", required: true, placeholder: "Select an author",
        options: authors.map((a) => ({ value: a.id, label: a.name })) },
      { name: "id", label: "Article ID", placeholder: "Leave empty to auto-assign (art-078...)", lockOnEdit: true },
    ],
    extraDefaults: { authorId: "", id: "" },
    toForm: (item) => ({
      ...baseToForm(item),
      id: item.id ?? "",
      authorId: item.authorId || "",
    }),
    toPayload: (form, items) => {
      const nums = items
        .map((a) => /^art-(\d+)$/.exec(String(a.id)))
        .filter(Boolean)
        .map((m) => Number(m[1]));
      const next = (nums.length ? Math.max(...nums) : 0) + 1;
      return {
        ...basePayload(form, "/articles", (p) => p), 
        id: String(form.id).trim() || `art-${String(next).padStart(3, "0")}`,
        authorId: form.authorId,
      };
    },
    getRow: (item) => ({
      image: item.image,
      title: item.title,
      subtitle: `${authorName(item.authorId)} • ${item.category || "General"} • ${item.date || ""}`,
    }),
  };
};



const splitLines = (s) => String(s || "").split("\n").map((x) => x.trim()).filter(Boolean);
const nextOrderOf = (items) => items.reduce((m, a) => Math.max(m, Number(a.order) || 0), 0) + 1;


const bioSegment = (form) =>
  form.type ? `${form.type}/${form.slug || slugify(form.title)}` : "";


const BIO_FAQ_START = "<!--BIO_FAQ_START-->";
const BIO_FAQ_END = "<!--BIO_FAQ_END-->";
const BIO_FAQ_JSON = /<!--BIO_FAQ_JSON:([\s\S]*?)-->/;

const BIO_META = /<!--BIO_META:([\s\S]*?)-->/;

const packBioDescription = (html, faqs, faqEnabled, meta) => {
  const metaTag = `<!--BIO_META:${encodeURIComponent(JSON.stringify(meta || {}))}-->`;
  const list = (faqs || []).filter((f) => f.q.trim() && f.a.trim());
  if (!faqEnabled || !list.length) return `${html}\n${metaTag}`;
  const items = list
    .map((f) => `<h3>${escapeHtml(f.q.trim())}</h3><p>${escapeHtml(f.a.trim())}</p>`)
    .join("");
  const json = encodeURIComponent(JSON.stringify(list));
  return `${html}\n${BIO_FAQ_START}<section class="bio-faq"><h2>Frequently Asked Questions</h2>${items}</section>${BIO_FAQ_END}<!--BIO_FAQ_JSON:${json}-->${metaTag}`;
};

const unpackBioDescription = (description) => {
  const raw = String(description || "");
  const start = raw.indexOf(BIO_FAQ_START);
  const body = (start === -1 ? raw : raw.slice(0, start)).replace(BIO_META, "").trim();
  let meta = {};
  const mm = BIO_META.exec(raw);
  if (mm) {
    try { meta = JSON.parse(decodeURIComponent(mm[1])); } catch { meta = {}; }
  }
  let faqs = [];
  const m = BIO_FAQ_JSON.exec(raw);
  if (m) {
    try { faqs = JSON.parse(decodeURIComponent(m[1])); } catch { faqs = []; }
  }
  const isHtml = /<\w+[^>]*>/.test(body);
  return {
    contentHtml: isHtml ? body : legacyToHtml(body),
    faqs,
    faqEnabled: faqs.length > 0,
    meta,
  };
};

export const biographyConfig = {
  key: "biographies",
  singular: "Biography",
  urlPrefix: "/biography",
  listUrl: `${API}/biographies`,
  createUrl: `${API}/biographies/add`,
  updateUrl: (key) => `${API}/biographies/update/${key}`,
  deleteUrl: (key) => `${API}/biographies/delete/${key}`,
  getKey: (item) => item._id || item.id,
  lockSlugOnEdit: false,
  urlSegment: bioSegment,
  extraFields: [
    { name: "type", label: "Type (for filtering routes)", type: "select", options: BIO_TYPE_OPTIONS,
      placeholder: "Select a type", required: true, hint: "Choose the type based on the category (it also appears in the URL)." },
    { name: "role", label: "Role / Designation", placeholder: "e.g. CEO, Founder" },
    { name: "company", label: "Company / Organization", placeholder: "e.g. Google" },
    { name: "born", label: "Born Info", placeholder: "e.g. June 10, 1972" },
    { name: "birthplace", label: "Birthplace", placeholder: "e.g. Madurai, India" },
    { name: "linkedin", label: "LinkedIn Profile URL", placeholder: "https://linkedin.com/in/username" },
    { name: "twitter", label: "Twitter / X Profile URL", placeholder: "https://twitter.com/username" },
    { name: "instagram", label: "Instagram Profile URL", placeholder: "https://instagram.com/username" },
    { name: "website", label: "Personal Website URL", placeholder: "https://example.com" },
  ],
  extraDefaults: {
    type: "", role: "", company: "", born: "", birthplace: "",
    linkedin: "", twitter: "", instagram: "", website: "",
  },
  toForm: (item) => {
    const unpacked = unpackBioDescription(item.description);
    const m = unpacked.meta || {};
    return {
      ...baseToForm({
        ...item,
        title: item.name,
        excerpt: item.shortBio || m.excerpt,
        content: item.description,
        imageAlt: m.imageAlt ?? item.imageAlt,
        focusKeyword: m.focusKeyword ?? item.focusKeyword,
        secondaryKeywords: m.secondaryKeywords ?? item.secondaryKeywords,
        tags: m.tags ?? item.tags,
        status: m.status ?? item.status,
        publishDate: m.publishDate ?? item.publishDate,
        readTime: m.readTime ?? item.readTime,
        showToc: m.showToc ?? item.showToc,
        allowComments: m.allowComments ?? item.allowComments,
        featured: m.featured ?? item.featured,
        seoManual: m.seoManual ?? item.seoManual,
      }),
      contentHtml: unpacked.contentHtml,
      faqs: unpacked.faqs,
      faqEnabled: unpacked.faqEnabled,
      type: item.type || m.type || "",
      role: item.role || "",
      company: item.company || "",
      born: item.born || "",
      birthplace: item.birthplace || "",
      linkedin: item.linkedin || "",
      twitter: item.twitter || "",
      instagram: item.instagram || "",
      website: item.website || "",
    };
  },
  toPayload: (form) => {
    const { title, excerpt, content, image, ...rest } = basePayload(
      form, "/biography", (p) => p.join("\n\n"), bioSegment(form)
    );
    return {
      ...rest,
      name: title,
      shortBio: excerpt,

      description: packBioDescription(form.contentHtml || "", form.faqs, form.faqEnabled, {
        type: form.type,
        excerpt,
        imageAlt: rest.imageAlt,
        focusKeyword: rest.focusKeyword,
        secondaryKeywords: rest.secondaryKeywords,
        tags: rest.tags,
        status: rest.status,
        publishDate: rest.publishDate,
        readTime: rest.readTime,
        showToc: rest.showToc,
        allowComments: rest.allowComments,
        featured: rest.featured,
        seoManual: rest.seoManual,
      }),
      image,
      type: form.type,
      role: form.role.trim(),
      company: form.company.trim(),
      born: form.born.trim(),
      birthplace: form.birthplace.trim(),
      linkedin: form.linkedin.trim(),
      twitter: form.twitter.trim(),
      instagram: form.instagram.trim(),
      website: form.website.trim(),
    };
  },
  getRow: (item) => ({
    image: item.image,
    title: item.name,
    subtitle: `${item.role || ""}${item.company ? ` • ${item.company}` : ""} | Category: ${item.category || "General"}`,
  }),
};


const COMPANY_PACK = /<!--COMPANY_PACK:([\s\S]*?)-->/;
const stripCompanyPack = (s) => String(s || "").replace(COMPANY_PACK, "").trim();
const readCompanyPack = (description) => {
  const m = COMPANY_PACK.exec(String(description || ""));
  if (!m) return {};
  try { return JSON.parse(decodeURIComponent(m[1])); } catch { return {}; }
};
const packCompanyDescription = (excerpt, pack) => {
  const hasBody = (pack.html || "").trim() || (pack.faqs || []).length;
  if (!hasBody) return excerpt;
  return `${excerpt}\n<!--COMPANY_PACK:${encodeURIComponent(JSON.stringify(pack))}-->`;
};
const companyPackOf = (item) => {
  const p = readCompanyPack(item.description);
  const m = p.meta || {};
  return {
    contentHtml: p.html || item.contentHtml,
    faqs: p.faqs ?? item.faqs,
    faqEnabled: p.faqEnabled ?? item.faqEnabled,
    imageAlt: m.imageAlt ?? item.imageAlt,
    focusKeyword: m.focusKeyword ?? item.focusKeyword,
    secondaryKeywords: m.secondaryKeywords ?? item.secondaryKeywords,
    tags: m.tags ?? item.tags,
    status: m.status ?? item.status,
    publishDate: m.publishDate ?? item.publishDate,
    readTime: m.readTime ?? item.readTime,
    showToc: m.showToc ?? item.showToc,
    allowComments: m.allowComments ?? item.allowComments,
    featured: m.featured ?? item.featured,
    seoManual: m.seoManual ?? item.seoManual,
  };
};

const latestPackOf = (item) => {
  const p = readCompanyPack(item.content);
  const m = p.meta || {};
  return {
    contentHtml: p.html || item.contentHtml,
    faqs: p.faqs ?? item.faqs,
    faqEnabled: p.faqEnabled ?? item.faqEnabled,
    imageAlt: m.imageAlt ?? item.imageAlt,
    focusKeyword: m.focusKeyword ?? item.focusKeyword,
    secondaryKeywords: m.secondaryKeywords ?? item.secondaryKeywords,
    tags: m.tags ?? item.tags,
    status: m.status ?? item.status,
    publishDate: m.publishDate ?? item.publishDate,
    readTime: m.readTime ?? item.readTime,
    showToc: m.showToc ?? item.showToc,
    allowComments: m.allowComments ?? item.allowComments,
    featured: m.featured ?? item.featured,
    seoManual: m.seoManual ?? item.seoManual,
  };
};


export const companyConfig = {
  key: "companies",
  singular: "Company",
  urlPrefix: "/company",
  listUrl: `${API}/companies`,
  createUrl: `${API}/companies`,
  updateUrl: (key) => `${API}/companies/${key}`,
  deleteUrl: (key) => `${API}/companies/${key}`,
  getKey: (item) => item.slug,
  lockSlugOnEdit: true,
  extraFields: [
    { name: "startId", label: "Start Article ID", type: "number", placeholder: "e.g. 101", required: true },
    { name: "endId", label: "End Article ID", type: "number", placeholder: "e.g. 110", required: true },
  ],

  extraDefaults: { startId: "", endId: "", category: "Company" },
  toForm: (item) => ({
    ...baseToForm({
      ...item,
      title: item.name,
      excerpt: stripCompanyPack(item.description),
      image: item.imageURL,
      ...companyPackOf(item),
    }),
    category: item.category || "Company",
    startId: item.startId ?? "",
    endId: item.endId ?? "",
  }),
  toPayload: (form) => {
    const { title, excerpt, content, image, category, ...rest } = basePayload(
      form, "/company", (p) => p.join("\n\n")
    );
    return {
      ...rest,
      name: title,

      description: packCompanyDescription(excerpt, {
        html: form.contentHtml || "",
        faqs: rest.faqs,
        faqEnabled: rest.faqEnabled,
        meta: {
          imageAlt: rest.imageAlt,
          focusKeyword: rest.focusKeyword,
          secondaryKeywords: rest.secondaryKeywords,
          tags: rest.tags,
          status: rest.status,
          publishDate: rest.publishDate,
          readTime: rest.readTime,
          showToc: rest.showToc,
          allowComments: rest.allowComments,
          featured: rest.featured,
          seoManual: rest.seoManual,
          seo: rest.seo,
        },
      }),
      imageURL: image,
      startId: Number(form.startId),
      endId: Number(form.endId),
    };
  },
  getRow: (item) => ({
    image: item.imageURL,
    title: item.name,
    subtitle: `/${item.slug} • Article IDs ${item.startId} - ${item.endId}`,
  }),
};


const brandMetaOf = (item) => {
  const m = unpackBioDescription(item.blog || item.articleContent).meta || {};
  return {
    imageAlt: m.imageAlt ?? item.imageAlt,
    focusKeyword: m.focusKeyword ?? item.focusKeyword,
    secondaryKeywords: m.secondaryKeywords ?? item.secondaryKeywords,
    tags: m.tags ?? item.tags,
    status: m.status ?? item.status,
    publishDate: m.publishDate ?? item.publishDate,
    readTime: m.readTime ?? item.readTime,
    showToc: m.showToc ?? item.showToc,
    allowComments: m.allowComments ?? item.allowComments,
    featured: item.featured ?? m.featured,
    seoManual: m.seoManual ?? item.seoManual,
  };
};
const brandBodyOf = (item) => {
  const u = unpackBioDescription(item.blog || item.articleContent);
  return { contentHtml: u.contentHtml, faqs: u.faqs, faqEnabled: u.faqEnabled };
};

export const brandConfig = {
  key: "brands",
  singular: "Brand Product",
  urlPrefix: "/brand",
  listUrl: `${API}/brands`,
  createUrl: `${API}/brands`,
  updateUrl: (key) => `${API}/brands/${key}`,
  deleteUrl: (key) => `${API}/brands/${key}`,
  getKey: (item) => item.slug,
  lockSlugOnEdit: true,
  extraFields: [
    { name: "brand", label: "Brand", placeholder: "e.g. Jio, Vivo, Apple", required: true },
    { name: "subCategory", label: "Sub Category", placeholder: "e.g. Flagship Phone" },
    { name: "order", label: "Order (card position)", type: "number", placeholder: "e.g. 1",
      hint: "Smaller numbers appear first." },
    { name: "features", label: "Key Features", type: "textarea", rows: 5, span2: true,
      placeholder: "4G connectivity\n1000 mAh battery\nPhysical keypad", hint: "Write each feature on a new line." },
  ],
  extraDefaults: { brand: "", subCategory: "", order: "", features: "" },
  toForm: (item) => ({
    ...baseToForm({
      ...item,
      title: item.name || item.articleTitle,
      excerpt: item.description || item.shortDescription,
      content: item.blog || item.articleContent,
      image: item.imageUrl,
      ...brandMetaOf(item),
    }),
    ...brandBodyOf(item),
    brand: item.brand || "",
    subCategory: item.subCategory || "",
    order: item.order ?? "",
    features: Array.isArray(item.features) ? item.features.join("\n") : "",
  }),
  toPayload: (form, items) => {
    const { title, excerpt, content, image, ...rest } = basePayload(
      form, "/brand", (p) => p.join("\n\n")
    );
    return {
      ...rest,
      name: title,
      description: excerpt,
  
      blog: packBioDescription(form.contentHtml || "", form.faqs, form.faqEnabled, {
        imageAlt: rest.imageAlt,
        focusKeyword: rest.focusKeyword,
        secondaryKeywords: rest.secondaryKeywords,
        tags: rest.tags,
        status: rest.status,
        publishDate: rest.publishDate,
        readTime: rest.readTime,
        showToc: rest.showToc,
        allowComments: rest.allowComments,
        featured: rest.featured,
        seoManual: rest.seoManual,
        seo: rest.seo,
      }),
      imageUrl: image,
      brand: form.brand.trim(),
      subCategory: form.subCategory.trim(),
      features: splitLines(form.features),
      featured: !!form.featured,
      order: form.order === "" ? nextOrderOf(items) : Number(form.order),
    };
  },
  getRow: (item) => ({
    image: item.imageUrl,
    title: item.name || item.articleTitle,
    subtitle: `${item.brand || ""} • ${item.category || "General"} • ${
      item.featured ? "⭐ Featured" : "Not featured"
    } • Order ${item.order ?? 0}`,
  }),
};

const slidingMetaOf = (item) => {
  const m = unpackBioDescription(item.blog).meta || {};
  return {
    imageAlt: m.imageAlt ?? item.imageAlt,
    focusKeyword: m.focusKeyword ?? item.focusKeyword,
    secondaryKeywords: m.secondaryKeywords ?? item.secondaryKeywords,
    tags: m.tags ?? item.tags,
    status: m.status ?? item.status,
    publishDate: m.publishDate ?? item.publishDate,
    readTime: m.readTime ?? item.readTime,
    showToc: m.showToc ?? item.showToc,
    allowComments: m.allowComments ?? item.allowComments,
    featured: m.featured ?? item.featured,
    seoManual: m.seoManual ?? item.seoManual,
  };
};
const slidingBodyOf = (item) => {
  const u = unpackBioDescription(item.blog);
  return { contentHtml: u.contentHtml, faqs: u.faqs, faqEnabled: u.faqEnabled };
};

export const slidingCompanyConfig = {
  key: "slidingCompanies",
  singular: "Sliding Company",
  urlPrefix: "/sliding-company",
  listUrl: `${API}/sliding-companies?all=true`,
  createUrl: `${API}/sliding-companies`,
  updateUrl: (key) => `${API}/sliding-companies/${key}`,
  deleteUrl: (key) => `${API}/sliding-companies/${key}`,
  getKey: (item) => item.slug,
  lockSlugOnEdit: true,
  extraFields: [
    { name: "tagline", label: "Card Tag (bottom text)", placeholder: "VERIFIED PARTNER" },
    { name: "website", label: "Website URL", placeholder: "https://example.com" },
    { name: "order", label: "Order", type: "number", placeholder: "e.g. 1", hint: "Smaller numbers appear first." },
    { name: "active", label: "Show on Home?", type: "select",
      options: [{ value: "true", label: "Yes" }, { value: "false", label: "No" }] },
    { name: "features", label: "Key Highlights", type: "textarea", rows: 5, span2: true,
      placeholder: "Cloud services\nAI tools", hint: "One point per line." },
  ],
  extraDefaults: {
    tagline: "VERIFIED PARTNER", website: "", order: "", active: "true",
    features: "", category: "Sliding Company",
  },
  toForm: (item) => ({
    ...baseToForm({
      ...item,
      title: item.name,
      excerpt: item.description,
      content: item.blog,
      image: item.imageURL,
      ...slidingMetaOf(item),
    }),
    ...slidingBodyOf(item),
    category: item.category || "Sliding Company",
    tagline: item.tagline || "",
    website: item.website || "",
    order: item.order ?? "",
    active: String(item.active !== false),
    features: Array.isArray(item.features) ? item.features.join("\n") : "",
  }),
  toPayload: (form, items) => {
    const { title, excerpt, content, image, category, ...rest } = basePayload(
      form, "/sliding-company", (p) => p.join("\n\n")
    );
    return {
      ...rest,
      name: title,
      description: excerpt,
   
      blog: packBioDescription(form.contentHtml || "", form.faqs, form.faqEnabled, {
        imageAlt: rest.imageAlt,
        focusKeyword: rest.focusKeyword,
        secondaryKeywords: rest.secondaryKeywords,
        tags: rest.tags,
        status: rest.status,
        publishDate: rest.publishDate,
        readTime: rest.readTime,
        showToc: rest.showToc,
        allowComments: rest.allowComments,
        featured: rest.featured,
        seoManual: rest.seoManual,
        seo: rest.seo,
      }),
      imageURL: image,
      tagline: form.tagline.trim() || "VERIFIED PARTNER",
      website: form.website.trim(),
      features: splitLines(form.features),
      order: form.order === "" ? nextOrderOf(items) : Number(form.order),
      active: form.active === "true",
    };
  },
  getRow: (item) => ({
    image: item.imageURL,
    title: item.name,
    subtitle: `/${item.slug} • ${item.active === false ? "Hidden" : "Visible"} • Order ${item.order ?? 0}`,
  }),
};