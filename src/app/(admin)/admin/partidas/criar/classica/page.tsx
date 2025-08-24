"use client";

import Head from "next/head";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { FaListOl, FaPlus, FaFutbol, FaCheckCircle } from "react-icons/fa";

// MOCKS (mantidos para exemplo)
const TIMES_MOCK = [
  { id: 1, nome: "Leões" },
  { id: 2, nome: "Tigres" },
  { id: 3, nome: "Águias" },
  { id: 4, nome: "Furacão" },
];
const JOGADORES_MOCK = [
  { id: 1, nome: "João", timeId: 1 },
  { id: 2, nome: "Pedro", timeId: 1 },
  { id: 3, nome: "Lucas", timeId: 2 },
  { id: 4, nome: "Marcos", timeId: 2 },
  { id: 5, nome: "Caio", timeId: 3 },
  { id: 6, nome: "Thiago", timeId: 3 },
  { id: 7, nome: "Rafael", timeId: 4 },
  { id: 8, nome: "Gustavo", timeId: 4 },
];

type Time = { id: number; nome: string };
type Jogador = { id: number; nome: string; timeId: number };
type GolAssistencia = { jogadorGol: number; jogadorAssist: number | null };
type Partida = {
  id: number;
  timeA: Time | null;
  timeB: Time | null;
  golsA: GolAssistencia[];
  golsB: GolAssistencia[];
  data: string;
};

