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
import type { Product } from "@/lib/types";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const featuredProducts = await queryAll<Product>(
    "SELECT * FROM products WHERE featured = 1 AND status = 'active' LIMIT 4",
  );

  return (
    <>
      <HeroSection />
      <StatsSection />
      <HowItWorksSection />
      <CategoriesSection />
      <FeaturedProductsSection products={featuredProducts} />
      <TrustSection />
      <ServicesSection />
      <SocialProofSection />
      <NewsletterSection />
    </>
  );
}
