import { NextRequest, NextResponse } from "next/server";

const isProd = process.env.NODE_ENV === "production";

// Utilitário local para obter Prisma somente em desenvolvimento
async function getDevPrisma() {
  const g = globalThis as unknown as { prisma?: any };
  if (!g.prisma) {
    const { PrismaClient } = await import("@prisma/client");
    g.prisma = new PrismaClient();
  }
  return g.prisma as any;
}

// GET: /api/estrelas?rachaId=xxxx
export async function GET(req: NextRequest) {
  if (isProd) {
    return NextResponse.json(
      { error: "Endpoint indisponível em produção. Use a API do backend." },
      { status: 501 }
    );
  }
  const { searchParams } = new URL(req.url);
  const rachaId = searchParams.get("rachaId");
  if (!rachaId) {
    return NextResponse.json({ error: "rachaId obrigatório" }, { status: 400 });
  }
  const prisma = await getDevPrisma();
  const estrelas = await prisma.AvaliacaoEstrela.findMany({
    where: { rachaId },
    select: {
      id: true,
      rachaId: true,
      jogadorId: true,
      estrelas: true,
      atualizadoPor: true,
      atualizadoEm: true,
    },
  });
  return NextResponse.json(estrelas);
}

// POST: /api/estrelas
// body: { rachaId: string, jogadorId: string, estrelas: number }
export async function POST(req: NextRequest) {
  if (isProd) {
    return NextResponse.json(
      { error: "Endpoint indisponível em produção. Use a API do backend." },
      { status: 501 }
    );
  }
  // Validação de permissão: apenas admins podem criar estrelas
  // const session = await getServerSession(authOptions);
  // if (!session || !session.user || !isAdminOfRacha(session.user, rachaId)) return NextResponse.json({error: "Não autorizado"}, {status: 403});

  const body = await req.json();
  const { rachaId, jogadorId, estrelas } = body;

  if (!rachaId || !jogadorId || typeof estrelas !== "number") {
    return NextResponse.json({ error: "Dados obrigatórios faltando" }, { status: 400 });
  }
  if (estrelas < 0 || estrelas > 5) {
    return NextResponse.json({ error: "Estrelas deve ser entre 0 e 5" }, { status: 400 });
  }

  const prisma = await getDevPrisma();
  // Upsert: se já existe avaliação desse jogador para o racha, atualiza, senão cria nova
  const result = await prisma.AvaliacaoEstrela.upsert({
    where: {
      rachaId_jogadorId: { rachaId, jogadorId },
    },
    update: {
      estrelas,
      atualizadoEm: new Date(),
      // atualizadoPor: session?.user?.id ?? null, // ID do admin logado será implementado
    },
    create: {
      rachaId,
      jogadorId,
      estrelas,
      atualizadoEm: new Date(),
      // atualizadoPor: session?.user?.id ?? null, // ID do admin logado será implementado
    },
  });

  return NextResponse.json(result);
}
