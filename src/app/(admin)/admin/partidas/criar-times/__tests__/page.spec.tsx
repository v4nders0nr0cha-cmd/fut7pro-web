import { fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import type { ReactNode } from "react";
import GerenciarTimesPage from "../page";
import { TimesApiError } from "@/hooks/useTimes";

const addTime = jest.fn();
const updateTime = jest.fn();
const deleteTime = jest.fn();
const archiveTime = jest.fn();
const restoreTime = jest.fn();
const mutate = jest.fn();

let mockedTimes: any[] = [];
let mockedLoading = false;

jest.mock("next/head", () => ({
  __esModule: true,
  default: ({ children }: { children: ReactNode }) => <>{children}</>,
}));

jest.mock("next/image", () => ({
  __esModule: true,
  default: ({ alt, ...props }: any) => <img alt={alt} {...props} />,
}));

jest.mock("@/context/RachaContext", () => ({
  useRacha: () => ({ tenantSlug: "racha-teste" }),
}));

jest.mock("@/components/ui/feedback", () => {
  const actual = jest.requireActual("@/components/ui/feedback");
  return {
    ...actual,
    showFut7Toast: jest.fn(),
  };
});

jest.mock("@/hooks/useTimes", () => {
  const actual = jest.requireActual("@/hooks/useTimes");
  return {
    ...actual,
    useTimes: jest.fn(() => ({
      times: mockedTimes,
      isLoading: mockedLoading,
      isError: false,
      addTime,
      updateTime,
      deleteTime,
      archiveTime,
      restoreTime,
      mutate,
    })),
  };
});

const activeWithHistory = {
  id: "team-1",
  nome: "Casa do Gamer",
  cor: "#22c55e",
  logo: "/images/times/time_padrao_01.png",
  archivedAt: null,
  matchCount: 23,
  hasHistoricalUsage: true,
  canDelete: false,
};

const activeWithoutHistory = {
  id: "team-2",
  nome: "Academia Performance Sobral",
  cor: "#facc15",
  logo: "/images/times/time_padrao_02.png",
  archivedAt: null,
  matchCount: 0,
  hasHistoricalUsage: false,
  canDelete: true,
};

const archivedTeam = {
  id: "team-3",
  nome: "Falcões",
  cor: "#f97316",
  logo: "/images/times/time_padrao_03.png",
  archivedAt: "2026-09-07T12:00:00.000Z",
  matchCount: 0,
  hasHistoricalUsage: true,
  canDelete: false,
};

describe("GerenciarTimesPage", () => {
  beforeEach(() => {
    mockedTimes = [activeWithHistory, activeWithoutHistory, archivedTeam];
    mockedLoading = false;
    addTime.mockResolvedValue(undefined);
    updateTime.mockResolvedValue(undefined);
    deleteTime.mockResolvedValue(undefined);
    archiveTime.mockResolvedValue(undefined);
    restoreTime.mockResolvedValue(undefined);
    mutate.mockResolvedValue(undefined);
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ url: "/uploads/logo.png" }),
    }) as any;
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it("renderiza ativos por padrão com título, contagem e ações corretas", () => {
    render(<GerenciarTimesPage />);

    expect(screen.getByRole("heading", { name: "Gerenciar Times" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Dicas de Monetização" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Novo Time" })).toBeInTheDocument();
    expect(screen.getByRole("tab", { name: "Ativos 2" })).toHaveAttribute("aria-selected", "true");
    expect(screen.getByRole("tab", { name: "Arquivados 1" })).toBeInTheDocument();
    expect(screen.getByText("Casa do Gamer")).toBeInTheDocument();
    expect(screen.getByText("23 partidas registradas")).toBeInTheDocument();
    expect(screen.getByText("Academia Performance Sobral")).toBeInTheDocument();
    expect(screen.getByText("0 partidas registradas")).toBeInTheDocument();
    expect(screen.queryByText("URL da Logo (opcional)")).not.toBeInTheDocument();
    expect(screen.queryByText("Plano Básico")).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Excluir Casa do Gamer" })).not.toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Arquivar Casa do Gamer" })).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Excluir Academia Performance Sobral" })
    ).toBeInTheDocument();
  });

  it("renderiza arquivados e permite reativar", async () => {
    render(<GerenciarTimesPage />);

    fireEvent.click(screen.getByRole("tab", { name: "Arquivados 1" }));
    expect(screen.getByText("Falcões")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Reativar Falcões" }));

    await waitFor(() => expect(restoreTime).toHaveBeenCalledWith("team-3"));
  });

  it("abre modal de novo time e envia upload visual sem exibir URL técnica", async () => {
    render(<GerenciarTimesPage />);

    fireEvent.click(screen.getByRole("button", { name: "Novo Time" }));
    expect(screen.getByRole("heading", { name: "Adicionar time" })).toBeInTheDocument();
    expect(screen.getByLabelText("Nome do time")).toBeInTheDocument();
    expect(screen.getByLabelText("Cor do time")).toBeInTheDocument();
    expect(screen.getByText("Logo do time")).toBeInTheDocument();
    expect(screen.queryByText("URL da Logo (opcional)")).not.toBeInTheDocument();

    const input = document.querySelector('input[type="file"]') as HTMLInputElement;
    const file = new File(["logo"], "logo.webp", { type: "image/webp" });
    fireEvent.change(input, { target: { files: [file] } });

    await waitFor(() =>
      expect(global.fetch).toHaveBeenCalledWith(
        "/api/uploads/team-logo",
        expect.objectContaining({ method: "POST" })
      )
    );

    fireEvent.change(screen.getByLabelText("Nome do time"), {
      target: { value: "Casa do Gamer" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Adicionar time" }));

    await waitFor(() =>
      expect(addTime).toHaveBeenCalledWith(
        expect.objectContaining({ nome: "Casa do Gamer", logoUrl: "/uploads/logo.png" })
      )
    );
  });

  it("mostra aviso ao editar time com histórico", () => {
    render(<GerenciarTimesPage />);

    fireEvent.click(screen.getByRole("button", { name: "Editar Casa do Gamer" }));

    expect(screen.getByRole("heading", { name: "Editando: Casa do Gamer" })).toBeInTheDocument();
    expect(screen.getByText("Time com histórico")).toBeInTheDocument();
    expect(
      screen.getByText(/Alterações de nome, logo ou cor também podem aparecer em registros antigos/)
    ).toBeInTheDocument();
  });

  it("confirma arquivamento com copy de preservação de histórico", async () => {
    render(<GerenciarTimesPage />);

    fireEvent.click(screen.getByRole("button", { name: "Arquivar Casa do Gamer" }));
    expect(screen.getByText("Arquivar Casa do Gamer?")).toBeInTheDocument();
    expect(
      screen.getByText(
        "Este time deixará de aparecer em novos sorteios e partidas, mas todo o histórico do racha continuará preservado."
      )
    ).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Arquivar time" }));
    await waitFor(() => expect(archiveTime).toHaveBeenCalledWith("team-1"));
  });

  it("usa dialog destrutivo somente para time sem histórico e trata erro de domínio", async () => {
    deleteTime.mockRejectedValueOnce(new TimesApiError("bloqueado", "TEAM_HAS_HISTORICAL_USAGE"));
    render(<GerenciarTimesPage />);

    fireEvent.click(screen.getByRole("button", { name: "Excluir Academia Performance Sobral" }));
    expect(screen.getByText("Excluir Academia Performance Sobral?")).toBeInTheDocument();
    expect(
      screen.getByText(
        "Este time ainda não possui histórico registrado e poderá ser excluído definitivamente."
      )
    ).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Excluir time" }));

    await waitFor(() =>
      expect(
        screen.getByText(
          "Este time já faz parte do histórico do racha e não pode ser excluído. Arquive-o para deixar de utilizá-lo em novas partidas."
        )
      ).toBeInTheDocument()
    );
  });

  it("só mostra Excluir quando canDelete, histórico e partidas são coerentes", () => {
    mockedTimes = [
      {
        ...activeWithoutHistory,
        id: "sem-can-delete",
        nome: "Sem permissão explícita",
        canDelete: undefined,
      },
      {
        ...activeWithoutHistory,
        id: "historico-contraditorio",
        nome: "Histórico contraditório",
        hasHistoricalUsage: true,
        canDelete: true,
      },
      {
        ...activeWithoutHistory,
        id: "partida-contraditoria",
        nome: "Partida contraditória",
        matchCount: 1,
        hasHistoricalUsage: false,
        canDelete: true,
      },
      {
        ...activeWithoutHistory,
        id: "delete-coerente",
        nome: "Delete coerente",
        matchCount: 0,
        hasHistoricalUsage: false,
        canDelete: true,
      },
    ];

    render(<GerenciarTimesPage />);

    expect(
      screen.queryByRole("button", { name: "Excluir Sem permissão explícita" })
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: "Excluir Histórico contraditório" })
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: "Excluir Partida contraditória" })
    ).not.toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Excluir Delete coerente" })).toBeInTheDocument();
  });

  it("mostra empty states de ativos e arquivados", () => {
    mockedTimes = [];
    render(<GerenciarTimesPage />);

    expect(screen.getByText("Nenhum time ativo")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("tab", { name: "Arquivados 0" }));
    expect(screen.getByText("Nenhum time arquivado")).toBeInTheDocument();
  });

  it("mostra modal de Naming Rights sem planos antigos", () => {
    render(<GerenciarTimesPage />);

    fireEvent.click(screen.getByRole("button", { name: "Dicas de Monetização" }));
    const dialog = screen.getByRole("dialog");

    expect(within(dialog).getByText("Dicas de Monetização com Times")).toBeInTheDocument();
    expect(within(dialog).getByText("Naming Rights")).toBeInTheDocument();
    expect(within(dialog).getByText("Time Amarelo")).toBeInTheDocument();
    expect(within(dialog).getByText("Casa do Gamer")).toBeInTheDocument();
    expect(within(dialog).queryByText("Plano Básico")).not.toBeInTheDocument();
    expect(within(dialog).queryByText("Plano Médio")).not.toBeInTheDocument();
    expect(within(dialog).queryByText("Plano Master")).not.toBeInTheDocument();
  });
});
