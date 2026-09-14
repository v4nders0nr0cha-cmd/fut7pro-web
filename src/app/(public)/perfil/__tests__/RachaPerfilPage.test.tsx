import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import type { ReactNode } from "react";
import RachaPerfilPage from "../RachaPerfilPage";
import { usePerfil } from "@/components/atletas/PerfilContext";
import { useOwnerAthletePremiumProfile } from "@/hooks/useAthletePremiumProfile";

const replaceMock = jest.fn();
const pushMock = jest.fn();

jest.mock("next/navigation", () => ({
  useRouter: () => ({ replace: replaceMock, push: pushMock }),
}));

jest.mock("@/components/atletas/PerfilContext", () => ({
  usePerfil: jest.fn(),
}));

jest.mock("@/hooks/usePublicLinks", () => ({
  usePublicLinks: () => ({
    publicSlug: "seu-racha",
    publicHref: (path: string) => `/seu-racha${path}`,
  }),
}));

jest.mock("@/hooks/useAthletePremiumProfile", () => ({
  useOwnerAthletePremiumProfile: jest.fn(),
  markLegendaryCelebrationSeen: jest.fn(),
}));

jest.mock("@/utils/athlete-premium-contract", () => ({
  mapPremiumPayloadToView: () => ({
    athlete: { slug: "neymar" },
    tenant: { name: "Seu Racha", slug: "seu-racha" },
    stats: { titles: [], attendancePercent: 90 },
    index: {},
    achievements: [],
    achievementGroups: {
      titulosGrandesTorneios: [],
      titulosAnuais: [],
      titulosQuadrimestrais: [],
    },
    badges: [],
    legendaryProgress: {},
  }),
}));

jest.mock("@/components/athlete-premium/AthletePremiumProfileView", () => ({
  __esModule: true,
  default: ({ ownerActions }: { ownerActions?: ReactNode }) => (
    <div>
      <div>Desempenho do atleta carregado</div>
      <div>Card Oficial Fut7Pro</div>
      <button type="button">Baixar Card Oficial</button>
      <button type="button">Compartilhar Card Oficial</button>
      {ownerActions}
    </div>
  ),
}));

jest.mock("@/components/athlete-premium/LegendaryUnlockedModal", () => ({
  __esModule: true,
  default: () => null,
}));

jest.mock("@/components/atletas/ConquistasDoAtleta", () => ({
  __esModule: true,
  default: () => <div>Conquistas</div>,
}));

jest.mock("@/components/atletas/HistoricoJogos", () => ({
  __esModule: true,
  default: () => <div>Historico</div>,
}));

const mockedUsePerfil = usePerfil as jest.Mock;
const mockedUseOwnerAthletePremiumProfile = useOwnerAthletePremiumProfile as jest.Mock;
const retryMembershipLookupMock = jest.fn();

const approvedPerfil = {
  usuario: {
    slug: "neymar",
    mensalista: false,
    mensalistaRequestStatus: null,
    historico: [],
  },
  roleLabel: null,
  membershipStatus: "APROVADO",
  isLoading: false,
  isError: false,
  errorStatus: null,
  isAuthenticated: true,
  isPendingApproval: false,
  hasConfirmedNoGroupMembership: false,
  isMembershipLookupError: false,
  retryMembershipLookup: retryMembershipLookupMock,
};

