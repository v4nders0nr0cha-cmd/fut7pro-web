import { render, screen } from "@testing-library/react";
import CriarPartidasPage from "../page";

let query = "";
const readGuide = jest.fn();
jest.mock("next/navigation", () => ({ useSearchParams: () => new URLSearchParams(query) }));
jest.mock("@/hooks/useAdminGuide", () => ({ useAdminGuide: () => readGuide() }));

function currentGuide() {
  return {
    guideVersion: 3,
    administrator: { status: "APROVADO" },
    capabilities: { manageMatchesAndResults: true },
    tasks: [
      { id: "FIRST_MATCHDAY", route: "/admin/partidas/criar", applicable: true, canAct: true },
    ],
    actionAvailability: { FIRST_MATCHDAY: { allowed: true } },
    operationalState: {
      eligiblePlayerCount: 10,
      eligibleLevelCoverage: 100,
      evaluatedEligiblePlayers: 10,
    },
  };
}
beforeEach(() => {
  query = "";
  readGuide.mockReset();
  readGuide.mockReturnValue({ guide: currentGuide(), validating: false, error: null });
});

it("recommends the draw and keeps classic creation available without querying the guide", () => {
  render(<CriarPartidasPage />);
  expect(screen.getByText("Recomendado")).toBeVisible();
  expect(screen.getByRole("link", { name: "Experimentar Sorteio Inteligente" })).toHaveAttribute(
    "href",
    "/admin/partidas/sorteio-inteligente"
  );
  expect(screen.getByRole("link", { name: "Criar Partida Clássica" })).toHaveAttribute(
    "href",
    "/admin/partidas/criar/classica"
  );
  expect(screen.queryByText(/avaliações dos atletas elegíveis estão salvas/)).toBeNull();
  expect(readGuide).not.toHaveBeenCalled();
});

it.each(["dashboard", "pagina"])("preserves context for both destinations from %s", (origin) => {
  query = `guia=FIRST_MATCHDAY&guiaOrigem=${origin}&guiaRetorno=/admin/partidas/criar-times`;
  render(<CriarPartidasPage />);
  for (const [name, path] of [
    ["Experimentar Sorteio Inteligente", "/admin/partidas/sorteio-inteligente"],
    ["Criar Partida Clássica", "/admin/partidas/criar/classica"],
  ]) {
    const href = screen.getByRole("link", { name }).getAttribute("href")!;
    const url = new URL(href, "https://fixture.invalid");
    expect(url.pathname).toBe(path);
    expect(url.searchParams.get("guia")).toBe("FIRST_MATCHDAY");
    expect(url.searchParams.get("guiaOrigem")).toBe(origin);
    expect(url.searchParams.get("guiaRetorno")).toBe(
      origin === "dashboard" ? "/admin/partidas/criar-times" : null
    );
  }
  expect(screen.getByText(/avaliações dos atletas elegíveis estão salvas/)).toBeVisible();
});

it.each([0, 50, undefined])("does not claim full evaluation coverage at %s", (coverage) => {
  query = "guia=FIRST_MATCHDAY";
  const guide = currentGuide();
  guide.operationalState.eligibleLevelCoverage = coverage as number;
  readGuide.mockReturnValue({ guide });
  render(<CriarPartidasPage />);
  expect(screen.queryByText(/avaliações dos atletas elegíveis estão salvas/)).toBeNull();
  expect(screen.getByText(/Você pode revisar as avaliações disponíveis/)).toBeVisible();
});

it.each(["loading", "refreshing", "error", "permission", "blocked", "unapproved"])(
  "does not present group guidance during %s",
  (state) => {
    query = "guia=FIRST_MATCHDAY";
    const guide = currentGuide();
    if (state === "permission") guide.capabilities.manageMatchesAndResults = false;
    if (state === "blocked") guide.actionAvailability.FIRST_MATCHDAY.allowed = false;
    if (state === "unapproved") guide.administrator.status = "PENDENTE";
    readGuide.mockReturnValue({
      guide: state === "loading" ? null : guide,
      validating: state === "refreshing",
      error: state === "error" ? new Error("offline") : null,
    });
    render(<CriarPartidasPage />);
    expect(screen.queryByText(/avaliações dos atletas elegíveis estão salvas/)).toBeNull();
    expect(screen.queryByText(/Você pode revisar as avaliações disponíveis/)).toBeNull();
    expect(screen.getByRole("link", { name: "Criar Partida Clássica" })).toBeVisible();
  }
);

it("does not infer complete evaluations from a rounded percentage", () => {
  query = "guia=FIRST_MATCHDAY";
  const guide = currentGuide();
  guide.operationalState.eligiblePlayerCount = 200;
  guide.operationalState.evaluatedEligiblePlayers = 199;
  readGuide.mockReturnValue({ guide });
  render(<CriarPartidasPage />);
  expect(screen.queryByText(/avaliações dos atletas elegíveis estão salvas/)).toBeNull();
  expect(screen.getByText(/Você pode revisar as avaliações disponíveis/)).toBeVisible();
});

it("ignores unrelated guide contexts", () => {
  query = "guia=ATHLETE_LEVELS";
  render(<CriarPartidasPage />);
  expect(readGuide).not.toHaveBeenCalled();
  expect(screen.getByRole("link", { name: "Criar Partida Clássica" })).toHaveAttribute(
    "href",
    "/admin/partidas/criar/classica"
  );
});
