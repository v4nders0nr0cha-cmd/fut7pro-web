import { render, screen } from "@testing-library/react";
import ConfiguracoesRacha from "../ConfiguracoesRacha";

describe("ConfiguracoesRacha", () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  it("permite configurar jogadores por time de 5 ate 11", () => {
    render(<ConfiguracoesRacha onSubmit={jest.fn()} />);

    const select = screen.getByLabelText(/Jogadores por Time/i);
    const options = Array.from(select.querySelectorAll("option")).map((option) => option.value);

    expect(options).toEqual(["5", "6", "7", "8", "9", "10", "11"]);
    expect(select).toHaveValue("7");
  });
});
