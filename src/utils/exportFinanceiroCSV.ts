export type FinanceiroExportRow = {
  data: string;
  tipo: string;
  racha: string;
  plano: string;
  valor: string;
  nomePagador: string;
  cpfCnpj: string;
  categoria: string;
  descricao: string;
  metodoPgto: string;
  status: string;
  nfe: string;
};

export function toCSV(_rows: FinanceiroExportRow[]): string {
  // Remove qualquer undefined (garantia extra)
  const rows: FinanceiroExportRow[] = _rows.filter(Boolean);
  if (!rows.length) return "";

  // Cast explícito resolve qualquer dúvida do TS
  const header = Object.keys(rows[0] as FinanceiroExportRow).join(";");
  const lines = rows.map((row) =>
    Object.values(row as Record<string, string>).join(";"),
  );
  return [header, ...lines].join("\n");
}
