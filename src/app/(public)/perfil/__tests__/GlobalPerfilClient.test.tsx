import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import GlobalPerfilClient from "../GlobalPerfilClient";

const replaceMock = jest.fn();
const signOutMock = jest.fn();
let searchParamsMock = new URLSearchParams();

jest.mock("next/image", () => ({
  __esModule: true,
  default: (props: any) => {
    // eslint-disable-next-line @next/next/no-img-element
    const { alt, ...rest } = props;
    return <img alt={alt || ""} {...rest} />;
  },
}));

jest.mock("next/navigation", () => ({
  useRouter: () => ({ replace: replaceMock, push: jest.fn() }),
  useSearchParams: () => searchParamsMock,
}));

jest.mock("next-auth/react", () => ({
  signOut: (...args: unknown[]) => signOutMock(...args),
}));

jest.mock("@/hooks/useGlobalProfile", () => ({
  useGlobalProfile: jest.fn(),
}));

jest.mock("@/hooks/useMe", () => ({
  useMe: jest.fn(() => ({ me: null })),
}));

jest.mock("@/components/ImageCropperModal", () => ({
  __esModule: true,
  default: () => null,
}));

jest.mock("@/components/profile/SecurityRecoveryPanel", () => ({
  __esModule: true,
  default: () => null,
}));

const mockedUseGlobalProfile = require("@/hooks/useGlobalProfile").useGlobalProfile as jest.Mock;

describe("GlobalPerfilClient reauthentication", () => {
  beforeEach(() => {
    searchParamsMock = new URLSearchParams(
      "intent=request-join&racha=seu-racha&callbackUrl=%2Fseu-racha"
    );
    mockedUseGlobalProfile.mockReturnValue({
      profile: null,
      isLoading: false,
      isError: true,
      error: "Unauthorized",
      errorStatus: 401,
      updateProfile: jest.fn(),
      mutate: jest.fn(),
    });
    signOutMock.mockResolvedValue(undefined);
    replaceMock.mockReset();
    signOutMock.mockClear();
    window.localStorage.clear();
    window.localStorage.setItem("fut7pro_last_tenant_slug", "vitrine");
    document.cookie = "f7_active_slug=vitrine; path=/";
  });

  it("limpa sessao invalida e navega para login tenant-scoped do racha explicito", async () => {
    render(<GlobalPerfilClient />);

    const button = await screen.findByRole("button", { name: "Entrar novamente" });
    fireEvent.click(button);

    await waitFor(() => {
      expect(signOutMock).toHaveBeenCalledWith({ redirect: false });
      expect(replaceMock).toHaveBeenCalledWith(
        "/seu-racha/entrar?intent=request-join&callbackUrl=%2Fseu-racha"
      );
    });
    expect(replaceMock).not.toHaveBeenCalledWith("/entrar");
    expect(replaceMock).not.toHaveBeenCalledWith(
      "/vitrine/entrar?intent=request-join&callbackUrl=%2Fseu-racha"
    );
  });

  it("nao usa vitrine como fallback quando nao ha racha explicito nem tenant real", async () => {
    searchParamsMock = new URLSearchParams();

    render(<GlobalPerfilClient />);

    const button = await screen.findByRole("button", { name: "Entrar novamente" });

    expect(button).toBeDisabled();
    expect(screen.getByText(/Não foi possível identificar o racha/i)).toBeInTheDocument();
    expect(signOutMock).not.toHaveBeenCalled();
    expect(replaceMock).not.toHaveBeenCalledWith("/vitrine/entrar?callbackUrl=%2F");
    expect(replaceMock).not.toHaveBeenCalledWith(expect.stringContaining("/vitrine/entrar"));
  });

  it("usa tenant armazenado real como callback quando nao ha racha explicito", async () => {
    searchParamsMock = new URLSearchParams();
    window.localStorage.setItem("fut7pro_last_tenant_slug", "seu-racha");
    document.cookie = "f7_active_slug=seu-racha; path=/";

    render(<GlobalPerfilClient />);

    fireEvent.click(await screen.findByRole("button", { name: "Entrar novamente" }));

    await waitFor(() => {
      expect(signOutMock).toHaveBeenCalledWith({ redirect: false });
      expect(replaceMock).toHaveBeenCalledWith("/seu-racha/entrar?callbackUrl=%2Fseu-racha");
    });
    expect(replaceMock).not.toHaveBeenCalledWith("/seu-racha/entrar?callbackUrl=%2F");
  });
});
