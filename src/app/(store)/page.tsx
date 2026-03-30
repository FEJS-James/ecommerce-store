import HeroSection from "@/components/home/HeroSection";
import StatsSection from "@/components/home/StatsSection";
import HowItWorksSection from "@/components/home/HowItWorksSection";
import CategoriesSection from "@/components/home/CategoriesSection";
import FeaturedProductsSection from "@/components/home/FeaturedProductsSection";
import TrustSection from "@/components/home/TrustSection";
import ServicesSection from "@/components/home/ServicesSection";
import SocialProofSection from "@/components/home/SocialProofSection";
import NewsletterSection from "@/components/home/NewsletterSection";
import { queryAll } from "@/lib/db";
import { SITE_URL, SITE_NAME, SITE_DESCRIPTION } from "@/lib/site-config";
import type { Product } from "@/lib/types";

export const dynamic = "force-dynamic";

const organizationJsonLd = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: SITE_NAME,
  url: SITE_URL,
  description: SITE_DESCRIPTION,
};

const webSiteJsonLd = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  name: SITE_NAME,
  url: SITE_URL,
};

export default async function HomePage() {
  const featuredProducts = await queryAll<Product>(
    "SELECT * FROM products WHERE featured = 1 AND status = 'active' LIMIT 8",
  );

  const allActiveProducts = await queryAll<Product>(
    "SELECT * FROM products WHERE status = 'active' LIMIT 8",
  );

  // Use featured products if enough exist, otherwise fill with active products
  const displayProducts =
    featuredProducts.length >= 6
      ? featuredProducts
      : [
          ...featuredProducts,
          ...allActiveProducts.filter(
            (p) => !featuredProducts.some((fp) => fp.id === p.id),
          ),
        ].slice(0, 8);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(webSiteJsonLd) }}
      />
      <HeroSection />
      <StatsSection />
      <HowItWorksSection />
      <CategoriesSection />
      <FeaturedProductsSection products={displayProducts} />
      <TrustSection />
      <ServicesSection />
      <SocialProofSection />
      <NewsletterSection />
    </>
  );
}
