"use client";

import Head from "next/head";
import Image from "next/image";
import { useMemo, useState } from "react";
import { usePublicBirthdays } from "@/hooks/usePublicBirthdays";
import { usePublicLinks } from "@/hooks/usePublicLinks";

const meses = [
  "Janeiro",
  "Fevereiro",
  "Marco",
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

function calcularIdade(day: number, month: number, year: number) {
  const hoje = new Date();
  let idade = hoje.getFullYear() - year;
  const mesAtual = hoje.getMonth() + 1;
  if (mesAtual < month || (mesAtual === month && hoje.getDate() < day)) {
    idade -= 1;
  }
  return idade;
}

function formatarData(day: number, month: number, year?: number | null) {
  const dia = String(day).padStart(2, "0");
  const mes = String(month).padStart(2, "0");
  if (year) {
    return `${dia}/${mes}/${year}`;
  }
  return `${dia}/${mes}`;
}

function isAniversarioHoje(day: number, month: number) {
  const hoje = new Date();
  return hoje.getDate() === day && hoje.getMonth() + 1 === month;
}

export default function AniversariantesPage() {
  const { publicSlug } = usePublicLinks();
  const [mesFiltro, setMesFiltro] = useState<number>(new Date().getMonth());

  const { birthdays, isLoading } = usePublicBirthdays({
    slug: publicSlug,
    month: mesFiltro + 1,
    enabled: Boolean(publicSlug),
  });

  const aniversariantesDoMes = useMemo(() => {
    return [...birthdays].sort((a, b) => a.birthDay - b.birthDay);
  }, [birthdays]);

  const seoTitle = "Aniversariantes do mes | Fut7Pro";
  const seoDescription =
    "Veja quem sao os aniversariantes do mes no Fut7Pro. Parabens automatico pelo sistema no dia do aniversario!";

  return (
    <>
      <Head>
        <title>{seoTitle}</title>
        <meta name="description" content={seoDescription} />
        <meta
          name="keywords"
          content="fut7pro, aniversariantes, parabens, futebol, racha, aniversario, confraternizacao, futebol 7"
        />
      </Head>
      <main className="w-full pt-20 pb-10">
        <div className="max-w-3xl mx-auto px-4">
          <h1 className="text-2xl md:text-3xl font-bold text-brand text-center mb-3">
            Aniversariantes do Mes
          </h1>
          <div className="flex flex-col gap-2 mb-6">
            <div className="flex flex-wrap justify-center gap-2">
              {meses.slice(0, 6).map((mes, idx) => (
                <button
                  key={mes}
                  onClick={() => setMesFiltro(idx)}
                  className={`px-3 py-1 rounded-full text-xs md:text-sm font-semibold transition ${
                    mesFiltro === idx
                      ? "bg-brand text-black shadow"
                      : "bg-zinc-800 text-gray-300 hover:bg-brand-soft hover:text-black"
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
                      ? "bg-brand text-black shadow"
                      : "bg-zinc-800 text-gray-300 hover:bg-brand-soft hover:text-black"
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
                <span>Nenhum aniversariante neste mes ainda!</span>
              </div>
            )}

            {!isLoading &&
              aniversariantesDoMes.map((aniv) => {
                const ehHoje = isAniversarioHoje(aniv.birthDay, aniv.birthMonth);
                const idade =
                  typeof aniv.birthYear === "number"
                    ? calcularIdade(aniv.birthDay, aniv.birthMonth, aniv.birthYear)
                    : null;

                return (
                  <div
                    key={aniv.id}
                    className={`rounded-xl bg-[#232323] shadow-lg p-4 flex flex-col items-center gap-3 border-2 relative ${
                      ehHoje
                        ? "border-orange-400 animate-pulse shadow-orange-300/30"
                        : "border-zinc-700"
                    }`}
                  >
                    {ehHoje && (
                      <div className="absolute top-2 left-2 text-xs bg-orange-400 text-white px-2 py-0.5 rounded-full font-bold animate-bounce">
                        HOJE!
                      </div>
                    )}
                    <Image
                      src={aniv.photoUrl || "/images/jogadores/jogador_padrao_01.jpg"}
                      alt={`Foto de ${aniv.name}`}
                      width={74}
                      height={74}
                      className="rounded-full border-2 border-brand object-cover"
                    />
                    <div className="flex flex-col items-center text-center">
                      <span className="font-bold text-lg md:text-xl text-brand-soft">
                        {aniv.nickname || aniv.name}
                      </span>
                      <span className="text-gray-300 text-sm">
                        {formatarData(aniv.birthDay, aniv.birthMonth, aniv.birthYear)}
                        {idade !== null ? ` - ${idade} anos` : ""}
                      </span>
                    </div>
                    {ehHoje && (
                      <div className="w-full mt-2 bg-orange-100 text-orange-700 text-center rounded px-2 py-1 text-xs font-semibold shadow">
                        Parabens, {aniv.nickname || aniv.name}!
                      </div>
                    )}
                  </div>
                );
              })}
          </section>
          <div className="text-xs text-gray-400 mt-8 text-center">
            As mensagens de parabens sao enviadas automaticamente para o aniversariante as 8h do
            dia, sem exposicao de dados pessoais.
          </div>
        </div>
      </main>
    </>
  );
}
