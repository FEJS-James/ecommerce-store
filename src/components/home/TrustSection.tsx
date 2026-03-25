"use client";

import ScrollReveal from "./ScrollReveal";

const pillars = [
  {
    title: "Built by Operators, Not Theorists",
    description:
      "Every product comes from real-world deployment. We build and run AI automation ourselves before we sell it to you.",
    accent: "#6366F1",
    // Shield icon SVG path
    iconPath:
      "M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z",
  },
  {
    title: "Deploy on YOUR Machine",
    description:
      "No vendor lock-in, no monthly SaaS fees. Our agents and automations run locally or on your own infrastructure.",
    accent: "#8B5CF6",
    // Server icon SVG path
    iconPath:
      "M2 9h20M2 15h20M4 5h16a2 2 0 012 2v10a2 2 0 01-2 2H4a2 2 0 01-2-2V7a2 2 0 012-2zM8 12h.01M8 18h.01",
  },
  {
    title: "From £19 Products to £1,999 Done-For-You",
    description:
      "Whether you want a DIY blueprint or a full enterprise rollout, we have the right option for your budget and timeline.",
    accent: "#06B6D4",
    // Layers icon SVG path
    iconPath:
      "M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5",
  },
  {
    title: "Real Results, Not Hype",
    description:
      "No inflated promises. No fake screenshots. Just clear documentation, proven workflows, and measurable outcomes.",
    accent: "#F59E0B",
    // Target icon SVG path
    iconPath:
      "M12 12m-10 0a10 10 0 1020 0 10 10 0 10-20 0M12 12m-6 0a6 6 0 1012 0 6 6 0 10-12 0M12 12m-2 0a2 2 0 104 0 2 2 0 10-4 0",
  },
];

export default function TrustSection() {
  return (
    <section
      className="py-20 md:py-28 relative overflow-hidden"
      style={{
        background:
          "linear-gradient(180deg, rgba(139, 92, 246, 0.03), transparent)",
      }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
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

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {pillars.map((pillar, i) => (
            <ScrollReveal key={pillar.title} delay={i * 120}>
              <div
                className="group relative p-8 rounded-2xl overflow-hidden h-full transition-all duration-300 hover:-translate-y-1"
                style={{
                  background: "rgba(255, 255, 255, 0.03)",
                  backdropFilter: "blur(20px)",
                  WebkitBackdropFilter: "blur(20px)",
                  border: `1px solid ${pillar.accent}20`,
                }}
                onMouseEnter={(e) => {
                  const el = e.currentTarget as HTMLElement;
                  el.style.borderColor = `${pillar.accent}40`;
                  el.style.boxShadow = `0 0 40px ${pillar.accent}10, 0 8px 32px rgba(0,0,0,0.3)`;
                }}
                onMouseLeave={(e) => {
                  const el = e.currentTarget as HTMLElement;
                  el.style.borderColor = `${pillar.accent}20`;
                  el.style.boxShadow = "none";
                }}
              >
                {/* Unique gradient accent glow per card */}
                <div
                  className="absolute -top-10 -right-10 w-40 h-40 rounded-full blur-3xl opacity-[0.07] pointer-events-none transition-opacity duration-300 group-hover:opacity-[0.12]"
                  style={{ background: pillar.accent }}
                />

                {/* SVG icon with line-draw animation */}
                <div
                  className="w-14 h-14 rounded-xl flex items-center justify-center mb-5"
                  style={{ background: `${pillar.accent}12` }}
                >
                  <svg
                    className="w-7 h-7"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke={pillar.accent}
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    aria-hidden="true"
                    style={{
                      strokeDasharray: 100,
                      strokeDashoffset: 100,
                      animation: "lineDraw 1.5s ease-out forwards",
                      animationDelay: `${0.3 + i * 0.2}s`,
                    }}
                  >
                    <path d={pillar.iconPath} />
                  </svg>
                </div>

                <h3 className="text-xl font-semibold text-white mb-2">
                  {pillar.title}
                </h3>
                <p className="text-zinc-400 text-sm leading-relaxed">
                  {pillar.description}
                </p>
              </div>
            </ScrollReveal>
          ))}
        </div>
      </div>
    </section>
  );
}
