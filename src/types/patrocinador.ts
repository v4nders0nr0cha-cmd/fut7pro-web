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
  // Campos novos (opcionais) para alinhamento com backend
  ramo?: string;
  sobre?: string;
  cupom?: string;
  beneficio?: string;
  valor?: number;
  periodoInicio?: string;
  periodoFim?: string;
  displayOrder?: number;
  tier?: "basic" | "plus" | "pro";
  showOnFooter?: boolean;
  createdById?: string;
  updatedById?: string;
};
