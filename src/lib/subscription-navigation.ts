export const SUBSCRIPTION_HOME = "/admin/assinatura";
export function isSubscriptionRoute(path: string) {
  return (
    path === SUBSCRIPTION_HOME ||
    path.startsWith(`${SUBSCRIPTION_HOME}/`) ||
    path.startsWith("/admin/financeiro/planos-limites")
  );
}
export function legacySubscriptionDestination(
  values: Record<string, string | string[] | undefined>
) {
  const params = new URLSearchParams();
  Object.entries(values).forEach(([key, value]) => {
    if (key !== "faturas" && typeof value === "string") params.set(key, value);
  });
  const target = values.faturas === "1" ? `${SUBSCRIPTION_HOME}/pagamentos` : SUBSCRIPTION_HOME;
  return `${target}${params.size ? `?${params}` : ""}`;
}
