import { fireEvent, render, screen, within } from "@testing-library/react";
import JogadorForm from "../JogadorForm";

const toastError = jest.fn();

jest.mock("react-hot-toast", () => ({
  toast: {
    error: (...args: unknown[]) => toastError(...args),
  },
}));

jest.mock("@/components/ImageCropperModal", () => ({
  __esModule: true,
  default: () => null,
}));

describe("JogadorForm", () => {
  beforeEach(() => {
    toastError.mockReset();
  });

  it("exige posicao secundaria para jogador de linha no cadastro manual", () => {
    const { container } = render(<JogadorForm onSave={jest.fn()} />);

    const secondary = container.querySelector('select[name="posicaoSecundaria"]')!;
    expect(secondary).toBeRequired();
    expect(secondary).toHaveValue("");
  });

  it("filtra opcoes invalidas da secundaria pela posicao principal", () => {
    render(<JogadorForm onSave={jest.fn()} />);

    fireEvent.change(screen.getAllByRole("combobox")[1]!, { target: { value: "meia" } });

    const secondary = screen.getAllByRole("combobox")[2]!;
    expect(within(secondary).getByRole("option", { name: "Zagueiro" })).toBeInTheDocument();
    expect(within(secondary).getByRole("option", { name: "Atacante" })).toBeInTheDocument();
    expect(within(secondary).queryByRole("option", { name: "Meia" })).not.toBeInTheDocument();
    expect(within(secondary).queryByRole("option", { name: "Goleiro" })).not.toBeInTheDocument();
  });

  it("nao solicita secundaria para goleiro e salva null", () => {
    const onSave = jest.fn();
    const { container } = render(<JogadorForm onSave={onSave} />);

    fireEvent.change(container.querySelector('input[name="nome"]')!, {
      target: { value: "Goleiro Teste" },
    });
    fireEvent.change(screen.getAllByRole("combobox")[1]!, { target: { value: "goleiro" } });
    expect(screen.queryByLabelText("Posição secundária")).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Cadastrar Jogador" }));

    expect(onSave).toHaveBeenCalledWith(
      expect.objectContaining({ posicao: "goleiro", posicaoSecundaria: null }),
      null
    );
  });
});
