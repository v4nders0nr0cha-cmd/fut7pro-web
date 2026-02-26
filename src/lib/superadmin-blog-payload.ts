export type BlogPayloadMode = "create" | "update";

export type BlogPayloadIssue = {
  field: string;
  message: string;
};

export type BlogPayloadDiagnostics = {
  keys: string[];
  categoryIdType: string;
  tagIdsType: string;
  tagIdsItemTypes: string[];
  statusType: string;
  statusValue: string | null;
  publishedAtType: string;
};

export type NormalizeBlogPayloadResult = {
  payload: Record<string, unknown>;
  issues: BlogPayloadIssue[];
  diagnostics: BlogPayloadDiagnostics;
};

const BLOG_STATUS_VALUES = new Set(["DRAFT", "SCHEDULED", "PUBLISHED", "ARCHIVED"]);
const BLOG_DIFFICULTY_VALUES = new Set(["INICIANTE", "INTERMEDIARIO", "AVANCADO"]);
const BLOG_ROBOTS_VALUES = new Set([
  "index,follow",
  "index,nofollow",
  "noindex,follow",
  "noindex,nofollow",
]);

const BLOG_ALLOWED_FIELDS = new Set([
  "title",
  "metaTitle",
  "subtitle",
  "excerpt",
  "canonicalUrl",
  "focusKeyword",
  "robots",
  "content",
  "slug",
  "coverImageUrl",
  "coverImageAlt",
  "ogImageUrl",
  "status",
  "featured",
  "featuredAt",
  "categoryId",
  "tagIds",
  "difficulty",
  "publishedAt",
]);

