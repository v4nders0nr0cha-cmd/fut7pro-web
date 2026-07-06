import { render, screen } from "@testing-library/react";
import AguardandoAprovacaoClient from "../AguardandoAprovacaoClient";

jest.mock("@/hooks/useTema", () => ({
  useTema: jest.fn(),
}));

const mockedUseTema = require("@/hooks/useTema").useTema as jest.Mock;

describe("AguardandoAprovacaoClient", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it.each(["Seu Racha", "Chelsea"])("mostra nome publico do grupo: %s", (tenantName) => {
    mockedUseTema.mockReturnValue({ nome: tenantName });

    render(<AguardandoAprovacaoClient />);

    expect(screen.getByText(tenantName)).toBeInTheDocument();
    expect(screen.getByText(/Sua entrada está aguardando aprovação/i)).toBeInTheDocument();
    expect(screen.queryByText(/seu-racha/i)).not.toBeInTheDocument();
  });

  it("usa fallback seu grupo quando nome publico nao existe", () => {
    mockedUseTema.mockReturnValue({ nome: "" });

    render(<AguardandoAprovacaoClient />);

    expect(screen.getByText("seu grupo")).toBeInTheDocument();
  });
});
