import { render, screen } from "@testing-library/react";
import CardAcoesRapidas from "@/components/admin/CardAcoesRapidas";

describe("CardAcoesRapidas", () => {
  it("renderiza links com rótulos e href corretos", () => {
    render(
      <CardAcoesRapidas
        cadastrarJogador="/admin/jogadores/novo"
        criarPartida="/admin/partidas/nova"
        adicionarPatrocinador="/admin/financeiro/patrocinadores"
        enviarNotificacao="/admin/comunicacao/notificacoes"
      />
    );

    expect(screen.getByText(/Ações Rápidas/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Cadastrar Jogador/i)).toHaveAttribute(
      "href",
      "/admin/jogadores/novo"
    );
    expect(screen.getByLabelText(/Criar Partida/i)).toHaveAttribute("href", "/admin/partidas/nova");
    expect(screen.getByLabelText(/Adicionar Patrocinador/i)).toHaveAttribute(
      "href",
      "/admin/financeiro/patrocinadores"
    );
    expect(screen.getByLabelText(/Enviar Notificação/i)).toHaveAttribute(
      "href",
      "/admin/comunicacao/notificacoes"
    );
  });
});
