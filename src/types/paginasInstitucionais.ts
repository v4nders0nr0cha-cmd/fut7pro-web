export type NossaHistoriaMarco = {
  ano: string;
  titulo: string;
  descricao: string;
  conquista?: string;
};

export type NossaHistoriaCuriosidade = {
  id?: string;
  titulo?: string;
  texto: string;
  icone?: string;
  curtidas?: number;
};

export type NossaHistoriaDepoimento = {
  id?: string;
  jogadorId?: string;
  texto: string;
  destaque?: boolean;
  nome?: string;
  cargo?: string;
  foto?: string;
};

export type NossaHistoriaFoto = {
  src: string;
  alt?: string;
};

export type NossaHistoriaCategoriaFotos = {
  nome: string;
  fotos: NossaHistoriaFoto[];
};

export type NossaHistoriaVideo = {
  titulo: string;
  url: string;
};

export type NossaHistoriaCampo = {
  nome: string;
  endereco?: string;
  mapa?: string;
  descricao?: string;
};

export type NossaHistoriaMembroAntigo = {
  nome: string;
  status?: string;
  desde?: string;
  foto?: string;
};

export type NossaHistoriaCampeaoHistorico = {
  nome: string;
  slug?: string;
  pontos?: number;
  posicao?: string;
  foto?: string;
};

export type NossaHistoriaDiretoria = {
  cargo: string;
  nome: string;
  foto?: string;
};

export type NossaHistoriaData = {
  titulo?: string;
  descricao?: string;
  marcos?: NossaHistoriaMarco[];
  curiosidades?: NossaHistoriaCuriosidade[];
  curiosidadesCurtidas?: Record<string, number>;
  depoimentos?: NossaHistoriaDepoimento[];
  categoriasFotos?: NossaHistoriaCategoriaFotos[];
  videos?: NossaHistoriaVideo[];
  camposHistoricos?: NossaHistoriaCampo[];
  campoAtual?: NossaHistoriaCampo;
  membrosAntigos?: NossaHistoriaMembroAntigo[];
  campeoesHistoricos?: NossaHistoriaCampeaoHistorico[];
  diretoria?: NossaHistoriaDiretoria[];
};
