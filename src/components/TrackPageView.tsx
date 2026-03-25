"use client";

import { useEffect } from "react";
import { trackEvent } from "@/lib/analytics";

interface TrackPageViewProps {
  event: string;
  data?: Record<string, string | number>;
}

export default function TrackPageView({ event, data }: TrackPageViewProps) {
  useEffect(() => {
    trackEvent(event, data);
  }, [event, data]);

  return null;
}
