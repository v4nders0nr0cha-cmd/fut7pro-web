import { z } from "zod";

// Schema de validação para Racha
export const rachaSchema = z.object({
  id: z.string(),
  nome: z.string(),
  slug: z.string(),
  descricao: z.string().optional(),
  logoUrl: z.string().optional(),
  tema: z.string().optional(),
  regras: z.string().optional(),
  ownerId: z.string(),
  ativo: z.boolean(),
  financeiroVisivel: z.boolean().optional(),
  criadoEm: z.string(),
  atualizadoEm: z.string(),
  admins: z.array(z.any()).optional(),
  jogadores: z.array(z.any()).optional(),
});

// Schemas de validação para Jogadores
export const JogadorSchema = z.object({
  id: z.string().uuid(),
  nome: z.string().min(2).max(100),
  posicao: z.string().optional(),
  numero: z.number().min(1).max(99).optional(),
  foto: z.string().url().optional(),
  rachas: z.array(z.string()).optional(),
});

export const CreateJogadorSchema = z.object({
  nome: z.string().min(2).max(100),
  posicao: z.string().optional(),
  numero: z.number().min(1).max(99).optional(),
  foto: z.string().url().optional(),
});

export const UpdateJogadorSchema = CreateJogadorSchema.partial();

// Schemas de validação para Times
export const TimeSchema = z.object({
  id: z.string().uuid(),
  nome: z.string().min(2).max(100),
  jogadores: z.array(JogadorSchema),
  logo: z.string().url().optional(),
  cor: z
    .string()
    .regex(/^#[0-9A-F]{6}$/i)
    .optional(),
});

export const CreateTimeSchema = z.object({
  nome: z.string().min(2).max(100),
  jogadores: z.array(z.string().uuid()),
  logo: z.string().url().optional(),
  cor: z
    .string()
    .regex(/^#[0-9A-F]{6}$/i)
    .optional(),
});

export const UpdateTimeSchema = CreateTimeSchema.partial();

// Schemas de validação para Partidas
export const GolSchema = z.object({
  id: z.string().uuid(),
  jogador: z.string(),
  time: z.string(),
  minuto: z.number().min(1).max(90),
  tipo: z.enum(["normal", "penalti", "falta"]).optional(),
});

export const AssistenciaSchema = z.object({
  id: z.string().uuid(),
  jogador: z.string(),
  time: z.string(),
  minuto: z.number().min(1).max(90),
});

export const ConfrontoSchema = z.object({
  id: z.string().uuid(),
  timeA: z.string(),
  timeB: z.string(),
  golsTimeA: z.number().min(0),
  golsTimeB: z.number().min(0),
  finalizada: z.boolean(),
  data: z.string().datetime().optional(),
  local: z.string().optional(),
  gols: z.array(GolSchema).optional(),
  assistencias: z.array(AssistenciaSchema).optional(),
});

export const CreateConfrontoSchema = z.object({
  timeA: z.string(),
  timeB: z.string(),
  data: z.string().datetime(),
  local: z.string().optional(),
});

export const UpdateConfrontoSchema = z.object({
  golsTimeA: z.number().min(0).optional(),
  golsTimeB: z.number().min(0).optional(),
  finalizada: z.boolean().optional(),
  gols: z.array(GolSchema).optional(),
  assistencias: z.array(AssistenciaSchema).optional(),
});

// Schemas de validação para Notificações
export const NotificationTypeSchema = z.enum([
  "system",
  "superadmin",
  "mensagem",
  "pendencia",
  "financeiro",
  "alerta",
  "novidade",
  "contato",
  "outros",
]);

export const NotificationSchema = z.object({
  id: z.string().uuid(),
  rachaSlug: z.string(),
  type: NotificationTypeSchema,
  titulo: z.string().min(1).max(200),
  mensagem: z.string().min(1).max(1000),
  data: z.string().datetime(),
  lida: z.boolean(),
  prioridade: z.enum(["normal", "alta"]).optional(),
  remetente: z.string().optional(),
  assunto: z.string().optional(),
  referenciaId: z.string().uuid().optional(),
  metadata: z.record(z.unknown()).optional(),
});

export const CreateNotificationSchema = z.object({
  rachaSlug: z.string(),
  type: NotificationTypeSchema,
  titulo: z.string().min(1).max(200),
  mensagem: z.string().min(1).max(1000),
  prioridade: z.enum(["normal", "alta"]).optional(),
  remetente: z.string().optional(),
  assunto: z.string().optional(),
  referenciaId: z.string().uuid().optional(),
  metadata: z.record(z.unknown()).optional(),
});

export const UpdateNotificationSchema = z.object({
  lida: z.boolean().optional(),
  titulo: z.string().min(1).max(200).optional(),
  mensagem: z.string().min(1).max(1000).optional(),
  prioridade: z.enum(["normal", "alta"]).optional(),
  metadata: z.record(z.unknown()).optional(),
});

// Schemas de validação para Administradores
export const AdminSchema = z.object({
  id: z.string().uuid(),
  nome: z.string().min(2).max(100),
  email: z.string().email(),
  rachaId: z.string().uuid(),
  permissoes: z.array(z.string()),
  ativo: z.boolean(),
});

export const CreateAdminSchema = z.object({
  nome: z.string().min(2).max(100),
  email: z.string().email(),
  rachaId: z.string().uuid(),
  permissoes: z.array(z.string()),
});

export const UpdateAdminSchema = CreateAdminSchema.partial().extend({
  ativo: z.boolean().optional(),
});

// Schemas de validação para Financeiro
export const FinanceiroSchema = z.object({
  id: z.string().uuid(),
  rachaId: z.string().uuid(),
  tipo: z.enum(["receita", "despesa"]),
  categoria: z.string(),
  descricao: z.string().min(1).max(500),
  valor: z.number().positive(),
  data: z.string().datetime(),
  status: z.enum(["pendente", "pago", "cancelado"]),
  comprovante: z.string().url().optional(),
});

export const CreateFinanceiroSchema = z.object({
  rachaId: z.string().uuid(),
  tipo: z.enum(["receita", "despesa"]),
  categoria: z.string(),
  descricao: z.string().min(1).max(500),
  valor: z.number().positive(),
  data: z.string().datetime(),
  comprovante: z.string().url().optional(),
});

export const UpdateFinanceiroSchema = CreateFinanceiroSchema.partial().extend({
  status: z.enum(["pendente", "pago", "cancelado"]).optional(),
});

// Schemas de validação para Influencers
export const InfluencerSchema = z.object({
  id: z.string().uuid(),
  nome: z.string().min(2).max(100),
  email: z.string().email(),
  telefone: z.string(),
  plataforma: z.string(),
  seguidores: z.number().positive(),
  taxaComissao: z.number().min(0).max(100),
  ativo: z.boolean(),
});

export const CreateInfluencerSchema = z.object({
  nome: z.string().min(2).max(100),
  email: z.string().email(),
  telefone: z.string(),
  plataforma: z.string(),
  seguidores: z.number().positive(),
  taxaComissao: z.number().min(0).max(100),
});

export const UpdateInfluencerSchema = CreateInfluencerSchema.partial().extend({
  ativo: z.boolean().optional(),
});

// Schemas de validação para API Responses
export const ApiResponseSchema = <T extends z.ZodTypeAny>(dataSchema: T) =>
  z.object({
    success: z.boolean(),
    data: dataSchema.optional(),
    message: z.string().optional(),
    details: z.record(z.unknown()).optional(),
  });

// Função helper para validar dados
export const validateData = <T>(schema: z.ZodSchema<T>, data: unknown): T => {
  try {
    return schema.parse(data);
  } catch (error) {
    if (error instanceof z.ZodError) {
      throw new Error(
        `Validação falhou: ${error.errors.map((e) => e.message).join(", ")}`,
      );
    }
    throw error;
  }
};

// Função helper para validar dados de forma segura
export const validateDataSafe = <T>(
  schema: z.ZodSchema<T>,
  data: unknown,
): { success: true; data: T } | { success: false; errors: string[] } => {
  try {
    const validatedData = schema.parse(data);
    return { success: true, data: validatedData };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return {
        success: false,
        errors: error.errors.map((e) => e.message),
      };
    }
    return {
      success: false,
      errors: ["Erro de validação desconhecido"],
    };
  }
};

// Alias para validateDataSafe para compatibilidade
export const validateSafe = validateDataSafe;
