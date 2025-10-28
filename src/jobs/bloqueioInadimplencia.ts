import { subDays, isBefore } from "date-fns";
import { PRISMA_DISABLED_MESSAGE, isDirectDbBlocked, prisma } from "@/lib/prisma";

// Correto para seu schema: status, criadoEm, financeiros
export async function processarBloqueioRachas() {
  if (isDirectDbBlocked) {
    console.warn(PRISMA_DISABLED_MESSAGE);
    return;
  }

  const hoje = new Date();

  // Busca todos os rachas em status de cobrança
  const rachas = await prisma.racha.findMany({
    where: {
      status: { in: ["ATIVO", "TRIAL", "INADIMPLENTE"] }, // Use enums MAIÚSCULOS
    },
    include: {
      financeiros: true, // pega lançamentos financeiros do racha
    },
  });

  for (const racha of rachas) {
    const { status, criadoEm, financeiros } = racha;

    // 1. Trial vencido E sem pagamento = bloqueia
    if (status === "TRIAL") {
      const diasTrial = 7; // dias do trial
      const fimTrial = subDays(hoje, diasTrial);
      if (isBefore(criadoEm, fimTrial)) {
        const algumPago = financeiros.some(
          (f) => f.tipo === "mensalidade" && f.categoria === "receita" && f.valor > 0
        );
        if (!algumPago) {
          await prisma.racha.update({
            where: { id: racha.id },
            data: { status: "BLOQUEADO" },
          });
          await registrarLogBloqueio(racha.id, "Trial expirou sem pagamento");
        }
      }
    }

    // 2. Mensalidade vencida e não paga = bloqueia
    if (status === "ATIVO" || status === "INADIMPLENTE") {
      // Busca último lançamento financeiro de mensalidade pago
      const pagamentos = financeiros
        .filter((f) => f.tipo === "mensalidade" && f.categoria === "receita" && f.valor > 0)
        .sort((a, b) => (b.data > a.data ? 1 : -1));
      const ultimoPagamento = pagamentos[0];
      const prazoMaxAtraso = 5; // dias de tolerância após vencimento
      // Usa data do último pagamento ou do trial
      const dataReferencia = ultimoPagamento ? ultimoPagamento.data : criadoEm;
      if (isBefore(dataReferencia, subDays(hoje, prazoMaxAtraso))) {
        await prisma.racha.update({
          where: { id: racha.id },
          data: { status: "BLOQUEADO" },
        });
        await registrarLogBloqueio(racha.id, "Pagamento de mensalidade não efetuado");
      }
    }
  }
}

// Registra log na tabela de logs administrativos
async function registrarLogBloqueio(rachaId: string, motivo: string) {
  await prisma.adminLog.create({
    data: {
      rachaId,
      adminId: "SYSTEM", // ou null/campo system, pois é job automático
      acao: "Bloqueio Automático",
      detalhes: motivo,
      criadoEm: new Date(),
    },
  });
}
