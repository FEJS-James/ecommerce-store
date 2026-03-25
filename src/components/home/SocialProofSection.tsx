"use client";

import { Zap, Lock, ShieldCheck, Headphones } from "lucide-react";
import ScrollReveal from "./ScrollReveal";

const badges = [
  {
    icon: Zap,
    title: "Instant Delivery",
    description: "Download your products immediately after purchase",
    color: "#F59E0B",
  },
  {
    icon: Lock,
    title: "Lifetime Access",
    description: "Buy once, own forever. Free updates included.",
    color: "#6366F1",
  },
  {
    icon: ShieldCheck,
    title: "30-Day Guarantee",
    description: "Not satisfied? Full refund, no questions asked",
    color: "#10B981",
  },
  {
    icon: Headphones,
    title: "Expert Support",
    description: "Real humans who understand AI, ready to help you succeed",
    color: "#06B6D4",
  },
];

export default function SocialProofSection() {
  return (
    <section
      className="py-20 md:py-28 relative overflow-hidden"
      style={{
        background:
          "radial-gradient(ellipse 80% 60% at 50% 50%, rgba(6,182,212,0.04), transparent)",
      }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <ScrollReveal>
          <div className="text-center mb-14">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Trusted by Businesses Building with AI
            </h2>
            <p className="text-lg text-zinc-400">
              Join hundreds of businesses already using AI Armory tools
            </p>
          </div>
        </ScrollReveal>

        {/* Horizontal layout — not grid boxes */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {badges.map((badge, i) => (
            <ScrollReveal key={badge.title} delay={i * 100}>
              <div className="text-center group">
                {/* Icon with unique color ring */}
                <div className="relative inline-flex items-center justify-center mb-5">
                  <div
                    className="w-16 h-16 rounded-full flex items-center justify-center transition-transform duration-300 group-hover:scale-110"
                    style={{
                      background: `${badge.color}10`,
                      border: `1px solid ${badge.color}30`,
                    }}
                  >
                    <badge.icon
                      className="w-7 h-7"
                      style={{ color: badge.color }}
                      aria-hidden="true"
                    />
                  </div>
                  {/* Subtle glow on hover */}
                  <div
                    className="absolute w-16 h-16 rounded-full blur-xl opacity-0 transition-opacity duration-300 group-hover:opacity-40"
                    style={{ background: badge.color }}
                  />
                </div>

                <h3 className="text-white font-semibold text-lg mb-2">
                  {badge.title}
                </h3>
                <p className="text-zinc-400 text-sm leading-relaxed">
                  {badge.description}
                </p>
              </div>
            </ScrollReveal>
          ))}
        </div>
      </div>
    </section>
  );
}
