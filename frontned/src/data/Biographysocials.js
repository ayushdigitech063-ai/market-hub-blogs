import {
  FaXTwitter,
  FaInstagram,
  FaLinkedinIn,
  FaFacebookF,
  FaYoutube,
} from "react-icons/fa6";


export const SOCIAL_ICONS = [
  { key: "twitter", label: "X (Twitter)", Icon: FaXTwitter },
  { key: "instagram", label: "Instagram", Icon: FaInstagram },
  { key: "linkedin", label: "LinkedIn", Icon: FaLinkedinIn },
  { key: "facebook", label: "Facebook", Icon: FaFacebookF, optional: true },
  { key: "youtube", label: "YouTube", Icon: FaYoutube, optional: true },
];


const ALIASES = {
  twitter: ["twitter", "x", "twitterurl", "xurl", "twitterlink", "xlink", "twitterprofile", "xtwitter"],
  instagram: ["instagram", "insta", "instagramurl", "instagramlink", "instaurl", "instalink"],
  linkedin: ["linkedin", "linkedinurl", "linkedinlink", "linkedinprofile"],
  facebook: ["facebook", "fb", "facebookurl", "facebooklink", "fburl"],
  youtube: ["youtube", "yt", "youtubeurl", "youtubelink", "ytlink"],
};

const BASE = {
  twitter: "https://x.com/",
  instagram: "https://instagram.com/",
  linkedin: "https://linkedin.com/in/",
  facebook: "https://facebook.com/",
  youtube: "https://youtube.com/@",
};

const norm = (k) => String(k).toLowerCase().replace(/[^a-z0-9]/g, "");

// Description ke peeche chhupa BIO_META nikalo
const readMeta = (text) => {
  const m = /<!--BIO_META:([\s\S]*?)-->/.exec(String(text || ""));
  if (!m) return {};
  try {
    return JSON.parse(decodeURIComponent(m[1]));
  } catch {
    try {
      return JSON.parse(m[1]);
    } catch {
      return {};
    }
  }
};

const collect = (src, out) => {
  if (!src) return;
  if (Array.isArray(src)) {
    src.forEach((e) => {
      if (e && typeof e === "object") {
        const name = e.platform || e.name || e.type || e.label || e.key;
        const url = e.url || e.link || e.href;
        if (name && url && !out[norm(name)]) out[norm(name)] = url;
      }
    });
    return;
  }
  if (typeof src === "object") {
    Object.entries(src).forEach(([k, v]) => {
      if ((typeof v === "string" || typeof v === "number") && !out[norm(k)]) {
        out[norm(k)] = v;
      }
    });
  }
};

const fixUrl = (key, value) => {
  const v = String(value || "").trim();
  if (!v || v === "#" || v === "null" || v === "undefined") return "";
  if (/^https?:\/\//i.test(v)) return v;
  if (v.startsWith("//")) return `https:${v}`;
  if (/^[\w.-]+\.[a-z]{2,}/i.test(v)) return `https://${v}`;
  return `${BASE[key]}${v.replace(/^@/, "")}`;
};
const DOMAINS = {
  twitter: /(?:twitter\.com|x\.com)\//i,
  instagram: /instagram\.com\//i,
  linkedin: /linkedin\.com\//i,
  facebook: /facebook\.com\//i,
  youtube: /youtube\.com\/|youtu\.be\//i,
};


const deepStrings = (val, out, depth = 0) => {
  if (depth > 6 || val == null) return;

  if (typeof val === "string") {
    out.push(val);
    const re = /<!--[A-Z_]+:([\s\S]*?)-->/g;
    let m;
    while ((m = re.exec(val))) {
      let payload = m[1];
      try {
        payload = decodeURIComponent(payload);
      } catch {}
      out.push(payload);
      try {
        deepStrings(JSON.parse(payload), out, depth + 1);
      } catch {}
    }
    return;
  }

  if (Array.isArray(val)) {
    val.forEach((v) => deepStrings(v, out, depth + 1));
    return;
  }

  if (typeof val === "object") {
    Object.values(val).forEach((v) => deepStrings(v, out, depth + 1));
  }
};

const scanUrls = (item) => {
  const texts = [];
  deepStrings(item, texts);

  const found = {};
  texts.forEach((t) => {
    (t.match(/https?:\/\/[^\s"'<>)\\]+/g) || []).forEach((url) => {
      Object.keys(DOMAINS).forEach((key) => {
        if (!found[key] && DOMAINS[key].test(url)) found[key] = url;
      });
    });
  });
  return found;
};

export const getSocialLinks = (item = {}) => {
  const meta = readMeta(item.description);
  const flat = {};

  [
    item.socialLinks, item.socials, item.social, item.socialMedia, item.links,
    item,
    meta.socialLinks, meta.socials, meta.social, meta.socialMedia, meta.links,
    meta,
  ].forEach((src) => collect(src, flat));

  const scanned = scanUrls(item);
  const result = {};

  SOCIAL_ICONS.forEach(({ key }) => {
    for (const alias of ALIASES[key]) {
      const url = fixUrl(key, flat[alias]);
      if (url) {
        result[key] = url;
        return;
      }
    }

    if (scanned[key]) result[key] = scanned[key];
  });

  return result;
};