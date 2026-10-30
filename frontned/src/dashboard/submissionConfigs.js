import {
  biographyConfig,
  brandConfig,
  slidingCompanyConfig,
  latestArticleConfig,
  articleConfig,
  companyConfig,
  buildBlogArticleConfig,
} from "./postConfigs";

export const buildConfigs = ({
  authors = [],
  companies = [],
} = {}) => {
  const safeAuthors = Array.isArray(authors) ? authors : [];
  const safeCompanies = Array.isArray(companies) ? companies : [];

  const companyOptions = safeCompanies
    .filter((company) => company && company.slug && company.name)
    .map((company) => ({
      value: company.slug,
      label: company.name,
    }));

  return {
    biographies: biographyConfig,

    brands: brandConfig,

    slidingCompanies: slidingCompanyConfig,

    latestArticles: latestArticleConfig,

    articles: {
      ...articleConfig,

      singular: "Company Article",

      extraFields: (articleConfig.extraFields || []).map((field) =>
        field.name === "company"
          ? {
              ...field,
              label: "Company",
              type: "select",
              options: companyOptions,
              placeholder: "Select a company (optional)",
              hint: "The article will appear under Related Articles on the selected company's page.",
            }
          : field
      ),
    },

    companies: {
      ...companyConfig,
      extraFields: [],
    },

    blogArticles: buildBlogArticleConfig(safeAuthors),
  };
};