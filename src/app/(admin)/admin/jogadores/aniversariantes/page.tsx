"use client";

import Head from "next/head";
import Image from "next/image";
import { useMemo, useState } from "react";
import { useAdminBirthdays } from "@/hooks/useAdminBirthdays";

const MESES = [
  { label: "Janeiro", value: 1 },
  { label: "Fevereiro", value: 2 },
  { label: "Março", value: 3 },
  { label: "Abril", value: 4 },
  { label: "Maio", value: 5 },
  { label: "Junho", value: 6 },
  { label: "Julho", value: 7 },
  { label: "Agosto", value: 8 },
  { label: "Setembro", value: 9 },
  { label: "Outubro", value: 10 },
  { label: "Novembro", value: 11 },
  { label: "Dezembro", value: 12 },
];

const AVATAR_FALLBACK = "/images/jogadores/jogador_padrao_01.jpg";

function formatDate(value: string | null) {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "-";
  return date.toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

export default function AniversariantesAdminPage() {
  const hoje = useMemo(() => new Date(), []);
  const [mesFiltro, setMesFiltro] = useState<number>(hoje.getMonth() + 1);
  const [rangeDias, setRangeDias] = useState<number>(45);

  const { birthdays, isLoading, isError, error } = useAdminBirthdays({
    month: mesFiltro,
    rangeDays: rangeDias,
    limit: 100,
  });

  const seoTitle = "Aniversariantes | Painel Admin - Fut7Pro";
  const seoDescription =
    "Faça o acompanhamento dos aniversariantes do seu racha e envie mensagens personalizadas no dia certo.";

  return (
    <>
      <Head>
        <title>{seoTitle}</title>
        <meta name="description" content={seoDescription} />
        <meta
          name="keywords"
          content="fut7pro, aniversariantes, parabéns, futebol 7, painel admin, engajamento"
        />
      </Head>

      <main className="min-h-screen bg-[#181A1B] text-white pt-20 px-3 md:px-4">
        <div className="max-w-4xl mx-auto">
          <header className="mb-8 text-center">
            <h1 className="text-2xl md:text-3xl font-bold text-yellow-400 mb-2">
              Aniversariantes do Racha
            </h1>
            <p className="text-sm text-gray-300 max-w-2xl mx-auto">
              O painel lista os próximos aniversários considerando o cadastro dos atletas.
              Personalize o mês e o intervalo de dias para preparar ações de engajamento.
            </p>
          </header>

          <section className="bg-[#1F2224] border border-zinc-800 rounded-2xl p-4 md:p-6 mb-6">
            <h2 className="text-lg font-semibold text-yellow-300 mb-4 text-center md:text-left">
              Filtros
            </h2>
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div className="flex flex-wrap justify-center gap-2 md:justify-start">
                {MESES.map((mes) => (
                  <button
                    key={mes.value}
                    onClick={() => setMesFiltro(mes.value)}
                    className={`px-3 py-1.5 rounded-full text-xs md:text-sm font-semibold transition ${
                      mesFiltro === mes.value
                        ? "bg-yellow-400 text-black shadow"
                        : "bg-zinc-800 text-gray-200 hover:bg-yellow-200 hover:text-black"
                    }`}
                  >
                    {mes.label}
                  </button>
                ))}
              </div>
              <div className="flex items-center gap-3">
                <label htmlFor="rangeDias" className="text-sm text-gray-300 whitespace-nowrap">
                  Próximos dias:
                </label>
                <input
                  id="rangeDias"
                  type="range"
                  min={7}
                  max={120}
                  step={1}
                  value={rangeDias}
                  onChange={(event) => setRangeDias(Number(event.target.value))}
                  className="w-48 accent-yellow-400"
                />
                <span className="text-sm text-gray-200 w-12 text-right">{rangeDias}d</span>
              </div>
            </div>
          </section>

          <section className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {isLoading && (
              <div className="col-span-full text-center text-gray-400 text-base py-10">
                Carregando aniversariantes...
              </div>
            )}

            {isError && (
              <div className="col-span-full text-center text-red-300 text-base py-10">
                Falha ao carregar aniversariantes: {error}
              </div>
            )}

            {!isLoading && !isError && birthdays.length === 0 && (
              <div className="col-span-full text-center text-gray-400 text-base py-10">
                Nenhum aniversário cadastrado para este período.
              </div>
            )}

            {birthdays.map((birthday) => {
              const isToday = birthday.daysUntil !== undefined ? birthday.daysUntil === 0 : false;

              return (
                <article
                  key={birthday.id}
                  className={`relative rounded-2xl border-2 p-5 flex flex-col items-center text-center shadow transition
                    ${
                      isToday
                        ? "border-orange-400 bg-[#2f231d] shadow-orange-500/20"
                        : "border-zinc-700 bg-[#1F2224] hover:border-yellow-400"
                    }`}
                >
                  {isToday && (
                    <span className="absolute top-3 left-3 text-xs bg-orange-400 text-black font-bold px-2 py-1 rounded-full">
                      Hoje!
                    </span>
                  )}
                  <Image
                    src={birthday.photoUrl?.trim() || AVATAR_FALLBACK}
                    alt={`Foto de ${birthday.name}`}
                    width={80}
                    height={80}
                    className="rounded-full border-2 border-yellow-400 object-cover mb-3"
                  />
                  <h3 className="text-lg font-bold text-yellow-300">{birthday.name}</h3>
                  {birthday.nickname && (
                    <p className="text-sm text-gray-400 mb-1">“{birthday.nickname}”</p>
                  )}
                  <p className="text-sm text-gray-200 mb-1">
                    Próximo aniversário em{" "}
                    <span className="font-semibold text-yellow-200">
                      {birthday.daysUntil === 0
                        ? "hoje!"
                        : `${birthday.daysUntil} dia${birthday.daysUntil === 1 ? "" : "s"}`}
                    </span>
                  </p>
                  <p className="text-xs text-gray-400 mb-4">
                    {formatDate(birthday.nextBirthday)}
                    {" • "}
                    {birthday.ageAtNextBirthday} anos
                  </p>
                  <p className="text-xs text-gray-500">
                    Data de nascimento: {formatDate(birthday.birthDate)}
                  </p>
                </article>
              );
            })}
          </section>

          <footer className="mt-10 text-xs text-gray-500 text-center">
            Os aniversários dependem do preenchimento da data de nascimento no cadastro do atleta.
            Atualize regularmente para manter esta lista precisa.
          </footer>
        </div>
      </main>
    </>
  );
}
