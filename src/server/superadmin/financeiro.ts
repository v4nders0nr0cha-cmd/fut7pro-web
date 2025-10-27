import { prisma } from "@/server/prisma";
import type {
  SuperadminCobrancaResumo,
  SuperadminFinancePlanoResumo,
  SuperadminFinanceSerie,
  SuperadminFinanceValores,
  SuperadminFinanceiro,
  SuperadminInadimplenteResumo,
} from "@/types/superadmin";

function safeValue(value: number | null | undefined): number {
  return typeof value === "number" && Number.isFinite(value) ? value : 0;
}

function toMonthKey(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  return `${year}-${month}`;
}

export async function loadSuperadminFinanceiro(): Promise<SuperadminFinanceiro> {
  const [registros, rachas] = await Promise.all([
    prisma.financeiro.findMany({
      select: {
        id: true,
        tipo: true,
        valor: true,
        data: true,
        descricao: true,
        racha: {
          select: {
            id: true,
            nome: true,
            status: true,
            plano: { select: { nome: true } },
            owner: { select: { nome: true } },
          },
        },
      },
      orderBy: { data: "desc" },
      take: 120,
    }),
    prisma.racha.findMany({
      where: { status: { in: ["INADIMPLENTE", "BLOQUEADO"] } },
      select: {
        id: true,
        nome: true,
        status: true,
        plano: { select: { nome: true } },
        owner: { select: { nome: true } },
        criadoEm: true,
      },
    }),
  ]);

  const valores: SuperadminFinanceValores = registros.reduce(
    (acc, item) => {
      const value = safeValue(item.valor);
      if (item.tipo.toLowerCase() === "entrada") {
        acc.entradas += value;
      } else if (item.tipo.toLowerCase() === "saida") {
        acc.saidas += value;
      }
      return acc;
    },
    { entradas: 0, saidas: 0, saldo: 0 }
  );
  valores.saldo = valores.entradas - valores.saidas;

  const planosMap = new Map<string, SuperadminFinancePlanoResumo>();
  const serieMap = new Map<string, number>();
  const cobrancas: SuperadminCobrancaResumo[] = [];

  for (const registro of registros) {
    const planoNome = registro.racha?.plano?.nome ?? "Sem plano";
    if (!planosMap.has(planoNome)) {
      planosMap.set(planoNome, {
        chave: planoNome.toLowerCase().replace(/\s+/g, "-"),
        nome: planoNome,
        receita: 0,
        ativos: 0,
        inadimplentes: 0,
      });
    }
    const plano = planosMap.get(planoNome)!;

    if (registro.tipo.toLowerCase() === "entrada") {
      plano.receita += safeValue(registro.valor);
      plano.ativos += 1;
    } else if (registro.tipo.toLowerCase() === "saida") {
      plano.inadimplentes += 1;
    }

    const dataRegistro = registro.data ?? new Date();
    const monthKey = toMonthKey(dataRegistro);
    serieMap.set(
      monthKey,
      (serieMap.get(monthKey) ?? 0) +
        (registro.tipo.toLowerCase() === "entrada" ? safeValue(registro.valor) : 0)
    );

    cobrancas.push({
      id: registro.id,
      racha: registro.racha?.nome ?? "Racha desconhecido",
      presidente: registro.racha?.owner?.nome ?? "Nao informado",
      plano: registro.racha?.plano?.nome ?? null,
      status: registro.tipo.toLowerCase() === "entrada" ? "Pago" : "Lancamento",
      valor: safeValue(registro.valor),
      vencimento: dataRegistro ? dataRegistro.toISOString() : null,
    });
  }

  const inadimplentes: SuperadminInadimplenteResumo[] = rachas.map((item) => ({
    id: item.id,
    racha: item.nome,
    presidente: item.owner?.nome ?? "Nao informado",
    plano: item.plano?.nome ?? null,
    valor: 0,
    diasAtraso: item.status === "BLOQUEADO" ? 10 : 5,
  }));

  const ultimoMeses: SuperadminFinanceSerie[] = Array.from(serieMap.entries())
    .sort(([a], [b]) => (a < b ? -1 : a > b ? 1 : 0))
    .map(([mes, receita]) => ({ mes, receita }));

  return {
    valores,
    planos: Array.from(planosMap.values()),
    ultimoMeses,
    inadimplentes,
    cobrancas,
  };
}
