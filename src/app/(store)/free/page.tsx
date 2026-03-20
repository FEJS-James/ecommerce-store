import EmailSignup from '@/components/EmailSignup';

export const dynamic = 'force-dynamic';

const freeResources = [
  {
    title: 'AI Prompt Starter Pack',
    description: '25 essential AI prompts to get you started with ChatGPT, Claude, and Gemini. Covers writing, coding, and productivity.',
    icon: '🤖',
    leadMagnet: 'ai-prompt-starter',
  },
  {
    title: 'Monthly Budget Spreadsheet',
    description: 'A simple, beautiful monthly budget tracker. Works in Google Sheets and Excel. The foundation of financial awareness.',
    icon: '💰',
    leadMagnet: 'monthly-budget',
  },
  {
    title: 'Developer Checklist Pack',
    description: 'Pre-launch, code review, and deployment checklists. Never miss a critical step again.',
    icon: '✅',
    leadMagnet: 'dev-checklists',
  },
];

export default function FreePage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <div className="text-center mb-12">
        <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
          Free Downloads
        </h1>
        <p className="text-lg text-gray-500 max-w-2xl mx-auto">
          Get started with our free resources. Enter your email to download — no credit card required.
        </p>
      </div>

      <div className="space-y-8">
        {freeResources.map((resource) => (
          <div
            key={resource.leadMagnet}
            className="bg-white border border-gray-200 rounded-xl p-8"
          >
            <div className="flex flex-col md:flex-row gap-6">
              <div className="flex-1">
                <span className="text-4xl block mb-4">{resource.icon}</span>
                <h2 className="text-xl font-bold text-gray-900 mb-2">{resource.title}</h2>
                <p className="text-gray-500 mb-6">{resource.description}</p>
                <div className="flex items-center gap-4 text-sm text-gray-400">
                  <span>⚡ Instant delivery</span>
                  <span>📧 To your inbox</span>
                  <span>💳 No card needed</span>
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
      <div className="mt-16 bg-gray-900 text-white rounded-xl p-8 text-center">
        <h2 className="text-2xl font-bold mb-4">Want even more?</h2>
        <p className="text-gray-300 mb-6">
          Check out our premium products for comprehensive templates, prompt packs, and guides.
        </p>
        <a
          href="/products"
          className="inline-block bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-3 rounded-xl font-semibold transition-colors"
        >
          Browse Products →
        </a>
      </div>
    </div>
  );
}
