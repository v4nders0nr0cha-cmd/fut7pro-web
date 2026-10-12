import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import PublicAuthFeedbackCoordinator from "@/components/layout/PublicAuthFeedbackCoordinator";
import { queuePublicAuthSuccessFeedback } from "@/utils/public-auth-feedback";

let pathnameMock = "/seu-racha";
let profileState: {
  profile: typeof baseProfile | null;
  isLoading: boolean;
  isError: boolean;
};

jest.mock("next/navigation", () => ({
  usePathname: () => pathnameMock,
  useRouter: () => ({ push: jest.fn() }),
}));

jest.mock("next-auth/react", () => ({
  useSession: () => ({
    status: "authenticated",
    data: {
      user: {
        accessToken: "access-token",
        accessTokenExp: Math.floor(Date.now() / 1000) + 3600,
      },
    },
  }),
}));

jest.mock("@/hooks/useGlobalProfile", () => ({
  useGlobalProfile: () => profileState,
}));

const baseProfile = {
  user: { id: "user-1", email: "atleta@teste.com", name: "Atleta" },
  stats: {
    jogos: 0,
    vitorias: 0,
    empates: 0,
    derrotas: 0,
    pontos: 0,
    gols: 0,
    assistencias: 0,
  },
  totalTitulos: 0,
  memberships: [
    {
      tenantId: "tenant-1",
      tenantSlug: "seu-racha",
      tenantName: "Seu Racha",
      role: "ATLETA",
      status: "APROVADO",
    },
  ],
  accountNotifications: [] as Array<Record<string, unknown>>,
  conquistas: {
    titulosGrandesTorneios: [],
    titulosAnuais: [],
    titulosQuadrimestrais: [],
  },
};

function decisionNotification(decision: "APROVADA" | "REJEITADA") {
  return {
    id: `notification-${decision.toLowerCase()}`,
    title: decision === "APROVADA" ? "Entrada aprovada!" : "Solicitação não aprovada",
    body: "Decisão da solicitação",
    href: decision === "APROVADA" ? "/seu-racha/perfil" : "/seu-racha",
    readAt: null,
    createdAt: "2026-10-11T12:00:00.000Z",
    metadata: {
      kind: "ATHLETE_REQUEST_DECISION",
      tenantSlug: "seu-racha",
      tenantName: "Seu Racha",
      decision,
      rejectionMessage: decision === "REJEITADA" ? "Lista cheia" : null,
    },
  };
}

describe("PublicAuthFeedbackCoordinator", () => {
  beforeEach(() => {
    pathnameMock = "/seu-racha";
    profileState = { profile: baseProfile, isLoading: false, isError: false };
    sessionStorage.clear();
    global.fetch = jest.fn().mockResolvedValue({ ok: true }) as jest.Mock;
  });

  it("mostra o sucesso generico somente depois de resolver que nao existe decisao", async () => {
    profileState = { profile: null, isLoading: true, isError: false };
    queuePublicAuthSuccessFeedback("Seu perfil está disponível.");

    const { rerender } = render(<PublicAuthFeedbackCoordinator />);
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();

    profileState = { profile: baseProfile, isLoading: false, isError: false };
    rerender(<PublicAuthFeedbackCoordinator />);

    expect(await screen.findByText("Login realizado com sucesso")).toBeInTheDocument();
    expect(screen.getAllByRole("dialog")).toHaveLength(1);
  });

  it.each([
    ["APROVADA", "Entrada aprovada!"],
    ["REJEITADA", "Solicitação não aprovada"],
  ] as const)("prioriza a decisao %s e descarta o sucesso generico", async (decision, title) => {
    profileState = { profile: null, isLoading: true, isError: false };
    queuePublicAuthSuccessFeedback("Seu perfil está disponível.");
    const { rerender } = render(<PublicAuthFeedbackCoordinator />);

    profileState = {
      profile: {
        ...baseProfile,
        accountNotifications: [decisionNotification(decision)],
      },
      isLoading: false,
      isError: false,
    };
    rerender(<PublicAuthFeedbackCoordinator />);

    expect(await screen.findByText(title)).toBeInTheDocument();
    expect(screen.getAllByRole("dialog")).toHaveLength(1);
    expect(screen.queryByText("Login realizado com sucesso")).not.toBeInTheDocument();
  });

  it("remove o sucesso visivel quando uma decisao chega durante a sincronizacao", async () => {
    queuePublicAuthSuccessFeedback("Seu perfil está disponível.");
    const { rerender } = render(<PublicAuthFeedbackCoordinator />);

    expect(await screen.findByText("Login realizado com sucesso")).toBeInTheDocument();

    profileState = {
      profile: {
        ...baseProfile,
        accountNotifications: [decisionNotification("APROVADA")],
      },
      isLoading: false,
      isError: false,
    };
    rerender(<PublicAuthFeedbackCoordinator />);

    expect(screen.getByText("Entrada aprovada!")).toBeInTheDocument();
    expect(screen.queryByText("Login realizado com sucesso")).not.toBeInTheDocument();
    expect(screen.getAllByRole("dialog")).toHaveLength(1);
  });

  it("nao reapresenta o sucesso depois de fechar a decisao prioritaria", async () => {
    queuePublicAuthSuccessFeedback("Seu perfil está disponível.");
    profileState = {
      profile: {
        ...baseProfile,
        accountNotifications: [decisionNotification("APROVADA")],
      },
      isLoading: false,
      isError: false,
    };
    const { rerender } = render(<PublicAuthFeedbackCoordinator />);

    fireEvent.click(await screen.findByRole("button", { name: "Continuar no grupo" }));
    await waitFor(() => expect(global.fetch).toHaveBeenCalled());

    profileState = { profile: baseProfile, isLoading: false, isError: false };
    rerender(<PublicAuthFeedbackCoordinator />);

    expect(screen.queryByText("Login realizado com sucesso")).not.toBeInTheDocument();
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("consome o sucesso uma unica vez apos navegacao client-side", async () => {
    queuePublicAuthSuccessFeedback("Seu perfil está disponível.");
    const { rerender } = render(<PublicAuthFeedbackCoordinator />);

    fireEvent.click(await screen.findByRole("button", { name: "Continuar" }));
    pathnameMock = "/seu-racha/perfil";
    rerender(<PublicAuthFeedbackCoordinator />);

    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("nao bloqueia o sucesso generico quando a consulta do perfil falha", async () => {
    profileState = { profile: null, isLoading: false, isError: true };
    queuePublicAuthSuccessFeedback("Login confirmado.");
    render(<PublicAuthFeedbackCoordinator />);

    expect(await screen.findByText("Login realizado com sucesso")).toBeInTheDocument();
    expect(screen.getByText("Login confirmado.")).toBeInTheDocument();
    expect(screen.getAllByRole("dialog")).toHaveLength(1);
  });

  it("da prioridade a uma decisao conhecida mesmo se a revalidacao falhar", async () => {
    queuePublicAuthSuccessFeedback("Seu perfil está disponível.");
    profileState = {
      profile: {
        ...baseProfile,
        accountNotifications: [decisionNotification("REJEITADA")],
      },
      isLoading: false,
      isError: true,
    };
    render(<PublicAuthFeedbackCoordinator />);

    expect(await screen.findByText("Solicitação não aprovada")).toBeInTheDocument();
    expect(screen.queryByText("Login realizado com sucesso")).not.toBeInTheDocument();
    expect(screen.getAllByRole("dialog")).toHaveLength(1);
  });
});
