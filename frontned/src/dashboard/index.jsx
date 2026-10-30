import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { API, TOKEN_KEY, authFetch } from "./config";
import { confirmAction } from "../utils/alerts";
import { showSuccess } from "../utils/toast";
import Login from "./Login";
import Dashboard from "./Dashboard";

const LOGIN_PATH = "/admin/login";
const DASHBOARD_PATH = "/admin/dashboard";

export default function AdminDashboard() {
  const [admin, setAdmin] = useState(null);
  const [checking, setChecking] = useState(true);
  const [confirmLogout, setConfirmLogout] = useState(false);

  const navigate = useNavigate();
  const { pathname } = useLocation();

  useEffect(() => {
    if (checking) return;

    const onLoginPage = pathname.replace(/\/+$/, "") === LOGIN_PATH;

    if (admin && onLoginPage) {
      navigate(DASHBOARD_PATH, { replace: true });
    } else if (!admin && !onLoginPage) {
      navigate(LOGIN_PATH, { replace: true });
    }
  }, [admin, checking, pathname, navigate]);


  useEffect(() => {
    let isMounted = true;
    const controller = new AbortController();


    const onForcedLogout = () => {
      localStorage.removeItem(TOKEN_KEY);

      if (isMounted) {
        setConfirmLogout(false);
        setAdmin(null);
        setChecking(false);
      }
    };

    window.addEventListener("admin-logout", onForcedLogout);

    const verifyAdmin = async () => {
      const token = localStorage.getItem(TOKEN_KEY);

      if (!token) {
        if (isMounted) setChecking(false);
        return;
      }

      try {
        const response = await authFetch(`${API}/auth/me`, {
          signal: controller.signal,
        });

        if (!response.ok) {
          if (response.status === 401 || response.status === 403) {
            localStorage.removeItem(TOKEN_KEY);
          }

          if (isMounted) setAdmin(null);
          return;
        }

        const data = await response.json();

        if (isMounted) {
          if (data?.admin) {
            setAdmin(data.admin);
          } else {
            localStorage.removeItem(TOKEN_KEY);
            setAdmin(null);
          }
        }
      } catch (error) {
        if (error.name !== "AbortError") {
          console.error("Admin authentication check failed:", error);
          if (isMounted) setAdmin(null);
        }
      } finally {
        if (isMounted) setChecking(false);
      }
    };

    verifyAdmin();

    return () => {
      isMounted = false;
      controller.abort();
      window.removeEventListener("admin-logout", onForcedLogout);
    };
  }, []);


  useEffect(() => {
    if (!confirmLogout) return;

    const onKeyDown = (event) => {
      if (event.key === "Escape") setConfirmLogout(false);
    };

    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [confirmLogout]);

const requestLogout = async () => {
  const confirmed = await confirmAction({
    title: "Logout?",
    text: `Are you sure you want to logout, ${admin?.name || "Admin"}?`,
    confirmButtonText: "Yes, Logout",
    cancelButtonText: "Cancel",
    icon: "warning",
  });

  if (!confirmed) return;

  localStorage.removeItem(TOKEN_KEY);
  setAdmin(null);

  showSuccess("Logged out successfully.");
};

if (checking) {
  return (
    <div
      className="flex min-h-screen items-center justify-center bg-orange-50 text-sm font-semibold text-orange-600"
      role="status"
      aria-live="polite"
    >
      Loading...
    </div>
  );
}

return (
  <>
    {admin ? (
      <Dashboard admin={admin} onLogout={requestLogout} />
    ) : (
      <Login onAuth={setAdmin} />
    )}
  </>
);
}