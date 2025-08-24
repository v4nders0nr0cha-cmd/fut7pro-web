"use client";
import { useState } from "react";
import Head from "next/head";

const DIAS_SEMANA_LABEL = [
  "Domingo",
  "Segunda",
  "Terça",
  "Quarta",
  "Quinta",
  "Sexta",
  "Sábado",
];
const diasDaSemanaDoRacha = [3, 6]; // Exemplo: Quarta e Sábado

type Mensalista = {
  id: string;
  nome: string;
  status: "Em dia" | "Inadimplente" | "A receber";
  ultimoPagamento: string | null;
  desconto: number;
  diasSemana: number[]; // Dias que o atleta é mensalista (ex: [3] para quarta)
};

const MOCK_MENSALISTAS: Mensalista[] = [
  {
    id: "1",
    nome: "Carlos Silva",
    status: "Em dia",
    ultimoPagamento: "2025-07-01",
    desconto: 0,
    diasSemana: [3],
  },
  {
    id: "2",
    nome: "Lucas Souza",
    status: "Inadimplente",
    ultimoPagamento: "2025-06-01",
    desconto: 0,
    diasSemana: [3, 6],
  },
  {
    id: "3",
    nome: "Ricardo Lima",
    status: "A receber",
    ultimoPagamento: null,
    desconto: 0,
    diasSemana: [6],
  },
];

// Função para contar jogos no mês para dias específicos
function countJogosAtletaNoMes(
  ano: number,
  mes: number,
  diasSemanaAtleta: number[],
) {
  let count = 0;
  const date = new Date(ano, mes - 1, 1);
  while (date.getMonth() === mes - 1) {
    if (diasSemanaAtleta.includes(date.getDay())) count++;
    date.setDate(date.getDate() + 1);
  }
  return count;
}
function countSemanasNoMes(ano: number, mes: number) {
  const primeiraData = new Date(ano, mes - 1, 1);
  const ultimaData = new Date(ano, mes, 0);
  const primeiraSemana = getWeekNumber(primeiraData);
  const ultimaSemana = getWeekNumber(ultimaData);
  return ultimaSemana - primeiraSemana + 1;
}
function getWeekNumber(date: Date) {
  const temp = new Date(date.getTime());
  temp.setHours(0, 0, 0, 0);
  temp.setDate(temp.getDate() + 4 - (temp.getDay() || 7));
  const yearStart = new Date(temp.getFullYear(), 0, 1);
  return Math.ceil(((temp.getTime() - yearStart.getTime()) / 86400000 + 1) / 7);
}
const mesesNomes = [
  "Janeiro",
  "Fevereiro",
  "Março",
  "Abril",
  "Maio",
  "Junho",
  "Julho",
  "Agosto",
  "Setembro",
  "Outubro",
  "Novembro",
  "Dezembro",
];

