import React, { useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";
import { API } from "../dashboard/config";
import { uniqueOptions } from "../dashboard/fields";
import { inputClass } from "../dashboard/ui";
import PostEditor from "../dashboard/editor/PostEditor";
import { emptyPost } from "../dashboard/postConfigs";
import { BLOG_TYPES } from "../dashboard/UnifiedBlogs";
import { buildConfigs } from "../dashboard/submissionConfigs";
import { toLocalInput } from "../dashboard/seo/seoUtils";

const STORAGE_KEY = "blogSubmissionIds";


const baseConfigs = buildConfigs();


const strip = (cfg) => ({
  ...cfg,
  extraFields: cfg.extraFields.filter((f) => f.name !== "id" && f.name !== "authorId"),
});

// UnifiedBlogs wala hi logic: type badalne par title, content, SEO carry ho jate hain
const newForm = (cfg, prev) => {
  const base = {
    ...emptyPost,
    ...cfg.extraDefaults,
    status: "published",
    publishDate: toLocalInput(),
    seo: { ...emptyPost.seo },
  };
  if (!prev) return base;
  const carry = {};
  Object.keys(emptyPost).forEach((k) => {
    if (k !== "category" && k !== "seo") carry[k] = prev[k];
  });
  return { ...base, ...carry, seo: prev.seo || base.seo };
};

const readIds = () => {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
  } catch {
    return [];
  }
};

