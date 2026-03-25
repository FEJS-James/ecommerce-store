"use client";

import { useState, useEffect, useCallback } from "react";
import { X } from "lucide-react";
import { formatPriceWithCurrency } from "@/lib/pricing";

declare global {
  interface Window {
    umami?: { track: (event: string, data?: Record<string, string | number>) => void };
  }
}

interface ServiceEnquiryModalProps {
  serviceName: string;
  servicePrice: number;
  isOpen: boolean;
  onClose: () => void;
}

export default function ServiceEnquiryModal({
  serviceName,
  servicePrice,
  isOpen,
  onClose,
}: ServiceEnquiryModalProps) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [company, setCompany] = useState("");
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [contactMethod, setContactMethod] = useState<'email' | 'video'>('email');
  const [error, setError] = useState("");

  const resetForm = useCallback(() => {
    setName("");
    setEmail("");
    setCompany("");
    setMessage("");
    setContactMethod("email");
    setError("");
    setSubmitted(false);
  }, []);

  useEffect(() => {
    if (!isOpen) {
      const timer = setTimeout(resetForm, 300);
      return () => clearTimeout(timer);
    }
  }, [isOpen, resetForm]);

  useEffect(() => {
    if (!isOpen) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [isOpen, onClose]);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError("");

    try {
      const res = await fetch("/api/services/enquiry", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          email,
          company,
          message,
          contactMethod,
          serviceName,
          servicePrice,
        }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Failed to submit enquiry");
      }

      setSubmitted(true);

      if (typeof window !== "undefined" && window.umami) {
        window.umami.track("service_enquiry", { service: serviceName });
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-label={`Enquire about ${serviceName}`}
    >
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />

      <div className="relative glass rounded-2xl p-6 sm:p-8 max-w-lg w-full max-h-[90vh] overflow-y-auto">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-zinc-400 hover:text-white transition-colors"
          aria-label="Close"
        >
          <X className="w-5 h-5" />
        </button>

        {submitted ? (
          <div className="text-center py-8">
            <h2 className="text-2xl font-bold text-white mb-3">
              Enquiry Sent!
            </h2>
            <p className="text-zinc-400 mb-6">
              Thanks for your interest in <strong>{serviceName}</strong>.
              We&apos;ll be in touch within 24 hours.
            </p>
            <button
              onClick={onClose}
              className="btn-gradient px-6 py-3 rounded-xl font-semibold focus-glow"
            >
              Close
            </button>
          </div>
        ) : (
          <>
            <h2 className="text-xl font-bold text-white mb-1">
              Enquire: {serviceName}
            </h2>
            <p className="text-zinc-400 text-sm mb-6">
              {formatPriceWithCurrency(servicePrice, "gbp")} — tell us about
              your needs and we&apos;ll get back to you.
            </p>

            {error && (
              <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-3 mb-4 text-red-400 text-sm">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label
                  htmlFor="enquiry-name"
                  className="block text-sm font-medium text-zinc-300 mb-1"
                >
                  Name *
                </label>
                <input
                  id="enquiry-name"
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-zinc-800/50 border border-zinc-700 rounded-xl px-4 py-2.5 text-white placeholder-zinc-500 focus:outline-none focus:border-indigo-500 transition-colors"
                  placeholder="Your name"
                />
              </div>

              <div>
                <label
                  htmlFor="enquiry-email"
                  className="block text-sm font-medium text-zinc-300 mb-1"
                >
                  Email *
                </label>
                <input
                  id="enquiry-email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-zinc-800/50 border border-zinc-700 rounded-xl px-4 py-2.5 text-white placeholder-zinc-500 focus:outline-none focus:border-indigo-500 transition-colors"
                  placeholder="you@company.com"
                />
              </div>

              <div>
                <label
                  htmlFor="enquiry-company"
                  className="block text-sm font-medium text-zinc-300 mb-1"
                >
                  Company
                </label>
                <input
                  id="enquiry-company"
                  type="text"
                  value={company}
                  onChange={(e) => setCompany(e.target.value)}
                  className="w-full bg-zinc-800/50 border border-zinc-700 rounded-xl px-4 py-2.5 text-white placeholder-zinc-500 focus:outline-none focus:border-indigo-500 transition-colors"
                  placeholder="Your company (optional)"
                />
              </div>

              <div>
                <label
                  htmlFor="enquiry-message"
                  className="block text-sm font-medium text-zinc-300 mb-1"
                >
                  Tell us about your project *
                </label>
                <textarea
                  id="enquiry-message"
                  required
                  rows={4}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  className="w-full bg-zinc-800/50 border border-zinc-700 rounded-xl px-4 py-2.5 text-white placeholder-zinc-500 focus:outline-none focus:border-indigo-500 transition-colors resize-none"
                  placeholder="What do you need help with?"
                />
              </div>

              <fieldset>
                <legend className="block text-sm font-medium text-zinc-300 mb-2">
                  Preferred Contact Method
                </legend>
                <div className="flex gap-4">
                  <label className="flex items-center gap-2 text-sm text-zinc-300 cursor-pointer">
                    <input
                      type="radio"
                      name="contactMethod"
                      value="email"
                      checked={contactMethod === "email"}
                      onChange={() => setContactMethod("email")}
                      className="accent-indigo-500"
                    />
                    Email
                  </label>
                  <label className="flex items-center gap-2 text-sm text-zinc-300 cursor-pointer">
                    <input
                      type="radio"
                      name="contactMethod"
                      value="video"
                      checked={contactMethod === "video"}
                      onChange={() => setContactMethod("video")}
                      className="accent-indigo-500"
                    />
                    Video Call
                  </label>
                </div>
              </fieldset>

              <button
                type="submit"
                disabled={submitting}
                className="w-full btn-gradient px-6 py-3 rounded-xl font-semibold focus-glow disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {submitting ? "Sending…" : "Send Enquiry"}
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
