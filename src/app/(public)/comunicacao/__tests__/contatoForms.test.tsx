import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import ChatClient from "../suporte/ChatClient";
import SugestoesPage from "../sugestoes/page";
import { RachaProvider } from "@/context/RachaContext";
import { useSession } from "next-auth/react";
import { useMe } from "@/hooks/useMe";

jest.mock("next-auth/react", () => ({
  useSession: jest.fn(),
}));

jest.mock("@/hooks/useMe", () => ({
  useMe: jest.fn(),
}));

const renderWithRacha = (ui: React.ReactNode, initialTenantSlug?: string) =>
  render(<RachaProvider initialTenantSlug={initialTenantSlug}>{ui}</RachaProvider>);
const mockedUseSession = useSession as jest.Mock;
const mockedUseMe = useMe as jest.Mock;

describe("Formulários de contato público", () => {
  beforeEach(() => {
    (global.fetch as jest.Mock | undefined)?.mockClear?.();
    window.HTMLElement.prototype.scrollIntoView = jest.fn();
    mockedUseSession.mockReturnValue({ data: null, status: "unauthenticated" });
    mockedUseMe.mockReturnValue({ me: null, isLoading: false });
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

  it("envia sugestão para /api/public/{slug}/suggestions", async () => {
    mockedUseSession.mockReturnValue({
      data: { user: { role: "ATLETA" } },
      status: "authenticated",
    });
    mockedUseMe.mockReturnValue({
      me: { athlete: { id: "ath-1" } },
      isLoading: false,
    });

    const fetchMock = jest
      .fn()
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ results: [] }),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          id: "sug-1",
          message: "Nova ideia para o racha",
          category: "RACHA_IDEA",
          status: "RECEIVED",
          createdAt: "2025-01-01T00:00:00Z",
        }),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          results: [
            {
              id: "sug-1",
              message: "Nova ideia para o racha",
              category: "RACHA_IDEA",
              status: "RECEIVED",
              createdAt: "2025-01-01T00:00:00Z",
            },
          ],
        }),
      });
    global.fetch = fetchMock as any;

    renderWithRacha(<SugestoesPage />, "vitrine");

    await waitFor(() => {
      expect(fetchMock).toHaveBeenCalledWith(
        expect.stringMatching(/\/api\/public\/.+\/suggestions$/),
        expect.objectContaining({ cache: "no-store" })
      );
    });

    fireEvent.change(screen.getByPlaceholderText(/escreva sua sugestão/i), {
      target: { value: "Teste de sugestão para o Fut7Pro" },
    });

    fireEvent.click(screen.getByRole("button", { name: /Enviar sugestão/i }));

    await waitFor(() => {
      expect(fetchMock).toHaveBeenCalledWith(
        expect.stringMatching(/\/api\/public\/.+\/suggestions$/),
        expect.objectContaining({
          method: "POST",
          headers: expect.objectContaining({ "Content-Type": "application/json" }),
        })
      );
    });
  });
});
