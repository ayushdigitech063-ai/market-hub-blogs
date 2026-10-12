const types = {
  ceo: {
    label: "CEOs",
    title: "All CEOs & Business Leaders",
    description:
      "Explore the complete biographies and leadership journeys of influential CEOs and business leaders.",
  },
  sportsperson: {
    label: "Sportspersons",
    title: "All Sportspersons & Athletes",
    description:
      "Explore inspiring biographies, records and journeys of legendary sports personalities and athletes.",
  },
  author: {
    label: "Authors",
    title: "All Authors",
    description: "Explore authors, writers and their professional literary journeys.",
  },
  student: {
    label: "Students",
    title: "All Students",
    description: "Explore student profiles, educational journeys and achievements.",
  },
};

const capitalize = (text = "") => text.charAt(0).toUpperCase() + text.slice(1);

export const getTypeInfo = (type) =>
  types[type] ?? {
    label: capitalize(type),
    title: `All ${capitalize(type)}`,
    description: `Explore all ${type} biographies, journeys and achievements.`,
  };

export const viewAllPath = (type) => `/biography/view-all/${type}`;