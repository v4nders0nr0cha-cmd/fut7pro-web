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
        nome: z.string().trim().min(1, "Nome obrigatorio"),
        cargo: stringOptional,
        texto: z.string().trim().min(1, "Depoimento obrigatorio"),
        foto: stringOptional,
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
  titulo: "Nossa Historia",
  descricao:
    "Conte a origem, missao e marcos do racha. Atualize os destaques e mantenha viva a historia.",
  marcos: [
    {
      ano: "2018",
      titulo: "Fundacao do Racha",
      descricao: "Os primeiros jogos e a base da nossa comunidade.",
      conquista: "🏆",
    },
  ],
  curiosidades: [
    {
      titulo: "Maior goleada",
      texto: "A maior goleada registrada ate hoje foi 9x1.",
      icone: "⚽",
    },
  ],
  depoimentos: [
    {
      nome: "Capitao do Racha",
      cargo: "Fundador",
      texto: "A historia do racha e feita de amizade e respeito dentro de campo.",
    },
  ],
  categoriasFotos: [
    {
      nome: "Fundacao",
      fotos: [],
    },
  ],
  videos: [],
  camposHistoricos: [],
  campoAtual: {
    nome: "Campo Atual",
    endereco: "",
    mapa: "",
    descricao: "",
  },
  membrosAntigos: [],
  campeoesHistoricos: [],
  diretoria: [
    { cargo: "Presidente", nome: "" },
    { cargo: "Vice-Presidente", nome: "" },
    { cargo: "Diretor de Futebol", nome: "" },
    { cargo: "Diretor Financeiro", nome: "" },
  ],
};
