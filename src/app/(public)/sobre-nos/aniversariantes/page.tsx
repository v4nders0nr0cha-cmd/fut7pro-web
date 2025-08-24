"use client";
import Head from "next/head";
import Image from "next/image";
import { useMemo, useState } from "react";
import { mockAniversariantes } from "@/components/lists/mockAniversariantes";

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
  return dt.toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

function isAniversarioHoje(data: string) {
  const hoje = new Date();
  const d = new Date(data);
  return hoje.getDate() === d.getDate() && hoje.getMonth() === d.getMonth();
}

export default function AniversariantesPage() {
  const [mesFiltro, setMesFiltro] = useState<number>(new Date().getMonth());
  const aniversariantesDoMes = useMemo(() => {
    return mockAniversariantes.filter(
      (aniv) => new Date(aniv.dataNascimento).getMonth() === mesFiltro,
    );
  }, [mesFiltro]);

  const seoTitle = `Aniversariantes do mês | Fut7Pro`;
  const seoDescription = `Veja quem são os aniversariantes do mês no Fut7Pro. Parabéns automático pelo sistema no dia do aniversário!`;

  return (
    <>
      <Head>
        <title>{seoTitle}</title>
        <meta name="description" content={seoDescription} />
        <meta
          name="keywords"
          content={`fut7pro, aniversariantes, parabéns, futebol, racha, aniversário, confraternização, futebol 7`}
        />
      </Head>
      <main className="w-full pb-10 pt-20">
        <div className="mx-auto max-w-3xl px-4">
          <h1 className="mb-3 text-center text-2xl font-bold text-yellow-400 md:text-3xl">
            Aniversariantes do Mês
          </h1>
          {/* Duas linhas de meses, responsivas */}
          <div className="mb-6 flex flex-col gap-2">
            <div className="flex flex-wrap justify-center gap-2">
              {meses.slice(0, 6).map((mes, idx) => (
                <button
                  key={mes}
                  onClick={() => setMesFiltro(idx)}
                  className={`rounded-full px-3 py-1 text-xs font-semibold transition md:text-sm ${
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
                  className={`rounded-full px-3 py-1 text-xs font-semibold transition md:text-sm ${
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

          <section className="grid grid-cols-1 gap-5 md:grid-cols-2">
            {aniversariantesDoMes.length === 0 && (
              <div className="col-span-full py-8 text-center text-lg text-gray-400">
                <span>Nenhum aniversariante neste mês ainda! 🎈</span>
              </div>
            )}

            {aniversariantesDoMes.map((aniv) => {
              const ehHoje = isAniversarioHoje(aniv.dataNascimento);
              const idade = calcularIdade(aniv.dataNascimento);

              return (
                <div
                  key={aniv.id}
                  className={`relative flex flex-col items-center gap-3 rounded-xl border-2 bg-[#232323] p-4 shadow-lg ${
                    ehHoje
                      ? "animate-pulse border-orange-400 shadow-orange-300/30"
                      : "border-zinc-700"
                  } `}
                >
                  <div
                    className="absolute right-2 top-2 text-2xl"
                    title="Bolo de aniversário"
                  >
                    🎂
                  </div>
                  {ehHoje && (
                    <div className="absolute left-2 top-2 animate-bounce rounded-full bg-orange-400 px-2 py-0.5 text-xs font-bold text-white">
                      HOJE!
                    </div>
                  )}
                  <Image
                    src={aniv.foto}
                    alt={`Foto de ${aniv.nome}`}
                    width={74}
                    height={74}
                    className="rounded-full border-2 border-yellow-400 object-cover"
                  />
                  <div className="flex flex-col items-center text-center">
                    <span className="text-lg font-bold text-yellow-200 md:text-xl">
                      {aniv.nome}
                    </span>
                    <span className="text-sm text-gray-300">
                      {formatarData(aniv.dataNascimento)} • {idade} anos
                    </span>
                  </div>
                  {ehHoje && (
                    <div className="mt-2 w-full rounded bg-orange-100 px-2 py-1 text-center text-xs font-semibold text-orange-700 shadow">
                      Parabéns, {aniv.nome}! 🎉
                    </div>
                  )}
                </div>
              );
            })}
          </section>
          <div className="mt-8 text-center text-xs text-gray-400">
            As mensagens de parabéns são enviadas automaticamente para o
            aniversariante, às 8h do dia, sem exposição de dados pessoais.
          </div>
        </div>
      </main>
    </>
  );
}
