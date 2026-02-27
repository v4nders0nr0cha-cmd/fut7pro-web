import { normalizeBlogPostPayload } from "@/lib/superadmin-blog-payload";

export type BlogStatus = "DRAFT" | "SCHEDULED" | "PUBLISHED" | "ARCHIVED";
export type BlogDifficulty = "INICIANTE" | "INTERMEDIARIO" | "AVANCADO";

export type BlogCategory = {
  id: string;
  slug: string;
  name: string;
  description?: string | null;
  postsCount?: number;
};

export type BlogTag = {
  id: string;
  slug: string;
  name: string;
  postsCount?: number;
};

export type BlogPostSummary = {
  id: string;
  slug: string;
  title: string;
  metaTitle?: string | null;
  subtitle?: string | null;
  excerpt: string;
  canonicalUrl?: string | null;
  focusKeyword?: string | null;
  robots?: string | null;
  status: BlogStatus;
  featured: boolean;
  featuredAt?: string | null;
  categoryId?: string | null;
  category?: BlogCategory | null;
  tags: BlogTag[];
  readingTimeMinutes: number;
  difficulty: BlogDifficulty;
  publishedAt?: string | null;
  viewsTotal: number;
  coverImageUrl?: string | null;
  coverImageAlt?: string | null;
  ogImageUrl?: string | null;
  content?: string;
  createdAt?: string;
  updatedAt?: string;
};

export type BlogListResponse = {
  results: BlogPostSummary[];
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
};

export type UpsertBlogPostPayload = {
  title: string;
  metaTitle?: string;
  subtitle?: string;
  excerpt: string;
  canonicalUrl?: string;
  focusKeyword?: string;
  robots?: string;
  content: string;
  slug?: string;
  coverImageUrl?: string;
  coverImageAlt?: string;
  ogImageUrl?: string;
  status?: BlogStatus;
  featured?: boolean;
  featuredAt?: string;
  categoryId?: string;
  tagIds?: string[];
  difficulty?: BlogDifficulty;
  publishedAt?: string;
};

export type BlogAsset = {
  id: string;
  url: string;
  alt?: string | null;
  type: "IMAGE";
  width?: number | null;
  height?: number | null;
  postId?: string | null;
  createdAt: string;
};

const BLOG_GENERIC_ERROR = "Falha ao processar a requisição de blog.";
const BLOG_INVALID_UPSTREAM_ERROR =
  "Resposta inválida do servidor. Tente novamente em alguns instantes.";
const BLOG_SAFE_STATUS_VALUES = new Set<BlogStatus>([
  "DRAFT",
  "SCHEDULED",
  "PUBLISHED",
  "ARCHIVED",
]);
const BLOG_SAFE_DIFFICULTY_VALUES = new Set<BlogDifficulty>([
  "INICIANTE",
  "INTERMEDIARIO",
  "AVANCADO",
]);

function asObject(input: unknown): Record<string, unknown> {
  if (input && typeof input === "object" && !Array.isArray(input)) {
    return input as Record<string, unknown>;
  }
  return {};
}

function hasOwn(source: Record<string, unknown>, key: string) {
  return Object.prototype.hasOwnProperty.call(source, key);
}

function toStringOrFallback(value: unknown, fallback = "") {
  if (typeof value === "string") {
    const trimmed = value.trim();
    if (trimmed) return trimmed;
  }
  if (typeof value === "number" && Number.isFinite(value)) {
    return String(value);
  }
  return fallback;
}

function normalizeCategory(input: unknown): BlogCategory {
  const source = asObject(input);
  return {
    id: toStringOrFallback(source.id),
    slug: toStringOrFallback(source.slug),
    name: toStringOrFallback(source.name, "Categoria"),
    description: typeof source.description === "string" ? source.description : null,
    postsCount: typeof source.postsCount === "number" ? source.postsCount : undefined,
  };
}

function normalizeTag(input: unknown): BlogTag {
  const source = asObject(input);
  return {
    id: toStringOrFallback(source.id),
    slug: toStringOrFallback(source.slug),
    name: toStringOrFallback(source.name, "Tag"),
    postsCount: typeof source.postsCount === "number" ? source.postsCount : undefined,
  };
}

function normalizeStatus(input: unknown): BlogStatus {
  if (typeof input === "string") {
    const candidate = input.trim().toUpperCase() as BlogStatus;
    if (BLOG_SAFE_STATUS_VALUES.has(candidate)) {
      return candidate;
    }
  }
  return "DRAFT";
}

