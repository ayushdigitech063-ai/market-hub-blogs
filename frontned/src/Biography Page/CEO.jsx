import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getSection } from "../data/biographyFilters";
import { SOCIAL_ICONS, getSocialLinks } from "../data/Biographysocials.js";


const THEME = {
  bar: "bg-[#A87922]",
  dot: "bg-[#D6AC55]",
  text: "text-[#9A6B19]",
  badge: "bg-[#3A2B12]/90 backdrop-blur-md text-[#F4D995] border border-[#C59A42]/40",
  cardHover: "hover:border-[#C59A42]/70 hover:shadow-2xl hover:shadow-[#A87922]/10",
  icon: "bg-[#F8F0DC] text-[#8B641C] hover:bg-[#A87922] hover:text-white",
  arrow: "bg-[#F8F0DC] text-[#8B641C] group-hover/cta:bg-[#A87922] group-hover/cta:text-white",
  viewAll: "border-[#E8D5A5] text-[#805A17] hover:border-[#A87922] hover:bg-[#A87922] hover:text-white",
};

const ACCENTS = {
  ceo: THEME,
  sports: THEME,
  entrepreneur: THEME,
  actors: THEME,
};

const cleanText = (v) =>
  String(v || "")
    .replace(/<!--[\s\S]*?-->/g, " ")
    .replace(/<[^>]*>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/\s+/g, " ")
    .trim();

