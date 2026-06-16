import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import type { Components } from "react-markdown";

interface AIMarkdownProps {
  content: string;
  isStreaming?: boolean;
  className?: string;
  rich?: boolean;
}

// ── Chat bubble components (compact) ──────────────────────────────────────────
const chatComponents: Components = {
  h1: ({ children }) => (
    <h1 className="mb-2 mt-3 text-base font-bold text-slate-900 dark:text-white first:mt-0">
      {children}
    </h1>
  ),
  h2: ({ children }) => (
    <h2 className="mb-1.5 mt-3 border-b border-orange-200 pb-0.5 text-sm font-bold text-[#FF6B00] dark:border-orange-800 dark:text-[#FFB347] first:mt-0">
      {children}
    </h2>
  ),
  h3: ({ children }) => (
    <h3 className="mb-1 mt-2.5 text-sm font-semibold text-slate-800 dark:text-slate-200 first:mt-0">
      {children}
    </h3>
  ),
  p: ({ children }) => (
    <p className="mb-1.5 text-sm leading-relaxed last:mb-0">{children}</p>
  ),
  ul: ({ children }) => (
    <ul className="mb-1.5 space-y-0.5 pl-4">{children}</ul>
  ),
  ol: ({ children }) => (
    <ol className="mb-1.5 list-decimal space-y-0.5 pl-4">{children}</ol>
  ),
  li: ({ children }) => (
    <li className="text-sm leading-relaxed text-slate-700 dark:text-slate-300">
      {children}
    </li>
  ),
  strong: ({ children }) => (
    <strong className="font-semibold text-slate-900 dark:text-white">{children}</strong>
  ),
  em: ({ children }) => (
    <em className="italic text-slate-600 dark:text-slate-400">{children}</em>
  ),
  code: ({ children, className }) => {
    const isBlock = className?.includes("language-");
    if (isBlock) {
      return (
        <pre className="my-2 overflow-x-auto rounded-lg bg-slate-900 p-3 text-xs text-slate-100 dark:bg-slate-950">
          <code>{children}</code>
        </pre>
      );
    }
    return (
      <code className="rounded bg-slate-100 px-1.5 py-0.5 font-mono text-xs text-slate-800 dark:bg-slate-700 dark:text-slate-200">
        {children}
      </code>
    );
  },
  blockquote: ({ children }) => (
    <blockquote className="my-1.5 border-l-2 border-[#FF6B00] bg-orange-50/40 pl-3 pr-2 py-1 text-sm italic text-slate-600 rounded-r-md dark:border-orange-700 dark:bg-orange-900/10 dark:text-slate-400">
      {children}
    </blockquote>
  ),
  hr: () => (
    <hr className="my-2 border-slate-200 dark:border-slate-700" />
  ),
  table: ({ children }) => (
    <div className="my-2 overflow-x-auto">
      <table className="w-full text-sm border-collapse">{children}</table>
    </div>
  ),
  th: ({ children }) => (
    <th className="border border-slate-200 bg-slate-50 px-3 py-1.5 text-left text-xs font-bold text-slate-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300">
      {children}
    </th>
  ),
  td: ({ children }) => (
    <td className="border border-slate-200 px-3 py-1.5 text-xs text-slate-600 dark:border-slate-700 dark:text-slate-400">
      {children}
    </td>
  ),
};

// ── Rich document analysis components (bigger, more visual) ───────────────────
const richComponents: Components = {
  ...chatComponents,
  h1: ({ children }) => (
    <h1 className="mb-3 mt-5 flex items-start gap-2 text-xl font-black leading-tight text-slate-900 dark:text-white first:mt-0">
      <span className="leading-tight">{children}</span>
    </h1>
  ),
  h2: ({ children }) => (
    <h2 className="mb-2 mt-5 first:mt-0">
      <span className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-[#FF6B00]/10 to-[#FFB347]/10 px-3 py-1.5 text-sm font-bold text-[#FF6B00] dark:from-[#FF6B00]/15 dark:to-[#FFB347]/15 dark:text-[#FFB347]">
        {children}
      </span>
    </h2>
  ),
  h3: ({ children }) => (
    <h3 className="mb-1.5 mt-3.5 flex items-center gap-1.5 text-sm font-bold text-slate-800 dark:text-slate-200 first:mt-0">
      <span className="h-3.5 w-1 flex-shrink-0 rounded-full bg-[#FF6B00]" />
      {children}
    </h3>
  ),
  p: ({ children }) => (
    <p className="mb-2 text-sm leading-relaxed text-slate-700 last:mb-0 dark:text-slate-300">{children}</p>
  ),
  ul: ({ children }) => (
    <ul className="mb-2 space-y-1 pl-1">{children}</ul>
  ),
  ol: ({ children }) => (
    <ol className="mb-2 list-decimal space-y-1 pl-5">{children}</ol>
  ),
  li: ({ children }) => (
    <li className="flex items-start gap-2 text-sm leading-relaxed text-slate-700 dark:text-slate-300">
      <span className="mt-1 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-[#FF6B00]" />
      <span>{children}</span>
    </li>
  ),
  strong: ({ children }) => (
    <strong className="font-bold text-slate-900 dark:text-white">{children}</strong>
  ),
  blockquote: ({ children }) => (
    <blockquote className="my-3 rounded-xl border-l-4 border-[#FF6B00] bg-gradient-to-r from-orange-50 to-amber-50/30 py-3 pl-4 pr-3 text-sm text-slate-700 shadow-sm dark:from-orange-900/15 dark:to-amber-900/10 dark:text-slate-300">
      {children}
    </blockquote>
  ),
  hr: () => (
    <div className="my-4 flex items-center gap-3">
      <div className="h-px flex-1 bg-gradient-to-r from-transparent via-slate-200 to-transparent dark:via-slate-700" />
      <span className="text-xs text-slate-300 dark:text-slate-600">✦</span>
      <div className="h-px flex-1 bg-gradient-to-r from-transparent via-slate-200 to-transparent dark:via-slate-700" />
    </div>
  ),
};

export default function AIMarkdown({ content, isStreaming, className, rich }: AIMarkdownProps) {
  return (
    <div className={className}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={rich ? richComponents : chatComponents}
      >
        {content}
      </ReactMarkdown>
      {isStreaming && (
        <span className="ml-0.5 inline-block h-4 w-0.5 animate-pulse bg-[#FF6B00] opacity-80" />
      )}
    </div>
  );
}
