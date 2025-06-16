// src/types/estatisticas.ts

// Tipos possíveis de ícones em conquistas de quadrimestre
export type QuadrimestreIcone = "medalha" | "bola";

// Estrutura de um item de destaque no quadrimestre
export interface QuadrimestreItem {
  titulo: string; // Ex: "Artilheiro", "Meia", "Zagueiro"
  nome: string; // Nome do atleta vencedor
  icone: QuadrimestreIcone; // Tipo de ícone que será exibido
  slug?: string; // Slug do atleta, usado para link no perfil
}

// Mapeia um ano com seus respectivos períodos e destaques
export type QuadrimestresAno = Record<string, QuadrimestreItem[]>;
