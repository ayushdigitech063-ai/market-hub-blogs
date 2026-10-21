
import {
  UserRound,
  Newspaper,
  Building2,
  PenLine,
  BookOpen,
  Smartphone,
  Layers,
  LayoutDashboard,
  MessageCircle,
  FileText,
  Settings,
  Bell,
} from "lucide-react";

export const emptyBio = {
  name: "",
  slug: "",
  role: "",
  company: "",
  category: "",
  type: "",
  image: "",
  shortBio: "",
  description: "",
  born: "",
  birthplace: "",
  linkedin: "",
  twitter: "",
  instagram: "",
  website: "",
};

export const emptySlidingCompany = {
  slug: "",
  name: "",
  imageURL: "",
  description: "",
  tagline: "VERIFIED PARTNER",
  blog: "",
  features: "",
  website: "",
  order: "",
  active: "true",
};

export const emptyCompany = {
  name: "",
  slug: "",
  imageURL: "",
  description: "",
  startId: "",
  endId: "",
};

export const emptyBlogAuthor = {
  id: "",
  name: "",
  role: "",
  company: "",
  image: "",
  about: "",
  education: "",
  expertise: "",
  twitter: "",
  linkedin: "",
  instagram: "",
  youtube: "",
};

export const emptyBrand = {
  slug: "",
  name: "",
  brand: "",
  category: "",
  subCategory: "",
  imageUrl: "",
  description: "",
  blog: "",
  features: "",
  featured: "false",
  order: "",
};

export const BIO_CATEGORY_OPTIONS = [
  { value: "Business", label: "Business (includes CEOs)" },
  { value: "Sports", label: "Sports" },
  { value: "Entrepreneur", label: "Entrepreneur" },
  { value: "Actors", label: "Actors" },
];

export const BIO_TYPE_OPTIONS = [
  { value: "ceo", label: "CEO" },
  { value: "sports", label: "Sports" },
  { value: "entrepreneur", label: "Entrepreneur" },
  { value: "actor", label: "Actor" },
];

export const bioFields = [
  {
    name: "name",
    label: "Name / Title",
    placeholder: "e.g. Sundar Pichai",
    required: true,
  },
  {
    name: "slug",
    label: "Slug (URL friendly name)",
    placeholder: "e.g. sundar-pichai",
    required: true,
  },
  {
    name: "role",
    label: "Role / Designation",
    type: "combo",
    placeholder: "Select a role",
    hint: "Pick an existing designation, or choose '+ Add new...'.",
  },
  {
    name: "company",
    label: "Company / Organization",
    placeholder: "e.g. Google",
  },
  {
    name: "category",
    label: "Category",
    type: "select",
    options: BIO_CATEGORY_OPTIONS,
    placeholder: "Select a category",
    hint: "Decides where the profile appears on the website.",
  },
  {
    name: "type",
    label: "Type (for filtering routes)",
    type: "select",
    options: BIO_TYPE_OPTIONS,
    placeholder: "Select a type",
    hint: "Pick the type that matches the category.",
  },
  {
    name: "image",
    type: "image",
    label: "Image",
    placeholder: "Paste direct image link here",
    span2: true,
  },
  {
    name: "born",
    label: "Born Info",
    placeholder: "e.g. June 10, 1972",
  },
  {
    name: "birthplace",
    label: "Birthplace",
    placeholder: "e.g. Madurai, India",
  },
  {
    name: "linkedin",
    label: "LinkedIn Profile URL",
    placeholder: "https://linkedin.com/in/username",
  },
  {
    name: "twitter",
    label: "Twitter / X Profile URL",
    placeholder: "https://twitter.com/username",
  },
  {
    name: "instagram",
    label: "Instagram Profile URL",
    placeholder: "https://instagram.com/username",
  },
  {
    name: "website",
    label: "Personal Website URL",
    placeholder: "https://example.com",
  },
  {
    name: "shortBio",
    label: "Short Bio",
    type: "textarea",
    rows: 2,
    span2: true,
    placeholder: "Write a brief overview...",
  },
  {
    name: "description",
    label: "Full Blog Content / Description",
    type: "textarea",
    rows: 6,
    span2: true,
    placeholder: "Write full detailed biography or blog content here...",
  },
];

export const bioFilters = [
  { key: "category", label: "Category", get: (i) => i.category, options: BIO_CATEGORY_OPTIONS },
  { key: "type", label: "Type", get: (i) => i.type, options: BIO_TYPE_OPTIONS },
  { key: "role", label: "Role", get: (i) => i.role },
];

