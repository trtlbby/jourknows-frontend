import { Helmet } from "react-helmet-async";

/**
 * ArticleJsonLd — Injects NewsArticle structured data for Google rich results.
 *
 * @param {Object} props
 * @param {Object} props.article - Article object from API
 * @param {string} [props.siteUrl] - Base URL of the site
 */
export default function ArticleJsonLd({ article, siteUrl = "" }) {
  if (!article) return null;

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "NewsArticle",
    "headline": article.title,
    "description": article.excerpt || "",
    "image": article.coverImageUrl || undefined,
    "datePublished": article.publishedAt,
    "dateModified": article.updatedAt || article.publishedAt,
    "author": {
      "@type": "Person",
      "name": article.author?.fullName || "Unknown Author",
    },
    "publisher": {
      "@type": "Organization",
      "name": "JourKnows",
      "logo": {
        "@type": "ImageObject",
        "url": `${siteUrl}/vite.svg`,
      },
    },
    "mainEntityOfPage": {
      "@type": "WebPage",
      "@id": `${siteUrl}/article/${article.slug}`,
    },
  };

  // Remove undefined values
  const cleaned = JSON.parse(JSON.stringify(jsonLd));

  return (
    <Helmet>
      <script type="application/ld+json">{JSON.stringify(cleaned)}</script>
    </Helmet>
  );
}