describe("RachaPerfilPage", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockedUsePerfil.mockReturnValue(approvedPerfil);
    mockedUseOwnerAthletePremiumProfile.mockReturnValue({
      premiumProfile: {
        tenant: { name: "Seu Racha", slug: "seu-racha" },
        athlete: { slug: "neymar", publicName: "Neymar" },
        stats: { titles: [], attendancePercent: 90, period: "current" },
        visual: { medalAsset: null },
        legendaryCelebration: { shouldShow: false },
      },
      isError: false,
      isLoading: false,
      isValidating: false,
      error: null,
      mutate: jest.fn(),
    });
  });

  it("carrega desempenho com membership aprovado sem redirecionar para login", () => {
    render(<RachaPerfilPage />);

    expect(screen.getByText("Desempenho do atleta carregado")).toBeInTheDocument();
    expect(screen.getByText("Card Oficial Fut7Pro")).toBeInTheDocument();
    expect(screen.getByText("Baixar Card Oficial")).toBeInTheDocument();
    expect(screen.getByText("Compartilhar Card Oficial")).toBeInTheDocument();
    expect(screen.getByText("Solicitar vaga de mensalista")).toBeInTheDocument();
    expect(screen.getByText("Conquistas")).toBeInTheDocument();
    expect(mockedUseOwnerAthletePremiumProfile).toHaveBeenCalledWith(
      expect.objectContaining({ enabled: true })
    );
    expect(replaceMock).not.toHaveBeenCalledWith(
      "/seu-racha/entrar?callbackUrl=%2Fseu-racha%2Fperfil"
    );
    expect(screen.queryByText(/Redirecionando para o login/i)).not.toBeInTheDocument();
  });

  it("redireciona para login tenant-scoped quando nao ha sessao utilizavel", async () => {
    mockedUsePerfil.mockReturnValue({
      ...approvedPerfil,
      usuario: null,
      isAuthenticated: false,
    });

    render(<RachaPerfilPage />);

    await waitFor(() => {
      expect(replaceMock).toHaveBeenCalledWith(
        "/seu-racha/entrar?callbackUrl=%2Fseu-racha%2Fperfil"
      );
    });
  });

  it("redireciona membership pendente para aguardando aprovacao", async () => {
    mockedUsePerfil.mockReturnValue({
      ...approvedPerfil,
      usuario: null,
      membershipStatus: "PENDENTE",
      isPendingApproval: true,
    });

    render(<RachaPerfilPage />);

    await waitFor(() => {
      expect(replaceMock).toHaveBeenCalledWith("/seu-racha/aguardando-aprovacao");
    });
  });

  it.each(["REJEITADO", "SUSPENSO"])(
    "mostra estado de membership %s sem voltar para login",
    (membershipStatus) => {
      mockedUsePerfil.mockReturnValue({
        ...approvedPerfil,
        usuario: null,
        membershipStatus,
        isError: true,
      });

      render(<RachaPerfilPage />);

      expect(replaceMock).not.toHaveBeenCalledWith(
        "/seu-racha/entrar?callbackUrl=%2Fseu-racha%2Fperfil"
      );
      expect(screen.queryByText(/Redirecionando para o login/i)).not.toBeInTheDocument();
      expect(
        screen.getByText(
          membershipStatus === "REJEITADO"
            ? "Solicitação não aprovada"
            : "Acesso suspenso neste grupo"
        )
      ).toBeInTheDocument();
    }
  );

  it.each(["REJEITADO", "SUSPENSO", "PENDENTE"])(
    "nao requisita perfil premium quando membership esta %s mesmo com usuario stale",
    (membershipStatus) => {
      mockedUsePerfil.mockReturnValue({
        ...approvedPerfil,
        membershipStatus,
        isPendingApproval: membershipStatus === "PENDENTE",
      });

      render(<RachaPerfilPage />);

      expect(mockedUseOwnerAthletePremiumProfile).toHaveBeenCalledWith(
        expect.objectContaining({ enabled: false })
      );
    }
  );

  it("conta existente com perfil incompleto nunca navega para register", () => {
    mockedUsePerfil.mockReturnValue({
      ...approvedPerfil,
      usuario: null,
      membershipStatus: null,
      isError: false,
    });

    render(<RachaPerfilPage />);

    expect(screen.getByText("Completar Perfil Fut7Pro")).toBeInTheDocument();
    expect(screen.queryByText("Completar conta")).not.toBeInTheDocument();
    expect(screen.queryByText("Complete sua conta")).not.toBeInTheDocument();
    expect(document.body.textContent).not.toContain("/register");
  });

  it("falha tecnica de /me nao aparece como Perfil Global incompleto", () => {
    mockedUsePerfil.mockReturnValue({
      ...approvedPerfil,
      usuario: null,
      isError: true,
      errorStatus: 500,
      error: "Falha temporaria",
    });

    render(<RachaPerfilPage />);

    expect(
      screen.getByText("Não foi possível carregar seu desempenho neste grupo")
    ).toBeInTheDocument();
    expect(screen.getByText("Tentar novamente")).toBeInTheDocument();
    expect(screen.queryByText("Completar Perfil Fut7Pro")).not.toBeInTheDocument();
    expect(document.body.textContent).not.toContain("/register");
  });

  it("sessao valida sem membership no grupo mostra estado sem vinculo e CTA de entrada", () => {
    mockedUsePerfil.mockReturnValue({
      ...approvedPerfil,
      usuario: null,
      membershipStatus: null,
      isError: true,
      errorStatus: 403,
      error: "Forbidden",
      hasConfirmedNoGroupMembership: true,
    });

    render(<RachaPerfilPage />);

    expect(screen.getByText("Você ainda não participa deste grupo")).toBeInTheDocument();
    expect(
      screen.queryByText("Não foi possível carregar seu desempenho neste grupo")
    ).not.toBeInTheDocument();
    screen.getByText("Solicitar entrada").click();

    expect(pushMock).toHaveBeenCalledWith(
      "/perfil?intent=request-join&racha=seu-racha&callbackUrl=%2Fseu-racha"
    );
    expect(document.body.textContent).not.toContain("/register");
  });

  it("nao afirma sem vinculo quando /me da 403 e Perfil Global falha", () => {
    mockedUsePerfil.mockReturnValue({
      ...approvedPerfil,
      usuario: null,
      membershipStatus: null,
      isError: true,
      errorStatus: 403,
      error: "Forbidden",
      hasConfirmedNoGroupMembership: false,
      isMembershipLookupError: true,
      retryMembershipLookup: retryMembershipLookupMock,
    });

    render(<RachaPerfilPage />);

    expect(
      screen.getByText("Não foi possível verificar seu vínculo com este grupo")
    ).toBeInTheDocument();
    expect(screen.queryByText("Você ainda não participa deste grupo")).not.toBeInTheDocument();
    expect(screen.queryByText("Solicitar entrada")).not.toBeInTheDocument();

    fireEvent.click(screen.getByText("Tentar novamente"));

    expect(retryMembershipLookupMock).toHaveBeenCalledTimes(1);
    expect(pushMock).not.toHaveBeenCalledWith(
      "/perfil?intent=request-join&racha=seu-racha&callbackUrl=%2Fseu-racha"
    );
  });
});
