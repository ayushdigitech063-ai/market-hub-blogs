import React from "react";
import { Link } from "react-router-dom";
import { ArrowRight, MapPin, Globe2 } from "lucide-react";
import footerBg from "../../public/footer.png"; 

const quickLinks = [
  { label: "Home", to: "/" },
  { label: "Latest Articles", to: "/articles" },
  { label: "Companies", to: "/companies" },
  { label: "Authors", to: "/articles" },
  { label: "Biography", to: "/Biography" },
  { label: "About", to: "/about" },
];

const categories = [
  "SEO & Search Visibility",
  "Digital Marketing",
  "Social Media",
  "Artificial Intelligence",
  "Content Marketing",
  "Business & Technology",
];

const socialLinks = [
  {
    label: "Facebook",
    href: "#",
    icon: (
      <svg viewBox="0 0 24 24" className="h-3.5 w-3.5 fill-current">
        <path d="M24 12.073C24 5.446 18.627.073 12 .073S0 5.446 0 12.073c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
      </svg>
    ),
  },
  {
    label: "Twitter / X",
    href: "#",
    icon: (
      <svg viewBox="0 0 24 24" className="h-3.5 w-3.5 fill-current">
        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
      </svg>
    ),
  },
  {
    label: "LinkedIn",
    href: "#",
    icon: (
      <svg viewBox="0 0 24 24" className="h-3.5 w-3.5 fill-current">
        <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.35V9h3.414v1.561h.049c.476-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 1 1 0-4.124 2.062 2.062 0 0 1 0 4.124zM7.119 20.452H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
      </svg>
    ),
  },
  {
    label: "YouTube",
    href: "#",
    icon: (
      <svg viewBox="0 0 24 24" className="h-3.5 w-3.5 fill-current">
        <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
      </svg>
    ),
  },
];

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer
      className="relative border-t border-amber-500/20 bg-cover bg-center bg-no-repeat text-slate-300"
      style={{ backgroundImage: `url(${footerBg})` }}
    >
      <div className="mx-auto max-w-[1400px] px-5 sm:px-8 lg:px-10">

 
        <div className="grid grid-cols-1 gap-7 py-8 sm:grid-cols-2 lg:grid-cols-4 lg:gap-8 lg:py-10">


          <div>
            <Link
              to="/"
              aria-label="Market Digital Insights home"
              className="inline-flex"
            >
            
            </Link>

            <p className="mt-3 max-w-xs text-[13px] leading-5 text-slate-300/90">
              Your destination for digital marketing knowledge, company
              insights, technology trends and business stories.
            </p>

            <div className="mt-4 flex items-center gap-2">
              {socialLinks.map((social) => (
                <a
                  key={social.label}
                  href={social.href}
                  aria-label={social.label}
                  title={social.label}
                  className="flex h-8 w-8 items-center justify-center rounded-lg border border-amber-400/30 bg-slate-900/60 text-amber-300 backdrop-blur-sm transition duration-200 hover:border-amber-400 hover:bg-amber-400 hover:text-slate-950"
                >
                  {social.icon}
                </a>
              ))}
            </div>
          </div>


          <div>
            <h3 className="text-sm font-bold tracking-wide text-amber-200">
              Quick Links
            </h3>

            <div className="mb-3 mt-2 h-0.5 w-7 rounded-full bg-gradient-to-r from-amber-400 to-amber-600" />

            <ul className="space-y-2">
              {quickLinks.map((item) => (
                <li key={item.label}>
                  <Link
                    to={item.to}
                    className="group inline-flex items-center gap-1.5 text-[13px] leading-5 text-slate-300 transition-colors hover:text-amber-300"
                  >
                    <ArrowRight
                      size={12}
                      className="shrink-0 text-amber-400 opacity-0 transition-all group-hover:translate-x-0.5 group-hover:opacity-100"
                    />
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

  
          <div>
            <h3 className="text-sm font-bold tracking-wide text-amber-200">
              Explore Topics
            </h3>

            <div className="mb-3 mt-2 h-0.5 w-7 rounded-full bg-gradient-to-r from-amber-400 to-amber-600" />

            <ul className="space-y-2">
              {categories.map((category) => (
                <li key={category}>
                  <span className="inline-flex items-start gap-2 text-[13px] leading-5 text-slate-300 transition-colors hover:text-amber-300 cursor-pointer">
                    <span className="mt-[7px] h-1.5 w-1.5 shrink-0 rounded-full bg-amber-400" />
                    {category}
                  </span>
                </li>
              ))}
            </ul>
          </div>

   
          <div>
            <h3 className="text-sm font-bold tracking-wide text-amber-200">
              About Us
            </h3>

            <div className="mb-3 mt-2 h-0.5 w-7 rounded-full bg-gradient-to-r from-amber-400 to-amber-600" />

            <p className="text-[13px] leading-5 text-slate-300/90">
              Discover company profiles, expert perspectives, biographies
              and practical knowledge about the digital world.
            </p>

            <div className="mt-3 flex items-start gap-2.5">
              <MapPin
                size={16}
                className="mt-0.5 shrink-0 text-amber-400"
              />
              <p className="text-[13px] leading-5 text-slate-300/90">
                Marketing, technology and business insights in one place.
              </p>
            </div>

            <div className="mt-3 flex items-center gap-2 text-[13px] font-semibold text-amber-300">
              <Globe2 size={15} />
              <span>Explore. Learn. Grow.</span>
            </div>
          </div>

        </div>


        <div className="flex flex-col gap-2 border-t border-amber-400/20 py-4 text-[11px] leading-5 text-slate-400 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-center sm:text-left">
            © {year} Market Digital Insights. All rights reserved.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-1">
            <Link
              to="/privacy-policy"
              className="transition-colors hover:text-amber-300"
            >
              Privacy Policy
            </Link>

            <Link
              to="/terms"
              className="transition-colors hover:text-amber-300"
            >
              Terms & Conditions
            </Link>

            <Link
              to="/sitemap"
              className="transition-colors hover:text-amber-300"
            >
              Sitemap
            </Link>
          </div>
        </div>

      </div>
    </footer>
  );
}