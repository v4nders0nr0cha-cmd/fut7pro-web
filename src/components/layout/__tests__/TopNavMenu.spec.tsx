import { render, screen } from "@testing-library/react";
import TopNavMenu from "@/components/layout/TopNavMenu";

jest.mock("next/navigation", () => ({
  usePathname: () => "/partidas",
}));

describe("TopNavMenu", () => {
  it("renderiza links principais", () => {
    render(<TopNavMenu />);
    expect(screen.getByText("Partidas")).toBeInTheDocument();
    expect(screen.getByText("Estatísticas")).toBeInTheDocument();
  });
});
