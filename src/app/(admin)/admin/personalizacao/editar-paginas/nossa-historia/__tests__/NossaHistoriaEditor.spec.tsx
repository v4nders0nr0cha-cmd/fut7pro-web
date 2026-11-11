import { render, screen, waitFor } from "@testing-library/react";
import NossaHistoriaEditor from "../NossaHistoriaEditor";
import { DEFAULT_NOSSA_HISTORIA_DESCRIPTION } from "@/lib/nossa-historia-description";

jest.mock("@/hooks/useAbout", () => ({ useAboutAdmin: jest.fn() }));
jest.mock("@/hooks/usePublicLinks", () => ({ usePublicLinks: jest.fn() }));
jest.mock("@/hooks/useRachaPublic", () => ({ useRachaPublic: jest.fn() }));
jest.mock("@/hooks/usePublicAthletes", () => ({ usePublicAthletes: jest.fn() }));

const mockedUseAboutAdmin = require("@/hooks/useAbout").useAboutAdmin as jest.Mock;
const mockedUsePublicLinks = require("@/hooks/usePublicLinks").usePublicLinks as jest.Mock;
const mockedUseRachaPublic = require("@/hooks/useRachaPublic").useRachaPublic as jest.Mock;
const mockedUsePublicAthletes = require("@/hooks/usePublicAthletes").usePublicAthletes as jest.Mock;

describe("NossaHistoriaEditor", () => {
  beforeEach(() => {
    mockedUseAboutAdmin.mockReturnValue({ about: null, update: jest.fn(), isLoading: false });
    mockedUsePublicLinks.mockReturnValue({
      publicSlug: "pelada-da-sexta",
      publicHref: (path: string) => `/pelada-da-sexta${path}`,
    });
    mockedUseRachaPublic.mockReturnValue({
      racha: { nome: "Pelada da Sexta", admins: [{ role: "presidente", nome: "Maria" }] },
      isLoading: false,
    });
    mockedUsePublicAthletes.mockReturnValue({ athletes: [], isLoading: false });
  });

  afterEach(() => jest.clearAllMocks());

  it("apresenta o novo texto padrão sem atribuir a fundação ao presidente", async () => {
    render(<NossaHistoriaEditor />);

    await waitFor(() => {
      expect(screen.getByPlaceholderText("Conte a origem e os valores do racha.")).toHaveValue(
        DEFAULT_NOSSA_HISTORIA_DESCRIPTION
      );
    });
  });

  it("preserva uma descrição personalizada carregada no editor", async () => {
    const descricao = "O racha foi fundado por amigos do bairro e ganhou sua própria tradição.";
    mockedUseAboutAdmin.mockReturnValue({
      about: { descricao },
      update: jest.fn(),
      isLoading: false,
    });

    render(<NossaHistoriaEditor />);

    await waitFor(() => {
      expect(screen.getByPlaceholderText("Conte a origem e os valores do racha.")).toHaveValue(
        descricao
      );
    });
  });

  it("reconhece o modelo antigo salvo e mostra a nova narrativa no editor", async () => {
    mockedUseAboutAdmin.mockReturnValue({
      about: {
        descricao:
          "O racha Pelada da Sexta nasceu da amizade e da paixão pelo futebol entre amigos. Fundado por Maria, começou como uma pelada de rotina e, com o tempo, virou tradição, união e resenha. Nossa história é feita de gols, rivalidade saudável e momentos inesquecíveis, sempre com respeito, espírito esportivo e aquele clima de time fechado.",
      },
      update: jest.fn(),
      isLoading: false,
    });

    render(<NossaHistoriaEditor />);

    await waitFor(() => {
      expect(screen.getByPlaceholderText("Conte a origem e os valores do racha.")).toHaveValue(
        DEFAULT_NOSSA_HISTORIA_DESCRIPTION
      );
    });
  });
});