export const slidingCompanyFields = [
  {
    name: "name",
    label: "Company Name",
    placeholder: "e.g. Google",
    required: true,
  },
  {
    name: "slug",
    label: "Unique ID (Slug)",
    placeholder: "e.g. google",
    required: true,
    lockOnEdit: true,
  },
  {
    name: "imageURL",
    type: "image",
    label: "Logo / Image",
    placeholder: "Paste direct image link",
    span2: true,
  },
  {
    name: "tagline",
    label: "Card Tag (neeche wala text)",
    placeholder: "VERIFIED PARTNER",
  },
  {
    name: "website",
    label: "Website URL",
    placeholder: "https://example.com",
  },
  {
    name: "description",
    label: "Card Description",
    type: "textarea",
    rows: 2,
    span2: true,
    placeholder: "Card par dikhne wali short line",
  },
  {
    name: "blog",
    label: "Full Page Content",
    type: "textarea",
    rows: 10,
    span2: true,
    placeholder: "Detail page contant",
    hint: "Naya paragraph = khali line chhodo.",
  },
  {
    name: "features",
    label: "Key Highlights",
    type: "textarea",
    rows: 5,
    span2: true,
    placeholder: "Cloud services\nAI tools",
    hint: "Har point nayi line me.",
  },
];

export const companyFields = [
  {
    name: "name",
    label: "Company Name",
    placeholder: "e.g. Microsoft",
    required: true,
  },
  {
    name: "slug",
    label: "Slug (URL)",
    placeholder: "e.g. microsoft",
    required: true,
    lockOnEdit: true,
  },
  {
    name: "imageURL",
    type: "image",
    label: "Image",
    placeholder: "Company card ki image ka link",
    required: true,
    span2: true,
  },
  {
    name: "startId",
    label: "Start Article ID",
    type: "number",
    placeholder: "e.g. 101",
    required: true,
  },
  {
    name: "endId",
    label: "End Article ID",
    type: "number",
    placeholder: "e.g. 110",
    required: true,
  },
  {
    name: "description",
    label: "Description",
    type: "textarea",
    rows: 3,
    span2: true,
    required: true,
    placeholder: "Company ke baare me short description",
  },
];

export const blogAuthorFields = [
  {
    name: "id",
    label: "Author ID",
    placeholder: "e.g. sudha-murty",
    required: true,
    lockOnEdit: true,
    hint: "Lowercase, no spaces. This ID links to the author's name in articles",
  },
  {
    name: "name",
    label: "Author Name",
    placeholder: "e.g. Sudha Murty",
    required: true,
  },
  {
    name: "role",
    label: "Role",
    placeholder: "e.g. Author, Philanthropist & Educator",
  },
  {
    name: "company",
    label: "Organization",
    placeholder: "e.g. Independent Author",
  },
  {
    name: "image",
    type: "image",
    label: "Profile Picture",
    placeholder: "Paste direct image link here",
    span2: true,
  },
  {
    name: "about",
    label: "About the Author",
    type: "textarea",
    rows: 4,
    span2: true,
    placeholder: "Write about the author...",
  },
  {
    name: "education",
    label: "Education / Background",
    placeholder: "e.g. MBA, IIM Calcutta",
    span2: true,
  },
  {
    name: "expertise",
    label: "Expertise",
    placeholder: "Indian Mythology, Storytelling, Philosophy",
    span2: true,
    hint: "Comma (,) laga kar alag-alag likho.",
  },
  {
    name: "twitter",
    label: "Twitter / X URL",
    placeholder: "https://x.com/username",
  },
  {
    name: "linkedin",
    label: "LinkedIn URL",
    placeholder: "https://linkedin.com/in/username",
  },
  {
    name: "instagram",
    label: "Instagram URL",
    placeholder: "https://instagram.com/username",
  },
  {
    name: "youtube",
    label: "YouTube URL",
    placeholder: "https://youtube.com/@channel",
  },
];

