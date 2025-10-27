// src/server/services/publishChecklist.ts
import { prisma } from "@/server/prisma";

export type ChecklistItem = {
  key: "slug" | "branding" | "conteudo" | "email";
  label: string;
  ok: boolean;
  help?: string;
};

export async function getPublishChecklist(rachaId: string): Promise<{
  items: ChecklistItem[];
  allOk: boolean;
  racha?: { id: string; slug: string | null | undefined; ativo: boolean | null | undefined };
}> {
  if (!rachaId?.trim()) {
    return { items: [], allOk: false };
  }

  // Carrega o racha com os campos realmente usados
  const racha = await prisma.racha.findUnique({
    where: { id: rachaId },
    select: {
      id: true,
      slug: true,
      logoUrl: true,
      tema: true,
      ativo: true,
      ownerId: true,
    },
  });

  if (!racha) {
    return { items: [], allOk: false };
  }

  // ----------------------------------------------------------------
  // Coletas auxiliares (defensivas para ambientes com schemas distintos)
  // ----------------------------------------------------------------
  const pAny = prisma as any;
  const now = new Date();

  // Counts com fallback (não quebra se modelo/campo não existir)
  const timesCount = await safeCount(() => pAny.time.count({ where: { rachaId } }), 0);

  // Se houver RachaJogador usa, senão tenta Jogador com rachaId
  const jogadoresCount =
    (await safeCount(() => pAny.rachaJogador.count({ where: { rachaId } }), 0)) ||
    (await safeCount(() => pAny.jogador.count({ where: { rachaId } }), 0));

  // Partida futura (tenta campos comuns: inicioEm, data, dataHora)
  const partidasFuturas =
    (await safeCount(() => pAny.partida.count({ where: { rachaId, inicioEm: { gt: now } } }), 0)) ||
    (await safeCount(() => pAny.partida.count({ where: { rachaId, data: { gt: now } } }), 0)) ||
    (await safeCount(() => pAny.partida.count({ where: { rachaId, dataHora: { gt: now } } }), 0));

  // E-mail verificado (preferência NextAuth.User.emailVerified; fallback Usuario.status === 'ativo')
  type UserRow = { emailVerified: Date | null } | null;
  const userRow = await safeGet<UserRow>(() =>
    pAny.user.findUnique({ where: { id: racha.ownerId }, select: { emailVerified: true } })
  );
  const userEmailVerified = !!userRow?.emailVerified;

  type UsuarioRow = { status: string | null } | null;
  const usuarioRow = await safeGet<UsuarioRow>(() =>
    pAny.usuario.findUnique({ where: { id: racha.ownerId }, select: { status: true } })
  );
  const usuarioStatusAtivo = ((usuarioRow?.status ?? "") as string).toLowerCase() === "ativo";

  // ----------------------------------------------------------------
  // Regras do checklist
  // ----------------------------------------------------------------

  // 1) Slug válido
  const slugOk = !!racha.slug && /^[a-z0-9-]{3,}$/.test(racha.slug);

  // 2) Branding (logo OU tema)
  const hasBranding =
    Boolean(racha.logoUrl) || Boolean(racha.tema && String(racha.tema).trim().length > 0);

  // 3) Conteúdo mínimo (1 time OU 5 jogadores OU 1 partida futura)
  const hasMinData = timesCount > 0 || jogadoresCount >= 5 || partidasFuturas > 0;

  // 4) E-mail verificado (real com fallback)
  const emailVerified = userEmailVerified || usuarioStatusAtivo;

  const items: ChecklistItem[] = [
    {
      key: "slug",
      label: "Slug válido",
      ok: slugOk,
      help: "Use letras minúsculas, números e hífen (mín. 3 caracteres).",
    },
    {
      key: "branding",
      label: "Logo OU tema definidos",
      ok: hasBranding,
      help: "Adicione uma logo ou escolha um tema visual.",
    },
    {
      key: "conteudo",
      label: "Conteúdo mínimo (1 time OU 5 jogadores OU 1 partida futura)",
      ok: hasMinData,
      help: "Cadastre pelo menos: 1 time, 5 jogadores ou 1 partida agendada.",
    },
    {
      key: "email",
      label: "E-mail do presidente verificado",
      ok: emailVerified,
      help: userEmailVerified
        ? "E-mail verificado via NextAuth."
        : "Usando status 'ativo' como proxy.",
    },
  ];

  return {
    items,
    allOk: items.every((i) => i.ok),
    racha: { id: racha.id, slug: racha.slug, ativo: racha.ativo },
  };
}

/** Executa uma contagem com try/catch e fallback numérico. */
async function safeCount<T>(fn: () => Promise<T>, fallback: number): Promise<number> {
  try {
    const n = (await fn()) as unknown as number;
    return typeof n === "number" && Number.isFinite(n) ? n : fallback;
  } catch {
    return fallback;
  }
}

/** Executa um select de forma segura, tipado, sem lançar. */
async function safeGet<T>(fn: () => Promise<T>): Promise<T | undefined> {
  try {
    return await fn();
  } catch {
    return undefined;
  }
}
