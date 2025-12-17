import { fireEvent, render, screen } from "@testing-library/react";
import TorneioForm from "@/components/admin/TorneioForm";

describe("TorneioForm", () => {
  it("submete dados preenchidos", () => {
    const onSave = jest.fn();

    render(<TorneioForm onSave={onSave} />);

    fireEvent.change(screen.getByPlaceholderText(/Nome do Torneio/i), {
      target: { value: "Copa Fut7" },
    });
    fireEvent.change(screen.getByPlaceholderText(/Slug do Torneio/i), {
      target: { value: "copa-fut7" },
    });
    fireEvent.change(screen.getByPlaceholderText(/^Ano$/i), {
      target: { value: "2026" },
    });
    fireEvent.change(screen.getByPlaceholderText(/Time\/Atleta Campe/i), {
      target: { value: "Time Azul" },
    });
    fireEvent.change(screen.getByPlaceholderText(/Banner do Torneio/i), {
      target: { value: "https://cdn/banner.png" },
    });
    fireEvent.change(screen.getByPlaceholderText(/Logo do Torneio/i), {
      target: { value: "https://cdn/logo.png" },
    });

    fireEvent.click(screen.getByRole("button", { name: /Salvar/i }));

    expect(onSave).toHaveBeenCalledWith({
      nome: "Copa Fut7",
      slug: "copa-fut7",
      ano: "2026",
      campeao: "Time Azul",
      bannerUrl: "https://cdn/banner.png",
      logoUrl: "https://cdn/logo.png",
    });
  });

  it("aciona onCancel quando fornecido", () => {
    const onCancel = jest.fn();
    render(<TorneioForm onSave={jest.fn()} onCancel={onCancel} initialData={{ nome: "A" }} />);

    fireEvent.click(screen.getByRole("button", { name: /Cancelar/i }));

    expect(onCancel).toHaveBeenCalled();
  });
});
