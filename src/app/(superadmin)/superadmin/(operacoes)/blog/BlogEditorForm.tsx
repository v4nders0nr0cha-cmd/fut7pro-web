"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { type ChangeEvent, useEffect, useMemo, useRef, useState } from "react";
import {
  createBlogCategory,
  createBlogPost,
  createBlogTag,
  getBlogErrorMessage,
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
const ROBOTS_OPTIONS = [
  { value: "index,follow", label: "index,follow (indexar e seguir links)" },
  { value: "noindex,follow", label: "noindex,follow (não indexar e seguir links)" },
  { value: "index,nofollow", label: "index,nofollow (indexar e não seguir links)" },
  { value: "noindex,nofollow", label: "noindex,nofollow (não indexar e não seguir links)" },
];

const BLOG_PUBLIC_BASE_URL = "https://www.fut7pro.com.br/blog";

type ImageEditMode = "cover" | "og";

type PendingImageEdit = {
  mode: ImageEditMode;
  file: File;
  previewUrl: string;
  zoom: number;
  focalX: number;
  focalY: number;
  naturalWidth: number;
  naturalHeight: number;
};

const IMAGE_EDIT_TARGETS: Record<
  ImageEditMode,
  { width: number; height: number; ratioLabel: string; recommendation: string }
> = {
  cover: {
    width: 1600,
    height: 900,
    ratioLabel: "16:9",
    recommendation: "Recomendado: 1600x900 px (mínimo 1200x675), JPG/PNG/WEBP até 3MB.",
  },
  og: {
    width: 1200,
    height: 630,
    ratioLabel: "1.91:1",
    recommendation: "Recomendado: 1200x630 px (Open Graph), JPG/PNG/WEBP até 3MB.",
  },
};

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

async function loadImageFromUrl(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error("Não foi possível carregar a imagem para ajuste."));
    image.src = src;
  });
}

async function createAdjustedImageFile(edit: PendingImageEdit) {
  const target = IMAGE_EDIT_TARGETS[edit.mode];
  const image = await loadImageFromUrl(edit.previewUrl);

  const canvas = document.createElement("canvas");
  canvas.width = target.width;
  canvas.height = target.height;

  const context = canvas.getContext("2d");
  if (!context) {
    throw new Error("Não foi possível processar o ajuste da imagem.");
  }

  const baseScale = Math.max(target.width / image.width, target.height / image.height);
  const scale = baseScale * clamp(edit.zoom, 1, 2.5);
  const drawWidth = image.width * scale;
  const drawHeight = image.height * scale;
  const objectX = clamp(50 + edit.focalX, 0, 100);
  const objectY = clamp(50 + edit.focalY, 0, 100);
  const drawX = (target.width - drawWidth) * (objectX / 100);
  const drawY = (target.height - drawHeight) * (objectY / 100);

  context.drawImage(image, drawX, drawY, drawWidth, drawHeight);

  const blob = await new Promise<Blob>((resolve, reject) => {
    canvas.toBlob(
      (result) => {
        if (result) {
          resolve(result);
          return;
        }
        reject(new Error("Falha ao exportar imagem ajustada."));
      },
      "image/webp",
      0.92
    );
  });

  const baseName = edit.file.name.replace(/\.[^/.]+$/, "");
  const adjustedFile = new File([blob], `${baseName}-ajustada.webp`, {
    type: "image/webp",
  });

  return { file: adjustedFile, width: target.width, height: target.height };
}

