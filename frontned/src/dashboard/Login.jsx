import React, { useState } from "react";
import { LayoutDashboard, Mail, Lock, KeyRound, User } from "lucide-react";
import { API, TOKEN_KEY } from "./config";
import { GlobalStyle, inputClass } from "./ui";

function AuthInput({ icon: Icon, ...props }) {
  return (
    <div className="relative">
      <Icon className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-orange-400" />
      <input {...props} className={`${inputClass} pl-10`} />
    </div>
  );
}


export default function Login({ mode, onAuth }) {
  const isRegister = mode === "register";
  const [form, setForm] = useState({ name: "", email: "", password: "", secretKey: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const submit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const body = isRegister ? form : { email: form.email, password: form.password };
      const res = await fetch(`${API}/auth/${mode}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Kuch galat ho gaya.");
      } else {
        localStorage.setItem(TOKEN_KEY, data.token);
        if (isRegister) window.location.assign("/admin");
        else onAuth(data.admin);
      }
    } catch (err) {
      setError("Server se connect nahi ho paya.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-orange-100 via-amber-50 to-yellow-100 px-4 py-10">
      <GlobalStyle />
      <div className="w-full max-w-md overflow-hidden rounded-2xl border border-orange-200 bg-white shadow-xl shadow-orange-200/50">
        <div className="bg-gradient-to-r from-orange-400 to-amber-400 px-8 py-8 text-center text-white">
          <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-white/25">
            <LayoutDashboard className="h-7 w-7" />
          </span>
          <h1 className="mt-4 text-2xl font-bold">{isRegister ? "Create Admin Account" : "Admin Login"}</h1>
          <p className="mt-1 text-sm text-white/90">
            {isRegister ? "Naya admin account banao" : "Apne account me login karo"}
          </p>
        </div>

        <div className="p-8">
          <form onSubmit={submit} className="space-y-4" autoComplete="off">
            {isRegister && (
              <AuthInput icon={User} name="name" value={form.name} onChange={handleChange}
                placeholder="Full name" required />
            )}
            <AuthInput icon={Mail} type="email" name="email" value={form.email} onChange={handleChange}
              placeholder="Email address" required />
            <AuthInput icon={Lock} type="password" name="password" value={form.password} onChange={handleChange}
              placeholder="Password" autoComplete={isRegister ? "new-password" : "current-password"} required />
            {isRegister && (
              <AuthInput icon={KeyRound} type="password" name="secretKey" value={form.secretKey}
                onChange={handleChange} placeholder="Admin secret key" autoComplete="new-password" required />
            )}

            {error && (
              <p className="rounded-lg bg-rose-50 px-3 py-2 text-sm font-medium text-rose-600">{error}</p>
            )}

            <button type="submit" disabled={loading}
              className="w-full rounded-lg bg-gradient-to-r from-orange-500 to-amber-500 py-3 text-sm font-bold text-white shadow-md shadow-orange-300/50 transition hover:from-orange-600 hover:to-amber-600 disabled:opacity-60">
              {loading ? "Please wait..." : isRegister ? "Create Account" : "Login"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
