import { render, screen } from "@testing-library/react";
import CardJogadoresAssiduos from "@/components/admin/CardJogadoresAssiduos";

jest.mock("next/image", () => ({
  __esModule: true,
  default: (props: any) => <img alt={props.alt || ""} {...props} />,
}));

describe("CardJogadoresAssiduos", () => {
  it("lista jogadores com presenças", () => {
    render(<CardJogadoresAssiduos />);
    expect(screen.getByText(/Mais Ass[ií]duos/i)).toBeInTheDocument();
    expect(screen.getAllByRole("img")).toHaveLength(3);
    expect(screen.getByText(/Bruno Silva/)).toBeInTheDocument();
    expect(screen.getByText(/22j/)).toBeInTheDocument();
  });
});
