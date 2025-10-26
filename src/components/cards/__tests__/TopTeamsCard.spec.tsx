import { render, screen, within } from "@testing-library/react";
import { SWRConfig } from "swr";
import TopTeamsCard from "@/components/cards/TopTeamsCard";
import { classificacaoTimes as fallbackClassificacao } from "@/components/lists/mockClassificacaoTimes";

const renderComponent = () =>
  render(
    <SWRConfig value={{ provider: () => new Map() }}>
      <TopTeamsCard />
    </SWRConfig>
  );

beforeEach(() => {
  jest.spyOn(global, "fetch").mockResolvedValue({
    ok: true,
    json: async () => ({ data: fallbackClassificacao }),
  } as unknown as Response);
});

afterEach(() => {
  jest.restoreAllMocks();
});

describe("TopTeamsCard", () => {
  it('renderiza t�tulo e bot�o "Ver todos"', () => {
    renderComponent();

    expect(screen.getByText(/Classifica��o dos Times/i)).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /Ver todos/i })).toBeInTheDocument();
  });

  it("renderiza lista de times corretamente", () => {
    renderComponent();

    expect(screen.getByText("Time Alpha")).toBeInTheDocument();
    expect(screen.getByText("Time Beta")).toBeInTheDocument();
    expect(screen.getByText("Time Gama")).toBeInTheDocument();
  });

  it("renderiza pontua��o dos times", () => {
    renderComponent();

    const alphaRow = screen.getByText("Time Alpha").closest("tr");
    const gamaRow = screen.getByText("Time Gama").closest("tr");
    const omegaRow = screen.getByText("Time �mega").closest("tr");

    expect(alphaRow).not.toBeNull();
    expect(gamaRow).not.toBeNull();
    expect(omegaRow).not.toBeNull();

    expect(within(alphaRow as HTMLElement).getByText("24")).toBeInTheDocument();
    expect(within(gamaRow as HTMLElement).getByText("23")).toBeInTheDocument();
    expect(within(omegaRow as HTMLElement).getByText("22")).toBeInTheDocument();
  });

  it("renderiza estrutura da tabela", () => {
    renderComponent();

    expect(screen.getByText("#")).toBeInTheDocument();
    expect(screen.getByText("Time")).toBeInTheDocument();
    expect(screen.getByText("")).toBeInTheDocument();
    expect(screen.getByText("Pts")).toBeInTheDocument();
  });
});
