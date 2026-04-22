import type { AdminLog } from "@/types/admin";

type JsonRecord = Record<string, unknown>;

export type HumanizedAdminLog = {
  id: string;
  rawAction: string;
  actionLabel: string;
  actorId: string | null;
  actorLabel: string;
  actorEmail: string | null;
  occurredAt: string | null;
  summary: string;
  contextLabel: string;
  technicalDetails: string | null;
  searchText: string;
};

type ActionDefinition = {
  label: string;
  context: string;
  defaultSummary: string;
};

const MAX_TECHNICAL_DETAILS_LENGTH = 1400;

const ACTION_DEFINITIONS: Record<string, ActionDefinition> = {
  ADMIN_ROLE_ASSIGNED: {
    label: "Cargo administrativo atribuído",
    context: "Administradores",
    defaultSummary: "Um atleta recebeu um cargo administrativo no racha.",
  },
  ADMIN_ROLE_REPLACED: {
    label: "Cargo administrativo substituído",
    context: "Administradores",
    defaultSummary: "Um cargo administrativo foi transferido para outro atleta.",
  },
  ADMIN_ROLE_REMOVED: {
    label: "Cargo administrativo removido",
    context: "Administradores",
    defaultSummary: "Um cargo administrativo foi liberado.",
  },
  ADMIN_OWNERSHIP_TRANSFERRED: {
    label: "Presidência transferida",
    context: "Administradores",
    defaultSummary: "A presidência do racha foi transferida para outro responsável.",
  },
  AUTH_LOOKUP_EMAIL: {
    label: "Consulta de e-mail no acesso",
    context: "Acesso",
    defaultSummary:
      "Uma tentativa de acesso consultou se o e-mail informado já possui conta no racha.",
  },
  RODADA_EXCLUIDA: {
    label: "Rodada excluída",
    context: "Partidas",
    defaultSummary: "Uma rodada foi removida do histórico de partidas.",
  },
  PARTIDA_EXCLUIDA: {
    label: "Partida excluída",
    context: "Partidas",
    defaultSummary: "Uma partida foi removida do histórico.",
  },
  SORTEIO_PUBLICADO: {
    label: "Times do dia publicados",
    context: "Partidas",
    defaultSummary: "Os times do dia foram publicados para os atletas.",
  },
  SORTEIO_PUBLICADO_EXCLUIDO: {
    label: "Publicação de times do dia removida",
    context: "Partidas",
    defaultSummary: "Uma publicação de times do dia foi removida ou arquivada.",
  },
  TIMES_DO_DIA_CURTIDO: {
    label: "Curtida nos times do dia",
    context: "Partidas",
    defaultSummary: "Um atleta curtiu a publicação dos times do dia.",
  },
  FINANCEIRO_CREATE: {
    label: "Lançamento financeiro criado",
    context: "Financeiro",
    defaultSummary: "Um lançamento foi criado no financeiro do racha.",
  },
  FINANCEIRO_UPDATE: {
    label: "Lançamento financeiro alterado",
    context: "Financeiro",
    defaultSummary: "Um lançamento financeiro foi alterado.",
  },
  FINANCEIRO_REMOVE: {
    label: "Lançamento financeiro removido",
    context: "Financeiro",
    defaultSummary: "Um lançamento financeiro foi removido.",
  },
  MENSALISTA_PAYMENT_REGISTER: {
    label: "Mensalidade registrada",
    context: "Mensalistas",
    defaultSummary: "Uma mensalidade foi marcada como paga.",
  },
  MENSALISTA_PAYMENT_REGISTER_BULK: {
    label: "Mensalidades registradas em lote",
    context: "Mensalistas",
    defaultSummary: "Mensalidades foram registradas em lote.",
  },
  MENSALISTA_PAYMENT_CANCEL: {
    label: "Mensalidade cancelada",
    context: "Mensalistas",
    defaultSummary: "Um pagamento de mensalidade foi cancelado.",
  },
  MENSALISTA_PAYMENT_IDEMPOTENT_HIT: {
    label: "Mensalidade já registrada",
    context: "Mensalistas",
    defaultSummary: "O sistema evitou duplicar uma mensalidade que já estava registrada.",
  },
  APPROVE_MENSALISTA_REQUEST: {
    label: "Pedido de mensalista aprovado",
    context: "Mensalistas",
    defaultSummary: "Um pedido para virar mensalista foi aprovado.",
  },
  REJECT_MENSALISTA_REQUEST: {
    label: "Pedido de mensalista recusado",
    context: "Mensalistas",
    defaultSummary: "Um pedido para virar mensalista foi recusado.",
  },
  APPROVE: {
    label: "Solicitação aprovada",
    context: "Atletas",
    defaultSummary: "Uma solicitação de entrada foi aprovada.",
  },
  REJECT: {
    label: "Solicitação recusada",
    context: "Atletas",
    defaultSummary: "Uma solicitação de entrada foi recusada.",
  },
  ATLETA_NIVEL_ATUALIZADO: {
    label: "Nível do atleta atualizado",
    context: "Jogadores",
    defaultSummary: "As estrelas ou o nível de um atleta foram atualizados.",
  },
  COMUNICADO_CRIADO: {
    label: "Comunicado criado",
    context: "Comunicação",
    defaultSummary: "Um comunicado foi criado para o racha.",
  },
  COMUNICADO_EDITADO: {
    label: "Comunicado editado",
    context: "Comunicação",
    defaultSummary: "Um comunicado do racha foi alterado.",
  },
  COMUNICADO_ARQUIVADO: {
    label: "Comunicado arquivado",
    context: "Comunicação",
    defaultSummary: "Um comunicado foi arquivado.",
  },
  COMUNICADO_AUTO_ARQUIVADO: {
    label: "Comunicado arquivado automaticamente",
    context: "Comunicação",
    defaultSummary: "O sistema arquivou um comunicado que chegou ao fim do período.",
  },
  BROADCAST_ENVIADO: {
    label: "Mensagem enviada",
    context: "Comunicação",
    defaultSummary: "Uma mensagem foi enviada para atletas do racha.",
  },
  ENQUETE_CRIADA: {
    label: "Enquete criada",
    context: "Enquetes",
    defaultSummary: "Uma enquete foi criada.",
  },
  ENQUETE_EDITADA: {
    label: "Enquete editada",
    context: "Enquetes",
    defaultSummary: "Uma enquete foi alterada.",
  },
  ENQUETE_PUBLICADA: {
    label: "Enquete publicada",
    context: "Enquetes",
    defaultSummary: "Uma enquete foi publicada para votação.",
  },
  VOTO_REGISTRADO: {
    label: "Voto registrado",
    context: "Enquetes",
    defaultSummary: "Um voto foi registrado em uma enquete.",
  },
  DENY_ADMIN_ACCESS: {
    label: "Acesso administrativo negado",
    context: "Segurança",
    defaultSummary: "Uma tentativa de acesso foi bloqueada por falta de permissão.",
  },
  TENANT_DIAGNOSTIC_RUN: {
    label: "Diagnóstico do racha executado",
    context: "Sistema",
    defaultSummary: "O sistema executou uma verificação técnica no racha.",
  },
  "superadmin:access-compensation:preview": {
    label: "Prévia de ajuste de acesso",
    context: "Acesso do racha",
    defaultSummary: "A equipe Fut7Pro simulou um ajuste de acesso antes de aplicar a mudança.",
  },
  "superadmin:access-compensation:applied": {
    label: "Ajuste de acesso aplicado",
    context: "Acesso do racha",
    defaultSummary: "A equipe Fut7Pro aplicou um ajuste de acesso no racha.",
  },
  "superadmin:access-compensation:notification-result": {
    label: "Notificação sobre ajuste de acesso",
    context: "Acesso do racha",
    defaultSummary: "O sistema registrou o resultado de uma notificação sobre ajuste de acesso.",
  },
  "superadmin:access-compensation:reverted": {
    label: "Ajuste de acesso revertido",
    context: "Acesso do racha",
    defaultSummary: "A equipe Fut7Pro reverteu um ajuste de acesso do racha.",
  },
  "superadmin:access-compensation:revert-notification-result": {
    label: "Notificação de reversão de acesso",
    context: "Acesso do racha",
    defaultSummary: "O sistema registrou uma notificação sobre a reversão de acesso.",
  },
  "superadmin:access-compensation:idempotent-replay": {
    label: "Reprocessamento de ajuste de acesso",
    context: "Acesso do racha",
    defaultSummary: "O sistema reprocessou um ajuste de acesso sem duplicar a operação.",
  },
};

