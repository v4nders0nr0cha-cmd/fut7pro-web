export type EstatutoTopico = {
  titulo: string;
  conteudo: string[];
  atualizado?: boolean;
  ordem?: number;
};

export type EstatutoData = {
  titulo?: string;
  descricao?: string;
  atualizadoEm?: string;
  pdfUrl?: string | null;
  topicos?: EstatutoTopico[];
};

export type EstatutoResponse = {
  data: EstatutoData;
};
