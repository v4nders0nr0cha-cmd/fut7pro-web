import { fireEvent, render, screen } from "@testing-library/react";
import EditorTabelaConfrontos, { validarTabelaConfrontos } from "../EditorTabelaConfrontos";
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

  it("nao sinaliza duplicidade nem jogos seguidos como aviso", () => {
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
    expect(result.avisos).toEqual([]);
  });

  it("nao bloqueia quando a tabela ultrapassa a reserva operacional de tempo", () => {
    const result = validarTabelaConfrontos(
      [
        { ...jogo(1, times[0]!, times[1]!), tempo: 40 },
        { ...jogo(2, times[2]!, times[3]!), tempo: 40 },
      ],
      times,
      { duracaoRachaMin: 90 }
    );

    expect(result.erros).toEqual([]);
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

describe("EditorTabelaConfrontos", () => {
  const jogos = [jogo(1, times[0]!, times[1]!), jogo(2, times[2]!, times[3]!)];

  function renderEditor(overrides: Partial<Parameters<typeof EditorTabelaConfrontos>[0]> = {}) {
    const props = {
      jogos,
      timesDisponiveis: times,
      duracaoGlobal: 6,
      duracaoRachaMin: 90,
      tabelaPersonalizada: false,
      onDuracaoGlobalChange: jest.fn(),
      onSave: jest.fn(),
      onRestoreAutomatic: jest.fn(),
      ...overrides,
    };

    render(<EditorTabelaConfrontos {...props} />);
    return props;
  }

  it("mantem alteracao de tempo como rascunho ao cancelar edicao", () => {
    const props = renderEditor();

    fireEvent.click(screen.getByRole("button", { name: /Personalizar Tabela/i }));
    fireEvent.change(screen.getByLabelText(/Tempo por confronto/i), { target: { value: "8" } });
    fireEvent.click(screen.getByRole("button", { name: /Cancelar edição/i }));

    expect(props.onDuracaoGlobalChange).not.toHaveBeenCalled();
    expect(props.onSave).not.toHaveBeenCalled();
    expect(screen.queryByLabelText(/Tempo por confronto/i)).not.toBeInTheDocument();
  });

  it("usa a duracao do rascunho ao restaurar a tabela automatica", () => {
    const props = renderEditor();

    fireEvent.click(screen.getByRole("button", { name: /Personalizar Tabela/i }));
    fireEvent.change(screen.getByLabelText(/Tempo por confronto/i), { target: { value: "8" } });
    fireEvent.click(screen.getByRole("button", { name: /Restaurar tabela automática/i }));

    expect(props.onRestoreAutomatic).toHaveBeenCalledWith(8);
  });
});
