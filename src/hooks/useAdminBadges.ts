"use client";

import { useSolicitacoesCount } from "./useSolicitacoes";

type Badges = {
  dashboard: number;
  notificacoes: number;
  mensagens: number;
  solicitacoes: number;
  perfil: number;
};

const DEFAULT_BADGES: Badges = {
  dashboard: 0,
  notificacoes: 0,
  mensagens: 0,
  solicitacoes: 0,
  perfil: 0,
};

export function useAdminBadges() {
  const { data: solicitacoesCountData } = useSolicitacoesCount("PENDENTE");

  const badges: Badges = {
    ...DEFAULT_BADGES,
    solicitacoes: solicitacoesCountData?.count ?? 0,
  };

  return { badges };
}
