import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { toCSV } from "@/utils/exportFinanceiroCSV";
import type { FinanceiroExportRow } from "@/utils/exportFinanceiroCSV";

export async function GET() {
  // Buscar todos lançamentos financeiros incluindo plano
  const lancamentos = await prisma.financeiro.findMany({
    include: { racha: { include: { plano: true } }, admin: true },
  });

  // Montar linhas padronizadas
  const rows: FinanceiroExportRow[] = lancamentos.map((l) => ({
    data: l.data.toISOString().slice(0, 10),
    tipo: l.tipo,
    racha: l.racha?.nome || "",
    plano: l.racha?.plano?.nome || "",
    valor: l.valor.toFixed(2).replace(".", ","),
    nomePagador: l.admin?.nome || "",
    cpfCnpj: "-", // Preencha se disponível
    categoria: l.categoria || "",
    descricao: l.descricao || "",
    metodoPgto: "-", // Preencha se disponível
    status: "Pago", // Ou ajuste conforme campo real
    nfe: "-", // Preencha se disponível
  }));

  const csv = toCSV(rows);
  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv",
      "Content-Disposition": "attachment; filename=financeiro_fut7pro.csv",
    },
  });
}
