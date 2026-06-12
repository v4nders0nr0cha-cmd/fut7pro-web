export function formatBillingPlanLabel(planKey?: string | null, fallback = "não identificado") {
  const key = (planKey || "").trim().toLowerCase();
  if (!key) return fallback;

  if (key.includes("free") || key.includes("gratuito")) return "Grátis";

  const isYearly = key.includes("year") || key.includes("anual");
  const isMonthly = key.includes("month") || key.includes("mensal");
  const intervalPrefix = isYearly ? "Anual" : isMonthly ? "Mensal" : "";

  if (key.includes("enterprise")) {
    return intervalPrefix ? `${intervalPrefix} Enterprise` : "Enterprise";
  }
  if (key.includes("marketing")) {
    if (isYearly) return "Essencial + Marketing anual";
    if (isMonthly) return "Essencial + Marketing";
    return "Marketing";
  }
  if (key.includes("essential") || key.includes("essencial") || key.includes("pro")) {
    if (isYearly) return "Essencial Anual";
    if (isMonthly) return "Essencial Mensal";
    return "Essencial";
  }

  return fallback;
}
