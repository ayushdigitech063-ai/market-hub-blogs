import { useEffect, useState } from "react";
import API from "../services/api";

const HeroBanner = () => {
  const [articles, setArticles] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const fetchFeaturedArticles = async () => {
      try {
        const response = await API.get("/articles/featured");

        setArticles(response.data.articles || []);
      } catch (error) {
        console.error("Featured articles fetch failed:", error);
      }
    };

    fetchFeaturedArticles();
  }, []);

  if (articles.length === 0) {
    return (
      <section className="px-4 py-5 md:px-8">
        <div className="flex h-[430px] items-center justify-center rounded-xl bg-slate-900 text-white">
          Loading...
        </div>
      </section>
    );
  }

  const article = articles[currentIndex];

  const previousSlide = () => {
    setCurrentIndex(
      currentIndex === 0
        ? articles.length - 1
        : currentIndex - 1
    );
  };

  const nextSlide = () => {
    setCurrentIndex(
      currentIndex === articles.length - 1
        ? 0
        : currentIndex + 1
    );
  };

  return (
    <section className="w-full bg-white px-4 py-4 md:px-8">

      <div className="relative h-[430px] w-full overflow-hidden rounded-xl bg-slate-950">

        {/* BACKGROUND IMAGE - BACKEND SE AAYEGI */}
        <img
          src={article.image}
          alt={article.title}
          className="absolute inset-0 h-full w-full object-cover"
        />

        {/* DARK OVERLAY */}
        <div className="absolute inset-0 bg-gradient-to-r from-slate-950 via-slate-950/90 to-slate-950/10" />

        {/* CONTENT */}
        <div className="relative z-10 flex h-full w-full items-center">

          <div className="w-full px-7 py-8 md:w-[58%] md:px-11">

            {/* FEATURED BADGE */}
            <span className="mb-4 inline-flex rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-lg">
              {article.category || "Featured"}
            </span>

            {/* TITLE */}
            <h1 className="max-w-3xl text-3xl font-bold leading-tight text-white sm:text-4xl md:text-[42px]">
              {article.title}
            </h1>

            {/* DESCRIPTION */}
            <p className="mt-4 max-w-2xl text-sm leading-6 text-slate-200 md:text-[17px]">
              {article.description}
            </p>

            {/* AUTHOR */}
            <div className="mt-5 flex items-center gap-3">

              {article.authorImage && (
                <img
                  src={article.authorImage}
                  alt={article.author}
                  className="h-11 w-11 rounded-full border-2 border-white object-cover"
                />
              )}

              <div>
                <p className="text-sm font-semibold text-white">
                  {article.author}
                </p>

                <div className="mt-1 flex items-center gap-2 text-xs text-slate-300">
                  <span>{article.publishedDate}</span>
                  <span>•</span>
                  <span>{article.readTime}</span>
                </div>
              </div>

            </div>

            {/* BUTTON */}
            <button
              type="button"
              className="mt-6 inline-flex items-center gap-4 rounded-lg border border-white px-5 py-3 text-sm font-semibold text-white transition-all duration-200 hover:bg-white hover:text-slate-900"
            >
              Read Full Article

              <span className="text-lg">
                →
              </span>
            </button>

          </div>
        </div>

        {/* SLIDER CONTROLS */}
        {articles.length > 1 && (
          <div className="absolute bottom-5 right-6 z-20 flex items-center gap-3">

            {/* PREVIOUS */}
            <button
              type="button"
              onClick={previousSlide}
              className="flex h-10 w-10 items-center justify-center rounded-full border border-white/40 bg-black/20 text-xl text-white backdrop-blur-sm transition hover:bg-white hover:text-slate-900"
            >
              ←
            </button>

            {/* DOTS */}
            <div className="flex items-center gap-2">

              {articles.map((_, index) => (
                <button
                  key={index}
                  type="button"
                  onClick={() => setCurrentIndex(index)}
                  className={`h-2.5 w-2.5 rounded-full transition-all ${
                    index === currentIndex
                      ? "bg-white"
                      : "bg-white/50"
                  }`}
                />
              ))}

            </div>

            {/* NEXT */}
            <button
              type="button"
              onClick={nextSlide}
              className="flex h-10 w-10 items-center justify-center rounded-full border border-white/40 bg-black/20 text-xl text-white backdrop-blur-sm transition hover:bg-white hover:text-slate-900"
            >
              →
            </button>

          </div>
        )}

      </div>

    </section>
  );
};

export default HeroBanner;