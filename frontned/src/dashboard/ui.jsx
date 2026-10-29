




const SCROLL_CSS = `
html {
  scrollbar-width: thin;
  scrollbar-color: #fdba74 #fff7ed;
  scroll-behavior: smooth;
}

* {
  scrollbar-width: thin;
  scrollbar-color: #fdba74 #fff7ed;
}

::-webkit-scrollbar {
  width: 8px;
  height: 8px;
}

::-webkit-scrollbar-track {
  background: #fff7ed;
}

::-webkit-scrollbar-thumb {
  background: #fdba74;
  border-radius: 8px;
}

::-webkit-scrollbar-thumb:hover {
  background: #fb923c;
}

.nav-scroll {
  scrollbar-width: none;
  -ms-overflow-style: none;
}

.nav-scroll::-webkit-scrollbar {
  display: none;
}

@keyframes modalPop {
  from {
    opacity: 0;
    transform: translateY(14px) scale(.98);
  }

  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

.modal-pop {
  animation: modalPop .2s ease-out;
}

.ql-toolbar.ql-snow {
  position: sticky;
  top: 0;
  z-index: 20;
  background: #fff;
}

@media (prefers-reduced-motion: reduce) {
  html {
    scroll-behavior: auto;
  }

  *,
  *::before,
  *::after {
    animation-duration: .01ms !important;
    animation-iteration-count: 1 !important;
    scroll-behavior: auto !important;
    transition-duration: .01ms !important;
  }
}
`;

export function GlobalStyle() {
  return <style>{SCROLL_CSS}</style>;
}

/* =========================================
   INPUT STYLES
========================================= */

export const inputClass =
  "w-full min-w-0 rounded-lg border border-orange-200 bg-white px-3 py-2 text-[13px] text-slate-800 placeholder-slate-400 outline-none transition-colors focus:border-orange-400 focus:ring-2 focus:ring-orange-300/40 disabled:cursor-not-allowed disabled:bg-orange-50 disabled:text-slate-400 disabled:opacity-80";

/* =========================================
   TOAST NOTIFICATION
========================================= */

export function Toast({ toast }) {
  if (!toast) return null;

  const isError = toast.type === "error";

  const colorClass = isError
    ? "border-rose-500 bg-rose-600"
    : toast.type === "success"
      ? "border-emerald-500 bg-emerald-600"
      : toast.type === "warning"
        ? "border-amber-500 bg-amber-500"
        : "border-orange-500 bg-orange-500";

  const message =
    typeof toast.msg === "string" ||
    typeof toast.msg === "number"
      ? toast.msg
      : "";

  if (!message) return null;

  return (
    <div
      role={isError ? "alert" : "status"}
      aria-live={isError ? "assertive" : "polite"}
      className={[
        "fixed right-3 top-3 z-[90]",
        "max-w-[calc(100vw-1.5rem)] sm:right-5 sm:top-5",
        "rounded-lg border px-4 py-3",
        "text-xs font-semibold text-white",
        "break-words shadow-lg",
        "modal-pop",
        colorClass,
      ].join(" ")}
    >
      {message}
    </div>
  );
}

/* =========================================
   PAGE HEADER
========================================= */

export function PageHeader({ meta = {}, count }) {
  const group =
    typeof meta.group === "string" ? meta.group : "";

  const title =
    typeof meta.title === "string" ? meta.title : "";

  const desc =
    typeof meta.desc === "string" ? meta.desc : "";

  const showCount =
    count !== null &&
    count !== undefined &&
    count !== "";

  return (
    <header className="mb-6 flex flex-wrap items-end justify-between gap-3 border-b border-orange-100 pb-5">
      <div className="min-w-0 flex-1">
        {group && (
          <p className="text-xs font-semibold text-orange-600">
            {group}
          </p>
        )}

        <h1 className="mt-0.5 break-words text-xl font-bold tracking-tight text-slate-900 sm:text-2xl">
          {title}
        </h1>

        {desc && (
          <p className="mt-1 max-w-3xl text-xs leading-5 text-slate-500 sm:text-sm">
            {desc}
          </p>
        )}
      </div>

      {showCount && (
        <div
          className="shrink-0 rounded-lg border border-orange-100 bg-white px-4 py-2 text-center"
          aria-label={`Total items: ${count}`}
        >
          <p className="text-lg font-bold leading-tight text-orange-600">
            {count}
          </p>

          <p className="text-[10px] font-medium text-slate-400">
            Total
          </p>
        </div>
      )}
    </header>
  );
}

/* =========================================
   REUSABLE CARD
========================================= */

export function Card({
  title,
  icon: Icon,
  right,
  children,
  className = "",
}) {
  const hasHeader = Boolean(title || right);

  return (
    <section
      className={[
        "min-w-0 rounded-xl border border-orange-100",
        "bg-white p-4 sm:p-5",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
    >
      {hasHeader && (
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <div className="flex min-w-0 items-center gap-2">
            {Icon && (
              <Icon
                aria-hidden="true"
                className="h-4 w-4 shrink-0 text-orange-500"
              />
            )}

            {title && (
              <h3 className="break-words text-sm font-bold text-slate-900">
                {title}
              </h3>
            )}
          </div>

          {right && (
            <div className="flex shrink-0 items-center gap-2">
              {right}
            </div>
          )}
        </div>
      )}

      {children}
    </section>
  );
}



export function MiniBtn({
  children,
  className = "",
  disabled = false,
  type = "button",
  ...props
}) {
  return (
    <button
      {...props}
      type={type}
      disabled={disabled}
      className={[
        "inline-flex min-h-8 items-center justify-center gap-1.5",
        "rounded-md border border-orange-200 bg-white",
        "px-2.5 py-1.5 text-[11px] font-semibold",
        "text-orange-600 transition-colors",
        "hover:bg-orange-50",
        "focus-visible:outline-none",
        "focus-visible:ring-2 focus-visible:ring-orange-400",
        "focus-visible:ring-offset-2",
        "disabled:cursor-not-allowed",
        "disabled:opacity-50",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
    >
      {children}
    </button>
  );
}