function normalizeDifficulty(input: unknown): BlogDifficulty {
  if (typeof input === "string") {
    const candidate = input.trim().toUpperCase() as BlogDifficulty;
    if (BLOG_SAFE_DIFFICULTY_VALUES.has(candidate)) {
      return candidate;
    }
  }
  return "INICIANTE";
}

function normalizePostSummary(input: unknown): BlogPostSummary {
  const source = asObject(input);
  const tags = Array.isArray(source.tags) ? source.tags.map((item) => normalizeTag(item)) : [];
  const category = source.category ? normalizeCategory(source.category) : null;
  const hasMetaTitle = hasOwn(source, "metaTitle");
  const hasCanonicalUrl = hasOwn(source, "canonicalUrl");
  const hasFocusKeyword = hasOwn(source, "focusKeyword");
  const hasRobots = hasOwn(source, "robots");

  return {
    id: toStringOrFallback(source.id),
    slug: toStringOrFallback(source.slug),
    title: toStringOrFallback(source.title, "Sem título"),
    ...(hasMetaTitle
      ? { metaTitle: typeof source.metaTitle === "string" ? source.metaTitle : null }
      : {}),
    subtitle: typeof source.subtitle === "string" ? source.subtitle : null,
    excerpt: toStringOrFallback(source.excerpt),
    ...(hasCanonicalUrl
      ? { canonicalUrl: typeof source.canonicalUrl === "string" ? source.canonicalUrl : null }
      : {}),
    ...(hasFocusKeyword
      ? { focusKeyword: typeof source.focusKeyword === "string" ? source.focusKeyword : null }
      : {}),
    ...(hasRobots ? { robots: typeof source.robots === "string" ? source.robots : null } : {}),
    status: normalizeStatus(source.status),
    featured: Boolean(source.featured),
    featuredAt: typeof source.featuredAt === "string" ? source.featuredAt : null,
    categoryId:
      source.categoryId === null || source.categoryId === undefined
        ? null
        : toStringOrFallback(source.categoryId),
    category,
    tags,
    readingTimeMinutes:
      typeof source.readingTimeMinutes === "number" && Number.isFinite(source.readingTimeMinutes)
        ? source.readingTimeMinutes
        : 1,
    difficulty: normalizeDifficulty(source.difficulty),
    publishedAt: typeof source.publishedAt === "string" ? source.publishedAt : null,
    viewsTotal:
      typeof source.viewsTotal === "number" && Number.isFinite(source.viewsTotal)
        ? source.viewsTotal
        : 0,
    coverImageUrl: typeof source.coverImageUrl === "string" ? source.coverImageUrl : null,
    coverImageAlt: typeof source.coverImageAlt === "string" ? source.coverImageAlt : null,
    ogImageUrl: typeof source.ogImageUrl === "string" ? source.ogImageUrl : null,
    content: typeof source.content === "string" ? source.content : undefined,
    createdAt: typeof source.createdAt === "string" ? source.createdAt : undefined,
    updatedAt: typeof source.updatedAt === "string" ? source.updatedAt : undefined,
  };
}

function normalizeListResponse(input: unknown): BlogListResponse {
  const source = asObject(input);
  const results = Array.isArray(source.results)
    ? source.results.map((item) => normalizePostSummary(item))
    : [];
  const page = typeof source.page === "number" && Number.isFinite(source.page) ? source.page : 1;
  const pageSize =
    typeof source.pageSize === "number" && Number.isFinite(source.pageSize)
      ? source.pageSize
      : results.length;
  const total =
    typeof source.total === "number" && Number.isFinite(source.total)
      ? source.total
      : results.length;
  const totalPages =
    typeof source.totalPages === "number" && Number.isFinite(source.totalPages)
      ? source.totalPages
      : total > 0 && pageSize > 0
        ? Math.ceil(total / pageSize)
        : 0;

  return {
    results,
    page,
    pageSize,
    total,
    totalPages,
  };
}

function isHtmlLikeText(text: string) {
  const normalized = text.slice(0, 500).toLowerCase();
  return normalized.includes("<!doctype html") || normalized.includes("<html");
}

function isCloudflareChallengeText(text: string) {
  const normalized = text.slice(0, 2000).toLowerCase();
  return (
    normalized.includes("cloudflare") ||
    normalized.includes("just a moment") ||
    normalized.includes("cf_chl_") ||
    normalized.includes("challenge-platform")
  );
}

