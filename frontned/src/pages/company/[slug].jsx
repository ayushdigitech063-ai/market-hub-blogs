import React, { useState, useEffect, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Building2, BookOpen, ChevronLeft, ChevronRight } from 'lucide-react';
import ArticleCard from '../../components/ArticleCard';

const HERO_IMAGE =
  'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?q=80&w=1200&auto=format&fit=crop';

export default function CompanyDetail() {
  const { slug } = useParams();
  const [company, setCompany] = useState(null);
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);

  const sliderRef = useRef(null);

  const scrollSlider = (dir) => {
    const el = sliderRef.current;
    if (!el) return;
    el.scrollBy({ left: dir * el.clientWidth, behavior: 'smooth' });
  };

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [slug]);

  // Company aur articles dono backend se
  useEffect(() => {
    Promise.all([
      fetch('http://localhost:5000/api/companies').then((res) => res.json()),
      fetch('http://localhost:5000/api/articles').then((res) => res.json()),
    ])
      .then(([companiesList, articlesList]) => {
        setCompany(companiesList.find((c) => c.slug === slug));
        setArticles(articlesList);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error fetching company details:", err);
        setLoading(false);
      });
  }, [slug]);

  // ---------- LOADING ----------
  if (loading) {
    return (
      <main className="min-h-screen bg-white flex items-center justify-center">
        <div className="flex items-center space-x-2 text-amber-600 font-medium text-sm">
          <div className="w-4 h-4 border-2 border-amber-500 border-t-transparent rounded-full animate-spin"></div>
          <span>Loading company profile...</span>
        </div>
      </main>
    );
  }

  // ---------- NOT FOUND ----------
  if (!company) {
    return (
      <main className="min-h-screen bg-white flex items-center justify-center px-5">
        <div className="text-center max-w-md p-8 rounded-2xl border border-stone-200 shadow-sm bg-stone-50">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-amber-100 text-amber-600 font-bold text-xl">
            !
          </div>

          <h2 className="text-2xl font-serif font-bold text-stone-900">
            Company Not Found
          </h2>

          <p className="mt-2 text-xs sm:text-sm text-stone-600">
            The company profile you are looking for does not exist or has been removed.
          </p>

          <Link
            to="/companies"
            className="mt-6 inline-flex items-center gap-2 rounded-xl bg-stone-900 hover:bg-amber-500 text-white hover:text-stone-950 px-6 py-2.5 text-xs sm:text-sm font-semibold transition-all shadow"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Companies
          </Link>
        </div>
      </main>
    );
  }

  // Article me company field hai to wahi match hoga, warna id range se
  const companyArticles = articles.filter((a) =>
    a.company
      ? a.company === company.slug
      : a.id >= company.startId && a.id <= company.endId
  );

  return (
    <main className="min-h-screen bg-stone-50/40 text-stone-700">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 lg:py-10">

        {/* BREADCRUMB NAVIGATION */}
        <nav className="mb-5 flex items-center gap-2 text-xs font-medium text-stone-500">
          <Link to="/companies" className="flex items-center gap-1 hover:text-amber-700 transition-colors">
            <ArrowLeft className="h-3.5 w-3.5" />
            <span>Companies</span>
          </Link>
          <ChevronRight className="h-3.5 w-3.5 text-stone-300" />
          <span className="text-stone-900 font-semibold">{company.name}</span>
        </nav>

        {/* LARGER HERO BANNER */}
        <div className="relative mb-10 min-h-[320px] sm:min-h-[380px] lg:min-h-[420px] flex items-center overflow-hidden rounded-3xl border border-stone-200/80 bg-slate-900 shadow-xl shadow-stone-900/10">
          
          {/* Background Image with Dual Layer Overlays */}
          <div 
            className="absolute inset-0 bg-cover bg-center transition-transform duration-700 scale-105"
            style={{ backgroundImage: `url(${company.heroImage || HERO_IMAGE})` }}
          />
          <div className="absolute inset-0 bg-gradient-to-r from-slate-950 via-slate-950/90 to-slate-900/40" />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-transparent to-transparent" />

          {/* Golden Left Border Highlight */}
          <div className="absolute left-0 top-0 bottom-0 w-2 bg-gradient-to-b from-amber-400 via-yellow-500 to-amber-600" />

          {/* Banner Inner Content */}
          <div className="relative z-10 flex w-full flex-col justify-between gap-8 p-8 sm:p-12 lg:p-14 lg:flex-row lg:items-center">
            
            <div className="max-w-3xl space-y-4">
              
              {/* Badge */}
              <div className="inline-flex items-center gap-2 rounded-full border border-amber-400/30 bg-amber-500/10 px-3.5 py-1.5 text-xs font-bold uppercase tracking-widest text-amber-300 backdrop-blur-md">
                <Building2 className="h-4 w-4 text-amber-400" />
                <span>Featured Organization</span>
              </div>

              {/* Company Title */}
              <h1 className="font-serif text-3xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-white leading-tight">
                {company.name}
              </h1>

              {/* Description */}
              <p className="text-sm sm:text-base leading-relaxed text-slate-300 max-w-2xl font-normal">
                {company.description}
              </p>

              {/* Stats pill */}
              <div className="pt-2">
                <div className="inline-flex items-center gap-2.5 rounded-xl border border-white/15 bg-white/10 px-4 py-2 text-xs sm:text-sm font-semibold text-white backdrop-blur-md shadow-sm">
                  <BookOpen className="h-4 w-4 text-amber-400" />
                  <span>{companyArticles.length} Published Articles & Reports</span>
                </div>
              </div>

            </div>

            {/* Company Logo Display Card */}
            {company.logo ? (
              <div className="flex h-24 w-24 shrink-0 items-center justify-center rounded-2xl border border-white/20 bg-white/95 p-4 shadow-xl backdrop-blur-md sm:h-32 sm:w-32 lg:h-36 lg:w-36">
                <img
                  src={company.logo}
                  alt={company.name}
                  className="max-h-full max-w-full object-contain"
                />
              </div>
            ) : (
              <div className="flex h-24 w-24 shrink-0 items-center justify-center rounded-2xl border border-amber-400/20 bg-amber-500/10 text-amber-300 font-serif font-bold text-3xl backdrop-blur-md sm:h-32 sm:w-32 lg:h-36 lg:w-36">
                {company.name?.charAt(0)}
              </div>
            )}

          </div>
        </div>

        {/* SECTION TITLE */}
        <div className="mb-8 flex items-center justify-between border-b border-stone-200 pb-4">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-widest text-amber-700">
              Published Insights
            </span>
            <h2 className="text-xl sm:text-2xl font-serif font-bold text-stone-900 mt-1">
              Articles & Reports ({companyArticles.length})
            </h2>
          </div>

          {companyArticles.length > 0 && (
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => scrollSlider(-1)}
                aria-label="Scroll left"
                className="flex h-10 w-10 items-center justify-center rounded-full border border-stone-300 bg-white text-stone-700 transition hover:border-amber-500 hover:bg-amber-500 hover:text-stone-950"
              >
                <ChevronLeft className="h-5 w-5" />
              </button>
              <button
                type="button"
                onClick={() => scrollSlider(1)}
                aria-label="Scroll right"
                className="flex h-10 w-10 items-center justify-center rounded-full border border-stone-300 bg-white text-stone-700 transition hover:border-amber-500 hover:bg-amber-500 hover:text-stone-950"
              >
                <ChevronRight className="h-5 w-5" />
              </button>
            </div>
          )}
        </div>

        {/* ARTICLES SLIDER */}
        {companyArticles.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-2xl border border-dashed border-stone-300 shadow-sm">
            <BookOpen className="w-10 h-10 text-stone-400 mx-auto mb-3" />
            <p className="text-sm font-medium text-stone-700">No articles found for this company yet.</p>
            <p className="text-xs text-stone-400 mt-1">Check back later for new updates and reports.</p>
          </div>
        ) : (
          <div
            ref={sliderRef}
            className="flex snap-x snap-mandatory gap-6 overflow-x-auto scroll-smooth pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
          >
            {companyArticles.map((article) => (
              <div
                key={article.id || article._id}
                className="flex w-[85%] shrink-0 snap-start flex-col sm:w-[calc(50%-12px)] lg:w-[calc(33.333%-16px)]"
              >
                <ArticleCard article={article} />
              </div>
            ))}
          </div>
        )}

      </div>
    </main>
  );
}