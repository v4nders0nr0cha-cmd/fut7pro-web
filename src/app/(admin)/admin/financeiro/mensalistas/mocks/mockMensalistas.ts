export type Mensalista = {
  id: string;
  nome: string;
  status: "Em dia" | "Inadimplente" | "A receber";
  valor: number;
  ultimoPagamento: string; // yyyy-mm-dd
};

export const mockMensalistas: Mensalista[] = [
  {
    id: "1",
    nome: "Carlos Silva",
    status: "Em dia",
    valor: 50,
    ultimoPagamento: "2025-07-01",
  },
  {
    id: "2",
    nome: "Lucas Souza",
    status: "Inadimplente",
    valor: 50,
    ultimoPagamento: "2025-06-01",
  },
  {
    id: "3",
    nome: "Ricardo Lima",
    status: "A receber",
    valor: 50,
    ultimoPagamento: "",
  },
];
