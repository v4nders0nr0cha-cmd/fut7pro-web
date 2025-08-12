// src/components/lists/mockAniversariantes.ts

export interface Aniversariante {
  id: string;
  nome: string;
  foto: string;
  dataNascimento: string; // "YYYY-MM-DD"
  whatsapp?: string;
  email?: string;
  autorizadoPublico?: boolean;
}

// Mock para testes: um aniversariante de hoje, um deste mês, um de outro mês
export const mockAniversariantes: Aniversariante[] = [
  {
    id: "1",
    nome: "Carlos Silva",
    foto: "/images/jogadores/jogador_padrao_02.jpg",
    dataNascimento: new Date().toISOString().slice(0, 10), // HOJE
    whatsapp: "5599999999999",
    email: "carlos@email.com",
    autorizadoPublico: true,
  },
  {
    id: "2",
    nome: "Lucas Pereira",
    foto: "/images/jogadores/jogador_padrao_04.jpg",
    dataNascimento: (() => {
      const d = new Date();
      d.setDate(28); // 28 deste mês
      return d.toISOString().slice(0, 10);
    })(),
    whatsapp: "",
    email: "lucas@email.com",
    autorizadoPublico: true,
  },
  {
    id: "3",
    nome: "Sergio Matos",
    foto: "/images/jogadores/jogador_padrao_16.jpg",
    dataNascimento: "1990-08-05", // Outro mês
    whatsapp: "5511988888888",
    email: "",
    autorizadoPublico: true,
  },
];
