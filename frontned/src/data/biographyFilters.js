const stem = (word) =>
  word.length > 3 && word.endsWith("s") ? word.slice(0, -1) : word;

export const words = (value) =>
  String(value || "")
    .toLowerCase()
    .split(/[^a-z0-9]+/)
    .filter(Boolean)
    .map(stem);

const GROUPS = {
  actors: [
    "actor", "actress", "cinema", "film", "bollywood", "hollywood",
  ],
  entrepreneur: [
    "entrepreneur", "founder", "startup", "businessman", "businesswoman",
  ],
  sports: [
    "sport", "sportsperson", "sports", "cricket", "cricketer",
    "football", "footballer", "tennis", "athlete", "player",
    "sprinter", "badminton", "basketball", "hockey",
  ],
  business: [
    "business", "ceo", "leader", "executive", "technology", "tech",
    "chairman", "director", "president",
  ],
};

export const getSection = (item = {}) => {
  const fields = [item.category, item.type, item.role];

  for (const [section, keywords] of Object.entries(GROUPS)) {
    if (
      fields.some((field) =>
        words(field).some((word) =>
          keywords.some((keyword) => stem(keyword) === word)
        )
      )
    ) {
      return section;
    }
  }

  return null;
};

export const sectionFromRoute = (value) => {
  const section = getSection({ category: value });
  return section;
};