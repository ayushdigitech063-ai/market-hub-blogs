
import React, { useEffect, useState } from 'react';

import HeroBanner from '../components/HeroBanner';
import ArticleCard from '../components/ArticleCard';
import BrandCard from '../components/BrandCard';
import SlidingCompanies from '../components/SlidingCompanies';
import DesignBanner from '../components/Designbanner';

import { fetchFeatured } from '../api/brandApi';
import { fetchLatestArticles } from '../api/latestArticleApi';

export default function Home() {
  const [latestArticles, setLatestArticles] = useState([]);
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let isMounted = true;

    fetchLatestArticles(3)
      .then((data) => {
        if (isMounted) {
          setLatestArticles(Array.isArray(data) ? data.slice(0, 3) : []);
        }
      })
      .catch((err) => {
        console.error('Latest articles error:', err);
      });

    fetchFeatured()
      .then((data) => {
        if (isMounted) {
          setFeaturedProducts(Array.isArray(data) ? data : []);
        }
      })
      .catch((err) => {
        if (isMounted) {
          setError(err.message || 'Unable to load featured brands.');
        }
      })
      .finally(() => {
        if (isMounted) {
          setLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <div className="min-h-screen w-full bg-[#FFF8F0] text-stone-900 selection:bg-orange-200 selection:text-stone-950">
      {/* Hero Banner */}
      <HeroBanner />

      {/* Latest Articles */}
      <section className="relative my-10 overflow-hidden border-y border-teal-100 bg-[#F0F8F6] py-10 sm:my-14 sm:py-14">
        <div className="pointer-events-none absolute -left-24 top-10 h-64 w-64 rounded-full bg-teal-200/30 blur-3xl" />

        <div className="pointer-events-none absolute -right-20 bottom-0 h-72 w-72 rounded-full bg-emerald-200/30 blur-3xl" />

        <div className="relative mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-8 flex flex-col gap-4 border-b border-teal-200 pb-6 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <span className="inline-flex items-center gap-2 rounded-full border border-teal-200 bg-white px-3 py-1.5 text-[10px] font-extrabold uppercase tracking-[0.18em] text-teal-800 shadow-sm sm:text-xs">
                <span className="h-2 w-2 rounded-full bg-emerald-500" />
                Digital Insights &amp; Strategies
              </span>

              <h2 className="mt-4 font-serif text-3xl font-bold tracking-tight text-[#103C3A] sm:text-4xl">
                Latest Articles
                <span className="text-emerald-600">.</span>
              </h2>

              <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-600 sm:text-base">
                Explore fresh ideas, practical guides and expert insights
                to stay ahead in the digital world.
              </p>
            </div>

            <div className="hidden shrink-0 pb-1 sm:block">
              <div className="flex items-center gap-3 rounded-xl border border-teal-100 bg-white/80 px-4 py-3 shadow-sm">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-teal-50 text-teal-800">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="21"
                    height="21"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
                    <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2Z" />
                    <path d="M8 7h8M8 11h8" />
                  </svg>
                </div>

                <div>
                  <p className="text-sm font-bold text-[#103C3A]">
                    Knowledge Hub
                  </p>
                  <p className="mt-0.5 text-xs text-slate-500">
                    Learn something new
                  </p>
                </div>
              </div>
            </div>
          </div>

          {latestArticles.length > 0 ? (
            <div className="mx-auto grid max-w-6xl grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 lg:gap-7">
              {latestArticles.map((article, index) => (
                <div
                  key={article._id || article.slug || index}
                  className="group rounded-2xl border border-teal-100 bg-white shadow-[0_6px_24px_rgba(16,60,58,0.06)] transition-all duration-300 hover:-translate-y-1 hover:border-teal-300 hover:shadow-[0_16px_35px_rgba(16,60,58,0.12)]"
                >
                  <ArticleCard
                    article={article}
                    basePath="/latest-article"
                  />
                </div>
              ))}
            </div>
          ) : (
            <div className="rounded-2xl border border-teal-100 bg-white px-5 py-12 text-center shadow-sm">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-teal-50 text-teal-800">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="23"
                  height="23"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
                  <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2Z" />
                </svg>
              </div>

              <p className="mt-4 text-sm font-semibold text-[#103C3A]">
                No latest articles available right now.
              </p>

              <p className="mt-1 text-xs text-slate-500">
                Please check back soon for new insights.
              </p>
            </div>
          )}

          <div className="mt-8 flex items-center justify-center gap-2">
            <span className="h-1 w-10 rounded-full bg-teal-800" />
            <span className="h-1 w-3 rounded-full bg-emerald-400" />
            <span className="h-1 w-2 rounded-full bg-teal-200" />
          </div>
        </div>
      </section>

      {/* Design Banner */}
      <div className="my-10">
        <DesignBanner />
      </div>

      {/* Featured Brands & Products */}
      <section className="relative mx-auto my-14 w-full max-w-7xl overflow-hidden rounded-3xl border border-rose-100 bg-[#FFF8F7] px-4 py-8 sm:px-6 sm:py-10 lg:px-8">
        <div className="pointer-events-none absolute -right-16 -top-16 h-48 w-48 rounded-full bg-rose-100/60 blur-3xl" />

        <div className="pointer-events-none absolute -bottom-16 -left-16 h-48 w-48 rounded-full bg-pink-100/50 blur-3xl" />

        <div className="relative">
          <div className="mb-7 border-b border-rose-200 pb-4">
            <p className="mb-2 text-xs font-bold uppercase tracking-[0.2em] text-[#B45365]">
              Discover &amp; Explore
            </p>

            <h2 className="font-serif text-2xl font-bold tracking-tight text-[#512D38] sm:text-3xl">
              Featured Brands &amp; Products
            </h2>
          </div>

          {loading && (
            <p className="py-8 text-center text-sm text-[#92747B]">
              Loading featured brands...
            </p>
          )}

          {!loading && error && (
            <p className="py-6 text-center text-sm text-red-600">
              {error}
            </p>
          )}

          {!loading && !error && featuredProducts.length > 0 && (
            <div className="mx-auto grid max-w-6xl grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {featuredProducts.slice(0, 3).map((product, index) => (
                <div
                  key={product._id || index}
                  className="min-w-0 transition-transform duration-300 hover:-translate-y-1"
                >
                  <BrandCard item={product} />
                </div>
              ))}
            </div>
          )}

          {!loading && !error && featuredProducts.length === 0 && (
            <p className="py-8 text-center text-sm text-[#92747B]">
              No featured brands available right now.
            </p>
          )}
        </div>
      </section>

      {/* Sliding Companies */}
      <section className="border-t border-[#E8DCCB] bg-[#FDF2E9]/70 py-6">
        <SlidingCompanies />
      </section>
    </div>
  );
}
