import { render, screen } from "@testing-library/react";
import TimesGerados from "../TimesGerados";
import type { TimeSorteado } from "@/types/sorteio";

const times: TimeSorteado[] = [
  {
    id: "time-1",
    nome: "Time 1",
    jogadores: [
      {
        id: "jogador-1",
        nome: "Goleiro",
        slug: "goleiro",
        foto: "/goleiro.png",
        posicao: "GOL",
        rankingPontos: 10,
        vitorias: 1,
        gols: 0,
        assistencias: 0,
        estrelas: {
          id: "e1",
          rachaId: "r1",
          jogadorId: "jogador-1",
          estrelas: 4,
          atualizadoEm: "",
        },
        mensalista: true,
        partidas: 4,
      },
    ],
    mediaRanking: 0,
    mediaEstrelas: 0,
    coeficienteTotal: 0,
  },
];

describe("TimesGerados", () => {
  it("mostra progresso da fase de calibracao antes de 8 sorteios publicados", () => {
    render(
      <TimesGerados
        times={times}
        jogadoresPorTime={1}
        rankingEmCalibracao
        sorteiosPublicadosNaTemporada={7}
      />
    );

    expect(screen.getByText(/Fase de calibração: 7 de 8 sorteios publicados/i)).toBeInTheDocument();
    expect(screen.getByText(/ranking também passa a calibrar os times/i)).toBeInTheDocument();
  });

  it("mostra mensagem avancada quando a calibracao esta concluida", () => {
    render(
      <TimesGerados
        times={times}
        jogadoresPorTime={1}
        rankingEmCalibracao={false}
        sorteiosPublicadosNaTemporada={8}
      />
    );

    expect(screen.getByText(/Sorteio Inteligente completo/i)).toBeInTheDocument();
    expect(screen.getByText(/estrelas, ranking, posição dos atletas/i)).toBeInTheDocument();
  });
});
