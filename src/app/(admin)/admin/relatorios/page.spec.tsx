import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import RelatoriosPage from "./page";
import { useAdminAnalytics } from "@/hooks/useAdminAnalytics";
import { showFut7Toast } from "@/components/ui/feedback";

jest.mock("@/hooks/useAdminAnalytics", () => ({ useAdminAnalytics: jest.fn() }));
jest.mock("@/components/ui/feedback", () => ({ showFut7Toast: jest.fn() }));
jest.mock("next/head", () => ({ __esModule: true, default: () => null }));

describe("RelatoriosPage", () => {
  const originalShare = Object.getOwnPropertyDescriptor(navigator, "share");
  const originalClipboard = Object.getOwnPropertyDescriptor(navigator, "clipboard");

  beforeEach(() => {
    (useAdminAnalytics as jest.Mock).mockReturnValue({
      analytics: null,
      isLoading: true,
      isError: false,
    });
  });

  afterEach(() => {
    if (originalShare) Object.defineProperty(navigator, "share", originalShare);
    else delete (navigator as Navigator & { share?: Navigator["share"] }).share;
    if (originalClipboard) Object.defineProperty(navigator, "clipboard", originalClipboard);
    else delete (navigator as Navigator & { clipboard?: Clipboard }).clipboard;
    jest.clearAllMocks();
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

  it("copia um resumo com o periodo e os valores reais quando o compartilhamento nativo nao existe", async () => {
    (useAdminAnalytics as jest.Mock).mockReturnValue({
      analytics: {
        period: "year",
        summary: {
          participations: 940,
          uniqueAthletes: 36,
          newPlayers: 37,
          matchesPublished: 61,
          sponsorsClicks: 7,
        },
        timeseries: [],
        events: [],
      },
      isLoading: false,
      isError: false,
    });
    Object.defineProperty(navigator, "share", { configurable: true, value: undefined });
    const writeText = jest.fn().mockResolvedValue(undefined);
    Object.defineProperty(navigator, "clipboard", {
      configurable: true,
      value: { writeText },
    });

    render(<RelatoriosPage />);
    fireEvent.click(screen.getByRole("button", { name: "Sempre" }));
    fireEvent.click(screen.getByRole("button", { name: "Compartilhar" }));

    await waitFor(() => expect(writeText).toHaveBeenCalledTimes(1));
    expect(writeText).toHaveBeenCalledWith(expect.stringContaining("Sempre"));
    expect(writeText).toHaveBeenCalledWith(expect.stringContaining("940"));
    expect(showFut7Toast).toHaveBeenCalledWith(
      expect.objectContaining({ title: "Resumo copiado" })
    );
  });

  it("mantem o compartilhamento nativo quando o navegador oferece suporte", async () => {
    (useAdminAnalytics as jest.Mock).mockReturnValue({
      analytics: {
        period: "year",
        summary: {
          participations: 2,
          uniqueAthletes: 2,
          newPlayers: 1,
          matchesPublished: 1,
          sponsorsClicks: 0,
        },
        timeseries: [],
        events: [],
      },
      isLoading: false,
      isError: false,
    });
    const share = jest.fn().mockResolvedValue(undefined);
    Object.defineProperty(navigator, "share", { configurable: true, value: share });
    const writeText = jest.fn();
    Object.defineProperty(navigator, "clipboard", {
      configurable: true,
      value: { writeText },
    });

    render(<RelatoriosPage />);
    fireEvent.click(screen.getByRole("button", { name: "Compartilhar" }));

    await waitFor(() => expect(share).toHaveBeenCalledTimes(1));
    expect(share).toHaveBeenCalledWith(
      expect.objectContaining({ text: expect.stringContaining("Este Ano") })
    );
    expect(writeText).not.toHaveBeenCalled();
  });
});
