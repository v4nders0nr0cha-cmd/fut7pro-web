import { mutate } from "swr";

export const ENTRY_REQUEST_COUNT_URL = "/api/admin/solicitacoes?status=PENDENTE&count=1";
export const MONTHLY_REQUEST_COUNT_URL = "/api/admin/mensalistas/requests?count=1";

export async function revalidateAdminRequestBadges() {
  await mutate(
    (key) =>
      Array.isArray(key) &&
      (key[0] === ENTRY_REQUEST_COUNT_URL || key[0] === MONTHLY_REQUEST_COUNT_URL),
    undefined,
    { revalidate: true }
  );
}
