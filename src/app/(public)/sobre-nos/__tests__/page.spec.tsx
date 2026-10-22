import { render, screen } from "@testing-library/react";
import SobreNosPage from "../page";

jest.mock("@/hooks/usePublicLinks", () => ({ usePublicLinks: jest.fn() }));
jest.mock("@/hooks/useRachaPublic", () => ({ useRachaPublic: jest.fn() }));

const mockedUsePublicLinks = require("@/hooks/usePublicLinks").usePublicLinks as jest.Mock;
const mockedUseRachaPublic = require("@/hooks/useRachaPublic").useRachaPublic as jest.Mock;

describe("SobreNosPage", () => {
  beforeEach(() => {
    mockedUsePublicLinks.mockReturnValue({
      publicSlug: "pelada-da-sexta",
      publicHref: (path: string) => `/pelada-da-sexta${path}`,
    });
    mockedUseRachaPublic.mockReturnValue({
      racha: { nome: "Pelada da Sexta", financeiroVisivel: false },
    });
  });

  afterEach(() => jest.clearAllMocks());

  it("mantém os cartões e links do grupo sem expor finanças desativadas", () => {
    render(<SobreNosPage />);

    expect(screen.getByRole("heading", { name: "Sobre Nós" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /Nossa História/i })).toHaveAttribute(
      "href",
      "/pelada-da-sexta/sobre-nos/nossa-historia"
    );
    expect(screen.getByRole("link", { name: /Estatuto/i })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /Aniversariantes/i })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /Nossos Parceiros/i })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /Contatos/i })).toBeInTheDocument();
    expect(screen.queryByRole("link", { name: /Prestação de Contas/i })).not.toBeInTheDocument();
  });

  it("exibe prestação de contas apenas quando o grupo permite", () => {
    mockedUseRachaPublic.mockReturnValue({
      racha: { nome: "Pelada da Sexta", financeiroVisivel: true },
    });

    render(<SobreNosPage />);

    expect(screen.getByRole("link", { name: /Prestação de Contas/i })).toHaveAttribute(
      "href",
      "/pelada-da-sexta/sobre-nos/prestacao-de-contas"
    );
  });
});
