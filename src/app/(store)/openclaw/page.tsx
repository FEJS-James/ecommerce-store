import {
  Server,
  Cpu,
  Moon,
  Cloud,
} from "lucide-react";
import CloudHostingPricing from "@/components/CloudHostingPricing";

export const metadata = {
  title: "OpenClaw — AI Agent Platform | AI Armory",
  description:
    "Deploy autonomous AI agents that work for you 24/7. Browse OpenClaw cloud hosting plans and learn how to get started.",
};

export default function OpenClawPage() {
  return (
    <div className="scroll-smooth">
      {/* Hero Section */}
      <section className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-28 text-center">
        <div className="absolute inset-0 bg-gradient-to-b from-indigo-500/[0.04] to-transparent rounded-3xl pointer-events-none" />
        <div className="relative">
          <div className="w-16 h-16 bg-indigo-500/10 border border-indigo-500/20 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <Cpu className="w-8 h-8 text-indigo-400" aria-hidden="true" />
          </div>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6 leading-tight">
            OpenClaw — Deploy AI Agents
            <br className="hidden sm:block" />
            <span className="text-indigo-400"> That Work For You</span>
          </h1>
          <p className="text-lg md:text-xl text-zinc-400 max-w-2xl mx-auto mb-10">
            An autonomous agent framework that runs 24/7 on your infrastructure
            or ours. Build, deploy, and manage AI agents that handle real tasks
            while you focus on what matters.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <a
              href="#hosting"
              className="btn-gradient px-8 py-3.5 rounded-xl font-semibold text-center flex items-center gap-2 focus-glow"
            >
              Cloud Hosting
              <Cloud className="w-4 h-4" aria-hidden="true" />
            </a>
            <a
              href="#how-it-works"
              className="border border-indigo-500/30 text-indigo-400 hover:bg-indigo-500/10 px-8 py-3.5 rounded-xl font-semibold text-center flex items-center gap-2 focus-glow transition-colors"
            >
              How It Works
              <Server className="w-4 h-4" aria-hidden="true" />
            </a>
          </div>
        </div>
      </section>

      {/* Cloud Hosting Pricing */}
      <section
        id="hosting"
        className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 scroll-mt-20"
      >
        <div className="text-center mb-10">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Cloud Hosting
          </h2>
          <p className="text-zinc-400 max-w-xl mx-auto">
            Managed infrastructure for your OpenClaw agents. Pick a plan that
            fits your scale — upgrade any time.
          </p>
        </div>

        <CloudHostingPricing />
      </section>

      {/* How It Works */}
      <section
        id="how-it-works"
        className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-20 scroll-mt-20"
      >
        <div className="text-center mb-14">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            How It Works
          </h2>
          <p className="text-zinc-400 max-w-xl mx-auto">
            From zero to autonomous in three steps.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
          {/* Connecting line (desktop) */}
          <div
            className="hidden md:block absolute top-14 left-[calc(16.67%+24px)] right-[calc(16.67%+24px)] h-px bg-gradient-to-r from-indigo-500/30 via-indigo-500/50 to-indigo-500/30"
            aria-hidden="true"
          />

          {/* Step 1 */}
          <div className="relative flex flex-col items-center text-center">
            <div className="w-14 h-14 bg-indigo-500/10 border border-indigo-500/20 rounded-2xl flex items-center justify-center mb-5 relative z-10">
              <Server
                className="w-7 h-7 text-indigo-400"
                aria-hidden="true"
              />
            </div>
            <span className="text-xs font-bold text-indigo-500 uppercase tracking-wider mb-2">
              Step 1
            </span>
            <h3 className="text-lg font-bold text-white mb-2">
              Choose Your Deployment
            </h3>
            <p className="text-zinc-400 text-sm leading-relaxed max-w-xs">
              Self-hosted on your own infrastructure or fully managed on our
              cloud — you decide.
            </p>
          </div>

          {/* Step 2 */}
          <div className="relative flex flex-col items-center text-center">
            <div className="w-14 h-14 bg-indigo-500/10 border border-indigo-500/20 rounded-2xl flex items-center justify-center mb-5 relative z-10">
              <Cpu
                className="w-7 h-7 text-indigo-400"
                aria-hidden="true"
              />
            </div>
            <span className="text-xs font-bold text-indigo-500 uppercase tracking-wider mb-2">
              Step 2
            </span>
            <h3 className="text-lg font-bold text-white mb-2">
              Configure Your Agents
            </h3>
            <p className="text-zinc-400 text-sm leading-relaxed max-w-xs">
              Use pre-built agent packs or build custom agents tailored to your
              exact workflow.
            </p>
          </div>

          {/* Step 3 */}
          <div className="relative flex flex-col items-center text-center">
            <div className="w-14 h-14 bg-indigo-500/10 border border-indigo-500/20 rounded-2xl flex items-center justify-center mb-5 relative z-10">
              <Moon
                className="w-7 h-7 text-indigo-400"
                aria-hidden="true"
              />
            </div>
            <span className="text-xs font-bold text-indigo-500 uppercase tracking-wider mb-2">
              Step 3
            </span>
            <h3 className="text-lg font-bold text-white mb-2">
              Run 24/7
            </h3>
            <p className="text-zinc-400 text-sm leading-relaxed max-w-xs">
              Your agents work while you sleep — monitoring, executing, and
              reporting around the clock.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
