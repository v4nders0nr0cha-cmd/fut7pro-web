import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import AthleteRequestDecisionDialog from "@/components/layout/AthleteRequestDecisionDialog";

const pushMock = jest.fn();
let pathnameMock = "/seu-racha";
const mutateMock = jest.fn();
const useGlobalProfileMock = jest.fn();
let mockSessionState: {
  status: "loading" | "authenticated" | "unauthenticated";
  data: unknown;
} = {
  status: "authenticated",
  data: {
    user: {
      accessToken: "token",
      accessTokenExp: Math.floor(Date.now() / 1000) + 3600,
    },
  },
};

jest.mock("next/navigation", () => ({
  usePathname: () => pathnameMock,
  useRouter: () => ({ push: pushMock }),
}));

jest.mock("next-auth/react", () => ({
  useSession: () => mockSessionState,
}));

jest.mock("@/hooks/useGlobalProfile", () => ({
  useGlobalProfile: (...args: unknown[]) => useGlobalProfileMock(...args),
}));

const baseProfile = {
  user: { id: "user-1", email: "ney@example.com", name: "Neymar" },
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
  accountNotifications: [],
  conquistas: {
    titulosGrandesTorneios: [],
    titulosAnuais: [],
    titulosQuadrimestrais: [],
  },
};