const TOKEN_LABELS: Record<string, string> = {
  admin: "administração",
  role: "cargo",
  assigned: "atribuído",
  replaced: "substituído",
  removed: "removido",
  ownership: "presidência",
  transferred: "transferida",
  auth: "acesso",
  lookup: "consulta",
  email: "e-mail",
  financeiro: "financeiro",
  create: "criado",
  update: "alterado",
  remove: "removido",
  delete: "excluído",
  deleted: "excluído",
  sorteio: "times do dia",
  publicado: "publicado",
  excluido: "removido",
  excluida: "excluída",
  rodada: "rodada",
  partida: "partida",
  comunicado: "comunicado",
  enquete: "enquete",
  mensalista: "mensalista",
  payment: "pagamento",
  cancel: "cancelado",
  approve: "aprovado",
  reject: "recusado",
  superadmin: "Fut7Pro",
  notification: "notificação",
  result: "resultado",
  delivered: "entregue",
  failed: "falhou",
  success: "sucesso",
  ok: "sucesso",
  access: "acesso",
  compensation: "ajuste",
};

const currencyFormatter = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL",
});

export function humanizeAdminLog(log: AdminLog): HumanizedAdminLog {
  const rawAction = getLogAction(log);
  const rawDetails = getLogDetails(log);
  const definition = getActionDefinition(rawAction);
  const parsedDetails = parseJsonRecord(rawDetails);
  const auditDetails = parseAuditMessage(rawDetails);
  const actionLabel = definition?.label ?? humanizeUnknownAction(rawAction);
  const actorId = log.adminId ?? log.usuarioId ?? null;
  const actorLabel = getActorLabel(log);
  const actorEmail = log.adminEmail ?? null;
  const occurredAt = getLogDate(log);
  const summary = summarizeLog({
    rawAction,
    rawDetails,
    parsedDetails,
    auditDetails,
    definition,
  });
  const technicalDetails = buildTechnicalDetails(rawDetails, summary, parsedDetails);
  const contextLabel =
    definition?.context ?? getString(log.resource) ?? getString(log.recurso) ?? "Registro";

  return {
    id: log.id,
    rawAction,
    actionLabel,
    actorId,
    actorLabel,
    actorEmail,
    occurredAt,
    summary,
    contextLabel,
    technicalDetails,
    searchText: [rawAction, actionLabel, actorLabel, actorEmail, summary, contextLabel, rawDetails]
      .filter(Boolean)
      .join(" ")
      .toLowerCase(),
  };
}

