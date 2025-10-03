import { prisma } from "@/server/prisma";
import type { SuperadminNotification } from "@/types/superadmin";

export async function loadSuperadminNotifications(): Promise<SuperadminNotification[]> {
  const logs = await prisma.adminLog.findMany({
    select: {
      id: true,
      acao: true,
      detalhes: true,
      criadoEm: true,
      racha: { select: { nome: true } },
      admin: { select: { nome: true } },
    },
    orderBy: { criadoEm: "desc" },
    take: 80,
  });

  return logs.map((log) => ({
    id: log.id,
    titulo: log.acao,
    mensagem: log.detalhes ?? "Sem detalhes adicionais",
    status: "enviado",
    destino: log.racha?.nome ?? "Todos",
    tipo: "Registro automatico",
    enviadoPor: log.admin?.nome ?? "Sistema",
    criadoEm: log.criadoEm.toISOString(),
  }));
}
