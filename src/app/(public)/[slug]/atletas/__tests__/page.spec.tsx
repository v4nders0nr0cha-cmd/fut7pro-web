import { render, screen, waitFor } from "@testing-library/react";
import ListaAtletasSlugPage from "../page";

jest.mock("next/navigation", () => ({
  useParams: jest.fn(),
}));

jest.mock("@/context/RachaContext", () => ({
  useRacha: jest.fn(),
}));

jest.mock("@/hooks/usePublicLinks", () => ({
  usePublicLinks: jest.fn(),
}));

jest.mock("@/hooks/usePublicPlayerRankings", () => ({
  usePublicPlayerRankings: jest.fn(),
}));

const mockedUseParams = require("next/navigation").useParams as jest.Mock;
const mockedUseRacha = require("@/context/RachaContext").useRacha as jest.Mock;
const mockedUsePublicLinks = require("@/hooks/usePublicLinks").usePublicLinks as jest.Mock;
const mockedUsePublicPlayerRankings = require("@/hooks/usePublicPlayerRankings")
  .usePublicPlayerRankings as jest.Mock;

describe("ListaAtletasSlugPage", () => {
  const setTenantSlug = jest.fn();

  beforeEach(() => {
    mockedUseParams.mockReturnValue({ slug: "nome-do-racha" });
    mockedUseRacha.mockReturnValue({ setTenantSlug });
    mockedUsePublicLinks.mockReturnValue({
      publicHref: (path: string) => `/nome-do-racha${path}`,
    });
    mockedUsePublicPlayerRankings.mockReturnValue({
      rankings: [
        {
          id: "atleta-2",
          slug: "pedro-costa",
          nome: "Pedro Costa",
          foto: null,
          jogos: 12,
          gols: 6,
          assistencias: 5,
          pontos: 19,
        },
      ],
      isLoading: false,
      isError: false,
    });
  });

  afterEach(() => {
    setTenantSlug.mockReset();
    jest.clearAllMocks();
  });

  it("atualiza o tenant do contexto e exibe link navegavel para o perfil", async () => {
    render(<ListaAtletasSlugPage />);

    await waitFor(() => {
      expect(setTenantSlug).toHaveBeenCalledWith("nome-do-racha");
    });

    const profileLink = screen.getByRole("link", { name: /Abrir perfil de Pedro Costa/i });
    expect(profileLink).toHaveAttribute("href", "/nome-do-racha/atletas/pedro-costa");
  });
});
