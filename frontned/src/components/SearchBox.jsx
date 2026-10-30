import React, {
  useCallback,
  useDeferredValue,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { useNavigate } from "react-router-dom";
import { Search, LoaderCircle, ArrowRight } from "lucide-react";
import {
  getCachedIndex,
  loadSearchIndex,
  searchItems,
  searchWords,
  TYPE_ICONS,
} from "../api/searchApi";

const MAX_SUGGESTIONS = 8;
const LISTBOX_ID = "search-suggestions";

const escapeRe = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

function Highlight({ text, pattern }) {
  if (!pattern) return text;

  return text.split(pattern).map((part, i) =>
    i % 2 === 1 ? (
      <mark key={i} className="rounded bg-amber-100 px-0.5 text-stone-900">
        {part}
      </mark>
    ) : (
      part
    )
  );
}

export default function SearchBox() {
  const navigate = useNavigate();
  const wrapRef = useRef(null);

  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(-1);
  const [data, setData] = useState(() => {
    const cached = getCachedIndex();
    return { items: cached || [], ready: Boolean(cached) };
  });

  
  const deferredQuery = useDeferredValue(query);

  
  const load = useCallback(() => {
    loadSearchIndex()
      .then(({ items, failed }) =>
        setData((prev) => (failed.length && prev.ready ? prev : { items, ready: true }))
      )
      .catch(() => setData((prev) => ({ ...prev, ready: true })));
  }, []);

  useEffect(() => {
    const idle = window.requestIdleCallback
      ? window.requestIdleCallback(load)
      : window.setTimeout(load, 300);

    return () => {
      if (window.requestIdleCallback) window.cancelIdleCallback(idle);
      else window.clearTimeout(idle);
    };
  }, [load]);

  useEffect(() => {
    const onDown = (e) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target)) setOpen(false);
    };

    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, []);

  const words = useMemo(() => searchWords(deferredQuery), [deferredQuery]);

  const pattern = useMemo(
    () => (words.length ? new RegExp(`(${words.map(escapeRe).join("|")})`, "ig") : null),
    [words]
  );

  const allMatches = useMemo(
    () => searchItems(data.items, deferredQuery),
    [data.items, deferredQuery]
  );

  const suggestions = useMemo(() => allMatches.slice(0, MAX_SUGGESTIONS), [allMatches]);

  useEffect(() => {
    setActive(-1);
  }, [deferredQuery]);

  const goTo = (url) => {
    setOpen(false);
    setQuery("");
    navigate(url);
  };

  const goToAll = () => {
    const value = query.trim();
    if (!value) return;

    setOpen(false);
    navigate(`/search?q=${encodeURIComponent(value)}`);
  };

  const onKeyDown = (e) => {
    if (e.key === "Escape" || e.key === "Tab") {
      setOpen(false);
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      setOpen(true);
      setActive((i) => (suggestions.length ? (i + 1) % suggestions.length : -1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActive((i) =>
        suggestions.length ? (i <= 0 ? suggestions.length - 1 : i - 1) : -1
      );
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (active >= 0 && suggestions[active]) goTo(suggestions[active].url);
      else goToAll();
    }
  };

  const showPanel = open && query.trim().length > 0;
  const activeId = active >= 0 && suggestions[active] ? `${LISTBOX_ID}-${active}` : undefined;

  return (
    <div ref={wrapRef} className="relative w-full max-w-sm">
      <div role="search" className="relative">
        <input
          type="search"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setOpen(true);
          }}
          onFocus={() => {
            setOpen(true);
            load();
          }}
          onKeyDown={onKeyDown}
          placeholder="Search articles, companies..."
          aria-label="Search articles, companies, brands and people"
          role="combobox"
          aria-expanded={showPanel}
          aria-controls={LISTBOX_ID}
          aria-activedescendant={activeId}
          aria-autocomplete="list"
          autoComplete="off"
          className="w-full rounded-full border border-amber-200/80 bg-white/90 py-2.5 pl-10 pr-4 text-xs text-stone-800 outline-none transition-all duration-300 placeholder:text-stone-400 focus:border-amber-400 focus:bg-white focus:ring-4 focus:ring-amber-400/10"
        />

        <span className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-amber-700">
          <Search className="h-4 w-4" />
        </span>
      </div>

      {showPanel && (
        <div className="absolute left-0 top-full z-[60] mt-2 w-full overflow-hidden rounded-2xl border border-amber-200 bg-white shadow-2xl shadow-stone-900/15 md:w-[30rem]">
          {!data.ready ? (
            <div className="flex items-center justify-center gap-2 px-4 py-8 text-xs font-medium text-amber-700">
              <LoaderCircle className="h-4 w-4 animate-spin" />
              Searching your content...
            </div>
          ) : suggestions.length === 0 ? (
            <div className="px-4 py-8 text-center">
              <p className="text-sm font-semibold text-stone-800">No results found</p>
              <p className="mt-1 text-xs text-stone-500">
                Try another keyword, company, article or person name.
              </p>
            </div>
          ) : (
            <>
              <ul
                id={LISTBOX_ID}
                role="listbox"
                className="max-h-[22rem] overflow-y-auto py-1.5"
              >
                {suggestions.map((item, index) => {
                  const Icon = TYPE_ICONS[item.type] || Search;
                  const isActive = index === active;

                  return (
                    <li
                      key={item.id}
                      id={`${LISTBOX_ID}-${index}`}
                      role="option"
                      aria-selected={isActive}
                    >
                      <button
                        type="button"
                        tabIndex={-1}
                        onMouseEnter={() => setActive(index)}
                        onClick={() => goTo(item.url)}
                        className={`flex w-full items-center gap-3 px-3 py-2.5 text-left transition-colors ${
                          isActive ? "bg-amber-50" : "hover:bg-amber-50/60"
                        }`}
                      >
                        {item.image ? (
                          <img
                            src={item.image}
                            alt=""
                            loading="lazy"
                            className="h-11 w-11 shrink-0 rounded-lg bg-stone-100 object-cover"
                          />
                        ) : (
                          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-amber-50 text-amber-700">
                            <Icon className="h-5 w-5" />
                          </span>
                        )}

                        <span className="min-w-0 flex-1">
                          <span className="block truncate text-[13px] font-semibold text-stone-900">
                            <Highlight text={item.title} pattern={pattern} />
                          </span>
                          {item.subtitle && (
                            <span className="mt-0.5 block truncate text-[11px] text-stone-500">
                              {item.subtitle}
                            </span>
                          )}
                        </span>

                        <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-amber-50 px-2 py-1 text-[10px] font-bold text-amber-800">
                          <Icon className="h-3 w-3" />
                          {item.type}
                        </span>
                      </button>
                    </li>
                  );
                })}
              </ul>

              <button
                type="button"
                onClick={goToAll}
                className="flex w-full items-center justify-between border-t border-amber-100 bg-amber-50/60 px-4 py-3 text-xs font-bold text-amber-800 transition hover:bg-amber-100/70"
              >
                <span>
                  See all {allMatches.length} result{allMatches.length === 1 ? "" : "s"} for "
                  {query.trim()}"
                </span>
                <ArrowRight className="h-4 w-4" />
              </button>
            </>
          )}
        </div>
      )}
    </div>
  );
}