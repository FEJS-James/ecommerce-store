"use client";

import { useState, useEffect, useCallback } from "react";
import { X } from "lucide-react";
import { formatPriceWithCurrency } from "@/lib/pricing";

declare global {
  interface Window {
    umami?: { track: (event: string, data?: Record<string, unknown>) => void };
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
  const [businessName, setBusinessName] = useState("");
  const [description, setDescription] = useState("");
  const [contactMethod, setContactMethod] = useState<"email" | "video">("email");
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  const resetForm = useCallback(() => {
    setName("");
    setEmail("");
    setBusinessName("");
    setDescription("");
    setContactMethod("email");
    setSubmitting(false);
    setSuccess(false);
    setError("");
  }, []);

  useEffect(() => {
    if (!isOpen) {
      // Reset after close animation
      const timer = setTimeout(resetForm, 200);
      return () => clearTimeout(timer);
    }
  }, [isOpen, resetForm]);

  // Close on Escape key
  useEffect(() => {
    if (!isOpen) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [isOpen, onClose]);

  // Prevent body scroll when modal is open
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
    setError("");
    setSubmitting(true);

    try {
      const res = await fetch("/api/services/enquiry", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          serviceName,
          name,
          email,
          businessName,
          description,
          contactMethod,
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        setError(data.message || "Something went wrong. Please try again.");
        setSubmitting(false);
        return;
      }

      // Track analytics event
      if (typeof window !== "undefined" && window.umami) {
        window.umami.track("service_enquiry", { service: serviceName });
      }

      setSuccess(true);
      setSubmitting(false);
    } catch {
      setError("Something went wrong. Please try again.");
      setSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label={`Enquiry form for ${serviceName}`}
    >
      <div
        className="bg-zinc-900/95 backdrop-blur-xl border border-zinc-700/50 rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-zinc-800">
          <div>
            <h2 className="text-lg font-bold text-white">{serviceName}</h2>
            <p className="text-sm text-indigo-400 mt-1">
              {formatPriceWithCurrency(servicePrice, "gbp")}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-zinc-400 hover:text-white rounded-lg hover:bg-zinc-800 transition-colors"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6">
          {success ? (
            <div className="text-center py-8">
              <div className="w-16 h-16 bg-green-500/10 border border-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg
                  className="w-8 h-8 text-green-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-white mb-2">Thank you</h3>
              <p className="text-zinc-400">
                We&apos;ll be in touch within 24 hours.
              </p>
              <button
                onClick={onClose}
                className="mt-6 px-6 py-2 text-sm text-zinc-400 hover:text-white transition-colors"
              >
                Close
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className="text-sm text-red-400 bg-red-500/10 border border-red-500/20 rounded-lg p-3">
                  {error}
                </div>
              )}

              <div>
                <label htmlFor="enquiry-name" className="block text-sm font-medium text-zinc-300 mb-1.5">
                  Name <span className="text-red-400">*</span>
                </label>
                <input
                  id="enquiry-name"
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-4 py-2.5 bg-zinc-800/50 border border-zinc-700/50 rounded-xl text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500/50 transition-colors"
                  placeholder="Your name"
                />
              </div>

              <div>
                <label htmlFor="enquiry-email" className="block text-sm font-medium text-zinc-300 mb-1.5">
                  Email <span className="text-red-400">*</span>
                </label>
                <input
                  id="enquiry-email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-2.5 bg-zinc-800/50 border border-zinc-700/50 rounded-xl text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500/50 transition-colors"
                  placeholder="you@company.com"
                />
              </div>

              <div>
                <label htmlFor="enquiry-business" className="block text-sm font-medium text-zinc-300 mb-1.5">
                  Business name
                </label>
                <input
                  id="enquiry-business"
                  type="text"
                  value={businessName}
                  onChange={(e) => setBusinessName(e.target.value)}
                  className="w-full px-4 py-2.5 bg-zinc-800/50 border border-zinc-700/50 rounded-xl text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500/50 transition-colors"
                  placeholder="Optional"
                />
              </div>

              <div>
                <label htmlFor="enquiry-description" className="block text-sm font-medium text-zinc-300 mb-1.5">
                  Brief description of what you need <span className="text-red-400">*</span>
                </label>
                <textarea
                  id="enquiry-description"
                  required
                  rows={4}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-4 py-2.5 bg-zinc-800/50 border border-zinc-700/50 rounded-xl text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500/50 transition-colors resize-none"
                  placeholder="Tell us about your project, goals, and any specific requirements..."
                />
              </div>

              <fieldset>
                <legend className="block text-sm font-medium text-zinc-300 mb-2">
                  Preferred contact method
                </legend>
                <div className="flex gap-4">
                  <label className="flex items-center gap-2 text-sm text-zinc-400 cursor-pointer">
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
                  <label className="flex items-center gap-2 text-sm text-zinc-400 cursor-pointer">
                    <input
                      type="radio"
                      name="contactMethod"
                      value="video"
                      checked={contactMethod === "video"}
                      onChange={() => setContactMethod("video")}
                      className="accent-indigo-500"
                    />
                    Video call
                  </label>
                </div>
              </fieldset>

              <button
                type="submit"
                disabled={submitting}
                className="w-full btn-gradient px-6 py-3 rounded-xl font-semibold text-center transition-all disabled:opacity-50 disabled:cursor-not-allowed focus-glow"
              >
                {submitting ? "Sending..." : "Request Consultation"}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
