import { render, screen } from "@testing-library/react";
import CardResumoPatrocinio from "@/app/(admin)/admin/financeiro/patrocinadores/components/CardResumoPatrocinio";
import type { Patrocinador } from "@/types/financeiro";

// Recharts depende de medidas reais do DOM; simplificamos para evitar warnings em jsdom.
jest.mock("recharts", () => {
  const Original = jest.requireActual("recharts");
  return {
    ...Original,
    ResponsiveContainer: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
    LineChart: ({ children, data }: { children: React.ReactNode; data: unknown[] }) => (
      <div data-testid="line-chart" data-count={data?.length ?? 0}>
        {children}
      </div>
    ),
    Line: () => <div data-testid="line" />,
    XAxis: () => <div data-testid="x-axis" />,
    YAxis: () => <div data-testid="y-axis" />,
    Tooltip: () => <div data-testid="tooltip" />,
    CartesianGrid: () => <div data-testid="grid" />,
  };
});

const patrocinadores: Patrocinador[] = [
  {
    id: "p1",
    nome: "Loja Esportiva",
    status: "ativo",
    valor: 1000,
    periodoInicio: "2025-02-10",
    periodoFim: "2025-06-10",
    logo: "/logo1.png",
    visivel: true,
    comprovantes: [],
  },
  {
    id: "p2",
    nome: "Restaurante",
    status: "encerrado",
    valor: 500,
    periodoInicio: "2025-02-20",
    periodoFim: "2025-03-20",
    logo: "/logo2.png",
    visivel: true,
    comprovantes: [],
  },
  {
    id: "p3",
    nome: "Oficina",
    status: "inativo",
    valor: 999,
    periodoInicio: "2025-04-01",
    periodoFim: "2025-04-30",
    logo: "/logo3.png",
    visivel: false,
    comprovantes: [],
  },
  {
    id: "p4",
    nome: "Academia",
    status: "ativo",
    valor: 2000,
    periodoInicio: "2025-04-05",
    periodoFim: "2025-12-01",
    logo: "/logo4.png",
    visivel: true,
    comprovantes: [],
  },
  {
    id: "p5",
    nome: "Fora do período",
    status: "ativo",
    valor: 800,
    periodoInicio: "2026-01-01",
    periodoFim: "2026-12-31",
    logo: "/logo5.png",
    visivel: false,
    comprovantes: [],
  },
];

describe("CardResumoPatrocinio", () => {
  it("soma apenas patrocinadores ativos/encerrados no período e agrupa por mês de início", () => {
    render(
      <CardResumoPatrocinio
        patrocinadores={patrocinadores}
        periodo={{ inicio: "2025-01-01", fim: "2025-12-31" }}
      />
    );

    expect(screen.getByText(/Total de Patroc/i).nextSibling?.textContent?.trim()).toContain(
      "R$ 3.500,00"
    );

    expect(screen.getByText(/Recebido entre/)).toBeInTheDocument();

    const chart = screen.getByTestId("line-chart");
    expect(chart).toHaveAttribute("data-count", "2"); // fevereiro e abril
  });
});
