
import React, { useState, lazy, Suspense } from "react";
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

export default function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [isSubscribeOpen, setIsSubscribeOpen] = useState(false);

  const navClass = ({ isActive }) =>
    `relative whitespace-nowrap rounded-xl px-3 py-2.5 text-[13px] font-semibold transition-all duration-200 ${
      isActive
        ? "bg-orange-50 text-orange-700"
        : "text-slate-600 hover:bg-slate-50 hover:text-orange-700"
    }`;

  return (
    <>
      <header className="sticky top-0 z-50 border-b border-slate-200/80 bg-white/95 shadow-[0_4px_24px_-12px_rgba(15,23,42,0.16)] backdrop-blur-xl">
        <div className="mx-auto max-w-[1440px] px-4 sm:px-6 lg:px-8">
      
          <div className="flex min-h-[76px] items-center justify-between gap-3 lg:gap-5">
      
            <Link
              to="/"
              aria-label="Market Digital Insights home"
              className="group flex min-w-0 shrink-0 items-center"
            >
              <div className="flex h-[54px] w-[145px] items-center sm:w-[175px] lg:w-[190px]">
                <img
                  src="/logo.png"
                  alt="Market Digital Insights"
                  className="block max-h-[50px] max-w-full object-contain object-left transition-transform duration-300 group-hover:scale-[1.03]"
                />
              </div>
            </Link>

            <div className="hidden min-w-[160px] flex-1 justify-center px-1 md:flex lg:px-3">
              <div className="w-full max-w-[340px]">
                <SearchBox />
              </div>
            </div>

            <nav
              aria-label="Main navigation"
              className="hidden shrink-0 items-center gap-0.5 lg:flex"
            >
              {links.map((link) => (
                <NavLink
                  key={link.to}
                  to={link.to}
                  end={link.end}
                  className={navClass}
                >
                  {({ isActive }) => (
                    <span className="relative">
                      {link.label}
                      {isActive && (
                        <span className="absolute -bottom-[9px] left-0 right-0 mx-auto h-[2px] rounded-full bg-orange-500" />
                      )}
                    </span>
                  )}
                </NavLink>
              ))}
            </nav>

     
            <div className="flex shrink-0 items-center gap-2">
              <button
                type="button"
                onClick={() => setIsSubscribeOpen(true)}
               className="inline-flex min-h-[40px] items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-orange-600 to-rose-600 px-3.5 py-2.5 text-xs font-bold text-white shadow-sm shadow-orange-600/20 transition-all duration-300 hover:-translate-y-0.5 hover:from-orange-700 hover:to-rose-700 hover:shadow-md hover:shadow-orange-600/25 focus:outline-none focus:ring-2 focus:ring-orange-400 focus:ring-offset-2 sm:px-4 sm:text-xs"
              >
                <svg
                  className="h-4 w-4 shrink-0"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M12 5v14M5 12h14"
                  />
                </svg>
                <span className="whitespace-nowrap">Add To Blog</span>
              </button>


              <button
                type="button"
                onClick={() => setMobileOpen(!mobileOpen)}
                aria-label={
                  mobileOpen ? "Close navigation" : "Open navigation"
                }
                aria-expanded={mobileOpen}
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-700 transition hover:border-orange-200 hover:bg-orange-50 hover:text-orange-700 focus:outline-none focus:ring-2 focus:ring-orange-300 lg:hidden"
              >
                {mobileOpen ? (
                  <svg
                    className="h-5 w-5"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    aria-hidden="true"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="m6 6 12 12M18 6 6 18"
                    />
                  </svg>
                ) : (
                  <svg
                    className="h-5 w-5"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    aria-hidden="true"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M4 7h16M4 12h16M4 17h16"
                    />
                  </svg>
                )}
              </button>
            </div>
          </div>


          <nav
            aria-label="Tablet navigation"
            className="hidden items-center justify-center gap-1 overflow-x-auto border-t border-slate-100 py-2 md:flex lg:hidden"
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
            <div className="mb-3 overflow-hidden rounded-2xl border border-slate-200 bg-white p-2 shadow-lg shadow-slate-900/5 md:hidden">
              <nav aria-label="Mobile navigation" className="flex flex-col gap-1">
                {links.map((link) => (
                  <NavLink
                    key={link.to}
                    to={link.to}
                    end={link.end}
                    onClick={() => setMobileOpen(false)}
                    className={({ isActive }) =>
                      `flex items-center justify-between rounded-xl px-4 py-3 text-sm font-semibold transition-colors ${
                        isActive
                          ? "bg-orange-50 text-orange-700"
                          : "text-slate-600 hover:bg-slate-50 hover:text-orange-700"
                      }`
                    }
                  >
                    {({ isActive }) => (
                      <>
                        <span>{link.label}</span>
                        <svg
                          className={`h-4 w-4 transition-transform ${
                            isActive
                              ? "translate-x-0 text-orange-600"
                              : "-translate-x-1 text-slate-400"
                          }`}
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="1.8"
                          aria-hidden="true"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="m9 18 6-6-6-6"
                          />
                        </svg>
                      </>
                    )}
                  </NavLink>
                ))}
              </nav>
            </div>
          )}
        </div>


        <div className="h-[2px] bg-gradient-to-r from-orange-200 via-orange-500 to-rose-400" />
      </header>

      {isSubscribeOpen && (
        <Suspense fallback={null}>
          <SubmitBlogModal
            onClose={() => setIsSubscribeOpen(false)}
          />
        </Suspense>
      )}


      <SubmissionStatus />
    </>
  );
}
