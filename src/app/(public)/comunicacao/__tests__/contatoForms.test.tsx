import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import ChatClient from "../suporte/ChatClient";
import SugestoesPage from "../sugestoes/page";
import { RachaProvider } from "@/context/RachaContext";

const renderWithRacha = (ui: React.ReactNode) => render(<RachaProvider>{ui}</RachaProvider>);

describe("Formulários de contato público", () => {
  beforeEach(() => {
    (global.fetch as jest.Mock | undefined)?.mockClear?.();
    window.HTMLElement.prototype.scrollIntoView = jest.fn();
  });

  it("envia suporte para /api/public/contact", async () => {
    const fetchMock = jest.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ id: "1", message: "Ajuda", createdAt: "2025-01-01T00:00:00Z" }),
    });
    global.fetch = fetchMock as any;

    renderWithRacha(<ChatClient />);

    fireEvent.change(screen.getByPlaceholderText("Seu nome"), { target: { value: "Joao" } });
    fireEvent.change(screen.getByPlaceholderText("Seu email"), {
      target: { value: "joao@email.com" },
    });
    fireEvent.change(screen.getByPlaceholderText("Digite sua mensagem..."), {
      target: { value: "Preciso de suporte" },
    });

    fireEvent.click(screen.getByRole("button", { name: /Enviar/i }));

    await waitFor(() => {
      expect(fetchMock).toHaveBeenCalledWith(
        "/api/public/contact",
        expect.objectContaining({
          method: "POST",
          headers: expect.objectContaining({ "Content-Type": "application/json" }),
        })
      );
    });
  });

  it("envia sugestão para /api/public/contact", async () => {
    const fetchMock = jest.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ id: "2", message: "Nova ideia", createdAt: "2025-01-01T00:00:00Z" }),
    });
    global.fetch = fetchMock as any;

    renderWithRacha(<SugestoesPage />);

    fireEvent.change(screen.getByPlaceholderText("Seu nome"), { target: { value: "Ana" } });
    fireEvent.change(screen.getByPlaceholderText("Seu email"), {
      target: { value: "ana@email.com" },
    });
    fireEvent.change(screen.getByPlaceholderText(/sugestao ou ideia/i), {
      target: { value: "Teste de sugestao" },
    });

    fireEvent.click(screen.getByRole("button", { name: /Enviar Sugestao/i }));

    await waitFor(() => {
      expect(fetchMock).toHaveBeenCalledWith(
        "/api/public/contact",
        expect.objectContaining({
          method: "POST",
          headers: expect.objectContaining({ "Content-Type": "application/json" }),
        })
      );
    });
  });
});
