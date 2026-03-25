"use client";

import Link from "next/link";
import { Workflow, Bot, MessageSquare, Wrench } from "lucide-react";
import { ArrowRight } from "lucide-react";
import ScrollReveal from "./ScrollReveal";

const categories = [
  {
    icon: Workflow,
    title: "AI Automation Blueprints",
    description:
      "Complete workflow systems that connect your tools and eliminate manual tasks. Copy, configure, deploy.",
    href: "/products?category=automation-blueprints",
    accent: "#6366F1",
    span: "md:col-span-2 md:row-span-1",
  },
  {
    icon: Bot,
    title: "AI Agent Configurations",
    description:
      "Pre-built multi-agent setups for customer support, content, research, and operations. Plug in and go.",
    href: "/products?category=agent-configs",
    accent: "#8B5CF6",
    span: "md:col-span-1 md:row-span-2",
  },
  {
    icon: MessageSquare,
    title: "Prompt Engineering",
    description:
      "Master the art of AI communication. Battle-tested prompt packs that produce consistent, high-quality output.",
    href: "/products?category=prompt-packs",
    accent: "#06B6D4",
    span: "md:col-span-1 md:row-span-1",
  },
  {
    icon: Wrench,
    title: "Expert Setup Services",
    description:
      "We build and deploy AI automation for you. From strategy sessions to full enterprise rollouts.",
    href: "/services",
    accent: "#F59E0B",
    span: "md:col-span-1 md:row-span-1",
  },
];

export default function CategoriesSection() {
  return (
    <section className="py-20 md:py-28 relative overflow-hidden">
      {/* Subtle gradient background different from adjacent sections */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse 80% 60% at 50% 0%, rgba(139, 92, 246, 0.04), transparent)",
        }}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <ScrollReveal>
          <div className="text-center mb-14">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              What We Offer
            </h2>
            <p className="text-lg text-zinc-400">
              Everything you need to build an AI-powered business
            </p>
          </div>
        </ScrollReveal>

        {/* Bento grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 md:grid-rows-2 gap-5">
          {categories.map((cat, i) => (
            <ScrollReveal key={cat.title} delay={i * 100} className={cat.span}>
              <Link
                href={cat.href}
                className="group block h-full relative p-7 rounded-2xl overflow-hidden transition-all duration-300 hover:-translate-y-1"
                style={{
                  background: "rgba(255, 255, 255, 0.03)",
                  backdropFilter: "blur(20px)",
                  WebkitBackdropFilter: "blur(20px)",
                  border: "1px solid rgba(255, 255, 255, 0.06)",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = `${cat.accent}55`;
                  e.currentTarget.style.boxShadow = `0 0 30px ${cat.accent}15, 0 8px 32px rgba(0,0,0,0.3)`;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = "rgba(255,255,255,0.06)";
                  e.currentTarget.style.boxShadow = "none";
                }}
              >
                {/* Accent gradient in corner */}
                <div
                  className="absolute top-0 right-0 w-32 h-32 opacity-[0.06] rounded-full blur-2xl pointer-events-none"
                  style={{ background: cat.accent }}
                />

                <div
                  className="w-12 h-12 rounded-xl flex items-center justify-center mb-5 transition-transform duration-300 group-hover:scale-110"
                  style={{ background: `${cat.accent}15` }}
                >
                  <cat.icon
                    className="w-6 h-6 transition-colors duration-300"
                    style={{ color: cat.accent }}
                    aria-hidden="true"
                  />
                </div>
                <h3 className="text-xl font-semibold text-white mb-2 group-hover:text-indigo-300 transition-colors">
                  {cat.title}
                </h3>
                <p className="text-zinc-400 text-sm leading-relaxed mb-4">
                  {cat.description}
                </p>
                <span
                  className="text-sm font-medium inline-flex items-center gap-1 transition-colors duration-300"
                  style={{ color: cat.accent }}
                >
                  Browse
                  <ArrowRight
                    className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1"
                    aria-hidden="true"
                  />
                </span>
              </Link>
            </ScrollReveal>
          ))}
        </div>
      </div>
    </section>
  );
}
