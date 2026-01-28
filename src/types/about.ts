export type AboutData = {
  nome?: string;
  logoUrl?: string;
  titulo?: string;
  descricao?: string;
  cores?: { primary?: string; secondary?: string; accent?: string };
  marcos?: { ano: string; titulo: string; descricao: string; conquista?: string }[];
  curiosidades?: { titulo?: string; icone?: string; texto: string; curtidas?: number }[];
  depoimentos?: {
    nome: string;
    cargo: string;
    texto: string;
    foto?: string;
    destaque?: boolean;
  }[];
  categoriasFotos?: { nome: string; fotos: { src: string; alt?: string }[] }[];
  videos?: { id?: string | number; titulo: string; url: string }[];
  ajudaArtigos?: {
    id?: string | number;
    categoria?: string;
    titulo: string;
    conteudo: string;
    destaque?: boolean;
  }[];
  ajudaFaqs?: { pergunta: string; resposta: string }[];
  camposHistoricos?: { nome: string; mapa: string; descricao: string; endereco?: string }[];
  campoAtual?: { nome: string; mapa: string; descricao: string; endereco?: string };
  membrosAntigos?: { nome: string; status?: string; desde?: number | string; foto?: string }[];
  campeoesHistoricos?: {
    nome: string;
    slug: string;
    foto?: string;
    pontos: number;
    posicao: string;
  }[];
  localizacao?: { cidade?: string; estado?: string };
  presidente?: {
    nome?: string;
    apelido?: string;
    posicao?: string;
    avatarUrl?: string;
    email?: string;
  };
  diretoria?: { nome: string; cargo: string; foto?: string }[];
};

export type AboutResponse = {
  data: AboutData;
};
