import React, { useEffect, useState } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Link,
  useLocation,
  matchPath,
} from "react-router-dom";
import PrivacyPolicy from "./components/PrivacyPolicy";
import Preloader from "./components/Preloader";
import ScrollToTop from "./components/ScrollToTop";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import AdminDashboard from "./dashboard";
import Watsapp from "./components/Watsapp";
import Home from "./pages/Home";
import Companies from "./pages/Companies";
import SearchResults from "./pages/SearchResults";
import About from "./pages/company/About/page";

import DetailPage from "./components/DetailPageLayout";

import Biography from "./Biography Page/Biography";
import Biographydetails from "./Biography Page/Biographydetails";
import ViewAll from "./Biography Page/ViewAll";

import ArticlesPage from "./pages/ArticlesPage";
import ArticleReadPage from "./pages/ArticleReadPage";
import AuthorPage from "./pages/AuthorPage";

function NotFound() {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center px-5 text-center">
      <h1 className="text-6xl font-extrabold text-slate-900">404</h1>
      <p className="mt-3 text-lg text-slate-600">Page not found</p>
      <Link
        to="/"
        className="mt-6 rounded-full bg-red-600 px-6 py-3 text-sm font-semibold text-white transition hover:bg-red-700"
      >
        Go to Home
      </Link>
    </div>
  );
}

function AppContent() {
  const { pathname: rawPathname } = useLocation();

  const pathname =
    rawPathname.length > 1
      ? rawPathname.replace(/\/+$/, "")
      : rawPathname;

const isAdminPage =
  pathname === "/admin/login" || pathname === "/admin/dashboard";

  const isBiographyDetailsPage =
    (!!matchPath("/biography/:type/:slug", pathname) ||
      !!matchPath("/biography/:slug", pathname)) &&
    !pathname.startsWith("/biography/view-all/");

  const isArticleReadPage = !!matchPath("/articles/:slug", pathname);

  return (
    <div className="flex min-h-screen flex-col bg-gray-50">
      <ScrollToTop />

      {!isAdminPage && <Navbar />}

      <main className="flex-grow">
        <Routes>
          <Route path="/" element={<Home />} />

          <Route path="/articles" element={<ArticlesPage />} />
          <Route path="/articles/:slug" element={<ArticleReadPage />} />

          <Route path="/authors" element={<AuthorPage />} />
          <Route path="/author/:authorId" element={<AuthorPage />} />
<Route path="/admin/login" element={<AdminDashboard />} />
<Route path="/admin/dashboard" element={<AdminDashboard />} />
          <Route
            path="/latest-article/:slug"
            element={<DetailPage key="latest" type="latest" />}
          />
          <Route
            path="/brand/:slug"
            element={<DetailPage key="brand" type="brand" />}
          />
          <Route
            path="/company/:slug"
            element={<DetailPage key="company" type="company" />}
          />
          <Route
            path="/article/:id"
            element={<DetailPage key="article" type="article" />}
          />
          <Route
            path="/sliding-company/:slug"
            element={<DetailPage key="sliding" type="sliding" />}
          />

          <Route
            path="/categories"
            element={
              <div className="p-8 text-center text-xl font-semibold">
                Categories Page
              </div>
            }
          />
          <Route path="/privacy-policy" element={<PrivacyPolicy />} />
          <Route path="/about" element={<About />} />
          <Route path="/companies" element={<Companies />} />

          {/* Admin: only /admin/login works. /admin, /admin/register etc. -> 404 */}
          <Route path="/admin/login" element={<AdminDashboard />} />

          {/* Biography homepage */}
          <Route path="/biography" element={<Biography />} />
          <Route path="/biography/ceo" element={<Biography />} />

          {/* Biography category listings */}
          <Route path="/biography/view-all/:type" element={<ViewAll />} />

          {/* Biography details with category/type */}
          <Route
            path="/biography/:type/:slug"
            element={<Biographydetails />}
          />

          {/* Biography details without category/type */}
          <Route path="/biography/:slug" element={<Biographydetails />} />

          <Route path="/search" element={<SearchResults />} />

          {/* Must stay last: catches every unknown URL */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>

      {!isAdminPage && <Watsapp />}

      {!isAdminPage && !isBiographyDetailsPage && !isArticleReadPage && (
        <Footer />
      )}
    </div>
  );
}

export default function App() {
  const [showPreloader, setShowPreloader] = useState(true);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setShowPreloader(false);
    }, 1000);

    return () => window.clearTimeout(timer);
  }, []);

  return (
    <>
      {showPreloader && <Preloader />}

      <Router>
        <AppContent />
      </Router>
    </>
  );
}