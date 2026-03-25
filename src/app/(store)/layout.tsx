import Header from "@/components/Header";
import Footer from "@/components/Footer";
import RegionalPricingBanner from "@/components/RegionalPricingBanner";

export default function StoreLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex flex-col bg-[#0A0A0F]">
      <Header />
      <RegionalPricingBanner />
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  );
}
