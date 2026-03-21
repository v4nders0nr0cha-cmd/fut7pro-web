import { fireEvent, render, screen } from "@testing-library/react";
import {
  handleFormInputValidationReset,
  handleFormInvalidPtBr,
} from "@/lib/forms/native-ptbr-validation";

function ValidationFixture() {
  return (
    <form onInvalidCapture={handleFormInvalidPtBr} onInputCapture={handleFormInputValidationReset}>
      <label htmlFor="email">Email</label>
      <input id="email" name="email" type="email" required />
      <button type="submit">Enviar</button>
    </form>
  );
}

describe("native-ptbr-validation", () => {
  it("aplica mensagem obrigatoria em portugues e aria-invalid", () => {
    render(<ValidationFixture />);

    const input = screen.getByLabelText("Email") as HTMLInputElement;
    fireEvent.invalid(input);

    expect(input.validationMessage).toBe("Este campo é obrigatório.");
    expect(input).toHaveAttribute("aria-invalid", "true");
  });

  it("aplica mensagem de email invalido em portugues e limpa no input valido", () => {
    render(<ValidationFixture />);

    const input = screen.getByLabelText("Email") as HTMLInputElement;
    fireEvent.change(input, { target: { value: "email-invalido" } });
    fireEvent.invalid(input);

    expect(input.validationMessage).toBe("Informe um e-mail válido.");
    expect(input).toHaveAttribute("aria-invalid", "true");

    fireEvent.input(input, { target: { value: "valido@fut7pro.com" } });

    expect(input.validationMessage).toBe("");
    expect(input).toHaveAttribute("aria-invalid", "false");
  });
});