export function getLogAction(log: AdminLog) {
  return (log.action || log.acao || "").trim();
}

function getLogDetails(log: AdminLog) {
  const value = log.details ?? log.detalhes ?? log.message ?? "";
  return typeof value === "string" ? value.trim() : "";
}

function getLogDate(log: AdminLog) {
  return log.timestamp || log.criadoEm || log.createdAt || log.data || null;
}

function getActorLabel(log: AdminLog) {
  const name = (log.adminName || log.adminNome || "").trim();
  const email = (log.adminEmail || "").trim();
  if (name) return name;
  if (email) return email;
  return "Sistema";
}

function getActionDefinition(action: string) {
  return ACTION_DEFINITIONS[action] ?? ACTION_DEFINITIONS[action.toUpperCase()];
}

function summarizeLog(params: {
  rawAction: string;
  rawDetails: string;
  parsedDetails: JsonRecord | null;
  auditDetails: ParsedAuditMessage | null;
  definition?: ActionDefinition;
}) {
  const action = params.rawAction;
  const upperAction = action.toUpperCase();

  if (upperAction === "AUTH_LOOKUP_EMAIL") {
    return "Consulta feita durante o acesso. E-mail, IP e dados sensíveis ficam ocultos na visão principal.";
  }

  if (upperAction === "RODADA_EXCLUIDA" || upperAction === "PARTIDA_EXCLUIDA") {
    return (
      summarizeDeletedMatches(upperAction, params.parsedDetails) ??
      params.definition?.defaultSummary
    );
  }

  if (upperAction === "SORTEIO_PUBLICADO" || upperAction === "SORTEIO_PUBLICADO_EXCLUIDO") {
    return (
      summarizePublishedTeams(upperAction, params.parsedDetails) ??
      params.definition?.defaultSummary
    );
  }

  if (upperAction.startsWith("ADMIN_ROLE_") || upperAction === "ADMIN_OWNERSHIP_TRANSFERRED") {
    return humanizePlainText(params.rawDetails) || params.definition?.defaultSummary;
  }

  if (upperAction.startsWith("FINANCEIRO_")) {
    return (
      summarizeFinanceLog(upperAction, params.auditDetails) ?? params.definition?.defaultSummary
    );
  }

  if (upperAction.startsWith("MENSALISTA_")) {
    return (
      summarizeMensalistaLog(upperAction, params.auditDetails) ?? params.definition?.defaultSummary
    );
  }

  if (upperAction.startsWith("COMUNICADO_")) {
    return (
      summarizeComunicadoLog(upperAction, params.parsedDetails) ?? params.definition?.defaultSummary
    );
  }

  if (upperAction.startsWith("ENQUETE_") || upperAction === "VOTO_REGISTRADO") {
    return summarizeSimpleTitledPayload(params.parsedDetails, params.definition?.defaultSummary);
  }

  if (action.startsWith("superadmin:access-compensation:")) {
    return (
      summarizeAccessCompensation(action, params.parsedDetails) ?? params.definition?.defaultSummary
    );
  }

  if (params.auditDetails) {
    return summarizeGenericAudit(params.auditDetails) ?? params.definition?.defaultSummary;
  }

  if (params.parsedDetails) {
    return summarizeGenericPayload(params.parsedDetails) ?? params.definition?.defaultSummary;
  }

  const plainText = humanizePlainText(params.rawDetails);
  if (plainText && !isTechnicalText(plainText)) return plainText;

  return params.definition?.defaultSummary ?? "Evento registrado no histórico administrativo.";
}

