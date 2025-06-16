// src/types/partida.ts

// Representa uma partida disputada no racha
export type Partida = {
  id: number; // ID único da partida
  data: string; // Data da partida (ex: "2025-06-16")
  hora: string; // Horário da partida
  local: string; // Local/campo onde ocorreu
  timeCasa: string; // Nome do time mandante
  logoCasa: string; // Caminho da logo do time mandante
  golsCasa: number; // Gols marcados pelo time mandante
  timeFora: string; // Nome do time visitante
  logoFora: string; // Caminho da logo do time visitante
  golsFora: number; // Gols marcados pelo time visitante
  destaques: string[]; // Lista de jogadores que se destacaram
};
