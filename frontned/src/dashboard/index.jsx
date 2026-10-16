import React, { useState, useEffect } from "react";
import { API, TOKEN_KEY, authFetch } from "./config";
import Login from "./Login";
import Dashboard from "./Dashboard";


export default function AdminDashboard() {
  const [admin, setAdmin] = useState(null);
  const [checking, setChecking] = useState(true);

  const logout = () => {
    localStorage.removeItem(TOKEN_KEY);
    setAdmin(null);
  };

  useEffect(() => {
    const onForcedLogout = () => setAdmin(null);
    window.addEventListener("admin-logout", onForcedLogout);

    const token = localStorage.getItem(TOKEN_KEY);
    if (!token) {
      setChecking(false);
    } else {
      authFetch(`${API}/auth/me`)
        .then((r) => (r.ok ? r.json() : null))
        .then((d) => d && setAdmin(d.admin))
        .catch(() => {})
        .finally(() => setChecking(false));
    }
    return () => window.removeEventListener("admin-logout", onForcedLogout);
  }, []);

  const isRegisterPage = window.location.pathname.replace(/\/+$/, "") === "/admin/register";
  if (isRegisterPage) return <Login mode="register" onAuth={setAdmin} />;

  if (checking) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-orange-50 text-sm font-semibold text-orange-600">
        Loading...
      </div>
    );
  }

  return admin ? <Dashboard admin={admin} onLogout={logout} /> : <Login mode="login" onAuth={setAdmin} />;
}
