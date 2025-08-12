"use client";
import { useState } from "react";

// Tipagem explícita para retorno do hook (amplia para todos os badges)
type ComunicacaoBadge = {
  badge: number; // Notificações (avisos, enquetes, etc)
  badgeMensagem: number; // Mensagens recebidas do admin
  badgeSugestoes: number; // Resposta do admin para sugestões
};

export function useComunicacao(): ComunicacaoBadge {
  // Mock de badges – Substitua por integração real depois
  const [badge] = useState<number>(2); // exemplo: notificações pendentes
  const [badgeMensagem] = useState<number>(1); // exemplo: nova mensagem do admin
  const [badgeSugestoes] = useState<number>(0); // exemplo: sugestão respondida

  return { badge, badgeMensagem, badgeSugestoes };
}
