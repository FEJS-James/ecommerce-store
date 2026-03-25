import { formatPriceWithCurrency } from "@/lib/pricing";
import { Mail, ArrowRight } from "lucide-react";

export const metadata = {
  title: "Services | AI Armory",
  description:
    "Professional services for your digital product needs. Custom templates, consulting, and more.",
};

interface ServiceItem {
  name: string;
  description: string;
  priceGBPCents: number;
  features: string[];
}

const SERVICES: ServiceItem[] = [
  {
    name: "Custom Template Design",
    description:
      "A bespoke template built to your exact specifications. Notion, Sheets, or any supported platform.",
    priceGBPCents: 14900,
    features: [
      "1-on-1 consultation call",
      "Custom design to your brief",
      "2 rounds of revisions",
      "Delivered within 7 business days",
    ],
  },
  {
    name: "AI Workflow Consulting",
    description:
      "One hour of expert guidance on integrating AI tools into your workflow for maximum productivity.",
    priceGBPCents: 9900,
    features: [
      "60-minute video call",
      "Personalised action plan",
      "Follow-up summary email",
      "Tool recommendations",
    ],
  },
  {
    name: "Prompt Engineering Package",
    description:
      "Custom prompt library designed for your specific business use cases and AI platforms.",
    priceGBPCents: 24900,
    features: [
      "Needs assessment",
      "50+ custom prompts",
      "Testing and iteration",
      "Documentation and training",
    ],
  },
];

export default function ServicesPage() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16">
      <div className="text-center mb-14">
        <h1 className="text-3xl md:text-4xl font-bold text-white mb-4">
          Services
        </h1>
        <p className="text-lg text-zinc-500 max-w-2xl mx-auto">
          Need something custom? Our professional services deliver tailored
          solutions for your specific needs.
        </p>
        <p className="text-sm text-zinc-600 mt-2">All services priced in GBP</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
        {SERVICES.map((service) => (
          <div
            key={service.name}
            className="glass rounded-2xl p-6 flex flex-col"
          >
            <h2 className="text-xl font-bold text-white mb-2">
              {service.name}
            </h2>
            <p className="text-zinc-500 text-sm mb-6 leading-relaxed flex-1">
              {service.description}
            </p>
            <div className="mb-6">
              <span className="text-3xl font-bold text-white">
                {formatPriceWithCurrency(service.priceGBPCents, "gbp")}
              </span>
            </div>
            <ul className="space-y-2 mb-6">
              {service.features.map((feature) => (
                <li
                  key={feature}
                  className="flex items-start gap-2 text-sm text-zinc-400"
                >
                  <ArrowRight
                    className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5"
                    aria-hidden="true"
                  />
                  {feature}
                </li>
              ))}
            </ul>
            <a
              href={`mailto:hello@aiarmory.com?subject=${encodeURIComponent(service.name)}`}
              data-umami-event="service_enquiry"
              className="w-full btn-gradient px-6 py-3 rounded-xl font-semibold text-center flex items-center justify-center gap-2 focus-glow"
            >
              <Mail className="w-4 h-4" aria-hidden="true" />
              Get in Touch
            </a>
          </div>
        ))}
      </div>
    </div>
  );
}
