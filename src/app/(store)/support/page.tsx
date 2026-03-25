"use client";

import { useState } from "react";
import Link from "next/link";
import {
  ChevronDown,
  ChevronUp,
  Mail,
  Clock,
  AlertCircle,
  Send,
  ShoppingCart,
  Download,
  Cpu,
  Briefcase,
  UserCog,
} from "lucide-react";

interface FAQItem {
  question: string;
  answer: string | React.ReactNode;
}

interface FAQCategory {
  name: string;
  icon: React.ReactNode;
  items: FAQItem[];
}

const FAQ_CATEGORIES: FAQCategory[] = [
  {
    name: "Purchasing",
    icon: (
      <ShoppingCart className="w-5 h-5 text-indigo-400" aria-hidden="true" />
    ),
    items: [
      {
        question: "What payment methods do you accept?",
        answer:
          "We accept payments via Stripe (all major credit and debit cards, Apple Pay, Google Pay) and PayPal. Bitcoin payments are coming soon.",
      },
      {
        question: "What currency are prices shown in?",
        answer:
          "All prices are in USD. Regional pricing is applied automatically based on your location.",
      },
      {
        question: "Do you offer a money-back guarantee?",
        answer: (
          <span>
            Yes. We offer a 30-day money-back guarantee for products that are
            defective or not as described. Full details are available in our{" "}
            <Link
              href="/sales-terms"
              className="text-indigo-400 hover:text-indigo-300 underline"
            >
              Sales Terms
            </Link>
            .
          </span>
        ),
      },
      {
        question: "Do you offer discounts?",
        answer:
          "Regional pricing is applied automatically. We also run occasional promotions. Subscribe to our newsletter for early access to deals.",
      },
      {
        question: "Can I pay in instalments?",
        answer:
          "For services over \u00a3500, we offer a 50/50 payment split: half upfront and half on completion.",
      },
    ],
  },
  {
    name: "Products & Downloads",
    icon: <Download className="w-5 h-5 text-indigo-400" aria-hidden="true" />,
    items: [
      {
        question: "How do I download my purchase?",
        answer:
          "After payment, you will be redirected to a download page automatically. You will also receive an email with the download link. All purchases are accessible from your account at any time.",
      },
      {
        question: "What file format will I receive?",
        answer:
          "Products are delivered as ZIP files containing PDFs, text files, and configuration files. Specifics are listed on each product page.",
      },
      {
        question: "My download link is broken. What should I do?",
        answer:
          "Download links expire after 7 days for security. Log in to your account to generate a new one. If the issue persists, contact support@aiarmory.shop.",
      },
      {
        question: "Can I share my purchase with others?",
        answer: (
          <span>
            No. All purchases are covered by a single-user licence. Sharing or
            redistribution is not permitted. See our{" "}
            <Link
              href="/terms"
              className="text-indigo-400 hover:text-indigo-300 underline"
            >
              Terms &amp; Conditions
            </Link>{" "}
            for details.
          </span>
        ),
      },
      {
        question: "Will I receive product updates?",
        answer:
          "Yes. Lifetime access includes all future updates at no extra cost. You will be notified by email when updates are available.",
      },
    ],
  },
  {
    name: "AI & Technical",
    icon: <Cpu className="w-5 h-5 text-indigo-400" aria-hidden="true" />,
    items: [
      {
        question: "Do I need coding experience to use these products?",
        answer:
          "It depends on the product. Each product page lists the required skill level. Many products are designed for non-technical users.",
      },
      {
        question: "Which AI platforms do your products support?",
        answer:
          "Most products support ChatGPT, Claude, and Gemini. Specific platform compatibility is listed on each product page.",
      },
      {
        question: "Are there separate AI API costs?",
        answer:
          "Yes. You will need your own AI platform account. API costs typically range from $5-20 per month depending on usage.",
      },
      {
        question: "What is OpenClaw?",
        answer: (
          <span>
            OpenClaw is an open-source AI agent framework that powers some of
            our advanced products. Learn more at{" "}
            <a
              href="https://openclaw.ai"
              target="_blank"
              rel="noopener noreferrer"
              className="text-indigo-400 hover:text-indigo-300 underline"
            >
              openclaw.ai
            </a>
            .
          </span>
        ),
      },
    ],
  },
  {
    name: "Services",
    icon: <Briefcase className="w-5 h-5 text-indigo-400" aria-hidden="true" />,
    items: [
      {
        question: "What is included in a Strategy Session?",
        answer:
          "A 60-minute video call where we audit your current workflows, identify automation opportunities, and deliver a written strategy document within 24 hours.",
      },
      {
        question: "How long does setup take?",
        answer:
          "Timelines depend on the service tier. Tier 2: 1-2 weeks. Tier 3: 2-3 weeks. Tier 4: 3-5 weeks.",
      },
      {
        question: "Can I make changes after the support period ends?",
        answer:
          "Yes. Follow-up sessions are available for additional adjustments after your initial support period.",
      },
      {
        question: "Who will I work with?",
        answer:
          "You will work directly with our team via 1-on-1 video calls. All communication is personal and hands-on.",
      },
    ],
  },
  {
    name: "Account",
    icon: <UserCog className="w-5 h-5 text-indigo-400" aria-hidden="true" />,
    items: [
      {
        question: "How do I create an account?",
        answer:
          "Click \u2018My Account\u2019 in the navigation bar or create one during checkout. It takes less than a minute.",
      },
      {
        question: "I forgot my password. How do I reset it?",
        answer:
          "Click \u2018Forgot Password\u2019 on the login page and follow the instructions sent to your email.",
      },
      {
        question: "How do I delete my account?",
        answer:
          "Email support@aiarmory.shop with your request. Account deletion is processed within 14 days in accordance with UK GDPR.",
      },
    ],
  },
];

