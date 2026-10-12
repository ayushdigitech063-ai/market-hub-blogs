

import React, { useState } from "react";
import { Link, NavLink } from "react-router-dom";
import ThemeToggle from "./ThemeToggle";

const links = [
  { to: "/", label: "Home", end: true },
    { to: "/about", label: "About" },
  { to: "/articles", label: "Articles" },
  { to: "/companies", label: "Companies" },
  { to: "/Biography", label: "Biography" },

];

const SearchIcon = () => (
  <svg
    className="h-4 w-4"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.8"
    viewBox="0 0 24 24"
    aria-hidden="true"
  >
    <circle cx="11" cy="11" r="7" />
    <path strokeLinecap="round" d="m16 16 4 4" />
  </svg>
);

const SearchBox = () => {
  const [query, setQuery] = useState("");

  const handleSearch = (e) => {
    e.preventDefault();
    const value = query.trim();
    if (value) {
      window.location.href = `/articles?search=${encodeURIComponent(value)}`;
    }
  };

  return (
    <form
      onSubmit={handleSearch}
      role="search"
      className="relative w-full max-w-sm"
    >
      <input
        type="search"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search articles, companies..."
        aria-label="Search articles and companies"
        className="w-full rounded-full border border-amber-200/80 bg-white/90 py-2.5 pl-10 pr-4 text-xs text-stone-800 outline-none transition-all duration-300 placeholder:text-stone-400 focus:border-amber-400 focus:bg-white focus:ring-4 focus:ring-amber-400/10"
      />

      <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-amber-700">
        <SearchIcon />
      </span>
    </form>
  );
};

