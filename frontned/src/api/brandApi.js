
import { sortLatestFirst } from "../utils/sortLatest";

const BASE =
  "https://market-hub-blogs-backend.onrender.com/api/brands";

// Fetch featured brands
export const fetchFeatured = async () => {
  const res = await fetch(`${BASE}/featured`);

  if (!res.ok) {
    throw new Error("Failed to load featured brands");
  }

  const data = await res.json();

  const brands = Array.isArray(data)
    ? data
    : Array.isArray(data?.brands)
      ? data.brands
      : [];

  return sortLatestFirst(brands);
};

// Fetch a single brand by slug
export const fetchBrand = async (slug) => {
  if (!slug) {
    throw new Error("Brand slug is required");
  }

  const res = await fetch(
    `${BASE}/${encodeURIComponent(slug)}`
  );

  if (!res.ok) {
    throw new Error("Brand not found");
  }

  return res.json();
};
