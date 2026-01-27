"use client";

import Head from "next/head";
import { useMemo, useState } from "react";
import { FaDownload, FaChevronDown } from "react-icons/fa";
import { useEstatutoPublic } from "@/hooks/useEstatuto";
import { useRacha } from "@/context/RachaContext";
import { rachaConfig } from "@/config/racha.config";
import {
  ESTATUTO_FALLBACK,
  ESTATUTO_FALLBACK_ATUALIZADO_EM,
  ESTATUTO_TOPICOS_PADRAO,
} from "@/config/estatuto.defaults";

function formatarData(valor?: string) {
  if (!valor) return "";
  const parsed = new Date(valor);
  if (Number.isNaN(parsed.getTime())) return valor;
  return parsed.toLocaleDateString("pt-BR");
}

export default function EstatutoPage() {
  const { tenantSlug } = useRacha();
  const slug = tenantSlug || rachaConfig.slug;
  const { estatuto, isLoading, isError } = useEstatutoPublic(slug);
  const [aberto, setAberto] = useState<number | null>(0);

  const topicos = useMemo(() => {
    return estatuto?.topicos?.length ? estatuto.topicos : ESTATUTO_TOPICOS_PADRAO;
  }, [estatuto?.topicos]);

  const atualizadoEm = formatarData(
    estatuto?.atualizadoEm || ESTATUTO_FALLBACK.atualizadoEm || ESTATUTO_FALLBACK_ATUALIZADO_EM
  );

  const handleDownload = () => {
    if (estatuto?.pdfUrl) {
      window.open(estatuto.pdfUrl, "_blank", "noopener,noreferrer");
      return;
    }
    alert("O PDF do estatuto ainda nao esta disponivel para este racha.");
  };

  return (
    <>
      <Head>
        <title>Estatuto | Sobre Nos | Fut7Pro</title>
        <meta
          name="description"
          content="Conheca o estatuto oficial do racha: regras de pontuacao, multas, penalidades, prioridades e boas praticas definidas pelo admin."
        />
        <meta
          name="keywords"
          content="estatuto, regras do racha, pontuacao, multas, penalidades, comportamento, mensalistas, reservas, fut7pro"
        />
      </Head>

      <main className="max-w-3xl mx-auto px-4 pt-20 flex flex-col gap-8">
        <section>
          <h1 className="text-3xl md:text-4xl font-bold text-brand mb-4">
            Estatuto do Racha Fut7Pro
          </h1>
          <p className="text-white text-base md:text-lg mb-4">
            O Estatuto reune todas as regras, criterios e boas praticas que regem o funcionamento do
            racha. O conteudo abaixo e carregado do painel do administrador e atualizado por tenant.
          </p>
          <button
            onClick={handleDownload}
            className="flex items-center gap-2 bg-brand text-black font-bold px-4 py-2 rounded-xl hover:brightness-110 transition mb-4"
          >
            <FaDownload /> Baixar PDF do Estatuto
          </button>
          {isLoading && (
            <div className="text-sm text-neutral-400">Carregando estatuto do racha...</div>
          )}
          {isError && (
            <div className="text-sm text-red-400">
              Nao foi possivel carregar o estatuto. Tente novamente em instantes.
            </div>
          )}
        </section>
        <section>
          <h2 className="text-2xl font-bold text-brand-soft mb-4">
            Perguntas Frequentes do Estatuto (FAQ)
          </h2>
          <div className="flex flex-col gap-3">
            {topicos.map((topico, idx) => (
              <div key={idx} className="bg-neutral-900 rounded-xl shadow-md overflow-hidden">
                <button
                  className={`flex justify-between items-center w-full px-5 py-4 text-left focus:outline-none transition ${
                    aberto === idx ? "bg-brand text-black" : "text-brand-soft"
                  }`}
                  aria-expanded={aberto === idx}
                  onClick={() => setAberto(aberto === idx ? null : idx)}
                  type="button"
                >
                  <span className="flex items-center gap-2 text-lg font-semibold">
                    {topico.titulo}
                    {topico.atualizado && (
                      <span className="ml-2 text-xs bg-white text-brand-strong font-bold px-2 py-0.5 rounded">
                        NOVA
                      </span>
                    )}
                  </span>
                  <FaChevronDown
                    className={`transition-transform duration-200 ${aberto === idx ? "rotate-180" : ""}`}
                  />
                </button>
                <div
                  className={`transition-all duration-300 px-5 ${
                    aberto === idx ? "max-h-[1500px] py-3 opacity-100" : "max-h-0 py-0 opacity-0"
                  } overflow-hidden bg-neutral-800 text-neutral-200 text-base`}
                >
                  <ul className="list-disc pl-5 flex flex-col gap-2">
                    {topico.conteudo.map((linha, liIdx) => (
                      <li key={liIdx}>{linha}</li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}
          </div>
        </section>
        <section className="mt-2 text-right text-neutral-400 text-xs">
          Ultima atualizacao: {atualizadoEm || "—"}
        </section>
      </main>
    </>
  );
}
