// src/app/admin/partidas/historico/page.tsx
"use client";

import Head from "next/head";
import { useState, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import CalendarioHistorico from "@/components/partidas/CalendarioHistorico";
import ModalEditarPartida from "@/components/admin/ModalEditarPartida";
import { mockConfrontos, mockTimes } from "@/mocks/admin/mockDia";
import type { Confronto } from "@/mocks/admin/mockDia";

// Função para retornar a logo do time baseado no nome
function getLogoTime(nome: string) {
  switch (nome.toLowerCase()) {
    case "leões":
      return "/images/times/time_padrao_01.png";
    case "tigres":
      return "/images/times/time_padrao_02.png";
    case "águias":
      return "/images/times/time_padrao_03.png";
    case "furacão":
      return "/images/times/time_padrao_04.png";
    default:
      return "/images/times/time_padrao_01.png";
  }
}

// Agrupamento de partidas por data e local
type GrupoPartidas = {
  [key: string]: { idx: number; tipo: "ida" | "volta"; confronto: Confronto }[];
};

function agruparPorDataELocal(
  confrontos: Confronto[],
  times: any[],
): GrupoPartidas {
  const grupos: GrupoPartidas = {};
  confrontos.forEach((c, idx) => {
    (["ida", "volta"] as const).forEach((tipo) => {
      const partida = c[tipo];
      const data = (partida as any).data ?? "Data não informada";
      const local = (partida as any).local ?? "Local não informado";
      const chave = `${data}||${local}`;
      if (!grupos[chave]) grupos[chave] = [];
      grupos[chave].push({ idx, tipo, confronto: c });
    });
  });
  return grupos;
}

export default function AdminHistoricoPartidasPage() {
  const [selected, setSelected] = useState<Date | undefined>(undefined);
  const [calOpen, setCalOpen] = useState(false);
  const btnRef = useRef<HTMLButtonElement>(null);
  const [confrontos, setConfrontos] = useState<Confronto[]>(
    mockConfrontos.map((c) => ({ ...c })),
  );
  const [editPartida, setEditPartida] = useState<null | {
    idx: number;
    tipo: "ida" | "volta";
  }>(null);

  const diasComPartida: Date[] = Array.from(
    new Set(
      confrontos
        .flatMap((c) => [(c.ida as any).data, (c.volta as any).data])
        .filter(Boolean),
    ),
  ).map((data) => new Date(data + "T00:00:00"));

  const confrontosFiltrados = selected
    ? confrontos.filter(
        (c) =>
          new Date((c.ida as any).data).toDateString() ===
            selected.toDateString() ||
          new Date((c.volta as any).data).toDateString() ===
            selected.toDateString(),
      )
    : confrontos;

  const grupos = agruparPorDataELocal(confrontosFiltrados, mockTimes);

  function handleSalvarResultado(
    idx: number,
    tipo: "ida" | "volta",
    placar: { a: number; b: number },
    eventos: any[],
  ) {
    setConfrontos((prev) =>
      prev.map((c, i) =>
        i !== idx
          ? c
          : {
              ...c,
              [tipo === "ida" ? "resultadoIda" : "resultadoVolta"]: {
                placar,
                eventos,
              },
            },
      ),
    );
    setEditPartida(null);
  }

  function handleExcluir(idx: number, tipo: "ida" | "volta") {
    if (window.confirm("Tem certeza que deseja excluir esta partida?")) {
      setConfrontos((prev) =>
        prev.map((c, i) =>
          i !== idx
            ? c
            : {
                ...c,
                [tipo === "ida" ? "resultadoIda" : "resultadoVolta"]: undefined,
              },
        ),
      );
    }
  }

  return (
    <>
      <Head>
        <title>Histórico de Partidas | Painel Admin - Fut7Pro</title>
        <meta
          name="description"
          content="Corrija placares, status, gols e assistências das partidas do seu racha. Painel do Presidente Fut7Pro, seguro e auditável."
        />
        <meta
          name="keywords"
          content="admin fut7, editar partidas, corrigir placar, editar gols, editar assistências, histórico futebol 7"
        />
      </Head>

      <main className="mx-auto max-w-5xl px-4 pb-24 pt-20 text-white md:pb-8 md:pt-6">
        <h1 className="mb-2 text-center text-2xl font-bold text-yellow-400 md:text-3xl">
          Histórico de Partidas (Admin)
        </h1>
        <p className="text-textoSuave mb-6 text-center text-base md:text-lg">
          Corrija eventuais erros de placar, gols ou assistências de qualquer
          partida do histórico. Edição rápida e fácil, igual ao painel de
          destaques do dia.
        </p>

        <div className="mb-6 flex justify-end">
          <button
            ref={btnRef}
            className="flex items-center gap-2 rounded-xl bg-yellow-400 px-4 py-2 font-semibold text-black shadow transition hover:bg-yellow-500"
            onClick={() => setCalOpen(!calOpen)}
            aria-label="Abrir calendário"
            type="button"
          >
            <svg width={20} height={20} fill="none" viewBox="0 0 24 24">
              <rect
                x={3}
                y={5}
                width={18}
                height={16}
                rx={2}
                fill="#181818"
                stroke="#222"
                strokeWidth={1.5}
              />
              <path
                d="M8 3v4M16 3v4"
                stroke="#FFD600"
                strokeWidth={2}
                strokeLinecap="round"
              />
              <rect x={7} y={9} width={2} height={2} rx={1} fill="#FFD600" />
              <rect x={11} y={9} width={2} height={2} rx={1} fill="#FFD600" />
              <rect x={15} y={9} width={2} height={2} rx={1} fill="#FFD600" />
            </svg>
            Selecionar Data
          </button>
        </div>

        <CalendarioHistorico
          diasComPartida={diasComPartida}
          selected={selected}
          onSelect={(date) => {
            setSelected(date);
            setCalOpen(false);
          }}
          open={calOpen}
          onClose={() => setCalOpen(false)}
          anchorRef={btnRef}
        />

        <div className="flex flex-col gap-10">
          {Object.keys(grupos).length === 0 && (
            <p className="text-textoSuave text-center">
              Nenhuma partida encontrada.
            </p>
          )}
          {Object.entries(grupos)
            .sort((a, b) => b[0].localeCompare(a[0]))
            .map(([chave, partidasDia]) => {
              const [data, local] = chave.split("||");
              return (
                <div
                  key={chave}
                  className="w-full rounded-xl bg-[#171717] p-4 shadow"
                >
                  <div className="mb-3 flex flex-col md:flex-row md:items-center md:justify-between">
                    <span className="text-lg font-bold text-yellow-400">
                      {data?.replace(/-/g, "/")}
                    </span>
                    <span className="text-textoSuave text-sm">{local}</span>
                  </div>
                  <div className="w-full overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-yellow-700 text-yellow-400">
                          <th className="px-2 py-2 text-left">#</th>
                          <th className="px-2 py-2 text-left">Time A</th>
                          <th className="px-2 py-2 text-center">Placar</th>
                          <th className="px-2 py-2 text-left">Time B</th>
                          <th className="px-2 py-2 text-center">Status</th>
                          <th className="px-2 py-2 text-center">Ação</th>
                        </tr>
                      </thead>
                      <tbody>
                        {partidasDia.map((partida, idx) => {
                          const { tipo, idx: i, confronto } = partida;
                          const p = confronto[tipo];
                          const resultado =
                            tipo === "ida"
                              ? confronto.resultadoIda
                              : confronto.resultadoVolta;

                          const timeA = mockTimes[p.a]?.nome ?? "-";
                          const timeB = mockTimes[p.b]?.nome ?? "-";
                          const logoA = getLogoTime(timeA);
                          const logoB = getLogoTime(timeB);

                          return (
                            <tr
                              key={i + tipo}
                              className="border-b border-[#232323] transition hover:bg-[#232323]"
                            >
                              <td className="px-2 py-2 font-bold">{idx + 1}</td>
                              <td className="flex items-center gap-2 px-2 py-2 font-semibold">
                                <span>{timeA}</span>
                                <Image
                                  src={logoA}
                                  alt={timeA}
                                  width={28}
                                  height={28}
                                  className="rounded"
                                />
                              </td>
                              <td className="px-2 py-2 text-center text-xl font-extrabold">
                                {resultado?.placar?.a ?? 0}{" "}
                                <span className="font-bold text-yellow-400">
                                  x
                                </span>{" "}
                                {resultado?.placar?.b ?? 0}
                              </td>
                              <td className="flex items-center gap-2 px-2 py-2 font-semibold">
                                <span>{timeB}</span>
                                <Image
                                  src={logoB}
                                  alt={timeB}
                                  width={28}
                                  height={28}
                                  className="rounded"
                                />
                              </td>
                              <td className="px-2 py-2 text-center">
                                <span
                                  className={`rounded-xl px-3 py-1 text-xs ${resultado?.placar ? "bg-green-700" : "bg-yellow-700"} text-white`}
                                >
                                  {resultado?.placar
                                    ? "Concluído"
                                    : "Em andamento"}
                                </span>
                              </td>
                              <td className="flex justify-center gap-2 px-2 py-2 text-center">
                                <button
                                  className="rounded-lg bg-cyan-600 px-3 py-1.5 text-xs font-bold text-white transition hover:bg-cyan-700"
                                  onClick={() =>
                                    setEditPartida({ idx: i, tipo })
                                  }
                                >
                                  Editar
                                </button>
                                <button
                                  className="rounded-lg bg-red-600 px-3 py-1.5 text-xs font-bold text-white transition hover:bg-red-700"
                                  onClick={() => handleExcluir(i, tipo)}
                                >
                                  Excluir
                                </button>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              );
            })}
        </div>

        {editPartida && (
          <ModalEditarPartida
            index={editPartida.idx}
            confronto={confrontos[editPartida.idx]}
            tipo={editPartida.tipo}
            times={mockTimes}
            onClose={() => setEditPartida(null)}
            onSalvar={handleSalvarResultado}
          />
        )}
      </main>
    </>
  );
}