function cleanTextMessage(text: string) {
  return text.replace(/\s+/g, " ").trim();
}

function mapStringErrorToMessage(text: string, status?: number) {
  if (!text.trim()) {
    return BLOG_GENERIC_ERROR;
  }

  if (isHtmlLikeText(text)) {
    if (isCloudflareChallengeText(text)) {
      return `Acesso temporariamente protegido pelo Cloudflare (${status || 403}). Tente novamente em instantes.`;
    }
    return BLOG_INVALID_UPSTREAM_ERROR;
  }

  const compact = cleanTextMessage(text);
  if (!compact) {
    return BLOG_GENERIC_ERROR;
  }
  const lowered = compact.toLowerCase();

  if (lowered.includes("cloudflare challenge/blocked") || lowered.includes("cloudflare")) {
    return `Acesso temporariamente protegido pelo Cloudflare (${status || 403}). Tente novamente em instantes.`;
  }

  if (lowered.includes("upstream retornou resposta nao json")) {
    return BLOG_INVALID_UPSTREAM_ERROR;
  }

  return compact.slice(0, 220);
}

function toErrorMessage(body: unknown, fallback: string, status?: number) {
  if (typeof body === "string" && body.trim()) {
    return mapStringErrorToMessage(body, status);
  }

  if (body && typeof body === "object") {
    if ("issues" in body) {
      const issues = (body as { issues?: unknown }).issues;
      if (Array.isArray(issues)) {
        const mappedIssues = issues
          .map((entry) => {
            if (!entry || typeof entry !== "object") return "";
            const issueField = (entry as { field?: unknown }).field;
            const issueMessage = (entry as { message?: unknown }).message;
            if (typeof issueMessage !== "string" || !issueMessage.trim()) return "";
            if (typeof issueField === "string" && issueField.trim()) {
              return `${issueField}: ${issueMessage.trim()}`;
            }
            return issueMessage.trim();
          })
          .filter(Boolean);
        if (mappedIssues.length > 0) {
          return mappedIssues.join(", ");
        }
      }
    }

    if ("error" in body) {
      const errorMessage = (body as { error?: unknown }).error;
      if (typeof errorMessage === "string" && errorMessage.trim()) {
        return mapStringErrorToMessage(errorMessage, status);
      }
    }

    if ("message" in body) {
      const message = (body as { message?: unknown }).message;
      if (Array.isArray(message)) {
        const mapped = message
          .map((item) => mapStringErrorToMessage(String(item || ""), status))
          .filter(Boolean);
        return mapped.length ? mapped.join(", ") : fallback;
      }
      if (typeof message === "string" && message.trim()) {
        return mapStringErrorToMessage(message, status);
      }
    }

    if ("code" in body) {
      const code = String((body as { code?: unknown }).code || "")
        .trim()
        .toUpperCase();
      if (code === "CLOUDFLARE_CHALLENGE") {
        return `Acesso temporariamente protegido pelo Cloudflare (${status || 403}). Tente novamente em instantes.`;
      }
      if (code === "UPSTREAM_NON_JSON") {
        return BLOG_INVALID_UPSTREAM_ERROR;
      }
    }
  }

  return fallback;
}

async function readResponseBody(response: Response) {
  const contentType = response.headers.get("content-type") || "";

  if (contentType.includes("application/json")) {
    return await response.json().catch(() => ({}));
  }

  const textBody = await response.text().catch(() => "");
  if (isHtmlLikeText(textBody)) {
    return {
      error: isCloudflareChallengeText(textBody)
        ? "Cloudflare challenge/blocked"
        : "Resposta não JSON do servidor.",
      code: isCloudflareChallengeText(textBody) ? "CLOUDFLARE_CHALLENGE" : "UPSTREAM_NON_JSON",
      status: response.status,
    };
  }

  return textBody;
}

async function requestJson<T>(url: string, init?: RequestInit): Promise<T> {
  let response: Response;
  try {
    response = await fetch(url, {
      ...init,
      cache: "no-store",
    });
  } catch (error) {
    throw new Error(getBlogErrorMessage(error, "Falha de conexão ao consultar o blog."));
  }

  const body = await readResponseBody(response);

  if (!response.ok) {
    throw new Error(toErrorMessage(body, BLOG_GENERIC_ERROR, response.status));
  }

  if (typeof body === "string") {
    throw new Error(BLOG_INVALID_UPSTREAM_ERROR);
  }

  return body as T;
}