function summarizeDeletedMatches(action: string, details: JsonRecord | null) {
  if (!details) return null;
  const date = formatDateOnly(getString(details.dateKey) || getString(details.date));
  const reason = getString(details.reason);
  const impact = asRecord(details.impact);
  const matches = getNumber(impact?.matches) ?? arrayLength(details.matches);
  const presences = getNumber(impact?.presences);
  const goals = getNumber(impact?.goals);
  const assists = getNumber(impact?.assists);
  const subject = action === "RODADA_EXCLUIDA" ? "Rodada" : "Partida";

  const parts = [`${subject}${date ? ` de ${date}` : ""} excluída.`];
  if (reason) parts.push(`Motivo informado: ${reason}.`);

  const impactParts = [
    matches ? pluralize(matches, "partida") : null,
    presences ? pluralize(presences, "presença") : null,
    goals ? pluralize(goals, "gol") : null,
    assists ? pluralize(assists, "assistência") : null,
  ].filter(Boolean);

  if (impactParts.length) {
    parts.push(`Impacto: ${impactParts.join(", ")}.`);
  }

  return parts.join(" ");
}

function summarizePublishedTeams(action: string, details: JsonRecord | null) {
  if (!details) return null;
  const date = formatDateOnly(getString(details.dataPartida) || getString(details.date));
  const time = getString(details.horaPartida) || getString(details.time);
  const local = getString(details.local);
  const teams = arrayLength(details.times);

  const subject =
    action === "SORTEIO_PUBLICADO_EXCLUIDO"
      ? "Publicação dos times do dia removida"
      : "Times do dia publicados";
  const parts = [`${subject}${date ? ` para ${date}` : ""}${time ? ` às ${time}` : ""}.`];
  if (teams) parts.push(`Foram informados ${pluralize(teams, "time")}.`);
  if (local) parts.push(`Local: ${local}.`);
  return parts.join(" ");
}

