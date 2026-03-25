"use client";

import Link from "next/link";

export default function HeroSection() {
  return (
    <section className="relative min-h-[85vh] flex items-center overflow-hidden">
      {/* Animated gradient mesh background — pure CSS */}
      <div className="absolute inset-0" style={{ background: "#0A0A0F" }}>
        {/* Gradient orbs with keyframed floating */}
        <div
          className="hero-float-1 absolute w-[600px] h-[600px] rounded-full blur-[120px] opacity-20"
          style={{
            background: "radial-gradient(circle, #6366F1, transparent)",
            top: "-10%",
            left: "10%",
          }}
        />
        <div
          className="hero-float-2 absolute w-[500px] h-[500px] rounded-full blur-[100px] opacity-15"
          style={{
            background: "radial-gradient(circle, #8B5CF6, transparent)",
            bottom: "-5%",
            right: "5%",
          }}
        />
        <div
          className="hero-float-3 absolute w-[300px] h-[300px] rounded-full blur-[80px] opacity-10"
          style={{
            background: "radial-gradient(circle, #06B6D4, transparent)",
            top: "30%",
            right: "25%",
          }}
        />

        {/* Subtle grid overlay */}
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage:
              "linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)",
            backgroundSize: "60px 60px",
          }}
        />
      </div>

      {/* Floating decorative shapes */}
      <div
        className="hero-shape-float-1 absolute top-[20%] right-[15%] w-20 h-20 border border-indigo-500/20 rounded-lg pointer-events-none"
        style={{ transform: "rotate(45deg)" }}
      />
      <div
        className="hero-shape-float-2 absolute bottom-[25%] left-[8%] w-14 h-14 border border-violet-500/15 rounded-full pointer-events-none"
      />
      <div
        className="hero-shape-float-3 absolute top-[60%] right-[30%] w-10 h-10 border border-cyan-500/10 rounded-lg pointer-events-none"
        style={{ transform: "rotate(30deg)" }}
      />

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 md:py-36 relative z-10 w-full">
        <div className="max-w-3xl hero-entrance">
          <h1
            className="text-4xl sm:text-5xl md:text-7xl font-bold leading-[1.1] mb-6 tracking-tight"
          >
            The Future Runs on AI.{" "}
            <span
              className="hero-gradient-text inline-block"
            >
              Your Business Should Too.
            </span>
          </h1>
          <p
            className="text-lg md:text-xl text-zinc-400 mb-10 leading-relaxed max-w-2xl"
          >
            AI Armory delivers ready-to-deploy automation blueprints, agent
            configurations, and expert setup services. Stop researching. Start
            automating.
          </p>
          <div
            className="flex flex-col sm:flex-row gap-4"
          >
            <Link
              href="/products"
              className="px-8 py-4 rounded-xl font-semibold text-lg text-center text-white focus-glow"
              style={{
                background: "linear-gradient(135deg, #6366F1, #8B5CF6)",
                boxShadow:
                  "0 0 30px rgba(99, 102, 241, 0.3), 0 4px 20px rgba(0, 0, 0, 0.3)",
                transition: "all 0.3s ease",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.boxShadow =
                  "0 0 50px rgba(99, 102, 241, 0.5), 0 4px 24px rgba(0, 0, 0, 0.4)";
                e.currentTarget.style.transform = "scale(1.02)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.boxShadow =
                  "0 0 30px rgba(99, 102, 241, 0.3), 0 4px 20px rgba(0, 0, 0, 0.3)";
                e.currentTarget.style.transform = "scale(1)";
              }}
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

      {/* Bottom gradient fade */}
      <div
        className="absolute bottom-0 left-0 right-0 h-32 pointer-events-none"
        style={{
          background: "linear-gradient(to top, #0A0A0F, transparent)",
        }}
      />
    </section>
  );
}
