"use client";

import type { ReactNode } from "react";

type MarkdownRendererProps = {
  markdown: string;
  className?: string;
};

function slugifyHeading(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function sanitizeUrl(url: string) {
  const value = url.trim();
  if (!value) return "";
  if (value.startsWith("/")) return value;
  if (/^https?:\/\//i.test(value)) return value;
  return "";
}

function renderInline(text: string, keyPrefix: string): ReactNode[] {
  const tokens: ReactNode[] = [];
  const pattern =
    /!\[([^\]]*)\]\(([^)]+)\)|\[([^\]]+)\]\(([^)]+)\)|\*\*([^*]+)\*\*|`([^`]+)`|\*([^*]+)\*/g;

  let lastIndex = 0;
  let match: RegExpExecArray | null = null;
  let index = 0;

  while ((match = pattern.exec(text)) !== null) {
    if (match.index > lastIndex) {
      tokens.push(text.slice(lastIndex, match.index));
    }

    const key = `${keyPrefix}-${index}`;
    index += 1;

    if (match[1] !== undefined && match[2] !== undefined) {
      const src = sanitizeUrl(match[2]);
      if (src) {
        tokens.push(
          <img
            key={key}
            src={src}
            alt={match[1] || "Imagem do artigo"}
            className="my-4 h-auto w-full rounded-lg border border-zinc-800"
            loading="lazy"
          />
        );
      } else {
        tokens.push(match[0]);
      }
    } else if (match[3] !== undefined && match[4] !== undefined) {
      const href = sanitizeUrl(match[4]);
      if (href) {
        tokens.push(
          <a
            key={key}
            href={href}
            className="text-yellow-300 underline underline-offset-4 hover:text-yellow-200"
            target={href.startsWith("http") ? "_blank" : undefined}
            rel={href.startsWith("http") ? "noreferrer noopener" : undefined}
          >
            {match[3]}
          </a>
        );
      } else {
        tokens.push(match[0]);
      }
    } else if (match[5] !== undefined) {
      tokens.push(
        <strong key={key} className="font-semibold text-zinc-50">
          {match[5]}
        </strong>
      );
    } else if (match[6] !== undefined) {
      tokens.push(
        <code key={key} className="rounded bg-zinc-800 px-1.5 py-0.5 text-sm text-zinc-100">
          {match[6]}
        </code>
      );
    } else if (match[7] !== undefined) {
      tokens.push(
        <em key={key} className="italic text-zinc-100">
          {match[7]}
        </em>
      );
    }

    lastIndex = pattern.lastIndex;
  }

  if (lastIndex < text.length) {
    tokens.push(text.slice(lastIndex));
  }

  return tokens;
}

function isListMarker(line: string) {
  return /^[-*]\s+/.test(line) || /^\d+\.\s+/.test(line);
}

function isBlockBoundary(line: string) {
  return (
    !line.trim() ||
    /^#{1,6}\s+/.test(line) ||
    /^```/.test(line) ||
    isListMarker(line) ||
    /^>\s?/.test(line)
  );
}

export default function MarkdownRenderer({ markdown, className }: MarkdownRendererProps) {
  const lines = (markdown || "").replace(/\r\n/g, "\n").split("\n");
  const blocks: ReactNode[] = [];
  let i = 0;

  while (i < lines.length) {
    const current = lines[i];
    const trimmed = current.trim();

    if (!trimmed) {
      i += 1;
      continue;
    }

    if (trimmed.startsWith("```")) {
      const codeLines: string[] = [];
      i += 1;
      while (i < lines.length && !lines[i].trim().startsWith("```")) {
        codeLines.push(lines[i]);
        i += 1;
      }
      i += 1;
      blocks.push(
        <pre
          key={`code-${blocks.length}`}
          className="my-6 overflow-x-auto rounded-lg bg-zinc-900 p-4 text-sm text-zinc-100"
        >
          <code>{codeLines.join("\n")}</code>
        </pre>
      );
      continue;
    }

    const headingMatch = trimmed.match(/^(#{1,6})\s+(.*)$/);
    if (headingMatch) {
      const level = headingMatch[1].length;
      const text = headingMatch[2].trim();
      const id = slugifyHeading(text) || `secao-${blocks.length}`;
      const content = renderInline(text, `h-${blocks.length}`);
      const Tag = `h${Math.min(level, 6)}` as unknown as keyof JSX.IntrinsicElements;
      const sizeClass =
        level === 1
          ? "text-3xl md:text-4xl font-extrabold mt-10 mb-4"
          : level === 2
            ? "text-2xl md:text-3xl font-bold mt-8 mb-3"
            : "text-xl font-semibold mt-6 mb-2";
      blocks.push(
        <Tag key={`h-${blocks.length}`} id={id} className={sizeClass}>
          {content}
        </Tag>
      );
      i += 1;
      continue;
    }

    if (/^>\s?/.test(trimmed)) {
      const quoteLines: string[] = [];
      while (i < lines.length && /^>\s?/.test(lines[i].trim())) {
        quoteLines.push(lines[i].trim().replace(/^>\s?/, ""));
        i += 1;
      }
      blocks.push(
        <blockquote
          key={`q-${blocks.length}`}
          className="my-6 border-l-4 border-yellow-400 bg-zinc-900/60 px-4 py-3 text-zinc-200"
        >
          {renderInline(quoteLines.join(" "), `q-${blocks.length}`)}
        </blockquote>
      );
      continue;
    }

    if (/^[-*]\s+/.test(trimmed)) {
      const items: string[] = [];
      while (i < lines.length && /^[-*]\s+/.test(lines[i].trim())) {
        items.push(lines[i].trim().replace(/^[-*]\s+/, ""));
        i += 1;
      }
      blocks.push(
        <ul key={`ul-${blocks.length}`} className="my-4 list-disc space-y-2 pl-6 text-zinc-200">
          {items.map((item, idx) => (
            <li key={`ul-${idx}`}>{renderInline(item, `ul-${blocks.length}-${idx}`)}</li>
          ))}
        </ul>
      );
      continue;
    }

    if (/^\d+\.\s+/.test(trimmed)) {
      const items: string[] = [];
      while (i < lines.length && /^\d+\.\s+/.test(lines[i].trim())) {
        items.push(lines[i].trim().replace(/^\d+\.\s+/, ""));
        i += 1;
      }
      blocks.push(
        <ol key={`ol-${blocks.length}`} className="my-4 list-decimal space-y-2 pl-6 text-zinc-200">
          {items.map((item, idx) => (
            <li key={`ol-${idx}`}>{renderInline(item, `ol-${blocks.length}-${idx}`)}</li>
          ))}
        </ol>
      );
      continue;
    }

    const paragraphLines: string[] = [];
    while (i < lines.length && !isBlockBoundary(lines[i])) {
      paragraphLines.push(lines[i].trim());
      i += 1;
    }
    if (paragraphLines.length === 0) {
      i += 1;
      continue;
    }

    blocks.push(
      <p key={`p-${blocks.length}`} className="my-4 leading-8 text-zinc-200">
        {renderInline(paragraphLines.join(" "), `p-${blocks.length}`)}
      </p>
    );
  }

  return <article className={className}>{blocks}</article>;
}
