const BASE = "https://market-hub-blogs-backend.onrender.com/api/sliding-companies";

export const fetchSlidingCompanies = async () => {
  const res = await fetch(BASE);
  if (!res.ok) throw new Error("Failed to load");
  return res.json();
};

export const fetchSlidingCompany = async (slug) => {
  const res = await fetch(`${BASE}/${slug}`);
  if (!res.ok) throw new Error("Not found");
  return res.json();
};