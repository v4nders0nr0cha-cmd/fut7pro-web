"use client";

import Head from "next/head";
import Image from "next/image";
import { useMemo, useState } from "react";
import { useJogadores } from "@/hooks/useJogadores";
import { useRacha } from "@/context/RachaContext";
import type { Jogador } from "@/types/jogador";

const meses = [
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

function calcularIdade(data: string) {
  const hoje = new Date();
  const nasc = new Date(data);
  let idade = hoje.getFullYear() - nasc.getFullYear();
  const m = hoje.getMonth() - nasc.getMonth();
  if (m < 0 || (m === 0 && hoje.getDate() < nasc.getDate())) idade--;
  return idade;
}

function formatarData(data: string) {
  const dt = new Date(data);
  return dt.toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit", year: "numeric" });
}

function isAniversarioHoje(data: string) {
  const hoje = new Date();
  const d = new Date(data);
  return hoje.getDate() === d.getDate() && hoje.getMonth() === d.getMonth();
}

function getNascimento(j: Jogador) {
  return j.dataNascimento || j.birthDate || j.nascimento || null;
}

export default function AniversariantesAdminPage() {
  const { rachaId } = useRacha();
  const { jogadores, isLoading } = useJogadores(rachaId || "");
  const [mesFiltro, setMesFiltro] = useState<number>(new Date().getMonth());

  const aniversariantesDoMes = useMemo(() => {
    return jogadores
      .map((j) => ({
        id: j.id,
        nome: j.nome || j.apelido || j.nickname || "Atleta",
        foto: j.foto || j.avatar || "/images/jogadores/jogador_padrao_01.jpg",
        dataNascimento: getNascimento(j),
      }))
      .filter((aniv) => aniv.dataNascimento)
      .filter((aniv) => new Date(aniv.dataNascimento as string).getMonth() === mesFiltro);
  }, [jogadores, mesFiltro]);

  const seoTitle = `Aniversariantes do mês | Painel Admin - Fut7Pro`;
  const seoDescription = `Veja quem são os aniversariantes do mês do seu racha. O sistema envia parabéns automático no dia do aniversário.`;

  return (
    <>
      <Head>
        <title>{seoTitle}</title>
        <meta name="description" content={seoDescription} />
        <meta
          name="keywords"
          content="fut7pro, aniversariantes, parabéns, futebol, racha, aniversário, admin, painel, futebol 7"
        />
      </Head>
      <main className="min-h-screen bg-[#181A1B] text-white pt-20 px-2 md:px-4">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-2xl md:text-3xl font-bold text-yellow-400 text-center mb-3">
            Aniversariantes do Mês
          </h1>
          <div className="flex flex-col gap-2 mb-6">
            <div className="flex flex-wrap justify-center gap-2">
              {meses.slice(0, 6).map((mes, idx) => (
                <button
                  key={mes}
                  onClick={() => setMesFiltro(idx)}
                  className={`px-3 py-1 rounded-full text-xs md:text-sm font-semibold transition ${
                    mesFiltro === idx
                      ? "bg-yellow-400 text-black shadow"
                      : "bg-zinc-800 text-gray-300 hover:bg-yellow-200 hover:text-black"
                  }`}
                >
                  {mes}
                </button>
              ))}
            </div>
            <div className="flex flex-wrap justify-center gap-2">
              {meses.slice(6).map((mes, idx) => (
                <button
                  key={mes}
                  onClick={() => setMesFiltro(idx + 6)}
                  className={`px-3 py-1 rounded-full text-xs md:text-sm font-semibold transition ${
                    mesFiltro === idx + 6
                      ? "bg-yellow-400 text-black shadow"
                      : "bg-zinc-800 text-gray-300 hover:bg-yellow-200 hover:text-black"
                  }`}
                >
                  {mes}
                </button>
              ))}
            </div>
          </div>

          <section className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {isLoading && (
              <div className="col-span-full text-center text-gray-400 text-lg py-8">
                Carregando aniversariantes...
              </div>
            )}

            {!isLoading && aniversariantesDoMes.length === 0 && (
              <div className="col-span-full text-center text-gray-400 text-lg py-8">
                <span>Nenhum aniversariante neste mês ainda! 🎈</span>
              </div>
            )}

            {!isLoading &&
              aniversariantesDoMes.map((aniv) => {
                const ehHoje = isAniversarioHoje(aniv.dataNascimento as string);
                const idade = calcularIdade(aniv.dataNascimento as string);

                return (
                  <div
                    key={aniv.id}
                    className={`rounded-xl bg-[#232323] shadow-lg p-4 flex flex-col items-center gap-3 border-2 relative ${
                      ehHoje
                        ? "border-orange-400 animate-pulse shadow-orange-300/30"
                        : "border-zinc-700"
                    }`}
                  >
                    <div className="absolute top-2 right-2 text-2xl" title="Bolo de aniversário">
                      🎂
                    </div>
                    {ehHoje && (
                      <div className="absolute top-2 left-2 text-xs bg-orange-400 text-white px-2 py-0.5 rounded-full font-bold animate-bounce">
                        HOJE!
                      </div>
                    )}
                    <Image
                      src={aniv.foto}
                      alt={`Foto de ${aniv.nome} - aniversariante do racha`}
                      width={74}
                      height={74}
                      className="rounded-full border-2 border-yellow-400 object-cover"
                    />
                    <div className="flex flex-col items-center text-center">
                      <span className="font-bold text-lg md:text-xl text-yellow-200">
                        {aniv.nome}
                      </span>
                      <span className="text-gray-300 text-sm">
                        {formatarData(aniv.dataNascimento as string)} • {idade} anos
                      </span>
                    </div>
                    {ehHoje && (
                      <div className="w-full mt-2 bg-orange-100 text-orange-700 text-center rounded px-2 py-1 text-xs font-semibold shadow">
                        Parabéns, {aniv.nome}! 🎉
                      </div>
                    )}
                  </div>
                );
              })}
          </section>
          <div className="text-xs text-gray-400 mt-8 text-center">
            As mensagens de parabéns são enviadas automaticamente para o aniversariante, às 8h do
            dia, sem exposição de dados pessoais.
          </div>
        </div>
      </main>
    </>
  );
}
