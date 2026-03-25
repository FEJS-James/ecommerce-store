import { queryAll } from "@/lib/db";
import type { Product } from "@/lib/types";
import { Shield, Globe, Lock } from "lucide-react";
import ServiceCard from "@/components/ServiceCard";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Professional AI Services | AI Armory",
  description:
    "Expert AI consulting, system setup, and enterprise transformation services. UK-based, your infrastructure, your data.",
};

export default async function ServicesPage() {
  const result = await queryAll<Product>(
    "SELECT * FROM products WHERE category = 'services' AND status = 'active' ORDER BY price_cents ASC"
  );

  const services = Array.isArray(result) ? result : [];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16">
      {/* Hero */}
      <div className="text-center mb-14">
        <h1 className="text-3xl md:text-4xl font-bold text-white mb-4">
          Professional AI Services
        </h1>
        <p className="text-lg text-zinc-400 max-w-2xl mx-auto">
          From strategy to full deployment — hands-on AI expertise for
          businesses that want real results, not generic advice.
        </p>
      </div>

      {/* Service Cards Grid */}
      {services.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-16">
          {services.map((service, index) => (
            <ServiceCard
              key={service.id}
              name={service.name}
              description={service.description}
              priceCents={service.price_cents}
              tierIndex={index}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-16 mb-16">
          <div className="glass rounded-2xl p-12 max-w-md mx-auto">
            <h2 className="text-xl font-bold text-white mb-2">Coming soon</h2>
            <p className="text-zinc-400">
              Our professional AI services are being prepared. Check back soon.
            </p>
          </div>
        </div>
      )}

      {/* Not sure section */}
      <div className="glass rounded-2xl p-8 text-center mb-16">
        <h2 className="text-xl font-bold text-white mb-3">
          Not sure which tier is right for you?
        </h2>
        <p className="text-zinc-400 max-w-lg mx-auto mb-6">
          Every business is different. Get in touch and we&apos;ll recommend the
          right service based on your goals, team size, and current setup.
        </p>
        <a
          href="/support"
          className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-semibold text-indigo-400 border border-indigo-500/30 hover:bg-indigo-500/10 transition-colors focus-glow"
        >
          Talk to us
        </a>
      </div>

      {/* Trust Signals */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div className="flex flex-col items-center text-center p-6">
          <div className="w-12 h-12 bg-indigo-500/10 border border-indigo-500/20 rounded-xl flex items-center justify-center mb-3">
            <Shield className="w-6 h-6 text-indigo-400" aria-hidden="true" />
          </div>
          <span className="text-lg font-bold text-white">30+ Systems Deployed</span>
          <span className="text-sm text-zinc-500 mt-1">Proven track record across industries</span>
        </div>
        <div className="flex flex-col items-center text-center p-6">
          <div className="w-12 h-12 bg-indigo-500/10 border border-indigo-500/20 rounded-xl flex items-center justify-center mb-3">
            <Globe className="w-6 h-6 text-indigo-400" aria-hidden="true" />
          </div>
          <span className="text-lg font-bold text-white">UK-Based Expert</span>
          <span className="text-sm text-zinc-500 mt-1">Direct access, no outsourcing</span>
        </div>
        <div className="flex flex-col items-center text-center p-6">
          <div className="w-12 h-12 bg-indigo-500/10 border border-indigo-500/20 rounded-xl flex items-center justify-center mb-3">
            <Lock className="w-6 h-6 text-indigo-400" aria-hidden="true" />
          </div>
          <span className="text-lg font-bold text-white">Your Infrastructure, Your Data</span>
          <span className="text-sm text-zinc-500 mt-1">Self-hosted solutions, full ownership</span>
        </div>
      </div>
    </div>
  );
}
