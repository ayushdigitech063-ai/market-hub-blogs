import React from "react";
import { Link } from "react-router-dom";
import { FaTwitter, FaInstagram, FaLinkedinIn, FaGlobe } from "react-icons/fa";

const renderSocialIcon = (platform) => {
  const key = platform.toLowerCase();
  if (key.includes("twitter") || key.includes("x")) {
    return <FaTwitter className="h-4 w-4" />;
  } else if (key.includes("instagram")) {
    return <FaInstagram className="h-4 w-4" />;
  } else if (key.includes("linked") || key.includes("linkedin")) {
    return <FaLinkedinIn className="h-4 w-4" />;
  } else {
    return <FaGlobe className="h-4 w-4" />;
  }
};

export default function ProfileCard({ item }) {
  // Agar item hi nahi hai toh blank return kar do taaki crash na ho
  if (!item) return null;

  // Safe optional chaining to prevent reading undefined properties
  const rawSocials = item?.socials || {};
  const socialLinks = {
    twitter: rawSocials.twitter || item?.twitter,
    instagram: rawSocials.instagram || item?.instagram,
    linkedin: rawSocials.linked || rawSocials.linkedin || item?.linkedin,
    website: rawSocials.website || item?.website,
  };

  const hasSocials = Object.values(socialLinks).some((url) => Boolean(url));

  return (
    <article className="group flex flex-col justify-between overflow-hidden rounded-3xl border border-stone-200/80 bg-white shadow-sm transition-all duration-300 hover:-translate-y-2 hover:border-amber-500/50 hover:shadow-xl">
      <Link to={`/biography/${item.type}/${item.slug}`} className="flex flex-1 flex-col">
        <div className="relative flex h-[320px] items-center justify-center overflow-hidden bg-stone-100">
          <img
            src={item.image}
            alt={item.name}
            loading="lazy"
            className="h-full w-full object-cover object-top transition-transform duration-500 group-hover:scale-105"
          />
          <div className="pointer-events-none absolute inset-x-0 bottom-0 h-28 bg-gradient-to-t from-stone-950/60 to-transparent" />
          {item.category && (
            <span className="absolute left-4 top-4 rounded-full bg-stone-900/90 px-3.5 py-1.5 text-[10px] font-bold uppercase tracking-wider text-amber-300 backdrop-blur-md border border-stone-700/50">
              {item.category}
            </span>
          )}
        </div>

        <div className="p-6 pb-2">
          <h3 className="font-serif text-2xl font-bold text-stone-900 transition-colors group-hover:text-amber-600">
            {item.name}
          </h3>
          {item.role && (
            <p className="mt-2 text-xs sm:text-sm font-bold text-amber-700 uppercase tracking-wider">{item.role}</p>
          )}
          {item.company && (
            <p className="mt-1 text-xs sm:text-sm font-medium text-stone-500">{item.company}</p>
          )}
          {item.shortBio && (
            <p className="mt-3 line-clamp-3 text-xs sm:text-sm leading-relaxed text-stone-600 font-light">
              {item.shortBio}
            </p>
          )}
        </div>
      </Link>

      <div className="p-6 pt-0">
        {/* Social Media Icons Section */}
        {hasSocials && (
          <div className="mb-4 flex items-center gap-2.5 border-t border-stone-100 pt-4">
            {Object.entries(socialLinks).map(([platform, url]) => {
              if (!url) return null;
              return (
                <a
                  key={platform}
                  href={url}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={(e) => e.stopPropagation()}
                  className="flex h-9 w-9 items-center justify-center rounded-full bg-amber-50 text-amber-700 transition-colors duration-200 hover:bg-amber-500 hover:text-stone-950 shadow-xs"
                  title={platform}
                >
                  {renderSocialIcon(platform)}
                </a>
              );
            })}
          </div>
        )}

        <Link
          to={`/biography/${item.type}/${item.slug}`}
          className="flex items-center justify-between border-t border-stone-100 pt-4 group/cta"
        >
          <span className="text-xs sm:text-sm font-bold uppercase tracking-wider text-stone-800">
            Read Full Biography
          </span>
          <span className="flex h-9 w-9 items-center justify-center rounded-full bg-stone-100 text-sm font-bold text-stone-800 transition-all duration-300 group-hover/cta:bg-amber-500 group-hover/cta:text-stone-950 shadow-xs">
            →
          </span>
        </Link>
      </div>
    </article>
  );
}