"use client";

import { Crosshair, Zap, TrendingUp } from "lucide-react";
import ScrollReveal from "./ScrollReveal";

const steps = [
  {
    icon: Crosshair,
    step: "01",
    title: "Choose Your Weapon",
    description:
      "Browse our library of automation blueprints, agent configurations, and prompt packs. Find the tool that fits your workflow.",
  },
  {
    icon: Zap,
    step: "02",
    title: "Deploy in Minutes",
    description:
      "Download your product, follow the step-by-step guide, and have AI working for your business today. Not next quarter.",
  },
  {
    icon: TrendingUp,
    step: "03",
    title: "Scale Without Limits",
    description:
      "Add more agents, automate more processes, grow revenue — without hiring. Your AI workforce scales with you.",
  },
];

export default function HowItWorksSection() {
  return (
    <section
      className="py-20 md:py-28 relative overflow-hidden"
      style={{
        background:
          "linear-gradient(180deg, rgba(99, 102, 241, 0.03), transparent)",
      }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <ScrollReveal>
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              How It Works
            </h2>
            <p className="text-lg text-zinc-400">
              Three steps. No complexity. No fluff.
            </p>
          </div>
        </ScrollReveal>

        {/* Desktop: Horizontal timeline */}
        <div className="hidden md:block relative">
          {/* Connecting line */}
          <div className="absolute top-[52px] left-[16.67%] right-[16.67%] h-[2px]">
            <div
              className="h-full rounded-full"
              style={{
                background:
                  "linear-gradient(90deg, rgba(99,102,241,0.4), rgba(139,92,246,0.4), rgba(6,182,212,0.4))",
              }}
            />
          </div>

          <div className="grid grid-cols-3 gap-8 relative z-10">
            {steps.map((item, i) => (
              <ScrollReveal key={item.step} delay={i * 200}>
                <div className="flex flex-col items-center text-center">
                  {/* Icon node on the line */}
                  <div
                    className="w-[104px] h-[104px] rounded-full flex items-center justify-center mb-8 relative"
                    style={{
                      background: "rgba(255, 255, 255, 0.03)",
                      backdropFilter: "blur(20px)",
                      WebkitBackdropFilter: "blur(20px)",
                      border: "1px solid rgba(99, 102, 241, 0.2)",
                    }}
                  >
                    {/* Subtle glow behind icon */}
                    <div
                      className="absolute inset-0 rounded-full opacity-20 blur-xl"
                      style={{
                        background:
                          i === 0
                            ? "#6366F1"
                            : i === 1
                              ? "#8B5CF6"
                              : "#06B6D4",
                      }}
                    />
                    <item.icon
                      className="w-8 h-8 relative z-10"
                      style={{
                        color:
                          i === 0
                            ? "#6366F1"
                            : i === 1
                              ? "#8B5CF6"
                              : "#06B6D4",
                      }}
                      aria-hidden="true"
                    />
                  </div>

                  <span className="text-xs font-mono text-zinc-600 mb-2">
                    STEP {item.step}
                  </span>
                  <h3 className="text-xl font-semibold text-white mb-3">
                    {item.title}
                  </h3>
                  <p className="text-zinc-400 text-sm leading-relaxed max-w-xs">
                    {item.description}
                  </p>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>

        {/* Mobile: Vertical timeline */}
        <div className="md:hidden relative pl-8">
          {/* Vertical line */}
          <div
            className="absolute left-[19px] top-0 bottom-0 w-[2px]"
            style={{
              background:
                "linear-gradient(180deg, rgba(99,102,241,0.4), rgba(139,92,246,0.4), rgba(6,182,212,0.4))",
            }}
          />

          <div className="space-y-12">
            {steps.map((item, i) => (
              <ScrollReveal key={item.step} delay={i * 150}>
                <div className="relative">
                  {/* Node on the line */}
                  <div
                    className="absolute -left-8 top-0 w-10 h-10 rounded-full flex items-center justify-center"
                    style={{
                      background: "#0A0A0F",
                      border: `2px solid ${i === 0 ? "rgba(99,102,241,0.5)" : i === 1 ? "rgba(139,92,246,0.5)" : "rgba(6,182,212,0.5)"}`,
                    }}
                  >
                    <item.icon
                      className="w-4 h-4"
                      style={{
                        color:
                          i === 0
                            ? "#6366F1"
                            : i === 1
                              ? "#8B5CF6"
                              : "#06B6D4",
                      }}
                      aria-hidden="true"
                    />
                  </div>

                  <div className="pl-6">
                    <span className="text-xs font-mono text-zinc-600">
                      STEP {item.step}
                    </span>
                    <h3 className="text-lg font-semibold text-white mt-1 mb-2">
                      {item.title}
                    </h3>
                    <p className="text-zinc-400 text-sm leading-relaxed">
                      {item.description}
                    </p>
                  </div>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
