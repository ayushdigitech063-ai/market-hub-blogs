import React, { useState } from "react";
import { Menu, LogOut, LayoutDashboard } from "lucide-react";
import { API } from "./config";
import WhatsAppSettings from "./WhatsAppSettings";
import { GlobalStyle, Toast, PageHeader } from "./ui";
import Sidebar from "./Sidebar";
import Overview from "./Overview";
import CrudSection from "./CrudSection";
import UnifiedBlogs, { BLOG_KEYS } from "./UnifiedBlogs";
import SettingsSection from "./SettingsSection";
   import NotificationsSection from "./NotificationsSection";
import { META, emptyBlogAuthor, blogAuthorFields } from "./constants";


function Section({ id, tab, counts, children }) {
  return (
    <div className={tab === id ? "" : "hidden"}>
      <PageHeader meta={META[id]} count={counts[id]} />
      {children}
    </div>
  );
}

export default function Dashboard({ admin, onLogout }) {
  const [tab, setTab] = useState("overview");
  const [blogType, setBlogType] = useState("all");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [counts, setCounts] = useState({
    biographies: 0, articles: 0, companies: 0, brands: 0,
    authors: 0, blogArticles: 0, latestArticles: 0, slidingCompanies: 0,
  });
  const [toast, setToast] = useState(null);

  const notify = (msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };
  const setCount = (key) => (n) => setCounts((c) => ({ ...c, [key]: n }));


  const goTo = (key) => {
    if (BLOG_KEYS.includes(key)) {
      setBlogType(key);
      setTab("blogs");
    } else {
      if (key === "blogs") setBlogType("all");
      setTab(key);
    }
    setSidebarOpen(false);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const blogsTotal = BLOG_KEYS.reduce((s, k) => s + (counts[k] || 0), 0);
  const sidebarCounts = { ...counts, blogs: blogsTotal };

  return (
    <div className="min-h-screen bg-orange-50/30 lg:flex">
      <GlobalStyle />
      <Toast toast={toast} />


      <div className="sticky top-0 z-40 flex items-center justify-between border-b border-orange-200 bg-white px-4 py-3 lg:hidden">
        <div className="flex items-center gap-2">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-orange-400 to-amber-400 text-white">
            <LayoutDashboard className="h-4 w-4" />
          </span>
          <span className="text-sm font-bold text-slate-900">Admin Panel</span>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={onLogout}
            className="inline-flex items-center gap-1.5 rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-xs font-semibold text-rose-600"
            aria-label="Logout">
            <LogOut className="h-4 w-4" /> Logout
          </button>
          <button onClick={() => setSidebarOpen(true)}
            className="rounded-lg border border-orange-200 p-2 text-orange-600" aria-label="Open menu">
            <Menu className="h-5 w-5" />
          </button>
        </div>
      </div>

      {sidebarOpen && (
        <div className="fixed inset-0 z-40 bg-slate-900/40 backdrop-blur-sm lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      <Sidebar tab={tab} counts={sidebarCounts} admin={admin} open={sidebarOpen}
        onClose={() => setSidebarOpen(false)} goTo={goTo} />

      <main className="min-w-0 flex-1">

        <div className="sticky top-0 z-30 hidden h-[72px] items-center justify-end border-b border-orange-200 bg-white/90 px-10 backdrop-blur lg:flex">
          <button onClick={onLogout}
            className="inline-flex items-center gap-2 rounded-lg border border-rose-100 bg-rose-50 px-3.5 py-1.5 text-xs font-semibold text-rose-600 transition hover:bg-rose-100">
            <LogOut className="h-4 w-4" /> Logout
          </button>
        </div>

        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-10 lg:py-10">
          <div className={tab === "overview" ? "" : "hidden"}>
            <Overview counts={counts} admin={admin} goTo={goTo} />
          </div>


          <Section id="blogs" tab={tab} counts={{ ...counts, blogs: blogsTotal }}>
            <UnifiedBlogs type={blogType} setType={setBlogType} counts={counts}
              notify={notify} setCount={setCount} />
          </Section>

          <Section id="authors" tab={tab} counts={counts}>
            <CrudSection
              singular="Author"
              fields={blogAuthorFields}
              emptyForm={emptyBlogAuthor}
              listUrl={`${API}/blog-authors`}
              createUrl={`${API}/blog-authors`}
              updateUrl={(key) => `${API}/blog-authors/${key}`}
              deleteUrl={(key) => `${API}/blog-authors/${key}`}
              getKey={(item) => item.id}
              toForm={(item) => ({
                id: item.id || "",
                name: item.name || "",
                role: item.role || "",
                company: item.company || "",
                image: item.image || "",
                about: item.about || "",
                education: item.education || "",
                expertise: Array.isArray(item.expertise) ? item.expertise.join(", ") : "",
                twitter: item.social?.twitter || "",
                linkedin: item.social?.linkedin || "",
                instagram: item.social?.instagram || "",
                youtube: item.social?.youtube || "",
              })}
              toPayload={(form) => {
                const social = {};
                ["twitter", "linkedin", "instagram", "youtube"].forEach((k) => {
                  if (form[k].trim()) social[k] = form[k].trim();
                });
                return {
                  id: form.id.trim(),
                  name: form.name.trim(),
                  role: form.role.trim(),
                  company: form.company.trim(),
                  image: form.image.trim(),
                  about: form.about.trim(),
                  education: form.education.trim(),
                  expertise: form.expertise.split(",").map((s) => s.trim()).filter(Boolean),
                  social,
                };
              }}
              getRow={(item) => ({
                image: item.image,
                round: true,
                title: item.name,
                subtitle: `${item.role || ""}${item.company ? ` • ${item.company}` : ""}`,
              })}
              onCount={setCount("authors")}
              notify={notify}
            />
          </Section>
   {tab === "notifications" && <NotificationsSection />}
    
          <Section id="settings" tab={tab} counts={counts}>
            <SettingsSection admin={admin} counts={counts} onLogout={onLogout} />
          </Section>
          

<Section id="whatsappSettings" tab={tab} counts={counts}>
  <WhatsAppSettings notify={notify} />
</Section>

          
        </div>
      </main>
    </div>
  );
}