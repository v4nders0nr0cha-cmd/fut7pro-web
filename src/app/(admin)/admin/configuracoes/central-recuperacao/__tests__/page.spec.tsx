const mockRedirect = jest.fn();

jest.mock("next/navigation", () => ({
  redirect: (destination: string) => mockRedirect(destination),
}));

import LegacyRecoveryCenterPage from "../page";

describe("rota legada da Central de Recuperação", () => {
  it("redireciona para a nova rota em Administração", () => {
    LegacyRecoveryCenterPage();

    expect(mockRedirect).toHaveBeenCalledWith("/admin/administracao/central-recuperacao");
  });
});
