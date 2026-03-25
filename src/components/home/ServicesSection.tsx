"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import ScrollReveal from "./ScrollReveal";

const tiers = [
  {
    name: "Strategy Session",
    price: "249",
    description: "60-min deep dive into your automation potential",
    borderColor: "rgba(99, 102, 241, 0.2)",
    glowColor: "rgba(99, 102, 241, 0.1)",
    accentColor: "#6366F1",
    featured: false,
  },
  {
    name: "Single Setup",
    price: "549",
    description: "One fully configured AI agent or automation workflow",
    borderColor: "rgba(139, 92, 246, 0.2)",
    glowColor: "rgba(139, 92, 246, 0.1)",
    accentColor: "#8B5CF6",
    featured: false,
  },
  {
    name: "Command Center",
    price: "999",
    description: "Multi-agent system with integrations and training",
    borderColor: "rgba(6, 182, 212, 0.3)",
    glowColor: "rgba(6, 182, 212, 0.15)",
    accentColor: "#06B6D4",
    featured: true,
  },
  {
    name: "Enterprise",
    price: "1,999",
    description: "Full-scale AI infrastructure across your organisation",
    borderColor: "rgba(16, 185, 129, 0.2)",
    glowColor: "rgba(16, 185, 129, 0.1)",
    accentColor: "#10B981",
    featured: false,
  },
];

export default function ServicesSection() {
  return (
    <section
      className="py-20 md:py-28 relative overflow-hidden"
      style={{
        background:
          "linear-gradient(180deg, transparent 0%, rgba(99,102,241,0.03) 50%, transparent 100%)",
      }}
    >
      {/* Horizontal lines pattern */}
      <div
        className="absolute inset-0 pointer-events-none opacity-[0.015]"
        style={{
          backgroundImage:
            "repeating-linear-gradient(0deg, rgba(255,255,255,0.5), rgba(255,255,255,0.5) 1px, transparent 1px, transparent 80px)",
        }}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <ScrollReveal>
          <div className="text-center mb-14">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Want Us To Build It For You?
            </h2>
            <p className="text-lg text-zinc-400 max-w-2xl mx-auto">
              Not everyone wants to DIY. Our expert team will design, build, and
              deploy custom AI automation tailored to your business.
            </p>
          </div>
        </ScrollReveal>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-12 items-end">
          {tiers.map((tier, i) => (
            <ScrollReveal key={tier.name} delay={i * 100}>
              <div
                className={`group relative rounded-2xl overflow-hidden text-center transition-all duration-300 ${
                  tier.featured ? "lg:-mt-4 lg:mb-0" : ""
                }`}
                style={{
                  background: tier.featured
                    ? "rgba(255, 255, 255, 0.05)"
                    : "rgba(255, 255, 255, 0.02)",
                  backdropFilter: "blur(20px)",
                  WebkitBackdropFilter: "blur(20px)",
                  border: `1px solid ${tier.borderColor}`,
                  padding: tier.featured ? "2rem 1.5rem" : "1.5rem",
                }}
                onMouseEnter={(e) => {
                  const el = e.currentTarget;
                  el.style.transform = "translateY(-6px) scale(1.02)";
                  el.style.borderColor = tier.accentColor;
                  el.style.boxShadow = `0 0 40px ${tier.glowColor}, 0 20px 40px rgba(0,0,0,0.3)`;
                }}
                onMouseLeave={(e) => {
                  const el = e.currentTarget;
                  el.style.transform = "translateY(0) scale(1)";
                  el.style.borderColor = tier.borderColor;
                  el.style.boxShadow = "none";
                }}
              >
                {/* Featured badge */}
                {tier.featured && (
                  <div
                    className="absolute top-0 left-0 right-0 py-1.5 text-xs font-semibold tracking-wide uppercase"
                    style={{
                      background: `linear-gradient(135deg, ${tier.accentColor}, #8B5CF6)`,
                      color: "white",
                    }}
                  >
                    Most Popular
                  </div>
                )}

                <div className={tier.featured ? "pt-4" : ""}>
                  <h3 className="text-lg font-semibold text-white mb-2">
                    {tier.name}
                  </h3>
                  <p
                    className="text-3xl md:text-4xl font-bold mb-3"
                    style={{
                      background: `linear-gradient(135deg, ${tier.accentColor}, #8B5CF6)`,
                      WebkitBackgroundClip: "text",
                      WebkitTextFillColor: "transparent",
                      backgroundClip: "text",
                    }}
                  >
                    &pound;{tier.price}
                  </p>
                  <p className="text-zinc-400 text-sm leading-relaxed mb-5">
                    {tier.description}
                  </p>
                  <Link
                    href="/services"
                    className="inline-flex items-center gap-1 text-sm font-medium transition-colors"
                    style={{ color: tier.accentColor }}
                  >
                    Learn more
                    <ArrowRight
                      className="w-3.5 h-3.5 transition-transform duration-300 group-hover:translate-x-1"
                      aria-hidden="true"
                    />
                  </Link>
                </div>
              </div>
            </ScrollReveal>
          ))}
        </div>

        <ScrollReveal delay={400}>
          <div className="text-center">
            <Link
              href="/services"
              className="inline-block px-8 py-4 rounded-xl font-semibold text-lg text-white focus-glow transition-all duration-300"
              style={{
                background: "linear-gradient(135deg, #6366F1, #8B5CF6)",
                boxShadow:
                  "0 0 20px rgba(99, 102, 241, 0.2), 0 4px 16px rgba(0, 0, 0, 0.3)",
              }}
              onMouseEnter={(e) => {
                const el = e.currentTarget;
                el.style.background =
                  "linear-gradient(135deg, #818CF8, #A78BFA)";
                el.style.transform = "scale(1.02)";
                el.style.boxShadow =
                  "0 0 30px rgba(99, 102, 241, 0.4), 0 4px 20px rgba(0, 0, 0, 0.3)";
              }}
              onMouseLeave={(e) => {
                const el = e.currentTarget;
                el.style.background =
                  "linear-gradient(135deg, #6366F1, #8B5CF6)";
                el.style.transform = "scale(1)";
                el.style.boxShadow =
                  "0 0 20px rgba(99, 102, 241, 0.2), 0 4px 16px rgba(0, 0, 0, 0.3)";
              }}
            >
              Book a Strategy Session
            </Link>
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
}
