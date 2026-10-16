import React, { useEffect, useMemo, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import SeoHead from "../../components/SeoHead";
import ArticleBody from "../../components/ArticleBody";
import { fetchSlidingCompany } from "../../api/slidingCompanyApi";


const isLive = (x) => x && x.status !== "draft";


const FAQ_START = "<!--BIO_FAQ_START-->";
const META_RE = /<!--BIO_META:([\s\S]*?)-->/;
const FAQ_JSON_RE = /<!--BIO_FAQ_JSON:([\s\S]*?)-->/;

const unpackBlog = (blog) => {
  const raw = String(blog || "");
  const start = raw.indexOf(FAQ_START);
  const html = (start === -1 ? raw : raw.slice(0, start)).replace(META_RE, "").trim();
  let meta = {};
  let faqs = [];
  const mm = META_RE.exec(raw);
  if (mm) {
    try { meta = JSON.parse(decodeURIComponent(mm[1])); } catch { meta = {}; }
  }
  const fm = FAQ_JSON_RE.exec(raw);
  if (fm) {
    try { faqs = JSON.parse(decodeURIComponent(fm[1])); } catch { faqs = []; }
  }
  return { html, faqs, meta, isHtml: /<\w+[^>]*>/.test(html) };
};

export default function SlidingCompanyDetail() {
  const { slug } = useParams();
  const [item, setItem] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
    setLoading(true);
    fetchSlidingCompany(slug)
      .then((data) => setItem(data || null))
      .catch(() => setItem(null))
      .finally(() => setLoading(false));
  }, [slug]);

  const view = useMemo(() => {
    if (!item) return null;
    const { html, faqs, meta, isHtml } = unpackBlog(item.blog);
    return {
      ...item,
      blog: html,
      contentHtml: item.contentHtml || (isHtml ? html : ""),
      faqs: item.faqs?.length ? item.faqs : faqs,
      faqEnabled: item.faqEnabled || faqs.length > 0,
      showToc: item.showToc ?? meta.showToc ?? true,
      status: item.status ?? meta.status,
      imageAlt: item.imageAlt ?? meta.imageAlt,
      focusKeyword: item.focusKeyword ?? meta.focusKeyword,
      secondaryKeywords: item.secondaryKeywords ?? meta.secondaryKeywords,
      tags: item.tags ?? meta.tags,
      publishDate: item.publishDate ?? meta.publishDate,
      readTime: item.readTime ?? meta.readTime,
      seo: item.seo ?? meta.seo,
    };
  }, [item]);

  
  const seoPost = useMemo(
    () =>
      view
        ? {
            ...view,
            title: view.name,
            excerpt: view.description,
            image: view.imageURL,
          }
        : null,
    [view]
  );

  if (loading)
    return <main className="min-h-screen flex items-center justify-center text-sm text-slate-500">Loading...</main>;

  if (!view || !isLive(view))
    return (
      <main className="min-h-screen flex flex-col items-center justify-center gap-4">
        <h2 className="text-3xl font-serif font-bold text-[#172B4D]">Company Not Found</h2>
        <Link to="/" className="rounded-lg bg-[#172B4D] px-6 py-3 text-sm font-semibold text-white">
          Go Back Home
        </Link>
      </main>
    );

  return (
    <main className="min-h-screen bg-[#FAFBFC] text-[#475569]">
  
      <SeoHead post={seoPost} />

      <div className="mx-auto max-w-6xl px-5 py-10 sm:px-8 lg:px-10">
        <Link to="/" className="mb-8 inline-flex items-center gap-2 text-sm font-medium text-[#64748B] hover:text-[#E76F1E]">
          <ArrowLeft className="h-4 w-4" /> Back to Home
        </Link>

        <span className="rounded-full bg-[#FFF4EA] px-4 py-1.5 text-[11px] font-bold uppercase tracking-[0.12em] text-[#E76F1E]">
          {view.tagline}
        </span>
        <h1 className="mt-4 max-w-4xl text-3xl font-serif font-bold text-[#172B4D] sm:text-4xl lg:text-[46px]">
          {view.name}
        </h1>
        <div className="mt-7 mb-8 h-px bg-[#E5E7EB]" />

        {view.imageURL && (
          <div className="mb-10 flex h-[260px] items-center justify-center rounded-2xl border border-[#E5E7EB] bg-white sm:h-[360px]">
            <img src={view.imageURL} alt={view.imageAlt || view.name} className="h-full w-full object-contain p-8" />
          </div>
        )}

        {view.description && (
          <p className="mb-10 max-w-4xl border-l-[3px] border-[#E76F1E] pl-5 text-[17px] font-medium leading-8">
            {view.description}
          </p>
        )}

        {view.contentHtml ? (

          <div className="mb-12 max-w-4xl text-[16px] text-[#475569]">
            <ArticleBody post={view} />
          </div>
        ) : (

          view.blog && (
            <article className="mb-12 max-w-4xl whitespace-pre-line text-[16px] leading-8">
              {view.blog}
            </article>
          )
        )}

        {view.features?.length > 0 && (
          <section className="mb-12">
            <h2 className="mb-6 text-2xl font-serif font-bold text-[#172B4D]">Key Highlights</h2>
            <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
              {view.features.map((f, i) => (
                <div key={i} className="flex items-start gap-3 rounded-xl border border-[#E5E7EB] bg-white px-5 py-4">
                  <span className="mt-1 flex h-5 w-5 items-center justify-center rounded-full bg-[#FFF4EA] text-[11px] font-bold text-[#E76F1E]">✓</span>
                  <span className="text-sm font-medium leading-6">{f}</span>
                </div>
              ))}
            </div>
          </section>
        )}

        
      </div>
    </main>
  );
}