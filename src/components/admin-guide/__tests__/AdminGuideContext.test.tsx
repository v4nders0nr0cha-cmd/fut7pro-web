import { fireEvent, render, screen } from "@testing-library/react";
import AdminGuideContext from "../AdminGuideContext";
import { notifyAdminGuideChanged } from "@/lib/admin-guide-events";
const retry = jest.fn();
let params = "guia=OFFICIAL_TEAMS";
let guide: any;
jest.mock("next/navigation", () => ({
  usePathname: () => "/admin/partidas/criar-times",
  useSearchParams: () => new URLSearchParams(params),
}));
jest.mock("@/hooks/useAdminGuide", () => ({ useAdminGuide: () => ({ retry, guide }) }));
beforeEach(() => {
  jest.clearAllMocks();
  params = "guia=OFFICIAL_TEAMS";
  guide = {
    tenant: { slug: "pelada" },
    operationalState: { activeOfficialTeams: 0 },
    tasks: [
      {
        id: "OFFICIAL_TEAMS",
        title: "Cadastre os times oficiais",
        route: "/admin/partidas/criar-times",
        applicable: true,
        canAct: true,
        completed: false,
      },
    ],
  };
});
it("revalidates after a saved operation and removes its listener when leaving", () => {
  const timer = jest.spyOn(window, "setInterval");
  const { unmount } = render(<AdminGuideContext />);
  expect(timer).not.toHaveBeenCalled();
  notifyAdminGuideChanged();
  expect(retry).toHaveBeenCalledTimes(1);
  unmount();
  notifyAdminGuideChanged();
  expect(retry).toHaveBeenCalledTimes(1);
  timer.mockRestore();
});
it("takes the administrator to the real team creation action", () => {
  const scroll = jest.fn();
  const { getByRole } = render(
    <>
      <AdminGuideContext />
      <button
        ref={(element) => {
          if (element) {
            element.scrollIntoView = scroll;
            element.getClientRects = () => ({ length: 1 }) as DOMRectList;
          }
        }}
      >
        Novo Time
      </button>
    </>
  );
  fireEvent.click(screen.getByRole("button", { name: "Mostrar Novo Time" }));
  expect(scroll).toHaveBeenCalled();
  expect(getByRole("button", { name: "Novo Time" })).toHaveFocus();
});

it("refreshes saved operations even without a guia parameter, without rendering guidance", () => {
  params = "";
  render(<AdminGuideContext />);
  notifyAdminGuideChanged();
  expect(retry).toHaveBeenCalledTimes(1);
  expect(screen.queryByRole("complementary")).not.toBeInTheDocument();
});
it("uses real team counts, preserves an open form, and returns to the originating guide", () => {
  params = "guia=OFFICIAL_TEAMS&guiaOrigem=dashboard";
  const Page = () => (
    <>
      <AdminGuideContext />
      <input aria-label="Nome em edição" defaultValue="Time ainda em edição" />
    </>
  );
  const view = render(<Page />);
  guide.operationalState.activeOfficialTeams = 1;
  view.rerender(<Page />);
  expect(screen.getByText(/falta mais um time/)).toBeVisible();
  expect(screen.getByRole("link", { name: "Voltar ao guia" })).toHaveAttribute(
    "href",
    "/admin/dashboard?retomarGuia=1&grupoGuia=pelada"
  );
  guide.operationalState.activeOfficialTeams = 2;
  guide.tasks[0].completed = true;
  view.rerender(<Page />);
  expect(screen.getByRole("heading", { name: "Etapa concluída!" })).toBeVisible();
  expect(
    screen.getByText("Você já cadastrou os dois times necessários para concluir esta etapa!")
  ).toBeVisible();
  expect(screen.getByText(/Se sua pelada utiliza mais equipes/)).toBeVisible();
  expect(screen.getByRole("button", { name: "Cadastrar outro time" })).toBeVisible();
  expect(screen.getByRole("textbox", { name: "Nome em edição" })).toHaveValue(
    "Time ainda em edição"
  );
  expect(screen.getByRole("link", { name: "Continuar guia" })).toHaveAttribute(
    "href",
    "/admin/dashboard?retomarGuia=1&grupoGuia=pelada"
  );
  params = "guia=OFFICIAL_TEAMS&guiaOrigem=pagina";
  view.rerender(<Page />);
  expect(screen.getByRole("link", { name: "Continuar guia" })).toHaveAttribute(
    "href",
    "/admin/guia-fut7pro"
  );
});

it("returns manual guidance to a validated originating modal page", () => {
  params = "guia=OFFICIAL_TEAMS&guiaOrigem=dashboard&guiaRetorno=%2Fadmin%2Ffinanceiro";
  render(<AdminGuideContext />);
  expect(screen.getByRole("link", { name: "Voltar ao guia" })).toHaveAttribute(
    "href",
    "/admin/financeiro?retomarGuia=1&grupoGuia=pelada"
  );
});
