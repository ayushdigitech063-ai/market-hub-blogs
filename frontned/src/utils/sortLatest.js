// src/utils/sortLatest.js
// Global helper: kisi bhi list ko "sabse naya pehle" sort karta hai.
// Biography, Brand, Sliding Company, Latest Article, Article, Company, Author Article, sab par chalta hai.

const toNumber = (v) => {
  const n = parseInt(String(v ?? "").replace(/\D/g, ""), 10);
  return Number.isNaN(n) ? 0 : n;
};

// Item ka "banne ka time" nikalta hai. Jo pehle mile wahi use hota hai:
// 1. publishDate  (admin panel ka naya field, ISO)
// 2. createdAt    (backend timestamp)
// 3. date         (purane items ka text, jaise "Oct 8, 2026")
// 4. Mongo _id    (ObjectId ke pehle 8 hex = timestamp)
export const getItemTime = (item) => {
  if (!item) return 0;

  for (const key of ["publishDate", "createdAt", "date"]) {
    const t = Date.parse(item[key]);
    if (!Number.isNaN(t)) return t;
  }

  const id = String(item._id || "");
  if (/^[0-9a-f]{24}$/i.test(id)) return parseInt(id.slice(0, 8), 16) * 1000;

  return 0;
};

/**
 * Newest first.
 *
 * sortLatestFirst(items)                       -> sirf date se (naya sabse upar)
 * sortLatestFirst(items, { pinByOrder: true }) -> pehle admin ka "order" (chota number pehle),
 *                                                 same order wale items me naya pehle
 *
 * Original array change nahi hota, naya array milta hai.
 */
export const sortLatestFirst = (items, { pinByOrder = false } = {}) => {
  if (!Array.isArray(items)) return [];

  return [...items].sort((a, b) => {
    if (pinByOrder) {
      const oa = Number.isFinite(Number(a?.order)) && a?.order !== "" && a?.order != null ? Number(a.order) : Infinity;
      const ob = Number.isFinite(Number(b?.order)) && b?.order !== "" && b?.order != null ? Number(b.order) : Infinity;
      if (oa !== ob) return oa - ob;
    }

    const diff = getItemTime(b) - getItemTime(a);
    if (diff !== 0) return diff;

    // Same time ho to bade ID wala (naya) pehle: 101, art-078 waghera
    return toNumber(b?.id) - toNumber(a?.id);
  });
};


export const takeLatest = (items, n = 3, options) =>
  sortLatestFirst(items, options).slice(0, n);


export const onlyPublished = (items) =>
  (Array.isArray(items) ? items : []).filter((i) => i?.status !== "draft");