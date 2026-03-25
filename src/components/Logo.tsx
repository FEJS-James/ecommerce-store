import React from "react";

type LogoVariant = "full" | "icon" | "wordmark";
type LogoColorVariant = "light" | "dark" | "mono" | "gradient";

interface LogoProps {
  size?: number;
  variant?: LogoVariant;
  colorVariant?: LogoColorVariant;
  className?: string;
}

const GRADIENT_ID = "logo-gradient";

function LogoIcon({
  size = 32,
  colorVariant = "light",
}: {
  size?: number;
  colorVariant?: LogoColorVariant;
}) {
  const useGradient = colorVariant === "gradient";

  const strokeColor = (() => {
    switch (colorVariant) {
      case "light":
        return "#E4E4E7";
      case "dark":
        return "#18181B";
      case "mono":
        return "currentColor";
      case "gradient":
        return `url(#${GRADIENT_ID})`;
    }
  })();

  const nodeColor = (() => {
    switch (colorVariant) {
      case "light":
        return "#A5B4FC";
      case "dark":
        return "#4338CA";
      case "mono":
        return "currentColor";
      case "gradient":
        return `url(#${GRADIENT_ID})`;
    }
  })();

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 64 64"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      {useGradient && (
        <defs>
          <linearGradient
            id={GRADIENT_ID}
            x1="0"
            y1="0"
            x2="64"
            y2="64"
            gradientUnits="userSpaceOnUse"
          >
            <stop stopColor="#6366F1" />
            <stop offset="1" stopColor="#8B5CF6" />
          </linearGradient>
        </defs>
      )}

      {/* Geometric "A" — two angled strokes meeting at apex with a crossbar */}
      {/* Left stroke */}
      <line
        x1="10"
        y1="54"
        x2="32"
        y2="8"
        stroke={strokeColor}
        strokeWidth="4"
        strokeLinecap="round"
      />
      {/* Right stroke */}
      <line
        x1="54"
        y1="54"
        x2="32"
        y2="8"
        stroke={strokeColor}
        strokeWidth="4"
        strokeLinecap="round"
      />
      {/* Crossbar — slightly below midpoint for proper "A" proportion */}
      <line
        x1="17"
        y1="38"
        x2="47"
        y2="38"
        stroke={strokeColor}
        strokeWidth="3"
        strokeLinecap="round"
      />

      {/* Neural network nodes at key vertices */}
      <circle cx="32" cy="8" r="3.5" fill={nodeColor} />
      <circle cx="10" cy="54" r="3" fill={nodeColor} />
      <circle cx="54" cy="54" r="3" fill={nodeColor} />
      {/* Crossbar junction nodes */}
      <circle cx="17" cy="38" r="2.5" fill={nodeColor} />
      <circle cx="47" cy="38" r="2.5" fill={nodeColor} />
      {/* Center node on crossbar — the "AI core" */}
      <circle cx="32" cy="38" r="2" fill={nodeColor} />
    </svg>
  );
}

function LogoWordmark({
  colorVariant = "light",
  className,
}: {
  colorVariant?: LogoColorVariant;
  className?: string;
}) {
  const textColor = (() => {
    switch (colorVariant) {
      case "light":
        return "text-white";
      case "dark":
        return "text-zinc-900";
      case "mono":
        return "";
      case "gradient":
        return "text-white";
    }
  })();

  return (
    <span className={`font-bold text-xl tracking-tight ${textColor} ${className || ""}`}>
      AI Armory
    </span>
  );
}

export default function Logo({
  size = 32,
  variant = "full",
  colorVariant = "light",
  className,
}: LogoProps) {
  if (variant === "icon") {
    return (
      <span className={className}>
        <LogoIcon size={size} colorVariant={colorVariant} />
      </span>
    );
  }

  if (variant === "wordmark") {
    return <LogoWordmark colorVariant={colorVariant} className={className} />;
  }

  // Full variant: icon + wordmark
  return (
    <span className={`inline-flex items-center gap-2.5 ${className || ""}`}>
      <LogoIcon size={size} colorVariant={colorVariant} />
      <LogoWordmark colorVariant={colorVariant} />
    </span>
  );
}
