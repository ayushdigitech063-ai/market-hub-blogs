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
import AdminDashboard from "./dashboard";
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

import ArticlesPage from "./pages/ArticlesPage";
import ArticleReadPage from "./pages/ArticleReadPage";
import AuthorPage from "./pages/AuthorPage";

function AppContent() {
  const { pathname: rawPathname } = useLocation();


  const pathname =
    rawPathname.length > 1 ? rawPathname.replace(/\/+$/, "") : rawPathname;

  const isAdminPage = pathname === "/admin" || pathname.startsWith("/admin/");

  const isBiographyDetailsPage =
    !!matchPath("/biography/:type/:slug", pathname) &&
    !pathname.startsWith("/biography/view-all/");


  const isArticleReadPage = !!matchPath("/articles/:slug", pathname);


  const isHomePage = pathname === "/";
  const isMainArticlesPage = pathname === "/articles";
  const isMainCompaniesPage = pathname === "/companies";
  const isMainBiographyPage =
    pathname === "/biography" || pathname === "/biography/ceo";
  const isAboutPage = pathname === "/about";

  const showNewsletter =
    !isAdminPage &&
    (isHomePage ||
      isMainArticlesPage ||
      isMainCompaniesPage ||
      isMainBiographyPage ||
      isAboutPage);

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
          <Route
            path="/latest-article/:slug"
            element={<LatestArticleDetail />}
          />

          <Route
            path="/categories"
            element={
              <div className="p-8 text-center text-xl font-semibold">
                Categories Page
              </div>
            }
          />


          <Route path="/about" element={<About />} />

  
          <Route path="/article/:id" element={<ArticleDetail />} />
          <Route path="/brand/:slug" element={<BrandDetail />} />
          <Route path="/company/:slug" element={<CompanyDetail />} />
          <Route path="/companies" element={<Companies />} />


          <Route path="/admin/*" element={<AdminDashboard />} />


          <Route path="/biography" element={<Biography />} />
          <Route path="/biography/ceo" element={<Biography />} />


          <Route path="/biography/view-all/:type" element={<ViewAll />} />
          <Route
            path="/sliding-company/:slug"
            element={<SlidingCompanyDetail />}
          />
          <Route path="/search" element={<SearchResults />} />

          <Route
            path="/biography/:type/:slug"
            element={<Biographydetails />}
          />
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
  return (
    <Router>
      <AppContent />
    </Router>
  );
}