"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import MarkdownRenderer from "@/components/superadmin/blog/MarkdownRenderer";
import { getBlogErrorMessage, getBlogPost, type BlogPostSummary } from "@/lib/superadmin-blog";

export default function BlogPreviewPage({ params }: { params: { id: string } }) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [post, setPost] = useState<BlogPostSummary | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);
      setError(null);
      try {
        const data = await getBlogPost(params.id);
        if (!cancelled) {
          setPost(data);
        }
      } catch (err) {
        if (!cancelled) {
          setError(getBlogErrorMessage(err, "Falha ao carregar preview."));
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    void load();
    return () => {
      cancelled = true;
    };
  }, [params.id]);

  if (loading) {
    return <div className="px-4 py-8 text-sm text-zinc-400">Carregando preview...</div>;
  }

  if (error || !post) {
    return (
      <div className="space-y-4 px-4 py-8">
        <p className="rounded-lg border border-red-500/40 bg-red-900/20 px-4 py-3 text-sm text-red-200">
          {error || "Artigo não encontrado para preview."}
        </p>
        <Link
          href="/superadmin/blog"
          className="inline-flex items-center rounded-lg border border-zinc-700 px-3 py-2 text-sm text-zinc-200"
        >
          Voltar
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl space-y-6 px-4 py-6">
      <div className="rounded-2xl border border-zinc-800 bg-zinc-900/70 p-5">
        <div className="mb-3 flex items-center gap-2">
          <span className="rounded-md bg-zinc-800 px-2 py-1 text-xs text-zinc-300">
            Preview interno
          </span>
          <span className="rounded-md bg-yellow-500/20 px-2 py-1 text-xs text-yellow-300">
            {post.status}
          </span>
        </div>
        <h1 className="text-3xl font-bold text-zinc-100">{post.title}</h1>
        {post.subtitle ? <p className="mt-2 text-zinc-300">{post.subtitle}</p> : null}
        <p className="mt-3 text-sm text-zinc-400">
          Leitura estimada: {post.readingTimeMinutes} min • Dificuldade:{" "}
          {post.difficulty.toLowerCase()}
        </p>
        <p className="mt-4 rounded-lg border border-zinc-800 bg-zinc-950/70 px-3 py-3 text-sm text-zinc-300">
          {post.excerpt}
        </p>

        <div className="mt-4 grid gap-2 rounded-lg border border-zinc-800 bg-zinc-950/70 p-3 text-xs text-zinc-300 md:grid-cols-2">
          <p>
            <strong className="text-zinc-100">Meta title:</strong>{" "}
            {post.metaTitle || "(usa o título do artigo)"}
          </p>
          <p>
            <strong className="text-zinc-100">Canonical:</strong>{" "}
            {post.canonicalUrl || "(automática por slug)"}
          </p>
          <p>
            <strong className="text-zinc-100">Palavra-chave foco:</strong>{" "}
            {post.focusKeyword || "(não definida)"}
          </p>
          <p>
            <strong className="text-zinc-100">Robots:</strong> {post.robots || "index,follow"}
          </p>
        </div>
      </div>

      {post.coverImageUrl ? (
        <img
          src={post.coverImageUrl}
          alt={post.coverImageAlt || "Capa do artigo"}
          className="h-auto w-full rounded-2xl border border-zinc-800 object-cover"
          loading="lazy"
        />
      ) : null}

      <div className="rounded-2xl border border-zinc-800 bg-zinc-950/70 p-5">
        <MarkdownRenderer markdown={post.content || ""} className="prose prose-invert max-w-none" />
      </div>

      <div className="flex flex-wrap gap-2">
        <Link
          href={`/superadmin/blog/${post.id}`}
          className="inline-flex items-center rounded-lg border border-zinc-700 px-3 py-2 text-sm text-zinc-200"
        >
          Voltar ao editor
        </Link>
        <Link
          href="/superadmin/blog"
          className="inline-flex items-center rounded-lg border border-zinc-700 px-3 py-2 text-sm text-zinc-200"
        >
          Voltar para lista
        </Link>
      </div>
    </div>
  );
}
