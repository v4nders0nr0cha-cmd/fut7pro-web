import { z } from "zod";
import { boundedArray } from "@/lib/bounded-array";
import type { NossaHistoriaData, NossaHistoriaGaleriaFoto } from "@/types/paginasInstitucionais";

const stringOptional = z.string().trim().optional();

const urlSchema = z
  .string()
  .trim()
  .url()
  .refine((value) => value.startsWith("http://") || value.startsWith("https://"), {
    message: "URL deve iniciar com http:// ou https://",
  });
const imageUrlSchema = z
  .string()
  .trim()
  .min(1, "Imagem obrigatoria")
  .refine(
    (value) => value.startsWith("/") || value.startsWith("http://") || value.startsWith("https://"),
    {
      message: "URL da imagem invalida",
    }
  );

export const MAX_GALERIA_FOTOS = 6;

export const DEFAULT_GALERIA_FOTOS: NossaHistoriaGaleriaFoto[] = [
  {
    id: "galeria-fundacao",
    src: "/images/historia/foto_antiga_01.png",
    titulo: "Fundação do Racha",
    descricao: "O começo de tudo: o primeiro encontro que virou tradição e resenha.",
  },
  {
    id: "galeria-primeiro-gol",
    src: "/images/historia/foto_antiga_02.png",
    titulo: "Primeiro Gol Registrado",
    descricao: "Aquele momento que entrou pra história e deu o pontapé na rivalidade saudável.",
  },
  {
    id: "galeria-primeiro-campeao",
    src: "/images/historia/foto_antiga_03.png",
    titulo: "Primeiro Campeão do Racha",
    descricao: "O primeiro time a levantar moral no racha, dando início às disputas internas.",
  },
  {
    id: "galeria-confraternizacao",
    src: "/images/historia/foto_antiga_04.png",
    titulo: "Primeira Confraternização",
    descricao: "Quando o pós-jogo virou parte da história, união, amizade e time fechado.",
  },
];

export const nossaHistoriaSchema = z.object({
  titulo: stringOptional,
  descricao: stringOptional,
  marcos: z
    .array(
      z.object({
        ano: z.string().trim().min(1, "Ano obrigatorio"),
        titulo: z.string().trim().min(1, "Titulo obrigatorio"),
        descricao: z.string().trim().min(1, "Descricao obrigatoria"),
        conquista: stringOptional,
      })
    )
    .optional(),
  curiosidades: z
    .array(
      z.object({
        id: stringOptional,
        titulo: stringOptional,
        texto: z.string().trim().min(1, "Texto obrigatorio"),
        icone: stringOptional,
        curtidas: z.number().optional(),
      })
    )
    .optional(),
  depoimentos: z
    .array(
      z.object({
        id: stringOptional,
        jogadorId: stringOptional,
        texto: z.string().trim().min(1, "Depoimento obrigatorio"),
        destaque: z.boolean().optional(),
      })
    )
    .optional(),
  categoriasFotos: boundedArray(
    z.object({
      id: stringOptional,
      src: imageUrlSchema,
      titulo: z.string().trim().min(1, "Titulo obrigatorio"),
      descricao: z.string().trim().min(1, "Descricao obrigatoria"),
    }),
    MAX_GALERIA_FOTOS,
    "Limite maximo de 6 fotos na galeria."
  ).optional(),
  videos: z
    .array(
      z.object({
        titulo: z.string().trim().min(1, "Titulo obrigatorio"),
        url: urlSchema,
      })
    )
    .optional(),
  camposHistoricos: z
    .array(
      z.object({
        nome: z.string().trim().min(1, "Nome obrigatorio"),
        endereco: stringOptional,
        mapa: stringOptional,
        descricao: stringOptional,
      })
    )
    .optional(),
  campoAtual: z
    .object({
      nome: z.string().trim().min(1, "Nome obrigatorio"),
      endereco: stringOptional,
      mapa: stringOptional,
      descricao: stringOptional,
    })
    .optional(),
  membrosAntigos: z
    .array(
      z.object({
        nome: z.string().trim().min(1, "Nome obrigatorio"),
        status: stringOptional,
        desde: stringOptional,
        foto: stringOptional,
      })
    )
    .optional(),
  campeoesHistoricos: z
    .array(
      z.object({
        nome: z.string().trim().min(1, "Nome obrigatorio"),
        slug: stringOptional,
        pontos: z.number().optional(),
        posicao: stringOptional,
        foto: stringOptional,
      })
    )
    .optional(),
  diretoria: z
    .array(
      z.object({
        cargo: z.string().trim().min(1, "Cargo obrigatorio"),
        nome: stringOptional,
        foto: stringOptional,
      })
    )
    .optional(),
});

export type NossaHistoriaSchema = z.infer<typeof nossaHistoriaSchema>;

export const DEFAULT_NOSSA_HISTORIA: NossaHistoriaData = {
  titulo: "Nossa História",
  descricao:
    "O racha seu racha nasceu da amizade e da paixão pelo futebol entre amigos. Fundado por o presidente do racha, começou como uma pelada de rotina e, com o tempo, virou tradição, união e resenha. Nossa história é feita de gols, rivalidade saudável e momentos inesquecíveis, sempre com respeito, espírito esportivo e aquele clima de time fechado.",
  marcos: [
    {
      ano: "2022",
      titulo: "Primeiros jogos",
      descricao: "A resenha ganhou forma e virou rotina entre a galera.",
      conquista: "⚽",
    },
    {
      ano: "2023",
      titulo: "Primeiro torneio interno",
      descricao: "Disputa saudável, amizade e muito espírito esportivo.",
      conquista: "🏆",
    },
    {
      ano: "2024",
      titulo: "Tradição consolidada",
      descricao: "O racha cresceu, ganhou identidade e ficou ainda mais unido.",
      conquista: "🤝",
    },
    {
      ano: "2025",
      titulo: "Evolução para o Fut7Pro",
      descricao:
        "O racha passou a contar com rankings, partidas e registros digitais. Mais organização, mais evolução.",
      conquista: "💻",
    },
  ],
  curiosidades: [],
  depoimentos: [],
  categoriasFotos: DEFAULT_GALERIA_FOTOS,
  videos: [],
  camposHistoricos: [],
  campoAtual: undefined,
  membrosAntigos: [],
  campeoesHistoricos: [],
  diretoria: [
    { cargo: "Presidente", nome: "" },
    { cargo: "Vice-Presidente", nome: "" },
    { cargo: "Diretor de Futebol", nome: "" },
    { cargo: "Diretor Financeiro", nome: "" },
  ],
};
