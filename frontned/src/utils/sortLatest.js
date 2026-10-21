
const toNumber = (v) => {
  const n = parseInt(String(v ?? "").replace(/\D/g, ""), 10);
  return Number.isNaN(n) ? 0 : n;
};

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

   
    return toNumber(b?.id) - toNumber(a?.id);
  });
};


export const takeLatest = (items, n = 3, options) =>
  sortLatestFirst(items, options).slice(0, n);


export const onlyPublished = (items) =>
  (Array.isArray(items) ? items : []).filter((i) => i?.status !== "draft");