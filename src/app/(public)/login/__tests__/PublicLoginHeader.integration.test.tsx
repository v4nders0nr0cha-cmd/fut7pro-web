import React from "react";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import Header from "@/components/layout/Header";
import LoginClient from "../LoginClient";

type MockSessionState = {
  data: any;
  status: "authenticated" | "loading" | "unauthenticated";
};

let mockSessionState: MockSessionState = { data: null, status: "unauthenticated" };
let mockConfirmedSession: any = null;
const mockSessionListeners = new Set<(state: MockSessionState) => void>();
const mockReplace = jest.fn();
const mockRefresh = jest.fn();
const mockSignIn = jest.fn();
const mockSignOut = jest.fn();
const mockUpdateSession = jest.fn();
const mockGetSession = jest.fn();
const mockMutate = jest.fn();

function mockEmitSession(state: MockSessionState) {
  mockSessionState = state;
  mockSessionListeners.forEach((listener) => listener(state));
}

jest.mock("next-auth/react", () => ({
  useSession: () => {
    const ReactModule = require("react") as typeof React;
    const [state, setState] = ReactModule.useState(mockSessionState);
    ReactModule.useEffect(() => {
      mockSessionListeners.add(setState);
      return () => {
        mockSessionListeners.delete(setState);
      };
    }, []);
    return { ...state, update: mockUpdateSession };
  },
  signIn: (...args: unknown[]) => mockSignIn(...args),
  signOut: (...args: unknown[]) => mockSignOut(...args),
  getSession: () => mockGetSession(),
}));

jest.mock("next/navigation", () => ({
  useRouter: () => ({ replace: mockReplace, refresh: mockRefresh, push: jest.fn() }),
  useSearchParams: () => new URLSearchParams(),
  usePathname: () => "/casa-do-gamer/login",
}));

jest.mock("swr", () => ({
  mutate: (...args: unknown[]) => mockMutate(...args),
}));

jest.mock("next/image", () => ({
  __esModule: true,
  default: (props: any) => {
    // eslint-disable-next-line @next/next/no-img-element
    return <img {...props} alt={props.alt || ""} />;
  },
}));

jest.mock("@/hooks/useTema", () => ({
  useTema: () => ({ nome: "Casa do Gamer", logo: "/logo.png" }),
}));

jest.mock("@/hooks/usePublicLinks", () => ({
  usePublicLinks: () => ({
    publicSlug: "casa-do-gamer",
    publicHref: (path: string) => `/casa-do-gamer${path}`,
  }),
}));

jest.mock("@/hooks/useMe", () => ({
  useMe: () => ({
    me: {
      athlete: { firstName: "Pelé", avatarUrl: "/pele.png" },
      membership: { status: "APROVADO" },
    },
    isLoading: false,
    isError: false,
  }),
}));

jest.mock("@/hooks/useGlobalProfile", () => ({
  useGlobalProfile: () => ({
    profile: {
      user: {
        name: "Pelé",
        position: "atacante",
        birthDay: 23,
        birthMonth: 10,
      },
      memberships: [{ tenantSlug: "casa-do-gamer", status: "APROVADO" }],
    },
    isLoading: false,
    isError: false,
  }),
}));

jest.mock("@/hooks/useComunicacao", () => ({
  useComunicacao: () => ({ badge: 0, badgeMensagem: 0, badgeSugestoes: 0 }),
}));

jest.mock("@/components/security/TurnstileWidget", () => ({
  __esModule: true,
  default: () => null,
  AUTH_APP_TURNSTILE_ENABLED: false,
  AUTH_APP_TURNSTILE_SITE_KEY: "",
  TURNSTILE_REQUIRED_MESSAGE: "Confirme que você não é um robô para continuar.",
  TURNSTILE_UNAVAILABLE_MESSAGE: "Não foi possível carregar a verificação de segurança.",
  isTurnstileErrorCode: () => false,
  resolveTurnstileErrorMessage: () => "Falha na verificação.",
}));

function approvedSession() {
  return {
    user: {
      id: "user-1",
      name: "Pelé",
      email: "pele@teste.com",
      image: "/pele.png",
      accessToken: "access-token",
    },
  };
}

describe("login publico integrado ao Header", () => {
  beforeEach(() => {
    sessionStorage.clear();
    mockSessionListeners.clear();
    mockSessionState = { data: null, status: "unauthenticated" };
    mockConfirmedSession = approvedSession();
    mockReplace.mockReset();
    mockRefresh.mockReset();
    mockSignIn.mockReset().mockResolvedValue({});
    mockGetSession.mockReset().mockImplementation(async () => {
      mockEmitSession({ data: mockConfirmedSession, status: "authenticated" });
      return mockConfirmedSession;
    });
    mockMutate.mockReset().mockResolvedValue(undefined);
    mockUpdateSession.mockReset().mockImplementation(async () => {
      mockEmitSession({ data: mockConfirmedSession, status: "authenticated" });
      return mockConfirmedSession;
    });
    mockSignOut.mockReset().mockImplementation(async () => {
      mockConfirmedSession = null;
      mockEmitSession({ data: null, status: "unauthenticated" });
    });
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({
        accessToken: "access-token",
        refreshToken: "refresh-token",
        membershipStatus: "APROVADO",
      }),
    }) as jest.Mock;
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it("troca Entrar pelo atleta assim que o SessionProvider confirma o login", async () => {
    render(
      <>
        <Header />
        <LoginClient />
      </>
    );

    expect(screen.getByText(/^Entrar$/i)).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Entrar com senha" }));
    fireEvent.change(screen.getByPlaceholderText("email@exemplo.com"), {
      target: { value: "pele@teste.com" },
    });
    fireEvent.change(screen.getByPlaceholderText("Digite sua senha"), {
      target: { value: "Senha123!" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Entrar com senha" }));

    await waitFor(() => {
      expect(screen.queryByText(/^Entrar$/i)).not.toBeInTheDocument();
      expect(screen.getByRole("button", { name: /Pelé/i })).toBeInTheDocument();
    });

    expect(mockGetSession).toHaveBeenCalledTimes(1);
    expect(mockUpdateSession).not.toHaveBeenCalled();
    expect(mockReplace).toHaveBeenCalledWith("/casa-do-gamer/");
    expect(mockRefresh).not.toHaveBeenCalled();
  });

  it("restaura Entrar quando a sessao e encerrada", async () => {
    mockSessionState = { data: approvedSession(), status: "authenticated" };

    render(<Header />);

    fireEvent.click(screen.getByRole("button", { name: /Pelé/i }));
    fireEvent.click(screen.getByRole("button", { name: "Sair da conta" }));

    await waitFor(() => {
      expect(screen.getByText(/^Entrar$/i)).toBeInTheDocument();
    });
  });
});
