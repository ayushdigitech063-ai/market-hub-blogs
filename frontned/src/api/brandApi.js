const BASE = "https://market-hub-blogs-backend.onrender.com/api/brands"; // apna backend port daalo

export const fetchFeatured = async () => {
  const res = await fetch(`${BASE}/featured`);
  if (!res.ok) throw new Error("Failed to load featured products");
  return res.json();
};

export const fetchBrand = async (slug) => {
  const res = await fetch(`${BASE}/${slug}`);
  if (!res.ok) throw new Error("Product not found");
  return res.json(); // { item, related }
};