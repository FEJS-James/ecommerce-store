"use client";

import { useState } from "react";
import { Check, X, Zap, Star, Building2, ArrowRight } from "lucide-react";
import ServiceEnquiryModal from "./ServiceEnquiryModal";

interface Tier {
  name: string;
  price: string;
  priceCents: number;
  period: string;
  description: string;
  popular: boolean;
  icon: React.ReactNode;
  features: {
    agents: string;
    storage: string;
    support: string;
    monitoring: string;
    customIntegrations: boolean;
    whiteLabel: boolean;
    slaGuarantee: boolean;
  };
}

const TIERS: Tier[] = [
  {
    name: "Starter",
    price: "$29",
    priceCents: 2900,
    period: "/mo",
    description: "Perfect for individuals getting started with AI agents.",
    popular: false,
    icon: <Zap className="w-6 h-6 text-indigo-400" aria-hidden="true" />,
    features: {
      agents: "1 agent",
      storage: "5GB storage",
      support: "Community support",
      monitoring: "Basic monitoring",
      customIntegrations: false,
      whiteLabel: false,
      slaGuarantee: false,
    },
  },
  {
    name: "Professional",
    price: "$79",
    priceCents: 7900,
    period: "/mo",
    description:
      "For teams scaling their AI operations with advanced tooling.",
    popular: true,
    icon: <Star className="w-6 h-6 text-indigo-400" aria-hidden="true" />,
    features: {
      agents: "Up to 5 agents",
      storage: "25GB storage",
      support: "Priority support",
      monitoring: "Advanced monitoring",
      customIntegrations: true,
      whiteLabel: false,
      slaGuarantee: false,
    },
  },
  {
    name: "Business",
    price: "$199",
    priceCents: 19900,
    period: "/mo",
    description:
      "Enterprise-grade hosting with unlimited scale and dedicated support.",
    popular: false,
    icon: (
      <Building2 className="w-6 h-6 text-indigo-400" aria-hidden="true" />
    ),
    features: {
      agents: "Unlimited agents",
      storage: "100GB storage",
      support: "Dedicated support",
      monitoring: "Advanced monitoring",
      customIntegrations: true,
      whiteLabel: true,
      slaGuarantee: true,
    },
  },
];

const FEATURE_ROWS: { key: keyof Tier["features"]; label: string }[] = [
  { key: "agents", label: "AI Agents" },
  { key: "storage", label: "Storage" },
  { key: "support", label: "Support" },
  { key: "monitoring", label: "Monitoring" },
  { key: "customIntegrations", label: "Custom Integrations" },
  { key: "whiteLabel", label: "White-Label" },
  { key: "slaGuarantee", label: "SLA Guarantee" },
];

