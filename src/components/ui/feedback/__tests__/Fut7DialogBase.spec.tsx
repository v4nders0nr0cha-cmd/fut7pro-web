import { useState } from "react";
import { fireEvent, render, screen, waitFor, within } from "@testing-library/react";
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

  it.each([
    ["desmontado", true],
    ["fechado por open=false", false],
  ])("devolve o foco ao botão de origem quando é %s", async (_label, unmountOnClose) => {
    function Harness() {
      const [open, setOpen] = useState(false);
      return (
        <>
          <button type="button" onClick={() => setOpen(true)}>
            Abrir diálogo
          </button>
          {(open || !unmountOnClose) && (
            <Fut7DialogBase open={open} title="Diálogo" onClose={() => setOpen(false)} />
          )}
        </>
      );
    }

    render(<Harness />);
    const opener = screen.getByRole("button", { name: "Abrir diálogo" });
    opener.focus();
    fireEvent.click(opener);
    await waitFor(() => expect(screen.getByRole("button", { name: "Fechar modal" })).toHaveFocus());
    fireEvent.click(screen.getByRole("button", { name: "Fechar modal" }));
    await waitFor(() => expect(opener).toHaveFocus());
  });
});
