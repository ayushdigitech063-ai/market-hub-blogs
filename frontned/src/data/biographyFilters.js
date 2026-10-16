
const stem = (w) => (w.length > 3 && w.endsWith("s") ? w.slice(0, -1) : w);

export const words = (v) =>
  String(v || "")
    .toLowerCase()
    .split(/[^a-z0-9]+/)
    .filter(Boolean)
    .map(stem);

const stems = (list) => list.map(stem);


const TOKEN_SECTION = {
  [stem("business")]: "business",
  ceo: "business",
  [stem("sports")]: "sports",
  sportsperson: "sports",
  entrepreneur: "entrepreneur",
  actor: "actors",
};


const LEGACY_CATEGORY_WORDS = [
  ["entrepreneur", stems(["entrepreneur", "startup", "founder"])],
  ["sports", stems(["sport", "cricket", "football", "tennis", "athlete"])],
  ["actors", stems(["actor", "actress", "cinema", "film", "bollywood"])],
  ["business", stems(["business", "ceo", "leader", "tech", "technology", "executive"])],
];


const ROLE_WORDS = [
  ["sports", stems(["player", "athlete", "cricketer", "footballer", "sprinter", "sportsperson", "sport"])],
  ["actors", stems(["actor", "actress"])],
  ["entrepreneur", stems(["entrepreneur", "founder"])],
  ["business", stems(["ceo", "chairman", "chair", "president", "director", "executive"])],
];

const matchGroup = (groups, w) => {
  const hit = groups.find(([, list]) => w.some((x) => list.includes(x)));
  return hit ? hit[0] : null;
};


export const getSection = (item) => {

  const cat = words(item.category);
  if (cat.length === 1 && TOKEN_SECTION[cat[0]]) return TOKEN_SECTION[cat[0]];


  const typeHit = words(item.type).map((w) => TOKEN_SECTION[w]).find(Boolean);
  if (typeHit) return typeHit;

  return matchGroup(LEGACY_CATEGORY_WORDS, cat) || matchGroup(ROLE_WORDS, words(item.role));
};


export const sectionFromRoute = (value) =>
  words(value).map((w) => TOKEN_SECTION[w]).find(Boolean) || null;