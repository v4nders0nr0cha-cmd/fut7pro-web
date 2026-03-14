import type { LancamentoFinanceiro } from "@/types/financeiro";

export const MENSALISTAS_METADATA_PREFIX = "[fut7pro:mensalistas]";
export const MENSALISTAS_SOURCE_TYPE = "MENSALISTAS";

export type MensalistaLancamentoAcao = "individual" | "lote";

export type MensalistaLancamentoMetadata = {
  origem: "mensalistas";
  competencia: string;
  athleteId: string;
  athleteNome: string;
  status: "confirmado";
  acao: MensalistaLancamentoAcao;
  registradoEm: string;
};

type ParsedMetadata = Partial<MensalistaLancamentoMetadata> | null;

export function buildCompetenciaKey(year: number, month: number): string {
  return `${year}-${String(month).padStart(2, "0")}`;
}

export function formatCompetenciaLabel(year: number, month: number): string {
  const reference = new Date(year, Math.max(month - 1, 0), 1);
  return new Intl.DateTimeFormat("pt-BR", {
    month: "long",
    year: "numeric",
  }).format(reference);
}

export function formatCompetenciaLabelFromKey(competencia: string): string {
  const [yearRaw, monthRaw] = competencia.split("-");
  const year = Number(yearRaw);
  const month = Number(monthRaw);
  if (!Number.isInteger(year) || !Number.isInteger(month)) {
    return competencia;
  }
  return formatCompetenciaLabel(year, month);
}

function sanitizeAthleteNome(value: string): string {
  return value.trim().replace(/\s+/g, " ").slice(0, 120);
}

export function buildMensalidadeObservacoes(
  metadata: Omit<MensalistaLancamentoMetadata, "origem" | "status" | "registradoEm">
): string {
  const competenciaLabel = formatCompetenciaLabelFromKey(metadata.competencia);
  const normalizedMeta: MensalistaLancamentoMetadata = {
    origem: "mensalistas",
    competencia: metadata.competencia,
    athleteId: metadata.athleteId.trim(),
    athleteNome: sanitizeAthleteNome(metadata.athleteNome),
    status: "confirmado",
    acao: metadata.acao,
    registradoEm: new Date().toISOString(),
  };

  return `Mensalidade do atleta ${normalizedMeta.athleteNome}, referente a ${competenciaLabel}. Origem: Mensalistas. ${MENSALISTAS_METADATA_PREFIX}${JSON.stringify(
    normalizedMeta
  )}`;
}

function parseMetadata(raw: string): ParsedMetadata {
  const index = raw.indexOf(MENSALISTAS_METADATA_PREFIX);
  if (index < 0) return null;
  const jsonChunk = raw.slice(index + MENSALISTAS_METADATA_PREFIX.length).trim();
  if (!jsonChunk) return null;
  try {
    const parsed = JSON.parse(jsonChunk) as ParsedMetadata;
    if (!parsed || typeof parsed !== "object") return null;
    return parsed;
  } catch {
    return null;
  }
}

type MensalidadeExtractInput =
  | string
  | null
  | undefined
  | Pick<
      LancamentoFinanceiro,
      | "observacoes"
      | "sourceType"
      | "athleteId"
      | "competencia"
      | "competenciaAno"
      | "competenciaMes"
      | "descricao"
    >;

function parseAthleteNameFromDescricao(descricao?: string): string | null {
  if (!descricao) return null;
  const normalized = descricao.trim();
  const match = normalized.match(/^mensalidade de\s+(.+?)\s*-\s*/i);
  if (!match?.[1]) return null;
  return sanitizeAthleteNome(match[1]);
}

function parseCompetenciaFromFields(input: {
  competencia?: string;
  competenciaAno?: number;
  competenciaMes?: number;
}): string | null {
  if (input.competencia && /^\d{4}-\d{2}$/.test(input.competencia.trim())) {
    return input.competencia.trim();
  }
  const ano = Number(input.competenciaAno);
  const mes = Number(input.competenciaMes);
  if (!Number.isInteger(ano) || !Number.isInteger(mes) || mes < 1 || mes > 12) {
    return null;
  }
  return buildCompetenciaKey(ano, mes);
}

function extractFromLegacyObservacoes(
  observacoes?: string | null
): MensalistaLancamentoMetadata | null {
  const raw = (observacoes || "").trim();
  if (!raw) return null;

  const parsed = parseMetadata((observacoes || "").trim());
  if (!parsed) return null;
  if (parsed.origem !== "mensalistas") return null;
  if (typeof parsed.competencia !== "string" || !parsed.competencia.trim()) return null;
  if (typeof parsed.athleteId !== "string" || !parsed.athleteId.trim()) return null;
  if (typeof parsed.athleteNome !== "string" || !parsed.athleteNome.trim()) return null;

  return {
    origem: "mensalistas",
    competencia: parsed.competencia.trim(),
    athleteId: parsed.athleteId.trim(),
    athleteNome: sanitizeAthleteNome(parsed.athleteNome),
    status: "confirmado",
    acao: parsed.acao === "lote" ? "lote" : "individual",
    registradoEm:
      typeof parsed.registradoEm === "string" && parsed.registradoEm.trim()
        ? parsed.registradoEm.trim()
        : "",
  };
}

export function extractMensalidadeMetadata(
  input: MensalidadeExtractInput
): MensalistaLancamentoMetadata | null {
  if (!input) return null;

  if (typeof input === "string") {
    return extractFromLegacyObservacoes(input);
  }

  const sourceType = String(input.sourceType || "")
    .trim()
    .toUpperCase();
  if (sourceType === MENSALISTAS_SOURCE_TYPE) {
    const athleteId = String(input.athleteId || "").trim();
    const competencia = parseCompetenciaFromFields(input);
    if (!athleteId || !competencia) {
      return null;
    }

    const athleteNome =
      parseAthleteNameFromDescricao(input.descricao) ||
      extractFromLegacyObservacoes(input.observacoes)?.athleteNome ||
      "Atleta";

    return {
      origem: "mensalistas",
      competencia,
      athleteId,
      athleteNome,
      status: "confirmado",
      acao: "individual",
      registradoEm: "",
    };
  }

  return extractFromLegacyObservacoes(input.observacoes);
}

export function isMensalidadeLancamento(
  lancamento: Pick<
    LancamentoFinanceiro,
    | "categoria"
    | "observacoes"
    | "sourceType"
    | "athleteId"
    | "competencia"
    | "competenciaAno"
    | "competenciaMes"
    | "descricao"
  >,
  options?: {
    competencia?: string;
    athleteId?: string;
  }
): boolean {
  const categoria = (lancamento.categoria || "").trim().toLowerCase();
  if (categoria !== "mensalidade") return false;

  const metadata = extractMensalidadeMetadata(lancamento);
  if (!metadata) return false;

  if (options?.competencia && metadata.competencia !== options.competencia) {
    return false;
  }

  if (options?.athleteId && metadata.athleteId !== options.athleteId) {
    return false;
  }

  return true;
}
