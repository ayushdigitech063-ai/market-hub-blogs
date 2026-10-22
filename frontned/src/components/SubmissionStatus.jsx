import React, { useEffect, useRef, useState } from "react";
import { CheckCircle2, Clock, XCircle, X } from "lucide-react";
import { API } from "../dashboard/config";

const STORAGE_KEY = "blogSubmissionIds";
const DISMISSED_KEY = "dismissedBlogSubmissionIds";
const POLL_MS = 20000;
const TIMEOUT_MS = 8000;
const MAX_TRACKED = 5;

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
  } catch (error) {
    console.error("Unable to save notification data:", error);
  }
};

const readIds = () => readStorage(STORAGE_KEY);

const writeIds = (ids) => writeStorage(STORAGE_KEY, ids);

const MESSAGES = {
  pending: {
    text: "Your blog post is being processed",
    sub: "Our team will contact you soon",
    Icon: Clock,
    bar: "bg-amber-400",
    chip: "bg-amber-50 text-amber-600",
    badge: "text-amber-500",
  },
  approved: {
    text: "Your blog is posted",
    sub: "It is now live on Market Hub",
    Icon: CheckCircle2,
    bar: "bg-green-500",
    chip: "bg-green-50 text-green-600",
    badge: "text-green-500",
  },
  rejected: {
    text: "Your blog post was not approved",
    sub: "You can review it and submit again",
    Icon: XCircle,
    bar: "bg-rose-500",
    chip: "bg-rose-50 text-rose-600",
    badge: "text-rose-500",
  },
};

const fetchStatus = async (id) => {
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), TIMEOUT_MS);

  try {
    const res = await fetch(`${API}/submissions/${id}`, {
      signal: ctrl.signal,
    });

    if (res.status === 404) {
      return { id, gone: true };
    }

    if (!res.ok) {
      return null;
    }

    return { id, ...(await res.json()) };
  } catch {
    return null;
  } finally {
    clearTimeout(timer);
  }
};

export default function SubmissionStatus() {
  const [items, setItems] = useState([]);
  const itemsRef = useRef([]);
  const busy = useRef(false);
  const mounted = useRef(false);

  const apply = (next) => {
    itemsRef.current = next;
    setItems(next);
  };

  const load = async () => {
    if (busy.current || !mounted.current) return;

    busy.current = true;

    try {
      const ids = readIds().slice(-MAX_TRACKED);
      const known = itemsRef.current;

      const results = await Promise.all(
        ids.map((id) => {
          const old = known.find((item) => item.id === id);

          if (old && old.status !== "pending") {
            return Promise.resolve(old);
          }

          return fetchStatus(id).then((result) => result || old || null);
        })
      );

      if (!mounted.current) return;

      const gone = results
        .filter((result) => result?.gone)
        .map((result) => result.id);

      if (gone.length) {
        writeIds(readIds().filter((id) => !gone.includes(id)));
      }

      const dismissedIds = readStorage(DISMISSED_KEY);

      apply(
        results.filter(
          (result) =>
            result &&
            !result.gone &&
            !dismissedIds.includes(result.id)
        )
      );
    } finally {
      busy.current = false;
    }
  };

  useEffect(() => {
    mounted.current = true;

    load();

    const interval = setInterval(() => {
      if (!document.hidden) load();
    }, POLL_MS);

    const handleSubmissionAdded = () => {
      load();
    };

    window.addEventListener("submission-added", handleSubmissionAdded);

    return () => {
      mounted.current = false;
      clearInterval(interval);
      window.removeEventListener(
        "submission-added",
        handleSubmissionAdded
      );
    };
  }, []);

  const dismiss = (id) => {
    const dismissedIds = readStorage(DISMISSED_KEY);

    if (!dismissedIds.includes(id)) {
      writeStorage(
        DISMISSED_KEY,
        [...dismissedIds, id].slice(-100)
      );
    }

    apply(itemsRef.current.filter((item) => item.id !== id));
  };

  if (items.length === 0) return null;

  return (
    <div
      role="region"
      aria-label="Blog submission notifications"
      className="
        fixed top-24 left-1/2 -translate-x-1/2
        z-[9999] flex w-[calc(100%-2rem)] max-w-md
        flex-col gap-3 pointer-events-none
      "
    >
      <style>{`@keyframes toastIn{from{opacity:0;transform:translateY(-14px) scale(.97)}to{opacity:1;transform:none}}`}</style>

      {items.map((item) => {
        const message = MESSAGES[item.status] || MESSAGES.pending;
        const Icon = message.Icon;
        const image = item.image || item.form?.image;

        return (
          <div
            key={item.id}
            role="status"
            style={{ animation: "toastIn .35s ease-out" }}
            className="pointer-events-auto relative overflow-hidden rounded-2xl border border-orange-100 bg-white shadow-2xl"
          >
            <span className={`absolute inset-y-0 left-0 w-1.5 ${message.bar}`} />

            <div className="flex items-center gap-3 py-3 pl-5 pr-3">
              <div className="relative h-14 w-14 shrink-0">
                {image ? (
                  <img
                    src={image}
                    alt=""
                    className="h-14 w-14 rounded-xl object-cover ring-1 ring-black/5"
                    onError={(e) => {
                      e.currentTarget.style.display = "none";
                    }}
                  />
                ) : (
                  <div className={`flex h-14 w-14 items-center justify-center rounded-xl ${message.chip}`}>
                    <Icon className="h-6 w-6" />
                  </div>
                )}
                {image && (
                  <span className="absolute -bottom-1 -right-1 rounded-full bg-white p-0.5 shadow">
                    <Icon className={`h-4 w-4 ${message.badge}`} />
                  </span>
                )}
              </div>

              <div className="min-w-0 flex-1">
                <p className="text-sm font-extrabold leading-5 text-slate-900">
                  {message.text}
                </p>

                <p className="mt-0.5 line-clamp-2 break-words text-xs font-semibold leading-4 text-slate-600">
                  {item.title}
                </p>

                <p className="mt-1 text-[11px] leading-4 text-slate-400">
                  {message.sub}
                </p>
              </div>

              <button
                type="button"
                onClick={() => dismiss(item.id)}
                aria-label="Close notification"
                title="Close notification"
                className="flex h-7 w-7 shrink-0 items-center justify-center self-start rounded-full text-slate-400 transition hover:bg-slate-100 hover:text-slate-700 focus:outline-none focus:ring-2 focus:ring-orange-300"
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