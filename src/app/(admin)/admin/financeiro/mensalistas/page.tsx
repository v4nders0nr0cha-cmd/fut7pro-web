"use client";
import Head from "next/head";
import { useMemo, useState } from "react";
import { useRacha } from "@/context/RachaContext";
import { useJogadores } from "@/hooks/useJogadores";
import type { Jogador } from "@/types/jogador";
import type { MensalistaResumo } from "./components/TabelaMensalistas";
import TabelaMensalistas from "./components/TabelaMensalistas";

const DIAS_SEMANA_LABEL = ["Domingo", "Segunda", "Terça", "Quarta", "Quinta", "Sexta", "Sábado"];
const diasDaSemanaDoRacha = [3, 6]; // TODO: trazer do backend/rachaConfig quando exposto

function countJogosAtletaNoMes(ano: number, mes: number, diasSemanaAtleta: number[]) {
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

function mapMensalistas(jogadores: Jogador[]): MensalistaResumo[] {
  return jogadores
    .filter((j) => j.mensalista || j.isMember)
    .map((j) => ({
      id: j.id,
      nome: j.nome || j.nickname || "Jogador",
      status: "Em dia" as const,
      valor: 0,
      ultimoPagamento: null,
    }));
}

export default function MensalistasPage() {
  const hoje = new Date();
  const anoAtual = hoje.getFullYear();
  const mesAtual = hoje.getMonth();
  const nomeMes = mesesNomes[mesAtual];

  const { rachaId } = useRacha();
  const { jogadores, isLoading } = useJogadores(rachaId || "");

  const mensalistasBase = useMemo(() => mapMensalistas(jogadores), [jogadores]);

  const [valorPorDia, setValorPorDia] = useState<number>(10);
  const [descontos, setDescontos] = useState<Record<string, number>>({});

  const totalJogosPorDia = diasDaSemanaDoRacha.map((dia) =>
    countJogosAtletaNoMes(anoAtual, mesAtual + 1, [dia])
  );
  const totalJogosNoMes = totalJogosPorDia.reduce((a, b) => a + b, 0);
  const totalSemanasNoMes = countSemanasNoMes(anoAtual, mesAtual + 1);

  const valoresMensais = mensalistasBase.map((m) => {
    const jogosAtleta = countJogosAtletaNoMes(anoAtual, mesAtual + 1, diasDaSemanaDoRacha);
    const valorSemDesconto = valorPorDia * jogosAtleta;
    const desconto = descontos[m.id] || 0;
    return {
      ...m,
      jogosAtleta,
      valorSemDesconto,
      valorFinal: Math.max(valorSemDesconto - desconto, 0),
      labelDias: diasDaSemanaDoRacha.map((idx) => DIAS_SEMANA_LABEL[idx]).join(" e "),
      desconto,
    };
  });

  const totalMensalistas = valoresMensais.reduce((sum, m) => sum + m.valorFinal, 0);

  return (
    <>
      <Head>
        <title>Mensalistas | Admin - Fut7Pro</title>
        <meta
          name="description"
          content="Gerencie os mensalistas do racha, valores por dia jogado, descontos individuais, dias semanais e controle de pagamentos."
        />
      </Head>
      <section className="max-w-4xl mx-auto pt-20 pb-24 md:pt-6 md:pb-8 px-2">
        <h1 className="text-3xl font-bold text-yellow-500 mb-1 break-words">Mensalistas</h1>
        <p className="text-sm text-gray-300 mb-3">
          Defina o valor por dia jogado e o sistema calculará a mensalidade de cada atleta
          automaticamente.
          <br />
          <b>O sistema usa a agenda dos dias do seu racha:</b>{" "}
          <span className="text-yellow-300">
            {diasDaSemanaDoRacha.map((idx) => DIAS_SEMANA_LABEL[idx]).join(" e ")}
          </span>
          .<br />
          <span className="text-yellow-400">
            O valor de cada atleta é proporcional ao número de jogos dos dias em que ele é
            mensalista, em cada mês.
          </span>
        </p>
        <div className="mb-4 flex flex-wrap gap-4 items-end">
          <div>
            <label className="block text-sm text-gray-300 font-bold mb-1">
              Valor por dia jogado (R$)
            </label>
            <input
              type="number"
              min={1}
              step="0.01"
              value={valorPorDia}
              onChange={(e) => setValorPorDia(Number(e.target.value))}
              className="bg-neutral-800 border border-neutral-700 text-white rounded px-2 py-1 text-left"
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
                  className="bg-neutral-700 px-3 py-1 rounded-full text-yellow-400 border border-yellow-700 text-sm shadow hover:bg-yellow-800 transition"
                >
                  {DIAS_SEMANA_LABEL[dia].slice(0, 3)} <b>({totalJogosPorDia[i]})</b>
                </span>
              ))}
              <span className="ml-2 text-gray-300 text-sm font-normal">
                | Total: <b>{totalJogosNoMes}</b> jogos · {totalSemanasNoMes} semanas
              </span>
            </div>
          </div>
        </div>
        {totalSemanasNoMes === 5 && (
          <div className="mb-3 p-3 rounded-lg border border-yellow-700 bg-yellow-900/70 text-yellow-300 text-sm">
            <b>Atenção:</b> Este mês ({nomeMes}/{anoAtual}) possui <b>5 semanas</b> com racha
            agendado. O valor já considera todos os jogos previstos para este mês!
          </div>
        )}
        <div className="mb-4 font-bold text-base text-gray-200">
          Valor total dos mensalistas do mês:{" "}
          <span className="text-green-400">R$ {totalMensalistas.toFixed(2)}</span>
        </div>

        {isLoading ? (
          <div className="py-6 text-gray-300">Carregando jogadores...</div>
        ) : (
          <TabelaMensalistas
            mensalistas={valoresMensais.map((m) => ({
              id: m.id,
              nome: m.nome,
              status: m.status,
              valor: m.valorFinal,
              ultimoPagamento: m.ultimoPagamento,
            }))}
          />
        )}
      </section>
    </>
  );
}
