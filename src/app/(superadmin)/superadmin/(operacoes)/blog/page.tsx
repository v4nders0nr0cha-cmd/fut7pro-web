"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  archiveBlogPost,
  listBlogCategories,
  listBlogPosts,
  publishBlogPost,
  type BlogCategory,
  type BlogPostSummary,
  type BlogStatus,
  unpublishBlogPost,
} from "@/lib/superadmin-blog";

const STATUS_LABEL: Record<BlogStatus, string> = {
  DRAFT: "Rascunho",
  SCHEDULED: "Agendado",
  PUBLISHED: "Publicado",
  ARCHIVED: "Arquivado",
};

const STATUS_BADGE: Record<BlogStatus, string> = {
  DRAFT: "bg-zinc-700 text-zinc-100",
  SCHEDULED: "bg-blue-700 text-blue-50",
  PUBLISHED: "bg-green-700 text-green-50",
  ARCHIVED: "bg-zinc-800 text-zinc-200",
};

export default function SuperAdminBlogPage() {
  const [items, setItems] = useState<BlogPostSummary[]>([]);
  const [categories, setCategories] = useState<BlogCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [q, setQ] = useState("");
  const [status, setStatus] = useState<BlogStatus | "">("");
  const [category, setCategory] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [postResponse, categoryResponse] = await Promise.all([
        listBlogPosts({
          page,
          pageSize: 20,
          q: q || undefined,
          status,
          category: category || undefined,
        }),
        listBlogCategories(),
      ]);
      setItems(postResponse.results);
      setTotalPages(postResponse.totalPages);
      setCategories(categoryResponse);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Falha ao carregar o blog.");
    } finally {
      setLoading(false);
    }
  }, [category, page, q, status]);

  useEffect(() => {
    load();
  }, [load]);

  const hasFilters = useMemo(() => Boolean(q || status || category), [q, status, category]);

  async function handlePublish(id: string) {
    setBusyId(id);
    try {
      await publishBlogPost(id);
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Falha ao publicar artigo.");
    } finally {
      setBusyId(null);
    }
  }

  async function handleUnpublish(id: string) {
    setBusyId(id);
    try {
      await unpublishBlogPost(id);
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Falha ao despublicar artigo.");
    } finally {
      setBusyId(null);
    }
  }

  async function handleArchive(id: string) {
    const confirmed = window.confirm("Deseja arquivar este artigo?");
    if (!confirmed) return;
    setBusyId(id);
    try {
      await archiveBlogPost(id);
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Falha ao arquivar artigo.");
    } finally {
      setBusyId(null);
    }
  }

  return (
    <div className="space-y-6 px-4 py-6 md:px-6">
      <header className="flex flex-col gap-4 rounded-2xl border border-zinc-800 bg-zinc-900/70 p-5 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-yellow-300">Blog</h1>
          <p className="mt-1 text-sm text-zinc-300">
            Gerencie rascunhos, publicações e SEO do conteúdo institucional.
          </p>
        </div>
        <Link
          href="/superadmin/blog/novo"
          className="inline-flex items-center justify-center rounded-xl bg-yellow-400 px-4 py-2 font-semibold text-black hover:bg-yellow-300"
        >
          Novo artigo
        </Link>
      </header>

      <section className="grid grid-cols-1 gap-3 rounded-2xl border border-zinc-800 bg-zinc-900/60 p-4 md:grid-cols-4">
        <input
          type="search"
          value={q}
          onChange={(event) => setQ(event.target.value)}
          placeholder="Buscar por título ou resumo"
          className="rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm text-zinc-100 outline-none ring-yellow-400 focus:ring-2"
        />

        <select
          value={status}
          onChange={(event) => setStatus(event.target.value as BlogStatus | "")}
          className="rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm text-zinc-100 outline-none ring-yellow-400 focus:ring-2"
        >
          <option value="">Todos os status</option>
          <option value="DRAFT">Rascunho</option>
          <option value="SCHEDULED">Agendado</option>
          <option value="PUBLISHED">Publicado</option>
          <option value="ARCHIVED">Arquivado</option>
        </select>

        <select
          value={category}
          onChange={(event) => setCategory(event.target.value)}
          className="rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm text-zinc-100 outline-none ring-yellow-400 focus:ring-2"
        >
          <option value="">Todas as categorias</option>
          {categories.map((item) => (
            <option key={item.id} value={item.id}>
              {item.name}
            </option>
          ))}
        </select>

        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => {
              setPage(1);
              void load();
            }}
            className="flex-1 rounded-lg bg-zinc-100 px-3 py-2 text-sm font-semibold text-zinc-900 hover:bg-white"
          >
            Aplicar
          </button>
          <button
            type="button"
            onClick={() => {
              setQ("");
              setStatus("");
              setCategory("");
              setPage(1);
            }}
            disabled={!hasFilters}
            className="rounded-lg border border-zinc-600 px-3 py-2 text-sm font-semibold text-zinc-200 disabled:cursor-not-allowed disabled:opacity-40"
          >
            Limpar
          </button>
        </div>
      </section>

      {error ? (
        <div className="rounded-lg border border-red-500/40 bg-red-900/20 px-4 py-3 text-sm text-red-200">
          {error}
        </div>
      ) : null}

      <section className="overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-950/70">
        <div className="hidden grid-cols-[2fr_1fr_120px_120px_90px_260px] gap-3 border-b border-zinc-800 px-4 py-3 text-xs font-semibold uppercase tracking-wide text-zinc-400 md:grid">
          <span>Título</span>
          <span>Categoria</span>
          <span>Status</span>
          <span>Publicado</span>
          <span>Views</span>
          <span>Ações</span>
        </div>

        {loading ? (
          <div className="px-4 py-8 text-sm text-zinc-400">Carregando artigos...</div>
        ) : items.length === 0 ? (
          <div className="px-4 py-8 text-sm text-zinc-400">Nenhum artigo encontrado.</div>
        ) : (
          <div className="divide-y divide-zinc-800">
            {items.map((post) => (
              <article key={post.id} className="px-4 py-4">
                <div className="grid gap-3 md:grid-cols-[2fr_1fr_120px_120px_90px_260px] md:items-center">
                  <div>
                    <h2 className="text-sm font-semibold text-zinc-100 md:text-base">
                      {post.title}
                    </h2>
                    <p className="mt-1 line-clamp-2 text-xs text-zinc-400 md:text-sm">
                      {post.excerpt}
                    </p>
                    <div className="mt-2 flex flex-wrap gap-1">
                      {post.featured ? (
                        <span className="rounded-md bg-yellow-500/20 px-2 py-0.5 text-[11px] text-yellow-300">
                          Destaque da semana
                        </span>
                      ) : null}
                      <span className="rounded-md bg-zinc-800 px-2 py-0.5 text-[11px] text-zinc-300">
                        {post.readingTimeMinutes} min
                      </span>
                      <span className="rounded-md bg-zinc-800 px-2 py-0.5 text-[11px] text-zinc-300">
                        {post.difficulty.toLowerCase()}
                      </span>
                    </div>
                  </div>

                  <div className="text-sm text-zinc-300">
                    {post.category?.name || "Sem categoria"}
                  </div>

                  <div>
                    <span
                      className={`rounded-md px-2 py-1 text-xs font-semibold ${STATUS_BADGE[post.status]}`}
                    >
                      {STATUS_LABEL[post.status]}
                    </span>
                  </div>

                  <div className="text-sm text-zinc-300">
                    {post.publishedAt
                      ? new Date(post.publishedAt).toLocaleDateString("pt-BR")
                      : "-"}
                  </div>

                  <div className="text-sm text-zinc-300">{post.viewsTotal}</div>

                  <div className="flex flex-wrap gap-2">
                    <Link
                      href={`/superadmin/blog/${post.id}`}
                      className="rounded-md border border-zinc-700 px-2 py-1 text-xs font-semibold text-zinc-200 hover:border-zinc-500"
                    >
                      Editar
                    </Link>
                    <Link
                      href={`/superadmin/blog/preview/${post.id}`}
                      className="rounded-md border border-blue-500/50 px-2 py-1 text-xs font-semibold text-blue-200 hover:border-blue-400"
                    >
                      Preview
                    </Link>

                    {post.status === "PUBLISHED" ? (
                      <button
                        type="button"
                        onClick={() => void handleUnpublish(post.id)}
                        disabled={busyId === post.id}
                        className="rounded-md border border-amber-500/60 px-2 py-1 text-xs font-semibold text-amber-200 hover:border-amber-400 disabled:opacity-50"
                      >
                        Despublicar
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={() => void handlePublish(post.id)}
                        disabled={busyId === post.id || post.status === "ARCHIVED"}
                        className="rounded-md border border-green-500/60 px-2 py-1 text-xs font-semibold text-green-200 hover:border-green-400 disabled:opacity-40"
                      >
                        Publicar
                      </button>
                    )}

                    <button
                      type="button"
                      onClick={() => void handleArchive(post.id)}
                      disabled={busyId === post.id || post.status === "ARCHIVED"}
                      className="rounded-md border border-red-500/60 px-2 py-1 text-xs font-semibold text-red-200 hover:border-red-400 disabled:opacity-40"
                    >
                      Arquivar
                    </button>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>

      <footer className="flex items-center justify-between text-sm text-zinc-400">
        <button
          type="button"
          onClick={() => setPage((old) => Math.max(1, old - 1))}
          disabled={page <= 1}
          className="rounded-md border border-zinc-700 px-3 py-1.5 disabled:opacity-40"
        >
          Página anterior
        </button>
        <span>
          Página {page} de {Math.max(totalPages, 1)}
        </span>
        <button
          type="button"
          onClick={() => setPage((old) => old + 1)}
          disabled={totalPages > 0 ? page >= totalPages : true}
          className="rounded-md border border-zinc-700 px-3 py-1.5 disabled:opacity-40"
        >
          Próxima página
        </button>
      </footer>
    </div>
  );
}