function summarizeFinanceLog(action: string, audit: ParsedAuditMessage | null) {
  const values = audit?.newValues ?? audit?.oldValues;
  if (!values) return null;
  const type = getString(values.type);
  const description = getString(values.description);
  const category = getString(values.category);
  const value = getNumber(values.value);
  const date = formatDateOnly(getString(values.date));
  const actionVerb =
    action === "FINANCEIRO_CREATE"
      ? "criado"
      : action === "FINANCEIRO_UPDATE"
        ? "alterado"
        : "removido";
  const typeLabel = type
    ? type.toUpperCase().includes("SAIDA")
      ? "saída"
      : "entrada"
    : "lançamento";

  const parts = [`Lançamento financeiro de ${typeLabel} ${actionVerb}.`];
  if (value !== null) parts.push(`Valor: ${currencyFormatter.format(value)}.`);
  if (description) parts.push(`Descrição: ${description}.`);
  if (category) parts.push(`Categoria: ${category}.`);
  if (date) parts.push(`Data: ${date}.`);
  return parts.join(" ");
}

function summarizeMensalistaLog(action: string, audit: ParsedAuditMessage | null) {
  const values = audit?.newValues ?? audit?.oldValues;
  const athleteName = getString(values?.athleteName);
  const competencia = formatCompetencia(getString(values?.competencia) || audit?.entityId);
  const reason = getString(values?.cancelReason);

  if (action === "MENSALISTA_PAYMENT_CANCEL") {
    return [
      `Mensalidade${athleteName ? ` de ${athleteName}` : ""}${competencia ? ` em ${competencia}` : ""} cancelada.`,
      reason ? `Motivo: ${reason}.` : null,
    ]
      .filter(Boolean)
      .join(" ");
  }

  if (action === "MENSALISTA_PAYMENT_REGISTER_BULK") {
    return `Mensalidades${competencia ? ` de ${competencia}` : ""} registradas em lote.`;
  }

  if (action === "MENSALISTA_PAYMENT_IDEMPOTENT_HIT") {
    return `Registro de mensalidade${competencia ? ` de ${competencia}` : ""} ignorado para evitar duplicidade.`;
  }

  return `Mensalidade${athleteName ? ` de ${athleteName}` : ""}${competencia ? ` em ${competencia}` : ""} registrada.`;
}

function summarizeComunicadoLog(action: string, details: JsonRecord | null) {
  if (!details) return null;
  const title = getString(details.title);
  const start = formatDateOnly(getString(details.startAt));
  const end = formatDateOnly(getString(details.endAt) || getString(details.archivedAt));
  const base =
    action === "COMUNICADO_CRIADO"
      ? "Comunicado criado"
      : action === "COMUNICADO_EDITADO"
        ? "Comunicado editado"
        : "Comunicado arquivado";
  return [
    `${base}${title ? `: ${title}` : ""}.`,
    start ? `Início: ${start}.` : null,
    end ? `Fim/arquivamento: ${end}.` : null,
  ]
    .filter(Boolean)
    .join(" ");
}

