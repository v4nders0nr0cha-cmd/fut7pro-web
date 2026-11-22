import { act, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { CentralProvider, useCentral } from "../CentralProvider";
import OverviewPanel from "../OverviewPanel";
import FinancialDialogs from "../FinancialDialogs";
import PaymentsPanel from "../PaymentsPanel";
import BenefitsPanel from "../BenefitsPanel";
import PlansPanel from "../PlansPanel";
import useSubscription from "@/hooks/useSubscription";
import BillingAPI from "@/lib/api/billing";
import { centralRequest, historyRequest } from "@/lib/api/subscription-central";
jest.mock("@/hooks/useSubscription");
jest.mock("@/lib/api/subscription-central", () => ({
  centralRequest: jest.fn(),
  historyRequest: jest.fn(),
}));
jest.mock("next-auth/react", () => ({
  useSession: () => ({ data: { user: { email: principalEmail, name: "Admin" } } }),
}));
jest.mock("@/components/ui/feedback/Fut7DialogBase", () => ({
  __esModule: true,
  default: ({ open, title, children, onClose }: any) =>
    open ? (
      <div role="dialog" aria-label={title}>
        <button onClick={onClose}>Fechar</button>
        {children}
      </div>
    ) : null,
}));
let principalEmail = "admin@fixture.invalid";
let group = "a",
  search = "";
const replace = jest.fn();
jest.mock("next/navigation", () => ({
  useSearchParams: () => new URLSearchParams(search),
  useRouter: () => ({ replace }),
  usePathname: () => "/admin/assinatura",
}));
jest.mock("@/context/RachaContext", () => ({
  useRacha: () => ({ rachaId: group, tenantSlug: group }),
}));
jest.mock("@/lib/api/billing", () => ({
  __esModule: true,
  ...jest.requireActual("@/lib/api/billing"),
  default: {
    activateSubscription: jest.fn(),
    createPixCharge: jest.fn(),
    applyCouponToSubscription: jest.fn(),
    cancelSubscription: jest.fn(),
    changeSubscriptionPlan: jest.fn(),
    createSubscription: jest.fn(),
    startEnterpriseMonthly: jest.fn(),
  },
}));
const caps = {
  canViewHistory: true,
  canPay: true,
  canUseRecurring: true,
  canUsePix: true,
  canCreateSubscription: false,
  canStartEnterprise: false,
  canChangePlan: true,
  canApplyCoupon: true,
  canCancel: true,
  changePlanRequiresSupport: false,
  operationPending: false,
};
const access = {
  canAccess: false,
  blocked: true,
  source: "SUBSCRIPTION",
  accessStatus: "EXPIRADO",
  effectiveAccessUntil: "2099-01-01T00:00:00Z",
};
let hookError: string | null = null;
let loading = false;
let historyAllowed = true;
function hook() {
  return {
    subscription: loading
      ? null
      : {
          id: `sub-${group}`,
          tenantId: group,
          planKey: "monthly_essential",
          status: "active",
          interval: "month",
          amount: 15000,
        },
    subscriptionLoading: loading,
    subscriptionResolved: !loading,
    subscriptionError: hookError,
    subscriptionStatus: { access, financialStatus: { code: "PENDENTE", label: "Pendente" } },
    plans: [
      {
        key: "monthly_essential",
        label: "Essencial",
        amount: 150,
        interval: "month",
        features: ["Gestão do grupo"],
      },
    ],
    plansLoading: false,
    plansError: null,
    planMeta: {},
    refreshSubscription: jest.fn(),
    refreshPlans: jest.fn(),
  };
}
function Harness({ children }: { children: React.ReactNode }) {
  return (
    <CentralProvider>
      {children}
      <DialogMount />
    </CentralProvider>
  );
}
function DialogMount() {
  const c = useCentral();
  return <FinancialDialogs key={c.scope} />;
}
beforeEach(() => {
  principalEmail = "admin@fixture.invalid";
  jest.clearAllMocks();
  group = "a";
  search = "";
  hookError = null;
  loading = false;
  historyAllowed = true;
  (useSubscription as jest.Mock).mockImplementation(hook);
  (centralRequest as jest.Mock).mockImplementation(async () => ({
    tenantId: group,
    subscriptionId: `sub-${group}`,
    capabilities: { ...caps, canViewHistory: historyAllowed },
  }));
  (historyRequest as jest.Mock).mockImplementation(async (id, area) =>
    area === "overview"
      ? {
          subscription: {
            id,
            tenantId: group,
            status: "active",
            amountCents: 15000,
            createdAt: "2026-01-01T00:00:00Z",
          },
          access,
          financialStatus: { label: "Pendente", code: "PENDENTE" },
          invoices: { pending: 1, confirmed: 0 },
          historyAvailable: historyAllowed,
        }
      : {
          items: [],
          page: { limit: 10, hasMore: false, nextCursor: null },
          initialTrial: { evidence: "UNAVAILABLE", originalDays: null },
          currentCouponTerms: null,
        }
  );
});
it("não autoriza acesso por uma data futura e bloqueia ações durante o carregamento", async () => {
  loading = true;
  const view = render(
    <Harness>
      <OverviewPanel />
    </Harness>
  );
  expect(screen.getByRole("status", { name: /Consultando informações/ })).toBeInTheDocument();
  expect(
    screen.queryByText("Este grupo ainda não tem uma assinatura registrada.")
  ).not.toBeInTheDocument();
  loading = false;
  view.rerender(
    <Harness>
      <OverviewPanel />
    </Harness>
  );
  expect(await screen.findByText("Acesso bloqueado")).toBeInTheDocument();
  expect(screen.queryByText("Ativo", { exact: true })).not.toBeInTheDocument();
});
it("preserva o plano quando a confirmação falha e não permite pagar", async () => {
  hookError = "Falha de status";
  render(
    <Harness>
      <OverviewPanel />
    </Harness>
  );
  expect(await screen.findByText("Essencial")).toBeInTheDocument();
  const button = await screen.findByRole("button", { name: "Regularizar pagamento" });
  expect(button).toBeDisabled();
  fireEvent.click(button);
  expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
});
it("impede cobrança duplicada e descarta PIX atrasado após A → B → A", async () => {
  let finish!: (value: unknown) => void;
  (BillingAPI.createPixCharge as jest.Mock).mockReturnValue(
    new Promise((resolve) => {
      finish = resolve;
    })
  );
  const view = render(
    <Harness>
      <OverviewPanel />
    </Harness>
  );
  const button = await screen.findByRole("button", { name: "Regularizar pagamento" });
  await waitFor(() => expect(button).toBeEnabled());
  fireEvent.click(button);
  const pix = screen.getByRole("button", { name: "Gerar PIX" });
  fireEvent.click(pix);
  fireEvent.click(pix);
  expect(BillingAPI.createPixCharge).toHaveBeenCalledTimes(1);
  group = "b";
  view.rerender(
    <Harness>
      <OverviewPanel />
    </Harness>
  );
  expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  group = "a";
  view.rerender(
    <Harness>
      <OverviewPanel />
    </Harness>
  );
  await act(async () =>
    finish({ pix: { qrCode: "PRIVATE-OLD-PIX" }, invoice: { id: "old", amount: 15000 } })
  );
  expect(screen.queryByDisplayValue("PRIVATE-OLD-PIX")).not.toBeInTheDocument();
  expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
});
it("não solicita históricos para o Diretor de Futebol", async () => {
  historyAllowed = false;
  render(
    <Harness>
      <BenefitsPanel />
      <PaymentsPanel />
    </Harness>
  );
  expect((await screen.findAllByText(/histórico detalhado está disponível/)).length).toBe(2);
  expect(
    (historyRequest as jest.Mock).mock.calls.some((call) =>
      ["benefits", "invoices"].includes(call[1])
    )
  ).toBe(false);
});
it("mantém desconhecidos os valores antigos e separa devolução parcial do bruto pago", async () => {
  search = "cobranca=invoice-a";
  (historyRequest as jest.Mock).mockImplementation(async (id, area) =>
    area === "overview"
      ? { subscription: { id, tenantId: group }, access }
      : area.startsWith("invoices/")
        ? {
            id: "invoice-a",
            status: "paid",
            type: "RECURRING",
            createdAt: "2026-01-01T00:00:00Z",
            chargedAmountCents: 15000,
            paidAmountCents: 15000,
            refundedAmountCents: 2500,
            confirmedDiscountAmountCents: null,
            currency: "BRL",
            paymentConfirmedAt: "2026-01-01T00:00:00Z",
            commercialSnapshot: null,
            historicalTermsAvailable: false,
          }
        : { items: [], page: { hasMore: false, nextCursor: null, limit: 10 } }
  );
  render(
    <Harness>
      <PaymentsPanel />
    </Harness>
  );
  expect(await screen.findByText("Devolução parcial")).toBeInTheDocument();
  expect(screen.getByText("R$ 25,00")).toBeInTheDocument();
  expect(screen.getAllByText("R$ 150,00")).toHaveLength(2);
  expect(screen.getByText(/Nenhum comprovante foi disponibilizado/)).toBeInTheDocument();
  expect(
    screen.getByText(/condições comerciais originais.*não estão disponíveis/)
  ).toBeInTheDocument();
});
it("não calcula descontos de plano no frontend e respeita capacidades de troca", async () => {
  (centralRequest as jest.Mock).mockImplementation(async () => ({
    tenantId: group,
    subscriptionId: `sub-${group}`,
    capabilities: { ...caps, canChangePlan: false, changePlanRequiresSupport: true },
  }));
  (useSubscription as jest.Mock).mockImplementation(() => ({
    ...hook(),
    plans: [
      { key: "monthly_other", label: "Outro plano", amount: 207, interval: "month", features: [] },
    ],
  }));
  render(
    <Harness>
      <PlansPanel />
    </Harness>
  );
  expect(await screen.findByText("R$ 207,00")).toBeInTheDocument();
  expect(screen.getByRole("button", { name: /Troca indisponível/ })).toBeDisabled();
});

it("não apresenta cancelamento concluído quando o provedor falha", async () => {
  (BillingAPI.cancelSubscription as jest.Mock).mockRejectedValue(new Error("timeout"));
  render(
    <Harness>
      <OverviewPanel />
    </Harness>
  );
  const cancel = await screen.findByRole("button", { name: "Solicitar cancelamento" });
  await waitFor(() => expect(cancel).toBeEnabled());
  fireEvent.click(cancel);
  fireEvent.click(screen.getByRole("button", { name: "Confirmar cancelamento" }));
  expect(await screen.findByText(/Não foi possível confirmar a operação/)).toBeInTheDocument();
  expect(screen.getByRole("dialog")).toBeInTheDocument();
  expect(screen.queryByText(/Cancelamento confirmado/)).not.toBeInTheDocument();
});

it("descarta o diálogo e os dados privados ao mudar a conta no mesmo grupo", async () => {
  const view = render(
    <Harness>
      <OverviewPanel />
      <BenefitsPanel />
    </Harness>
  );
  const button = await screen.findByRole("button", { name: "Regularizar pagamento" });
  await waitFor(() => expect(button).toBeEnabled());
  fireEvent.click(button);
  expect(screen.getByRole("dialog")).toBeInTheDocument();
  principalEmail = "futebol@fixture.invalid";
  historyAllowed = false;
  view.rerender(
    <Harness>
      <OverviewPanel />
      <BenefitsPanel />
    </Harness>
  );
  expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  expect(await screen.findByText(/histórico detalhado está disponível/)).toBeInTheDocument();
});
