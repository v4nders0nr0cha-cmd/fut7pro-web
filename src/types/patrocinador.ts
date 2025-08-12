export type Patrocinador = {
  id: string;
  nome: string;
  logo: string;
  link: string;
  prioridade: number;
  status: "ativo" | "inativo";
  descricao?: string;
  rachaId: string;
  criadoEm?: string;
  atualizadoEm?: string;
};