function BiographyCard({
  item,
  basePath,
  accent,
  fallbackCategory,
  fallbackRole,
  fallbackCompany,
}) {
  const a = ACCENTS[accent];
  const socialLinks = getSocialLinks(item);
  const activeIcons = SOCIAL_ICONS.filter(({ key }) => socialLinks[key]);
  const about = cleanText(item.shortBio || item.description);

  return (
    <article
      className={`group relative flex h-full flex-col overflow-hidden rounded-3xl border border-stone-200/80 bg-white shadow-sm transition-all duration-500 hover:-translate-y-1 ${a.cardHover}`}
    >
      <Link to={`${basePath}/${item.slug}`} className="flex flex-1 flex-col">
        <div className="relative h-[260px] shrink-0 overflow-hidden bg-stone-100">
          <img
            src={item.image}
            alt={item.name}
            className="h-full w-full object-cover object-top transition-transform duration-700 group-hover:scale-105"
          />
          <div className="pointer-events-none absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-stone-950/70 via-stone-950/20 to-transparent" />
          <span
            className={`absolute left-4 top-4 rounded-full px-3.5 py-1 text-[10px] font-bold uppercase tracking-wider shadow-lg ${a.badge}`}
          >
            {item.category || fallbackCategory}
          </span>
        </div>

        <div className="flex flex-1 flex-col p-5 pb-3">
          <h3
            className={`line-clamp-2 min-h-[3.5rem] font-serif text-xl font-bold leading-7 text-stone-900 transition-colors ${a.text}`}
          >
            {item.name}
          </h3>
          <div className="mt-2 flex items-center gap-2">
            <span className={`text-xs font-bold uppercase tracking-wider ${a.text}`}>
              {item.role || fallbackRole}
            </span>
            <span className="text-stone-300">•</span>
            <span className="truncate text-xs font-medium text-stone-500">
              {item.company || fallbackCompany}
            </span>
          </div>
          <p className="mt-3 line-clamp-3 text-sm font-light leading-relaxed text-stone-600">
            {about}
          </p>
        </div>
      </Link>

      <div className="mt-auto px-5 pb-5">
        {activeIcons.length > 0 && (
          <div className="mb-3 flex items-center gap-2 border-t border-stone-100 pt-3">
            {activeIcons.map(({ key, label, Icon }) => (
              <a
                key={key}
                href={socialLinks[key]}
                target="_blank"
                rel="noopener noreferrer"
                title={label}
                aria-label={`${item.name} on ${label}`}
                className={`flex h-9 w-9 items-center justify-center rounded-full transition-all duration-300 ${a.icon}`}
              >
                <Icon className="h-4 w-4" />
              </a>
            ))}
          </div>
        )}

        <Link
          to={`${basePath}/${item.slug}`}
          className="group/cta flex items-center justify-between border-t border-stone-100 pt-3"
        >
          <span className="text-xs font-bold uppercase tracking-wider text-stone-900">
            Read full biography
          </span>
          <span
            className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-bold transition-all duration-300 ${a.arrow}`}
          >
            →
          </span>
        </Link>
      </div>
    </article>
  );
}

function CategorySection({
  title,
  subtitle,
  viewAllTo,
  viewAllText,
  accent,
  items,
  basePath,
  fallbackCategory,
  fallbackRole,
  fallbackCompany,
  tinted = false,
}) {
  const a = ACCENTS[accent];

  if (!items.length) return null;

  return (
    <section className="bg-gradient-to-b from-[#FBF6E9] via-[#F8F2E3] to-white">
      <div className="mx-auto max-w-7xl px-5 py-16 sm:px-8 lg:px-12 lg:py-24">
        <div className="mb-12 flex flex-col justify-between gap-6 sm:flex-row sm:items-end border-b border-stone-200/80 pb-6">
          <div className="flex gap-4">
            <span className={`mt-1.5 h-12 w-1.5 shrink-0 rounded-full ${a.bar}`} />
            <div>
              <h2 className="font-serif text-3xl font-bold tracking-tight text-stone-900 sm:text-4xl">
                {title}
              </h2>
              <p className="mt-1 text-sm sm:text-base text-stone-500 font-normal">
                {subtitle}
              </p>
            </div>
          </div>

          <Link
            to={viewAllTo}
            className={`inline-flex w-fit items-center gap-2 rounded-2xl border bg-white px-6 py-3 text-sm font-bold shadow-sm transition-all duration-300 ${a.viewAll}`}
          >
            <span>{viewAllText}</span>
            <span>→</span>
          </Link>
        </div>

        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((item) => (
            <BiographyCard
              key={item._id || item.id}
              item={item}
              basePath={basePath}
              accent={accent}
              fallbackCategory={fallbackCategory}
              fallbackRole={fallbackRole}
              fallbackCompany={fallbackCompany}
            />
          ))}
        </div>
      </div>
    </section>
  );
}

export default function CEO() {
  const [biographies, setBiographies] = useState([]);

  useEffect(() => {
    fetch("https://market-hub-blogs-backend.onrender.com/api/biographies")
      .then((res) => res.json())
      .then((data) => setBiographies(data))
      .catch((err) => console.error("Error fetching biographies:", err));
  }, []);


const bySection = (name) =>
  biographies
    .filter((item) => getSection(item) === name)
    .sort((a, b) =>
      String(b._id || b.id || "").localeCompare(
        String(a._id || a.id || "")
      )
    )
    .slice(0, 3);


  const businessData = bySection("business");
  const sportsData = bySection("sports");
  const entrepreneurData = bySection("entrepreneur");
  const actorsData = bySection("actors");

  return (
    <main className="min-h-screen bg-stone-50 text-stone-900">



<section className="relative isolate w-full overflow-hidden bg-[#17243D] text-white">
  <img
    src="https://venturexindia.com/wp-content/uploads/2025/06/WhatsApp-Image-2025-06-25-at-15.52.37_f6ea0630-1.jpg"
    alt="Biography of leaders, legends and founders"
    className="absolute inset-0 -z-20 h-full w-full object-cover object-center brightness-[0.65] contrast-110 saturate-[0.85]"
  />

  <div className="pointer-events-none absolute inset-0 -z-10 bg-gradient-to-r from-[#17243D]/95 via-[#17243D]/80 to-[#17243D]/35" />
  <div className="pointer-events-none absolute inset-0 -z-10 bg-gradient-to-t from-[#111D32]/65 via-transparent to-[#111D32]/20" />

  <div className="mx-auto flex min-h-[360px] w-full max-w-[1600px] items-center px-5 py-10 sm:min-h-[400px] sm:px-8 sm:py-12 lg:min-h-[440px] lg:px-14 lg:py-14 xl:min-h-[460px] xl:px-16">
    <div className="w-full max-w-3xl">

      {/* Category Labels */}
      <div className="mb-4 flex flex-wrap items-center gap-2 sm:mb-5 sm:gap-3">
        <span className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-[#17243D]/75 px-3.5 py-1.5 text-xs font-semibold text-white/90 backdrop-blur-md">
          <span className={`h-2 w-2 rounded-full ${ACCENTS.ceo.dot}`} />
          Business & CEOs
        </span>

        <span className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-[#17243D]/75 px-3.5 py-1.5 text-xs font-semibold text-white/90 backdrop-blur-md">
          <span className={`h-2 w-2 rounded-full ${ACCENTS.sports.dot}`} />
          Sports Legends
        </span>

        <span className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-[#17243D]/75 px-3.5 py-1.5 text-xs font-semibold text-white/90 backdrop-blur-md">
          <span className={`h-2 w-2 rounded-full ${ACCENTS.entrepreneur.dot}`} />
          Entrepreneurs
        </span>

        <span className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-[#17243D]/75 px-3.5 py-1.5 text-xs font-semibold text-white/90 backdrop-blur-md">
          <span className={`h-2 w-2 rounded-full ${ACCENTS.actors.dot}`} />
          Actors
        </span>
      </div>


      <h1 className="max-w-3xl text-2xl font-bold leading-tight tracking-tight text-white sm:text-3xl md:text-4xl lg:text-[2.7rem]">
        Stories of{" "}
        <span className="bg-gradient-to-r from-[#F0D48A] via-[#D7A943] to-[#FFF0BD] bg-clip-text text-transparent">
          Leaders, Legends
        </span>{" "}
        & Founders
      </h1>

  
      <p className="mt-4 max-w-2xl text-sm leading-6 text-white/85 sm:mt-5 sm:text-base sm:leading-7">
        Explore complete biographies, career journeys, defining achievements
        and leadership philosophies of influential business tycoons, sports
        champions, visionary startup founders and celebrated actors.
      </p>

      <div className="mt-6 flex flex-wrap gap-2.5 sm:mt-7 sm:gap-3">
        <Link
          to="/biography/view-all/ceo"
          className="inline-flex items-center gap-2 rounded-full bg-[#E47742] px-5 py-2.5 text-sm font-semibold text-white transition duration-300 hover:-translate-y-0.5 hover:bg-[#CF6332] sm:px-6 sm:py-3"
        >
          Explore Business
          <span aria-hidden="true">→</span>
        </Link>

        <Link
          to="/biography/view-all/sportsperson"
          className="inline-flex items-center rounded-full border border-white/35 bg-white/10 px-5 py-2.5 text-sm font-semibold text-white backdrop-blur-md transition duration-300 hover:bg-white hover:text-[#17243D] sm:px-6 sm:py-3"
        >
          Sports Legends
        </Link>

        <Link
          to="/biography/view-all/entrepreneur"
          className="inline-flex items-center rounded-full border border-white/35 bg-white/10 px-5 py-2.5 text-sm font-semibold text-white backdrop-blur-md transition duration-300 hover:bg-white hover:text-[#17243D] sm:px-6 sm:py-3"
        >
          Entrepreneurs
        </Link>

        <Link
          to="/biography/view-all/actor"
          className="inline-flex items-center rounded-full border border-white/35 bg-white/10 px-5 py-2.5 text-sm font-semibold text-white backdrop-blur-md transition duration-300 hover:bg-white hover:text-[#17243D] sm:px-6 sm:py-3"
        >
          Actors
        </Link>
      </div>
    </div>
  </div>


  <div className="absolute inset-x-0 bottom-0 z-10 h-1 bg-gradient-to-r from-[#A87922] via-[#F0D48A] to-[#A87922]" />
</section>



      <CategorySection
        title="Business & CEO Biographies"
        subtitle="Industry leaders, executives and business icons"
        viewAllTo="/biography/view-all/ceo"
        viewAllText="View All Business"
        accent="ceo"
        items={businessData}
        basePath="/biography/ceo"
        fallbackCategory="Business"
      />

      <CategorySection
        title="Sports Legends Biographies"
        subtitle="World-class athletes, champions and sports icons"
        viewAllTo="/biography/view-all/sportsperson"
        viewAllText="View All Sports"
        accent="sports"
        items={sportsData}
        basePath="/biography/sports"
        fallbackCategory="Sports"
        fallbackRole="Athlete"
        fallbackCompany="International Sports"
        tinted
      />

      <CategorySection
        title="Entrepreneur Biographies"
        subtitle="Visionary founders and groundbreaking startup builders"
        viewAllTo="/biography/view-all/entrepreneur"
        viewAllText="View All Entrepreneurs"
        accent="entrepreneur"
        items={entrepreneurData}
        basePath="/biography/entrepreneur"
        fallbackCategory="Entrepreneur"
        fallbackRole="Founder"
        fallbackCompany="Startup"
      />

      <CategorySection
        title="Actors Biographies"
        subtitle="Celebrated film stars, performers and screen legends"
        viewAllTo="/biography/view-all/actor"
        viewAllText="View All Actors"
        accent="actors"
        items={actorsData}
        basePath="/biography/actor"
        fallbackCategory="Actors"
        fallbackRole="Actor"
        fallbackCompany="Cinema"
      />
    </main>
  );
}