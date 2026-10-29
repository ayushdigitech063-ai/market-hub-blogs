import React, { useCallback, useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { CheckCircle2, Clock, XCircle, X } from "lucide-react";
import { API } from "../dashboard/config";
import { cleanText, getCachedIndex, loadSearchIndex } from "../api/searchApi";

const STORAGE_KEY = "blogSubmissionIds";
const DISMISSED_KEY = "dismissedBlogSubmissionIds";
const POLL_MS = 20000;
const TIMEOUT_MS = 15000;
const MAX_TRACKED = 5;
const IMAGE_KEY = /image|thumb|cover|banner|photo/i;
const META_KEY = "blogSubmissionMeta";

const MESSAGES = {
  pending: {
    sub: "Your submission is being reviewed.",
    Icon: Clock,
    accent: "bg-amber-400",
    chip: "bg-amber-50 text-amber-600",
    badge: "text-amber-500",
    label: "Under review",
  },
  approved: {

    Icon: CheckCircle2,
    accent: "bg-emerald-500",
    chip: "bg-emerald-50 text-emerald-600",
    badge: "text-emerald-500",
    label: "Blog posted",
  },
  rejected: {
    sub: "Your blog wasn't approved. You can review and submit it again.",
    Icon: XCircle,
    accent: "bg-rose-500",
    chip: "bg-rose-50 text-rose-600",
    badge: "text-rose-500",
    label: "Not approved",
  },
};

const readStorage = (key) => {
  try {
    const value = JSON.parse(localStorage.getItem(key) || "[]");
    return Array.isArray(value) ? value : [];
  } catch {
    return [];
  }
};

const writeStorage = (key, value) => {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
  
  }
};


export const pickImage = (item) => {
  for (const source of [item, item?.form, item?.post]) {
    if (!source || typeof source !== "object") continue;
    for (const [key, value] of Object.entries(source)) {
      if (IMAGE_KEY.test(key) && typeof value === "string" && /^(https?:)?\/\/|^data:|^\//.test(value.trim())) {
        return value.trim();
      }
    }
  }
  return "";
};


export const saveSubmissionMeta = (id, form) => {
  try {
    const meta = JSON.parse(localStorage.getItem(META_KEY) || "{}");
    meta[id] = { title: form.title || "", image: pickImage(form), slug: form.slug || "" };
    localStorage.setItem(META_KEY, JSON.stringify(meta));
  } catch {
   
  }
};


const dismissKey = (item) => `${item.id}:${item.status}`;

const readMeta = (id) => {
  try {
    return JSON.parse(localStorage.getItem(META_KEY) || "{}")[id] || {};
  } catch {
    return {};
  }
};

const pick = (...values) =>
  values.find((value) => typeof value === "string" && value.trim())?.trim() || "";


const blogUrl = (item) => {
  const post = item.post || {};
  const form = item.form || {};

  const direct = pick(item.url, item.link, item.publishedUrl, post.url);
  if (direct.startsWith("/")) return direct;

  try {
    const parsed = new URL(direct);
    if (parsed.origin === window.location.origin) return parsed.pathname + parsed.search;
  } catch {
    // direct URL nahi hai, aage badho.
  }

  const type = String(item.postType || "").toLowerCase();
  const slug = pick(item.slug, post.slug, form.slug);

  if (slug) {
    if (/latest/.test(type)) return `/latest-article/${slug}`;
    if (/sliding/.test(type)) return `/sliding-company/${slug}`;
    if (/compan/.test(type)) return `/company/${slug}`;
    if (/brand|product/.test(type)) return `/brand/${slug}`;
    if (/bio|ceo|sport|entrepreneur/.test(type)) {
      const kind = `${type} ${pick(post.type, form.type, post.category, form.category)}`.toLowerCase();
      const group = kind.includes("sport") ? "sports" : kind.includes("entrepreneur") ? "entrepreneur" : "ceo";
      return `/biography/${group}/${slug}`;
    }
    if (/author|blog/.test(type)) return `/articles/${slug}`;
  }

  const id = item.postId ?? post.id;
  if (/article/.test(type) && id !== undefined && id !== null) return `/article/${id}`;

  return `/search?q=${encodeURIComponent(item.title || "")}`;
};

const fetchStatus = async (id, signal) => {
  try {
    const response = await fetch(`${API}/submissions/${encodeURIComponent(id)}`, {
      signal: AbortSignal.any([signal, AbortSignal.timeout(TIMEOUT_MS)]),
    });

    if (response.status === 404) return { id, gone: true };
    if (!response.ok) return null;

    return { ...(await response.json()), id };
  } catch {
    return null;
  }
};

