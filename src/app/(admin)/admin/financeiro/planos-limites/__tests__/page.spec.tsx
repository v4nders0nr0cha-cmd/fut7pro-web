import LegacyBillingPage from "../page";
import { redirect } from "next/navigation";
jest.mock("next/navigation", () => ({ redirect: jest.fn() }));
it("preserva a entrada antiga na visão geral", async () => {
  await LegacyBillingPage({ searchParams: Promise.resolve({ retorno: "pagamento" }) });
  expect(redirect).toHaveBeenLastCalledWith("/admin/assinatura?retorno=pagamento");
});
it("preserva o atalho de faturas e os filtros existentes", async () => {
  await LegacyBillingPage({ searchParams: Promise.resolve({ faturas: "1", status: "paid" }) });
  expect(redirect).toHaveBeenLastCalledWith("/admin/assinatura/pagamentos?status=paid");
});
