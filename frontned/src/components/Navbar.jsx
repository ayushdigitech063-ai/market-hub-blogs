import React, { useState } from "react";
import { Link, NavLink } from "react-router-dom";
import SearchBox from "./SearchBox"; 

const links = [
  { to: "/", label: "Home", end: true },
  { to: "/about", label: "About" },
  { to: "/articles", label: "Articles" },
  { to: "/companies", label: "Companies" },
  { to: "/Biography", label: "Biography" },
];

export default function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);


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
    `whitespace-nowrap rounded-full px-4 py-2 text-[13px] font-semibold tracking-wide transition-all duration-200 ${
      isActive
        ? "bg-gradient-to-r from-amber-100 to-orange-100 text-amber-900 shadow-sm ring-1 ring-amber-200"
        : "text-stone-600 hover:bg-amber-50 hover:text-amber-800"
    }`;

  return (
    <>
      <header className="sticky top-0 z-50 border-b border-amber-100 bg-white/90 shadow-[0_4px_24px_-10px_rgba(180,83,9,0.28)] backdrop-blur-xl">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
   
          <div className="flex min-h-[78px] items-center justify-between gap-4">

            <Link
              to="/"
              aria-label="Market Digital Insights home"
              className="flex min-w-0 shrink-0 items-center"
            >
              <div className="flex h-[58px] w-[155px] items-center justify-start sm:w-[190px]">
                <img
                  src="/logo.png"
                  alt="Market Digital Insights"
                  className="block max-h-[54px] max-w-full object-contain object-left transition-transform duration-300 hover:scale-[1.04]"
                />
              </div>
            </Link>

            <div className="hidden flex-1 justify-center px-3 md:flex lg:px-6">
              <SearchBox />
            </div>


            <nav
              aria-label="Main navigation"
              className="hidden items-center gap-1 lg:flex"
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

            <div className="flex shrink-0 items-center gap-2 sm:gap-3">
              <button
                type="button"
                onClick={() => setIsSubscribeOpen(true)}
                className="inline-flex cursor-pointer items-center justify-center rounded-full bg-gradient-to-r from-amber-500 via-orange-500 to-amber-500 px-4 py-2.5 text-xs font-bold tracking-wide text-white shadow-md shadow-orange-500/30 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-orange-500/40 sm:px-6"
              >
                Subscribe
              </button>

              <button
                type="button"
                onClick={() => setMobileOpen(!mobileOpen)}
                aria-label={mobileOpen ? "Close navigation" : "Open navigation"}
                aria-expanded={mobileOpen}
                className="flex h-10 w-10 items-center justify-center rounded-full border border-amber-200 bg-amber-50 text-amber-800 transition hover:border-amber-400 hover:bg-amber-100 lg:hidden"
              >
                {mobileOpen ? (
                  <svg
                    className="h-5 w-5"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <path strokeLinecap="round" d="m6 6 12 12M18 6 6 18" />
                  </svg>
                ) : (
                  <svg
                    className="h-5 w-5"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <path strokeLinecap="round" d="M4 7h16M4 12h16M4 17h16" />
                  </svg>
                )}
              </button>
            </div>
          </div>


          <nav
            aria-label="Tablet navigation"
            className="hidden items-center justify-center gap-2 overflow-x-auto border-t border-amber-100 py-2.5 md:flex lg:hidden"
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

      
          <div className="pb-3 md:hidden">
            <SearchBox />
          </div>

          {mobileOpen && (
            <div className="mb-3 rounded-2xl border border-amber-100 bg-gradient-to-b from-amber-50/70 to-white p-2 shadow-sm md:hidden">
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
                          ? "bg-gradient-to-r from-amber-100 to-orange-100 text-amber-900 ring-1 ring-amber-200"
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


        <div className="h-[3px] bg-gradient-to-r from-transparent via-amber-400 to-transparent" />
      </header>

      {isSubscribeOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-stone-900/50 p-4 backdrop-blur-sm">
          <div className="relative w-full max-w-md overflow-hidden rounded-3xl border border-amber-100 bg-white p-7 shadow-2xl">
            <div className="absolute inset-x-0 top-0 h-1.5 bg-gradient-to-r from-amber-400 via-orange-500 to-amber-400" />

            <button
              type="button"
              onClick={() => setIsSubscribeOpen(false)}
              className="absolute right-4 top-5 flex h-8 w-8 items-center justify-center rounded-full bg-stone-100 text-sm font-bold text-stone-500 transition hover:bg-amber-100 hover:text-amber-800"
            >
              ✕
            </button>

            <div className="mb-5 text-center">
              <h3 className="text-xl font-extrabold text-stone-900">
                Subscribe to Newsletter
              </h3>
              <p className="mt-1.5 text-xs text-stone-500">
                Get the latest articles & market insights right in your inbox.
              </p>
            </div>

            {submitted ? (
              <div className="rounded-2xl border border-green-200 bg-green-50 p-4 text-center text-xs font-semibold text-green-700">
                ✓ Thank you for subscribing!
              </div>
            ) : (
              <form onSubmit={handleSubscribeSubmit} className="space-y-4">
                <div>
                  <label className="mb-1.5 block text-xs font-semibold text-stone-700">
                    Your Name
                  </label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Enter your name"
                    className="w-full rounded-xl border border-amber-200 bg-amber-50/40 px-4 py-3 text-xs text-stone-900 outline-none transition focus:border-amber-500 focus:bg-white focus:ring-4 focus:ring-amber-400/20"
                  />
                </div>

                <div>
                  <label className="mb-1.5 block text-xs font-semibold text-stone-700">
                    Email Address *
                  </label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your email"
                    className="w-full rounded-xl border border-amber-200 bg-amber-50/40 px-4 py-3 text-xs text-stone-900 outline-none transition focus:border-amber-500 focus:bg-white focus:ring-4 focus:ring-amber-400/20"
                  />
                </div>

                <div className="flex justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setIsSubscribeOpen(false)}
                    className="rounded-full border border-stone-200 px-5 py-2.5 text-xs font-semibold text-stone-600 transition hover:bg-stone-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="rounded-full bg-gradient-to-r from-amber-500 via-orange-500 to-amber-500 px-6 py-2.5 text-xs font-bold text-white shadow-md shadow-orange-500/30 transition hover:-translate-y-0.5 hover:shadow-lg"
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