import React, { useState, useEffect, useMemo } from "react";
import { Link, useParams } from "react-router-dom";
import { CalendarDays, MapPin, Building2, Briefcase, ArrowRight } from "lucide-react";
import { getTypeInfo, viewAllPath } from "../data/biographyTypes";
import RelatedProfiles from "./RelatedProfiles";
import SeoHead from "../components/SeoHead";
import ArticleBody from "../components/ArticleBody";
import { apiUrl } from "../api/apiConfig";
const serif = "font-serif";

const isLive = (x) => x && x.status !== "draft";


const FAQ_START = "<!--BIO_FAQ_START-->";
const META_RE = /<!--BIO_META:([\s\S]*?)-->/;
const FAQ_JSON_RE = /<!--BIO_FAQ_JSON:([\s\S]*?)-->/;
const LEGACY_FAQ_RE = /<!--FAQS:([\s\S]*?)-->/;

const safeParse = (s) => {
  try {
    return JSON.parse(decodeURIComponent(s));
  } catch {
    return null;
  }
};

const looksLikeHtml = (s) =>
  /<\/?(p|h[1-6]|ul|ol|li|img|div|br|a|strong|em|blockquote|table|figure)\b/i.test(String(s || ""));

const toPlainText = (s) =>
  String(s || "")
    .replace(/<!--[\s\S]*?-->/g, " ")
    .replace(/<[^>]*>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/\s+/g, " ")
    .trim();

const getRich = (profile) => {
  const raw = String(profile.description || "");


  const mm = META_RE.exec(raw);
  const meta = (mm && safeParse(mm[1])) || {};


  let faqs = [];
  const fm = FAQ_JSON_RE.exec(raw);
  if (fm) {
    const arr = safeParse(fm[1]);
    if (Array.isArray(arr)) faqs = arr;
  }
  const lm = LEGACY_FAQ_RE.exec(raw);
  if (!faqs.length && lm) {
    const arr = safeParse(lm[1]);
    if (Array.isArray(arr)) faqs = arr;
  }
  if (Array.isArray(profile.faqs) && profile.faqs.length) faqs = profile.faqs;
  faqs = faqs
    .filter((f) => f && f.q && f.a)
    .map((f) => ({ q: String(f.q), a: String(f.a) }));


  const start = raw.indexOf(FAQ_START);
  const body = (start === -1 ? raw : raw.slice(0, start))
    .replace(META_RE, "")
    .replace(FAQ_JSON_RE, "")
    .replace(LEGACY_FAQ_RE, "")
    .trim();

  return {
    meta,
    faqs,
    bodyText: body,
    contentHtml: profile.contentHtml || (looksLikeHtml(body) ? body : ""),
  };
};

function SectionTitle({ children }) {
  return (
    <h2
      className={`${serif} mb-5 flex items-center gap-3 text-xl font-bold tracking-tight text-stone-900 sm:text-2xl`}
    >
      <span className="h-6 w-1 rounded-full bg-gradient-to-b from-amber-400 to-amber-600" />
      {children}
    </h2>
  );
}

function Fact({ icon: Icon, label, value }) {
  if (!value) return null;
  return (
    <div className="flex items-center gap-3 rounded-2xl border border-amber-100 bg-white/80 px-4 py-3 shadow-sm backdrop-blur">
      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-amber-100 text-amber-700">
        <Icon className="h-5 w-5" />
      </span>
      <div className="min-w-0">
        <p className="text-[10px] font-bold uppercase tracking-wider text-stone-400">{label}</p>
        <p className="truncate text-sm font-semibold text-stone-900">{value}</p>
      </div>
    </div>
  );
}

