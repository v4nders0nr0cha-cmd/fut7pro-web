export type ComunicadoSeverity = "INFO" | "ALERTA" | "REGRA" | "FINANCEIRO";

export type ComunicadoStatus = "AGENDADO" | "ATIVO" | "ENCERRADO" | "ARQUIVADO";

export type ComunicadoItem = {
  id: string;
  title: string;
  message: string;
  severity: ComunicadoSeverity;
  startAt: string;
  endAt: string;
  archivedAt?: string | null;
  archivedBySystem?: boolean;
  createdBy?: { id: string; name?: string | null; email?: string | null } | null;
  createdAt?: string;
  updatedAt?: string;
  status?: ComunicadoStatus | string;
  viewsCount?: number;
  lastViewAt?: string | null;
};

export type ComunicadoListResponse = {
  results: ComunicadoItem[];
  nextCursor?: string | null;
};

export type ComunicadoPublicResponse = {
  active: ComunicadoItem[];
  archivedRecent: ComunicadoItem[];
};
