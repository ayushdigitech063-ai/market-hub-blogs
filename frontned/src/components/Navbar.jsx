import React, { useEffect, useState, lazy, Suspense } from "react";
import { Link, NavLink } from "react-router-dom";
import SearchBox from "./SearchBox";
import SubmissionStatus from "./SubmissionStatus";

const SubmitBlogModal = lazy(() => import("./SubmitBlogModal"));

const links = [
  { to: "/", label: "Home", end: true },
  { to: "/about", label: "About" },
  { to: "/articles", label: "Articles" },
  { to: "/companies", label: "Companies" },
  { to: "/Biography", label: "Biography" },
];

const ICONS = {
  plus: "M12 5v14M5 12h14",
  close: "m6 6 12 12M18 6 6 18",
  menu: "M4 7h16M4 12h16M4 17h16",
  chevron: "m9 18 6-6-6-6",
};

function Icon({ name, className = "h-4 w-4" }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.9"
      aria-hidden="true"
    >
      <path strokeLinecap="round" strokeLinejoin="round" d={ICONS[name]} />
    </svg>
  );
}

const pillClass = ({ isActive }) =>
  `whitespace-nowrap rounded-full px-4 py-2 text-[13px] font-semibold transition-all duration-200 ${
    isActive
      ? "bg-white text-orange-700 shadow-sm ring-1 ring-orange-100"
      : "text-slate-600 hover:text-orange-700"
  }`;

const mobileClass = ({ isActive }) =>
  `flex items-center justify-between rounded-xl px-4 py-3 text-sm font-semibold transition-colors ${
    isActive
      ? "bg-orange-50 text-orange-700"
      : "text-slate-600 hover:bg-slate-50 hover:text-orange-700"
  }`;

function PillNav({ label, className }) {
  return (
    <nav
      aria-label={label}
      className={`items-center gap-1 rounded-full border border-slate-200/80 bg-slate-100/70 p-1 ${className}`}
    >
      {links.map((link) => (
        <NavLink key={link.to} to={link.to} end={link.end} className={pillClass}>
          {link.label}
        </NavLink>
      ))}
    </nav>
  );
}

export default function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [isSubscribeOpen, setIsSubscribeOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);

    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <>
      <header
        className={`sticky top-0 z-50 border-b bg-white/90 backdrop-blur-xl transition-shadow duration-300 ${
          scrolled
            ? "border-slate-200 shadow-[0_8px_30px_-12px_rgba(15,23,42,0.22)]"
            : "border-slate-200/70 shadow-none"
        }`}
      >
        <div className="h-[3px] bg-gradient-to-r from-orange-400 via-rose-500 to-orange-400" />

        <div className="mx-auto max-w-[1440px] px-4 sm:px-6 lg:px-8">
          <div className="flex min-h-[72px] items-center justify-between gap-3 lg:gap-5">
            <Link
              to="/"
              aria-label="Market Digital Insights home"
              className="group flex min-w-0 shrink-0 items-center"
            >
              <div className="flex h-[52px] w-[145px] items-center sm:w-[175px] lg:w-[185px]">
                <img
                  src="/logo.png"
                  alt="Market Digital Insights"
                  className="block max-h-[48px] max-w-full object-contain object-left transition-transform duration-300 group-hover:scale-[1.03]"
                />
              </div>
            </Link>

            <div className="hidden min-w-[160px] flex-1 justify-center px-1 md:flex lg:px-3">
              <div className="w-full max-w-[340px]">
                <SearchBox />
              </div>
            </div>

            <PillNav label="Main navigation" className="hidden shrink-0 lg:flex" />

            <div className="flex shrink-0 items-center gap-2">
              <button
                type="button"
                onClick={() => setIsSubscribeOpen(true)}
                className="group inline-flex min-h-[42px] items-center justify-center gap-2 rounded-full bg-gradient-to-r from-orange-500 to-rose-600 py-2 pl-2 pr-4 text-xs font-bold text-white shadow-md shadow-orange-600/25 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-orange-600/30 focus:outline-none focus:ring-2 focus:ring-orange-400 focus:ring-offset-2 active:translate-y-0"
              >
                <span className="flex h-7 w-7 items-center justify-center rounded-full bg-white/20 transition-transform duration-300 group-hover:rotate-90">
                  <Icon name="plus" />
                </span>
                <span className="whitespace-nowrap">Add To Blog</span>
              </button>

              <button
                type="button"
                onClick={() => setMobileOpen((open) => !open)}
                aria-label={mobileOpen ? "Close navigation" : "Open navigation"}
                aria-expanded={mobileOpen}
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-700 transition hover:border-orange-200 hover:bg-orange-50 hover:text-orange-700 focus:outline-none focus:ring-2 focus:ring-orange-300 md:hidden"
              >
                <Icon name={mobileOpen ? "close" : "menu"} className="h-5 w-5" />
              </button>
            </div>
          </div>

          <div className="hidden justify-center overflow-x-auto pb-3 md:flex lg:hidden">
            <PillNav label="Tablet navigation" className="flex" />
          </div>

          <div className="pb-3 md:hidden">
            <SearchBox />
          </div>

          {mobileOpen && (
            <div className="mb-3 overflow-hidden rounded-2xl border border-slate-200 bg-white p-2 shadow-xl shadow-slate-900/10 md:hidden">
              <nav aria-label="Mobile navigation" className="flex flex-col gap-1">
                {links.map((link) => (
                  <NavLink
                    key={link.to}
                    to={link.to}
                    end={link.end}
                    onClick={() => setMobileOpen(false)}
                    className={mobileClass}
                  >
                    {({ isActive }) => (
                      <>
                        <span>{link.label}</span>
                        <Icon
                          name="chevron"
                          className={`h-4 w-4 transition-transform ${
                            isActive
                              ? "translate-x-0 text-orange-600"
                              : "-translate-x-1 text-slate-400"
                          }`}
                        />
                      </>
                    )}
                  </NavLink>
                ))}
              </nav>
            </div>
          )}
        </div>
      </header>

      {isSubscribeOpen && (
        <Suspense fallback={null}>
          <SubmitBlogModal onClose={() => setIsSubscribeOpen(false)} />
        </Suspense>
      )}

      <SubmissionStatus />
    </>
  );
}