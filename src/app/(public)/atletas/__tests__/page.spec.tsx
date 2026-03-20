import { render, screen } from "@testing-library/react";
import ListaAtletasPage from "../page";

jest.mock("@/context/RachaContext", () => ({
  useRacha: jest.fn(),
}));

jest.mock("@/hooks/usePublicLinks", () => ({
  usePublicLinks: jest.fn(),
}));

jest.mock("@/hooks/usePublicPlayerRankings", () => ({
  usePublicPlayerRankings: jest.fn(),
}));

const mockedUseRacha = require("@/context/RachaContext").useRacha as jest.Mock;
const mockedUsePublicLinks = require("@/hooks/usePublicLinks").usePublicLinks as jest.Mock;
const mockedUsePublicPlayerRankings = require("@/hooks/usePublicPlayerRankings")
  .usePublicPlayerRankings as jest.Mock;

describe("ListaAtletasPage", () => {
  beforeEach(() => {
    mockedUseRacha.mockReturnValue({ tenantSlug: "nome-do-racha" });
    mockedUsePublicLinks.mockReturnValue({
      publicHref: (path: string) => `/nome-do-racha${path}`,
    });
    mockedUsePublicPlayerRankings.mockReturnValue({
      rankings: [
        {
          id: "atleta-1",
          slug: "joao-silva",
          nome: "João Silva",
          foto: null,
          jogos: 10,
          gols: 8,
          assistencias: 4,
          pontos: 25,
        },
      ],
      isLoading: false,
      isError: false,
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it("renderiza link navegavel para o perfil no bloco do atleta", () => {
    render(<ListaAtletasPage />);

    const profileLink = screen.getByRole("link", { name: /Abrir perfil de João Silva/i });
    expect(profileLink).toHaveAttribute("href", "/nome-do-racha/atletas/joao-silva");
  });
});
