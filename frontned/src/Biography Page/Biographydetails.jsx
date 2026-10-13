import React, { useState, useEffect } from "react";
import { Link, useParams } from "react-router-dom";
import { getTypeInfo, viewAllPath } from "../data/biographyTypes";
import RelatedProfiles from "./RelatedProfiles";
import { SOCIAL_ICONS, getSocialLinks } from "../data/Biographysocials.js";

const serif = "font-serif";
const btnPrimary =
  "inline-flex items-center justify-center rounded-lg bg-amber-500 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-amber-600";

function SectionTitle({ children }) {
  return (
    <h2
      className={`${serif} mb-5 flex items-center gap-3 text-2xl font-bold tracking-tight text-stone-900`}
    >
      <span className="h-6 w-1 rounded-full bg-amber-500" />
      {children}
    </h2>
  );
}

export default function BiographyDetails() {
  const { slug } = useParams();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("https://market-hub-blogs-backend.onrender.com/api/biographies")
      .then((res) => res.json())
      .then((data) => {
        const found = data.find(
          (item) =>
            item.slug === slug ||
            item.name?.toLowerCase().replace(/\s+/g, "-") === slug
        );
        setProfile(found || null);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error fetching biography details:", err);
        setLoading(false);
      });
  }, [slug]);

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
          <Link to="/biography" className={`mt-6 ${btnPrimary} w-full`}>
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

  const socials = getSocialLinks(profile);

  const bioText = profile.description || profile.shortBio || "";
  const careerParagraphs = bioText
    .split(/\n+/)
    .map((p) => p.trim())
    .filter(Boolean);

  return (
    <main className="relative min-h-screen bg-white text-stone-800">
      {/* soft top background */}
      <div className="pointer-events-none absolute inset-x-0 top-0 h-[26rem] border-b border-amber-100 bg-gradient-to-b from-amber-50/80 to-white" />

      <div className="relative mx-auto max-w-6xl px-4 pb-14 pt-6 sm:px-6 lg:px-8">
        <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_320px] lg:gap-14">
          {/* LEFT: header text + article */}
          <div className="min-w-0">
            <nav
              aria-label="Breadcrumb"
              className="mb-6 flex flex-wrap items-center gap-2 text-sm text-stone-500"
            >
              <Link to="/biography" className="transition hover:text-amber-600">
                Biography
              </Link>
              <span aria-hidden="true" className="text-stone-300">/</span>
              <Link to={allLink} className="transition hover:text-amber-600">
                {label}
              </Link>
              <span aria-hidden="true" className="text-stone-300">/</span>
              <span className="max-w-[160px] truncate font-medium text-stone-900 sm:max-w-none">
                {profile.name}
              </span>
            </nav>

            <span className="inline-block rounded-full bg-amber-100 px-3 py-1 text-xs font-bold uppercase tracking-wider text-amber-800">
              {profile.category}
            </span>

            <h1
              className={`${serif} mt-4 text-4xl font-bold leading-tight tracking-tight text-stone-900 sm:text-5xl`}
            >
              {profile.name}
            </h1>

            <p className="mt-3 text-lg text-stone-600">
              <span className="font-semibold text-amber-600">{profile.role}</span>
              {profile.company && <span>, {profile.company}</span>}
            </p>

            {profile.shortBio && (
              <p className="mt-4 text-base leading-7 text-stone-600 sm:text-lg sm:leading-8">
                {profile.shortBio}
              </p>
            )}

            {(born || birthplace) && (
              <div className="mt-6 flex flex-wrap items-center gap-x-6 gap-y-2 border-t border-stone-200 pt-4 text-sm text-stone-500">
                {born && (
                  <span>
                    Born: <span className="font-semibold text-stone-800">{born}</span>
                  </span>
                )}
                {birthplace && (
                  <span>
                    Birthplace:{" "}
                    <span className="font-semibold text-stone-800">{birthplace}</span>
                  </span>
                )}
              </div>
            )}

            <div className="mt-6">
              <a href="#about" className={btnPrimary}>
                Read full story →
              </a>
            </div>

            {/* ARTICLE */}
            <article className="mt-14 space-y-12">
              <section id="about" className="scroll-mt-24">
                <SectionTitle>{`About ${profile.name}`}</SectionTitle>
                <div className="space-y-5">
                  {careerParagraphs.map((para, i) => (
                    <p
                      key={i}
                      className={
                        i === 0
                          ? "text-lg font-medium leading-8 text-stone-900"
                          : "text-[17px] leading-8 text-stone-600"
                      }
                    >
                      {para}
                    </p>
                  ))}
                </div>
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
                        <p className="text-base leading-7 text-stone-700">{edu}</p>
                      </li>
                    ))}
                  </ol>
                </section>
              )}

              {profile.achievements && profile.achievements.length > 0 && (
                <section>
                  <SectionTitle>Major achievements</SectionTitle>
                  <ul className="divide-y divide-stone-100 rounded-xl border border-stone-200 bg-white">
                    {profile.achievements.map((ach, i) => (
                      <li key={i} className="flex gap-3 px-5 py-4">
                        <span
                          aria-hidden="true"
                          className="mt-1 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-amber-100 text-[11px] font-bold text-amber-700"
                        >
                          ✓
                        </span>
                        <p className="text-base leading-7 text-stone-700">{ach}</p>
                      </li>
                    ))}
                  </ul>
                </section>
              )}
            </article>
          </div>

          {/* RIGHT: profile card, starts at the top and stays while scrolling */}
          <aside className="lg:sticky lg:top-24 lg:self-start lg:pt-12">
            <div className="overflow-hidden rounded-2xl border border-stone-200 bg-white shadow-lg shadow-stone-900/5">
              <img
                src={profile.image}
                alt={profile.name}
                className="aspect-square w-full bg-stone-100 object-cover object-top"
              />
              <div className="p-5">
                <h3 className={`${serif} text-xl font-bold text-stone-900`}>
                  {profile.name}
                </h3>
                <p className="text-sm font-medium text-amber-600">{profile.role}</p>

                <dl className="mt-4 divide-y divide-stone-100 border-t border-stone-100 text-sm">
                  {[
                    { name: "Category", value: profile.category },
                    { name: "Born", value: born },
                  ]
                    .filter((f) => f.value)
                    .map((f) => (
                      <div key={f.name} className="flex justify-between gap-3 py-2.5">
                        <dt className="text-stone-400">{f.name}</dt>
                        <dd className="text-right font-semibold text-stone-800">
                          {f.value}
                        </dd>
                      </div>
                    ))}
                </dl>

                <div className="mt-4 flex flex-wrap items-center gap-2.5 border-t border-stone-100 pt-4">
                  {SOCIAL_ICONS.map(({ key, label, Icon, optional }) => {
                    if (socials[key]) {
                      return (
                        <a
                          key={key}
                          href={socials[key]}
                          target="_blank"
                          rel="noopener noreferrer"
                          title={label}
                          aria-label={`${profile.name} on ${label}`}
                          className="flex h-11 w-11 items-center justify-center rounded-full bg-amber-50 text-amber-700 transition hover:bg-amber-500 hover:text-white"
                        >
                          <Icon className="h-5 w-5" />
                        </a>
                      );
                    }
                    if (optional) return null;
                    // No link saved yet for this platform
                    return (
                      <span
                        key={key}
                        title={`${label} link not added yet`}
                        className="flex h-11 w-11 items-center justify-center rounded-full bg-stone-100 text-stone-300"
                      >
                        <Icon className="h-5 w-5" />
                      </span>
                    );
                  })}
                </div>

                <div className="mt-4 space-y-2.5">
                  <Link to={allLink} className={`${btnPrimary} w-full`}>
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