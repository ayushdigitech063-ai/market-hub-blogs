
import React, { useEffect, useRef, useState } from "react";
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
    style: "border-amber-200 bg-amber-50 text-amber-800",
  },
  approved: {
    text: "Your blog is posted",
    style: "border-green-200 bg-green-50 text-green-700",
  },
  rejected: {
    text: "Your blog post was not approved",
    style: "border-rose-200 bg-rose-50 text-rose-700",
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
        flex-col gap-2 pointer-events-none
      "
    >
      {items.map((item) => {
        const message = MESSAGES[item.status] || MESSAGES.pending;

        return (
          <div
            key={item.id}
            role="status"
            className={`
              pointer-events-auto flex items-start justify-between
              gap-3 rounded-2xl border p-4 text-sm shadow-xl
              backdrop-blur-md
              ${message.style}
            `}
          >
            <div className="min-w-0 flex-1">
              <p className="font-bold leading-5">
                {message.text}
              </p>

              <p className="mt-1 break-words text-sm leading-5 opacity-80">
                {item.title}
              </p>
            </div>

            <button
              type="button"
              onClick={() => dismiss(item.id)}
              aria-label="Close notification"
              title="Close notification"
              className="
                flex h-7 w-7 shrink-0 items-center justify-center
                rounded-full text-base font-bold opacity-70
                transition hover:bg-black/10 hover:opacity-100
                focus:outline-none focus:ring-2 focus:ring-current
              "
            >
              ✕
            </button>
          </div>
        );
      })}
    </div>
  );
}