const SUPPORT_CATEGORIES = [
  "Purchase issue",
  "Download problem",
  "Product question",
  "Service enquiry",
  "Refund request",
  "Account issue",
  "Other",
];

function FAQCategorySection({ category }: { category: FAQCategory }) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <div className="mb-8">
      <div className="flex items-center gap-3 mb-4">
        {category.icon}
        <h3 className="text-lg font-semibold text-white">{category.name}</h3>
      </div>
      <div className="space-y-3">
        {category.items.map((item, i) => {
          const isOpen = openIndex === i;
          return (
            <div key={i} className="glass rounded-2xl overflow-hidden">
              <button
                onClick={() => setOpenIndex(isOpen ? null : i)}
                className="w-full flex items-center justify-between p-5 text-left focus-glow"
                aria-expanded={isOpen}
              >
                <span className="font-medium text-white pr-4 text-sm">
                  {item.question}
                </span>
                {isOpen ? (
                  <ChevronUp
                    className="w-5 h-5 text-zinc-400 shrink-0"
                    aria-hidden="true"
                  />
                ) : (
                  <ChevronDown
                    className="w-5 h-5 text-zinc-400 shrink-0"
                    aria-hidden="true"
                  />
                )}
              </button>
              <div
                className={`grid transition-all duration-300 ease-in-out ${
                  isOpen
                    ? "grid-rows-[1fr] opacity-100"
                    : "grid-rows-[0fr] opacity-0"
                }`}
              >
                <div className="overflow-hidden">
                  <p className="px-5 pb-5 text-zinc-400 text-sm leading-relaxed">
                    {item.answer}
                  </p>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function SupportForm() {
  const [formState, setFormState] = useState<
    "idle" | "submitting" | "success" | "error"
  >("idle");
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    orderNumber: "",
    category: "",
    message: "",
  });

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setFormState("submitting");

    try {
      const res = await fetch("/api/support", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        setFormState("success");
        setFormData({
          name: "",
          email: "",
          orderNumber: "",
          category: "",
          message: "",
        });
      } else {
        setFormState("error");
      }
    } catch {
      setFormState("error");
    }
  }

  if (formState === "success") {
    return (
      <div className="glass rounded-2xl p-8 text-center">
        <div
          className="w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4"
          style={{ background: "rgba(16, 185, 129, 0.15)" }}
        >
          <Send className="w-6 h-6 text-emerald-400" aria-hidden="true" />
        </div>
        <h3 className="text-xl font-semibold text-white mb-2">
          Request Received
        </h3>
        <p className="text-zinc-400 text-sm">
          We&apos;ve received your request and will respond within 24 hours.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="glass rounded-2xl p-6 space-y-5">
      <div>
        <label
          htmlFor="support-name"
          className="block text-sm font-medium text-zinc-300 mb-2"
        >
          Name <span className="text-red-400">*</span>
        </label>
        <input
          id="support-name"
          type="text"
          required
          value={formData.name}
          onChange={(e) =>
            setFormData((prev) => ({ ...prev, name: e.target.value }))
          }
          className="glass-input focus-glow w-full px-4 py-3 rounded-lg text-white text-sm"
          placeholder="Your name"
        />
      </div>

      <div>
        <label
          htmlFor="support-email"
          className="block text-sm font-medium text-zinc-300 mb-2"
        >
          Email <span className="text-red-400">*</span>
        </label>
        <input
          id="support-email"
          type="email"
          required
          value={formData.email}
          onChange={(e) =>
            setFormData((prev) => ({ ...prev, email: e.target.value }))
          }
          className="glass-input focus-glow w-full px-4 py-3 rounded-lg text-white text-sm"
          placeholder="you@example.com"
        />
      </div>

      <div>
        <label
          htmlFor="support-order"
          className="block text-sm font-medium text-zinc-300 mb-2"
        >
          Order Number{" "}
          <span className="text-zinc-600 font-normal">(optional)</span>
        </label>
        <input
          id="support-order"
          type="text"
          value={formData.orderNumber}
          onChange={(e) =>
            setFormData((prev) => ({ ...prev, orderNumber: e.target.value }))
          }
          className="glass-input focus-glow w-full px-4 py-3 rounded-lg text-white text-sm"
          placeholder="e.g. ORD-123456"
        />
      </div>

      <div>
        <label
          htmlFor="support-category"
          className="block text-sm font-medium text-zinc-300 mb-2"
        >
          Category <span className="text-red-400">*</span>
        </label>
        <select
          id="support-category"
          required
          value={formData.category}
          onChange={(e) =>
            setFormData((prev) => ({ ...prev, category: e.target.value }))
          }
          className="glass-input focus-glow w-full px-4 py-3 rounded-lg text-white text-sm appearance-none"
        >
          <option value="" disabled>
            Select a category
          </option>
          {SUPPORT_CATEGORIES.map((cat) => (
            <option key={cat} value={cat}>
              {cat}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label
          htmlFor="support-message"
          className="block text-sm font-medium text-zinc-300 mb-2"
        >
          Message <span className="text-red-400">*</span>
        </label>
        <textarea
          id="support-message"
          required
          rows={5}
          value={formData.message}
          onChange={(e) =>
            setFormData((prev) => ({ ...prev, message: e.target.value }))
          }
          className="glass-input focus-glow w-full px-4 py-3 rounded-lg text-white text-sm resize-y"
          placeholder="Describe your issue or question..."
        />
      </div>

      {formState === "error" && (
        <div className="flex items-center gap-2 text-red-400 text-sm">
          <AlertCircle className="w-4 h-4 shrink-0" aria-hidden="true" />
          <span>
            Something went wrong. Please try again or email us directly.
          </span>
        </div>
      )}

      <button
        type="submit"
        disabled={formState === "submitting"}
        className="btn-gradient w-full px-6 py-3 rounded-lg font-medium text-sm focus-glow disabled:opacity-50"
      >
        {formState === "submitting" ? "Sending..." : "Submit Request"}
      </button>
    </form>
  );
}

export default function SupportPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
      <div className="text-center mb-12">
        <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
          Support
        </h1>
        <p className="text-zinc-400 text-lg max-w-2xl mx-auto">
          Find answers to common questions, get in touch, or submit a support
          request.
        </p>
      </div>

      {/* Contact Section */}
      <section id="contact" className="mb-16">
        <h2 className="text-2xl font-bold text-white mb-6">Contact Us</h2>
        <div className="glass rounded-2xl p-6">
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div
                className="w-10 h-10 rounded-full flex items-center justify-center shrink-0"
                style={{ background: "rgba(99, 102, 241, 0.15)" }}
              >
                <Mail className="w-5 h-5 text-indigo-400" aria-hidden="true" />
              </div>
              <div>
                <p className="text-white font-medium">support@aiarmory.shop</p>
                <p className="text-zinc-500 text-sm">
                  General enquiries and support
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div
                className="w-10 h-10 rounded-full flex items-center justify-center shrink-0"
                style={{ background: "rgba(99, 102, 241, 0.15)" }}
              >
                <Clock className="w-5 h-5 text-indigo-400" aria-hidden="true" />
              </div>
              <div>
                <p className="text-white font-medium">Within 24 hours</p>
                <p className="text-zinc-500 text-sm">
                  Response time (Monday to Friday)
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div
                className="w-10 h-10 rounded-full flex items-center justify-center shrink-0"
                style={{ background: "rgba(99, 102, 241, 0.15)" }}
              >
                <AlertCircle
                  className="w-5 h-5 text-indigo-400"
                  aria-hidden="true"
                />
              </div>
              <div>
                <p className="text-white font-medium">Urgent requests</p>
                <p className="text-zinc-500 text-sm">
                  Include your order number in the subject line
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Support Request Form */}
      <section id="request" className="mb-16">
        <h2 className="text-2xl font-bold text-white mb-6">Submit a Request</h2>
        <SupportForm />
      </section>

      {/* FAQ Section */}
      <section id="faq">
        <h2 className="text-2xl font-bold text-white mb-8">
          Frequently Asked Questions
        </h2>
        {FAQ_CATEGORIES.map((category) => (
          <FAQCategorySection key={category.name} category={category} />
        ))}
      </section>
    </div>
  );
}