export default function MensalistasPage() {
  const hoje = new Date();
  const anoAtual = hoje.getFullYear();
  const mesAtual = hoje.getMonth();
  const nomeMes = mesesNomes[mesAtual];

  const [valorPorDia, setValorPorDia] = useState<number>(10);
  const [mensalistas, setMensalistas] =
    useState<Mensalista[]>(MOCK_MENSALISTAS);

  // Para o header, quantos jogos de racha no mês?
  const totalJogosPorDia = diasDaSemanaDoRacha.map((dia) =>
    countJogosAtletaNoMes(anoAtual, mesAtual + 1, [dia]),
  );
  const totalJogosNoMes = totalJogosPorDia.reduce((a, b) => a + b, 0);
  const totalSemanasNoMes = countSemanasNoMes(anoAtual, mesAtual + 1);

  // Valor de cada atleta: valorPorDia × jogos dos dias selecionados - desconto
  const valoresMensais = mensalistas.map((m) => {
    const jogosAtleta = countJogosAtletaNoMes(
      anoAtual,
      mesAtual + 1,
      m.diasSemana,
    );
    const valorSemDesconto = valorPorDia * jogosAtleta;
    return {
      ...m,
      jogosAtleta,
      valorSemDesconto,
      valorFinal: Math.max(valorSemDesconto - m.desconto, 0),
      labelDias: m.diasSemana.map((idx) => DIAS_SEMANA_LABEL[idx]).join(" e "),
    };
  });
  const totalMensalistas = valoresMensais.reduce(
    (sum, m) => sum + m.valorFinal,
    0,
  );

  // Modal edição
  const [editModalId, setEditModalId] = useState<string | null>(null);
  const [novoDesconto, setNovoDesconto] = useState<number>(0);
  const [novoDiasSemana, setNovoDiasSemana] = useState<number[]>([]);

  function abrirModalEditar(m: Mensalista) {
    setEditModalId(m.id);
    setNovoDesconto(m.desconto);
    setNovoDiasSemana([...m.diasSemana]);
  }
  function salvarEdicao() {
    if (editModalId) {
      setMensalistas((ms) =>
        ms.map((m) =>
          m.id === editModalId
            ? { ...m, desconto: novoDesconto, diasSemana: novoDiasSemana }
            : m,
        ),
      );
    }
    setEditModalId(null);
  }

  return (
    <>
      <Head>
        <title>Mensalistas | Admin – Fut7Pro</title>
        <meta
          name="description"
          content="Gerencie os mensalistas do racha, valores por dia jogado, descontos individuais, dias semanais e controle de pagamentos."
        />
      </Head>
      <section className="mx-auto max-w-4xl px-2 pb-24 pt-20 md:pb-8 md:pt-6">
        <h1 className="mb-1 break-words text-3xl font-bold text-yellow-500">
          Mensalistas
        </h1>
        <p className="mb-3 text-sm text-gray-300">
          Defina o valor por dia jogado e o sistema calculará a mensalidade de
          cada atleta automaticamente.
          <br />
          <b>O sistema usa a agenda dos dias do seu racha:</b>{" "}
          <span className="text-yellow-300">
            {diasDaSemanaDoRacha
              .map((idx) => DIAS_SEMANA_LABEL[idx])
              .join(" e ")}
          </span>
          .<br />
          <span className="text-yellow-400">
            O valor de cada atleta é proporcional ao número de jogos dos dias em
            que ele é mensalista, em cada mês.
            <br />
            Para ajustar descontos ou dias, clique em “Editar” ao lado do
            atleta.
          </span>
        </p>
        <div className="mb-4 flex flex-wrap items-end gap-4">
          <div>
            <label className="mb-1 block text-sm font-bold text-gray-300">
              Valor por dia jogado (R$)
            </label>
            <input
              type="number"
              min={1}
              step="0.01"
              value={valorPorDia}
              onChange={(e) => setValorPorDia(Number(e.target.value))}
              className="rounded border border-neutral-700 bg-neutral-800 px-2 py-1 text-left text-white"
              required
            />
          </div>
          <div className="w-full md:w-auto">
            <div className="mb-2 flex flex-wrap items-center gap-2 text-base font-semibold">
              <span>
                {nomeMes} {anoAtual}:
              </span>
              {diasDaSemanaDoRacha.map((dia, i) => (
                <span
                  key={dia}
                  title={`${DIAS_SEMANA_LABEL[dia]}: ${totalJogosPorDia[i]} jogos`}
                  className="rounded-full border border-yellow-700 bg-neutral-700 px-3 py-1 text-sm text-yellow-400 shadow transition hover:bg-yellow-800"
                >
                  {DIAS_SEMANA_LABEL[dia].slice(0, 3)}{" "}
                  <b>({totalJogosPorDia[i]})</b>
                </span>
              ))}
              <span className="ml-2 text-sm font-normal text-gray-300">
                | Total: <b>{totalJogosNoMes}</b> jogos &bull;{" "}
                {totalSemanasNoMes} semanas
              </span>
            </div>
          </div>
        </div>
        {totalSemanasNoMes === 5 && (
          <div className="mb-3 rounded-lg border border-yellow-700 bg-yellow-900/70 p-3 text-sm text-yellow-300">
            <b>Atenção:</b> Este mês ({nomeMes}/{anoAtual}) possui{" "}
            <b>5 semanas</b> com racha agendado. O valor já considera todos os
            jogos previstos para este mês!
          </div>
        )}
        <div className="mb-4 text-base font-bold text-gray-200">
          Valor total dos mensalistas do mês:{" "}
          <span className="text-green-400">
            R$ {totalMensalistas.toFixed(2)}
          </span>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full border-separate border-spacing-y-1 text-sm">
            <thead>
              <tr className="text-xs text-gray-400">
                <th className="px-2 py-2 text-left">Nome</th>
                <th className="px-2 py-2 text-left">Status</th>
                <th className="px-2 py-2 text-left">Dias semana</th>
                <th className="px-2 py-2 text-left">Jogos no mês</th>
                <th className="px-2 py-2 text-left">Valor mensal</th>
                <th className="px-2 py-2 text-left">Desconto</th>
                <th className="px-2 py-2 text-left">Valor final</th>
                <th className="px-2 py-2 text-left">Últ. Pagamento</th>
                <th className="px-2 py-2 text-left"></th>
              </tr>
            </thead>
            <tbody>
              {valoresMensais.map((m) => (
                <tr
                  key={m.id}
                  className="rounded-lg bg-neutral-800 transition hover:bg-neutral-700"
                >
                  <td className="px-2 py-1 font-semibold">{m.nome}</td>
                  <td className="px-2 py-1">
                    {m.status === "Em dia" && (
                      <span className="font-bold text-green-400">
                        {m.status}
                      </span>
                    )}
                    {m.status === "Inadimplente" && (
                      <span className="font-bold text-red-400">{m.status}</span>
                    )}
                    {m.status === "A receber" && (
                      <span className="font-bold text-yellow-400">
                        {m.status}
                      </span>
                    )}
                  </td>
                  <td className="px-2 py-1">{m.labelDias}</td>
                  <td className="px-2 py-1">{m.jogosAtleta}</td>
                  <td className="px-2 py-1">
                    R$ {m.valorSemDesconto.toFixed(2)}
                  </td>
                  <td className="px-2 py-1 font-bold text-yellow-400">
                    {m.desconto > 0 ? `- R$ ${m.desconto.toFixed(2)}` : "-"}
                  </td>
                  <td className="px-2 py-1 font-bold text-green-300">
                    R$ {m.valorFinal.toFixed(2)}
                  </td>
                  <td className="px-2 py-1">
                    {typeof m.ultimoPagamento === "string" && m.ultimoPagamento
                      ? m.ultimoPagamento.split("-").reverse().join("/")
                      : "-"}
                  </td>
                  <td className="px-2 py-1">
                    <button
                      className="text-xs text-yellow-400 hover:underline"
                      onClick={() => abrirModalEditar(m)}
                    >
                      Editar
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {/* Modal editar desconto e dias/semana */}
        {editModalId && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                salvarEdicao();
              }}
              className="relative w-full max-w-sm rounded-xl bg-neutral-900 p-6 shadow-xl"
              style={{ minWidth: 320 }}
              autoComplete="off"
            >
              <h2 className="mb-2 text-lg font-bold text-yellow-500">
                Editar Mensalista
              </h2>
              <button
                type="button"
                className="absolute right-3 top-2 text-xl text-gray-400 hover:text-yellow-500"
                onClick={() => setEditModalId(null)}
                aria-label="Fechar"
              >
                ×
              </button>
              <div className="mb-2">
                <label className="mb-1 block text-xs font-bold text-gray-300">
                  Desconto em reais para este mês
                </label>
                <input
                  type="number"
                  min={0}
                  step="0.01"
                  value={novoDesconto}
                  onChange={(e) => setNovoDesconto(Number(e.target.value))}
                  className="w-full rounded border border-neutral-700 bg-neutral-800 px-2 py-1 text-left text-sm text-white outline-yellow-500"
                  required
                />
                <div className="mt-1 text-xs text-gray-400">
                  O desconto será aplicado apenas para este atleta neste mês.
                </div>
              </div>
              <div className="mb-2">
                <label className="mb-1 block text-xs font-bold text-gray-300">
                  Em quais dias da semana este atleta é mensalista?
                </label>
                <div className="flex flex-wrap gap-2">
                  {DIAS_SEMANA_LABEL.map((label, idx) => (
                    <label
                      key={label}
                      className="flex items-center gap-1 text-xs"
                    >
                      <input
                        type="checkbox"
                        checked={novoDiasSemana.includes(idx)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setNovoDiasSemana((arr) => [...arr, idx]);
                          } else {
                            setNovoDiasSemana((arr) =>
                              arr.filter((i) => i !== idx),
                            );
                          }
                        }}
                        className="accent-yellow-500"
                      />
                      {label}
                    </label>
                  ))}
                </div>
                <div className="mt-1 text-xs text-gray-400">
                  Marque os dias em que este atleta joga como mensalista.
                  <br />
                  Só serão cobrados os dias realmente marcados para ele.
                </div>
              </div>
              <button
                type="submit"
                className="mt-3 w-full rounded bg-yellow-500 py-2 text-sm font-bold text-black transition hover:bg-yellow-600"
              >
                Salvar Alterações
              </button>
            </form>
          </div>
        )}
      </section>
    </>
  );
}
