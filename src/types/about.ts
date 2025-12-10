export type AboutData = {
  titulo?: string;
  descricao?: string;
  marcos?: { ano: string; titulo: string; descricao: string; conquista?: string }[];
  curiosidades?: { icone?: string; texto: string; curtidas?: number }[];
  depoimentos?: { nome: string; cargo: string; texto: string; foto?: string; destaque?: boolean }[];
  categoriasFotos?: { nome: string; fotos: { src: string; alt: string }[] }[];
  videos?: { titulo: string; url: string }[];
  camposHistoricos?: { nome: string; mapa: string; descricao: string }[];
  campoAtual?: { nome: string; mapa: string; descricao: string };
  membrosAntigos?: { nome: string; status: string; desde: number; foto?: string }[];
  campeoesHistoricos?: {
    nome: string;
    slug: string;
    foto?: string;
    pontos: number;
    posicao: string;
  }[];
  diretoria?: { nome: string; cargo: string; foto?: string }[];
};

export type AboutResponse = {
  data: AboutData;
};
