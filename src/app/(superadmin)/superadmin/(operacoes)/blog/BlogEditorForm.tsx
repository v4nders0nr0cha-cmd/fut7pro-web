"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { type ChangeEvent, useEffect, useMemo, useRef, useState } from "react";
import {
  createBlogCategory,
  createBlogPost,
  createBlogTag,
  getBlogPost,
  listBlogCategories,
  listBlogTags,
  publishBlogPost,
  slugifyBlogTitle,
  type BlogCategory,
  type BlogDifficulty,
  type BlogStatus,
  type BlogTag,
  type UpsertBlogPostPayload,
  updateBlogPost,
  uploadBlogAsset,
} from "@/lib/superadmin-blog";

type BlogEditorFormProps = {
  postId?: string;
};

const DIFFICULTIES: Array<{ value: BlogDifficulty; label: string }> = [
  { value: "INICIANTE", label: "Iniciante" },
  { value: "INTERMEDIARIO", label: "Intermediário" },
  { value: "AVANCADO", label: "Avançado" },
];

const STATUSES: Array<{ value: BlogStatus; label: string }> = [
  { value: "DRAFT", label: "Rascunho" },
  { value: "SCHEDULED", label: "Agendado" },
  { value: "PUBLISHED", label: "Publicado" },
  { value: "ARCHIVED", label: "Arquivado" },
];