export const brandFields = [
  {
    name: "name",
    label: "Product / Article Title",
    placeholder: "e.g. Vivo X200 Pro",
    required: true,
    span2: true,
  },
  {
    name: "slug",
    label: "Slug (URL)",
    placeholder: "e.g. vivo-x200-pro",
    required: true,
    lockOnEdit: true,
    hint: "Chhote akshar, bina space ke. Page ka link /brand/<slug> banta hai.",
  },
  {
    name: "brand",
    label: "Brand",
    placeholder: "e.g. Jio, Vivo, Apple",
    required: true,
  },
  {
    name: "category",
    label: "Category",
    placeholder: "e.g. Smartphones, Laptops",
    required: true,
  },
  {
    name: "subCategory",
    label: "Sub Category",
    placeholder: "e.g. Flagship Phone",
  },
  {
    name: "imageUrl",
    type: "image",
    label: "Image",
    placeholder: "Paste direct image link here",
    span2: true,
  },
  {
    name: "featured",
    label: "Home page par dikhana hai?",
    type: "select",
    options: [
      { value: "true", label: "Haan, Featured me dikhao" },
      { value: "false", label: "Nahi" },
    ],
  },
  {
    name: "order",
    label: "Order (card position)",
    type: "number",
    placeholder: "e.g. 1",
    hint: "Chota number pehle dikhega.",
  },
  {
    name: "description",
    label: "Short Description (card + overview)",
    type: "textarea",
    rows: 2,
    span2: true,
    placeholder: "Card par dikhne wali chhoti summary",
  },
  {
    name: "blog",
    label: "Full Blog Content",
    type: "textarea",
    rows: 10,
    span2: true,
    placeholder: "Poora blog yahan likho...",
    hint: "Naya paragraph = khali line chhodo.",
  },
  {
    name: "features",
    label: "Key Features",
    type: "textarea",
    rows: 5,
    span2: true,
    placeholder: "4G connectivity\n1000 mAh battery\nPhysical keypad",
    hint: "Har feature nayi line me likho.",
  },
];

export const META = {
  biographies: {
    group: "Website Content",
    title: "Biographies",
    desc: "Please manage your Biography profiles.",
  },
    whatsappSettings: {
    group: "System",
    title: "WhatsApp Settings",
    desc: "Manage the WhatsApp contact number and default message.",
  },
  articles: {
    group: "Website Content",
    title: "Articles",
    desc: "Please manage your Articles (with SEO).",
  },
  companies: {
    group: "Website Content",
    title: "Companies",
    desc: "Please manage Company cards.",
  },
  authors: {
    group: "Author Blog",
    title: "Authors",
    desc: "Please manage Author profiles.",
  },
  blogArticles: {
    group: "Author Blog",
    title: "Author Articles",
    desc: "Please manage Author Articles (with SEO).",
  },
  brands: {
    group: "Brands & Products",
    title: "Brands & Products",
    desc: "Please manage Brand cards of Home page.",
  },
  slidingCompanies: {
    group: "Sliding Companies",
    title: "Sliding Companies",
    desc: "Please manage Home page Sliding section.",
  },
  latestArticles: {
    group: "Latest Articles",
    title: "Latest Articles",
    desc: "Please manage Home page Latest Articles (with SEO).",
  },
  blogs: {
    group: "Blog Posts",
    title: "Blog Posts",
    desc: "Manage Biography, Brand, Sliding Company & Latest Article from one place.",
  },
  notifications: {
    group: "Blog Posts",
    title: "Notifications",
    desc: "View blog submissions from website visitors and manage their status.",
  },
  settings: {
    group: "System",
    title: "Settings",
    desc: "Your admin account & system details.",
  },
};
export const NAV = [
  {
    group: "Main",
    items: [
      { key: "overview", label: "Overview", Icon: LayoutDashboard },
    ],
  },
  {
    group: "Blog Posts",
    items: [
      { key: "blogs", label: "Blog Posts", Icon: FileText },
      { key: "notifications", label: "Notifications", Icon: Bell },
    ],
  },
  {
    group: "Author Blog",
    items: [
      { key: "authors", label: "Authors", Icon: PenLine },
    ],
  },
  {
    group: "System",
    items: [
      { key: "settings", label: "Settings", Icon: Settings },
      {
        key: "whatsappSettings",
        label: "WhatsApp Settings",
        Icon: MessageCircle,
      },
    ],
  },
];
export const OVERVIEW_ITEMS = [
  { key: "biographies", label: "Biographies", group: "Website Content", Icon: UserRound },
  { key: "articles", label: "Articles", group: "Website Content", Icon: Newspaper },
  { key: "companies", label: "Companies", group: "Website Content", Icon: Building2 },
  { key: "authors", label: "Authors", group: "Author Blog", Icon: PenLine },
  { key: "blogArticles", label: "Author Articles", group: "Author Blog", Icon: BookOpen },
  { key: "latestArticles", label: "Latest Articles", group: "Latest Articles", Icon: Newspaper },
  { key: "brands", label: "Brands", group: "Brands & Products", Icon: Smartphone },
  { key: "slidingCompanies", label: "Sliding Companies", group: "Sliding Companies", Icon: Layers },
];

export const DONUT_COLORS = [
  "#f97316",
  "#f59e0b",
  "#eab308",
  "#fb923c",
  "#fbbf24",
  "#ea580c",
  "#d97706",
  "#facc15",
];