export default function CloudHostingPricing() {
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedTier, setSelectedTier] = useState<Tier | null>(null);

  const openEnquiry = (tier: Tier) => {
    setSelectedTier(tier);
    setModalOpen(true);
  };

  return (
    <>
      {/* Pricing Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
        {TIERS.map((tier) => (
          <div
            key={tier.name}
            className={`relative glass rounded-2xl p-6 flex flex-col ${
              tier.popular
                ? "md:-mt-4 md:mb-[-16px] border-indigo-500/40 shadow-[0_0_40px_rgba(99,102,241,0.12)]"
                : ""
            }`}
          >
            {tier.popular && (
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full bg-indigo-500 text-white text-xs font-bold tracking-wide uppercase">
                Most Popular
              </div>
            )}

            <div className="w-12 h-12 bg-indigo-500/10 border border-indigo-500/20 rounded-xl flex items-center justify-center mb-4">
              {tier.icon}
            </div>

            <h3 className="text-xl font-bold text-white mb-1">{tier.name}</h3>
            <p className="text-zinc-400 text-sm mb-5">{tier.description}</p>

            <div className="mb-6">
              <span className="text-4xl font-bold text-white">
                {tier.price}
              </span>
              <span className="text-zinc-400 text-sm">{tier.period}</span>
            </div>

            <ul className="space-y-3 mb-8 flex-1">
              <li className="flex items-center gap-2 text-sm text-zinc-300">
                <Check
                  className="w-4 h-4 text-indigo-400 flex-shrink-0"
                  aria-hidden="true"
                />
                {tier.features.agents}
              </li>
              <li className="flex items-center gap-2 text-sm text-zinc-300">
                <Check
                  className="w-4 h-4 text-indigo-400 flex-shrink-0"
                  aria-hidden="true"
                />
                {tier.features.storage}
              </li>
              <li className="flex items-center gap-2 text-sm text-zinc-300">
                <Check
                  className="w-4 h-4 text-indigo-400 flex-shrink-0"
                  aria-hidden="true"
                />
                {tier.features.support}
              </li>
              <li className="flex items-center gap-2 text-sm text-zinc-300">
                <Check
                  className="w-4 h-4 text-indigo-400 flex-shrink-0"
                  aria-hidden="true"
                />
                {tier.features.monitoring}
              </li>
              {tier.features.customIntegrations && (
                <li className="flex items-center gap-2 text-sm text-zinc-300">
                  <Check
                    className="w-4 h-4 text-indigo-400 flex-shrink-0"
                    aria-hidden="true"
                  />
                  Custom integrations
                </li>
              )}
              {tier.features.whiteLabel && (
                <li className="flex items-center gap-2 text-sm text-zinc-300">
                  <Check
                    className="w-4 h-4 text-indigo-400 flex-shrink-0"
                    aria-hidden="true"
                  />
                  White-label branding
                </li>
              )}
              {tier.features.slaGuarantee && (
                <li className="flex items-center gap-2 text-sm text-zinc-300">
                  <Check
                    className="w-4 h-4 text-indigo-400 flex-shrink-0"
                    aria-hidden="true"
                  />
                  SLA guarantee
                </li>
              )}
            </ul>

            <button
              onClick={() => openEnquiry(tier)}
              className={`w-full px-6 py-3 rounded-xl font-semibold text-center flex items-center justify-center gap-2 focus-glow transition-colors ${
                tier.popular
                  ? "btn-gradient"
                  : "border border-indigo-500/30 text-indigo-400 hover:bg-indigo-500/10"
              }`}
            >
              Get Started
              <ArrowRight className="w-4 h-4" aria-hidden="true" />
            </button>
          </div>
        ))}
      </div>

      {/* Feature Comparison Table */}
      <div className="glass rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/[0.08]">
                <th className="text-left text-zinc-400 font-medium px-6 py-4">
                  Feature
                </th>
                {TIERS.map((tier) => (
                  <th
                    key={tier.name}
                    className={`text-center font-semibold px-6 py-4 ${
                      tier.popular ? "text-indigo-400" : "text-white"
                    }`}
                  >
                    {tier.name}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {FEATURE_ROWS.map((row) => (
                <tr
                  key={row.key}
                  className="border-b border-white/[0.04] last:border-0"
                >
                  <td className="text-zinc-400 px-6 py-3">{row.label}</td>
                  {TIERS.map((tier) => {
                    const value = tier.features[row.key];
                    return (
                      <td
                        key={tier.name}
                        className="text-center px-6 py-3"
                      >
                        {typeof value === "boolean" ? (
                          value ? (
                            <Check
                              className="w-4 h-4 text-indigo-400 mx-auto"
                              aria-hidden="true"
                            />
                          ) : (
                            <X
                              className="w-4 h-4 text-zinc-600 mx-auto"
                              aria-hidden="true"
                            />
                          )
                        ) : (
                          <span className="text-zinc-300">{value}</span>
                        )}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Enquiry Modal */}
      {selectedTier && (
        <ServiceEnquiryModal
          serviceName={`Cloud Hosting — ${selectedTier.name}`}
          serviceDescription={`${selectedTier.name} plan: ${selectedTier.features.agents}, ${selectedTier.features.storage}, ${selectedTier.features.support}, ${selectedTier.features.monitoring}.`}
          servicePrice={selectedTier.priceCents}
          isOpen={modalOpen}
          onClose={() => {
            setModalOpen(false);
            setSelectedTier(null);
          }}
        />
      )}
    </>
  );
}
