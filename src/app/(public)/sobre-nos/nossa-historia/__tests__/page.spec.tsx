import { render, screen } from "@testing-library/react";
import NossaHistoriaPage from "../page";
import { DEFAULT_NOSSA_HISTORIA } from "@/utils/schemas/nossaHistoria.schema";

jest.mock("@/hooks/useAbout", () => ({ useAboutPublic: jest.fn() }));
jest.mock("@/hooks/useFooterConfig", () => ({ useFooterConfigPublic: jest.fn() }));
jest.mock("@/hooks/usePublicPlayerRankings", () => ({ usePublicPlayerRankings: jest.fn() }));
jest.mock("@/hooks/usePublicMatches", () => ({ usePublicMatches: jest.fn() }));
jest.mock("@/hooks/useTimesDoDiaPublicado", () => ({ useTimesDoDiaPublicado: jest.fn() }));
jest.mock("@/hooks/usePublicAthletes", () => ({ usePublicAthletes: jest.fn() }));
jest.mock("@/hooks/useRachaPublic", () => ({ useRachaPublic: jest.fn() }));
jest.mock("@/context/RachaContext", () => ({ useRacha: jest.fn() }));
jest.mock("@/hooks/usePublicLinks", () => ({ usePublicLinks: jest.fn() }));

const mockedUseAboutPublic = require("@/hooks/useAbout").useAboutPublic as jest.Mock;
const mockedUseFooterConfigPublic = require("@/hooks/useFooterConfig")
  .useFooterConfigPublic as jest.Mock;
const mockedUsePublicPlayerRankings = require("@/hooks/usePublicPlayerRankings")
  .usePublicPlayerRankings as jest.Mock;
const mockedUsePublicMatches = require("@/hooks/usePublicMatches").usePublicMatches as jest.Mock;
const mockedUseTimesDoDiaPublicado = require("@/hooks/useTimesDoDiaPublicado")
  .useTimesDoDiaPublicado as jest.Mock;
const mockedUsePublicAthletes = require("@/hooks/usePublicAthletes").usePublicAthletes as jest.Mock;
const mockedUseRachaPublic = require("@/hooks/useRachaPublic").useRachaPublic as jest.Mock;
const mockedUseRacha = require("@/context/RachaContext").useRacha as jest.Mock;
const mockedUsePublicLinks = require("@/hooks/usePublicLinks").usePublicLinks as jest.Mock;

describe("NossaHistoriaPage", () => {
  beforeEach(() => {
    mockedUseRacha.mockReturnValue({ tenantSlug: "pelada-da-sexta" });
    mockedUsePublicLinks.mockReturnValue({
      publicSlug: "pelada-da-sexta",
      publicHref: (path: string) => `/pelada-da-sexta${path}`,
    });
    mockedUseFooterConfigPublic.mockReturnValue({ footer: null });
    mockedUseTimesDoDiaPublicado.mockReturnValue({ data: null });
    mockedUsePublicAthletes.mockReturnValue({ athletes: [] });
    mockedUsePublicPlayerRankings.mockReturnValue({ rankings: [] });
    mockedUsePublicMatches.mockReturnValue({ matches: [] });
    mockedUseRachaPublic.mockReturnValue({
      racha: { nome: "Pelada da Sexta", admins: [] },
    });
    mockedUseAboutPublic.mockReturnValue({
      about: { descricao: DEFAULT_NOSSA_HISTORIA.descricao },
    });
  });

  afterEach(() => jest.clearAllMocks());

  it("apresenta o modelo legado com o nome intacto e mantém as seções ilustrativas", () => {
    render(<NossaHistoriaPage />);

    expect(
      screen.getByText(/Nossa história começou com a amizade e a paixão pelo futebol/)
    ).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Linha do Tempo" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Galeria de Fotos" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Nossas Curiosidades" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Depoimentos" })).toBeInTheDocument();
  });

  it("mantém a descrição personalizada acima do texto padrão", () => {
    mockedUseRachaPublic.mockReturnValue({ racha: { nome: "Baba dos Amigos", admins: [] } });
    mockedUseAboutPublic.mockReturnValue({
      about: { descricao: "Nossa história foi escrita pela administração do Baba dos Amigos." },
    });

    render(<NossaHistoriaPage />);

    expect(
      screen.getByText("Nossa história foi escrita pela administração do Baba dos Amigos.")
    ).toBeInTheDocument();
    expect(screen.queryByText(/Nossa história começou com a amizade/)).not.toBeInTheDocument();
  });

  it("não atribui a origem da história ao presidente atual no texto padrão", () => {
    mockedUseRachaPublic.mockReturnValue({
      racha: { nome: "Baba dos Amigos", admins: [{ role: "presidente", nome: "Maria" }] },
    });

    render(<NossaHistoriaPage />);

    expect(screen.getByText(/Nossa história começou com a amizade/)).toBeInTheDocument();
    expect(screen.queryByText(/Com Maria, os encontros/)).not.toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Linha do Tempo" })).toBeInTheDocument();
  });

  it("preserva marcos e fotos personalizados", () => {
    mockedUseAboutPublic.mockReturnValue({
      about: {
        descricao: "História escrita pelo grupo.",
        marcos: [{ ano: "2024", titulo: "Nosso primeiro jogo", descricao: "Começamos no bairro." }],
        categoriasFotos: [
          {
            id: "foto-do-grupo",
            src: "/images/historia/foto_antiga_01.png",
            titulo: "Nossa primeira foto",
            descricao: "Registro enviado pela administração.",
          },
        ],
      },
    });

    render(<NossaHistoriaPage />);

    expect(screen.getByText("Nosso primeiro jogo")).toBeInTheDocument();
    expect(screen.getByText("Nossa primeira foto")).toBeInTheDocument();
    expect(screen.getByText("Registro enviado pela administração.")).toBeInTheDocument();
    expect(screen.queryByText("Fundação do Racha")).not.toBeInTheDocument();
  });

  it("mantém a linha do tempo ilustrativa para marcos no formato legado", () => {
    mockedUseAboutPublic.mockReturnValue({
      about: {
        marcos: [{ ano: "Ano 1", titulo: "Marco legado", descricao: "Texto antigo" }],
      },
    });

    render(<NossaHistoriaPage />);

    expect(screen.getByText("Primeiros jogos")).toBeInTheDocument();
    expect(screen.queryByText("Marco legado")).not.toBeInTheDocument();
  });
});
