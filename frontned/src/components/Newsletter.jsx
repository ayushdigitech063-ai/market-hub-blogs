
import React, { useState } from "react";
import {
  ArrowRight,
  Mail,
  Sparkles,
  CheckCircle2,
  ShieldCheck,
} from "lucide-react";

export default function Newsletter() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const handleSubscribe = (e) => {
    e.preventDefault();
    setError("");
    setSuccessMessage("");

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!email.trim()) {
      setError("Please enter your email address.");
      return;
    }

    if (!emailRegex.test(email)) {
      setError("Please enter a valid email address.");
      return;
    }

    setSuccessMessage(
      "Your request has been received successfully."
    );
    setEmail("");
  };

  return (
    <section className="bg-[#F4F7FA] px-4 py-10 sm:px-6 sm:py-14 lg:px-8">
      <div className="relative mx-auto max-w-7xl overflow-hidden rounded-[28px] border border-[#D9E5ED] bg-gradient-to-br from-white via-[#F7FBFD] to-[#EAF6F5] shadow-[0_20px_60px_rgba(16,42,67,0.08)]">


        <div className="pointer-events-none absolute -right-20 -top-28 h-72 w-72 rounded-full border-[35px] border-[#0D9488]/[0.06]" />

        <div className="pointer-events-none absolute -bottom-24 left-[28%] h-64 w-64 rounded-full bg-[#5EEAD4]/15 blur-3xl" />

        <div className="pointer-events-none absolute right-[35%] top-0 h-40 w-40 rounded-full bg-blue-200/20 blur-3xl" />

        <div className="absolute left-0 top-0 h-1 w-full bg-gradient-to-r from-[#0F766E] via-[#2DD4BF] to-[#60A5FA]" />

        <div className="relative grid items-center gap-9 px-5 py-9 sm:px-9 sm:py-12 lg:grid-cols-2 lg:gap-14 lg:px-14 lg:py-14">

          <div>
            <div className="mb-5 inline-flex items-center gap-2.5 rounded-full border border-[#B9E4DF] bg-white/80 px-4 py-2 text-[10px] font-bold uppercase tracking-[0.18em] text-[#0F766E] shadow-sm sm:text-xs">
              <Sparkles size={15} />
              Stay Informed
            </div>

            <h2 className="max-w-xl text-3xl font-bold leading-tight tracking-tight text-[#142D4E] sm:text-4xl lg:text-[42px]">
              Ideas that inspire your{" "}
              <span className="bg-gradient-to-r from-[#0F766E] to-[#0891B2] bg-clip-text text-transparent">
                digital journey.
              </span>
            </h2>

            <p className="mt-5 max-w-lg text-sm leading-7 text-[#5E7086] sm:text-base sm:leading-8">
              Explore marketing insights, company stories, technology
              trends and inspiring biographies — all in one place.
            </p>

            <div className="mt-7 flex items-center gap-3">
              <span className="h-px w-9 bg-[#0D9488]" />
              <span className="text-sm font-semibold tracking-wide text-[#0F766E]">
                Explore. Learn. Grow.
              </span>
            </div>

            <div className="mt-7 flex flex-wrap items-center gap-x-5 gap-y-3 text-xs font-medium text-[#718096]">
              <span className="flex items-center gap-2">
                <ShieldCheck size={16} className="text-[#0F9488]" />
                Helpful insights
              </span>

              <span className="flex items-center gap-2">
                <Mail size={15} className="text-[#0F9488]" />
                Updates in your inbox
              </span>
            </div>
          </div>

          <div className="rounded-[24px] border border-white bg-white/90 p-5 shadow-[0_16px_45px_rgba(20,45,78,0.08)] ring-1 ring-[#DCE8EF]/80 backdrop-blur-sm sm:p-7 lg:p-8">


            <div className="mb-6 flex items-center gap-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-[#DDF7F2] to-[#E5F3FF] text-[#0F766E]">
                <Mail size={22} />
              </div>

              <div>
                <h3 className="text-base font-bold tracking-tight text-[#142D4E] sm:text-lg">
                  Subscribe to our newsletter
                </h3>

                <p className="mt-1 text-xs leading-5 text-[#8190A3] sm:text-sm">
                  Fresh insights, delivered to your inbox.
                </p>
              </div>
            </div>

            <form onSubmit={handleSubscribe}>
              <label
                htmlFor="newsletter-email"
                className="mb-2.5 block text-sm font-semibold text-[#344B65]"
              >
                Your email address
              </label>

              <div className="flex flex-col gap-3 sm:flex-row">
                <div className="flex min-w-0 flex-1 items-center gap-3 rounded-xl border border-[#DCE6EE] bg-[#F8FAFC] px-4 transition duration-300 focus-within:border-[#0D9488] focus-within:bg-white focus-within:ring-4 focus-within:ring-[#0D9488]/10">
                  <Mail
                    size={18}
                    className="shrink-0 text-[#0F9488]"
                  />

                  <input
                    id="newsletter-email"
                    type="email"
                    name="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your email"
                    autoComplete="email"
                    className="w-full min-w-0 bg-transparent py-3.5 text-sm text-[#142D4E] outline-none placeholder:text-[#9AA8B8]"
                  />
                </div>

                <button
                  type="submit"
                  className="group inline-flex shrink-0 items-center justify-center gap-2.5 rounded-xl bg-[#0F766E] px-6 py-3.5 text-sm font-semibold text-white shadow-[0_5px_14px_rgba(15,118,110,0.18)] transition duration-300 hover:-translate-y-0.5 hover:bg-[#115E59] hover:shadow-lg focus:outline-none focus:ring-4 focus:ring-[#0D9488]/20"
                >
                  Subscribe

                  <ArrowRight
                    size={17}
                    className="transition-transform duration-300 group-hover:translate-x-1"
                  />
                </button>
              </div>

  
              {error && (
                <p
                  role="alert"
                  className="mt-3 text-xs font-medium text-red-600"
                >
                  {error}
                </p>
              )}

              {successMessage && (
                <div
                  role="status"
                  className="mt-4 flex items-start gap-2.5 rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-xs font-medium leading-5 text-emerald-800"
                >
                  <CheckCircle2
                    size={17}
                    className="mt-0.5 shrink-0 text-emerald-600"
                  />

                  <span>{successMessage}</span>
                </div>
              )}

              <div className="mt-5 flex items-start gap-2 border-t border-[#E9EFF4] pt-4">
                <ShieldCheck
                  size={15}
                  className="mt-0.5 shrink-0 text-[#0F9488]"
                />

                <p className="text-xs leading-5 text-[#8290A1]">
                  Useful updates only. No unnecessary inbox clutter.
                </p>
              </div>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
}