export default function SubmitBlogModal({ onClose }) {
  const [activeType, setActiveType] = useState(BLOG_TYPES[0].key);
  const [form, setForm] = useState(() => newForm(baseConfigs[BLOG_TYPES[0].key]));
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [address, setAddress] = useState("");
  const [showDetails, setShowDetails] = useState(false);
  const [detailsError, setDetailsError] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [otp, setOtp] = useState("");
  const [verified, setVerified] = useState(false);
  const [otpBusy, setOtpBusy] = useState(false);
  const [otpMsg, setOtpMsg] = useState({ type: "", text: "" });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);
  const [existing, setExisting] = useState([]);
  const [companies, setCompanies] = useState([]);
  const overlayRef = useRef(null);
  const editorRef = useRef(null);

  // PostEditor ke upar wala Submit button chhupao, niche wala button use hoga
  useEffect(() => {
    const hideTopSubmit = () => {
      editorRef.current?.querySelectorAll("button").forEach((b) => {
        if (b.textContent.trim() === "Submit for Approval") b.style.display = "none";
      });
    };
    hideTopSubmit();
    if (!editorRef.current) return undefined;
    const obs = new MutationObserver(hideTopSubmit);
    obs.observe(editorRef.current, { childList: true, subtree: true, characterData: true });
    return () => obs.disconnect();
  }, [done]);

  const cfg = useMemo(
    () => strip(buildConfigs({ companies })[activeType]),
    [companies, activeType]
  );

  useEffect(() => {
    document.body.style.overflow = "hidden";
    fetch(`${API}/companies`)
      .then((r) => r.json())
      .then((d) => setCompanies(Array.isArray(d) ? d : []))
      .catch(() => {});
    return () => {
      document.body.style.overflow = "";
    };
  }, []);

  // Category dropdown ke options us type ke existing posts se
  useEffect(() => {
    fetch(baseConfigs[activeType].listUrl)
      .then((r) => r.json())
      .then((d) => setExisting(Array.isArray(d) ? d : []))
      .catch(() => setExisting([]));
  }, [activeType]);

  const categories = useMemo(
    () => uniqueOptions(existing.map((i) => i.category)),
    [existing]
  );

  const changeType = (t) => {
    setActiveType(t);
    setForm((prev) => newForm(baseConfigs[t], prev));
  };

  const fail = (msg) => {
    setError(msg);
    overlayRef.current?.scrollTo({ top: 0, behavior: "smooth" });
  };

  const onEmailChange = (value) => {
    setEmail(value);
    setVerified(false);
    setOtpSent(false);
    setOtp("");
    setOtpMsg({ type: "", text: "" });
  };

  const sendOtp = async () => {
    setOtpMsg({ type: "", text: "" });
    if (!/^\S+@\S+\.\S+$/.test(email.trim()))
      return setOtpMsg({ type: "error", text: "Enter a valid email first." });
    setOtpBusy(true);
    try {
      const res = await fetch(`${API}/otp/send`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim() }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) return setOtpMsg({ type: "error", text: data.error || "Could not send OTP." });
      setOtpSent(true);
      setOtp("");
      setOtpMsg({ type: "ok", text: "OTP sent to your email." });
    } catch {
      setOtpMsg({ type: "error", text: "Could not connect to the server." });
    } finally {
      setOtpBusy(false);
    }
  };

  const verifyOtp = async () => {
    setOtpMsg({ type: "", text: "" });
    if (!otp.trim()) return setOtpMsg({ type: "error", text: "Enter the OTP." });
    setOtpBusy(true);
    try {
      const res = await fetch(`${API}/otp/verify`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim(), otp: otp.trim() }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) return setOtpMsg({ type: "error", text: data.error || "Invalid OTP." });
      setVerified(true);
      setOtpMsg({ type: "", text: "" });
    } catch {
      setOtpMsg({ type: "error", text: "Could not connect to the server." });
    } finally {
      setOtpBusy(false);
    }
  };

  // Step 1: blog form check karke details popup kholo
  const openDetails = (e) => {
    e?.preventDefault?.();
    setError("");
    if (!form.category.trim()) return fail("Please select a category.");
    const missing = ["role", "company"].filter(
      (n) => cfg.extraFields.some((f) => f.name === n) && !String(form[n] || "").trim()
    );
    if (missing.length) return fail(`Please fill the required field(s): ${missing.join(", ")}.`);
    if (!form.contentHtml.replace(/<[^>]*>/g, "").trim()) return fail("Please write the blog content.");
    setDetailsError("");
    setShowDetails(true);
  };

  // Step 2: popup se final submit
  const submitAll = async (e) => {
    e?.preventDefault?.();
    setDetailsError("");
    if (!name.trim() || !email.trim() || !address.trim())
      return setDetailsError("Please enter your name, email and address.");
    if (!verified) return setDetailsError("Please verify your email with OTP.");

    setSaving(true);
    const ctrl = new AbortController();
    const timer = setTimeout(() => ctrl.abort(), 30000);
    try {
      const res = await fetch(`${API}/submissions`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, address, postType: activeType, form }),
        signal: ctrl.signal,
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) return setDetailsError(data.error || "Submit failed. Please try again.");

      localStorage.setItem(STORAGE_KEY, JSON.stringify([...readIds(), data.id]));
      window.dispatchEvent(new Event("submission-added"));
      fetch(`${API}/otp/submitted`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim(), name }),
      }).catch(() => {});
      setShowDetails(false);
      setDone(true);
      setTimeout(onClose, 3000);
    } catch (err) {
      setDetailsError(
        err.name === "AbortError"
          ? "The server is taking too long. Please try again."
          : "Could not connect to the server."
      );
    } finally {
      clearTimeout(timer);
      setSaving(false);
    }
  };

  return (
   <div
  ref={overlayRef}
  className="fixed inset-0 z-[100] overflow-y-auto overscroll-contain bg-stone-900/60 p-3 backdrop-blur-sm sm:p-6 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
>
    <div className="relative mx-auto max-w-6xl rounded-3xl bg-orange-50 p-4 shadow-2xl sm:p-6">
        <button
          type="button"
          onClick={onClose}
          aria-label="Close"
          className="absolute right-4 top-4 z-10 flex h-9 w-9 items-center justify-center rounded-full bg-white text-slate-600 shadow transition hover:bg-amber-100"
        >
          <X className="h-4 w-4" />
        </button>

        {done ? (
          <div className="mx-auto my-16 max-w-md rounded-2xl border border-green-200 bg-green-50 p-6 text-center">
            <p className="text-sm font-bold text-green-700">✓ Your blog post is going on processing</p>
            <p className="mt-1 text-xs text-green-700/80">
              You will see an update on the site once the admin reviews it.
            </p>
            <button
              type="button"
              onClick={onClose}
              className="mt-4 rounded-full bg-green-600 px-5 py-2 text-xs font-bold text-white"
            >
              Close
            </button>
          </div>
        ) : (
          <>
            <div className="mb-5 border-b border-orange-200 pb-4 pr-12">
              <p className="text-[11px] font-extrabold uppercase tracking-[0.2em] text-orange-600">
                Share your knowledge
              </p>
              <h2 className="mt-1 text-2xl font-extrabold text-slate-900">Post Your Blog</h2>
              <p className="mt-1 text-sm text-slate-600">
                Create your article and submit it for admin approval before publication.
              </p>
            </div>

            {error && (
              <div className="mb-4 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-xs font-semibold text-rose-700">
                {error}
              </div>
            )}

            <div className="mb-4 flex flex-col gap-3 rounded-xl border border-orange-100 bg-white px-5 py-4 sm:flex-row sm:items-center">
              <div className="sm:w-64">
                <label className="mb-1 block text-xs font-semibold text-slate-600">
                  Post Category <span className="text-orange-500">*</span>
                </label>
                <select value={activeType} onChange={(e) => changeType(e.target.value)} className={inputClass}>
                  {BLOG_TYPES.map((t) => (
                    <option key={t.key} value={t.key}>{t.label}</option>
                  ))}
                </select>
              </div>
              <p className="text-[11px] text-slate-400">
                Select a category; the extra fields below change accordingly. Title, content and SEO stay the same.
              </p>
            </div>

            <div ref={editorRef}>
              <PostEditor
                key={activeType}
                config={cfg}
                form={form}
                setForm={setForm}
                editing={false}
                saving={saving}
                categories={categories}
                onSave={openDetails}
                onCancel={onClose}
                submitLabel="Submit for Approval"
              />
            </div>

            <button
              type="button"
              onClick={openDetails}
              className="mt-5 w-full rounded-xl bg-orange-500 px-6 py-4 text-base font-bold text-white shadow-md transition hover:bg-orange-600"
            >
              Submit for Approval
            </button>
          </>
        )}
      </div>

      {showDetails &&
        !done &&
        createPortal(
          <div className="fixed inset-0 z-[110] flex items-center justify-center overflow-y-auto bg-stone-900/60 p-4 backdrop-blur-sm">
            <form
              onSubmit={submitAll}
              className="relative w-full max-w-md rounded-2xl bg-white p-5 shadow-2xl"
            >
              <button
                type="button"
                onClick={() => !saving && setShowDetails(false)}
                aria-label="Close"
                className="absolute right-3 top-3 flex h-8 w-8 items-center justify-center rounded-full bg-orange-50 text-slate-600 transition hover:bg-amber-100"
              >
                <X className="h-4 w-4" />
              </button>

              <h3 className="pr-10 text-lg font-extrabold text-slate-900">Your Details</h3>
              <p className="mt-1 text-xs text-slate-500">
                Enter your details to submit the blog for admin approval.
              </p>

              {detailsError && (
                <div className="mt-3 rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-xs font-semibold text-rose-700">
                  {detailsError}
                </div>
              )}

              <div className="mt-4 space-y-4">
                <div>
                  <label className="mb-1 block text-xs font-semibold text-slate-600">
                    Your Name <span className="text-orange-500">*</span>
                  </label>
                  <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Enter your name" className={inputClass} />
                </div>

                <div>
                  <label className="mb-1 block text-xs font-semibold text-slate-600">
                    Email Address <span className="text-orange-500">*</span>
                  </label>
                  <input type="email" value={email} onChange={(e) => onEmailChange(e.target.value)} placeholder="Enter your email" className={inputClass} />

                  {verified ? (
                    <p className="mt-2 text-xs font-bold text-green-600">✓ Email verified</p>
                  ) : (
                    <div className="mt-2">
                      <button
                        type="button"
                        onClick={sendOtp}
                        disabled={otpBusy || !email.trim()}
                        className="rounded-full bg-orange-500 px-4 py-1.5 text-xs font-bold text-white transition hover:bg-orange-600 disabled:opacity-50"
                      >
                        {otpBusy && !otpSent ? "Sending..." : otpSent ? "Resend OTP" : "Send OTP"}
                      </button>

                      {otpSent && (
                        <div className="mt-2 flex gap-2">
                          <input
                            value={otp}
                            onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
                            maxLength={6}
                            inputMode="numeric"
                            placeholder="Enter 6-digit OTP"
                            className={inputClass}
                          />
                          <button
                            type="button"
                            onClick={verifyOtp}
                            disabled={otpBusy}
                            className="shrink-0 rounded-full bg-green-600 px-4 py-1.5 text-xs font-bold text-white disabled:opacity-50"
                          >
                            Verify
                          </button>
                        </div>
                      )}

                      {otpMsg.text && (
                        <p className={`mt-1 text-xs font-semibold ${otpMsg.type === "ok" ? "text-green-600" : "text-rose-600"}`}>
                          {otpMsg.text}
                        </p>
                      )}
                    </div>
                  )}
                </div>

                <div>
                  <label className="mb-1 block text-xs font-semibold text-slate-600">
                    Address <span className="text-orange-500">*</span>
                  </label>
                  <input type="text" value={address} onChange={(e) => setAddress(e.target.value)} placeholder="Enter your address" className={inputClass} />
                </div>
              </div>

              <div className="mt-5 flex gap-2">
                <button
                  type="button"
                  onClick={() => setShowDetails(false)}
                  disabled={saving}
                  className="flex-1 rounded-full border border-orange-200 bg-white px-4 py-2 text-xs font-bold text-slate-600 transition hover:bg-orange-50 disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="flex-1 rounded-full bg-orange-500 px-4 py-2 text-xs font-bold text-white transition hover:bg-orange-600 disabled:opacity-50"
                >
                  {saving ? "Submitting..." : "Submit for Approval"}
                </button>
              </div>
            </form>
          </div>,
          document.body
        )}
    </div>
  );
}