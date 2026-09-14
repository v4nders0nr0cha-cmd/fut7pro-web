import { act, fireEvent, render, screen } from "@testing-library/react";
import AguardandoAprovacaoClient from "../AguardandoAprovacaoClient";

const mutateMeMock = jest.fn();
const mutateProfileMock = jest.fn();
let meStatus: string | null = "PENDENTE";
let profileStatus: string | null = "PENDENTE";
let meIsLoading = false;
let profileIsLoading = false;
let meIsError = false;
let profileIsError = false;

jest.mock("next/navigation", () => ({
  usePathname: () => "/seu-racha/aguardando-aprovacao",
}));

jest.mock("@/hooks/useTema", () => ({
  useTema: () => ({ nome: "Seu Racha" }),
}));

jest.mock("@/hooks/usePublicLinks", () => ({
  usePublicLinks: () => ({
    publicSlug: "seu-racha",
    publicHref: (href: string) => (href === "/" ? "/seu-racha" : `/seu-racha${href}`),
  }),
}));

jest.mock("@/hooks/useMe", () => ({
  useMe: jest.fn(() => ({
    me: meStatus ? { membership: { status: meStatus } } : null,
    isLoading: meIsLoading,
    isError: meIsError,
    mutate: mutateMeMock,
  })),
}));

jest.mock("@/hooks/useGlobalProfile", () => ({
  useGlobalProfile: jest.fn(() => ({
    profile: {
      memberships: [
        {
          tenantSlug: "seu-racha",
          tenantName: "Seu Racha",
          status: profileStatus,
        },
      ],
      accountNotifications: [
        {
          id: "wrong-tenant",
          title: "Solicitação não aprovada",
          body: "Sua solicitação para participar deste grupo não foi aprovada. Motivo informado: Motivo errado.",
          createdAt: "2026-09-13T00:00:00.000Z",
          metadata: {
            tenantSlug: "outro-grupo",
            status: "REJEITADO",
            rejectionMessage: "Motivo errado.",
          },
        },
        {
          id: "legacy-without-tenant",
          title: "Solicitação não aprovada",
          body: "Sua solicitação para participar deste grupo não foi aprovada. Motivo informado: Motivo legado sem grupo.",
          createdAt: "2026-09-13T00:00:00.000Z",
          metadata: {
            status: "REJEITADO",
            rejectionMessage: "Motivo legado sem grupo.",
          },
        },
        {
          id: "n1",
          title: "Solicitação não aprovada",
          body: "Sua solicitação para participar deste grupo não foi aprovada. Motivo informado: Lista fechada.",
          createdAt: "2026-09-13T00:00:00.000Z",
          metadata: {
            tenantSlug: "seu-racha",
            status: "REJEITADO",
            rejectionMessage: "Lista fechada.",
          },
        },
      ],
    },
    isLoading: profileIsLoading,
    isError: profileIsError,
    mutate: mutateProfileMock,
  })),
}));

