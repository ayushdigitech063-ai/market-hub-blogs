import React, { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";

const API_BASE =
  "https://market-hub-blogs-backend.onrender.com/api";

const API_ENDPOINTS = [
  { type: "article", url: `${API_BASE}/latest-articles` },
  { type: "biography", url: `${API_BASE}/biographies` },
  { type: "company", url: `${API_BASE}/companies` },
  { type: "brand", url: `${API_BASE}/brands` },
];

const getItems = (response, type) => {
  if (Array.isArray(response)) return response;
  if (!response || typeof response !== "object") return [];

  const keys = {
    article: ["articles", "latestArticles", "data", "results"],
    biography: ["biographies", "data", "results"],
    company: ["companies", "data", "results"],
    brand: ["brands", "data", "results"],
  };

  for (const key of keys[type] || ["data", "results"]) {
    if (Array.isArray(response[key])) return response[key];
  }

  return [];
};

const getSlug = (item) =>
  item?.slug ||
  item?.seoSlug ||
  item?.urlSlug ||
  item?._id ||
  item?.id ||
  "";

const getTitle = (item) =>
  item?.title ||
  item?.name ||
  item?.companyName ||
  item?.brandName ||
  item?.fullName ||
  "Explore Market Hub";

const getImage = (item) => {
  if (!item) return "";

  const imageFields = [
    item.bannerImage,
    item.banner,
    item.featuredImage,
    item.featured_image,
    item.thumbnail,
    item.image,
    item.imageUrl,
    item.imageURL,
    item.coverImage,
    item.cover,
    item.profileImage,
    item.photoUrl,
    item.photo,
    item.logoUrl,
    item.logo,
    item.companyLogo,
    item.companyImage,
    item.companyBanner,
    item.brandLogo,
    item.ogImage,
  ];

  const extractUrl = (value) => {
    if (typeof value === "string") {
      return value.trim();
    }

    if (Array.isArray(value)) {
      for (const entry of value) {
        const url = extractUrl(entry);
        if (url) return url;
      }
      return "";
    }

    if (value && typeof value === "object") {
      return (
        value.url ||
        value.secure_url ||
        value.src ||
        value.imageUrl ||
        value.image ||
        value.path ||
        value.location ||
        value.href ||
        ""
      );
    }

    return "";
  };

  for (const field of imageFields) {
    const url = extractUrl(field);
    if (url) return url;
  }

  return "";
};

const getPublishedDate = (item) =>
  item?.publishedAt ||
  item?.publishDate ||
  item?.publishedDate ||
  item?.createdAt ||
  item?.updatedAt ||
  item?.date ||
  null;

const toPlainText = (value) => {
  if (typeof value !== "string") return "";

  return value
    .replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, "")
    .replace(/<style\b[^>]*>[\s\S]*?<\/style>/gi, "")
    .replace(/<[^>]*>/g, " ")
    .replace(/&nbsp;|&#160;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&quot;/gi, '"')
    .replace(/&#39;|&apos;/gi, "'")
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">")
    .replace(/\s+/g, " ")
    .trim();
};


const getDescription = (item) => {
  const candidates = [
    item?.excerpt,
    item?.shortDescription,
    item?.summary,
    item?.metaDescription,
    item?.seoDescription,
    item?.subtitle,
    item?.description,
  ];

  const description = candidates.map(toPlainText).find(Boolean);

  if (!description) {
    return "Discover the latest stories, insights and updates on Market Hub.";
  }

  if (description.length <= 180) return description;

  return `${description.slice(0, 177).trimEnd()}...`;
};

const getDateValue = (item) => {
  const value = getPublishedDate(item);
  if (!value) return 0;

  const timestamp = new Date(value).getTime();
  return Number.isNaN(timestamp) ? 0 : timestamp;
};

const getLatestOne = (items, type) => {
  const validItems = items.filter((item) => {
    if (!item || !getSlug(item)) return false;

    const status = String(item.status || "").toLowerCase();

    if (status === "draft" || status === "inactive") return false;
    if (item.active === false || item.isActive === false) return false;
    if (item.published === false) return false;

    return true;
  });

  validItems.sort((a, b) => getDateValue(b) - getDateValue(a));

  const latest = validItems[0];

  return latest
    ? [
        {
          ...latest,
          _bannerType: type,
          _bannerTitle: getTitle(latest),
          _bannerDescription: getDescription(latest),
          _bannerImage: getImage(latest),
          _bannerDate: getPublishedDate(latest),
          _bannerLink: getLink(latest, type),
        },
      ]
    : [];
};

function getLink(item, type) {
  const slug = getSlug(item);

  switch (type) {
    case "biography":
      return `/biography/${slug}`;
    case "company":
      return `/company/${slug}`;
    case "brand":
      return `/brand/${slug}`;
    default:
      return `/latest-article/${slug}`;
  }
}

const getCategoryLabel = (type) => {
  switch (type) {
    case "biography":
      return "Biography";
    case "company":
      return "Company";
    case "brand":
      return "Brand";
    default:
      return "Latest Article";
  }
};

const formatDate = (value) => {
  if (!value) return "";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";

  return date.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
};

export default function HeroBanner() {
  const [slides, setSlides] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [imageFailed, setImageFailed] = useState(false);

  const fetchBannerData = useCallback(async () => {
    setLoading(true);

    try {
   
      const responses = await Promise.all(
        API_ENDPOINTS.map(async ({ type, url }) => {
          try {
            const response = await fetch(url);

            if (!response.ok) {
              console.error(
                `Failed to fetch ${type}:`,
                response.status
              );
              return { type, items: [] };
            }

            const json = await response.json();

            return {
              type,
              items: getItems(json, type),
            };
          } catch (error) {
            console.error(`Error fetching ${type}:`, error);
            return { type, items: [] };
          }
        })
      );

      const dataByType = Object.fromEntries(
        responses.map(({ type, items }) => [type, items])
      );

  
     const latestSlides = [
  ...getLatestOne(dataByType.article || [], "article"),
  ...getLatestOne(dataByType.biography || [], "biography"),
  ...getLatestOne(dataByType.company || [], "company"),
  ...getLatestOne(dataByType.brand || [], "brand"),
].sort((a, b) => getDateValue(b) - getDateValue(a));
      setSlides(latestSlides);
      setCurrentIndex(0);
    } catch (error) {
      console.error("Hero banner loading error:", error);
      setSlides([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchBannerData();
  }, [fetchBannerData]);

  useEffect(() => {
    if (slides.length <= 1) return undefined;

    const timer = window.setInterval(() => {
      setCurrentIndex((index) => (index + 1) % slides.length);
    }, 6000);

    return () => window.clearInterval(timer);
  }, [slides.length]);

  useEffect(() => {
    setImageFailed(false);
  }, [currentIndex]);

  const previousSlide = () => {
    setCurrentIndex((index) =>
      index === 0 ? slides.length - 1 : index - 1
    );
  };

  const nextSlide = () => {
    setCurrentIndex((index) => (index + 1) % slides.length);
  };

  if (loading) {
    return (
      <section className="mx-auto w-full max-w-[1600px] px-4 py-6 sm:px-6 lg:px-8">
        <div className="flex min-h-[400px] items-center justify-center rounded-3xl bg-[#F8F5F0]">
          <div className="text-center">
            <div className="mx-auto h-9 w-9 animate-spin rounded-full border-4 border-[#E47742]/25 border-t-[#E47742]" />
            <p className="mt-4 text-sm text-[#5D6472]">
              Loading latest updates...
            </p>
          </div>
        </div>
      </section>
    );
  }

  if (slides.length === 0) {
    return (
      <section className="mx-auto w-full max-w-[1600px] px-4 py-6 sm:px-6 lg:px-8">
        <div className="flex min-h-[320px] flex-col items-center justify-center rounded-3xl bg-[#F8F5F0] px-6 text-center">
          <h2 className="text-2xl font-bold text-[#17243D]">
            Discover Market Hub
          </h2>
          <p className="mt-3 max-w-lg text-sm leading-6 text-[#5D6472]">
            The latest articles, biographies, companies and brands will appear
            here when data is available.
          </p>
          <button
            type="button"
            onClick={fetchBannerData}
            className="mt-5 rounded-full bg-[#E47742] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[#CF6332]"
          >
            Try Again
          </button>
        </div>
      </section>
    );
  }

  const slide = slides[currentIndex];
  const bannerTitle = slide._bannerTitle || "";
  const rawDescription = slide._bannerDescription || "";
  const bannerDescription =
    bannerTitle && rawDescription.toLowerCase().startsWith(bannerTitle.toLowerCase())
      ? rawDescription
          .slice(bannerTitle.length)
          .replace(/^[\s:\-–—.,]+/, "") || rawDescription
      : rawDescription;

  const arrowClass =
    "flex h-10 w-10 items-center justify-center rounded-full border border-white/40 bg-white/10 text-xl leading-none text-white backdrop-blur transition hover:bg-white hover:text-[#17243D]";

  return (
  <section className="w-full">
  <div className="relative isolate min-h-[560px] overflow-hidden bg-[#17243D] sm:min-h-[640px] lg:min-h-[calc(100vh-250px)]">   
        <div className="absolute inset-0 -z-20 lg:left-auto lg:w-[58%]">
          {slide._bannerImage && !imageFailed && (
            <img
              key={slide._bannerImage}
              src={slide._bannerImage}
              alt={slide._bannerTitle}
              onError={() => setImageFailed(true)}
              className="h-full w-full object-cover object-[center_18%]"
            />
          )}
        </div>

   
        <div className="absolute inset-0 -z-10 bg-[#111D32]/80 lg:hidden" />
        <div className="absolute inset-0 -z-10 hidden bg-gradient-to-r from-[#17243D] from-[40%] to-transparent to-[75%] lg:block" />
        <div className="absolute inset-x-0 bottom-0 -z-10 h-1/3 bg-gradient-to-t from-[#111D32]/70 to-transparent" />

      <div className="flex min-h-[560px] items-center px-6 pb-24 pt-12 sm:min-h-[640px] sm:px-10 lg:min-h-[calc(100vh-250px)] lg:px-16">
          <div className="w-full max-w-3xl lg:max-w-[46%]">
            <div className="mb-5 flex flex-wrap items-center gap-3">
              <span className="rounded-full bg-[#E47742] px-4 py-1.5 text-xs font-bold uppercase tracking-wider text-white">
                {getCategoryLabel(slide._bannerType)}
              </span>

              {slide._bannerDate && (
                <span className="text-sm text-white/80">
                  {formatDate(slide._bannerDate)}
                </span>
              )}
            </div>

         <h1 className="line-clamp-2 text-3xl font-bold leading-tight tracking-tight text-white sm:text-4xl lg:text-5xl">
              {slide._bannerTitle}
            </h1>

            <p className="mt-5 line-clamp-3 max-w-xl text-sm leading-7 text-white/85 sm:text-base sm:leading-8">
              {bannerDescription}
            </p>

            <div className="mt-7 flex flex-wrap items-center gap-4">
              <Link
                to={slide._bannerLink}
                className="inline-flex items-center gap-2 rounded-full bg-[#E47742] px-6 py-3 text-sm font-semibold text-white transition hover:-translate-y-0.5 hover:bg-[#CF6332]"
              >
                Explore More
                <span aria-hidden="true">→</span>
              </Link>

              {slide.author && (
                <span className="text-sm text-white/80">
                  By{" "}
                  {typeof slide.author === "string"
                    ? slide.author
                    : slide.author?.name ||
                      slide.author?.fullName ||
                      ""}
                </span>
              )}
            </div>
          </div>
        </div>

        {slides.length > 1 && (
          <div className="absolute bottom-6 left-6 flex items-center gap-5 sm:bottom-8 sm:left-10 lg:left-16">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={previousSlide}
                aria-label="Previous slide"
                className={arrowClass}
              >
                ‹
              </button>

              <button
                type="button"
                onClick={nextSlide}
                aria-label="Next slide"
                className={arrowClass}
              >
                ›
              </button>
            </div>

            <div className="flex items-center gap-2">
              {slides.map((item, index) => (
                <button
                  key={`${item._bannerType}-${getSlug(item)}`}
                  type="button"
                  onClick={() => setCurrentIndex(index)}
                  aria-label={`Show slide ${index + 1}`}
                  className={`h-2 rounded-full transition-all ${
                    index === currentIndex
                      ? "w-8 bg-[#E47742]"
                      : "w-2 bg-white/60 hover:bg-white"
                  }`}
                />
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}