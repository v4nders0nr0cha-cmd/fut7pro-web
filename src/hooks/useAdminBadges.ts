"use client";
import { useState } from "react";

// Tipos dos badges por item do menu
type Badges = {
  dashboard: number;
  notificacoes: number;
  mensagens: number;
  solicitacoes: number;
  perfil: number;
};

// Mock inicial para testar badges no menu admin
const initialBadges: Badges = {
  dashboard: 0,
  notificacoes: 2,
  mensagens: 1,
  solicitacoes: 3,
  perfil: 0,
};

export function useAdminBadges() {
  // Futuramente, trocar por fetch, socket ou contexto global
  const [badges] = useState<Badges>(initialBadges);
  return { badges };
}
