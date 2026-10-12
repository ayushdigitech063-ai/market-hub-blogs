import React, { useEffect, useState } from "react";

// "light" = Sunlight mode (default), "dark" = Night mode.
// The actual night styling lives in index.css and is switched by <html data-theme="dark">,
// so it applies to every page, not just the ones that render this button.
const STORAGE_KEY = "theme";

const getInitialTheme = () => {
  try {
    return localStorage.getItem(STORAGE_KEY) === "dark" ? "dark" : "light";
  } catch {
    return "light";
  }
};

const SunIcon = () => (
  <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
    <circle cx="12" cy="12" r="4" />
    <path
      strokeLinecap="round"
      d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41"
    />
  </svg>
);

const MoonIcon = () => (
  <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
    <path strokeLinecap="round" strokeLinejoin="round" d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
  </svg>
);

export default function ThemeToggle() {
  const [theme, setTheme] = useState(getInitialTheme);
  const isDark = theme === "dark";

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    try {
      localStorage.setItem(STORAGE_KEY, theme);
    } catch {
      /* storage blocked: the theme still works for this visit */
    }
  }, [theme]);

  return (
    <button
      type="button"
      onClick={() => setTheme(isDark ? "light" : "dark")}
      aria-label={isDark ? "Switch to sunlight mode" : "Switch to night mode"}
      title={isDark ? "Sunlight mode" : "Night mode"}
      className="flex h-10 w-10 cursor-pointer items-center justify-center rounded-xl border border-amber-200 bg-white text-amber-800 transition hover:border-amber-400 hover:bg-amber-50"
    >
      {isDark ? <SunIcon /> : <MoonIcon />}
    </button>
  );
}