describe("AthleteRequestDecisionDialog", () => {
  beforeEach(() => {
    pathnameMock = "/seu-racha";
    mockSessionState = {
      status: "authenticated",
      data: {
        user: {
          accessToken: "token",
          accessTokenExp: Math.floor(Date.now() / 1000) + 3600,
        },
      },
    };
    pushMock.mockReset();
    mutateMock.mockResolvedValue(undefined);
    global.fetch = jest.fn().mockResolvedValue({ ok: true });
    useGlobalProfileMock.mockReturnValue({
      profile: baseProfile,
      mutate: mutateMock,
    });
  });

  it("mostra modal de aprovacao somente para a decisao nao lida do tenant atual", () => {
    useGlobalProfileMock.mockReturnValue({
      profile: {
        ...baseProfile,
        accountNotifications: [
          {
            id: "notification-other",
            title: "Entrada aprovada!",
            body: "Outro grupo",
            href: "/outro-grupo/perfil",
            readAt: null,
            createdAt: "2026-09-14T12:00:00.000Z",
            metadata: {
              kind: "ATHLETE_REQUEST_DECISION",
              tenantSlug: "outro-grupo",
              decision: "APROVADA",
            },
          },
          {
            id: "notification-1",
            title: "Entrada aprovada!",
            body: "Aprovado",
            href: "/seu-racha/perfil",
            readAt: null,
            createdAt: "2026-09-14T12:00:00.000Z",
            metadata: {
              kind: "ATHLETE_REQUEST_DECISION",
              tenantSlug: "seu-racha",
              tenantName: "Seu Racha",
              decision: "APROVADA",
            },
          },
        ],
      },
      mutate: mutateMock,
    });

    render(<AthleteRequestDecisionDialog />);

    expect(screen.getByRole("dialog")).toBeInTheDocument();
    expect(screen.getByText("Entrada aprovada!")).toBeInTheDocument();
    expect(screen.getByText(/Agora você faz parte do Seu Racha/i)).toBeInTheDocument();
    expect(screen.getByText("Acesso ao grupo liberado")).toBeInTheDocument();
    expect(screen.queryByText("outro-grupo")).not.toBeInTheDocument();
  });

  it("mantem modal generico suprimido enquanto a busca de decisoes ainda carrega", async () => {
    const onVisibilityChange = jest.fn();
    useGlobalProfileMock.mockReturnValue({
      profile: null,
      isLoading: true,
      mutate: mutateMock,
    });

    render(<AthleteRequestDecisionDialog onVisibilityChange={onVisibilityChange} />);

    await waitFor(() => expect(onVisibilityChange).toHaveBeenCalledWith(true));
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("mantem login generico suprimido durante loading de sessao ate carregar decisao", async () => {
    const onVisibilityChange = jest.fn();
    mockSessionState = { status: "loading", data: null };
    useGlobalProfileMock.mockReturnValue({
      profile: null,
      isLoading: true,
      mutate: mutateMock,
    });

    const { rerender } = render(
      <AthleteRequestDecisionDialog onVisibilityChange={onVisibilityChange} />
    );

    await waitFor(() => expect(onVisibilityChange).toHaveBeenLastCalledWith(true));

    mockSessionState = {
      status: "authenticated",
      data: {
        user: {
          accessToken: "token",
          accessTokenExp: Math.floor(Date.now() / 1000) + 3600,
        },
      },
    };
    rerender(<AthleteRequestDecisionDialog onVisibilityChange={onVisibilityChange} />);

    await waitFor(() => expect(onVisibilityChange).toHaveBeenLastCalledWith(true));

    useGlobalProfileMock.mockReturnValue({
      profile: {
        ...baseProfile,
        accountNotifications: [
          {
            id: "notification-1",
            title: "Entrada aprovada!",
            body: "Aprovado",
            href: "/seu-racha/perfil",
            readAt: null,
            createdAt: "2026-09-14T12:00:00.000Z",
            metadata: {
              kind: "ATHLETE_REQUEST_DECISION",
              tenantSlug: "seu-racha",
              tenantName: "Seu Racha",
              decision: "APROVADA",
            },
          },
        ],
      },
      isLoading: false,
      mutate: mutateMock,
    });
    rerender(<AthleteRequestDecisionDialog onVisibilityChange={onVisibilityChange} />);

    await waitFor(() => expect(screen.getByText("Entrada aprovada!")).toBeInTheDocument());
    expect(onVisibilityChange).not.toHaveBeenCalledWith(false);
  });

  it("libera modal generico quando a busca termina sem decisao nao lida", async () => {
    const onVisibilityChange = jest.fn();
    useGlobalProfileMock.mockReturnValue({
      profile: baseProfile,
      isLoading: false,
      mutate: mutateMock,
    });

    render(<AthleteRequestDecisionDialog onVisibilityChange={onVisibilityChange} />);

    await waitFor(() => expect(onVisibilityChange).toHaveBeenCalledWith(false));
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("marca como lida e navega para o desempenho ao confirmar aprovacao", async () => {
    useGlobalProfileMock.mockReturnValue({
      profile: {
        ...baseProfile,
        accountNotifications: [
          {
            id: "notification-1",
            title: "Entrada aprovada!",
            body: "Aprovado",
            href: "/seu-racha/perfil",
            readAt: null,
            createdAt: "2026-09-14T12:00:00.000Z",
            metadata: {
              kind: "ATHLETE_REQUEST_DECISION",
              tenantSlug: "seu-racha",
              tenantName: "Seu Racha",
              decision: "APROVADA",
            },
          },
        ],
      },
      mutate: mutateMock,
    });

    render(<AthleteRequestDecisionDialog />);

    fireEvent.click(screen.getByRole("button", { name: "Acompanhar meu desempenho" }));

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        "/api/perfil/account-notifications/notification-1/read",
        expect.objectContaining({
          method: "PATCH",
          body: JSON.stringify({
            expectedDecision: "APROVADA",
            expectedRejectionMessage: null,
          }),
        })
      );
      expect(mutateMock).toHaveBeenCalled();
      expect(pushMock).toHaveBeenCalledWith("/seu-racha/perfil");
    });
  });

  it("revalida sem dispensar o aviso quando a decisao mudou antes do reconhecimento", async () => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: false,
      status: 409,
      json: async () => ({ code: "DECISION_CHANGED" }),
    });
    useGlobalProfileMock.mockReturnValue({
      profile: {
        ...baseProfile,
        accountNotifications: [
          {
            id: "notification-1",
            title: "Entrada aprovada!",
            body: "Aprovado",
            href: "/seu-racha/perfil",
            readAt: null,
            createdAt: "2026-09-14T12:00:00.000Z",
            metadata: {
              kind: "ATHLETE_REQUEST_DECISION",
              tenantSlug: "seu-racha",
              tenantName: "Seu Racha",
              decision: "APROVADA",
            },
          },
        ],
      },
      isLoading: false,
      mutate: mutateMock,
    });

    render(<AthleteRequestDecisionDialog />);

    fireEvent.click(screen.getByRole("button", { name: "Acompanhar meu desempenho" }));

    await waitFor(() => {
      expect(mutateMock).toHaveBeenCalled();
      expect(pushMock).toHaveBeenCalledWith("/seu-racha/perfil");
    });
    expect(screen.getByText("Entrada aprovada!")).toBeInTheDocument();
  });

  it("nao oferece desempenho quando a decisao e rejeitada", () => {
    useGlobalProfileMock.mockReturnValue({
      profile: {
        ...baseProfile,
        accountNotifications: [
          {
            id: "notification-1",
            title: "Solicitação não aprovada",
            body: "Rejeitada",
            href: "/seu-racha",
            readAt: null,
            createdAt: "2026-09-14T12:00:00.000Z",
            metadata: {
              kind: "ATHLETE_REQUEST_DECISION",
              tenantSlug: "seu-racha",
              tenantName: "Seu Racha",
              decision: "REJEITADA",
              rejectionMessage: "Lista cheia",
            },
          },
        ],
      },
      mutate: mutateMock,
    });

    render(<AthleteRequestDecisionDialog />);

    expect(screen.getByText("Solicitação não aprovada")).toBeInTheDocument();
    expect(screen.getByText(/Motivo informado:/i)).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Acompanhar meu desempenho" })).toBeNull();
    expect(screen.getByRole("button", { name: "Continuar no site do grupo" })).toBeInTheDocument();
  });

  it("usa tenantName do metadata em rejeicao sem depender de Membership", () => {
    useGlobalProfileMock.mockReturnValue({
      profile: {
        ...baseProfile,
        memberships: [],
        accountNotifications: [
          {
            id: "notification-1",
            title: "Solicitação não aprovada",
            body: "Rejeitada",
            href: "/seu-racha",
            readAt: null,
            createdAt: "2026-09-14T12:00:00.000Z",
            metadata: {
              kind: "ATHLETE_REQUEST_DECISION",
              tenantSlug: "seu-racha",
              tenantName: "Seu Racha",
              decision: "REJEITADA",
            },
          },
        ],
      },
      mutate: mutateMock,
    });

    render(<AthleteRequestDecisionDialog />);

    expect(
      screen.getByText("Sua solicitação para participar do Seu Racha não foi aprovada.")
    ).toBeInTheDocument();
    expect(screen.queryByText(/do este grupo/i)).not.toBeInTheDocument();
  });
});
