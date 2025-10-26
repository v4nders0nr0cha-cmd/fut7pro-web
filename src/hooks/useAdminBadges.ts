"use client";
import { useEffect, useState } from "react";
import { useSolicitacoesCount } from "@/hooks/useSolicitacoes";

// Tipos dos badges por item do menu
type Badges = {
  dashboard: number;
  notificacoes: number;
  mensagens: number;
  solicitacoes: number;
};

const initialBadges: Badges = { dashboard: 0, notificacoes: 0, mensagens: 0, solicitacoes: 0 };

export function useAdminBadges() {
  const [badges, setBadges] = useState<Badges>(initialBadges);
  const pending = useSolicitacoesCount();
  useEffect(() => {
    setBadges((prev) => ({ ...prev, solicitacoes: pending }));
  }, [pending]);
  return { badges };
}
