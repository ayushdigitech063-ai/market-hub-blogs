
import React, { useState } from "react";
import {
  Mail,
  Lock,
  ShieldCheck,
  ArrowRight,
  Eye,
  EyeOff,
} from "lucide-react";
import { API, TOKEN_KEY } from "./config";
import { GlobalStyle, inputClass } from "./ui";

function AuthInput({ icon: Icon, error, type, ...props }) {
  const isPassword = type === "password";
  const [show, setShow] = useState(false);

  return (
    <div>
      <div className="relative">
        <Icon
          className={`pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 ${
            error ? "text-rose-400" : "text-orange-500"
          }`}
        />

        <input
          {...props}
          type={isPassword && show ? "text" : type}
          className={`${inputClass} !bg-white pl-11 ${
            isPassword ? "pr-11" : ""
          } ${
            error
              ? "!border-rose-400 !ring-rose-100"
              : "!border-white/70"
          }`}
        />

        {isPassword && (
          <button
            type="button"
            onClick={() => setShow((s) => !s)}
            aria-label={show ? "Hide password" : "Show password"}
            className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 transition hover:text-slate-600"
          >
            {show ? (
              <EyeOff className="h-4 w-4" />
            ) : (
              <Eye className="h-4 w-4" />
            )}
          </button>
        )}
      </div>

      {error && (
        <p className="mt-1.5 px-1 text-xs font-medium text-rose-600">
          {error}
        </p>
      )}
    </div>
  );
}

export default function Login({ onAuth }) {
  const [form, setForm] = useState({
    email: "",
    password: "",
  });

  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));

    if (fieldErrors[name]) {
      setFieldErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }

    if (error) {
      setError("");
    }
  };

  const showError = (msg) => {
    const text = msg || "Something went wrong.";
    const message = text.toLowerCase();

    const hasEmail = message.includes("email");
    const hasPassword = message.includes("password");

    if (hasEmail && !hasPassword) {
      setFieldErrors({ email: text });
    } else if (hasPassword && !hasEmail) {
      setFieldErrors({ password: text });
    } else {
      setError(text);
    }
  };

  const submit = async (e) => {
    e.preventDefault();

    setError("");
    setFieldErrors({});
    setLoading(true);

    try {
      const res = await fetch(`${API}/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: form.email,
          password: form.password,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        showError(data.error);
        return;
      }

      if (!data.token) {
        setError("Login response did not include an authentication token.");
        return;
      }

      localStorage.setItem(TOKEN_KEY, data.token);

      if (typeof onAuth === "function") {
        onAuth(data.admin);
      }
    } catch (err) {
      setError("Unable to connect to the server.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-gradient-to-br from-orange-200 via-amber-100 to-stone-300 px-4 py-10">
      <GlobalStyle />

      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 scale-105 bg-cover bg-center blur-[3px]"
        style={{ backgroundImage: "url('/bg.png')" }}
      />

      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-gradient-to-br from-orange-900/10 via-transparent to-amber-200/20"
      />

      <div className="relative w-full max-w-sm">
        <div className="rounded-[28px] border border-white/60 bg-white/35 px-8 pb-7 pt-8 text-center shadow-2xl shadow-orange-900/20 backdrop-blur-xl sm:px-9">
          <img
            src="/logo.png"
            alt="Market Hub"
            className="mx-auto block h-12 w-auto max-w-[200px] object-contain"
          />

          <h1 className="!mb-0 mt-6 text-2xl font-bold text-slate-800">
            Admin Login
          </h1>

          <p className="mt-1.5 text-sm text-slate-600">
            Access your blog dashboard
          </p>

          <form
            onSubmit={submit}
            className="mt-6 space-y-3.5 text-left"
            autoComplete="on"
          >
            <AuthInput
              icon={Mail}
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              placeholder="Email address"
              error={fieldErrors.email}
              autoComplete="username"
              required
            />

            <AuthInput
              icon={Lock}
              type="password"
              name="password"
              value={form.password}
              onChange={handleChange}
              placeholder="Password"
              error={fieldErrors.password}
              autoComplete="current-password"
              required
            />

            {error && (
              <p
                role="alert"
                className="rounded-lg bg-rose-50 px-3 py-2 text-sm font-medium text-rose-600"
              >
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="group flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-orange-600 to-orange-500 py-3.5 text-sm font-bold text-white shadow-lg shadow-orange-400/50 transition hover:from-orange-700 hover:to-orange-600 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? "Please wait..." : "Login"}

              {!loading && (
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              )}
            </button>
          </form>

          <div className="my-5 flex items-center gap-3 text-xs text-slate-500">
            <span className="h-px flex-1 bg-white/70" />
            <span>Secure Access</span>
            <span className="h-px flex-1 bg-white/70" />
          </div>

          <div className="flex items-center justify-center gap-2 rounded-xl bg-white/50 py-2.5 text-xs font-semibold text-slate-600">
            <ShieldCheck className="h-4 w-4 text-orange-500" />
            Secure admin access only
          </div>
        </div>
      </div>
    </div>
  );
}
