// src/types/automacao.ts
export interface AutomacaoNotificacao {
  id: string;
  nome: string;
  descricao: string;
  gatilho: string;
  canal: string[];
  obrigatoria: boolean;
  status: "ativo" | "inativo";
}
