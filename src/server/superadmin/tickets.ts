import { prisma } from '@/server/prisma';
import type { SuperadminTicketResumo, SuperadminTicketsSnapshot } from '@/types/superadmin';

function mapTicket(ticket: {
  id: string;
  assunto: string;
  status: string;
  criadoEm: Date;
  racha: { nome: string } | null;
  usuario: { nome: string } | null;
}): SuperadminTicketResumo {
  return {
    id: ticket.id,
    assunto: ticket.assunto,
    status: ticket.status,
    criadoEm: ticket.criadoEm.toISOString(),
    racha: ticket.racha?.nome ?? null,
    responsavel: ticket.usuario?.nome ?? null,
  };
}

export async function loadSuperadminTickets(): Promise<SuperadminTicketsSnapshot> {
  const tickets = await prisma.ticket.findMany({
    select: {
      id: true,
      assunto: true,
      status: true,
      criadoEm: true,
      racha: { select: { nome: true } },
      usuario: { select: { nome: true } },
    },
    orderBy: { criadoEm: 'desc' },
    take: 80,
  });

  const itens: SuperadminTicketResumo[] = tickets.map(mapTicket);
  const total = itens.length;
  let abertos = 0;
  let emAndamento = 0;
  let resolvidos = 0;

  for (const ticket of itens) {
    const status = ticket.status.toLowerCase();
    if (status === 'aberto' || status === 'pendente') {
      abertos += 1;
    } else if (status === 'em_andamento' || status === 'andamento') {
      emAndamento += 1;
    } else if (status === 'resolvido' || status === 'fechado') {
      resolvidos += 1;
    }
  }

  return {
    total,
    abertos,
    emAndamento,
    resolvidos,
    itens,
  };
}
