import { fireEvent, render, screen } from "@testing-library/react";
import LayoutClient from "@/components/layout/LayoutClient";

jest.mock("next-auth/react", () => ({
  useSession: () => ({ data: null, status: "unauthenticated" }),
  signOut: jest.fn(),
}));

jest.mock("@/hooks/useTema", () => ({
  useTema: () => ({
    logo: "/logo.png",
    nome: "Racha Teste",
    corPrimaria: "#000",
    corSecundaria: "#111",
    frases: { principal: "", secundaria: "" },
    endereco: "Av. Teste, 123",
  }),
}));

jest.mock("@/hooks/useComunicacao", () => ({
  useComunicacao: () => ({ badge: 0, badgeMensagem: 0, badgeSugestoes: 0 }),
}));

jest.mock("@/hooks/useNotificationBadge", () => ({
  useNotificationBadge: () => ({ badge: 0 }),
}));

jest.mock("@/hooks/useAbout", () => ({
  useAboutPublic: () => ({ about: null }),
}));

jest.mock("@/hooks/useFooterConfig", () => ({
  useFooterConfigPublic: () => ({ footer: null }),
}));

jest.mock("@/context/RachaContext", () => ({
  useRacha: () => ({ tenantSlug: "fut7pro", rachaId: "racha-1" }),
}));

describe("LayoutClient", () => {
  it("renderiza filhos e footer", () => {
    render(
      <LayoutClient>
        <div>Conteúdo principal</div>
      </LayoutClient>
    );

    expect(screen.getByText("Conteúdo principal")).toBeInTheDocument();
    expect(screen.getByText(/NOSSOS PATROCINADORES/i)).toBeInTheDocument();
  });

  it("abre o menu mobile ao clicar no header", () => {
    render(<LayoutClient>child</LayoutClient>);

    fireEvent.click(screen.getByLabelText(/Abrir menu/i));

    expect(screen.getByText(/Perfis dos Atletas/i)).toBeInTheDocument();
  });
});
