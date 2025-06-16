export type Tema = {
  nome: string;
  slug: string;
  logo: string;
  corPrimaria: string;
  corSecundaria: string;
  endereco: string;
  descricao: string;
};

export const temasDisponiveis: Tema[] = [
  {
    nome: "Real Matismo",
    slug: "realmatismo",
    logo: "/images/fut7pro-logo.png",
    corPrimaria: "#FFCC00",
    corSecundaria: "#0e0e0e",
    endereco: "Arena F7, Av. Gerardo Rangel, 10 - Derby Clube",
    descricao:
      "O Fut7Pro é o sistema inteligente para rachas ranqueados, com conquistas, sorteio balanceado, premiação e muito mais.",
  },
  {
    nome: "Corinthians Style",
    slug: "corinthians",
    logo: "/images/corinthians.png",
    corPrimaria: "#000000",
    corSecundaria: "#ffffff",
    endereco: "Parque São Jorge, SP",
    descricao: "Racha inspirado na garra corintiana. Timão!",
  },
  {
    nome: "Palmeiras Style",
    slug: "palmeiras",
    logo: "/images/palmeiras.png",
    corPrimaria: "#1e7e34",
    corSecundaria: "#fefefe",
    endereco: "Allianz Parque",
    descricao: "Aqui tem mundial (segundo alguns).",
  },
  {
    nome: "Flamengo Style",
    slug: "flamengo",
    logo: "/images/flamengo.png",
    corPrimaria: "#f00",
    corSecundaria: "#000",
    endereco: "Maracanã, RJ",
    descricao: "O racha mais popular do Brasil. Mengão!",
  },
  {
    nome: "Santos Clássico",
    slug: "santos",
    logo: "/images/santos.png",
    corPrimaria: "#ffffff",
    corSecundaria: "#000000",
    endereco: "Vila Belmiro",
    descricao: "O peixe dominando as areias do Fut7!",
  },
  {
    nome: "Tricolor Paulista",
    slug: "saopaulo",
    logo: "/images/saopaulo.png",
    corPrimaria: "#cc0000",
    corSecundaria: "#fff",
    endereco: "Morumbi",
    descricao: "O racha do soberano!",
  },
  {
    nome: "Cruzeiro Estrela",
    slug: "cruzeiro",
    logo: "/images/cruzeiro.png",
    corPrimaria: "#0033a0",
    corSecundaria: "#ffffff",
    endereco: "Mineirão",
    descricao: "Racha estrelado, digno da raposa!",
  },
  {
    nome: "Inter Vermelhão",
    slug: "internacional",
    logo: "/images/inter.png",
    corPrimaria: "#ba0c2f",
    corSecundaria: "#ffffff",
    endereco: "Beira-Rio",
    descricao: "Racha pegado no sul!",
  },
  {
    nome: "Grêmio Imortal",
    slug: "gremio",
    logo: "/images/gremio.png",
    corPrimaria: "#0099d4",
    corSecundaria: "#000000",
    endereco: "Arena do Grêmio",
    descricao: "Aqui o racha é raiz e competitivo!",
  },
  {
    nome: "Bahia Tricolor",
    slug: "bahia",
    logo: "/images/bahia.png",
    corPrimaria: "#0033cc",
    corSecundaria: "#ffffff",
    endereco: "Fonte Nova",
    descricao: "Axé, talento e gols! Racha do Bahia.",
  },
];
