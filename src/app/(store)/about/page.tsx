import Link from "next/link";
import { Shield, Target, Zap, Users, ArrowRight } from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "About",
  description:
    "AI Armory makes AI automation accessible to every business. Built by operators, not theorists.",
};

const STATS = [
  {
    icon: <Zap className="w-6 h-6 text-indigo-400" aria-hidden="true" />,
    value: "20+",
    label: "Products available",
  },
  {
    icon: <Users className="w-6 h-6 text-indigo-400" aria-hidden="true" />,
    value: "99%",
    label: "Customer satisfaction",
  },
  {
    icon: <Shield className="w-6 h-6 text-indigo-400" aria-hidden="true" />,
    value: "<24h",
    label: "Support response time",
  },
];

const VALUES = [
  {
    icon: <Target className="w-6 h-6 text-indigo-400" aria-hidden="true" />,
    title: "Built by Operators",
    description:
      "Every product we sell has been tested in real workflows. We build tools we use ourselves, not theoretical frameworks that look good on paper.",
  },
  {
    icon: <Zap className="w-6 h-6 text-indigo-400" aria-hidden="true" />,
    title: "Instant Value",
    description:
      "No lengthy onboarding. No complex setup. Download, open, and start getting results immediately. Your time is too valuable for friction.",
  },
  {
    icon: <Shield className="w-6 h-6 text-indigo-400" aria-hidden="true" />,
    title: "No Subscriptions",
    description:
      "Pay once, own it forever. Every product comes with lifetime access and free updates. No recurring fees, no lock-in, no surprises.",
  },
  {
    icon: <Users className="w-6 h-6 text-indigo-400" aria-hidden="true" />,
    title: "Hands-On Support",
    description:
      "When you need help, you get a real person. Our services are delivered 1-on-1 via video call, not through chatbots or ticket queues.",
  },
];

export default function AboutPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
      {/* Hero */}
      <div className="text-center mb-16">
        <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
          About AI Armory
        </h1>
        <p className="text-zinc-400 text-lg max-w-2xl mx-auto leading-relaxed">
          We make AI automation accessible to every business. From ready-made
          digital products to hands-on implementation services, we give you the
          tools to work smarter.
        </p>
      </div>

      {/* Mission */}
      <section className="mb-16">
        <div className="glass rounded-2xl p-8">
          <h2 className="text-2xl font-bold text-white mb-4">Our Mission</h2>
          <p className="text-zinc-400 leading-relaxed mb-4">
            AI is transforming how businesses operate, but most companies
            struggle to bridge the gap between potential and practice. The tools
            exist. The knowledge exists. What&apos;s missing is the practical
            bridge between &quot;this could help&quot; and &quot;this is
            working.&quot;
          </p>
          <p className="text-zinc-400 leading-relaxed">
            AI Armory exists to build that bridge. We create digital products
            that deliver immediate value and offer services that implement
            real-world automation. No hype. No buzzwords. Just practical tools
            that solve real problems.
          </p>
        </div>
      </section>

      {/* What Makes Us Different */}
      <section className="mb-16">
        <h2 className="text-2xl font-bold text-white mb-8 text-center">
          What Makes Us Different
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {VALUES.map((value) => (
            <div key={value.title} className="glass card-glow rounded-2xl p-6">
              <div
                className="w-12 h-12 rounded-xl flex items-center justify-center mb-4"
                style={{ background: "rgba(99, 102, 241, 0.1)" }}
              >
                {value.icon}
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">
                {value.title}
              </h3>
              <p className="text-zinc-400 text-sm leading-relaxed">
                {value.description}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Trust Stats */}
      <section className="mb-16">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          {STATS.map((stat) => (
            <div
              key={stat.label}
              className="glass card-glow rounded-2xl p-6 text-center"
            >
              <div
                className="w-12 h-12 rounded-xl flex items-center justify-center mx-auto mb-3"
                style={{ background: "rgba(99, 102, 241, 0.1)" }}
              >
                {stat.icon}
              </div>
              <p className="text-3xl font-bold text-white mb-1">{stat.value}</p>
              <p className="text-zinc-500 text-sm">{stat.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section>
        <div className="glass rounded-2xl p-8 text-center">
          <h2 className="text-2xl font-bold text-white mb-3">
            Need Hands-On Help?
          </h2>
          <p className="text-zinc-400 mb-6 max-w-lg mx-auto">
            Our services team can implement AI automation directly in your
            business. From strategy sessions to full-scale deployments.
          </p>
          <Link
            href="/services"
            className="btn-gradient inline-flex items-center gap-2 px-6 py-3 rounded-lg font-medium text-sm focus-glow"
          >
            View Services
            <ArrowRight className="w-4 h-4" aria-hidden="true" />
          </Link>
        </div>
      </section>
    </div>
  );
}
