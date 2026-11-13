import { redirect } from "next/navigation";
import LegacySolicitacoesPage from "../page";

jest.mock("next/navigation", () => ({ redirect: jest.fn() }));

it("preserva links antigos sem usar a página intermediária", () => {
  LegacySolicitacoesPage();
  expect(redirect).toHaveBeenCalledWith("/admin/jogadores/listar-cadastrar#solicitacoes");
});
