import { fireEvent, render, screen } from "@testing-library/react";
import RelatoriosPage from "./page";
import { useAdminAnalytics } from "@/hooks/useAdminAnalytics";

jest.mock("@/hooks/useAdminAnalytics", () => ({ useAdminAnalytics: jest.fn() }));
jest.mock("next/head", () => ({ __esModule: true, default: () => null }));

describe("RelatoriosPage", () => {
  beforeEach(() => {
    (useAdminAnalytics as jest.Mock).mockReturnValue({
      analytics: null,
      isLoading: true,
      isError: false,
    });
  });

  it("seleciona Este Ano na interface e na primeira consulta", () => {
    render(<RelatoriosPage />);
    expect(useAdminAnalytics).toHaveBeenCalledWith({ period: "year" });
    expect(screen.getByRole("button", { name: "Este Ano" })).toHaveClass("bg-cyan-500");
  });

  it.each(["Hoje", "Esta Semana", "Este Mês", "Sempre"])("consulta %s ao selecionar", (label) => {
    render(<RelatoriosPage />);
    fireEvent.click(screen.getByRole("button", { name: label }));
    const periods: Record<string, string> = {
      Hoje: "day",
      "Esta Semana": "week",
      "Este Mês": "month",
      Sempre: "all",
    };
    const period = periods[label];
    expect(useAdminAnalytics).toHaveBeenLastCalledWith({ period });
  });

  it("mostra erro sem exibir zero como dado real", () => {
    (useAdminAnalytics as jest.Mock).mockReturnValue({
      analytics: null,
      isLoading: false,
      isError: true,
    });
    render(<RelatoriosPage />);
    expect(screen.getByRole("alert")).toHaveTextContent("Não foi possível carregar");
    expect(screen.getByRole("button", { name: /Baixar Relatório/ })).toBeDisabled();
  });
});