type FieldRule = {
  required?: boolean;
  min?: number;
  max?: number;
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function hasOwn(target: Record<string, unknown>, key: string) {
  return Object.prototype.hasOwnProperty.call(target, key);
}

function valueType(value: unknown) {
  if (value === null) return "null";
  if (Array.isArray(value)) return "array";
  return typeof value;
}

function toTrimmedString(value: unknown) {
  if (typeof value !== "string") return null;
  return value.trim();
}

function pushIssue(issues: BlogPayloadIssue[], field: string, message: string) {
  issues.push({ field, message });
}

function normalizeTextField(
  source: Record<string, unknown>,
  key: string,
  label: string,
  rule: FieldRule,
  issues: BlogPayloadIssue[]
): string | undefined {
  const exists = hasOwn(source, key);
  if (!exists) {
    if (rule.required) {
      pushIssue(issues, key, `${label} é obrigatório.`);
    }
    return undefined;
  }

  const raw = source[key];
  const normalized = toTrimmedString(raw);
  if (normalized === null) {
    pushIssue(issues, key, `${label} deve ser texto.`);
    return undefined;
  }

  if (!normalized) {
    if (rule.required) {
      pushIssue(issues, key, `${label} não pode ficar vazio.`);
    }
    return undefined;
  }

  if (rule.min && normalized.length < rule.min) {
    pushIssue(issues, key, `${label} deve ter pelo menos ${rule.min} caracteres.`);
    return undefined;
  }

  if (rule.max && normalized.length > rule.max) {
    pushIssue(issues, key, `${label} deve ter no máximo ${rule.max} caracteres.`);
    return undefined;
  }

  return normalized;
}

function normalizeOptionalStringField(
  source: Record<string, unknown>,
  key: string,
  label: string,
  max: number,
  issues: BlogPayloadIssue[]
): string | undefined {
  if (!hasOwn(source, key)) return undefined;

  const raw = source[key];
  if (raw === null || raw === undefined) {
    return undefined;
  }

  const normalized = toTrimmedString(raw);
  if (normalized === null) {
    pushIssue(issues, key, `${label} deve ser texto.`);
    return undefined;
  }

  if (!normalized) {
    return undefined;
  }

  if (normalized.length > max) {
    pushIssue(issues, key, `${label} deve ter no máximo ${max} caracteres.`);
    return undefined;
  }

  return normalized;
}

function normalizeBooleanField(
  source: Record<string, unknown>,
  key: string,
  label: string,
  issues: BlogPayloadIssue[]
): boolean | undefined {
  if (!hasOwn(source, key)) return undefined;
  const raw = source[key];
  if (typeof raw === "boolean") return raw;
  if (typeof raw === "string") {
    const normalized = raw.trim().toLowerCase();
    if (["1", "true", "sim", "yes", "on"].includes(normalized)) return true;
    if (["0", "false", "nao", "não", "no", "off"].includes(normalized)) return false;
  }
  pushIssue(issues, key, `${label} deve ser booleano.`);
  return undefined;
}

function normalizeDateStringField(
  source: Record<string, unknown>,
  key: string,
  label: string,
  issues: BlogPayloadIssue[]
): string | null | undefined {
  if (!hasOwn(source, key)) return undefined;
  const raw = source[key];
  if (raw === null) return null;

  const normalized = toTrimmedString(raw);
  if (normalized === null || !normalized) {
    pushIssue(issues, key, `${label} deve ser uma data ISO válida.`);
    return undefined;
  }

  const parsed = new Date(normalized);
  if (Number.isNaN(parsed.getTime())) {
    pushIssue(issues, key, `${label} deve ser uma data ISO válida.`);
    return undefined;
  }

  return normalized;
}

function normalizeEnumField(
  source: Record<string, unknown>,
  key: string,
  label: string,
  allowedValues: Set<string>,
  options: { lowercase?: boolean },
  issues: BlogPayloadIssue[]
): string | undefined {
  if (!hasOwn(source, key)) return undefined;
  const raw = source[key];
  const normalized = toTrimmedString(raw);
  if (normalized === null || !normalized) {
    pushIssue(issues, key, `${label} deve ser informado.`);
    return undefined;
  }

  const candidate = options.lowercase
    ? normalized.toLowerCase().replace(/\s+/g, "")
    : normalized.toUpperCase();
  if (!allowedValues.has(candidate)) {
    pushIssue(issues, key, `${label} inválido.`);
    return undefined;
  }

  return candidate;
}

function normalizeId(value: unknown): string | null {
  if (value === null || value === undefined) return null;
  if (typeof value !== "string" && typeof value !== "number") return null;
  const normalized = String(value).trim();
  if (!normalized) return null;
  return normalized;
}

function isSafeHttpOrRelativeUrl(url: string) {
  if (/[<>"'`]/.test(url)) {
    return false;
  }

  if (url.startsWith("/")) {
    return true;
  }

  try {
    const parsed = new URL(url);
    return parsed.protocol === "http:" || parsed.protocol === "https:";
  } catch {
    return false;
  }
}

function normalizeCategoryIdField(
  source: Record<string, unknown>,
  mode: BlogPayloadMode
): string | null | undefined {
  if (!hasOwn(source, "categoryId")) return undefined;
  const raw = source.categoryId;
  if (raw === null) {
    return mode === "update" ? null : undefined;
  }

  const normalized = normalizeId(raw);
  if (!normalized) {
    return mode === "update" ? null : undefined;
  }

  return normalized;
}

function normalizeTagIdsField(
  source: Record<string, unknown>,
  issues: BlogPayloadIssue[]
): string[] | undefined {
  if (!hasOwn(source, "tagIds")) return undefined;
  const raw = source.tagIds;
  if (raw === null || raw === undefined) return [];
  if (!Array.isArray(raw)) {
    pushIssue(issues, "tagIds", "tagIds deve ser uma lista.");
    return undefined;
  }

  const uniqueIds = new Set<string>();
  const tagIds: string[] = [];

  raw.forEach((entry, index) => {
    const normalized = normalizeId(entry);
    if (!normalized) {
      pushIssue(issues, `tagIds[${index}]`, "Cada tag deve ter ID em texto.");
      return;
    }
    if (uniqueIds.has(normalized)) return;
    uniqueIds.add(normalized);
    tagIds.push(normalized);
  });

  if (tagIds.length > 30) {
    pushIssue(issues, "tagIds", "tagIds deve ter no máximo 30 itens.");
    return tagIds.slice(0, 30);
  }

  return tagIds;
}

function buildDiagnostics(payload: Record<string, unknown>): BlogPayloadDiagnostics {
  const tagIdsValue = payload.tagIds;
  return {
    keys: Object.keys(payload),
    categoryIdType: valueType(payload.categoryId),
    tagIdsType: valueType(tagIdsValue),
    tagIdsItemTypes: Array.isArray(tagIdsValue)
      ? tagIdsValue.slice(0, 8).map((entry) => valueType(entry))
      : [],
    statusType: valueType(payload.status),
    statusValue: typeof payload.status === "string" ? payload.status : null,
    publishedAtType: valueType(payload.publishedAt),
  };
}

function applyAllowedFields(source: Record<string, unknown>) {
  const filtered: Record<string, unknown> = {};
  Object.keys(source).forEach((key) => {
    if (BLOG_ALLOWED_FIELDS.has(key)) {
      filtered[key] = source[key];
    }
  });
  return filtered;
}

export function normalizeBlogPostPayload(
  input: unknown,
  mode: BlogPayloadMode
): NormalizeBlogPayloadResult {
  const issues: BlogPayloadIssue[] = [];
  if (!isRecord(input)) {
    return {
      payload: {},
      issues: [{ field: "body", message: "Payload JSON inválido: esperado objeto." }],
      diagnostics: {
        keys: [],
        categoryIdType: "undefined",
        tagIdsType: "undefined",
        tagIdsItemTypes: [],
        statusType: "undefined",
        statusValue: null,
        publishedAtType: "undefined",
      },
    };
  }

  const source = applyAllowedFields(input);
  const payload: Record<string, unknown> = {};

  const title = normalizeTextField(
    source,
    "title",
    "Título",
    { required: mode === "create", min: 3, max: 180 },
    issues
  );
  if (title) payload.title = title;

  const metaTitle = normalizeOptionalStringField(source, "metaTitle", "Meta title", 70, issues);
  if (metaTitle) payload.metaTitle = metaTitle;

  const subtitle = normalizeOptionalStringField(source, "subtitle", "Subtítulo", 240, issues);
  if (subtitle) payload.subtitle = subtitle;

  const excerpt = normalizeTextField(
    source,
    "excerpt",
    "Resumo",
    { required: mode === "create", min: 10, max: 360 },
    issues
  );
  if (excerpt) payload.excerpt = excerpt;

  const canonicalUrl = normalizeOptionalStringField(
    source,
    "canonicalUrl",
    "URL canônica",
    1024,
    issues
  );
  if (canonicalUrl) {
    if (!isSafeHttpOrRelativeUrl(canonicalUrl)) {
      pushIssue(issues, "canonicalUrl", "URL canônica inválida.");
    } else {
      payload.canonicalUrl = canonicalUrl;
    }
  }

  const focusKeyword = normalizeOptionalStringField(
    source,
    "focusKeyword",
    "Palavra-chave foco",
    120,
    issues
  );
  if (focusKeyword) payload.focusKeyword = focusKeyword;

  const robots = normalizeEnumField(
    source,
    "robots",
    "Diretiva robots",
    BLOG_ROBOTS_VALUES,
    { lowercase: true },
    issues
  );
  if (robots) payload.robots = robots;

  const content = normalizeTextField(
    source,
    "content",
    "Conteúdo",
    { required: mode === "create", min: 1 },
    issues
  );
  if (content) payload.content = content;

  const slug = normalizeOptionalStringField(source, "slug", "Slug", 180, issues);
  if (slug) payload.slug = slug;

  const coverImageUrl = normalizeOptionalStringField(
    source,
    "coverImageUrl",
    "URL da capa",
    1024,
    issues
  );
  if (coverImageUrl) {
    if (!isSafeHttpOrRelativeUrl(coverImageUrl)) {
      pushIssue(issues, "coverImageUrl", "URL da capa inválida.");
    } else {
      payload.coverImageUrl = coverImageUrl;
    }
  }

  const coverImageAlt = normalizeOptionalStringField(
    source,
    "coverImageAlt",
    "Alt da capa",
    240,
    issues
  );
  if (coverImageAlt) payload.coverImageAlt = coverImageAlt;

  const ogImageUrl = normalizeOptionalStringField(
    source,
    "ogImageUrl",
    "URL da imagem OG",
    1024,
    issues
  );
  if (ogImageUrl) {
    if (!isSafeHttpOrRelativeUrl(ogImageUrl)) {
      pushIssue(issues, "ogImageUrl", "URL da imagem OG inválida.");
    } else {
      payload.ogImageUrl = ogImageUrl;
    }
  }

  const status = normalizeEnumField(
    source,
    "status",
    "Status",
    BLOG_STATUS_VALUES,
    { lowercase: false },
    issues
  );
  if (status) payload.status = status;

  const featured = normalizeBooleanField(source, "featured", "featured", issues);
  if (typeof featured === "boolean") payload.featured = featured;

  const featuredAt = normalizeDateStringField(source, "featuredAt", "featuredAt", issues);
  if (featuredAt) payload.featuredAt = featuredAt;

  const categoryId = normalizeCategoryIdField(source, mode);
  if (categoryId !== undefined) {
    payload.categoryId = categoryId;
  }

  const tagIds = normalizeTagIdsField(source, issues);
  if (tagIds) payload.tagIds = tagIds;

  const difficulty = normalizeEnumField(
    source,
    "difficulty",
    "Dificuldade",
    BLOG_DIFFICULTY_VALUES,
    { lowercase: false },
    issues
  );
  if (difficulty) payload.difficulty = difficulty;

  const publishedAt = normalizeDateStringField(source, "publishedAt", "publishedAt", issues);
  if (publishedAt !== undefined && !(mode === "create" && publishedAt === null)) {
    payload.publishedAt = publishedAt;
  }

  if (mode === "create" && typeof payload.coverImageUrl === "string" && !payload.coverImageAlt) {
    pushIssue(issues, "coverImageAlt", "Alt da capa é obrigatório quando houver imagem de capa.");
  }

  if (mode === "update" && Object.keys(payload).length === 0) {
    pushIssue(issues, "body", "Nenhum campo válido foi enviado para atualização.");
  }

  return {
    payload,
    issues,
    diagnostics: buildDiagnostics(source),
  };
}
