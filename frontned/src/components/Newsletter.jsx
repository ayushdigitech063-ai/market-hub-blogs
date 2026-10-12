import React, { useState } from "react";
import { ArrowRight, Mail, Sparkles, CheckCircle2 } from "lucide-react";

export default function Newsletter() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const handleSubscribe = (e) => {
    e.preventDefault();
    setError("");
    setSuccessMessage("");

    // Simple Email Validation Regex
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!email.trim()) {
      setError("Please enter your email address.");
      return;
    }

    if (!emailRegex.test(email)) {
      setError("Please enter a valid email address.");
      return;
    }

    // Agar validation pass ho jaye
    setSuccessMessage("Your request has been sent successfully. Our team will connect with you.");
    setEmail(""); // Input clear karne ke liye
  };

  return (
    <section className="bg-[#fffdf8] px-4 py-7 sm:px-6 sm:py-9 lg:px-8 lg:py-10">
      <div className="relative mx-auto max-w-7xl overflow-hidden rounded-[28px] border border-[#ead9b8] bg-gradient-to-br from-[#fffaf0] via-white to-[#f8efdc] shadow-[0_12px_35px_rgba(142,105,43,0.08)]">

        {/* Decorative curved background */}
        <div className="pointer-events-none absolute -right-16 -top-24 h-64 w-64 rounded-full border-[28px] border-[#d6b477]/10" />
        <div className="pointer-events-none absolute -bottom-24 right-[28%] h-48 w-48 rounded-full bg-[#d6b477]/10 blur-3xl" />

        {/* Thin golden accent */}
        <div className="absolute left-0 top-0 h-1 w-full bg-gradient-to-r from-[#c29a53] via-[#ead5a7] to-[#b58a43]" />

        <div className="relative grid items-center gap-7 px-5 py-8 sm:px-8 sm:py-10 lg:grid-cols-2 lg:gap-12 lg:px-12 lg:py-11">

          {/* Left content */}
          <div>
            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-[#e8d4ad] bg-white/80 px-3.5 py-1.5 text-[11px] font-bold uppercase tracking-[0.16em] text-[#a67c35]">
              <Sparkles size={14} />
              Stay Informed
            </div>

            <h2 className="max-w-xl text-2xl font-bold leading-[1.2] tracking-tight text-[#263249] sm:text-3xl lg:text-[38px]">
              Ideas that inspire your{" "}
              <span className="text-[#b58a43]">
                digital journey.
              </span>
            </h2>

            <p className="mt-3 max-w-lg text-sm leading-6 text-[#6c7585] sm:text-[15px] sm:leading-7">
              Explore marketing insights, company stories, technology
              trends and inspiring biographies — all in one place.
            </p>

            <div className="mt-5 flex items-center gap-2 text-xs font-medium text-[#a67c35] sm:text-sm">
              <span className="h-px w-7 bg-[#c5a264]" />
              Explore. Learn. Grow.
            </div>
          </div>

          {/* Right newsletter form */}
          <div className="rounded-[22px] border border-[#eadfc9] bg-white/85 p-4 shadow-[0_8px_24px_rgba(120,87,35,0.05)] sm:p-6">

            <div className="mb-4 flex items-center gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#f7edd9] text-[#a67c35]">
                <Mail size={19} />
              </div>

              <div>
                <h3 className="text-sm font-bold text-[#263249] sm:text-base">
                  Subscribe to our newsletter
                </h3>
                <p className="mt-1 text-xs text-[#8991a0]">
                  Fresh insights, delivered to your inbox.
                </p>
              </div>
            </div>

            <form onSubmit={handleSubscribe}>
              <label
                htmlFor="newsletter-email"
                className="mb-2 block text-xs font-semibold text-[#536078]"
              >
                Your email address
              </label>

              <div className="flex flex-col gap-2.5 sm:flex-row">
                <div className="flex min-w-0 flex-1 items-center gap-2.5 rounded-xl border border-[#e8dcc5] bg-[#fffdf9] px-3.5 transition duration-300 focus-within:border-[#b58a43] focus-within:ring-2 focus-within:ring-[#b58a43]/10">
                  <Mail size={16} className="shrink-0 text-[#b58a43]" />

                  <input
                    id="newsletter-email"
                    type="email"
                    name="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your email"
                    autoComplete="email"
                    className="w-full min-w-0 bg-transparent py-3 text-sm text-[#263249] outline-none placeholder:text-[#a0a6b1]"
                  />
                </div>

                <button
                  type="submit"
                  className="group inline-flex shrink-0 items-center justify-center gap-2 rounded-xl bg-[#b58a43] px-5 py-3 text-sm font-semibold text-white shadow-sm transition duration-300 hover:-translate-y-0.5 hover:bg-[#9d7536] hover:shadow-md focus:outline-none focus:ring-2 focus:ring-[#b58a43]/40 focus:ring-offset-2"
                >
                  Subscribe
                  <ArrowRight
                    size={16}
                    className="transition-transform duration-300 group-hover:translate-x-1"
                  />
                </button>
              </div>

              {/* Error Message */}
              {error && (
                <p className="mt-2 text-xs font-medium text-red-600">
                  {error}
                </p>
              )}

              {/* Success Message (Green) */}
              {successMessage && (
                <div className="mt-3 flex items-center gap-2 rounded-lg bg-green-50 p-2.5 text-xs font-medium text-green-700 border border-green-200">
                  <CheckCircle2 size={16} className="shrink-0 text-green-600" />
                  <span>{successMessage}</span>
                </div>
              )}

              <p className="mt-3 text-[11px] leading-5 text-[#8991a0] sm:text-xs">
                Useful updates only. No unnecessary inbox clutter.
              </p>
            </form>
          </div>

        </div>
      </div>
    </section>
  );
}