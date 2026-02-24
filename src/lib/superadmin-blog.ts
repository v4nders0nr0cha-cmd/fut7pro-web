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
  subtitle?: string | null;
  excerpt: string;
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
  subtitle?: string;
  excerpt: string;
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

function toErrorMessage(body: unknown, fallback: string) {
  if (typeof body === "string" && body.trim()) {
    return body;
  }
  if (body && typeof body === "object" && "message" in body) {
    const message = (body as { message?: unknown }).message;
    if (Array.isArray(message)) {
      return message.map((item) => String(item)).join(", ");
    }
    if (typeof message === "string" && message.trim()) {
      return message;
    }
  }
  return fallback;
}

async function requestJson<T>(url: string, init?: RequestInit): Promise<T> {
  const response = await fetch(url, {
    ...init,
    cache: "no-store",
  });

  const contentType = response.headers.get("content-type") || "";
  const body = contentType.includes("application/json")
    ? await response.json().catch(() => ({}))
    : await response.text().catch(() => "");

  if (!response.ok) {
    throw new Error(toErrorMessage(body, "Falha ao processar a requisição de blog."));
  }

  return body as T;
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
  return requestJson<BlogListResponse>(`/api/superadmin/blog/posts${suffix}`);
}

export async function getBlogPost(id: string) {
  return requestJson<BlogPostSummary>(`/api/superadmin/blog/posts/${encodeURIComponent(id)}`);
}

export async function createBlogPost(payload: UpsertBlogPostPayload) {
  return requestJson<BlogPostSummary>("/api/superadmin/blog/posts", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });
}

export async function updateBlogPost(id: string, payload: Partial<UpsertBlogPostPayload>) {
  return requestJson<BlogPostSummary>(`/api/superadmin/blog/posts/${encodeURIComponent(id)}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });
}

export async function publishBlogPost(id: string) {
  return requestJson<BlogPostSummary>(
    `/api/superadmin/blog/posts/${encodeURIComponent(id)}/publish`,
    {
      method: "POST",
    }
  );
}

export async function unpublishBlogPost(id: string) {
  return requestJson<BlogPostSummary>(
    `/api/superadmin/blog/posts/${encodeURIComponent(id)}/unpublish`,
    {
      method: "POST",
    }
  );
}

export async function archiveBlogPost(id: string) {
  return requestJson<BlogPostSummary>(`/api/superadmin/blog/posts/${encodeURIComponent(id)}`, {
    method: "DELETE",
  });
}

export async function listBlogCategories() {
  return requestJson<BlogCategory[]>("/api/superadmin/blog/categories");
}

export async function createBlogCategory(payload: {
  name: string;
  slug?: string;
  description?: string;
}) {
  return requestJson<BlogCategory>("/api/superadmin/blog/categories", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });
}

export async function listBlogTags() {
  return requestJson<BlogTag[]>("/api/superadmin/blog/tags");
}

export async function createBlogTag(payload: { name: string; slug?: string }) {
  return requestJson<BlogTag>("/api/superadmin/blog/tags", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });
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