export default function BlogEditorForm({ postId }: BlogEditorFormProps) {
  const router = useRouter();
  const contentRef = useRef<HTMLTextAreaElement | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingCover, setUploadingCover] = useState(false);
  const [uploadingOg, setUploadingOg] = useState(false);
  const [uploadingInline, setUploadingInline] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [slugTouched, setSlugTouched] = useState(false);
  const [savedPostId, setSavedPostId] = useState(postId || "");

  const [categories, setCategories] = useState<BlogCategory[]>([]);
  const [tags, setTags] = useState<BlogTag[]>([]);
  const [newCategory, setNewCategory] = useState("");
  const [newTag, setNewTag] = useState("");

  const [title, setTitle] = useState("");
  const [subtitle, setSubtitle] = useState("");
  const [excerpt, setExcerpt] = useState("");
  const [content, setContent] = useState("");
  const [slug, setSlug] = useState("");
  const [status, setStatus] = useState<BlogStatus>("DRAFT");
  const [difficulty, setDifficulty] = useState<BlogDifficulty>("INICIANTE");
  const [categoryId, setCategoryId] = useState("");
  const [selectedTagIds, setSelectedTagIds] = useState<string[]>([]);
  const [featured, setFeatured] = useState(false);
  const [coverImageUrl, setCoverImageUrl] = useState("");
  const [coverImageAlt, setCoverImageAlt] = useState("");
  const [ogImageUrl, setOgImageUrl] = useState("");

  useEffect(() => {
    if (slugTouched) return;
    setSlug(slugifyBlogTitle(title));
  }, [slugTouched, title]);

  useEffect(() => {
    let cancelled = false;

    async function bootstrap() {
      setLoading(true);
      setError(null);
      try {
        const [loadedCategories, loadedTags] = await Promise.all([
          listBlogCategories(),
          listBlogTags(),
        ]);
        if (cancelled) return;
        setCategories(loadedCategories);
        setTags(loadedTags);

        if (postId) {
          const post = await getBlogPost(postId);
          if (cancelled) return;
          setSavedPostId(post.id);
          setTitle(post.title || "");
          setSubtitle(post.subtitle || "");
          setExcerpt(post.excerpt || "");
          setContent(post.content || "");
          setSlug(post.slug || "");
          setSlugTouched(true);
          setStatus(post.status);
          setDifficulty(post.difficulty);
          setCategoryId(post.categoryId || "");
          setSelectedTagIds(post.tags.map((tag) => tag.id));
          setFeatured(Boolean(post.featured));
          setCoverImageUrl(post.coverImageUrl || "");
          setCoverImageAlt(post.coverImageAlt || "");
          setOgImageUrl(post.ogImageUrl || "");
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "Falha ao carregar editor.");
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    void bootstrap();
    return () => {
      cancelled = true;
    };
  }, [postId]);

  const canPreview = useMemo(() => Boolean(savedPostId), [savedPostId]);

  function toggleTag(id: string) {
    setSelectedTagIds((current) =>
      current.includes(id) ? current.filter((tagId) => tagId !== id) : [...current, id]
    );
  }

  async function handleCreateCategory() {
    if (!newCategory.trim()) return;
    try {
      const created = await createBlogCategory({ name: newCategory.trim() });
      setCategories((current) =>
        [...current, created].sort((a, b) => a.name.localeCompare(b.name))
      );
      setCategoryId(created.id);
      setNewCategory("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Falha ao criar categoria.");
    }
  }

  async function handleCreateTag() {
    if (!newTag.trim()) return;
    try {
      const created = await createBlogTag({ name: newTag.trim() });
      setTags((current) => [...current, created].sort((a, b) => a.name.localeCompare(b.name)));
      setSelectedTagIds((current) => Array.from(new Set([...current, created.id])));
      setNewTag("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Falha ao criar tag.");
    }
  }

  function buildPayload(nextStatus: BlogStatus): UpsertBlogPostPayload {
    return {
      title: title.trim(),
      subtitle: subtitle.trim() || undefined,
      excerpt: excerpt.trim(),
      content: content.trim(),
      slug: slug.trim() || undefined,
      coverImageUrl: coverImageUrl.trim() || undefined,
      coverImageAlt: coverImageAlt.trim() || undefined,
      ogImageUrl: ogImageUrl.trim() || undefined,
      status: nextStatus,
      featured,
      categoryId: categoryId || undefined,
      tagIds: selectedTagIds,
      difficulty,
      publishedAt: nextStatus === "PUBLISHED" ? new Date().toISOString() : undefined,
    };
  }

  async function persist(mode: "draft" | "publish") {
    setSaving(true);
    setMessage(null);
    setError(null);

    try {
      const nextStatus: BlogStatus =
        mode === "publish" ? "PUBLISHED" : status === "ARCHIVED" ? "DRAFT" : status;
      const payload = buildPayload(nextStatus);
      const result = savedPostId
        ? await updateBlogPost(savedPostId, payload)
        : await createBlogPost(payload);

      setSavedPostId(result.id);
      if (!postId) {
        router.replace(`/superadmin/blog/${result.id}`);
      }

      if (mode === "publish" && result.status !== "PUBLISHED") {
        await publishBlogPost(result.id);
      }

      setStatus(mode === "publish" ? "PUBLISHED" : result.status);
      setMessage(
        mode === "publish" ? "Artigo publicado com sucesso." : "Rascunho salvo com sucesso."
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : "Falha ao salvar artigo.");
    } finally {
      setSaving(false);
    }
  }

  async function handlePreview() {
    if (savedPostId) {
      router.push(`/superadmin/blog/preview/${savedPostId}`);
      return;
    }
    await persist("draft");
  }

  async function handleImageUpload(
    file: File | null,
    mode: "cover" | "og" | "inline",
    event?: ChangeEvent<HTMLInputElement>
  ) {
    if (!file) return;
    setError(null);
    setMessage(null);

    try {
      if (mode === "cover") setUploadingCover(true);
      if (mode === "og") setUploadingOg(true);
      if (mode === "inline") setUploadingInline(true);

      const alt =
        mode === "inline"
          ? window.prompt("Alt da imagem (obrigatório):", "Imagem do artigo")
          : coverImageAlt;
      const asset = await uploadBlogAsset({
        file,
        alt: alt || undefined,
        postId: savedPostId || undefined,
      });

      if (mode === "cover") {
        setCoverImageUrl(asset.url);
        if (!coverImageAlt.trim()) {
          setCoverImageAlt(asset.alt || "Capa do artigo");
        }
      } else if (mode === "og") {
        setOgImageUrl(asset.url);
      } else {
        const markdownImage = `![${asset.alt || "Imagem do artigo"}](${asset.url})`;
        const textarea = contentRef.current;
        if (!textarea) {
          setContent((old) => `${old}\n\n${markdownImage}`);
        } else {
          const start = textarea.selectionStart || 0;
          const end = textarea.selectionEnd || 0;
          const before = content.slice(0, start);
          const after = content.slice(end);
          const inserted = `${before}${markdownImage}${after}`;
          setContent(inserted);
          requestAnimationFrame(() => {
            textarea.focus();
            const cursor = start + markdownImage.length;
            textarea.setSelectionRange(cursor, cursor);
          });
        }
      }

      setMessage("Imagem enviada com sucesso.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Falha ao enviar imagem.");
    } finally {
      if (mode === "cover") setUploadingCover(false);
      if (mode === "og") setUploadingOg(false);
      if (mode === "inline") setUploadingInline(false);
      if (event) {
        event.target.value = "";
      }
    }
  }

  if (loading) {
    return <div className="px-4 py-8 text-sm text-zinc-400">Carregando editor...</div>;
  }

  return (
    <div className="space-y-6 px-4 py-6 md:px-6">
      <header className="flex flex-col gap-3 rounded-2xl border border-zinc-800 bg-zinc-900/70 p-5 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-yellow-300">
            {savedPostId ? "Editar artigo" : "Novo artigo"}
          </h1>
          <p className="mt-1 text-sm text-zinc-300">
            Conteúdo em Markdown com SEO e publicação no site institucional.
          </p>
        </div>
        <Link
          href="/superadmin/blog"
          className="inline-flex items-center rounded-lg border border-zinc-700 px-3 py-2 text-sm text-zinc-200 hover:border-zinc-500"
        >
          Voltar para lista
        </Link>
      </header>

      {error ? (
        <div className="rounded-lg border border-red-500/40 bg-red-900/20 px-4 py-3 text-sm text-red-200">
          {error}
        </div>
      ) : null}
      {message ? (
        <div className="rounded-lg border border-green-500/40 bg-green-900/20 px-4 py-3 text-sm text-green-200">
          {message}
        </div>
      ) : null}

      <section className="space-y-5 rounded-2xl border border-zinc-800 bg-zinc-950/70 p-5">
        <div className="grid gap-4 md:grid-cols-2">
          <label className="flex flex-col gap-2 text-sm text-zinc-200">
            Título
            <input
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              className="rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-2 outline-none ring-yellow-400 focus:ring-2"
            />
          </label>
          <label className="flex flex-col gap-2 text-sm text-zinc-200">
            Subtítulo
            <input
              value={subtitle}
              onChange={(event) => setSubtitle(event.target.value)}
              className="rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-2 outline-none ring-yellow-400 focus:ring-2"
            />
          </label>
        </div>

        <label className="flex flex-col gap-2 text-sm text-zinc-200">
          Slug
          <input
            value={slug}
            onChange={(event) => {
              setSlugTouched(true);
              setSlug(event.target.value);
            }}
            className="rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-2 outline-none ring-yellow-400 focus:ring-2"
          />
        </label>

        <label className="flex flex-col gap-2 text-sm text-zinc-200">
          Resumo (excerpt)
          <textarea
            value={excerpt}
            onChange={(event) => setExcerpt(event.target.value)}
            rows={3}
            className="rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-2 outline-none ring-yellow-400 focus:ring-2"
          />
        </label>

        <div className="grid gap-4 md:grid-cols-4">
          <label className="flex flex-col gap-2 text-sm text-zinc-200">
            Status
            <select
              value={status}
              onChange={(event) => setStatus(event.target.value as BlogStatus)}
              className="rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-2 outline-none ring-yellow-400 focus:ring-2"
            >
              {STATUSES.map((item) => (
                <option key={item.value} value={item.value}>
                  {item.label}
                </option>
              ))}
            </select>
          </label>

          <label className="flex flex-col gap-2 text-sm text-zinc-200">
            Dificuldade
            <select
              value={difficulty}
              onChange={(event) => setDifficulty(event.target.value as BlogDifficulty)}
              className="rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-2 outline-none ring-yellow-400 focus:ring-2"
            >
              {DIFFICULTIES.map((item) => (
                <option key={item.value} value={item.value}>
                  {item.label}
                </option>
              ))}
            </select>
          </label>

          <label className="flex flex-col gap-2 text-sm text-zinc-200">
            Categoria
            <select
              value={categoryId}
              onChange={(event) => setCategoryId(event.target.value)}
              className="rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-2 outline-none ring-yellow-400 focus:ring-2"
            >
              <option value="">Sem categoria</option>
              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
          </label>

          <label className="flex items-end gap-2 rounded-lg border border-zinc-800 bg-zinc-900/70 px-3 py-2 text-sm text-zinc-200">
            <input
              type="checkbox"
              checked={featured}
              onChange={(event) => setFeatured(event.target.checked)}
              className="h-4 w-4 accent-yellow-400"
            />
            Destaque da semana
          </label>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2 rounded-lg border border-zinc-800 bg-zinc-900/50 p-3">
            <p className="text-sm font-semibold text-zinc-100">Criar categoria rapidamente</p>
            <div className="flex gap-2">
              <input
                value={newCategory}
                onChange={(event) => setNewCategory(event.target.value)}
                placeholder="Ex.: Gestão de Rachas"
                className="flex-1 rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm outline-none ring-yellow-400 focus:ring-2"
              />
              <button
                type="button"
                onClick={() => void handleCreateCategory()}
                className="rounded-lg bg-zinc-100 px-3 py-2 text-sm font-semibold text-zinc-900 hover:bg-white"
              >
                Criar
              </button>
            </div>
          </div>

          <div className="space-y-2 rounded-lg border border-zinc-800 bg-zinc-900/50 p-3">
            <p className="text-sm font-semibold text-zinc-100">Criar tag rapidamente</p>
            <div className="flex gap-2">
              <input
                value={newTag}
                onChange={(event) => setNewTag(event.target.value)}
                placeholder="Ex.: SEO local"
                className="flex-1 rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm outline-none ring-yellow-400 focus:ring-2"
              />
              <button
                type="button"
                onClick={() => void handleCreateTag()}
                className="rounded-lg bg-zinc-100 px-3 py-2 text-sm font-semibold text-zinc-900 hover:bg-white"
              >
                Criar
              </button>
            </div>
          </div>
        </div>

        <div className="space-y-2 rounded-lg border border-zinc-800 bg-zinc-900/50 p-3">
          <p className="text-sm font-semibold text-zinc-100">Tags</p>
          <div className="flex flex-wrap gap-2">
            {tags.map((tag) => {
              const checked = selectedTagIds.includes(tag.id);
              return (
                <button
                  key={tag.id}
                  type="button"
                  onClick={() => toggleTag(tag.id)}
                  className={`rounded-full border px-3 py-1 text-xs font-semibold ${
                    checked
                      ? "border-yellow-400 bg-yellow-400/20 text-yellow-200"
                      : "border-zinc-700 bg-zinc-900 text-zinc-300"
                  }`}
                >
                  {tag.name}
                </button>
              );
            })}
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-3 rounded-lg border border-zinc-800 bg-zinc-900/50 p-3">
            <p className="text-sm font-semibold text-zinc-100">Imagem de capa</p>
            <input
              value={coverImageUrl}
              onChange={(event) => setCoverImageUrl(event.target.value)}
              placeholder="URL da capa"
              className="w-full rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm outline-none ring-yellow-400 focus:ring-2"
            />
            <input
              value={coverImageAlt}
              onChange={(event) => setCoverImageAlt(event.target.value)}
              placeholder="Alt da capa (obrigatório se houver imagem)"
              className="w-full rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm outline-none ring-yellow-400 focus:ring-2"
            />
            <label className="inline-flex cursor-pointer items-center rounded-lg border border-zinc-700 px-3 py-2 text-sm text-zinc-100 hover:border-zinc-500">
              {uploadingCover ? "Enviando..." : "Enviar capa"}
              <input
                type="file"
                accept="image/png,image/jpeg,image/webp"
                className="hidden"
                onChange={(event) =>
                  void handleImageUpload(event.target.files?.[0] || null, "cover", event)
                }
              />
            </label>
          </div>

          <div className="space-y-3 rounded-lg border border-zinc-800 bg-zinc-900/50 p-3">
            <p className="text-sm font-semibold text-zinc-100">Imagem OG (opcional)</p>
            <input
              value={ogImageUrl}
              onChange={(event) => setOgImageUrl(event.target.value)}
              placeholder="URL da imagem OG"
              className="w-full rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm outline-none ring-yellow-400 focus:ring-2"
            />
            <label className="inline-flex cursor-pointer items-center rounded-lg border border-zinc-700 px-3 py-2 text-sm text-zinc-100 hover:border-zinc-500">
              {uploadingOg ? "Enviando..." : "Enviar imagem OG"}
              <input
                type="file"
                accept="image/png,image/jpeg,image/webp"
                className="hidden"
                onChange={(event) =>
                  void handleImageUpload(event.target.files?.[0] || null, "og", event)
                }
              />
            </label>
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-sm font-semibold text-zinc-100">Conteúdo (Markdown)</label>
            <label className="inline-flex cursor-pointer items-center rounded-lg border border-zinc-700 px-3 py-1.5 text-xs text-zinc-100 hover:border-zinc-500">
              {uploadingInline ? "Inserindo..." : "Inserir imagem no conteúdo"}
              <input
                type="file"
                accept="image/png,image/jpeg,image/webp"
                className="hidden"
                onChange={(event) =>
                  void handleImageUpload(event.target.files?.[0] || null, "inline", event)
                }
              />
            </label>
          </div>
          <textarea
            ref={contentRef}
            value={content}
            onChange={(event) => setContent(event.target.value)}
            rows={18}
            placeholder="Escreva o artigo em Markdown..."
            className="w-full rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-2 text-sm text-zinc-100 outline-none ring-yellow-400 focus:ring-2"
          />
        </div>

        <div className="flex flex-wrap gap-2 border-t border-zinc-800 pt-4">
          <button
            type="button"
            onClick={() => void persist("draft")}
            disabled={saving}
            className="rounded-lg border border-zinc-600 px-4 py-2 text-sm font-semibold text-zinc-200 hover:border-zinc-400 disabled:opacity-50"
          >
            {saving ? "Salvando..." : "Salvar rascunho"}
          </button>
          <button
            type="button"
            onClick={() => void persist("publish")}
            disabled={saving}
            className="rounded-lg bg-green-500 px-4 py-2 text-sm font-semibold text-zinc-950 hover:bg-green-400 disabled:opacity-50"
          >
            {saving ? "Publicando..." : "Publicar"}
          </button>
          <button
            type="button"
            onClick={() => void handlePreview()}
            disabled={saving || (!canPreview && !title.trim())}
            className="rounded-lg bg-blue-500 px-4 py-2 text-sm font-semibold text-zinc-950 hover:bg-blue-400 disabled:opacity-50"
          >
            Preview
          </button>
        </div>
      </section>
    </div>
  );
}
