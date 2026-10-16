import React, { useState, useEffect, useMemo } from "react";
import { API, authFetch } from "./config";
import PostSection from "./PostSection";
import { buildBlogArticleConfig } from "./postConfigs";


export default function BlogArticlesSection({ active, notify, onCount }) {
  const [authors, setAuthors] = useState([]);

  useEffect(() => {
    if (!active) return;
    authFetch(`${API}/blog-authors`)
      .then((r) => r.json())
      .then((d) => setAuthors(Array.isArray(d) ? d : []))
      .catch((err) => console.error("Error fetching authors:", err));
  }, [active]);

  const config = useMemo(() => buildBlogArticleConfig(authors), [authors]);

  return <PostSection config={config} notify={notify} onCount={onCount} />;
}
