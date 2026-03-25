"use client";

import EmailSignup from "@/components/EmailSignup";
import ScrollReveal from "./ScrollReveal";

export default function NewsletterSection() {
  return (
    <section className="py-20 md:py-28 relative overflow-hidden">
      {/* Multi-layer gradient background */}
      <div className="absolute inset-0">
        <div
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(135deg, rgba(99,102,241,0.1) 0%, rgba(139,92,246,0.08) 40%, rgba(6,182,212,0.06) 100%)",
          }}
        />
        {/* Abstract circles */}
        <div
          className="absolute w-[400px] h-[400px] rounded-full blur-[100px] opacity-10"
          style={{
            background: "#6366F1",
            top: "-15%",
            right: "-5%",
          }}
        />
        <div
          className="absolute w-[300px] h-[300px] rounded-full blur-[80px] opacity-10"
          style={{
            background: "#06B6D4",
            bottom: "-10%",
            left: "-3%",
          }}
        />
        {/* Noise texture overlay */}
        <div
          className="absolute inset-0 opacity-[0.015]"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
          }}
        />
      </div>

      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
        <ScrollReveal>
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Get Free AI Resources
          </h2>
          <p className="text-zinc-300 text-lg mb-10 leading-relaxed">
            Weekly automation tips, free templates, and early access to new
            products. No spam. Unsubscribe anytime.
          </p>
        </ScrollReveal>

        <ScrollReveal delay={200}>
          <div
            className="rounded-2xl p-8 sm:p-10"
            style={{
              background: "rgba(255, 255, 255, 0.04)",
              backdropFilter: "blur(20px)",
              WebkitBackdropFilter: "blur(20px)",
              border: "1px solid rgba(255,255,255,0.08)",
            }}
          >
            <EmailSignup source="homepage" leadMagnet="newsletter" />
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
}
