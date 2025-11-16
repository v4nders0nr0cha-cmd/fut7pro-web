"use client";

type ComunicacaoBadge = {
  badge: number;
  badgeMensagem: number;
  badgeSugestoes: number;
};

export function useComunicacao(): ComunicacaoBadge {
  return { badge: 0, badgeMensagem: 0, badgeSugestoes: 0 };
}
