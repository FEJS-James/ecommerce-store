import EmailSignup from "@/components/EmailSignup";
import TrackPageView from "@/components/TrackPageView";
import {
  BrainCircuit,
  TrendingUp,
  CheckSquare,
  Zap,
  Mail,
  CreditCard,
} from "lucide-react";
import type { LucideProps } from "lucide-react";

export const dynamic = "force-dynamic";

const freeResources: Array<{
  title: string;
  description: string;
  Icon: React.ComponentType<LucideProps>;
  leadMagnet: string;
}> = [
  {
    title: "AI Prompt Starter Pack",
    description:
      "25 essential AI prompts to get you started with ChatGPT, Claude, and Gemini. Covers writing, coding, and productivity.",
    Icon: BrainCircuit,
    leadMagnet: "ai-prompt-starter",
  },
  {
    title: "Monthly Budget Spreadsheet",
    description:
      "A simple, beautiful monthly budget tracker. Works in Google Sheets and Excel. The foundation of financial awareness.",
    Icon: TrendingUp,
    leadMagnet: "monthly-budget",
  },
  {
    title: "Developer Checklist Pack",
    description:
      "Pre-launch, code review, and deployment checklists. Never miss a critical step again.",
    Icon: CheckSquare,
    leadMagnet: "dev-checklists",
  },
];

export default function FreePage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <TrackPageView event="free_download" />
      <div className="text-center mb-14">
        <h1 className="text-3xl md:text-4xl font-bold text-white mb-4">
          Free Downloads
        </h1>
        <p className="text-lg text-zinc-500 max-w-2xl mx-auto">
          Get started with our free resources. Enter your email to download — no
          credit card required.
        </p>
      </div>

      <div className="space-y-6">
        {freeResources.map((resource) => (
          <div key={resource.leadMagnet} className="glass rounded-2xl p-8">
            <div className="flex flex-col md:flex-row gap-6">
              <div className="flex-1">
                <div
                  className="w-12 h-12 rounded-xl flex items-center justify-center mb-4"
                  style={{ background: "rgba(99, 102, 241, 0.1)" }}
                >
                  <resource.Icon
                    className="w-6 h-6 text-indigo-400"
                    aria-hidden="true"
                  />
                </div>
                <h2 className="text-xl font-bold text-white mb-2">
                  {resource.title}
                </h2>
                <p className="text-zinc-500 mb-6 text-sm leading-relaxed">
                  {resource.description}
                </p>
                <div className="flex items-center gap-4 text-sm text-zinc-600">
                  <span className="flex items-center gap-1.5">
                    <Zap
                      className="w-3.5 h-3.5 text-indigo-400/60"
                      aria-hidden="true"
                    />
                    Instant delivery
                  </span>
                  <span className="flex items-center gap-1.5">
                    <Mail
                      className="w-3.5 h-3.5 text-indigo-400/60"
                      aria-hidden="true"
                    />
                    To your inbox
                  </span>
                  <span className="flex items-center gap-1.5">
                    <CreditCard
                      className="w-3.5 h-3.5 text-indigo-400/60"
                      aria-hidden="true"
                    />
                    No card needed
                  </span>
                </div>
              </div>
              <div className="md:w-80">
                <EmailSignup
                  source="free-downloads"
                  leadMagnet={resource.leadMagnet}
                />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* CTA */}
      <div
        className="mt-16 glass rounded-2xl p-10 text-center relative overflow-hidden"
        style={{
          background:
            "linear-gradient(135deg, rgba(99, 102, 241, 0.1), rgba(139, 92, 246, 0.05))",
        }}
      >
        <h2 className="text-2xl font-bold text-white mb-4">Want even more?</h2>
        <p className="text-zinc-400 mb-8">
          Check out our premium products for comprehensive templates, prompt
          packs, and guides.
        </p>
        <a
          href="/products"
          className="inline-block btn-gradient px-8 py-3 rounded-xl font-semibold transition-colors focus-glow"
        >
          Browse Products
        </a>
      </div>
    </div>
  );
}
