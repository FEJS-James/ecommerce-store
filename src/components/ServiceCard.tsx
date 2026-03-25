"use client";

import { useState } from "react";
import { Lightbulb, Cpu, Server, Building2, ArrowRight } from "lucide-react";
import { formatPriceWithCurrency } from "@/lib/pricing";
import { getExcerpt } from "@/lib/utils";
import ServiceEnquiryModal from "./ServiceEnquiryModal";

// Map tier position (index) to an appropriate icon
const TIER_ICONS = [Lightbulb, Cpu, Server, Building2];

interface ServiceCardProps {
  name: string;
  description: string;
  priceCents: number;
  tierIndex: number;
}

export default function ServiceCard({
  name,
  description,
  priceCents,
  tierIndex,
}: ServiceCardProps) {
  const [modalOpen, setModalOpen] = useState(false);

  const Icon = TIER_ICONS[tierIndex] ?? Lightbulb;
  const excerpt = getExcerpt(description, 150);

  return (
    <>
      <div className="glass rounded-2xl p-6 flex flex-col h-full">
        <div className="w-12 h-12 bg-indigo-500/10 border border-indigo-500/20 rounded-xl flex items-center justify-center mb-4">
          <Icon className="w-6 h-6 text-indigo-400" aria-hidden="true" />
        </div>

        <h2 className="text-xl font-bold text-white mb-2">{name}</h2>

        <p className="text-zinc-400 text-sm mb-6 leading-relaxed flex-1">
          {excerpt}
        </p>

        <div className="mb-6">
          <span className="text-3xl font-bold text-white">
            {formatPriceWithCurrency(priceCents, "gbp")}
          </span>
        </div>

        <button
          onClick={() => setModalOpen(true)}
          className="w-full btn-gradient px-6 py-3 rounded-xl font-semibold text-center flex items-center justify-center gap-2 focus-glow"
        >
          Get Started
          <ArrowRight className="w-4 h-4" aria-hidden="true" />
        </button>
      </div>

      <ServiceEnquiryModal
        serviceName={name}
        serviceDescription={description}
        servicePrice={priceCents}
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
      />
    </>
  );
}
