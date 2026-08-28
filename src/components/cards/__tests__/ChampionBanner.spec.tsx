import { render, screen } from "@testing-library/react";
import ChampionBanner from "@/components/cards/ChampionBanner";

jest.mock("next/image", () => ({
  __esModule: true,
  default: (props: any) => {
    // eslint-disable-next-line @next/next/no-img-element
    const { alt, ...rest } = props;
    return <img alt={alt || ""} {...rest} />;
  },
}));

jest.mock("next/link", () => ({
  __esModule: true,
  default: ({ children, href, ...props }: any) => (
    <a href={href} {...props}>
      {children}
    </a>
  ),
}));

describe("ChampionBanner", () => {
  it("prioriza a imagem real quando ela existe", () => {
    render(
      <ChampionBanner
        image="https://cdn.fut7pro.com.br/time-campeao.png"
        date="sexta-feira, 11 de abril de 2026"
        players={["Joao", "Pedro"]}
        href="/ruimdebola/partidas/times-do-dia"
      />
    );

    expect(screen.getByAltText(/Imagem do Time Campeão do Dia/i)).toHaveAttribute(
      "src",
      "https://cdn.fut7pro.com.br/time-campeao.png"
    );
  });

  it("mostra placeholder neutro enquanto a foto oficial ainda esta sincronizando", () => {
    render(
      <ChampionBanner
        image={null}
        isImageLoading={true}
        date="sexta-feira, 11 de abril de 2026"
        players={["Joao", "Pedro"]}
        href="/ruimdebola/partidas/times-do-dia"
      />
    );

    expect(
      screen.getByRole("status", { name: /Carregando imagem oficial do Time Campeão do Dia/i })
    ).toBeInTheDocument();
    expect(screen.queryByAltText(/Imagem do Time Campeão do Dia/i)).not.toBeInTheDocument();
  });

  it.each([5, 7, 11])("exibe todos os %i nomes do elenco campeao", (count) => {
    const players = Array.from({ length: count }, (_, index) => `Atleta ${index + 1}`);

    render(
      <ChampionBanner
        image={null}
        date="sexta-feira, 28 de agosto de 2026"
        players={players}
        href="/ruimdebola/partidas/times-do-dia"
      />
    );

    players.forEach((player) => {
      expect(screen.getByText(player)).toBeInTheDocument();
    });
  });
});