export default function SubmissionStatus() {
  const navigate = useNavigate();
  const [items, setItems] = useState([]);
  const itemsRef = useRef([]);
  const busy = useRef(false);
  const opening = useRef(false);
  const mounted = useRef(false);
  const controllerRef = useRef(null);

  const apply = useCallback((next) => {
    itemsRef.current = next;
    setItems(next);
  }, []);

  const load = useCallback(async () => {
    if (!mounted.current || busy.current) return;

    busy.current = true;
    const controller = new AbortController();
    controllerRef.current = controller;

    try {
      const ids = readStorage(STORAGE_KEY).slice(-MAX_TRACKED);
      const known = itemsRef.current;

      const results = await Promise.all(
        ids.map(async (id) => {
          const old = known.find((item) => item.id === id);

          if (old && old.status !== "pending") return old;

          const fresh = await fetchStatus(id, controller.signal);
          if (!fresh || fresh.gone) return fresh || old || null;

          const meta = readMeta(id);
          return {
            ...fresh,
            title: fresh.title || meta.title || old?.title || "",
            image: pickImage(fresh) || meta.image || old?.image || "",
            slug: fresh.slug || meta.slug || old?.slug || "",
          };
        })
      );

      if (!mounted.current || controller.signal.aborted) return;

      const goneIds = results.filter((item) => item?.gone).map((item) => item.id);

      if (goneIds.length) {
        writeStorage(
          STORAGE_KEY,
          readStorage(STORAGE_KEY).filter((id) => !goneIds.includes(id))
        );
      }

      const dismissed = readStorage(DISMISSED_KEY);

      apply(
        results.filter(
          (item) => item && !item.gone && !dismissed.includes(dismissKey(item))
        )
      );
    } catch (error) {
      console.error("Unable to load submission notifications:", error);
    } finally {
      if (controllerRef.current === controller) busy.current = false;
    }
  }, [apply]);

  useEffect(() => {
    mounted.current = true;

    load();

    const interval = setInterval(() => {
      if (!document.hidden) load();
    }, POLL_MS);

    window.addEventListener("submission-added", load);

    return () => {
      mounted.current = false;
      clearInterval(interval);
      window.removeEventListener("submission-added", load);
      controllerRef.current?.abort();
      busy.current = false;
    };
  }, [load]);

  const dismiss = (target) => {
    const key = dismissKey(target);
    const dismissed = readStorage(DISMISSED_KEY);

    if (!dismissed.includes(key)) {
      writeStorage(DISMISSED_KEY, [...dismissed, key].slice(-100));
    }

    apply(itemsRef.current.filter((item) => item.id !== target.id));
  };

 
  const openBlog = async (item) => {
    if (opening.current) return;
    opening.current = true;

    try {
      const title = cleanText(item.title).toLowerCase();
      const type = String(item.postType || "").toLowerCase().replace(/[^a-z]/g, "");

      const find = (list) => {
        const matches = (list || []).filter((entry) => entry.titleLower === title);
        return (
          matches.find((entry) => type && entry.type.toLowerCase().replace(/[^a-z]/g, "").includes(type)) ||
          matches[0]
        );
      };

      let match = title && find(getCachedIndex());

      if (title && !match) {
        try {
          match = find((await loadSearchIndex(true)).items);
        } catch {
          
        }
      }

      dismiss(item);
      navigate(match?.url || blogUrl(item));
    } finally {
      opening.current = false;
    }
  };

  if (!items.length) return null;

  return (
    <div
      role="region"
      aria-label="Blog notifications"
      className="pointer-events-none fixed left-1/2 top-24 z-[9999] flex w-[calc(100%-2rem)] max-w-md -translate-x-1/2 flex-col gap-3"
    >
      <style>{`
        @keyframes blogToastIn {
          from { opacity: 0; transform: translateY(-12px) scale(.97); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }
      `}</style>

      {items.map((item) => {
        const message = MESSAGES[item.status] || MESSAGES.pending;
        const Icon = message.Icon;
        const image = pickImage(item);
        const title = item.title?.trim() || "Your blog submission";
        const clickable = item.status === "approved";

        return (
          <div
            key={item.id}
            role="status"
            style={{ animation: "blogToastIn .3s ease-out" }}
            onClick={clickable ? () => openBlog(item) : undefined}
            onKeyDown={
              clickable
                ? (event) => {
                    if (event.target === event.currentTarget && event.key === "Enter") openBlog(item);
                  }
                : undefined
            }
            tabIndex={clickable ? 0 : undefined}
            title={clickable ? "Open blog" : undefined}
            className={`pointer-events-auto relative overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-xl shadow-slate-900/10 ${
              clickable ? "cursor-pointer transition hover:shadow-2xl focus:outline-none focus:ring-2 focus:ring-emerald-300" : ""
            }`}
          >
            <span className={`absolute inset-y-0 left-0 w-1 ${message.accent}`} />

            <div className="flex items-start gap-3 p-3.5 pl-4">
              <div className="relative h-[68px] w-[68px] shrink-0">
                {image ? (
                  <img
                    src={image}
                    alt=""
                    loading="lazy"
                    className="h-[68px] w-[68px] rounded-xl bg-slate-100 object-cover ring-1 ring-black/5"
                    onError={(event) => {
                      event.currentTarget.style.display = "none";
                    }}
                  />
                ) : (
                  <div
                    className={`flex h-[68px] w-[68px] items-center justify-center rounded-xl ${message.chip}`}
                  >
                    <Icon className="h-7 w-7" />
                  </div>
                )}

                {image && (
                  <span className="absolute -bottom-1 -right-1 rounded-full bg-white p-0.5 shadow">
                    <Icon className={`h-4 w-4 ${message.badge}`} />
                  </span>
                )}
              </div>

              <div className="min-w-0 flex-1 pt-0.5">
                <div className="mb-1 flex items-center gap-1.5">
                  <Icon className={`h-4 w-4 shrink-0 ${message.badge}`} />
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                    {message.label}
                  </span>
                </div>

                <h3 className="line-clamp-2 break-words text-sm font-bold leading-5 text-slate-900">
                  {title}
                </h3>

                <p className="mt-1 text-xs leading-4 text-slate-500">{message.sub}</p>
              </div>

              <button
                type="button"
                onClick={(event) => {
                  event.stopPropagation();
                  dismiss(item);
                }}
                aria-label="Close notification"
                title="Close notification"
                className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-slate-400 transition hover:bg-slate-100 hover:text-slate-700 focus:outline-none focus:ring-2 focus:ring-orange-300"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
}