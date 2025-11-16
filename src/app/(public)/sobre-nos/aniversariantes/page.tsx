"use client";
import Head from "next/head";
import Image from "next/image";
import { useMemo, useState } from "react";
import { usePublicAthletes } from "@/hooks/usePublicAthletes";

const MESES = [
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

const AVATAR_FALLBACK = "/images/jogadores/jogador_padrao_01.jpg";

function parseDate(value?: string | null) {
  if (!value) return null;
  const dt = new Date(value);
  if (Number.isNaN(dt.getTime())) {
    return null;
  }
  return dt;
}

function formatarData(value?: string | null) {
  const dt = parseDate(value);
  if (!dt) return "--/--/----";
  return dt.toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit", year: "numeric" });
}

function calcularIdade(value?: string | null) {
  const nascimento = parseDate(value);
  if (!nascimento) return null;
  const hoje = new Date();
  let idade = hoje.getFullYear() - nascimento.getFullYear();
  const mes = hoje.getMonth() - nascimento.getMonth();
  if (mes < 0 || (mes === 0 && hoje.getDate() < nascimento.getDate())) {
    idade--;
  }
  return idade;
}

function isAniversarioHoje(value?: string | null) {
  const aniversario = parseDate(value);
  if (!aniversario) return false;
  const hoje = new Date();
  return aniversario.getDate() === hoje.getDate() && aniversario.getMonth() === hoje.getMonth();
}

export default function AniversariantesPage() {
  const [mesFiltro, setMesFiltro] = useState<number>(new Date().getMonth());
  const { athletes, isLoading, isError, error } = usePublicAthletes({ limit: 400 });

  const aniversariantesDoMes = useMemo(() => {
    return athletes
      .map((athlete) => {
        const nascimento = athlete.birthDate ?? null;
        const data = parseDate(nascimento);
        if (!data) return null;
        return {
          id: athlete.id,
          nome: athlete.nome,
          photoUrl: athlete.photoUrl?.trim() || athlete.foto || AVATAR_FALLBACK,
          dataNascimento: data.toISOString(),
        };
      })
      .filter((item): item is NonNullable<typeof item> => {
        if (!item) return false;
        const data = parseDate(item.dataNascimento);
        return Boolean(data && data.getMonth() === mesFiltro);
      })
      .sort((a, b) => {
        const diaA = parseDate(a.dataNascimento)?.getDate() ?? 0;
        const diaB = parseDate(b.dataNascimento)?.getDate() ?? 0;
        return diaA - diaB;
      });
  }, [athletes, mesFiltro]);

  const seoTitle = `Aniversariantes do mês | Fut7Pro`;
  const seoDescription = `Veja quem são os aniversariantes do mês no Fut7Pro. Parabéns automático pelo sistema no dia do aniversário!`;

  return (
    <>
      <Head>
        <title>{seoTitle}</title>
        <meta name="description" content={seoDescription} />
        <meta
          name="keywords"
          content="fut7pro, aniversariantes, parabéns, futebol, racha, aniversário, confraternização, futebol 7"
        />
      </Head>
      <main className="w-full pt-20 pb-10">
        <div className="max-w-3xl mx-auto px-4">
          <h1 className="text-2xl md:text-3xl font-bold text-yellow-400 text-center mb-3">
            Aniversariantes do Mês
          </h1>
          <div className="flex flex-col gap-2 mb-6">
            <div className="flex flex-wrap justify-center gap-2">
              {MESES.slice(0, 6).map((mes, idx) => (
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
              {MESES.slice(6).map((mes, idx) => (
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

          {isLoading && (
            <div className="text-center text-gray-400 py-10">Carregando aniversariantes...</div>
          )}
          {isError && (
            <div className="text-center text-red-300 py-10">
              {error ?? "Não foi possível carregar os aniversariantes."}
            </div>
          )}

          <section className="grid grid-cols-1 md:grid-cols-2 gap-5" aria-live="polite">
            {!isLoading && aniversariantesDoMes.length === 0 && (
              <div className="col-span-full text-center text-gray-400 text-lg py-8">
                <span>Nenhum aniversariante neste mês ainda! 🎂</span>
              </div>
            )}

            {aniversariantesDoMes.map((aniv) => {
              const ehHoje = isAniversarioHoje(aniv.dataNascimento);
              const idade = calcularIdade(aniv.dataNascimento);

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
                    src={aniv.photoUrl}
                    alt={`Foto de ${aniv.nome}`}
                    width={74}
                    height={74}
                    className="rounded-full border-2 border-yellow-400 object-cover"
                  />
                  <div className="flex flex-col items-center text-center">
                    <span className="font-bold text-lg md:text-xl text-yellow-200">
                      {aniv.nome}
                    </span>
                    <span className="text-gray-300 text-sm">
                      {formatarData(aniv.dataNascimento)}
                      {idade !== null ? ` • ${idade} anos` : ""}
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
            As mensagens de parabéns são enviadas automaticamente para o aniversariante às 8h do
            dia, sem exposição de dados pessoais.
          </div>
        </div>
      </main>
    </>
  );
}
