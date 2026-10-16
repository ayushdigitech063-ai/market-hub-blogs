import { useEffect } from "react";



const MARK = "data-seo-head";

function setMeta(attr, key, content) {
  if (!content) return;
  const el = document.createElement("meta");
  el.setAttribute(attr, key);
  el.setAttribute("content", content);
  el.setAttribute(MARK, "1");
  document.head.appendChild(el);
}

function setLink(rel, href) {
  if (!href) return;
  const el = document.createElement("link");
  el.setAttribute("rel", rel);
  el.setAttribute("href", href);
  el.setAttribute(MARK, "1");
  document.head.appendChild(el);
}

function setJsonLd(data) {
  const el = document.createElement("script");
  el.type = "application/ld+json";
  el.setAttribute(MARK, "1");
  el.text = JSON.stringify(data);
  document.head.appendChild(el);
}

export default function SeoHead({ post }) {
  useEffect(() => {
    if (!post) return undefined;

    const seo = post.seo || {};
    const title = seo.metaTitle || post.title || "";
    const desc = seo.metaDescription || post.excerpt || "";
    const canonical = seo.canonicalUrl || window.location.href;
    const image = seo.ogImage || post.image || "";
    const prevTitle = document.title;
    const prevLang = document.documentElement.lang;

    if (title) document.title = title;
    if (seo.language) document.documentElement.lang = seo.language;

  
    document.head.querySelectorAll(`[${MARK}]`).forEach((n) => n.remove());
    document.head.querySelectorAll('meta[name="description"], meta[name="robots"], link[rel="canonical"]')
      .forEach((n) => n.remove());

    setMeta("name", "description", desc);
    setMeta("name", "robots", seo.robots || "index, follow");
    const keywords = [post.focusKeyword, ...(post.secondaryKeywords || [])].filter(Boolean).join(", ");
    setMeta("name", "keywords", keywords);
    setLink("canonical", canonical);


    setMeta("property", "og:type", "article");
    setMeta("property", "og:title", seo.ogTitle || title);
    setMeta("property", "og:description", seo.ogDescription || desc);
    setMeta("property", "og:image", image);
    setMeta("property", "og:url", canonical);
    (post.tags || []).forEach((t) => setMeta("property", "article:tag", t));

    setMeta("name", "twitter:card", seo.twitterCard || "summary_large_image");
    setMeta("name", "twitter:title", seo.twitterTitle || seo.ogTitle || title);
    setMeta("name", "twitter:description", seo.twitterDescription || seo.ogDescription || desc);
    setMeta("name", "twitter:image", seo.twitterImage || image);

  
    const faqs = post.faqEnabled ? (post.faqs || []).filter((f) => f.q && f.a) : [];
    const faqSchema = {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      mainEntity: faqs.map((f) => ({
        "@type": "Question",
        name: f.q,
        acceptedAnswer: { "@type": "Answer", text: f.a },
      })),
    };
    const type = seo.schemaType || "BlogPosting";
    if (type === "FAQPage") {
      if (faqs.length) setJsonLd(faqSchema);
    } else {
      setJsonLd({
        "@context": "https://schema.org",
        "@type": type,
        headline: title,
        description: desc,
        image: image ? [image] : undefined,
        datePublished: post.publishDate || undefined,
        author: post.author ? { "@type": "Person", name: post.author } : undefined,
        inLanguage: seo.language || "en",
        mainEntityOfPage: canonical,
        keywords: keywords || undefined,
      });
      if (faqs.length) setJsonLd(faqSchema);
    }

    return () => {
      document.head.querySelectorAll(`[${MARK}]`).forEach((n) => n.remove());
      document.title = prevTitle;
      document.documentElement.lang = prevLang;
    };
  }, [post]);

  return null;
}
