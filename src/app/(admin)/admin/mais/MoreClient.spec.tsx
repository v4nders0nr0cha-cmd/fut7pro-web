import { fireEvent, render, screen } from "@testing-library/react";
import { signOut } from "next-auth/react";
import MoreClient from "./MoreClient";
import { buildFut7ProOfficialWhatsAppUrl } from "@/config/fut7pro-contact";

jest.mock("next-auth/react", () => ({
  useSession: () => ({ data: { user: { name: "Felipe" } } }),
  signOut: jest.fn(),
}));
jest.mock("swr", () => ({
  __esModule: true,
  default: () => ({ data: [{ tenantId: "1" }, { tenantId: "2" }] }),
}));
jest.mock("@/hooks/useMe", () => ({
  useMe: () => ({ me: { tenant: { tenantSlug: "seu-racha" }, athlete: { slug: "felipe" } } }),
}));
jest.mock("@/context/RachaContext", () => ({ useRacha: () => ({ tenantSlug: "seu-racha" }) }));
jest.mock("@/utils/active-tenant", () => ({ setStoredTenantSlug: jest.fn() }));

it("organiza conta, ajuda e saída preservando contexto e destinos existentes", () => {
  render(<MoreClient />);
  expect(screen.getAllByRole("heading", { name: "Mais" })).toHaveLength(2);
  expect(screen.getAllByRole("heading", { name: "Mais" })[1]).toHaveClass("sr-only");
  expect(screen.getByRole("heading", { name: "Minha conta" }).closest("div.pt-2")).toHaveClass(
    "lg:hidden"
  );
  for (const category of ["Minha conta", "Assinatura Fut7Pro", "Ajuda e orientação", "Conta"]) {
    expect(screen.getByRole("heading", { name: category })).toBeInTheDocument();
  }
  expect(screen.getByRole("link", { name: /Perfil Global Fut7Pro/i })).toHaveAttribute(
    "href",
    "/perfil"
  );
  expect(screen.getByRole("link", { name: /Meu perfil neste grupo/i })).toHaveAttribute(
    "href",
    "/seu-racha/perfil"
  );
  expect(screen.getByRole("link", { name: /Trocar de grupo/i })).toHaveAttribute(
    "href",
    "/admin/selecionar-racha"
  );
  expect(screen.getByRole("link", { name: /Ver perfil público/i })).toHaveAttribute(
    "href",
    "/seu-racha/atletas/felipe"
  );
  expect(screen.getByRole("link", { name: /Plano e cobrança/i })).toHaveAttribute(
    "href",
    "/admin/financeiro/planos-limites"
  );
  expect(screen.getByRole("link", { name: /Guia Interativo/i })).toHaveAttribute(
    "href",
    "/admin/guia-fut7pro"
  );
  expect(screen.getByRole("link", { name: /Central de Ajuda/i })).toHaveAttribute(
    "href",
    "/admin/comunicacao/ajuda"
  );
  expect(screen.getByRole("link", { name: /Suporte Fut7Pro/i })).toHaveAttribute(
    "href",
    "/admin/comunicacao/suporte"
  );
  expect(screen.getByRole("link", { name: /Falar pelo WhatsApp/i })).toHaveAttribute(
    "href",
    buildFut7ProOfficialWhatsAppUrl("Olá! Preciso de ajuda com o Fut7Pro.")
  );
  fireEvent.click(screen.getByRole("button", { name: "Sair da conta" }));
  expect(signOut).toHaveBeenCalledWith({ callbackUrl: "/admin/login" });
});
