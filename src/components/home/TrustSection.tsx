"use client";

import { Shield, Server, Layers, Target } from "lucide-react";
import ScrollReveal from "./ScrollReveal";

const pillars = [
  {
    icon: Shield,
    title: "Built by Operators, Not Theorists",
    description:
      "Every product comes from real-world deployment. We build and run AI automation ourselves before we sell it to you.",
    accentColor: "#6366F1",
    gradientFrom: "rgba(99, 102, 241, 0.15)",
    gradientTo: "rgba(99, 102, 241, 0.02)",
  },
  {
    icon: Server,
    title: "Deploy on YOUR Machine",
    description:
      "No vendor lock-in, no monthly SaaS fees. Our agents and automations run locally or on your own infrastructure.",
    accentColor: "#8B5CF6",
    gradientFrom: "rgba(139, 92, 246, 0.15)",
    gradientTo: "rgba(139, 92, 246, 0.02)",
  },
  {
    icon: Layers,
    title: "From $19 Products to $1,999 Done-For-You",
    description:
      "Whether you want a DIY blueprint or a full enterprise rollout, we have the right option for your budget and timeline.",
    accentColor: "#06B6D4",
    gradientFrom: "rgba(6, 182, 212, 0.15)",
    gradientTo: "rgba(6, 182, 212, 0.02)",
  },
  {
    icon: Target,
    title: "Real Results, Not Hype",
    description:
      "No inflated promises. No fake screenshots. Just clear documentation, proven workflows, and measurable outcomes.",
    accentColor: "#10B981",
    gradientFrom: "rgba(16, 185, 129, 0.15)",
    gradientTo: "rgba(16, 185, 129, 0.02)",
  },
];

export default function TrustSection() {
  return (
    <section className="py-20 md:py-28 relative overflow-hidden">
      {/* Unique background: diagonal gradient */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "linear-gradient(135deg, rgba(139,92,246,0.04) 0%, transparent 50%, rgba(6,182,212,0.03) 100%)",
        }}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <ScrollReveal>
          <div className="text-center mb-14">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Why AI Armory?
            </h2>
            <p className="text-lg text-zinc-400">
              We are not another AI hype brand. Here is what makes us different.
            </p>
          </div>
        </ScrollReveal>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {pillars.map((pillar, i) => (
            <ScrollReveal key={pillar.title} delay={i * 120}>
              <div
                className="group relative rounded-2xl p-8 h-full overflow-hidden transition-all duration-300"
                style={{
                  background: "rgba(255, 255, 255, 0.02)",
                  backdropFilter: "blur(20px)",
                  WebkitBackdropFilter: "blur(20px)",
                  border: `1px solid rgba(255,255,255,0.06)`,
                }}
                onMouseEnter={(e) => {
                  const el = e.currentTarget;
                  el.style.borderColor = `${pillar.accentColor}40`;
                  el.style.transform = "translateY(-4px)";
                  el.style.boxShadow = `0 0 40px ${pillar.accentColor}15, 0 8px 32px rgba(0,0,0,0.3)`;
                }}
                onMouseLeave={(e) => {
                  const el = e.currentTarget;
                  el.style.borderColor = "rgba(255,255,255,0.06)";
                  el.style.transform = "translateY(0)";
                  el.style.boxShadow = "none";
                }}
              >
                {/* Unique gradient accent per card */}
                <div
                  className="absolute top-0 left-0 right-0 h-[2px]"
                  style={{
                    background: `linear-gradient(90deg, transparent, ${pillar.accentColor}, transparent)`,
                    opacity: 0.5,
                  }}
                />

                {/* Corner glow */}
                <div
                  className="absolute -top-20 -right-20 w-40 h-40 rounded-full blur-3xl transition-opacity duration-300 opacity-0 group-hover:opacity-100"
                  style={{ background: pillar.gradientFrom }}
                />

                <div className="relative">
                  {/* Icon with unique glow */}
                  <div
                    className="w-14 h-14 rounded-xl flex items-center justify-center mb-5 transition-transform duration-300 group-hover:scale-110"
                    style={{
                      background: `linear-gradient(135deg, ${pillar.gradientFrom}, ${pillar.gradientTo})`,
                      border: `1px solid ${pillar.accentColor}25`,
                    }}
                  >
                    <pillar.icon
                      className="w-7 h-7"
                      style={{ color: pillar.accentColor }}
                      aria-hidden="true"
                    />
                  </div>

                  <h3 className="text-xl font-semibold text-white mb-3">
                    {pillar.title}
                  </h3>
                  <p className="text-zinc-400 text-sm leading-relaxed">
                    {pillar.description}
                  </p>
                </div>
              </div>
            </ScrollReveal>
          ))}
        </div>
      </div>
    </section>
  );
}
