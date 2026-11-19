import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import AdminHelpLauncher from "../AdminHelpLauncher";
import { buildFut7ProOfficialWhatsAppUrl } from "@/config/fut7pro-contact";

const openGuide = jest.fn();
jest.mock("../AdminGuideController", () => ({
  useAdminGuideController: () => ({ scope: "identity:admin:grupo:login", openGuide }),
}));

it("abre apenas os três destinos de ajuda e devolve o foco com Escape", async () => {
  render(<AdminHelpLauncher />);
  const trigger = screen.getByRole("button", { name: "Ajuda Fut7Pro" });
  expect(trigger).toHaveAttribute("aria-expanded", "false");
  expect(trigger.closest("div")).toHaveClass("hidden", "lg:block");
  expect(trigger.closest("div")).not.toHaveClass("md:block");
  fireEvent.click(trigger);
  expect(trigger).toHaveAttribute("aria-expanded", "true");
  const menu = screen.getByRole("navigation", { name: "Ajuda Fut7Pro" });
  expect(menu).toHaveAttribute("id", "admin-help-menu");
  expect(menu.querySelectorAll("a, button")).toHaveLength(3);
  expect(screen.getByRole("button", { name: /Guia Interativo/i })).not.toHaveAttribute("href");
  expect(screen.getByRole("link", { name: /Central de Ajuda/i })).toHaveAttribute(
    "href",
    "/admin/comunicacao/ajuda"
  );
  expect(screen.getByRole("link", { name: /Falar pelo WhatsApp/i })).toHaveAttribute(
    "href",
    buildFut7ProOfficialWhatsAppUrl("Olá! Preciso de ajuda com o Fut7Pro.")
  );
  await waitFor(() => expect(menu.querySelector("button")).toHaveFocus());
  fireEvent.keyDown(menu, { key: "Escape" });
  expect(trigger).toHaveFocus();
  expect(trigger).toHaveAttribute("aria-expanded", "false");
});

it("abre diretamente pelo controlador e fecha o menu sem esperar dados", () => {
  render(<AdminHelpLauncher />);
  fireEvent.click(screen.getByRole("button", { name: "Ajuda Fut7Pro" }));
  fireEvent.click(screen.getByRole("button", { name: /Guia Interativo/ }));
  expect(openGuide).toHaveBeenCalledTimes(1);
  expect(screen.queryByRole("navigation", { name: "Ajuda Fut7Pro" })).not.toBeInTheDocument();
  expect(screen.getByRole("button", { name: "Ajuda Fut7Pro" })).toHaveFocus();
});