function summarizeSimpleTitledPayload(details: JsonRecord | null, fallback?: string) {
  if (!details) return fallback ?? null;
  const title =
    getString(details.title) ||
    getString(details.titulo) ||
    getString(details.question) ||
    getString(details.pergunta) ||
    getString(details.message);
  if (!title) return fallback ?? summarizeGenericPayload(details);
  const prefix = (fallback ?? "Registro atualizado").replace(/[.!?]+$/, "");
  return `${prefix}: ${title}.`;
}

function summarizeAccessCompensation(action: string, details: JsonRecord | null) {
  const status = getString(details?.status) || getString(details?.result);
  const reason = getString(details?.reason) || getString(details?.message);
  const base =
    ACTION_DEFINITIONS[action]?.defaultSummary ?? "A equipe Fut7Pro registrou um ajuste de acesso.";
  return [
    base,
    status ? `Resultado: ${humanizeUnknownAction(status)}.` : null,
    reason ? `Observação: ${reason}.` : null,
  ]
    .filter(Boolean)
    .join(" ");
}

type ParsedAuditMessage = {
  action: string;
  entityType: string;
  entityId: string;
  oldValues?: JsonRecord;
  newValues?: JsonRecord;
};

function parseAuditMessage(value: string): ParsedAuditMessage | null {
  if (!value) return null;
  const match = value.match(/^([A-Z_]+)\s+([A-Za-z]+)\s+(.+?)(?:\s+-\s+Changes:\s+(.+))?$/);
  if (!match) return null;
  const [, action, entityType, entityId, changesText] = match;
  const changes = parseJsonRecord(changesText || "");
  return {
    action,
    entityType,
    entityId,
    oldValues: asRecord(changes?.oldValues) ?? undefined,
    newValues: asRecord(changes?.newValues) ?? undefined,
  };
}

function summarizeGenericAudit(audit: ParsedAuditMessage) {
  const entity = humanizeUnknownAction(audit.entityType);
  const values = audit.newValues ?? audit.oldValues;
  const changedFields = values ? Object.keys(values).slice(0, 4) : [];
  if (changedFields.length) {
    return `${entity} atualizado. Campos envolvidos: ${changedFields.map(humanizeUnknownAction).join(", ")}.`;
  }
  return `${entity} registrado no histórico administrativo.`;
}

function summarizeGenericPayload(payload: JsonRecord) {
  const summary =
    getString(payload.summary) ||
    getString(payload.message) ||
    getString(payload.reason) ||
    getString(payload.title);
  if (summary) return humanizePlainText(summary);

  const count = getNumber(payload.count) ?? getNumber(payload.total);
  const status = getString(payload.status) || getString(payload.result);
  const date = formatDateOnly(getString(payload.date) || getString(payload.createdAt));
  const parts = [
    status ? `Status: ${humanizeUnknownAction(status)}.` : null,
    count !== null ? `Total envolvido: ${count}.` : null,
    date ? `Data relacionada: ${date}.` : null,
  ].filter(Boolean);

  return parts.length ? parts.join(" ") : null;
}

function buildTechnicalDetails(
  rawDetails: string,
  summary: string,
  parsedDetails: JsonRecord | null
) {
  if (!rawDetails || rawDetails === summary) return null;
  if (!isTechnicalText(rawDetails) && !parsedDetails) return null;

  const content = parsedDetails ? JSON.stringify(parsedDetails, null, 2) : rawDetails;
  const sanitized = redactSensitiveText(content);
  if (sanitized.length <= MAX_TECHNICAL_DETAILS_LENGTH) return sanitized;
  return `${sanitized.slice(0, MAX_TECHNICAL_DETAILS_LENGTH).trimEnd()}\n...`;
}

function parseJsonRecord(value: string): JsonRecord | null {
  if (!value) return null;
  const trimmed = value.trim();
  if (!trimmed.startsWith("{") || !trimmed.endsWith("}")) return null;
  try {
    const parsed = JSON.parse(trimmed);
    return asRecord(parsed);
  } catch {
    return null;
  }
}