export default function PartidaClassicaPage() {
  const router = useRouter();

  const [dataRodada, setDataRodada] = useState("");
  const [partidas, setPartidas] = useState<Partida[]>([]);
  const [modalOpen, setModalOpen] = useState<null | {
    partidaId: number;
    lado: "A" | "B";
  }>(null);
  const [rodadaSalva, setRodadaSalva] = useState(false);

  const adicionarPartida = () => {
    setPartidas((prev) => [
      ...prev,
      {
        id: prev.length + 1,
        timeA: null,
        timeB: null,
        golsA: [],
        golsB: [],
        data: dataRodada,
      },
    ]);
  };

  const atualizarTime = (
    id: number,
    timeKey: "timeA" | "timeB",
    value: string,
  ) => {
    setPartidas((prev) =>
      prev.map((p) =>
        p.id === id
          ? {
              ...p,
              [timeKey]: TIMES_MOCK.find((t) => t.nome === value) || null,
              ...(timeKey === "timeA" ? { golsA: [] } : { golsB: [] }),
            }
          : p,
      ),
    );
  };

  const abrirModalGol = (partidaId: number, lado: "A" | "B") =>
    setModalOpen({ partidaId, lado });
  const fecharModalGol = () => setModalOpen(null);

  const adicionarGolAssist = (
    jogadorGol: number,
    jogadorAssist: number | null,
  ) => {
    if (!modalOpen) return;
    setPartidas((prev) =>
      prev.map((p) => {
        if (p.id !== modalOpen.partidaId) return p;
        if (modalOpen.lado === "A") {
          return { ...p, golsA: [...p.golsA, { jogadorGol, jogadorAssist }] };
        }
        return { ...p, golsB: [...p.golsB, { jogadorGol, jogadorAssist }] };
      }),
    );
    fecharModalGol();
  };

  const getJogadoresDoTime = (time: Time | null) =>
    time ? JOGADORES_MOCK.filter((j) => j.timeId === time.id) : [];
  const getNomeJogador = (id: number | null) =>
    id ? JOGADORES_MOCK.find((j) => j.id === id)?.nome || "" : "";

  // Mock persistente: salva partidas em localStorage
  function salvarRodadaNoHistorico() {
    const historicoRaw =
      window.localStorage.getItem("fut7pro_historico_partidas") || "[]";
    const historico = JSON.parse(historicoRaw);

    const partidasFormatadas = partidas.map((p) => ({
      data: p.data,
      timeA: p.timeA?.nome,
      timeB: p.timeB?.nome,
      golsA: p.golsA.map((g) => ({
        jogadorGol: getNomeJogador(g.jogadorGol),
        jogadorAssist: g.jogadorAssist ? getNomeJogador(g.jogadorAssist) : null,
      })),
      golsB: p.golsB.map((g) => ({
        jogadorGol: getNomeJogador(g.jogadorGol),
        jogadorAssist: g.jogadorAssist ? getNomeJogador(g.jogadorAssist) : null,
      })),
      placarA: p.golsA.length,
      placarB: p.golsB.length,
    }));

    historico.push({
      dataRodada,
      partidas: partidasFormatadas,
      createdAt: new Date().toISOString(),
    });

    window.localStorage.setItem(
      "fut7pro_historico_partidas",
      JSON.stringify(historico),
    );
    setRodadaSalva(true);
    setTimeout(() => router.push("/admin/partidas/historico"), 2000);
  }

  return (
    <>
      <Head>
        <title>Partida Clássica | Fut7Pro Admin</title>
        <meta
          name="description"
          content="Cadastre partidas manualmente, retroativas ou de formatos clássicos do seu racha. Atualize históricos, rankings e estatísticas no Fut7Pro."
        />
        <meta
          name="keywords"
          content="partida clássica, cadastro manual, retroativo, fut7, racha, painel admin"
        />
      </Head>
      <main className="mx-auto max-w-3xl px-4 pb-24 pt-20 md:pb-8 md:pt-6">
        <h1 className="mb-5 flex items-center gap-3 text-3xl font-bold text-yellow-400 md:text-4xl">
          <FaListOl className="text-yellow-400" /> Partida Clássica
        </h1>
        <p className="mb-8 text-base text-neutral-300">
          Cadastre rodadas com partidas clássicas(estilo 8 minutos ou 2 gols) ou
          outros. Também adicione jogos antigos aqui, partidas avulsas e
          resultados do seu racha sem usar o sorteio inteligente. Escolha a
          data, crie as partidas da rodada, selecione os times e lance gols e
          assistências para cada partida.
        </p>

        {/* Data da rodada */}
        <div className="mb-8 flex flex-col items-center gap-4 md:flex-row">
          <label className="font-semibold text-yellow-300">
            Data da Rodada:
          </label>
          <input
            type="date"
            className="rounded-lg border border-yellow-400 bg-neutral-900 px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-yellow-400"
            value={dataRodada}
            onChange={(e) => setDataRodada(e.target.value)}
          />
          <button
            className="flex items-center gap-2 rounded-xl bg-yellow-400 px-6 py-2 font-bold text-black transition hover:bg-yellow-500"
            onClick={adicionarPartida}
            type="button"
            disabled={!dataRodada}
          >
            <FaPlus /> Nova Partida
          </button>
        </div>

        {/* Lista de partidas da rodada */}
        <div className="space-y-7">
          {partidas.map((p) => (
            <div
              key={p.id}
              className="flex flex-col gap-2 rounded-xl border border-yellow-700 bg-neutral-900 px-4 py-4 shadow"
              style={{ borderColor: "#f9b300" }}
            >
              <div className="flex flex-1 flex-col gap-2 md:flex-row md:items-center">
                <select
                  className="rounded border border-yellow-400 bg-neutral-800 px-3 py-2 text-white"
                  value={p.timeA?.nome || ""}
                  onChange={(e) => atualizarTime(p.id, "timeA", e.target.value)}
                >
                  <option value="">Time A</option>
                  {TIMES_MOCK.map((t) => (
                    <option key={t.id} value={t.nome}>
                      {t.nome}
                    </option>
                  ))}
                </select>
                <span className="mx-2 text-lg font-bold text-yellow-400">
                  x
                </span>
                <select
                  className="rounded border border-yellow-400 bg-neutral-800 px-3 py-2 text-white"
                  value={p.timeB?.nome || ""}
                  onChange={(e) => atualizarTime(p.id, "timeB", e.target.value)}
                >
                  <option value="">Time B</option>
                  {TIMES_MOCK.map((t) => (
                    <option key={t.id} value={t.nome}>
                      {t.nome}
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex flex-col justify-between gap-2 sm:flex-row sm:items-center">
                <button
                  className="flex items-center gap-2 rounded-lg bg-yellow-500 px-4 py-2 font-bold text-black transition hover:bg-yellow-400"
                  onClick={() => abrirModalGol(p.id, "A")}
                  disabled={!p.timeA}
                  type="button"
                >
                  <FaFutbol /> Gols {p.timeA?.nome || "Time A"}:{" "}
                  {p.golsA.length}
                </button>
                <button
                  className="flex items-center gap-2 rounded-lg bg-yellow-500 px-4 py-2 font-bold text-black transition hover:bg-yellow-400"
                  onClick={() => abrirModalGol(p.id, "B")}
                  disabled={!p.timeB}
                  type="button"
                >
                  <FaFutbol /> Gols {p.timeB?.nome || "Time B"}:{" "}
                  {p.golsB.length}
                </button>
                <span className="ml-auto flex gap-2 text-lg font-bold text-green-400">
                  {p.golsA.length} <span className="text-yellow-300">x</span>{" "}
                  {p.golsB.length}
                </span>
              </div>
              {(p.golsA.length > 0 || p.golsB.length > 0) && (
                <div className="mt-2 text-sm text-neutral-200">
                  <div>
                    {p.golsA.map((g, idx) => (
                      <div key={idx}>
                        <span className="font-bold text-yellow-300">
                          Gol {idx + 1} {p.timeA?.nome && `(${p.timeA.nome})`}:
                        </span>{" "}
                        {getNomeJogador(g.jogadorGol)}
                        {g.jogadorAssist && (
                          <span className="ml-2 text-cyan-300">
                            <span className="font-bold">Assist:</span>{" "}
                            {getNomeJogador(g.jogadorAssist)}
                          </span>
                        )}
                      </div>
                    ))}
                    {p.golsB.map((g, idx) => (
                      <div key={idx}>
                        <span className="font-bold text-yellow-300">
                          Gol {idx + 1} {p.timeB?.nome && `(${p.timeB.nome})`}:
                        </span>{" "}
                        {getNomeJogador(g.jogadorGol)}
                        {g.jogadorAssist && (
                          <span className="ml-2 text-cyan-300">
                            <span className="font-bold">Assist:</span>{" "}
                            {getNomeJogador(g.jogadorAssist)}
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>

        {modalOpen &&
          (() => {
            const partida = partidas.find((p) => p.id === modalOpen.partidaId);
            if (!partida) return null;
            const time = modalOpen.lado === "A" ? partida.timeA : partida.timeB;
            const jogadores = getJogadoresDoTime(time);
            return (
              <ModalAdicionarGol
                jogadores={jogadores}
                onClose={fecharModalGol}
                onSave={adicionarGolAssist}
              />
            );
          })()}

        {/* Salvar rodada */}
        {partidas.length > 0 && (
          <div className="mt-10 flex justify-end">
            <button
              className="rounded-xl bg-green-500 px-8 py-3 text-lg font-bold text-white transition hover:bg-green-600"
              onClick={salvarRodadaNoHistorico}
              type="button"
            >
              Salvar Rodada
            </button>
          </div>
        )}

        {/* Sucesso ao salvar */}
        {rodadaSalva && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70">
            <div className="flex flex-col items-center rounded-2xl border-2 border-green-400 bg-neutral-900 px-8 py-10 shadow-xl">
              <FaCheckCircle className="mb-4 text-5xl text-green-400" />
              <h2 className="mb-2 text-2xl font-bold text-green-400">
                Rodada salva com sucesso!
              </h2>
              <p className="mb-1 text-center text-base text-neutral-300">
                As partidas desta rodada já estão disponíveis no{" "}
                <span className="text-yellow-400">Histórico</span>.
              </p>
              <p className="text-sm text-neutral-400">
                Você será redirecionado automaticamente...
              </p>
            </div>
          </div>
        )}
      </main>
    </>
  );
}

// Modal para adicionar Gol e Assistência
function ModalAdicionarGol({
  jogadores,
  onClose,
  onSave,
}: {
  jogadores: Jogador[];
  onClose: () => void;
  onSave: (jogadorGol: number, jogadorAssist: number | null) => void;
}) {
  const [jogadorGol, setJogadorGol] = useState<number | "">("");
  const [jogadorAssist, setJogadorAssist] = useState<number | "">("");

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-80">
      <div className="relative flex w-full max-w-md flex-col items-center rounded-2xl border-2 border-yellow-600 bg-neutral-900 p-8 shadow-xl">
        <button
          className="absolute right-4 top-4 text-2xl text-neutral-400 hover:text-yellow-400"
          onClick={onClose}
          aria-label="Fechar modal"
        >
          ×
        </button>
        <h2 className="mb-6 text-xl font-bold text-yellow-400">
          Adicionar Gol e Assistência
        </h2>
        <div className="mb-6 flex w-full flex-col gap-4">
          <div>
            <label className="mb-1 block font-semibold text-neutral-300">
              Gol do Jogador
            </label>
            <select
              className="w-full rounded border border-yellow-400 bg-neutral-800 px-3 py-2 text-white"
              value={jogadorGol}
              onChange={(e) => setJogadorGol(Number(e.target.value))}
            >
              <option value="">Selecione...</option>
              {jogadores.map((j) => (
                <option key={j.id} value={j.id}>
                  {j.nome}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="mb-1 block font-semibold text-neutral-300">
              Assistência do Jogador
            </label>
            <select
              className="w-full rounded border border-yellow-400 bg-neutral-800 px-3 py-2 text-white"
              value={jogadorAssist}
              onChange={(e) => setJogadorAssist(Number(e.target.value))}
            >
              <option value="">Selecione...</option>
              <option value="">Nenhuma</option>
              {jogadores.map((j) => (
                <option key={j.id} value={j.id}>
                  {j.nome}
                </option>
              ))}
            </select>
          </div>
        </div>
        <button
          className="w-full rounded-xl bg-yellow-400 px-6 py-3 text-lg font-bold text-black transition hover:bg-yellow-500"
          onClick={() =>
            jogadorGol && onSave(jogadorGol, jogadorAssist || null)
          }
          disabled={!jogadorGol}
          type="button"
        >
          Salvar Gol
        </button>
      </div>
    </div>
  );
}
