"use client";

import { useState, useEffect } from "react";
import { Shield } from "lucide-react";

export default function CookieBanner() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem("cookie_consent");
    if (!consent) {
      setVisible(true);
    }
  }, []);

  function handleAcceptAll() {
    localStorage.setItem("cookie_consent", "all");
    setVisible(false);
  }

  function handleEssentialOnly() {
    localStorage.setItem("cookie_consent", "essential");
    setVisible(false);
  }

  if (!visible) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 p-4 sm:p-6">
      <div
        className="max-w-2xl mx-auto glass rounded-2xl p-6"
        role="dialog"
        aria-label="Cookie consent"
      >
        <div className="flex items-start gap-3 mb-4">
          <Shield
            className="w-5 h-5 text-indigo-400 shrink-0 mt-0.5"
            aria-hidden="true"
          />
          <p className="text-sm text-zinc-300 leading-relaxed">
            We use essential cookies for the site to function and optional
            analytics cookies to improve your experience. See our{" "}
            <a
              href="/cookies"
              className="text-indigo-400 hover:text-indigo-300 transition-colors underline"
            >
              Cookie Policy
            </a>{" "}
            for details.
          </p>
        </div>
        <div className="flex items-center gap-3 justify-end">
          <button
            onClick={handleEssentialOnly}
            className="btn-ghost px-5 py-2.5 rounded-xl text-sm font-medium"
          >
            Essential Only
          </button>
          <button
            onClick={handleAcceptAll}
            className="btn-gradient px-5 py-2.5 rounded-xl text-sm font-medium"
          >
            Accept All
          </button>
        </div>
      </div>
    </div>
  );
}
