"use client";

import { useEffect } from "react";

interface TrackPageViewProps {
  event: string;
}

export default function TrackPageView({ event }: TrackPageViewProps) {
  useEffect(() => {
    if (typeof window !== "undefined" && typeof (window as any).umami !== "undefined") {
      (window as any).umami.track(event);
    }
  }, [event]);

  return null;
}
