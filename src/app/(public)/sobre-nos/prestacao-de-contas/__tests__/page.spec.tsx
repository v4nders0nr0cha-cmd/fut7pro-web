import { render, screen } from "@testing-library/react";
import PrestacaoDeContasPage from "../page";

jest.mock("@/context/RachaContext", () => ({
  useRacha: jest.fn(),
}));

jest.mock("@/hooks/usePublicLinks", () => ({
  usePublicLinks: jest.fn(),
}));

jest.mock("@/hooks/useFinanceiroPublic", () => ({
  useFinanceiroPublic: jest.fn(),
}));

const mockedUseRacha = require("@/context/RachaContext").useRacha as jest.Mock;
const mockedUsePublicLinks = require("@/hooks/usePublicLinks").usePublicLinks as jest.Mock;
const mockedUseFinanceiroPublic = require("@/hooks/useFinanceiroPublic")
  .useFinanceiroPublic as jest.Mock;

describe("PrestacaoDeContasPage", () => {
  beforeEach(() => {
    mockedUseRacha.mockReturnValue({ tenantSlug: "vitrine" });
    mockedUsePublicLinks.mockReturnValue({ publicSlug: "vitrine" });
    mockedUseFinanceiroPublic.mockReturnValue({
      resumo: null,
      lancamentos: [],
      isLoading: false,
      isError: null,
      isNotFound: true,
      tenant: { name: "Vitrine" },
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it("renderiza empty state contextual quando financeiro retorna 404 para slug valido", () => {
    render(<PrestacaoDeContasPage />);

    expect(
      screen.getByRole("heading", { name: "Prestação de contas indisponível" })
    ).toBeInTheDocument();
    expect(screen.getByText(/ainda não publicou lançamentos financeiros/i)).toBeInTheDocument();
    expect(
      screen.queryByText(/Este racha não existe ou não está disponível/i)
    ).not.toBeInTheDocument();
  });

  it("renderiza estado de modulo desativado", () => {
    mockedUseFinanceiroPublic.mockReturnValue({
      resumo: null,
      lancamentos: [],
      isLoading: false,
      isError: null,
      isNotFound: false,
      isSlugNotFound: false,
      isModuleDisabled: true,
      tenant: { name: "Vitrine" },
    });

    render(<PrestacaoDeContasPage />);
    expect(
      screen.getByRole("heading", { name: "Prestação de contas não publicada" })
    ).toBeInTheDocument();
  });

  it("renderiza estado de slug invalido", () => {
    mockedUseFinanceiroPublic.mockReturnValue({
      resumo: null,
      lancamentos: [],
      isLoading: false,
      isError: null,
      isNotFound: false,
      isSlugNotFound: true,
      isModuleDisabled: false,
      tenant: null,
    });

    render(<PrestacaoDeContasPage />);
    expect(screen.getByRole("heading", { name: "Racha não encontrado" })).toBeInTheDocument();
  });
});
