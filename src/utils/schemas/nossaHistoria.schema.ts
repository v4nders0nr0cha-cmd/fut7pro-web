import { z } from "zod";
import type { NossaHistoriaData } from "@/types/paginasInstitucionais";

const stringOptional = z.string().trim().optional();

const urlSchema = z
  .string()
  .trim()
  .url()
  .refine((value) => value.startsWith("http://") || value.startsWith("https://"), {
    message: "URL deve iniciar com http:// ou https://",
  });

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
  categoriasFotos: z
    .array(
      z.object({
        nome: z.string().trim().min(1, "Nome da categoria obrigatorio"),
        fotos: z
          .array(
            z.object({
              src: urlSchema,
              alt: stringOptional,
            })
          )
          .optional()
          .default([]),
      })
    )
    .optional(),
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
  categoriasFotos: [
    {
      nome: "Fundacao",
      fotos: [],
    },
  ],
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