export function getBlogErrorMessage(error: unknown, fallback = BLOG_GENERIC_ERROR) {
  if (typeof error === "string") {
    return mapStringErrorToMessage(error);
  }

  if (error instanceof Error) {
    return mapStringErrorToMessage(error.message || "", undefined);
  }

  return fallback;
}

export function slugifyBlogTitle(input: string) {
  return input
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .replace(/-{2,}/g, "-")
    .slice(0, 120);
}

export async function listBlogPosts(params: {
  status?: BlogStatus | "";
  q?: string;
  category?: string;
  page?: number;
  pageSize?: number;
}) {
  const search = new URLSearchParams();
  if (params.status) search.set("status", params.status);
  if (params.q) search.set("q", params.q);
  if (params.category) search.set("category", params.category);
  if (params.page) search.set("page", String(params.page));
  if (params.pageSize) search.set("pageSize", String(params.pageSize));
  const suffix = search.toString() ? `?${search.toString()}` : "";
  const response = await requestJson<BlogListResponse>(`/api/superadmin/blog/posts${suffix}`);
  return normalizeListResponse(response);
}

export async function getBlogPost(id: string) {
  const response = await requestJson<BlogPostSummary>(
    `/api/superadmin/blog/posts/${encodeURIComponent(id)}`
  );
  return normalizePostSummary(response);
}

export async function createBlogPost(payload: UpsertBlogPostPayload) {
  const normalized = normalizeBlogPostPayload(payload, "create");
  if (normalized.issues.length > 0) {
    throw new Error(normalized.issues.map((issue) => issue.message).join(", "));
  }

  const response = await requestJson<BlogPostSummary>("/api/superadmin/blog/posts", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(normalized.payload),
  });

  return normalizePostSummary(response);
}

export async function updateBlogPost(id: string, payload: Partial<UpsertBlogPostPayload>) {
  const normalized = normalizeBlogPostPayload(payload, "update");
  if (normalized.issues.length > 0) {
    throw new Error(normalized.issues.map((issue) => issue.message).join(", "));
  }

  const response = await requestJson<BlogPostSummary>(
    `/api/superadmin/blog/posts/${encodeURIComponent(id)}`,
    {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(normalized.payload),
    }
  );

  return normalizePostSummary(response);
}

export async function publishBlogPost(id: string) {
  const response = await requestJson<BlogPostSummary>(
    `/api/superadmin/blog/posts/${encodeURIComponent(id)}/publish`,
    {
      method: "POST",
    }
  );

  return normalizePostSummary(response);
}

export async function unpublishBlogPost(id: string) {
  const response = await requestJson<BlogPostSummary>(
    `/api/superadmin/blog/posts/${encodeURIComponent(id)}/unpublish`,
    {
      method: "POST",
    }
  );

  return normalizePostSummary(response);
}

export async function archiveBlogPost(id: string) {
  const response = await requestJson<BlogPostSummary>(
    `/api/superadmin/blog/posts/${encodeURIComponent(id)}`,
    {
      method: "DELETE",
    }
  );

  return normalizePostSummary(response);
}

export async function listBlogCategories() {
  const response = await requestJson<BlogCategory[]>("/api/superadmin/blog/categories");
  return Array.isArray(response) ? response.map((item) => normalizeCategory(item)) : [];
}

export async function createBlogCategory(payload: {
  name: string;
  slug?: string;
  description?: string;
}) {
  const response = await requestJson<BlogCategory>("/api/superadmin/blog/categories", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  return normalizeCategory(response);
}

export async function listBlogTags() {
  const response = await requestJson<BlogTag[]>("/api/superadmin/blog/tags");
  return Array.isArray(response) ? response.map((item) => normalizeTag(item)) : [];
}

export async function createBlogTag(payload: { name: string; slug?: string }) {
  const response = await requestJson<BlogTag>("/api/superadmin/blog/tags", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  return normalizeTag(response);
}

export async function uploadBlogAsset(input: {
  file: File;
  alt?: string;
  postId?: string;
  width?: number;
  height?: number;
}) {
  const formData = new FormData();
  formData.append("file", input.file);
  if (input.alt) formData.append("alt", input.alt);
  if (input.postId) formData.append("postId", input.postId);
  if (typeof input.width === "number") formData.append("width", String(input.width));
  if (typeof input.height === "number") formData.append("height", String(input.height));

  return requestJson<BlogAsset>("/api/superadmin/blog/assets/upload", {
    method: "POST",
    body: formData,
  });
}