function stripMarkdown(markdown: string) {
  return markdown
    .replace(/```[\s\S]*?```/g, " ")
    .replace(/`[^`]*`/g, " ")
    .replace(/!\[[^\]]*]\([^)]+\)/g, " ")
    .replace(/\[[^\]]*]\([^)]+\)/g, " ")
    .replace(/[#>*_~\-]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function countWords(markdown: string) {
  const cleaned = stripMarkdown(markdown);
  return cleaned ? cleaned.split(" ").length : 0;
}

function countMarkdownLinks(markdown: string) {
  const links = markdown.match(/\[[^\]]+]\(([^)]+)\)/g) || [];
  const external = links.filter((item) => /\]\((https?:)?\/\//i.test(item)).length;
  const internal = links.length - external;
  return { total: links.length, external, internal };
}

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
  const [categoriesError, setCategoriesError] = useState<string | null>(null);
  const [tagsError, setTagsError] = useState<string | null>(null);
  const [loadingCategories, setLoadingCategories] = useState(false);
  const [loadingTags, setLoadingTags] = useState(false);
  const [newCategory, setNewCategory] = useState("");
  const [newTag, setNewTag] = useState("");

  const [title, setTitle] = useState("");
  const [metaTitle, setMetaTitle] = useState("");
  const [subtitle, setSubtitle] = useState("");
  const [excerpt, setExcerpt] = useState("");
  const [canonicalUrl, setCanonicalUrl] = useState("");
  const [focusKeyword, setFocusKeyword] = useState("");
  const [robots, setRobots] = useState("index,follow");
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
  const [pendingImageEdit, setPendingImageEdit] = useState<PendingImageEdit | null>(null);
  const [applyingImageEdit, setApplyingImageEdit] = useState(false);

  useEffect(() => {
    if (slugTouched) return;
    setSlug(slugifyBlogTitle(title));
  }, [slugTouched, title]);

  useEffect(() => {
    return () => {
      if (pendingImageEdit?.previewUrl) {
        URL.revokeObjectURL(pendingImageEdit.previewUrl);
      }
    };
  }, [pendingImageEdit?.previewUrl]);

  function toFriendlyTaxonomyError(err: unknown) {
    const message = getBlogErrorMessage(err, "Não foi possível carregar agora. Tente recarregar.");
    return message.length > 180 ? `${message.slice(0, 180)}...` : message;
  }

  async function loadCategories(options?: { silent?: boolean }) {
    setLoadingCategories(true);
    setCategoriesError(null);

    try {
      const loaded = await listBlogCategories();
      setCategories(loaded);
      return true;
    } catch (err) {
      setCategories([]);
      const friendly = toFriendlyTaxonomyError(err);
      setCategoriesError(friendly);
      if (!options?.silent) {
        setError(friendly);
      }
      return false;
    } finally {
      setLoadingCategories(false);
    }
  }

  async function loadTags(options?: { silent?: boolean }) {
    setLoadingTags(true);
    setTagsError(null);

    try {
      const loaded = await listBlogTags();
      setTags(loaded);
      return true;
    } catch (err) {
      setTags([]);
      const friendly = toFriendlyTaxonomyError(err);
      setTagsError(friendly);
      if (!options?.silent) {
        setError(friendly);
      }
      return false;
    } finally {
      setLoadingTags(false);
    }
  }

  useEffect(() => {
    let cancelled = false;

    async function bootstrap() {
      setLoading(true);
      setError(null);
      setCategoriesError(null);
      setTagsError(null);

      try {
        const [categoriesResult, tagsResult] = await Promise.allSettled([
          listBlogCategories(),
          listBlogTags(),
        ]);

        if (cancelled) return;

        if (categoriesResult.status === "fulfilled") {
          setCategories(categoriesResult.value);
        } else {
          setCategories([]);
          setCategoriesError(toFriendlyTaxonomyError(categoriesResult.reason));
        }

        if (tagsResult.status === "fulfilled") {
          setTags(tagsResult.value);
        } else {
          setTags([]);
          setTagsError(toFriendlyTaxonomyError(tagsResult.reason));
        }

        if (postId) {
          const post = await getBlogPost(postId);
          if (cancelled) return;
          setSavedPostId(post.id);
          setTitle(post.title || "");
          setMetaTitle(post.metaTitle || "");
          setSubtitle(post.subtitle || "");
          setExcerpt(post.excerpt || "");
          setCanonicalUrl(post.canonicalUrl || "");
          setFocusKeyword(post.focusKeyword || "");
          setRobots(post.robots || "index,follow");
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
          setError(getBlogErrorMessage(err, "Falha ao carregar editor."));
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
  const taxonomyUnavailable = useMemo(
    () => Boolean(categoriesError || tagsError),
    [categoriesError, tagsError]
  );
  const metaDescriptionLength = excerpt.trim().length;
  const titleLength = title.trim().length;
  const effectiveMetaTitle = (metaTitle.trim() || title.trim()).trim();
  const effectiveMetaTitleLength = effectiveMetaTitle.length;
  const slugLength = slug.trim().length;
  const contentWords = useMemo(() => countWords(content), [content]);
  const markdownLinks = useMemo(() => countMarkdownLinks(content), [content]);
  const urlPreview = `${BLOG_PUBLIC_BASE_URL}/${slug.trim() || "slug-do-artigo"}`;
  const canonicalIsValid =
    !canonicalUrl.trim() ||
    canonicalUrl.trim().startsWith("/") ||
    /^https?:\/\//i.test(canonicalUrl.trim());
  const seoChecks = useMemo(
    () => [
      {
        key: "title",
        label: "Título editorial entre 20 e 90 caracteres",
        ok: titleLength >= 20 && titleLength <= 90,
      },
      {
        key: "meta-title",
        label: "Meta title entre 45 e 65 caracteres",
        ok: effectiveMetaTitleLength >= 45 && effectiveMetaTitleLength <= 65,
      },
      {
        key: "slug",
        label: "Slug curto e limpo (até 70 caracteres)",
        ok: slugLength > 0 && slugLength <= 70,
      },
      {
        key: "meta",
        label: "Meta description entre 140 e 160 caracteres",
        ok: metaDescriptionLength >= 140 && metaDescriptionLength <= 160,
      },
      {
        key: "content",
        label: "Corpo do artigo com pelo menos 700 palavras",
        ok: contentWords >= 700,
      },
      {
        key: "tags",
        label: "Mínimo de 2 tags para cluster semântico",
        ok: selectedTagIds.length >= 2,
      },
      {
        key: "cover-alt",
        label: "Imagem de capa com texto alternativo (alt)",
        ok: !coverImageUrl.trim() || coverImageAlt.trim().length >= 8,
      },
      {
        key: "links",
        label: "Adicionar links internos e externos no conteúdo",
        ok: markdownLinks.internal >= 1 && markdownLinks.external >= 1,
      },
      {
        key: "canonical",
        label: "Canonical com URL válida (relativa ou absoluta)",
        ok: canonicalIsValid,
      },
      {
        key: "focus",
        label: "Definir palavra-chave foco",
        ok: focusKeyword.trim().length >= 3,
      },
    ],
    [
      titleLength,
      effectiveMetaTitleLength,
      slugLength,
      metaDescriptionLength,
      contentWords,
      selectedTagIds.length,
      coverImageUrl,
      coverImageAlt,
      markdownLinks.internal,
      markdownLinks.external,
      canonicalIsValid,
      focusKeyword,
    ]
  );
  const seoScore = Math.round(
    (seoChecks.filter((item) => item.ok).length / Math.max(seoChecks.length, 1)) * 100
  );
  const seoScoreTone =
    seoScore >= 85
      ? "text-emerald-300 border-emerald-500/40 bg-emerald-900/20"
      : seoScore >= 60
        ? "text-amber-300 border-amber-500/40 bg-amber-900/20"
        : "text-rose-300 border-rose-500/40 bg-rose-900/20";
  const pendingImageTarget = pendingImageEdit ? IMAGE_EDIT_TARGETS[pendingImageEdit.mode] : null;
  const pendingImageIsBelowRecommendation = Boolean(
    pendingImageEdit &&
      pendingImageTarget &&
      (pendingImageEdit.naturalWidth < pendingImageTarget.width ||
        pendingImageEdit.naturalHeight < pendingImageTarget.height)
  );

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
      setError(getBlogErrorMessage(err, "Falha ao criar categoria."));
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
      setError(getBlogErrorMessage(err, "Falha ao criar tag."));
    }
  }

  async function handleReloadCategories() {
    setMessage(null);
    setError(null);
    await loadCategories({ silent: true });
  }

  async function handleReloadTags() {
    setMessage(null);
    setError(null);
    await loadTags({ silent: true });
  }

  function buildPayload(nextStatus: BlogStatus): UpsertBlogPostPayload {
    return {
      title: title.trim(),
      metaTitle: metaTitle.trim() || undefined,
      subtitle: subtitle.trim() || undefined,
      excerpt: excerpt.trim(),
      canonicalUrl: canonicalUrl.trim() || undefined,
      focusKeyword: focusKeyword.trim() || undefined,
      robots: robots.trim() || undefined,
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
      setError(getBlogErrorMessage(err, "Falha ao salvar artigo."));
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

  function closePendingImageEdit() {
    setPendingImageEdit(null);
  }

  function resetPendingImageEdit() {
    setPendingImageEdit((current) => {
      if (!current) return current;
      return {
        ...current,
        zoom: 1,
        focalX: 0,
        focalY: 0,
      };
    });
  }

  async function openImageAdjuster(file: File, mode: ImageEditMode) {
    const previewUrl = URL.createObjectURL(file);

    setPendingImageEdit((current) => {
      if (current?.previewUrl) {
        URL.revokeObjectURL(current.previewUrl);
      }
      return {
        mode,
        file,
        previewUrl,
        zoom: 1,
        focalX: 0,
        focalY: 0,
        naturalWidth: 0,
        naturalHeight: 0,
      };
    });

    try {
      const image = await loadImageFromUrl(previewUrl);
      setPendingImageEdit((current) => {
        if (!current || current.previewUrl !== previewUrl) return current;
        return {
          ...current,
          naturalWidth: image.naturalWidth || image.width,
          naturalHeight: image.naturalHeight || image.height,
        };
      });
    } catch (err) {
      closePendingImageEdit();
      setError(getBlogErrorMessage(err, "Falha ao abrir imagem para ajuste."));
    }
  }

  async function uploadImageAsset(
    file: File | null,
    mode: "cover" | "og" | "inline",
    options?: { width?: number; height?: number; event?: ChangeEvent<HTMLInputElement> }
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
        width: options?.width,
        height: options?.height,
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
      setError(getBlogErrorMessage(err, "Falha ao enviar imagem."));
    } finally {
      if (mode === "cover") setUploadingCover(false);
      if (mode === "og") setUploadingOg(false);
      if (mode === "inline") setUploadingInline(false);
      if (options?.event) {
        options.event.target.value = "";
      }
    }
  }

  async function applyPendingImageEdit() {
    if (!pendingImageEdit) return;
    setApplyingImageEdit(true);
    setError(null);
    setMessage(null);

    try {
      const adjusted = await createAdjustedImageFile(pendingImageEdit);
      await uploadImageAsset(adjusted.file, pendingImageEdit.mode, {
        width: adjusted.width,
        height: adjusted.height,
      });
      closePendingImageEdit();
    } catch (err) {
      setError(getBlogErrorMessage(err, "Falha ao aplicar ajuste da imagem."));
    } finally {
      setApplyingImageEdit(false);
    }
  }

  async function handleImageUpload(
    file: File | null,
    mode: "cover" | "og" | "inline",
    event?: ChangeEvent<HTMLInputElement>
  ) {
    if (!file) return;

    if (mode === "cover" || mode === "og") {
      if (event) {
        event.target.value = "";
      }
      await openImageAdjuster(file, mode);
      return;
    }

    await uploadImageAsset(file, mode, { event });
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

      {taxonomyUnavailable ? (
        <div className="rounded-lg border border-amber-500/40 bg-amber-900/20 px-4 py-3 text-sm text-amber-200">
          Não foi possível carregar categorias e tags agora. Você pode continuar criando o artigo e
          tentar recarregar estes dados.
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
          Meta description (meta descrição)
          <textarea
            value={excerpt}
            onChange={(event) => setExcerpt(event.target.value)}
            rows={3}
            className="rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-2 outline-none ring-yellow-400 focus:ring-2"
          />
          <span className="text-xs text-zinc-400">
            Recomendado: 140 a 160 caracteres. Atual: {metaDescriptionLength}.
          </span>
        </label>

        <div className="grid gap-4 md:grid-cols-2">
          <label className="flex flex-col gap-2 text-sm text-zinc-200">
            Meta title (título SEO)
            <input
              value={metaTitle}
              onChange={(event) => setMetaTitle(event.target.value)}
              placeholder="Ex.: Como organizar racha de Futebol 7 com mais equilíbrio"
              className="rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-2 outline-none ring-yellow-400 focus:ring-2"
            />
            <span className="text-xs text-zinc-400">
              Se vazio, o sistema usa o título principal do artigo.
            </span>
          </label>

          <label className="flex flex-col gap-2 text-sm text-zinc-200">
            Palavra-chave foco
            <input
              value={focusKeyword}
              onChange={(event) => setFocusKeyword(event.target.value)}
              placeholder="Ex.: sistema para racha"
              className="rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-2 outline-none ring-yellow-400 focus:ring-2"
            />
            <span className="text-xs text-zinc-400">
              Use a expressão principal que você quer ranquear no Google.
            </span>
          </label>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <label className="flex flex-col gap-2 text-sm text-zinc-200">
            Canonical URL (opcional)
            <input
              value={canonicalUrl}
              onChange={(event) => setCanonicalUrl(event.target.value)}
              placeholder="Ex.: /blog/como-organizar-racha ou https://www.fut7pro.com.br/blog/..."
              className="rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-2 outline-none ring-yellow-400 focus:ring-2"
            />
            <span className="text-xs text-zinc-400">
              Use apenas quando quiser forçar URL canônica diferente do slug atual.
            </span>
          </label>

          <label className="flex flex-col gap-2 text-sm text-zinc-200">
            Robots
            <select
              value={robots}
              onChange={(event) => setRobots(event.target.value)}
              className="rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-2 outline-none ring-yellow-400 focus:ring-2"
            >
              {ROBOTS_OPTIONS.map((item) => (
                <option key={item.value} value={item.value}>
                  {item.label}
                </option>
              ))}
            </select>
          </label>
        </div>

        <div className="rounded-lg border border-zinc-800 bg-zinc-900/50 p-3 text-xs text-zinc-300">
          <p className="font-semibold text-zinc-100">URL pública do artigo</p>
          <p className="mt-1 break-all text-zinc-300">{urlPreview}</p>
          <p className="mt-2 text-zinc-400">
            O slug deve ser objetivo, sem acentos e focado na principal intenção de busca.
          </p>
        </div>

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
              disabled={loadingCategories}
              className="rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-2 outline-none ring-yellow-400 focus:ring-2"
            >
              <option value="">Sem categoria</option>
              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
            {categoriesError ? (
              <span className="text-xs text-amber-300">{categoriesError}</span>
            ) : null}
            <button
              type="button"
              onClick={() => void handleReloadCategories()}
              disabled={loadingCategories}
              className="mt-1 inline-flex items-center justify-center rounded-md border border-zinc-600 px-2 py-1 text-xs font-semibold text-zinc-200 hover:border-zinc-400 disabled:opacity-50"
            >
              {loadingCategories ? "Recarregando..." : "Recarregar categorias"}
            </button>
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
          <div className="flex flex-wrap items-center justify-between gap-2">
            <p className="text-sm font-semibold text-zinc-100">Tags</p>
            <button
              type="button"
              onClick={() => void handleReloadTags()}
              disabled={loadingTags}
              className="inline-flex items-center justify-center rounded-md border border-zinc-600 px-2 py-1 text-xs font-semibold text-zinc-200 hover:border-zinc-400 disabled:opacity-50"
            >
              {loadingTags ? "Recarregando..." : "Recarregar tags"}
            </button>
          </div>
          {tagsError ? <p className="text-xs text-amber-300">{tagsError}</p> : null}
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
            <p className="text-xs text-zinc-400">{IMAGE_EDIT_TARGETS.cover.recommendation}</p>
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
            {coverImageUrl.trim() ? (
              <div className="space-y-1">
                <p className="text-xs text-zinc-400">
                  Prévia da capa ({IMAGE_EDIT_TARGETS.cover.ratioLabel})
                </p>
                <div className="overflow-hidden rounded-lg border border-zinc-700 bg-zinc-950">
                  <div className="aspect-video w-full">
                    <img
                      src={coverImageUrl}
                      alt={coverImageAlt || "Prévia da imagem de capa"}
                      className="h-full w-full object-cover"
                      loading="lazy"
                    />
                  </div>
                </div>
              </div>
            ) : null}
            <label className="inline-flex cursor-pointer items-center rounded-lg border border-zinc-700 px-3 py-2 text-sm text-zinc-100 hover:border-zinc-500">
              {uploadingCover ? "Enviando..." : "Selecionar e ajustar capa"}
              <input
                type="file"
                accept="image/png,image/jpeg,image/webp"
                className="hidden"
                onChange={(event) =>
                  void handleImageUpload(event.target.files?.[0] || null, "cover", event)
                }
              />
            </label>
            <p className="text-xs text-zinc-500">
              Após selecionar a imagem, ajuste zoom e enquadramento antes de enviar.
            </p>
          </div>

          <div className="space-y-3 rounded-lg border border-zinc-800 bg-zinc-900/50 p-3">
            <p className="text-sm font-semibold text-zinc-100">Imagem OG (opcional)</p>
            <p className="text-xs text-zinc-400">{IMAGE_EDIT_TARGETS.og.recommendation}</p>
            <input
              value={ogImageUrl}
              onChange={(event) => setOgImageUrl(event.target.value)}
              placeholder="URL da imagem OG"
              className="w-full rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm outline-none ring-yellow-400 focus:ring-2"
            />
            {ogImageUrl.trim() ? (
              <div className="space-y-1">
                <p className="text-xs text-zinc-400">
                  Prévia OG ({IMAGE_EDIT_TARGETS.og.ratioLabel})
                </p>
                <div className="overflow-hidden rounded-lg border border-zinc-700 bg-zinc-950">
                  <div className="w-full" style={{ aspectRatio: "1200 / 630" }}>
                    <img
                      src={ogImageUrl}
                      alt="Prévia da imagem OG"
                      className="h-full w-full object-cover"
                      loading="lazy"
                    />
                  </div>
                </div>
              </div>
            ) : null}
            <label className="inline-flex cursor-pointer items-center rounded-lg border border-zinc-700 px-3 py-2 text-sm text-zinc-100 hover:border-zinc-500">
              {uploadingOg ? "Enviando..." : "Selecionar e ajustar imagem OG"}
              <input
                type="file"
                accept="image/png,image/jpeg,image/webp"
                className="hidden"
                onChange={(event) =>
                  void handleImageUpload(event.target.files?.[0] || null, "og", event)
                }
              />
            </label>
            <p className="text-xs text-zinc-500">
              Recomendado para compartilhamento em WhatsApp, Instagram, Facebook e X.
            </p>
          </div>
        </div>

        {pendingImageEdit && pendingImageTarget ? (
          <div className="space-y-4 rounded-lg border border-yellow-500/40 bg-yellow-900/10 p-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <p className="text-sm font-semibold text-yellow-200">
                Ajustar {pendingImageEdit.mode === "cover" ? "imagem de capa" : "imagem OG"}
              </p>
              <p className="text-xs text-zinc-300">
                Original: {pendingImageEdit.naturalWidth || "-"}x
                {pendingImageEdit.naturalHeight || "-"} px | Saída: {pendingImageTarget.width}x
                {pendingImageTarget.height} px
              </p>
            </div>

            {pendingImageIsBelowRecommendation ? (
              <p className="rounded-md border border-amber-500/40 bg-amber-900/30 px-3 py-2 text-xs text-amber-200">
                A imagem selecionada está abaixo do recomendado. O resultado pode perder nitidez.
              </p>
            ) : null}

            <div className="overflow-hidden rounded-lg border border-zinc-700 bg-zinc-950">
              <div
                className="w-full"
                style={{
                  aspectRatio: `${pendingImageTarget.width} / ${pendingImageTarget.height}`,
                }}
              >
                <img
                  src={pendingImageEdit.previewUrl}
                  alt="Prévia de ajuste"
                  className="h-full w-full object-cover"
                  style={{
                    objectPosition: `${clamp(50 + pendingImageEdit.focalX, 0, 100)}% ${clamp(
                      50 + pendingImageEdit.focalY,
                      0,
                      100
                    )}%`,
                    transform: `scale(${pendingImageEdit.zoom})`,
                    transformOrigin: "center center",
                  }}
                />
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-3">
              <label className="flex flex-col gap-2 text-xs text-zinc-300">
                Zoom ({pendingImageEdit.zoom.toFixed(2)}x)
                <input
                  type="range"
                  min={1}
                  max={2.5}
                  step={0.05}
                  value={pendingImageEdit.zoom}
                  onChange={(event) =>
                    setPendingImageEdit((current) =>
                      current ? { ...current, zoom: Number(event.target.value) } : current
                    )
                  }
                  className="accent-yellow-400"
                />
              </label>

              <label className="flex flex-col gap-2 text-xs text-zinc-300">
                Foco horizontal ({pendingImageEdit.focalX > 0 ? "+" : ""}
                {pendingImageEdit.focalX})
                <input
                  type="range"
                  min={-50}
                  max={50}
                  step={1}
                  value={pendingImageEdit.focalX}
                  onChange={(event) =>
                    setPendingImageEdit((current) =>
                      current ? { ...current, focalX: Number(event.target.value) } : current
                    )
                  }
                  className="accent-yellow-400"
                />
              </label>

              <label className="flex flex-col gap-2 text-xs text-zinc-300">
                Foco vertical ({pendingImageEdit.focalY > 0 ? "+" : ""}
                {pendingImageEdit.focalY})
                <input
                  type="range"
                  min={-50}
                  max={50}
                  step={1}
                  value={pendingImageEdit.focalY}
                  onChange={(event) =>
                    setPendingImageEdit((current) =>
                      current ? { ...current, focalY: Number(event.target.value) } : current
                    )
                  }
                  className="accent-yellow-400"
                />
              </label>
            </div>

            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => void applyPendingImageEdit()}
                disabled={applyingImageEdit}
                className="rounded-lg bg-yellow-400 px-4 py-2 text-sm font-semibold text-zinc-950 hover:bg-yellow-300 disabled:opacity-50"
              >
                {applyingImageEdit ? "Aplicando..." : "Aplicar ajuste e enviar"}
              </button>
              <button
                type="button"
                onClick={resetPendingImageEdit}
                disabled={
                  applyingImageEdit ||
                  (pendingImageEdit.zoom === 1 &&
                    pendingImageEdit.focalX === 0 &&
                    pendingImageEdit.focalY === 0)
                }
                className="rounded-lg border border-yellow-500/50 px-4 py-2 text-sm font-semibold text-yellow-200 hover:border-yellow-300 disabled:opacity-50"
              >
                Resetar enquadramento
              </button>
              <button
                type="button"
                onClick={closePendingImageEdit}
                disabled={applyingImageEdit}
                className="rounded-lg border border-zinc-600 px-4 py-2 text-sm font-semibold text-zinc-200 hover:border-zinc-400 disabled:opacity-50"
              >
                Cancelar ajuste
              </button>
            </div>
          </div>
        ) : null}

        <div className="space-y-4 rounded-lg border border-zinc-800 bg-zinc-900/50 p-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <p className="text-sm font-semibold text-zinc-100">SEO e ranqueamento</p>
            <div className={`rounded-md border px-3 py-1 text-xs font-semibold ${seoScoreTone}`}>
              Score SEO: {seoScore}/100
            </div>
          </div>

          <ul className="grid gap-2 md:grid-cols-2">
            {seoChecks.map((item) => (
              <li
                key={item.key}
                className={`rounded-md border px-3 py-2 text-xs ${
                  item.ok
                    ? "border-emerald-500/40 bg-emerald-900/20 text-emerald-200"
                    : "border-zinc-700 bg-zinc-950 text-zinc-300"
                }`}
              >
                {item.ok ? "OK" : "Pendente"} - {item.label}
              </li>
            ))}
          </ul>

          <div className="rounded-lg border border-zinc-800 bg-zinc-950 p-3">
            <p className="text-xs font-semibold uppercase tracking-wide text-zinc-400">
              Prévia do Google
            </p>
            <p className="mt-2 line-clamp-2 text-base font-semibold text-blue-300">
              {effectiveMetaTitle || "Título do artigo"}
            </p>
            <p className="mt-1 line-clamp-1 break-all text-xs text-emerald-300">{urlPreview}</p>
            <p className="mt-1 line-clamp-2 text-sm text-zinc-300">
              {excerpt.trim() ||
                "Escreva uma meta description clara com benefício, contexto e palavra-chave principal."}
            </p>
            <p className="mt-2 text-xs text-zinc-400">
              Palavra-chave foco: {focusKeyword.trim() || "não definida"}
            </p>
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
