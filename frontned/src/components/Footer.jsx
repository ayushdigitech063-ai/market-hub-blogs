
import React from "react";
import { Link } from "react-router-dom";
import { ArrowRight, MapPin, Globe2 } from "lucide-react";

const quickLinks = [
  { label: "Home", to: "/" },
  { label: "Latest Articles", to: "/articles" },
  { label: "Companies", to: "/companies" },
  { label: "Authors", to: "/articles" },
  { label: "Biography", to: "/Biography" },
  { label: "About", to: "/about" },
];

const categories = [
  "SEO & Search Visibility",
  "Digital Marketing",
  "Social Media",
  "Artificial Intelligence",
  "Content Marketing",
  "Business & Technology",
];

const socialLinks = [
  {
    label: "Facebook",
    href: "#",
    icon: (
      <svg viewBox="0 0 24 24" className="h-4 w-4 fill-current">
        <path d="M24 12.073C24 5.446 18.627.073 12 .073S0 5.446 0 12.073c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
      </svg>
    ),
  },
  {
    label: "Twitter / X",
    href: "#",
    icon: (
      <svg viewBox="0 0 24 24" className="h-4 w-4 fill-current">
        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
      </svg>
    ),
  },
  {
    label: "LinkedIn",
    href: "#",
    icon: (
      <svg viewBox="0 0 24 24" className="h-4 w-4 fill-current">
        <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.35V9h3.414v1.561h.049c.476-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 1 1 0-4.124 2.062 2.062 0 0 1 0 4.124zM7.119 20.452H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
      </svg>
    ),
  },
  {
    label: "YouTube",
    href: "#",
    icon: (
      <svg viewBox="0 0 24 24" className="h-4 w-4 fill-current">
        <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
      </svg>
    ),
  },
];

const headingClass =
  "text-sm font-bold tracking-wide text-slate-900";

const underlineClass =
  "mb-4 mt-3 h-1 w-10 rounded-full bg-gradient-to-r from-orange-500 to-rose-400";

const footerLinkClass =
  "group inline-flex items-center gap-2 text-[13px] leading-5 text-slate-600 transition-colors duration-200 hover:text-orange-600";

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="relative overflow-hidden border-t border-orange-100 bg-[#FFFCF8] text-slate-700">

      {/* Soft decorative background — no image */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -right-28 -top-28 h-72 w-72 rounded-full bg-orange-100/50 blur-3xl"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -bottom-32 -left-24 h-72 w-72 rounded-full bg-rose-100/40 blur-3xl"
      />

      <div className="relative mx-auto max-w-[1400px] px-5 sm:px-8 lg:px-10">

        {/* Main footer */}
        <div className="grid grid-cols-1 gap-9 py-10 sm:grid-cols-2 lg:grid-cols-4 lg:gap-10 lg:py-12">

          {/* Brand / introduction */}
          <div>
            <Link
              to="/"
              aria-label="Market Digital Insights home"
              className="inline-flex items-center gap-2"
            >
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-orange-500 to-rose-500 text-white shadow-md shadow-orange-200/60">
                <Globe2 className="h-5 w-5" />
              </span>

              <span className="text-base font-extrabold tracking-tight text-slate-900">
                Market
                <span className="text-orange-600"> Digital Insights</span>
              </span>
            </Link>

            <p className="mt-4 max-w-xs text-[13px] leading-6 text-slate-600">
              Your destination for digital marketing knowledge, company
              insights, technology trends and business stories.
            </p>

            <div className="mt-5 flex items-center gap-2">
              {socialLinks.map((social) => (
                <a
                  key={social.label}
                  href={social.href}
                  aria-label={social.label}
                  title={social.label}
                  className="flex h-9 w-9 items-center justify-center rounded-xl border border-orange-100 bg-white text-slate-600 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-orange-400 hover:bg-orange-500 hover:text-white hover:shadow-md"
                >
                  {social.icon}
                </a>
              ))}
            </div>
          </div>

          {/* Quick links */}
          <div>
            <h3 className={headingClass}>Quick Links</h3>
            <div className={underlineClass} />

            <ul className="space-y-3">
              {quickLinks.map((item) => (
                <li key={item.label}>
                  <Link to={item.to} className={footerLinkClass}>
                    <ArrowRight
                      size={14}
                      className="shrink-0 text-orange-500 transition-transform duration-200 group-hover:translate-x-1"
                    />
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

      
          <div>
            <h3 className={headingClass}>Explore Topics</h3>
            <div className={underlineClass} />

            <ul className="space-y-3">
              {categories.map((category) => (
                <li key={category}>
                  <span className="group inline-flex cursor-default items-start gap-2 text-[13px] leading-5 text-slate-600 transition-colors duration-200 hover:text-orange-600">
                    <span className="mt-[7px] h-1.5 w-1.5 shrink-0 rounded-full bg-orange-400 transition-transform duration-200 group-hover:scale-125" />
                    {category}
                  </span>
                </li>
              ))}
            </ul>
          </div>

          {/* About */}
          <div>
            <h3 className={headingClass}>About Us</h3>
            <div className={underlineClass} />

            <p className="text-[13px] leading-6 text-slate-600">
              Discover company profiles, expert perspectives, biographies
              and practical knowledge about the digital world.
            </p>

            <div className="mt-5 rounded-2xl border border-orange-100 bg-white/80 p-4 shadow-sm">
              <div className="flex items-start gap-3">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-orange-50 text-orange-600">
                  <MapPin className="h-4 w-4" />
                </span>

                <div>
                  <p className="text-xs font-bold text-slate-900">
                    Our Focus
                  </p>
                  <p className="mt-1 text-[12px] leading-5 text-slate-600">
                    Marketing, technology and business insights in one place.
                  </p>
                </div>
              </div>

              <div className="mt-4 flex items-center gap-2 border-t border-slate-100 pt-3 text-[12px] font-bold text-orange-600">
                <Globe2 className="h-4 w-4" />
                <span>Explore. Learn. Grow.</span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="flex flex-col gap-4 border-t border-orange-100 py-5 text-[11px] leading-5 text-slate-500 sm:flex-row sm:items-center sm:justify-between">

          <p className="text-center sm:text-left">
            © {year} Market Digital Insights. All rights reserved.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-x-5 gap-y-2">
            <Link
              to="/privacy-policy"
              className="transition-colors hover:text-orange-600"
            >
              Privacy Policy
            </Link>

            <Link
              to="/terms"
              className="transition-colors hover:text-orange-600"
            >
              Terms & Conditions
            </Link>

            <Link
              to="/sitemap"
              className="transition-colors hover:text-orange-600"
            >
              Sitemap
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
