"use client";

import AnimatedCounter from "@/components/AnimatedCounter";
import ScrollReveal from "@/components/home/ScrollReveal";

const stats = [
  { end: 500, suffix: "+", label: "Products Delivered" },
  { end: 98, suffix: "%", label: "Client Satisfaction" },
  { end: 24, suffix: "/7", label: "AI Systems Running" },
];

export default function StatsSection() {
  return (
    <section
      className="py-20 md:py-28 border-t border-white/[0.06] overflow-hidden"
      style={{
        background:
          "linear-gradient(180deg, rgba(99, 102, 241, 0.04), transparent)",
      }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Left: headline */}
          <ScrollReveal direction="left">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
                Trusted by builders
                <br />
                who ship with{" "}
                <span className="bg-gradient-to-r from-indigo-400 to-cyan-400 bg-clip-text text-transparent">
                  AI
                </span>
              </h2>
              <p className="text-lg text-zinc-400 max-w-md">
                From solo founders to scaling teams, our tools power real
                automation across industries — every day, around the clock.
              </p>
            </div>
          </ScrollReveal>

          {/* Right: stat cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
            {stats.map((stat, i) => (
              <ScrollReveal key={stat.label} delay={i * 120} direction="up">
                <div className="relative group rounded-2xl p-[1px] overflow-hidden">
                  {/* Gradient border */}
                  <div
                    className="absolute inset-0 rounded-2xl opacity-60 group-hover:opacity-100 transition-opacity duration-500"
                    style={{
                      background:
                        "linear-gradient(135deg, rgba(99,102,241,0.5), rgba(6,182,212,0.5), rgba(139,92,246,0.5))",
                    }}
                  />
                  {/* Glass card inner */}
                  <div className="relative rounded-2xl bg-zinc-950/80 backdrop-blur-xl p-6 text-center">
                    <div className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-indigo-400 to-cyan-400 bg-clip-text text-transparent mb-2">
                      <AnimatedCounter
                        end={stat.end}
                        suffix={stat.suffix}
                        duration={2000}
                      />
                    </div>
                    <p className="text-sm text-zinc-400 font-medium">
                      {stat.label}
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
