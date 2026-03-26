"use client";

import ReactMarkdown from "react-markdown";
import type { Components } from "react-markdown";

interface MarkdownContentProps {
  content: string;
  className?: string;
  compact?: boolean;
}

const baseComponents: Components = {
  h1: ({ children }) => (
    <h1 className="text-2xl font-bold text-white mt-6 mb-3 first:mt-0">
      {children}
    </h1>
  ),
  h2: ({ children }) => (
    <h2 className="text-xl font-semibold text-white mt-5 mb-2 first:mt-0">
      {children}
    </h2>
  ),
  h3: ({ children }) => (
    <h3 className="text-lg font-semibold text-zinc-200 mt-4 mb-2 first:mt-0">
      {children}
    </h3>
  ),
  h4: ({ children }) => (
    <h4 className="text-base font-semibold text-zinc-200 mt-3 mb-1 first:mt-0">
      {children}
    </h4>
  ),
  p: ({ children }) => (
    <p className="text-zinc-300 leading-relaxed mb-3 last:mb-0">{children}</p>
  ),
  strong: ({ children }) => (
    <strong className="text-white font-semibold">{children}</strong>
  ),
  em: ({ children }) => <em className="text-zinc-200 italic">{children}</em>,
  ul: ({ children }) => (
    <ul className="list-none space-y-1.5 mb-3 last:mb-0 pl-1">{children}</ul>
  ),
  ol: ({ children }) => (
    <ol className="list-decimal list-inside space-y-1.5 mb-3 last:mb-0 pl-1 text-zinc-300 marker:text-indigo-400">
      {children}
    </ol>
  ),
  li: ({ children }) => (
    <li className="text-zinc-300 flex items-start gap-2">
      <span className="text-indigo-400 mt-1.5 shrink-0 block w-1.5 h-1.5 rounded-full bg-indigo-400" />
      <span>{children}</span>
    </li>
  ),
  a: ({ href, children }) => (
    <a
      href={href}
      className="text-indigo-400 hover:text-indigo-300 underline underline-offset-2 transition-colors"
      target="_blank"
      rel="noopener noreferrer"
    >
      {children}
    </a>
  ),
  code: ({ children, className }) => {
    const isBlock = className?.includes("language-");
    if (isBlock) {
      return (
        <code className="block bg-zinc-800/50 rounded-lg p-4 font-mono text-sm text-zinc-300 overflow-x-auto">
          {children}
        </code>
      );
    }
    return (
      <code className="bg-white/[0.06] px-1.5 py-0.5 rounded text-sm text-indigo-300 font-mono">
        {children}
      </code>
    );
  },
  pre: ({ children }) => <pre className="mb-3 last:mb-0">{children}</pre>,
  blockquote: ({ children }) => (
    <blockquote className="border-l-2 border-indigo-500/40 pl-4 my-3 text-zinc-400 italic">
      {children}
    </blockquote>
  ),
  hr: () => <hr className="border-zinc-700/50 my-4" />,
};

const compactComponents: Components = {
  ...baseComponents,
  h1: ({ children }) => (
    <h3 className="text-sm font-semibold text-zinc-200 mt-2 mb-1 first:mt-0">
      {children}
    </h3>
  ),
  h2: ({ children }) => (
    <h3 className="text-sm font-semibold text-zinc-200 mt-2 mb-1 first:mt-0">
      {children}
    </h3>
  ),
  h3: ({ children }) => (
    <h3 className="text-sm font-semibold text-zinc-200 mt-2 mb-1 first:mt-0">
      {children}
    </h3>
  ),
  p: ({ children }) => (
    <p className="text-xs text-zinc-400 leading-relaxed mb-2 last:mb-0">
      {children}
    </p>
  ),
  strong: ({ children }) => (
    <strong className="text-zinc-200 font-semibold">{children}</strong>
  ),
  ul: ({ children }) => (
    <ul className="list-none space-y-1 mb-2 last:mb-0 pl-1">{children}</ul>
  ),
  ol: ({ children }) => (
    <ol className="list-decimal list-inside space-y-1 mb-2 last:mb-0 pl-1 text-zinc-400 text-xs marker:text-indigo-400">
      {children}
    </ol>
  ),
  li: ({ children }) => (
    <li className="text-xs text-zinc-400 flex items-start gap-2">
      <span className="text-indigo-400 mt-1.5 shrink-0 block w-1 h-1 rounded-full bg-indigo-400" />
      <span>{children}</span>
    </li>
  ),
  code: ({ children }) => (
    <code className="bg-white/[0.06] px-1 py-0.5 rounded text-xs text-indigo-300 font-mono">
      {children}
    </code>
  ),
};

export default function MarkdownContent({
  content,
  className = "",
  compact = false,
}: MarkdownContentProps) {
  if (!content) return null;

  return (
    <div className={className}>
      <ReactMarkdown components={compact ? compactComponents : baseComponents}>
        {content}
      </ReactMarkdown>
    </div>
  );
}
