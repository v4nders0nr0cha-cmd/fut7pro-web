// src/lib/db.ts

// Mock de banco de dados para testes e jobs automatizados.
// Substitua futuramente pela integração real (ex: PrismaClient).

interface UsuarioParams {
  where?: {
    ativo?: boolean;
    dataNascimento?: {
      gte?: string;
      lte?: string;
    };
  };
}

interface Usuario {
  id: string;
  nome: string;
  whatsapp: string;
  email: string;
  dataNascimento: string;
  ativo: boolean;
}

export const db = {
  usuario: {
    findMany: async (_params: UsuarioParams): Promise<Usuario[]> => {
      // Retorno fictício, ajuste conforme sua necessidade.
      // Pode filtrar por "params.where" depois se desejar.
      return [
        {
          id: "1",
          nome: "Exemplo",
          whatsapp: "5511912345678",
          email: "exemplo@fut7pro.com",
          dataNascimento: "1990-06-24",
          ativo: true,
        },
      ];
    },
  },
};
