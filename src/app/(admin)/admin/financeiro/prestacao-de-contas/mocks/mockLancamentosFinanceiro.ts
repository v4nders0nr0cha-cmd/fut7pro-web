export type Lancamento = {
  id: string;
  data: string; // yyyy-mm-dd
  tipo: "Receita" | "Despesa";
  categoria: string;
  descricao: string;
  valor: number;
  comprovante?: string; // url da imagem do comprovante (mock)
};

export const mockLancamentosFinanceiro: Lancamento[] = [
  {
    id: "1",
    data: "2025-07-01",
    tipo: "Receita",
    categoria: "Mensalidade",
    descricao: "Mensalidade Julho - Carlos",
    valor: 50,
    comprovante: "/images/comprovantes/comprovante_01.png",
  },
  {
    id: "2",
    data: "2025-07-02",
    tipo: "Despesa",
    categoria: "Campo",
    descricao: "Aluguel campo sintético",
    valor: -120,
    comprovante: "/images/comprovantes/comprovante_02.png",
  },
  {
    id: "3",
    data: "2025-07-05",
    tipo: "Receita",
    categoria: "Patrocínio",
    descricao: "Patrocínio Bar do Zé",
    valor: 200,
    comprovante: "/images/comprovantes/comprovante_03.png",
  },
];