function asRecord(value: unknown): JsonRecord | null {
  return value && typeof value === "object" && !Array.isArray(value) ? (value as JsonRecord) : null;
}

function getString(value: unknown) {
  return typeof value === "string" && value.trim() ? value.trim() : null;
}

function getNumber(value: unknown) {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string" && value.trim() && Number.isFinite(Number(value))) {
    return Number(value);
  }
  return null;
}

function arrayLength(value: unknown) {
  return Array.isArray(value) ? value.length : null;
}

function formatDateOnly(value?: string | null) {
  if (!value) return null;
  const clean = value.trim();
  const dateOnly = clean.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (dateOnly) return `${dateOnly[3]}/${dateOnly[2]}/${dateOnly[1]}`;

  const parsed = new Date(clean);
  if (Number.isNaN(parsed.getTime())) return clean;
  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(parsed);
}

function formatCompetencia(value?: string | null) {
  if (!value) return null;
  const match = value.match(/^(\d{4})-(\d{1,2})$/);
  if (!match) return value;
  const date = new Date(Number(match[1]), Number(match[2]) - 1, 1);
  return new Intl.DateTimeFormat("pt-BR", {
    month: "long",
    year: "numeric",
  }).format(date);
}

function pluralize(count: number, singular: string) {
  const suffix = singular.endsWith("s") ? "es" : "s";
  return `${count} ${count === 1 ? singular : `${singular}${suffix}`}`;
}

function humanizeUnknownAction(value?: string | null) {
  const raw = (value || "").trim();
  if (!raw) return "Ação registrada";

  const words = raw
    .replace(/([a-z])([A-Z])/g, "$1 $2")
    .split(/[:_\-\s/]+/)
    .map((token) => token.trim().toLowerCase())
    .filter(Boolean)
    .map((token) => TOKEN_LABELS[token] ?? token);

  if (!words.length) return "Ação registrada";
  const sentence = words.join(" ");
  return sentence.charAt(0).toUpperCase() + sentence.slice(1);
}

function humanizePlainText(value?: string | null) {
  if (!value) return "";
  return redactSensitiveText(value)
    .replace(/_/g, " ")
    .replace(/\bativacao\b/gi, "ativação")
    .replace(/\bnao\b/gi, "não")
    .replace(/\bexcluido\b/gi, "excluído")
    .replace(/\bexcluida\b/gi, "excluída")
    .replace(/\bpendente de ativação\b/gi, "pendente de ativação")
    .replace(/\s+/g, " ")
    .trim();
}

function isTechnicalText(value: string) {
  return (
    /^[{\[]/.test(value.trim()) ||
    /"\w+"\s*:/.test(value) ||
    /\b(actorUserId|tenantSlug|deletedAt|emailHash|userAgent|access-compensation|AUTH_|ADMIN_|FINANCEIRO_|SORTEIO_)\b/.test(
      value
    )
  );
}

function redactSensitiveText(value: string) {
  let sanitized = value;
  sanitized = sanitized.replace(/Bearer\s+[A-Za-z0-9\-._~+/]+=*/gi, "Bearer [redigido]");
  sanitized = sanitized.replace(
    /(\"?(?:token|accessToken|refreshToken|authorization|cookie|set-cookie|senha|password|secret|apiKey|apikey|hash|emailHash)\"?\s*[:=]\s*\")([^\"]+)(\")/gi,
    "$1[redigido]$3"
  );
  sanitized = sanitized.replace(
    /\b([A-Za-z0-9_-]{20,})\.([A-Za-z0-9_-]{20,})\.([A-Za-z0-9_-]{20,})\b/g,
    "[jwt-redigido]"
  );
  sanitized = sanitized.replace(/\b(?:\d{1,3}\.){3}\d{1,3}\b/g, (ip) => maskIpv4(ip));
  return sanitized;
}

function maskIpv4(value: string) {
  const parts = value.split(".");
  if (parts.length !== 4) return "[ip-redigido]";
  return `${parts[0]}.${parts[1]}.***.***`;
}
