import type { CategoriaFinanceiro } from "@/types/financeiro";

export const FINANCE_CATEGORIES: { value: CategoriaFinanceiro | string; label: string }[] = [
  { value: "diaria", label: "Diária" },
  { value: "mensalidade", label: "Mensalidade" },
  { value: "patrocinio", label: "Patrocínio" },
  { value: "evento", label: "Evento" },
  { value: "campo", label: "Campo" },
  { value: "uniforme", label: "Uniforme" },
  { value: "arbitragem", label: "Arbitragem" },
  { value: "despesa", label: "Despesa" },
  { value: "despesa_adm", label: "Despesa Administrativa" },
  { value: "sistema", label: "Sistema" },
  { value: "multa", label: "Multa" },
  { value: "outros", label: "Outros" },
];

export const DEFAULT_FORMATTER = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL",
  maximumFractionDigits: 2,
});
