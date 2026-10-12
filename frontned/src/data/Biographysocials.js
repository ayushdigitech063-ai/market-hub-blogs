// Social links for a biography profile.
// Used by the main biography page, the "View all" page and the details page,
// so a link added in the admin panel shows up the same way everywhere.
import { FaTwitter, FaInstagram, FaLinkedinIn, FaGlobe } from "react-icons/fa";

// Display order of the icons
export const SOCIAL_ICONS = [
  { key: "twitter", label: "Twitter", Icon: FaTwitter },
  { key: "instagram", label: "Instagram", Icon: FaInstagram },
  { key: "linkedin", label: "LinkedIn", Icon: FaLinkedinIn },
  // Website is only shown when a link exists; the other three always show
  { key: "website", label: "Website", Icon: FaGlobe, optional: true },
];

const normalizeUrl = (url) => {
  if (!url || typeof url !== "string") return "";
  const u = url.trim();
  // Must look like a link ("site.com/..."), not a note such as "N/A" or "@handle"
  if (!u || /\s/.test(u) || !u.includes(".")) return "";
  return /^https?:\/\//i.test(u) ? u : `https://${u.replace(/^\/+/, "")}`;
};

// Field / platform name -> icon key ("LinkedIn", "linkedinUrl", "X", "site" ...)
const platformOf = (name) => {
  const k = String(name || "").toLowerCase().replace(/[^a-z]/g, "");
  if (/^linked/.test(k)) return "linkedin";
  if (/^insta/.test(k)) return "instagram";
  if (/^(twitter|x)(url|link)?$/.test(k)) return "twitter";
  if (/^(website|site|web)(url|link)?$/.test(k)) return "website";
  return null;
};

// Link -> icon key, for fields with unexpected names ("profile1", "link", ...)
const platformFromUrl = (url) => {
  const host = url.replace(/^https?:\/\//i, "").split("/")[0].toLowerCase();
  if (/(^|\.)linkedin\.com$/.test(host)) return "linkedin";
  if (/(^|\.)instagram\.com$/.test(host)) return "instagram";
  if (/(^|\.)(twitter|x)\.com$/.test(host)) return "twitter";
  return null;
};

// Returns { twitter?, instagram?, linkedin?, website? } with clean https links.
// Reads the flat fields saved by the admin panel (twitter, linkedin, instagram,
// website) and also any nested object / array of links (socials, socialLinks, ...).
export const getSocialLinks = (item = {}) => {
  const result = {};
  const add = (name, url) => {
    const clean = normalizeUrl(url);
    if (!clean) return;
    // Field name first; if the field name is unknown, recognise the site in the link itself
    const platform = platformOf(name) || platformFromUrl(clean);
    if (platform) result[platform] = clean;
  };

  // { twitter: "..." }  or  [{ platform: "twitter", url: "..." }]
  const collect = (node, depth = 0) => {
    if (!node || typeof node !== "object" || depth > 3) return;
    if (Array.isArray(node)) {
      node.forEach((n) => {
        if (!n || typeof n !== "object") return;
        add(n.platform || n.name || n.type || n.title, n.url || n.link || n.href);
        collect(n, depth + 1);
      });
      return;
    }
    Object.entries(node).forEach(([k, v]) => {
      if (typeof v === "string") add(k, v);
      else collect(v, depth + 1);
    });
  };

  Object.values(item).forEach((v) => collect(v));

  // Flat fields win over nested ones
  Object.entries(item).forEach(([k, v]) => {
    if (typeof v === "string") add(k, v);
  });

  return result;
};