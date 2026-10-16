
import React, { useMemo, useState } from "react";
import { ChevronDown, ListTree } from "lucide-react";

const slugify = (text) =>
  String(text || "")
    .toLowerCase()
    .trim()
    .replace(/[^\p{L}\p{N}\s-]/gu, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");

function prepare(html) {

  const doc = new DOMParser().parseFromString(
    `<body>${html || ""}</body>`,
    "text/html"
  );

  const usedIds = new Set();
  const toc = [];

  doc.body.querySelectorAll("h2, h3").forEach((heading) => {
    const text = (heading.textContent || "").trim();

    if (!text) return;

    const baseId = slugify(text) || "section";
    let id = baseId;
    let suffix = 2;

    while (usedIds.has(id)) {
      id = `${baseId}-${suffix}`;
      suffix += 1;
    }

    usedIds.add(id);
    heading.id = id;

    toc.push({
      id,
      text,
      level: Number(heading.tagName.slice(1)),
    });
  });

  return {
    html: doc.body.innerHTML,
    toc,
  };
}

const CSS = `
.article-body {
  min-width: 0;
  overflow-wrap: anywhere;
  line-height: 1.8;
  font-size: 1rem;
}
.article-body h2 {
  font-size: 1.6rem;
  font-weight: 700;
  line-height: 1.3;
  margin: 2rem 0 .75rem;
  scroll-margin-top: 100px;
}
.article-body h3 {
  font-size: 1.3rem;
  font-weight: 700;
  line-height: 1.4;
  margin: 1.5rem 0 .5rem;
  scroll-margin-top: 100px;
}
.article-body h4 {
  font-size: 1.1rem;
  font-weight: 700;
  margin: 1.25rem 0 .5rem;
}
.article-body p {
  margin: 0 0 1rem;
}
.article-body ul {
  list-style: disc;
  padding-left: 1.5rem;
  margin: 0 0 1rem;
}
.article-body ol {
  list-style: decimal;
  padding-left: 1.5rem;
  margin: 0 0 1rem;
}
.article-body a {
  color: #047857;
  text-decoration: underline;
  overflow-wrap: anywhere;
}
.article-body img {
  display: block;
  max-width: 100%;
  height: auto;
  border-radius: .75rem;
  margin: 1rem auto;
}
.article-body iframe,
.article-body video {
  max-width: 100%;
}
.article-body blockquote {
  border-left: 4px solid #047857;
  padding-left: 1rem;
  margin: 1rem 0;
  opacity: .9;
  font-style: italic;
}
.article-body table {
  width: 100%;
  border-collapse: collapse;
  margin: 1rem 0;
}
.article-body th,
.article-body td {
  border: 1px solid rgba(128,128,128,.35);
  padding: .5rem .75rem;
  text-align: left;
}
.article-toc {
  border: 1px solid rgba(128,128,128,.3);
  background: rgba(128,128,128,.08);
  border-radius: .75rem;
  padding: 1rem 1.25rem;
  margin: 0 0 1.5rem;
}
.article-toc a {
  text-decoration: none;
  opacity: .9;
}
.article-toc a:hover {
  color: #047857;
  opacity: 1;
}
.article-faq {
  border: 1px solid rgba(128,128,128,.3);
  border-radius: .75rem;
  overflow: hidden;
}
.article-faq + .article-faq {
  margin-top: .5rem;
}
`;

export default function ArticleBody({ post }) {
  const [openFaq, setOpenFaq] = useState(0);

  const prepared = useMemo(() => {
    if (!post?.contentHtml) return null;
    return prepare(post.contentHtml);
  }, [post?.contentHtml]);

  if (!prepared) return null;

  const faqsEnabled =
    post.faqEnabled === true || post.faqEnabled === "true";

  const faqs = faqsEnabled && Array.isArray(post.faqs)
    ? post.faqs.filter(
        (faq) =>
          faq &&
          String(faq.q || "").trim() &&
          String(faq.a || "").trim()
      )
    : [];

  const jumpToHeading = (event, id) => {
    event.preventDefault();

    document.getElementById(id)?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });


    window.history.replaceState(
      null,
      "",
      `${window.location.pathname}${window.location.search}#${id}`
    );
  };

  return (
    <div className="w-full min-w-0">
      <style>{CSS}</style>

      {post.showToc !== false &&
        post.showToc !== "false" &&
        prepared.toc.length > 1 && (
          <nav
            className="article-toc"
            aria-label="Table of contents"
          >
            <p className="mb-3 flex items-center gap-2 text-sm font-bold text-stone-900">
              <ListTree
                className="h-4 w-4 shrink-0"
                style={{ color: "#047857" }}
              />
              Table of Contents
            </p>

            <ol className="space-y-2 text-sm leading-6">
              {prepared.toc.map((heading, index) => (
                <li
                  key={heading.id}
                  style={{
                    marginLeft:
                      heading.level === 3 ? "1.25rem" : 0,
                  }}
                >
                  <a
                    href={`#${heading.id}`}
                    onClick={(event) =>
                      jumpToHeading(event, heading.id)
                    }
                    className="inline-flex items-start gap-2"
                  >
                    <span
                      className="shrink-0 font-semibold"
                      style={{ color: "#047857" }}
                    >
                      {index + 1}.
                    </span>

                    <span>{heading.text}</span>
                  </a>
                </li>
              ))}
            </ol>
          </nav>
        )}

      <div
        className="article-body"
        dangerouslySetInnerHTML={{
          __html: prepared.html,
        }}
      />

      {faqs.length > 0 && (
        <section className="mt-10" aria-labelledby="article-faq-title">
          <h2
            id="article-faq-title"
            className="mb-4 text-2xl font-bold text-stone-950"
          >
            Frequently Asked Questions
          </h2>

          <div>
            {faqs.map((faq, index) => {
              const isOpen = openFaq === index;

              return (
                <div
                  key={`${faq.q}-${index}`}
                  className="article-faq"
                >
                  <button
                    type="button"
                    onClick={() =>
                      setOpenFaq(isOpen ? -1 : index)
                    }
                    aria-expanded={isOpen}
                    className="flex w-full items-center justify-between gap-3 px-4 py-4 text-left text-sm font-semibold text-stone-900 transition hover:bg-stone-50"
                  >
                    <span>{faq.q}</span>

                    <ChevronDown
                      className="h-4 w-4 shrink-0 transition-transform"
                      style={{
                        transform: isOpen
                          ? "rotate(180deg)"
                          : "rotate(0deg)",
                      }}
                    />
                  </button>

                  {isOpen && (
                    <div className="px-4 pb-4 text-sm leading-7 text-stone-600">
                      {faq.a}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </section>
      )}
    </div>
  );
}
