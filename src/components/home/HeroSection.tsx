"use client";

import Link from "next/link";

export default function HeroSection() {
  return (
    <section className="relative min-h-[85vh] flex items-center overflow-hidden">
      {/* Animated gradient mesh background — pure CSS */}
      <div className="absolute inset-0" style={{ background: "#0A0A0F" }}>
        {/* Gradient orbs with keyframed floating */}
        <div
          className="absolute w-[600px] h-[600px] rounded-full blur-[120px] opacity-20"
          style={{
            background: "radial-gradient(circle, #6366F1, transparent)",
            top: "-10%",
            left: "10%",
            animation: "heroFloat1 8s ease-in-out infinite alternate",
          }}
        />
        <div
          className="absolute w-[500px] h-[500px] rounded-full blur-[100px] opacity-15"
          style={{
            background: "radial-gradient(circle, #8B5CF6, transparent)",
            bottom: "-5%",
            right: "5%",
            animation: "heroFloat2 10s ease-in-out infinite alternate",
          }}
        />
        <div
          className="absolute w-[300px] h-[300px] rounded-full blur-[80px] opacity-10"
          style={{
            background: "radial-gradient(circle, #06B6D4, transparent)",
            top: "30%",
            right: "25%",
            animation: "heroFloat3 12s ease-in-out infinite alternate",
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
        className="absolute top-[20%] right-[15%] w-20 h-20 border border-indigo-500/20 rounded-lg pointer-events-none"
        style={{
          "--rotate": "45deg",
          animation: "shapeFloat 6s ease-in-out infinite",
          transform: "rotate(45deg)",
        } as React.CSSProperties}
      />
      <div
        className="absolute bottom-[25%] left-[8%] w-14 h-14 border border-violet-500/15 rounded-full pointer-events-none"
        style={{
          "--rotate": "0deg",
          animation: "shapeFloat 8s ease-in-out infinite reverse",
        } as React.CSSProperties}
      />
      <div
        className="absolute top-[60%] right-[30%] w-10 h-10 border border-cyan-500/10 rounded-lg pointer-events-none"
        style={{
          "--rotate": "30deg",
          animation: "shapeFloat 7s ease-in-out infinite",
          animationDelay: "-2s",
          transform: "rotate(30deg)",
        } as React.CSSProperties}
      />

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 md:py-36 relative z-10 w-full">
        <div className="max-w-3xl">
          <h1
            className="text-4xl sm:text-5xl md:text-7xl font-bold leading-[1.1] mb-6 tracking-tight"
            style={{
              opacity: 0,
              animation: "heroFadeIn 0.8s ease-out 0.1s forwards",
            }}
          >
            The Future Runs on AI.{" "}
            <span
              className="inline-block"
              style={{
                background:
                  "linear-gradient(135deg, #6366F1 0%, #8B5CF6 40%, #06B6D4 100%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
                backgroundSize: "200% 200%",
                animation: "gradientShift 4s ease-in-out infinite alternate",
              }}
            >
              Your Business Should Too.
            </span>
          </h1>
          <p
            className="text-lg md:text-xl text-zinc-400 mb-10 leading-relaxed max-w-2xl"
            style={{
              opacity: 0,
              animation: "heroFadeIn 0.8s ease-out 0.3s forwards",
            }}
          >
            AI Armory delivers ready-to-deploy automation blueprints, agent
            configurations, and expert setup services. Stop researching. Start
            automating.
          </p>
          <div
            className="flex flex-col sm:flex-row gap-4"
            style={{
              opacity: 0,
              animation: "heroFadeIn 0.8s ease-out 0.5s forwards",
            }}
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
