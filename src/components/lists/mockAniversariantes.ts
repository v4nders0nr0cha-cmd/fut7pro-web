export interface Aniversariante {
  id: string;
  nome: string;
  data: string;
  dataNascimento?: string;
  foto?: string;
  apelido?: string | null;
}

export const mockAniversariantes: Aniversariante[] = [];
