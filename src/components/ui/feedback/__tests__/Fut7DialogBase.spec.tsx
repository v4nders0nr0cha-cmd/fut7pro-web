import { fireEvent, render, screen, within } from "@testing-library/react";
import Fut7DialogBase from "../Fut7DialogBase";

describe("Fut7DialogBase", () => {
  it("mantém título, fechamento e ações fora da região rolável", () => {
    const onClose = jest.fn();
    render(
      <Fut7DialogBase
        open
        title="Confirmação"
        onClose={onClose}
        footer={<button type="button">Confirmar</button>}
      >
        <p>Conteúdo longo</p>
      </Fut7DialogBase>
    );

    const dialog = screen.getByRole("dialog", { name: "Confirmação" });
    expect(dialog).toHaveAttribute("aria-modal", "true");
    expect(dialog).toHaveClass("max-h-[calc(100dvh-1rem)]");
    expect(
      within(dialog).getByRole("heading", { name: "Confirmação" }).closest("header")
    ).toBeTruthy();
    expect(
      within(dialog).getByRole("button", { name: "Confirmar" }).closest("footer")
    ).toBeTruthy();
    expect(within(dialog).getByText("Conteúdo longo").parentElement).toHaveClass("overflow-y-auto");
    expect(document.body.style.overflow).toBe("hidden");

    fireEvent.keyDown(document, { key: "Escape" });
    expect(onClose).toHaveBeenCalledTimes(1);
  });
});
