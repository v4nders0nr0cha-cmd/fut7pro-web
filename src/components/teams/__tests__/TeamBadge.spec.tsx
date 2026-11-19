import { render, screen } from "@testing-library/react";
import { TeamBadge, teamInitials, visibleTeamLogo } from "../TeamBadge";

jest.mock("next/image", () => ({
  __esModule: true,
  default: ({ alt, ...props }: any) => <img alt={alt} {...props} />,
}));

describe("TeamBadge", () => {
  it.each([
    ["Time amarelo", "TA"],
    [" time   vermelho ", "TV"],
    ["Leões do Norte", "LN"],
    ["7", "7"],
    ["Á", "Á"],
    ["Sport", "SP"],
    ["", "T"],
  ])("gera iniciais estáveis para %s", (name, initials) => {
    expect(teamInitials(name)).toBe(initials);
  });

  it("mostra a cor e iniciais com contraste para cores claras e escuras", () => {
    const { rerender } = render(<TeamBadge name="Time amarelo" color="#FFD700" size={24} />);
    expect(
      screen.getByRole("img", { name: /Time Time amarelo, sem logo enviada/ })
    ).toHaveTextContent("TA");
    expect(screen.getByRole("img", { name: /Time Time amarelo, sem logo enviada/ })).toHaveStyle({
      backgroundColor: "#FFD700",
      color: "#000000",
    });
    rerender(<TeamBadge name="time vermelho" color="#880000" />);
    expect(screen.getByRole("img", { name: /Time time vermelho, sem logo enviada/ })).toHaveStyle({
      color: "#ffffff",
    });
  });

  it("preserva imagens personalizadas e a URL legada de origem desconhecida", () => {
    const { rerender } = render(<TeamBadge name="Meu Time" logo="/uploads/meu-time.png" />);
    expect(screen.getByRole("img", { name: "Logo do time Meu Time" })).toHaveAttribute(
      "src",
      "/uploads/meu-time.png"
    );
    rerender(<TeamBadge name="Meu Time" logo="/images/times/time_padrao_01.png" />);
    expect(visibleTeamLogo("/images/times/time_padrao_01.png")).toBe(
      "/images/times/time_padrao_01.png"
    );
    expect(screen.getByRole("img", { name: "Logo do time Meu Time" })).toHaveAttribute(
      "src",
      "/images/times/time_padrao_01.png"
    );
  });

  it.each([null, undefined, "", "  ", "javascript:payload", "//example.com/logo.png"])(
    "mostra iniciais quando a logo está ausente ou inválida: %s",
    (logo) => {
      render(<TeamBadge name="Meu Time" logo={logo} />);
      expect(visibleTeamLogo(logo)).toBeNull();
      expect(screen.getByRole("img", { name: /sem logo enviada/ })).toHaveTextContent("MT");
    }
  );
});
