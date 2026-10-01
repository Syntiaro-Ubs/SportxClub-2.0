import { Helmet } from "react-helmet-async";
import { DEFAULT_OG_IMAGE, SITE_NAME } from "../../utils/seo";

/**
 * PageMeta — Reusable SEO component for per-page meta tags.
 * 
 * Usage:
 * <PageMeta
 *   title="Book Venues Near You | SportXClub"
 *   description="Find football turfs, cricket grounds..."
 *   canonical="https://www.sportxclub.in/venues"
 *   ogImage="https://..."   (optional, defaults to OG image)
 *   schema={JSON.stringify({...})}  (optional JSON-LD string)
 * />
 */
export function PageMeta({
  title,
  description,
  canonical,
  ogImage = DEFAULT_OG_IMAGE,
  keywords,
  schema,
  noIndex = false,
}) {
  const safeTitle = title || `${SITE_NAME} — Book Sports Venues Online in India`;
  const safeDesc = description || "Book football turfs, cricket grounds, badminton courts and more near you on SportXClub.";

  return (
    <Helmet>
      {/* Primary */}
      <title>{safeTitle}</title>
      <meta name="description" content={safeDesc} />
      {keywords && <meta name="keywords" content={keywords} />}
      <meta name="robots" content={noIndex ? "noindex, nofollow" : "index, follow"} />
      {canonical && <link rel="canonical" href={canonical} />}

      {/* Open Graph */}
      <meta property="og:title" content={safeTitle} />
      <meta property="og:description" content={safeDesc} />
      <meta property="og:image" content={ogImage} />
      <meta property="og:url" content={canonical || "https://www.sportxclub.in"} />
      <meta property="og:type" content="website" />
      <meta property="og:site_name" content={SITE_NAME} />
      <meta property="og:locale" content="en_IN" />

      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={safeTitle} />
      <meta name="twitter:description" content={safeDesc} />
      <meta name="twitter:image" content={ogImage} />

      {/* JSON-LD structured data */}
      {schema && (
        <script type="application/ld+json">{schema}</script>
      )}
    </Helmet>
  );
}
