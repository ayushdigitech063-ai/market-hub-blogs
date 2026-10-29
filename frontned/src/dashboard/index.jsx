import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { API, TOKEN_KEY, authFetch } from "./config";
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

  /* -------------------------------------------------
     Keep the URL in sync with the login state
     - logged in  + on login page      -> /admin/dashboard
     - logged out + not on login page  -> /admin/login
  ------------------------------------------------- */
  useEffect(() => {
    if (checking) return;

    const onLoginPage = pathname.replace(/\/+$/, "") === LOGIN_PATH;

    if (admin && onLoginPage) {
      navigate(DASHBOARD_PATH, { replace: true });
    } else if (!admin && !onLoginPage) {
      navigate(LOGIN_PATH, { replace: true });
    }
  }, [admin, checking, pathname, navigate]);

  /* -------------------------------------------------
     Verify the saved token when the page opens
  ------------------------------------------------- */
  useEffect(() => {
    let isMounted = true;
    const controller = new AbortController();

    // Triggered by authFetch when the token is rejected (401)
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

  /* -------------------------------------------------
     Close the logout popup with the Escape key
  ------------------------------------------------- */
  useEffect(() => {
    if (!confirmLogout) return;

    const onKeyDown = (event) => {
      if (event.key === "Escape") setConfirmLogout(false);
    };

    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [confirmLogout]);

  /* -------------------------------------------------
     Logout: first ask, then log out
  ------------------------------------------------- */
  const requestLogout = () => setConfirmLogout(true);

  const confirmAndLogout = () => {
    localStorage.removeItem(TOKEN_KEY);
    setConfirmLogout(false);
    setAdmin(null); // the effect above then moves the URL to /admin/login
  };

  /* -------------------------------------------------
     Render
  ------------------------------------------------- */
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

      {confirmLogout && admin && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/40 p-4 backdrop-blur-[2px]"
          role="dialog"
          aria-modal="true"
          aria-labelledby="logout-title"
          onClick={() => setConfirmLogout(false)}
        >
          <div
            className="w-full max-w-sm rounded-2xl border border-orange-100 bg-white p-6 shadow-2xl"
            onClick={(event) => event.stopPropagation()}
          >
            <h2 id="logout-title" className="text-base font-bold text-slate-900">
              Logout?
            </h2>

            <p className="mt-2 text-sm text-slate-600">
              Are you sure you want to logout,{" "}
              <span className="font-semibold text-slate-900">
                {admin.name || "Admin"}
              </span>
              ?
            </p>

            <div className="mt-5 flex justify-end gap-2.5">
              <button
                type="button"
                onClick={() => setConfirmLogout(false)}
                className="rounded-lg border border-orange-200 bg-white px-4 py-2 text-xs font-semibold text-slate-600 transition hover:bg-orange-50"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={confirmAndLogout}
                autoFocus
                className="rounded-lg bg-rose-600 px-4 py-2 text-xs font-semibold text-white transition hover:bg-rose-700"
              >
                Yes, Logout
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}