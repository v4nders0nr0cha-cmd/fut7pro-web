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
  reconcileInvoice: jest.fn(),
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
    validateCoupon: jest.fn(),
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
          pricingPreview: {
            totalCents: 15000,
            baseAmountCents: 15000,
            discountCents: 0,
            discountPct: 0,
            isFirstPayment: true,
            firstPaymentDiscountApplied: false,
          },
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
it("explica cortesia confirmada e não transforma três PIX expirados em dívida", async () => {
  const officialAccess = {
    ...access,
    canAccess: true,
    blocked: false,
    source: "COMPENSATION",
    compensationActive: true,
    effectiveAccessUntil: "2026-12-15T10:41:18Z",
  };
  (useSubscription as jest.Mock).mockImplementation(() => ({
    ...hook(),
    subscriptionStatus: {
      access: officialAccess,
      financialStatus: { code: "VENCIDO", label: "Pagamento vencido" },
    },
  }));
  (historyRequest as jest.Mock).mockResolvedValue({
    subscription: {
      id: "sub-a",
      tenantId: "a",
      status: "past_due",
      amountCents: 15000,
      createdAt: "2026-01-01",
      periodIsProspective: true,
      currentPeriodEnd: "2027-01-15",
    },
    access: officialAccess,
    activeAccessBenefit: {
      source: "ADMIN_ADJUSTMENT",
      days: 90,
      reasonCategory: "COMMERCIAL_COURTESY",
      customerReason: "Cortesia",
      newAccessUntil: "2026-12-15T10:41:18Z",
    },
    invoices: {
      pending: 0,
      confirmed: 0,
      pixAttempts: 3,
      pixExpired: 3,
      pixCanceled: 0,
      overdueConfirmed: 0,
      attemptsAreNotDebt: true,
      assessmentComplete: true,
    },
  });
  render(
    <Harness>
      <OverviewPanel />
    </Harness>
  );
  expect(await screen.findByText("Você está usando o Fut7Pro grátis!")).toBeInTheDocument();
  expect(screen.getByText(/mais 90 dias de acesso/)).toBeInTheDocument();
  expect(screen.getByText("3 tentativas PIX registradas")).toBeInTheDocument();
  expect(screen.getByText(/não comprovam, por si só, mensalidades em dívida/)).toBeInTheDocument();
  expect(screen.queryByText("Pagamento vencido")).not.toBeInTheDocument();
  expect(screen.queryByRole("button", { name: "Regularizar pagamento" })).not.toBeInTheDocument();
  expect(screen.getByRole("button", { name: "Ver opções de pagamento" })).toBeEnabled();
});

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
it("não sugere dívida no teste gratuito e remove atalhos redundantes", async () => {
  (useSubscription as jest.Mock).mockImplementation(() => ({
    ...hook(),
    subscriptionStatus: { access, financialStatus: { code: "TESTE", label: "Em teste" } },
  }));
  render(
    <Harness>
      <OverviewPanel />
    </Harness>
  );
  await waitFor(() =>
    expect(screen.getByRole("button", { name: "Configurar pagamento" })).toBeEnabled()
  );
  expect(screen.queryByRole("link", { name: "Consultar benefícios" })).not.toBeInTheDocument();
  expect(screen.queryByRole("link", { name: "Ver planos disponíveis" })).not.toBeInTheDocument();
  expect(screen.queryByRole("link", { name: "Consultar cobranças" })).not.toBeInTheDocument();
});
it("mantém o resumo parcial quando a contagem de cobranças não está disponível", async () => {
  (historyRequest as jest.Mock).mockImplementation(async (id: string) => ({
    subscription: { id, tenantId: group, status: "active" },
    access,
    financialStatus: { code: "PENDENTE", label: "Pendente" },
  }));
  render(
    <Harness>
      <OverviewPanel />
    </Harness>
  );
  await waitFor(() =>
    expect(screen.getByRole("button", { name: "Opções de pagamento" })).toBeEnabled()
  );
  expect(screen.getByText("Situação dos pagamentos")).toBeInTheDocument();
  expect(screen.queryByRole("button", { name: "Regularizar pagamento" })).not.toBeInTheDocument();
});
it("valida cupom inválido sem conceder benefício nem fechar o pagamento", async () => {
  (BillingAPI.validateCoupon as jest.Mock).mockResolvedValue({ valid: false });
  render(
    <Harness>
      <OverviewPanel />
    </Harness>
  );
  const payment = await screen.findByRole("button", { name: "Pagar cobrança" });
  await waitFor(() => expect(payment).toBeEnabled());
  fireEvent.click(payment);
  fireEvent.click(screen.getByText("Tem um cupom de desconto?"));
  fireEvent.change(screen.getByLabelText("Código do cupom"), { target: { value: "INVALIDO" } });
  fireEvent.click(screen.getByRole("button", { name: "Aplicar cupom" }));
  expect(await screen.findByText(/Este cupom não está disponível/)).toBeInTheDocument();
  expect(BillingAPI.validateCoupon).toHaveBeenCalledWith("INVALIDO", "monthly_essential");
  expect(BillingAPI.applyCouponToSubscription).not.toHaveBeenCalled();
  expect(screen.getByRole("dialog")).toBeInTheDocument();
});
it("bloqueia preços anteriores depois de aplicar cupom e renova o consentimento", async () => {
  (BillingAPI.validateCoupon as jest.Mock).mockResolvedValue({ valid: true, extraTrialDays: 5 });
  (BillingAPI.applyCouponToSubscription as jest.Mock).mockResolvedValue({
    ...hook().subscription,
    couponCode: "VALIDO",
  });
  render(
    <Harness>
      <OverviewPanel />
    </Harness>
  );
  const payment = await screen.findByRole("button", { name: "Pagar cobrança" });
  await waitFor(() => expect(payment).toBeEnabled());
  fireEvent.click(payment);
  fireEvent.click(screen.getByRole("button", { name: /Ver formas de pagamento/ }));
  fireEvent.click(screen.getByRole("checkbox"));
  fireEvent.click(screen.getByText("Tem um cupom de desconto?"));
  fireEvent.change(screen.getByLabelText("Código do cupom"), { target: { value: "VALIDO" } });
  fireEvent.click(screen.getByRole("button", { name: "Aplicar cupom" }));
  expect(await screen.findByText(/Cupom aplicado à assinatura. O resumo/)).toBeInTheDocument();
  expect(screen.getByRole("checkbox")).not.toBeChecked();
  expect(screen.getByRole("button", { name: /Pagar com PIX/ })).toBeDisabled();
  expect(screen.getByRole("button", { name: "Confirmar e ir ao Mercado Pago" })).toBeDisabled();
  expect(BillingAPI.applyCouponToSubscription).toHaveBeenCalledWith("sub-a", "VALIDO");
});
it.each(["authorized", "cancelled", "pending"])(
  "usa a periodicidade e o vínculo oficiais no modal (%s)",
  async (preapproval) => {
    (useSubscription as jest.Mock).mockImplementation(() => ({
      ...hook(),
      subscription: {
        ...hook().subscription,
        interval: undefined,
        planKey: "yearly_essential",
        mpPreapprovalId: "fixture-recurring",
      },
      subscriptionStatus: { ...hook().subscriptionStatus, preapproval },
      plans: [{ ...hook().plans[0], key: "yearly_essential", interval: "year" }],
    }));
    render(
      <Harness>
        <OverviewPanel />
      </Harness>
    );
    const payment = await screen.findByRole("button", { name: "Pagar cobrança" });
    await waitFor(() => expect(payment).toBeEnabled());
    fireEvent.click(payment);
    expect(screen.getByText(/um ano de cada vez. No ano seguinte/)).toBeVisible();
    if (preapproval === "authorized")
      expect(screen.getByText(/Você já tem uma assinatura automática/)).toBeVisible();
    else if (preapproval === "pending")
      expect(screen.getByText(/Há uma assinatura vinculada/)).toBeVisible();
    else expect(screen.queryByText(/não cancela essa assinatura/)).not.toBeInTheDocument();
    expect(BillingAPI.activateSubscription).not.toHaveBeenCalled();
    expect(BillingAPI.cancelSubscription).not.toHaveBeenCalled();
  }
);
it("não mostra código PIX quando a cobrança diverge do resumo", async () => {
  (BillingAPI.createPixCharge as jest.Mock).mockResolvedValue({
    invoice: { amount: 9900 },
    pix: { qrCode: "PRIVATE-PRICE-MISMATCH" },
  });
  render(
    <Harness>
      <OverviewPanel />
    </Harness>
  );
  const payment = await screen.findByRole("button", { name: "Pagar cobrança" });
  await waitFor(() => expect(payment).toBeEnabled());
  fireEvent.click(payment);
  expect(screen.getByRole("dialog").parentElement).toBe(document.body);
  fireEvent.click(screen.getByRole("button", { name: /Pagar com PIX/ }));
  expect(await screen.findByText(/O valor da cobrança PIX difere/)).toBeInTheDocument();
  expect(screen.queryByDisplayValue("PRIVATE-PRICE-MISMATCH")).not.toBeInTheDocument();
  expect(BillingAPI.createPixCharge).toHaveBeenCalledTimes(1);
});
it("não aplica o cupom se o grupo mudar durante sua validação", async () => {
  let finish!: (value: unknown) => void;
  (BillingAPI.validateCoupon as jest.Mock).mockImplementation(
    () =>
      new Promise((resolve) => {
        finish = resolve;
      })
  );
  const view = render(
    <Harness>
      <OverviewPanel />
    </Harness>
  );
  const payment = await screen.findByRole("button", { name: "Pagar cobrança" });
  await waitFor(() => expect(payment).toBeEnabled());
  fireEvent.click(payment);
  fireEvent.click(screen.getByText("Tem um cupom de desconto?"));
  fireEvent.change(screen.getByLabelText("Código do cupom"), { target: { value: "VALIDO" } });
  fireEvent.click(screen.getByRole("button", { name: "Aplicar cupom" }));
  group = "b";
  view.rerender(
    <Harness>
      <OverviewPanel />
    </Harness>
  );
  await act(async () => {
    finish({ valid: true });
  });
  expect(BillingAPI.applyCouponToSubscription).not.toHaveBeenCalled();
  expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
});
it("abre a comparação na periodicidade do plano anual confirmado após carregar", async () => {
  let annual = false;
  (useSubscription as jest.Mock).mockImplementation(() => ({
    ...hook(),
    subscription: annual
      ? { ...hook().subscription, planKey: "yearly_essential", interval: "year" }
      : null,
  }));
  const view = render(
    <Harness>
      <PlansPanel />
    </Harness>
  );
  annual = true;
  view.rerender(
    <Harness>
      <PlansPanel />
    </Harness>
  );
  expect(screen.getByRole("button", { name: "Anual" })).toHaveAttribute("aria-pressed", "true");
  fireEvent.click(screen.getByRole("button", { name: "Mensal" }));
  expect(screen.getByRole("button", { name: "Mensal" })).toHaveAttribute("aria-pressed", "true");
  await act(async () => undefined);
});
it("preserva o link de autorização devolvido na contratação Enterprise", async () => {
  (useSubscription as jest.Mock).mockImplementation(() => ({ ...hook(), subscription: null }));
  (centralRequest as jest.Mock).mockResolvedValue({
    tenantId: group,
    subscriptionId: null,
    capabilities: { ...caps, canCreateSubscription: true, canStartEnterprise: true },
  });
  (BillingAPI.startEnterpriseMonthly as jest.Mock).mockResolvedValue({
    preapproval: { url: "https://www.mercadopago.com.br/checkout-demo" },
    pix: { qrCode: "demo" },
    upfrontInvoice: { amount: 15000 },
  });
  function Trigger() {
    const c = useCentral();
    return (
      <button
        disabled={!c.ready}
        onClick={() =>
          c.openDialog("create", {
            key: "monthly_enterprise",
            label: "Enterprise",
            interval: "month",
            amount: 150,
            requiresUpfront: true,
          } as any)
        }
      >
        Contratar demonstração
      </button>
    );
  }
  render(
    <Harness>
      <Trigger />
    </Harness>
  );
  const trigger = screen.getByRole("button", { name: "Contratar demonstração" });
  await waitFor(() => expect(trigger).toBeEnabled());
  fireEvent.click(trigger);
  fireEvent.click(screen.getByRole("button", { name: "Confirmar escolha" }));
  const link = await screen.findByRole("link", { name: "Autorizar recorrência no Mercado Pago" });
  expect(link).toHaveAttribute("href", "https://www.mercadopago.com.br/checkout-demo");
  expect(BillingAPI.startEnterpriseMonthly).toHaveBeenCalledTimes(1);
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
  const button = await screen.findByRole("button", { name: "Pagar cobrança" });
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
  const button = await screen.findByRole("button", { name: "Pagar cobrança" });
  await waitFor(() => expect(button).toBeEnabled());
  fireEvent.click(button);
  const pix = screen.getByRole("button", { name: "Pagar com PIX" });
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
it("impede uso de PIX com prazo encerrado sem cancelar ou criar outra cobrança", async () => {
  (BillingAPI.createPixCharge as jest.Mock).mockResolvedValue({
    pix: {
      qrCode: "DEMO-EXPIRADO",
      qrCodeBase64: "AA",
      ticketUrl: "https://www.mercadopago.com.br/demo",
      expiresAt: "2000-01-01T12:00:00Z",
    },
    invoice: { amount: 15000 },
  });
  render(
    <Harness>
      <OverviewPanel />
    </Harness>
  );
  const payment = await screen.findByRole("button", { name: "Pagar cobrança" });
  await waitFor(() => expect(payment).toBeEnabled());
  fireEvent.click(payment);
  fireEvent.click(screen.getByRole("button", { name: "Pagar com PIX" }));
  expect(await screen.findByText(/O prazo informado para este PIX terminou/)).toBeInTheDocument();
  expect(screen.getByRole("button", { name: "Copiar código PIX" })).toBeDisabled();
  expect(screen.getByLabelText("Código PIX copia e cola")).toBeDisabled();
  expect(screen.queryByRole("link", { name: "Abrir pagamento" })).not.toBeInTheDocument();
  expect(screen.queryByAltText("QR Code para pagamento da assinatura")).not.toBeInTheDocument();
  expect(BillingAPI.createPixCharge).toHaveBeenCalledTimes(1);
  expect(BillingAPI.cancelSubscription).not.toHaveBeenCalled();
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
  const button = await screen.findByRole("button", { name: "Pagar cobrança" });
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

it("distingue falha de consulta de ausência de cobranças e permite tentar novamente", async () => {
  let failed = true;
  (historyRequest as jest.Mock).mockImplementation(async (id, area) => {
    if (area === "overview") return { subscription: { id, tenantId: group }, access };
    if (failed) throw new Error("timeout");
    return { items: [], page: { hasMore: false, nextCursor: null, limit: 10 } };
  });
  render(
    <Harness>
      <PaymentsPanel />
    </Harness>
  );
  expect(
    await screen.findByText(/Não foi possível carregar estas informações/)
  ).toBeInTheDocument();
  expect(screen.queryByText(/Nenhuma cobrança encontrada/)).not.toBeInTheDocument();
  failed = false;
  fireEvent.click(screen.getByRole("button", { name: "Tentar novamente" }));
  expect(await screen.findByText(/Nenhuma cobrança encontrada/)).toBeInTheDocument();
});
