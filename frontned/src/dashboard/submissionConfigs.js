import {
  biographyConfig, brandConfig, slidingCompanyConfig, latestArticleConfig,
  articleConfig, companyConfig, buildBlogArticleConfig,
} from "./postConfigs";
export const buildConfigs = ({ authors = [], companies = [] } = {}) => {
  const companyOptions = companies.map((c) => ({ value: c.slug, label: c.name }));
  return {
    biographies: biographyConfig,
    brands: brandConfig,
    slidingCompanies: slidingCompanyConfig,
    latestArticles: latestArticleConfig,
    articles: {
      ...articleConfig,
      singular: "Company Article",
      extraFields: articleConfig.extraFields.map((f) =>
        f.name === "company"
          ? {
              ...f,
              label: "Company",
              type: "select",
              options: companyOptions,
              placeholder: "Select a company (optional)",
              hint: "The article will appear under Related Articles on the selected company's page.",
            }
          : f
      ),
    },
    companies: { ...companyConfig, extraFields: [] },
    blogArticles: buildBlogArticleConfig(authors),
  };
};