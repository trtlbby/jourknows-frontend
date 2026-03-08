import { Helmet } from "react-helmet-async";

/**
 * SEOHead — Sets dynamic <title>, <meta>, and Open Graph tags per page.
 *
 * @param {Object} props
 * @param {string} props.title - Page title (appended with " | JourKnows")
 * @param {string} props.description - Meta description
 * @param {string} [props.image] - OG image URL
 * @param {string} [props.url] - Canonical URL
 * @param {string} [props.type] - OG type (default: "website")
 */
export default function SEOHead({ title, description, image, url, type = "website" }) {
  const fullTitle = title ? `${title} | JourKnows` : "JourKnows — Campus Journalism";

  return (
    <Helmet>
      <title>{fullTitle}</title>
      <meta name="description" content={description || "JourKnows — Your source for campus journalism, news, opinion, features, sports, sci-tech, and literary content."} />

      {/* Open Graph */}
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description || ""} />
      <meta property="og:type" content={type} />
      {url && <meta property="og:url" content={url} />}
      {image && <meta property="og:image" content={image} />}

      {/* Twitter */}
      <meta name="twitter:card" content={image ? "summary_large_image" : "summary"} />
      <meta name="twitter:title" content={fullTitle} />
      {description && <meta name="twitter:description" content={description} />}
      {image && <meta name="twitter:image" content={image} />}

      {/* Canonical */}
      {url && <link rel="canonical" href={url} />}
    </Helmet>
  );
}