describe("AguardandoAprovacaoClient", () => {
  beforeEach(() => {
    jest.useRealTimers();
    meStatus = "PENDENTE";
    profileStatus = "PENDENTE";
    meIsLoading = false;
    profileIsLoading = false;
    meIsError = false;
    profileIsError = false;
    mutateMeMock.mockReset();
    mutateProfileMock.mockReset();
  });

  it("mostra solicitacao em analise quando o membership esta pendente", () => {
    render(<AguardandoAprovacaoClient />);

    expect(screen.getByRole("heading", { name: "Solicitação em análise" })).toBeInTheDocument();
    expect(screen.getByText(/participar deste grupo foi enviada/i)).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Minha conta Fut7Pro" })).toHaveAttribute(
      "href",
      "/perfil"
    );
    expect(screen.queryByText(/Voltar para login/i)).not.toBeInTheDocument();
  });

  it("mostra entrada aprovada no carregamento inicial sem texto de aguardando", () => {
    meStatus = "APROVADO";
    profileStatus = "APROVADO";

    render(<AguardandoAprovacaoClient />);

    expect(screen.getByRole("heading", { name: "Entrada aprovada!" })).toBeInTheDocument();
    expect(screen.queryByText(/Aguardando aprovação/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/aguardando aprovação/i)).not.toBeInTheDocument();
  });

  it("prioriza rejeicao do Perfil Global sobre /me pendente stale", () => {
    meStatus = "PENDENTE";
    profileStatus = "REJEITADO";
    meIsError = true;

    render(<AguardandoAprovacaoClient />);

    expect(screen.getByRole("heading", { name: "Solicitação não aprovada" })).toBeInTheDocument();
    expect(screen.queryByRole("heading", { name: "Solicitação em análise" })).toBeNull();
  });

  it("prioriza aprovacao do /me sobre Perfil Global pendente stale", () => {
    meStatus = "APROVADO";
    profileStatus = "PENDENTE";

    render(<AguardandoAprovacaoClient />);

    expect(screen.getByRole("heading", { name: "Entrada aprovada!" })).toBeInTheDocument();
    expect(screen.queryByRole("heading", { name: "Solicitação em análise" })).toBeNull();
  });

  it("atualiza de pendente para aprovado durante o polling e para de consultar", () => {
    jest.useFakeTimers();
    mutateMeMock.mockImplementation(() => {
      meStatus = "APROVADO";
    });
    const { rerender } = render(<AguardandoAprovacaoClient />);

    act(() => {
      jest.advanceTimersByTime(15000);
    });
    rerender(<AguardandoAprovacaoClient />);

    expect(screen.getByRole("heading", { name: "Entrada aprovada!" })).toBeInTheDocument();
    expect(mutateMeMock).toHaveBeenCalledTimes(1);
    expect(mutateProfileMock).toHaveBeenCalledTimes(1);

    act(() => {
      jest.advanceTimersByTime(15000);
    });

    expect(mutateMeMock).toHaveBeenCalledTimes(1);
    expect(mutateProfileMock).toHaveBeenCalledTimes(1);
    jest.useRealTimers();
  });

  it("mostra solicitacao nao aprovada com motivo administrativo", () => {
    meStatus = "REJEITADO";
    profileStatus = "REJEITADO";

    render(<AguardandoAprovacaoClient />);

    expect(screen.getByRole("heading", { name: "Solicitação não aprovada" })).toBeInTheDocument();
    expect(screen.getByText(/Sua Conta Fut7Pro continua ativa normalmente/i)).toBeInTheDocument();
    expect(screen.getByText("Motivo informado: Lista fechada.")).toBeInTheDocument();
    expect(screen.queryByText(/Motivo errado/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/Motivo legado sem grupo/i)).not.toBeInTheDocument();
  });

  it("mostra verificacao enquanto o status ainda esta carregando", () => {
    meStatus = null;
    profileStatus = null;
    meIsLoading = true;
    profileIsLoading = true;

    render(<AguardandoAprovacaoClient />);

    expect(
      screen.getByRole("heading", { name: "Verificando status da solicitação..." })
    ).toBeInTheDocument();
    expect(screen.queryByRole("heading", { name: "Solicitação em análise" })).toBeNull();
  });

  it("mostra tentativa manual quando nao ha status resolvivel", () => {
    meStatus = null;
    profileStatus = null;
    meIsError = true;
    profileIsError = true;

    render(<AguardandoAprovacaoClient />);

    expect(
      screen.getByRole("heading", {
        name: "Não foi possível verificar o status da sua solicitação.",
      })
    ).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Tentar novamente" }));
    expect(mutateMeMock).toHaveBeenCalledTimes(1);
    expect(mutateProfileMock).toHaveBeenCalledTimes(1);
    expect(screen.queryByRole("heading", { name: "Solicitação em análise" })).toBeNull();
  });

  it("nao trata status suspenso como solicitacao em analise", () => {
    meStatus = null;
    profileStatus = "SUSPENSO";

    render(<AguardandoAprovacaoClient />);

    expect(
      screen.getByRole("heading", {
        name: "Não foi possível verificar o status da sua solicitação.",
      })
    ).toBeInTheDocument();
    expect(screen.queryByRole("heading", { name: "Solicitação em análise" })).toBeNull();
  });

  it("nao usa racha como substantivo generico nas mensagens do fluxo", () => {
    render(<AguardandoAprovacaoClient />);

    expect(screen.queryByText(/\beste racha\b/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/\bneste racha\b/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/\bsite do racha\b/i)).not.toBeInTheDocument();
  });
});
