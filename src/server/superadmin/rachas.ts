import { prisma } from "@/server/prisma";
import type {
  SuperadminFinanceValores,
  SuperadminRachaHistorico,
  SuperadminRachaResumo,
  SuperadminUsuarioResumo,
} from "@/types/superadmin";

function computeFinance(
  valores: { tipo: string; valor: number | null | undefined }[]
): SuperadminFinanceValores {
  return valores.reduce<SuperadminFinanceValores>(
    (acc, item) => {
      const value = typeof item.valor === "number" ? item.valor : 0;
      if (item.tipo.toLowerCase() === "entrada") {
        acc.entradas += value;
      } else if (item.tipo.toLowerCase() === "saida") {
        acc.saidas += value;
      }
      return acc;
    },
    { entradas: 0, saidas: 0, saldo: 0 }
  );
}

function mapAdmin(usuario: {
  id: string;
  nome: string;
  email: string | null;
  status: string;
  role: string;
  createdAt: Date;
}): SuperadminUsuarioResumo {
  return {
    id: usuario.id,
    nome: usuario.nome,
    email: usuario.email,
    role: usuario.role,
    ativo: usuario.status === "ativo",
    criadoEm: usuario.createdAt.toISOString(),
  };
}

function mapHistorico(item: {
  id: string;
  acao: string;
  detalhes: string | null;
  criadoEm: Date;
}): SuperadminRachaHistorico {
  return {
    id: item.id,
    acao: item.acao,
    detalhes: item.detalhes ?? null,
    data: item.criadoEm.toISOString(),
  };
}

export async function loadSuperadminRachas(): Promise<SuperadminRachaResumo[]> {
  const rachas = await prisma.racha.findMany({
    include: {
      plano: { select: { nome: true } },
      owner: { select: { nome: true, email: true } },
      jogadores: true,
      admins: {
        include: {
          usuario: {
            select: {
              id: true,
              nome: true,
              email: true,
              status: true,
              role: true,
              createdAt: true,
            },
          },
        },
      },
      logs: {
        orderBy: { criadoEm: "desc" },
        take: 6,
      },
      financeiros: {
        select: {
          tipo: true,
          valor: true,
          data: true,
        },
      },
    },
    orderBy: { criadoEm: "desc" },
  });

  return rachas.map((racha) => {
    const financeiroValores = computeFinance(racha.financeiros);
    financeiroValores.saldo = financeiroValores.entradas - financeiroValores.saidas;

    const ultimoLog = racha.logs.at(0);

    const admins: SuperadminUsuarioResumo[] = racha.admins
      .map((admin) => (admin.usuario ? mapAdmin(admin.usuario) : null))
      .filter((item): item is SuperadminUsuarioResumo => Boolean(item));

    const historico: SuperadminRachaHistorico[] = racha.logs.map(mapHistorico);

    return {
      id: racha.id,
      nome: racha.nome,
      slug: racha.slug,
      status: racha.status,
      plano: racha.plano?.nome ?? null,
      presidente: racha.owner?.nome ?? "Nao informado",
      emailPresidente: racha.owner?.email ?? null,
      atletas: racha.jogadores.length,
      criadoEm: racha.criadoEm.toISOString(),
      ultimoAcesso: ultimoLog ? ultimoLog.criadoEm.toISOString() : null,
      bloqueado: racha.status === "BLOQUEADO" || racha.status === "INADIMPLENTE",
      admins,
      historico,
      financeiro: financeiroValores,
    };
  });
}
