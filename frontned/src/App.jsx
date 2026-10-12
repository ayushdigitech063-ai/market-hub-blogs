import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  useLocation,
  matchPath,
} from "react-router-dom";
import LatestArticleDetail from "./pages/latest-article/[slug]";
import ScrollToTop from "./components/ScrollToTop";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import SlidingCompanyDetail from "./pages/sliding-company/[slug]";
import AdminDashboard from "./pages/AdminDashboard";
import CompanyDetail from "./pages/company/[slug]";
import Watsapp from "./components/Watsapp";
import Home from "./pages/Home";
import ArticleDetail from "./pages/ArticleDetail";
import BrandDetail from "./pages/brand/[slug]";
import Companies from "./pages/Companies";
import SearchResults from "./pages/SearchResults";
import About from "./pages/company/About/page";

import Biography from "./Biography Page/Biography";
import Biographydetails from "./Biography Page/Biographydetails";
import ViewAll from "./Biography Page/ViewAll";
import Newsletter from "./components/Newsletter";
import ArticlesPage from "./pages/ArticlesPage";
import ArticleReadPage from "./pages/ArticleReadPage";
import AuthorPage from "./pages/AuthorPage";

function AppContent() {
  const { pathname } = useLocation();

  // Biography details page check
  const isBiographyDetailsPage =
    !!matchPath("/biography/:type/:slug", pathname) &&
    !pathname.startsWith("/biography/view-all/");

  // Article Read Page check
  const isArticleReadPage = !!matchPath("/articles/:slug", pathname);

  // Admin page check
  const isAdminPage = pathname === "/admin";

  // Check if Newsletter should show ONLY on main listing/landing pages
  const isMainArticlesPage = pathname === "/articles";
  const isMainCompaniesPage = pathname === "/companies";
  const isMainBiographyPage = pathname === "/biography" || pathname === "/biography/ceo";
  const isHomePage = pathname === "/";
  const isAboutPage = pathname === "/about";

  const showNewsletter =
    isHomePage ||
    isMainArticlesPage ||
    isMainCompaniesPage ||
    isMainBiographyPage ||
    isAboutPage;

  return (
    <div className="flex min-h-screen flex-col bg-gray-55">

      <ScrollToTop />

      {/* Navbar */}
      {!isAdminPage && <Navbar />}

      <main className="flex-grow">
        <Routes>

          {/* HOME */}
          <Route path="/" element={<Home />} />

          {/* ARTICLES */}
          <Route path="/articles" element={<ArticlesPage />} />
          <Route path="/articles/:slug" element={<ArticleReadPage />} />

          {/* AUTHORS */}
          <Route path="/authors" element={<AuthorPage />} />
          <Route path="/author/:authorId" element={<AuthorPage />} />
          <Route path="/latest-article/:slug" element={<LatestArticleDetail />} />

          {/* CATEGORIES */}
          <Route
            path="/categories"
            element={
              <div className="p-8 text-center text-xl font-semibold">
                Categories Page
              </div>
            }
          />

          {/* ABOUT */}
          <Route path="/about" element={<About />} />

          {/* ARTICLE / BRAND / COMPANY */}
          <Route path="/article/:id" element={<ArticleDetail />} />
          <Route path="/brand/:slug" element={<BrandDetail />} />
          <Route path="/company/:slug" element={<CompanyDetail />} />
          <Route path="/companies" element={<Companies />} />

          {/* ADMIN */}
          <Route path="/admin" element={<AdminDashboard />} />

          {/* BIOGRAPHY */}
          <Route path="/biography" element={<Biography />} />
          <Route path="/biography/ceo" element={<Biography />} />

          {/* VIEW ALL */}
          <Route
            path="/biography/view-all/:type"
            element={<ViewAll />}
          />
          <Route path="/sliding-company/:slug" element={<SlidingCompanyDetail />} />
          <Route path="/search" element={<SearchResults />} />

          {/* BIOGRAPHY DETAILS */}
          <Route
            path="/biography/:type/:slug"
            element={<Biographydetails />}
          />

        </Routes>
      </main>

      {/* Newsletter - Sirf Main Pages par dekhashe, Detail Pages par nahi */}
      {showNewsletter && <Newsletter />}
{!isAdminPage && <Watsapp />}
      {/* Footer */}
      {!isAdminPage && !isBiographyDetailsPage && !isArticleReadPage && <Footer />}


    </div>
  );
}

export default function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  );
}