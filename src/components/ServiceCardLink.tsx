"use client";

import { trackEvent } from "@/lib/analytics";
import { Mail } from "lucide-react";

interface ServiceCardLinkProps {
  href: string;
  serviceName: string;
}

export default function ServiceCardLink({
  href,
  serviceName,
}: ServiceCardLinkProps) {
  return (
    <a
      href={href}
      onClick={() => trackEvent("service_enquiry", { name: serviceName })}
      className="w-full btn-gradient px-6 py-3 rounded-xl font-semibold text-center flex items-center justify-center gap-2 focus-glow"
    >
      <Mail className="w-4 h-4" aria-hidden="true" />
      Get in Touch
    </a>
  );
}
