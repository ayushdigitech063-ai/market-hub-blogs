
import React from "react";
import { X, LayoutDashboard } from "lucide-react";
import { NAV } from "./constants";
import { usePendingCount } from "./NotificationsSection";

export default function Sidebar({
  tab,
  counts,
  admin,
  open,
  onClose,
  goTo,
}) {
  const pending = usePendingCount();

  return (
    <aside
      className={`fixed inset-y-0 left-0 z-50 flex w-72 flex-col border-r border-orange-200 bg-white transition-transform duration-300 lg:sticky lg:top-0 lg:h-screen lg:shrink-0 lg:translate-x-0 ${
        open ? "translate-x-0" : "-translate-x-full"
      }`}
    >
      <div className="flex h-[72px] shrink-0 items-center justify-between border-b border-orange-200 bg-orange-50/60 px-5">
        <div className="flex items-center gap-3">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-orange-500 text-white">
            <LayoutDashboard className="h-5 w-5" />
          </span>

          <div>
            <p className="text-sm font-bold leading-tight text-slate-900">
              Admin Panel
            </p>
            <p className="text-[11px] font-medium text-slate-500">
              Control Center
            </p>
          </div>
        </div>

        <button
          onClick={onClose}
          className="rounded-lg p-1.5 text-slate-500 hover:bg-orange-100 lg:hidden"
          aria-label="Close menu"
        >
          <X className="h-5 w-5" />
        </button>
      </div>

      <nav className="nav-scroll flex-1 space-y-6 overflow-y-auto px-4 py-6">
        {NAV.map((section) => (
          <div key={section.group}>
            <p className="mb-1.5 px-3 text-[10px] font-semibold uppercase tracking-wider text-orange-400">
              {section.group}
            </p>

            <ul className="space-y-1">
              {section.items.map(({ key, label, Icon }) => {
                const isActive = tab === key;

                return (
                  <li key={key}>
                    <button
                      onClick={() => goTo(key)}
                      className={`flex w-full items-center gap-3 rounded-lg px-3 py-2 text-[13px] font-medium transition ${
                        isActive
                          ? "bg-orange-100/80 text-orange-700"
                          : "text-slate-600 hover:bg-orange-50 hover:text-orange-600"
                      }`}
                    >
                      <Icon className="h-[18px] w-[18px] shrink-0" />

                      <span className="flex-1 text-left">{label}</span>

                      {counts?.[key] !== undefined && (
                        <span
                          className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${
                            isActive
                              ? "bg-white text-orange-700"
                              : "bg-amber-100 text-amber-700"
                          }`}
                        >
                          {counts[key]}
                        </span>
                      )}

                      {key === "notifications" && pending > 0 && (
                        <span className="rounded-full bg-rose-500 px-2 py-0.5 text-[10px] font-bold text-white">
                          {pending}
                        </span>
                      )}
                    </button>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </nav>

      <div className="border-t border-orange-100 p-4">
        <div className="flex items-center gap-3 rounded-lg bg-orange-50 px-3 py-2.5">
          <span className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-orange-400 to-amber-400 text-sm font-bold text-white">
            {(admin?.name || "A").charAt(0).toUpperCase()}
          </span>

          <div className="min-w-0">
            <p className="truncate text-[13px] font-semibold text-slate-900">
              {admin?.name}
            </p>
            <p className="truncate text-[11px] text-slate-500">
              {admin?.email}
            </p>
          </div>
        </div>
      </div>
    </aside>
  );
}