export default function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  
  // Popup Modal State
  const [isSubscribeOpen, setIsSubscribeOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const handleSubscribeSubmit = (e) => {
    e.preventDefault();
    if (email) {
      setSubmitted(true);
      setTimeout(() => {
        setSubmitted(false);
        setIsSubscribeOpen(false);
        setEmail("");
        setName("");
      }, 2000);
    }
  };

  const navClass = ({ isActive }) =>
    `relative whitespace-nowrap py-2 text-[13px] font-semibold transition-colors duration-200 ${
      isActive
        ? "text-amber-800 after:absolute after:bottom-0 after:left-0 after:h-0.5 after:w-full after:rounded-full after:bg-gradient-to-r after:from-amber-400 after:to-yellow-600"
        : "text-stone-600 hover:text-amber-700"
    }`;

  return (
    <>
      <header className="sticky top-0 z-50 border-b border-amber-200/70 bg-gradient-to-r from-white via-amber-50/60 to-white shadow-sm backdrop-blur-xl">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          {/* Main Navbar */}
          <div className="flex min-h-[76px] items-center justify-between gap-4">
            {/* Logo */}
            <Link
              to="/"
              aria-label="Market Digital Insights home"
              className="flex min-w-0 shrink-0 items-center"
            >
              <div className="flex h-[58px] w-[155px] items-center justify-start sm:w-[190px]">
                <img
                  src="/logo.png"
                  alt="Market Digital Insights"
                  className="block max-h-[54px] max-w-full object-contain object-left transition-transform duration-300 hover:scale-[1.03]"
                />
              </div>
            </Link>

            {/* Desktop Search */}
            <div className="hidden flex-1 justify-center px-3 md:flex lg:px-6">
              <SearchBox />
            </div>

            {/* Desktop Navigation */}
            <nav
              aria-label="Main navigation"
              className="hidden items-center gap-4 lg:flex xl:gap-6"
            >
              {links.map((link) => (
                <NavLink
                  key={link.to}
                  to={link.to}
                  end={link.end}
                  className={navClass}
                >
                  {link.label}
                </NavLink>
              ))}
            </nav>

            {/* Subscribe Button + Mobile Menu Toggle */}
            <div className="flex shrink-0 items-center gap-2 sm:gap-3">
              <ThemeToggle />

              <button
                type="button"
                onClick={() => setIsSubscribeOpen(true)}
                className="inline-flex items-center justify-center rounded-xl border border-amber-300/70 bg-gradient-to-r from-amber-500 to-yellow-400 px-3.5 py-2.5 text-xs font-bold text-stone-950 shadow-sm shadow-amber-900/10 transition-all duration-300 hover:-translate-y-0.5 hover:from-yellow-400 hover:to-amber-500 sm:px-5 cursor-pointer"
              >
                Subscribe
              </button>

              <button
                type="button"
                onClick={() => setMobileOpen(!mobileOpen)}
                aria-label={mobileOpen ? "Close navigation" : "Open navigation"}
                aria-expanded={mobileOpen}
                className="flex h-10 w-10 items-center justify-center rounded-xl border border-amber-200 bg-white text-amber-800 transition hover:border-amber-400 hover:bg-amber-50 lg:hidden"
              >
                {mobileOpen ? (
                  <svg
                    className="h-5 w-5"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <path
                      strokeLinecap="round"
                      d="m6 6 12 12M18 6 6 18"
                    />
                  </svg>
                ) : (
                  <svg
                    className="h-5 w-5"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <path
                      strokeLinecap="round"
                      d="M4 7h16M4 12h16M4 17h16"
                    />
                  </svg>
                )}
              </button>
            </div>
          </div>

          {/* Tablet Navigation */}
          <nav
            aria-label="Tablet navigation"
            className="hidden items-center justify-center gap-7 overflow-x-auto border-t border-amber-100 py-3 md:flex lg:hidden"
          >
            {links.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                end={link.end}
                className={navClass}
              >
                {link.label}
              </NavLink>
            ))}
          </nav>

          {/* Mobile Search */}
          <div className="pb-3 md:hidden">
            <SearchBox />
          </div>

          {/* Mobile Menu */}
          {mobileOpen && (
            <div className="border-t border-amber-100 py-3 md:hidden">
              <nav className="flex flex-col gap-1">
                {links.map((link) => (
                  <NavLink
                    key={link.to}
                    to={link.to}
                    end={link.end}
                    onClick={() => setMobileOpen(false)}
                    className={({ isActive }) =>
                      `rounded-xl px-4 py-3 text-sm font-semibold transition-colors ${
                        isActive
                          ? "bg-amber-100/70 text-amber-900"
                          : "text-stone-600 hover:bg-amber-50 hover:text-amber-800"
                      }`
                    }
                  >
                    {link.label}
                  </NavLink>
                ))}
              </nav>
            </div>
          )}
        </div>

        {/* Golden Accent Line */}
        <div className="h-[2px] bg-gradient-to-r from-transparent via-amber-400 to-transparent opacity-80" />
      </header>

      {/* SUBSCRIBE POPUP MODAL */}
      {isSubscribeOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4">
          <div className="relative w-full max-w-md rounded-2xl border border-amber-200 bg-white p-6 shadow-2xl">
            {/* Close Button */}
            <button
              type="button"
              onClick={() => setIsSubscribeOpen(false)}
              className="absolute right-4 top-4 text-stone-400 hover:text-stone-700 text-sm font-bold"
            >
              ✕
            </button>

            {/* Header */}
            <div className="mb-4 text-center">
              <h3 className="text-lg font-bold text-stone-900">
                Subscribe to Newsletter
              </h3>
              <p className="mt-1 text-xs text-stone-500">
                Get the latest articles & market insights right in your inbox.
              </p>
            </div>

            {submitted ? (
              <div className="rounded-xl bg-green-50 p-4 text-center text-xs font-semibold text-green-700 border border-green-200">
                ✓ Thank you for subscribing!
              </div>
            ) : (
              /* Form */
              <form onSubmit={handleSubscribeSubmit} className="space-y-3.5">
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">
                    Your Name
                  </label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Enter your name"
                    className="w-full rounded-xl border border-stone-200 px-3.5 py-2.5 text-xs text-stone-900 outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-400/20"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">
                    Email Address *
                  </label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your email"
                    className="w-full rounded-xl border border-stone-200 px-3.5 py-2.5 text-xs text-stone-900 outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-400/20"
                  />
                </div>

                <div className="flex justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setIsSubscribeOpen(false)}
                    className="rounded-xl border border-stone-200 px-4 py-2 text-xs font-semibold text-stone-600 hover:bg-stone-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="rounded-xl bg-gradient-to-r from-amber-500 to-yellow-400 px-5 py-2 text-xs font-bold text-stone-950 shadow-xs hover:from-yellow-400 hover:to-amber-500"
                  >
                    Subscribe Now
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </>
  );
}