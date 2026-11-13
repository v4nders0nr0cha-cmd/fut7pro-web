import { act, fireEvent, render, screen, waitFor } from "@testing-library/react";
import PlanosLimitesPage from "../page";
import useSubscription from "@/hooks/useSubscription";
import BillingAPI from "@/lib/api/billing";

jest.mock("next-auth/react", () => ({ useSession: () => ({ data: { user: { name: "Admin", email: "admin@example.com" } } }) }));
let activeGroup = "grupo-a";
jest.mock("@/context/RachaContext", () => ({ useRacha: () => ({ rachaId: activeGroup }) }));
jest.mock("@/hooks/useSubscription");
jest.mock("@/lib/api/billing", () => ({
  __esModule: true,
  default: { activateSubscription: jest.fn(), createPixCharge: jest.fn() },
}));

const mockedHook = useSubscription as jest.Mock;
const api = BillingAPI as jest.Mocked<typeof BillingAPI>;
const base = {
  subscription: null,
  plans: [],
  planMeta: null,
  subscriptionStatus: null,
  loading: true,
  subscriptionLoading: true,
  plansLoading: false,
  subscriptionResolved: false,
  subscriptionError: null,
  plansError: null,
  error: null,
  errorTitle: null,
  errorStatus: null,
  refreshSubscription: jest.fn(),
  refreshPlans: jest.fn(),
};

beforeEach(() => {
  jest.clearAllMocks();
  activeGroup = "grupo-a";
  mockedHook.mockReturnValue(base);
});

it("não apresenta PIX de um grupo depois da troca de contexto", async () => {
  let finish!: (value: unknown) => void;
  api.createPixCharge.mockReturnValue(new Promise((resolve) => { finish = resolve; }) as any);
  const ready = {
    ...base,
    loading: false,
    subscriptionLoading: false,
    subscriptionResolved: true,
    subscription: { id: "sub-a", tenantId: "grupo-a", planKey: "monthly_essential", status: "active", requiresUpfront: false },
    subscriptionStatus: { active: true },
  };
  mockedHook.mockReturnValue(ready);
  const view = render(<PlanosLimitesPage />);
  fireEvent.click(screen.getByRole("button", { name: "Atualizar pagamento" }));
  fireEvent.click(screen.getByRole("button", { name: "Gerar PIX" }));
  activeGroup = "grupo-b";
  mockedHook.mockReturnValue({ ...ready, subscription: { ...ready.subscription, id: "sub-b", tenantId: "grupo-b" } });
  view.rerender(<PlanosLimitesPage />);
  await act(async () => {
    finish({
      pix: { qrCode: "pix-do-grupo-a" },
      invoice: { id: "invoice-a", amount: 15000, periodStart: null, periodEnd: null },
    });
  });
  expect(screen.queryByText("pix-do-grupo-a")).not.toBeInTheDocument();
  expect(screen.queryByRole("button", { name: "Copiar código PIX" })).not.toBeInTheDocument();
});

it("não libera atualização de pagamento enquanto a assinatura está pendente", () => {
  render(<PlanosLimitesPage />);
  expect(screen.queryByRole("button", { name: "Atualizar pagamento" })).not.toBeInTheDocument();
  expect(screen.queryByText("Assinatura não encontrada para este grupo.")).not.toBeInTheDocument();
});

it("não confunde resposta vazia confirmada com falha", () => {
  mockedHook.mockReturnValue({ ...base, loading: false, subscriptionLoading: false, subscriptionResolved: true });
  render(<PlanosLimitesPage />);
  expect(screen.getByTestId("billing-planos-sync-state")).toBeInTheDocument();
  expect(screen.queryByRole("button", { name: "Atualizar pagamento" })).not.toBeInTheDocument();
});

it("permite apenas uma criação de cobrança por cliques repetidos", async () => {
  let finish!: (value: unknown) => void;
  api.createPixCharge.mockReturnValue(new Promise((resolve) => { finish = resolve; }) as any);
  mockedHook.mockReturnValue({
    ...base,
    loading: false,
    subscriptionLoading: false,
    subscriptionResolved: true,
    subscription: { id: "sub-a", tenantId: "grupo-a", planKey: "monthly_essential", status: "active", requiresUpfront: false },
    subscriptionStatus: { active: true },
  });
  render(<PlanosLimitesPage />);
  fireEvent.click(screen.getByRole("button", { name: "Atualizar pagamento" }));
  const pix = screen.getByRole("button", { name: "Gerar PIX" });
  fireEvent.click(pix);
  fireEvent.click(pix);
  expect(api.createPixCharge).toHaveBeenCalledTimes(1);
  finish({
    pix: { qrCode: "pix-code" },
    invoice: { id: "invoice-a", amount: 15000, periodStart: null, periodEnd: null },
  });
  await waitFor(() => expect(screen.queryByRole("button", { name: "Gerar PIX" })).not.toBeInTheDocument());
});
