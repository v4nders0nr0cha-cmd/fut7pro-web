import { render, screen, waitFor } from "@testing-library/react";
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
  default: () => <div>Desempenho do atleta carregado</div>,
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
  isAuthenticated: true,
  isPendingApproval: false,
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

  it("conta existente com perfil incompleto nunca navega para register", () => {
    mockedUsePerfil.mockReturnValue({
      ...approvedPerfil,
      usuario: null,
      isError: true,
    });

    render(<RachaPerfilPage />);

    expect(screen.getByText("Completar Perfil Fut7Pro")).toBeInTheDocument();
    expect(screen.queryByText("Completar conta")).not.toBeInTheDocument();
    expect(screen.queryByText("Complete sua conta")).not.toBeInTheDocument();
    expect(document.body.textContent).not.toContain("/register");
  });
});
