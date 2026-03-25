import Link from "next/link";
import { queryAll } from "@/lib/db";
import ProductCard from "@/components/ProductCard";
import EmailSignup from "@/components/EmailSignup";
import AnimatedCounter from "@/components/AnimatedCounter";
import {
  Crosshair,
  Zap,
  TrendingUp,
  Workflow,
  Bot,
  MessageSquare,
  Wrench,
  Shield,
  Server,
  Layers,
  Target,
  Clock,
  Headphones,
  Lock,
  ShieldCheck,
  ArrowRight,
} from "lucide-react";
import type { Product } from "@/lib/types";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const featuredProducts = await queryAll<Product>(
    "SELECT * FROM products WHERE featured = 1 AND status = 'active' LIMIT 4",
  );

  return (
    <>
      {/* Section 1: Hero */}
      <section
        className="gradient-mesh relative"
        style={{ background: "#0A0A0F" }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 md:py-36 relative z-10">
          <div className="max-w-3xl">
            <h1 className="text-4xl sm:text-5xl md:text-7xl font-bold leading-[1.1] mb-6 tracking-tight">
              The Future Runs on AI.{" "}
              <span className="gradient-text">Your Business Should Too.</span>
            </h1>
            <p className="text-lg md:text-xl text-zinc-400 mb-10 leading-relaxed max-w-2xl">
              AI Armory delivers ready-to-deploy automation blueprints, agent
              configurations, and expert setup services. Stop researching. Start
              automating.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Link
                href="/products"
                className="btn-gradient px-8 py-4 rounded-xl font-semibold text-lg text-center focus-glow"
              >
                Browse Products
              </Link>
              <Link
                href="/services"
                className="btn-ghost px-8 py-4 rounded-xl font-semibold text-lg text-center focus-glow"
              >
                Book a Strategy Session
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Section 2: The AI Automation Revolution */}
      <section className="py-20 md:py-28 border-t border-white/[0.06]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              AI Automation Is Not Coming.{" "}
              <span className="gradient-text">It Is Here.</span>
            </h2>
            <p className="text-lg text-zinc-400 max-w-2xl mx-auto">
              Businesses that automate with AI save 15 to 30 hours every week.
              The ones that wait get left behind.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
            <div className="glass card-glow p-8 rounded-2xl text-center">
              <p className="text-4xl md:text-5xl font-bold gradient-text mb-3">
                <AnimatedCounter end={73} suffix="%" />
              </p>
              <p className="text-zinc-400 text-sm leading-relaxed">
                of businesses will use AI automation by 2027
              </p>
            </div>
            <div className="glass card-glow p-8 rounded-2xl text-center">
              <p className="text-4xl md:text-5xl font-bold gradient-text mb-3">
                <AnimatedCounter end={15} suffix="-30 hrs" />
              </p>
              <p className="text-zinc-400 text-sm leading-relaxed">
                saved per week with proper AI setup
              </p>
            </div>
            <div className="glass card-glow p-8 rounded-2xl text-center">
              <p className="text-4xl md:text-5xl font-bold gradient-text mb-3">
                <AnimatedCounter end={0} prefix="$" />
              </p>
              <p className="text-zinc-400 text-sm leading-relaxed">
                ongoing cost — AI agents run on your own machine
              </p>
            </div>
          </div>

          <p className="text-center text-zinc-500 max-w-2xl mx-auto">
            AI agents handle customer support, content creation, data
            processing, scheduling, and dozens of other tasks — around the
            clock, without burnout. The tools exist right now. You just need the
            right setup.
          </p>
        </div>
      </section>

      {/* Section 3: How It Works */}
      <section
        className="py-20 md:py-28 border-t border-white/[0.06]"
        style={{
          background:
            "linear-gradient(180deg, rgba(99, 102, 241, 0.03), transparent)",
        }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              How It Works
            </h2>
            <p className="text-lg text-zinc-400">
              Three steps. No complexity. No fluff.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
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
            ].map((item) => (
              <div key={item.step} className="glass card-glow p-8 rounded-2xl">
                <div className="flex items-center gap-4 mb-5">
                  <div
                    className="w-12 h-12 rounded-xl flex items-center justify-center"
                    style={{ background: "rgba(99, 102, 241, 0.1)" }}
                  >
                    <item.icon
                      className="w-6 h-6 text-indigo-400"
                      aria-hidden="true"
                    />
                  </div>
                  <span className="text-sm font-mono text-zinc-600">
                    {item.step}
                  </span>
                </div>
                <h3 className="text-xl font-semibold text-white mb-3">
                  {item.title}
                </h3>
                <p className="text-zinc-400 text-sm leading-relaxed">
                  {item.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Section 4: What We Offer — Product Categories */}
      <section className="py-20 md:py-28 border-t border-white/[0.06]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              What We Offer
            </h2>
            <p className="text-lg text-zinc-400">
              Everything you need to build an AI-powered business
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {[
              {
                icon: Workflow,
                title: "AI Automation Blueprints",
                description:
                  "Complete workflow systems that connect your tools and eliminate manual tasks. Copy, configure, deploy.",
                href: "/products?category=automation-blueprints",
              },
              {
                icon: Bot,
                title: "AI Agent Configurations",
                description:
                  "Pre-built multi-agent setups for customer support, content, research, and operations. Plug in and go.",
                href: "/products?category=agent-configs",
              },
              {
                icon: MessageSquare,
                title: "Prompt Engineering",
                description:
                  "Master the art of AI communication. Battle-tested prompt packs that produce consistent, high-quality output.",
                href: "/products?category=prompt-packs",
              },
              {
                icon: Wrench,
                title: "Expert Setup Services",
                description:
                  "We build and deploy AI automation for you. From strategy sessions to full enterprise rollouts.",
                href: "/services",
              },
            ].map((category) => (
              <Link
                key={category.title}
                href={category.href}
                className="group glass card-glow p-8 rounded-2xl focus-glow"
              >
                <div
                  className="w-12 h-12 rounded-xl flex items-center justify-center mb-5"
                  style={{ background: "rgba(99, 102, 241, 0.1)" }}
                >
                  <category.icon
                    className="w-6 h-6 text-indigo-400 group-hover:text-cyan-400 transition-colors"
                    aria-hidden="true"
                  />
                </div>
                <h3 className="text-xl font-semibold text-white mb-2 group-hover:text-indigo-300 transition-colors">
                  {category.title}
                </h3>
                <p className="text-zinc-400 text-sm leading-relaxed mb-4">
                  {category.description}
                </p>
                <span className="text-indigo-400 text-sm font-medium inline-flex items-center gap-1 group-hover:text-cyan-400 transition-colors">
                  Browse
                  <ArrowRight className="w-4 h-4" aria-hidden="true" />
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Section 5: Featured Products */}
      {Array.isArray(featuredProducts) && featuredProducts.length > 0 && (
        <section className="py-20 md:py-28 border-t border-white/[0.06]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-14">
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
                Featured Products
              </h2>
              <p className="text-lg text-zinc-400">
                Our most popular tools, hand-picked for impact
              </p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {featuredProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
            <div className="mt-10 text-center">
              <Link
                href="/products"
                className="text-indigo-400 hover:text-cyan-400 font-medium transition-colors inline-flex items-center gap-1"
              >
                View all products
                <ArrowRight className="w-4 h-4" aria-hidden="true" />
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* Section 6: Why AI Armory? */}
      <section
        className="py-20 md:py-28 border-t border-white/[0.06]"
        style={{
          background:
            "linear-gradient(180deg, rgba(139, 92, 246, 0.03), transparent)",
        }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Why AI Armory?
            </h2>
            <p className="text-lg text-zinc-400">
              We are not another AI hype brand. Here is what makes us different.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {[
              {
                icon: Shield,
                title: "Built by Operators, Not Theorists",
                description:
                  "Every product comes from real-world deployment. We build and run AI automation ourselves before we sell it to you.",
              },
              {
                icon: Server,
                title: "Deploy on YOUR Machine",
                description:
                  "No vendor lock-in, no monthly SaaS fees. Our agents and automations run locally or on your own infrastructure.",
              },
              {
                icon: Layers,
                title: "From $19 Products to $1,999 Done-For-You",
                description:
                  "Whether you want a DIY blueprint or a full enterprise rollout, we have the right option for your budget and timeline.",
              },
              {
                icon: Target,
                title: "Real Results, Not Hype",
                description:
                  "No inflated promises. No fake screenshots. Just clear documentation, proven workflows, and measurable outcomes.",
              },
            ].map((pillar) => (
              <div
                key={pillar.title}
                className="glass card-glow p-8 rounded-2xl"
              >
                <div
                  className="w-12 h-12 rounded-xl flex items-center justify-center mb-5"
                  style={{ background: "rgba(99, 102, 241, 0.1)" }}
                >
                  <pillar.icon
                    className="w-6 h-6 text-indigo-400"
                    aria-hidden="true"
                  />
                </div>
                <h3 className="text-xl font-semibold text-white mb-2">
                  {pillar.title}
                </h3>
                <p className="text-zinc-400 text-sm leading-relaxed">
                  {pillar.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Section 7: Setup Services Teaser */}
      <section className="py-20 md:py-28 border-t border-white/[0.06]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Want Us To Build It For You?
            </h2>
            <p className="text-lg text-zinc-400 max-w-2xl mx-auto">
              Not everyone wants to DIY. Our expert team will design, build, and
              deploy custom AI automation tailored to your business.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
            {[
              {
                name: "Strategy Session",
                price: "249",
                description: "60-min deep dive into your automation potential",
              },
              {
                name: "Single Setup",
                price: "549",
                description:
                  "One fully configured AI agent or automation workflow",
              },
              {
                name: "Command Center",
                price: "999",
                description:
                  "Multi-agent system with integrations and training",
              },
              {
                name: "Enterprise",
                price: "1,999",
                description:
                  "Full-scale AI infrastructure across your organisation",
              },
            ].map((tier) => (
              <div
                key={tier.name}
                className="glass card-glow p-6 rounded-2xl text-center"
              >
                <h3 className="text-lg font-semibold text-white mb-1">
                  {tier.name}
                </h3>
                <p className="text-2xl font-bold gradient-text mb-3">
                  &pound;{tier.price}
                </p>
                <p className="text-zinc-400 text-sm leading-relaxed">
                  {tier.description}
                </p>
              </div>
            ))}
          </div>

          <div className="text-center">
            <Link
              href="/services"
              className="btn-gradient px-8 py-4 rounded-xl font-semibold text-lg inline-block focus-glow"
            >
              Book a Strategy Session
            </Link>
          </div>
        </div>
      </section>

      {/* Section 8: Social Proof / Trust */}
      <section
        className="py-20 md:py-28 border-t border-white/[0.06]"
        style={{
          background:
            "linear-gradient(180deg, rgba(6, 182, 212, 0.03), transparent)",
        }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Trusted by Businesses Building with AI
            </h2>
            <p className="text-lg text-zinc-400">
              Join hundreds of businesses already using AI Armory tools
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                icon: Zap,
                title: "Instant Delivery",
                description:
                  "Download your products immediately after purchase",
              },
              {
                icon: Lock,
                title: "Lifetime Access",
                description: "Buy once, own forever. Free updates included.",
              },
              {
                icon: ShieldCheck,
                title: "30-Day Guarantee",
                description: "Not satisfied? Full refund, no questions asked",
              },
              {
                icon: Headphones,
                title: "Expert Support",
                description:
                  "Real humans who understand AI, ready to help you succeed",
              },
            ].map((badge) => (
              <div
                key={badge.title}
                className="glass p-6 rounded-2xl text-center"
              >
                <div
                  className="w-12 h-12 rounded-xl flex items-center justify-center mx-auto mb-4"
                  style={{ background: "rgba(6, 182, 212, 0.1)" }}
                >
                  <badge.icon
                    className="w-6 h-6 text-cyan-400"
                    aria-hidden="true"
                  />
                </div>
                <h3 className="text-white font-semibold mb-1">{badge.title}</h3>
                <p className="text-zinc-400 text-sm">{badge.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Section 9: Email Capture */}
      <section
        className="py-20 md:py-28 relative overflow-hidden"
        style={{
          background:
            "linear-gradient(135deg, rgba(99, 102, 241, 0.1), rgba(139, 92, 246, 0.05))",
        }}
      >
        <div className="absolute inset-0 border-t border-white/[0.06]" />
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Get Free AI Resources
          </h2>
          <p className="text-zinc-400 text-lg mb-10">
            Weekly automation tips, free templates, and early access to new
            products. No spam. Unsubscribe anytime.
          </p>
          <EmailSignup source="homepage" leadMagnet="newsletter" />
        </div>
      </section>

      {/* Section 10: Footer is rendered via layout.tsx — see Footer component */}
    </>
  );
}