export default function BiographyDetails() {
const { slug, type: routeType } = useParams();

const biographySlug = slug || routeType;
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
useEffect(() => {
  const controller = new AbortController();

  const fetchBiography = async () => {
    setLoading(true);

    try {
      const response = await fetch(apiUrl("/biographies"), {
        signal: controller.signal,
      });

      if (!response.ok) {
        throw new Error(
          `Failed to fetch biographies: HTTP ${response.status}`
        );
      }

      const data = await response.json();

      if (!Array.isArray(data)) {
        throw new Error("Invalid biographies API response");
      }

      const found = data.find(
        (item) =>
          item.slug === biographySlug ||
          item.name?.toLowerCase().replace(/\s+/g, "-") === biographySlug
      );

      setProfile(isLive(found) ? found : null);
    } catch (error) {
      if (error.name !== "AbortError") {
        console.error("Error fetching biography details:", error);
        setProfile(null);
      }
    } finally {
      if (!controller.signal.aborted) {
        setLoading(false);
      }
    }
  };

  fetchBiography();

  return () => controller.abort();
}, [biographySlug]);

  const rich = useMemo(() => (profile ? getRich(profile) : null), [profile]);

  const shortBio = profile ? profile.shortBio || rich?.meta?.excerpt || "" : "";


  const seoPost = useMemo(() => {
    if (!profile || !rich) return null;
    const origin = (import.meta.env.VITE_SITE_URL || window.location.origin).replace(/\/+$/, "");
    const canonical = `${origin}/biography/${routeType || "ceo"}/${slug}`;
    return {
      ...profile,
      title: profile.name,
      excerpt: shortBio || toPlainText(rich.bodyText).slice(0, 160),
      faqEnabled: rich.faqs.length > 0,
      faqs: rich.faqs,
      seo: { ...(profile.seo || {}), canonicalUrl: profile.seo?.canonicalUrl || canonical },
    };
  }, [profile, rich, routeType, slug, shortBio]);

  if (loading) {
    return (
      <main className="flex min-h-[60vh] items-center justify-center bg-white">
        <div className="flex items-center gap-3 text-sm font-medium text-amber-600">
          <div className="h-5 w-5 animate-spin rounded-full border-2 border-amber-500 border-t-transparent" />
          <span>Loading biography details...</span>
        </div>
      </main>
    );
  }

  if (!profile) {
    return (
      <main className="flex min-h-[60vh] items-center justify-center bg-white px-4">
        <div className="w-full max-w-md rounded-2xl border border-stone-200 bg-stone-50 p-8 text-center">
          <p className={`${serif} text-6xl font-extrabold text-amber-500`}>404</p>
          <h1 className={`${serif} mt-3 text-2xl font-bold text-stone-900`}>
            Biography not found
          </h1>
          <p className="mt-2 text-sm text-stone-500">
            This biography does not exist or may have been removed.
          </p>
          <Link
            to="/biography"
            className="mt-6 inline-flex w-full items-center justify-center rounded-xl bg-amber-500 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-amber-600"
          >
            Back to biographies
          </Link>
        </div>
      </main>
    );
  }

  const { label } = getTypeInfo(profile.type || profile.category);
  const allLink = viewAllPath(profile.type || profile.category);

  const born = profile.born || profile.birth?.date;
  const birthplace = profile.birthplace || profile.birth?.place;

  const bioText = rich.bodyText || shortBio || "";
  const careerParagraphs = toPlainText(bioText) === bioText
    ? bioText.split(/\n+/).map((p) => p.trim()).filter(Boolean)
    : [toPlainText(bioText)];

  const showToc = rich.meta.showToc ?? profile.showToc ?? true;

  return (
    <main className="relative min-h-screen bg-white text-stone-800">

      <SeoHead post={seoPost} />


      <section className="relative overflow-hidden border-b border-amber-100 bg-gradient-to-br from-amber-50 via-white to-orange-50/60">
        <div className="pointer-events-none absolute -right-24 -top-24 h-80 w-80 rounded-full bg-amber-200/40 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-24 -left-20 h-72 w-72 rounded-full bg-orange-200/30 blur-3xl" />

        <div className="relative mx-auto max-w-6xl px-4 pb-12 pt-6 sm:px-6 lg:px-8 lg:pb-16">
          <nav
            aria-label="Breadcrumb"
            className="mb-8 flex flex-wrap items-center gap-2 text-xs text-stone-500 sm:text-sm"
          >
            <Link to="/biography" className="transition hover:text-amber-600">
              Biography
            </Link>
            <span aria-hidden="true" className="text-stone-300">/</span>
            <Link to={allLink} className="transition hover:text-amber-600">
              {label}
            </Link>
            <span aria-hidden="true" className="text-stone-300">/</span>
            <span className="max-w-[160px] truncate font-medium text-stone-900 sm:max-w-md">
              {profile.name}
            </span>
          </nav>

          <div className="max-w-3xl">
            <div className="flex flex-wrap items-center gap-2">
              {profile.category && (
                <span className="rounded-full bg-amber-500 px-3.5 py-1 text-[11px] font-bold uppercase tracking-wider text-white shadow-sm">
                  {profile.category}
                </span>
              )}
              <span className="rounded-full border border-amber-200 bg-white px-3.5 py-1 text-[11px] font-bold uppercase tracking-wider text-amber-800">
                {label}
              </span>
            </div>

            <h1
              className={`${serif} mt-5 text-2xl font-bold leading-tight tracking-tight text-stone-900 sm:text-3xl lg:text-4xl`}
            >
              {profile.name}
            </h1>

            <p className="mt-3 text-base text-stone-600 sm:text-lg">
              <span className="font-semibold text-amber-600">{profile.role}</span>
              {profile.company && <span className="text-stone-500"> at {profile.company}</span>}
            </p>

            {shortBio && (
              <p className="mt-4 max-w-2xl text-sm leading-6 text-stone-600 sm:text-base sm:leading-7">
                {shortBio}
              </p>
            )}

            <div className="mt-7 flex flex-wrap gap-3">
              <a
                href="#about"
                className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-500 px-6 py-3 text-sm font-bold text-stone-950 shadow-md shadow-amber-500/20 transition hover:-translate-y-0.5 hover:shadow-lg"
              >
                Read full story
                <ArrowRight className="h-4 w-4" />
              </a>
              <Link
                to={allLink}
                className="inline-flex items-center rounded-xl border border-amber-200 bg-white px-6 py-3 text-sm font-bold text-amber-800 transition hover:border-amber-400 hover:bg-amber-50"
              >
                View all {label}
              </Link>
            </div>
          </div>

  
          <div className="mt-10 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <Fact icon={Briefcase} label="Role" value={profile.role} />
            <Fact icon={Building2} label="Company" value={profile.company} />
            <Fact icon={CalendarDays} label="Born" value={born} />
            <Fact icon={MapPin} label="Birthplace" value={birthplace} />
          </div>
        </div>
      </section>


      <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:px-8 lg:py-16">
        <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_320px] lg:gap-14">

          <article className="min-w-0 space-y-12">
            <section id="about" className="scroll-mt-28">
              <SectionTitle>{`About ${profile.name}`}</SectionTitle>

              {rich.contentHtml ? (
           
                <div className="text-sm leading-7 text-stone-600 sm:text-base [&_h2]:text-xl sm:[&_h2]:text-2xl [&_h3]:text-lg sm:[&_h3]:text-xl [&_h4]:text-base sm:[&_h4]:text-lg [&_p]:text-sm sm:[&_p]:text-base [&_li]:text-sm sm:[&_li]:text-base [&_a]:font-medium [&_a]:text-amber-700 [&_img]:mx-auto [&_img]:my-6 [&_img]:h-auto [&_img]:max-w-full [&_img]:rounded-2xl [&_img]:shadow-md">
                  <ArticleBody
                    post={{
                      ...profile,
                      contentHtml: rich.contentHtml,
                      faqEnabled: rich.faqs.length > 0,
                      faqs: rich.faqs,
                      showToc,
                    }}
                  />
                </div>
              ) : (
   
                <div className="space-y-5">
                  {careerParagraphs.map((para, i) => (
                    <p
                      key={i}
                      className={
                        i === 0
                          ? "text-base font-medium leading-7 text-stone-900 sm:leading-8"
                          : "text-sm leading-7 text-stone-600 sm:text-base"
                      }
                    >
                      {para}
                    </p>
                  ))}
                </div>
              )}
            </section>

            {profile.education && profile.education.length > 0 && (
              <section>
                <SectionTitle>Education journey</SectionTitle>
                <ol className="space-y-4 border-l-2 border-amber-200 pl-6">
                  {profile.education.map((edu, i) => (
                    <li key={i} className="relative">
                      <span
                        aria-hidden="true"
                        className="absolute -left-[31px] top-2 h-3 w-3 rounded-full border-2 border-white bg-amber-500 ring-2 ring-amber-200"
                      />
                      <p className="text-sm leading-7 text-stone-700 sm:text-base">{edu}</p>
                    </li>
                  ))}
                </ol>
              </section>
            )}

            {profile.achievements && profile.achievements.length > 0 && (
              <section>
                <SectionTitle>Major achievements</SectionTitle>
                <ul className="divide-y divide-stone-100 rounded-2xl border border-stone-200 bg-white shadow-sm">
                  {profile.achievements.map((ach, i) => (
                    <li key={i} className="flex gap-3 px-5 py-4">
                      <span
                        aria-hidden="true"
                        className="mt-1 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-amber-100 text-[11px] font-bold text-amber-700"
                      >
                        ✓
                      </span>
                      <p className="text-sm leading-7 text-stone-700 sm:text-base">{ach}</p>
                    </li>
                  ))}
                </ul>
              </section>
            )}
          </article>

  
          <aside className="lg:sticky lg:top-24 lg:self-start">
            <div className="overflow-hidden rounded-3xl border border-stone-200 bg-white shadow-xl shadow-stone-900/5">
              <div className="relative">
                <img
                  src={profile.image}
                  alt={profile.imageAlt || rich.meta.imageAlt || profile.name}
                  className="aspect-[4/5] w-full bg-stone-100 object-cover object-top"
                />
                <div className="pointer-events-none absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-stone-950/80 via-stone-950/30 to-transparent" />
                <div className="absolute inset-x-0 bottom-0 p-5">
                  <span className="inline-block rounded-full bg-amber-500 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-white">
                    {profile.category}
                  </span>
                  <p className="mt-2 text-sm font-semibold text-amber-200">{profile.role}</p>
                </div>
              </div>

              <div className="p-5">
                <dl className="divide-y divide-stone-100 text-sm">
                  {[
                    { name: "Company", value: profile.company },
                    { name: "Category", value: profile.category },
                    { name: "Born", value: born },
                    { name: "Birthplace", value: birthplace },
                  ]
                    .filter((f) => f.value)
                    .map((f) => (
                      <div key={f.name} className="flex justify-between gap-4 py-2.5">
                        <dt className="shrink-0 text-stone-400">{f.name}</dt>
                        <dd className="text-right font-semibold text-stone-800">{f.value}</dd>
                      </div>
                    ))}
                </dl>

                <div className="mt-5 space-y-2.5">
                  <Link
                    to={allLink}
                    className="flex w-full items-center justify-center rounded-xl bg-gradient-to-r from-amber-500 to-yellow-500 px-5 py-3 text-sm font-bold text-stone-950 shadow-md shadow-amber-500/20 transition hover:-translate-y-0.5"
                  >
                    View all {label}
                  </Link>
                  <Link
                    to="/biography"
                    className="block text-center text-sm font-medium text-stone-500 transition hover:text-amber-600"
                  >
                    ← Back to all biographies
                  </Link>
                </div>
              </div>
            </div>
          </aside>
        </div>
      </div>

      <RelatedProfiles profile={profile} />
    </main>
  );
}