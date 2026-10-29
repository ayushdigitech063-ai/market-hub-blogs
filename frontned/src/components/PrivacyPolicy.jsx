import React, { useEffect } from "react";
import { Link } from "react-router-dom";
import { ShieldCheck, ArrowLeft } from "lucide-react";

const SITE_NAME = "Market Digital Insights";
const LAST_UPDATED = "October 28, 2026";
const HERO_IMAGE =
  "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTz6YsOzP7wfMIpTxuiAhJU8_UX1vs-WHCxmw_fUFgKhg&s=10";

const sections = [
  {
    id: "introduction",
    title: "Introduction",
    content: [
      `Welcome to ${SITE_NAME}. Your privacy is important to us. This Privacy Policy explains what information we collect when you visit our website, how we use it, and the choices you have.`,
      "By using this website, you agree to the practices described in this policy. If you do not agree, please do not use the website.",
    ],
  },
  {
    id: "information-we-collect",
    title: "Information We Collect",
    content: ["We may collect the following types of information:"],
    list: [
      "Information you provide: your name, email address and message when you contact us, submit a form, or subscribe to updates.",
      "Usage information: pages visited, articles read, time spent on pages, and links clicked.",
      "Device information: browser type, operating system, device type, screen size and IP address.",
      "Cookies and similar technologies: small files stored on your device to improve your experience.",
    ],
  },
  {
    id: "how-we-use",
    title: "How We Use Your Information",
    content: ["We use the information we collect to:"],
    list: [
      "Provide, operate and maintain the website.",
      "Improve our articles, company profiles, biographies and overall user experience.",
      "Respond to your questions, requests and feedback.",
      "Send updates or newsletters, only if you have chosen to receive them.",
      "Analyze website traffic and performance.",
      "Detect, prevent and fix technical issues or misuse.",
    ],
  },
  {
    id: "cookies",
    title: "Cookies",
    content: [
      "Cookies help us remember your preferences and understand how visitors use our website. You can control or delete cookies from your browser settings. Disabling cookies may affect how some parts of the website work.",
    ],
  },
  {
    id: "third-party",
    title: "Third-Party Services",
    content: [
      "We may use trusted third-party services such as analytics, hosting and communication tools. These services may collect information as described in their own privacy policies. We do not sell your personal information to third parties.",
    ],
  },
  {
    id: "external-links",
    title: "External Links",
    content: [
      "Our articles and profiles may contain links to other websites. We are not responsible for the content or privacy practices of those websites, and we encourage you to read their privacy policies.",
    ],
  },
  {
    id: "data-security",
    title: "Data Security",
    content: [
      "We take reasonable steps to protect your information from unauthorized access, loss or misuse. However, no method of transmission over the internet or electronic storage is completely secure, so we cannot guarantee absolute security.",
    ],
  },
  {
    id: "data-retention",
    title: "Data Retention",
    content: [
      "We keep your information only for as long as it is needed for the purposes described in this policy, or as required by law.",
    ],
  },
  {
    id: "your-rights",
    title: "Your Rights",
    content: ["Depending on where you live, you may have the right to:"],
    list: [
      "Request access to the personal information we hold about you.",
      "Ask us to correct or update inaccurate information.",
      "Ask us to delete your personal information.",
      "Withdraw your consent or unsubscribe from our communications at any time.",
    ],
  },
  {
    id: "children",
    title: "Children's Privacy",
    content: [
      "Our website is not intended for children under the age of 13. We do not knowingly collect personal information from children. If you believe a child has provided us information, please let us know and we will remove it.",
    ],
  },
  {
    id: "changes",
    title: "Changes to This Policy",
    content: [
      "We may update this Privacy Policy from time to time. Any changes will be posted on this page with a new \"Last updated\" date. Please review this page regularly.",
    ],
  },
];

export default function PrivacyPolicy() {
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  return (
    <main className="bg-[#FFFCF8]">
      {/* Hero */}
      <section className="relative overflow-hidden border-b border-orange-100">
        {/* Banner image */}
        <img
          src={HERO_IMAGE}
          alt=""
          aria-hidden="true"
          className="absolute inset-0 h-full w-full object-cover"
        />

        {/* Dark + orange overlay for readable text */}
        <div
          aria-hidden="true"
          className="absolute inset-0 bg-gradient-to-br from-slate-900/85 via-slate-900/70 to-orange-900/60"
        />

        <div className="relative mx-auto max-w-6xl px-5 py-16 text-center sm:px-8 lg:py-24">
          <span className="mx-auto inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-orange-500 to-rose-500 text-white shadow-lg shadow-orange-900/30">
            <ShieldCheck className="h-7 w-7" />
          </span>

          <h1 className="mt-5 text-white">Privacy Policy</h1>

          <p className="mx-auto mt-3 max-w-2xl text-white/85">
            This page explains how {SITE_NAME} collects, uses and protects
            your information.
          </p>

          <span className="mt-6 inline-flex items-center rounded-full border border-white/30 bg-white/10 px-4 py-1.5 text-xs font-semibold text-white backdrop-blur">
            Last updated: {LAST_UPDATED}
          </span>
        </div>
      </section>

      {/* Body */}
      <section className="mx-auto max-w-6xl px-5 py-10 sm:px-8 lg:py-14">
        <div className="grid gap-8 lg:grid-cols-[260px_minmax(0,1fr)] lg:gap-10">
          {/* Sticky index */}
          <aside className="lg:sticky lg:top-24 lg:self-start">
            <nav
              aria-label="Privacy policy sections"
              className="rounded-2xl border border-orange-100 bg-white p-5 shadow-sm"
            >
              <p className="mb-3 text-xs font-bold uppercase tracking-wider text-orange-500">
                On this page
              </p>

              <ul className="space-y-1">
                {sections.map((s, i) => (
                  <li key={s.id}>
                    <a
                      href={`#${s.id}`}
                      className="flex items-center gap-3 rounded-lg px-2 py-1.5 text-[13px] text-slate-600 transition-colors hover:bg-orange-50 hover:text-orange-600"
                    >
                      <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-md bg-orange-50 text-[10px] font-bold text-orange-600">
                        {i + 1}
                      </span>
                      <span className="leading-snug">{s.title}</span>
                    </a>
                  </li>
                ))}
              </ul>
            </nav>
          </aside>

          {/* Sections */}
          <div className="min-w-0 space-y-5">
            {sections.map((s, i) => (
              <article
                key={s.id}
                id={s.id}
                className="scroll-mt-24 rounded-2xl border border-orange-100 bg-white p-6 shadow-sm transition-shadow hover:shadow-md sm:p-7"
              >
                <div className="mb-4 flex items-center gap-3">
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-orange-500 to-rose-500 text-sm font-bold text-white shadow-sm">
                    {i + 1}
                  </span>
                  <h2 className="!m-0">{s.title}</h2>
                </div>

                <div className="space-y-3">
                  {s.content.map((text, idx) => (
                    <p key={idx}>{text}</p>
                  ))}
                </div>

                {s.list && (
                  <ul className="mt-4 space-y-2.5 rounded-xl bg-orange-50/60 p-4">
                    {s.list.map((item, idx) => (
                      <li key={idx} className="flex items-start gap-3">
                        <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-orange-500" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </article>
            ))}

            <div className="pt-4 text-center">
         
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}