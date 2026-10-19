import React from "react";
import { User, Mail, ShieldCheck, Calendar, Server, Database, LogOut, Hash } from "lucide-react";
import { API } from "./config";
import { Card } from "./ui";

const LABELS = {
  biographies: "Biographies",
  articles: "Articles",
  companies: "Companies",
  brands: "Brands",
  authors: "Authors",
  blogArticles: "Author Articles",
  latestArticles: "Latest Articles",
  slidingCompanies: "Sliding Companies",
};

const Row = ({ icon: Icon, label, value }) => (
  <div className="flex items-center gap-3 rounded-lg border border-orange-100 bg-orange-50/30 px-4 py-3">
    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-orange-100 text-orange-600">
      <Icon className="h-4 w-4" />
    </span>
    <div className="min-w-0">
      <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">{label}</p>
      <p className="truncate text-sm font-semibold text-slate-900">{value || "—"}</p>
    </div>
  </div>
);

export default function SettingsSection({ admin, counts, onLogout }) {
  const total = Object.values(counts).reduce((a, b) => a + (b || 0), 0);
  const joined = admin?.createdAt
    ? new Date(admin.createdAt).toLocaleDateString("en-IN", {
        day: "numeric", month: "long", year: "numeric",
      })
    : "";

  return (
    <div className="space-y-5">
     
      <Card title="Admin Profile">
        <div className="mb-5 flex items-center gap-4">
          <span className="flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-orange-400 to-amber-400 text-2xl font-bold text-white">
            {(admin?.name || "A").charAt(0).toUpperCase()}
          </span>
          <div className="min-w-0">
            <p className="truncate text-lg font-bold text-slate-900">{admin?.name}</p>
            <p className="truncate text-xs text-slate-500">{admin?.email}</p>
          </div>
        </div>
        <div className="grid gap-3 md:grid-cols-2">
          <Row icon={User} label="Full Name" value={admin?.name} />
          <Row icon={Mail} label="Email" value={admin?.email} />
          <Row icon={ShieldCheck} label="Role" value={admin?.role || "Administrator"} />
          <Row icon={Hash} label="Admin ID" value={admin?._id || admin?.id} />
          <Row icon={Calendar} label="Account Created" value={joined} />
        </div>
      </Card>

      <Card title="System Information">
        <div className="grid gap-3 md:grid-cols-2">
          <Row icon={Server} label="API Server" value={API} />
          <Row icon={Database} label="Total Content Entries" value={String(total)} />
        </div>
      </Card>

      <Card title="Content Summary">
        <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
          {Object.entries(counts).map(([k, v]) => (
            <div key={k} className="rounded-lg border border-orange-100 bg-white p-3 text-center">
              <p className="text-xl font-bold text-orange-600">{v}</p>
              <p className="text-[11px] font-medium text-slate-500">{LABELS[k] || k}</p>
            </div>
          ))}
        </div>
      </Card>

    </div>
  );
}