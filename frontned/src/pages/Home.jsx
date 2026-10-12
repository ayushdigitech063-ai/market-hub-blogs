import React, { useEffect, useState } from 'react';
import HeroBanner from '../components/HeroBanner';
import ArticleCard from '../components/ArticleCard';
import BrandCard from '../components/BrandCard';
import SlidingCompanies from '../components/SlidingCompanies';
import AdBanner from '../components/AdBanner';
import DesignBanner from '../components/Designbanner'; // Corrected import path & name
import { fetchFeatured } from '../api/brandApi';
import { fetchLatestArticles } from '../api/latestArticleApi';

export default function Home() {
  // Latest Articles (backend)
  const [latestArticles, setLatestArticles] = useState([]);

  // Featured Brands (backend)
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchLatestArticles(3)
      .then((d) => setLatestArticles(Array.isArray(d) ? d : []))
      .catch((err) => console.error("Latest articles error:", err));

    fetchFeatured()
      .then((data) => setFeaturedProducts(Array.isArray(data) ? data : []))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="w-full min-h-screen bg-[#FFF8F0] text-stone-900 selection:bg-orange-200 selection:text-stone-950">

      {/* 1. Hero Section */}
      <HeroBanner />

      {/* 2. Latest Articles Section (from backend) */}
      {latestArticles.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 my-14">
          <h2 className="text-2xl sm:text-3xl font-serif font-bold text-stone-950 mb-6 tracking-tight border-b border-stone-200 pb-3">
            Latest Articles
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
            {latestArticles.map((article) => (
              <ArticleCard
                key={article._id}
                article={article}
                basePath="/latest-article"
              />
            ))}
          </div>
        </section>
      )}

      {/* 3. Design Banner Component */}
      <div className="my-10">
        <DesignBanner />
      </div>

      {/* 4. Featured Brands & Products (from backend) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 my-14">
        <h2 className="text-2xl sm:text-3xl font-serif font-bold text-stone-950 mb-6 tracking-tight border-b border-stone-200 pb-3">
          Featured Brands & Products
        </h2>

        {loading && (
          <p className="text-center text-sm text-stone-500">Loading...</p>
        )}

        {error && (
          <p className="text-center text-sm text-red-600">{error}</p>
        )}

        {!loading && !error && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 max-w-6xl mx-auto">
            {featuredProducts.map((product) => (
              <BrandCard key={product._id} item={product} />
            ))}
          </div>
        )}
      </section>

      {/* 5. Middle Ad Banner */}
      <div className="my-14">
        <AdBanner />
      </div>

      {/* 6. Sliding Companies Showcase */}
      <div className="py-6 border-t border-stone-200 bg-[#FDF2E9]/70">
        <SlidingCompanies />
      </div>

    </div>
  );
}