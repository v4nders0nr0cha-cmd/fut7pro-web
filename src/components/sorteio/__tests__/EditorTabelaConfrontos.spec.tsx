import { validarTabelaConfrontos } from "../EditorTabelaConfrontos";
import type { JogoConfronto, Time } from "@/utils/sorteioUtils";

const times: Time[] = [
  { id: "t1", nome: "Gavies", logo: "/t1.png" },
  { id: "t2", nome: "Panteras", logo: "/t2.png" },
  { id: "t3", nome: "Falcoes", logo: "/t3.png" },
  { id: "t4", nome: "Coruja", logo: "/t4.png" },
];

function jogo(ordem: number, timeA: Time, timeB: Time): JogoConfronto {
  return { ordem, timeA, timeB, tempo: 6, turno: "ida" };
}

describe("validarTabelaConfrontos", () => {
  it("bloqueia tabela vazia", () => {
    expect(validarTabelaConfrontos([], times).erros).toContain(
      "A tabela precisa ter pelo menos um confronto."
    );
  });

  it("bloqueia confronto do time contra ele mesmo", () => {
    expect(validarTabelaConfrontos([jogo(1, times[0]!, times[0]!)], times).erros).toContain(
      "Jogo 1: um time não pode jogar contra ele mesmo."
    );
  });

  it("sinaliza duplicidade e jogos seguidos sem bloquear publicacao", () => {
    const result = validarTabelaConfrontos(
      [
        jogo(1, times[0]!, times[1]!),
        jogo(2, times[1]!, times[0]!),
        jogo(3, times[2]!, times[3]!),
        jogo(4, times[3]!, times[2]!),
      ],
      times,
      { duracaoRachaMin: 90 }
    );

    expect(result.erros).toEqual([]);
    expect(result.avisos).toEqual(
      expect.arrayContaining([
        "Jogo 2: este confronto já aparece na tabela.",
        "Jogo 2: há time jogando em rodadas seguidas.",
      ])
    );
  });

  it("bloqueia quando a tabela ultrapassa o tempo util do racha", () => {
    const result = validarTabelaConfrontos(
      [
        { ...jogo(1, times[0]!, times[1]!), tempo: 40 },
        { ...jogo(2, times[2]!, times[3]!), tempo: 40 },
      ],
      times,
      { duracaoRachaMin: 90 }
    );

    expect(result.erros).toContain("A tabela ultrapassa o tempo útil disponível de 75 min.");
  });

  it("bloqueia time sem jogo quando ha confrontos suficientes para todos", () => {
    const result = validarTabelaConfrontos(
      [jogo(1, times[0]!, times[1]!), jogo(2, times[0]!, times[1]!)],
      times,
      { duracaoRachaMin: 90 }
    );

    expect(result.erros).toContain(
      "Todos os Times do Dia precisam ter pelo menos um jogo quando houver confrontos suficientes."
    );
  });

  it("bloqueia distribuicao de jogos injusta", () => {
    const result = validarTabelaConfrontos(
      [jogo(1, times[0]!, times[1]!), jogo(2, times[0]!, times[2]!), jogo(3, times[0]!, times[3]!)],
      times,
      { duracaoRachaMin: 90 }
    );

    expect(result.erros).toContain(
      "A quantidade de jogos por time está injusta. Ajuste a tabela para equilibrar as participações."
    );
  });
});
