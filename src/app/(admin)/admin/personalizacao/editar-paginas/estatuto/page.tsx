"use client";

import Head from "next/head";
import { useEffect, useMemo, useRef, useState } from "react";
import { FaChevronDown, FaTrash, FaPlus, FaArrowUp, FaArrowDown } from "react-icons/fa";
import { useEstatutoAdmin } from "@/hooks/useEstatuto";
import {
  ESTATUTO_FALLBACK_ATUALIZADO_EM,
  ESTATUTO_TOPICOS_PADRAO,
} from "@/config/estatuto.defaults";
import { normalizeEstatutoTopicos } from "@/utils/estatuto";
import type { EstatutoTopico } from "@/types/estatuto";

const MAX_TOPICOS = 8;

function formatarData(valor?: string | null) {
  if (!valor) return "";
  const parsed = new Date(valor);
  if (Number.isNaN(parsed.getTime())) return valor;
  return parsed.toLocaleDateString("pt-BR");
}

export default function EditarEstatutoAdmin() {
  const { estatuto, isLoading, isError, update } = useEstatutoAdmin();
  const [topicos, setTopicos] = useState<EstatutoTopico[]>(
    normalizeEstatutoTopicos(ESTATUTO_TOPICOS_PADRAO)
  );
  const [aberto, setAberto] = useState<number | null>(0);
  const [ultimaAtualizacao, setUltimaAtualizacao] = useState<string>(
    ESTATUTO_FALLBACK_ATUALIZADO_EM
  );
  const [salvando, setSalvando] = useState(false);
  const [mensagem, setMensagem] = useState<string | null>(null);
  const [erro, setErro] = useState<string | null>(null);
  const [novoTopicoId, setNovoTopicoId] = useState<string | null>(null);
  const tituloRefs = useRef<Record<string, HTMLInputElement | null>>({});

  useEffect(() => {
    if (estatuto?.topicos?.length) {
      setTopicos(normalizeEstatutoTopicos(estatuto.topicos));
    } else if (estatuto && (!estatuto.topicos || estatuto.topicos.length === 0)) {
      setTopicos(normalizeEstatutoTopicos(ESTATUTO_TOPICOS_PADRAO));
    }
    if (estatuto?.atualizadoEm) {
      setUltimaAtualizacao(estatuto.atualizadoEm);
    }
  }, [estatuto, estatuto?.topicos, estatuto?.atualizadoEm]);

  useEffect(() => {
    if (!novoTopicoId) return;
    const handle = window.setTimeout(() => {
      window.scrollTo({ top: 0, behavior: "smooth" });
      const input = tituloRefs.current[novoTopicoId];
      if (input) {
        input.focus();
        input.select();
      }
      setNovoTopicoId(null);
    }, 50);
    return () => window.clearTimeout(handle);
  }, [novoTopicoId]);

  const adicionarTopico = () => {
    if (topicos.length >= MAX_TOPICOS) {
      setMensagem(`Limite maximo de ${MAX_TOPICOS} topicos atingido.`);
      setTimeout(() => setMensagem(null), 2500);
      return;
    }
    const id =
      typeof crypto !== "undefined" && "randomUUID" in crypto
        ? crypto.randomUUID()
        : `topico-${Date.now()}`;
    const novoTopico: EstatutoTopico = {
      id,
      titulo: "Novo Topico",
      conteudo: [""],
    };
    setTopicos([novoTopico, ...topicos]);
    setAberto(0);
    setNovoTopicoId(id);
  };

  const removerTopico = (idx: number) => {
    if (topicos.length <= 1) return;
    const novos = topicos.filter((_, i) => i !== idx);
    setTopicos(novos);
    setAberto(novos.length ? Math.min(idx, novos.length - 1) : null);
  };

  const moverTopico = (fromIdx: number, toIdx: number) => {
    if (toIdx < 0 || toIdx >= topicos.length) return;
    const novos = [...topicos];
    const [moved] = novos.splice(fromIdx, 1);
    if (moved) {
      novos.splice(toIdx, 0, moved);
      setTopicos(novos);
      setAberto(toIdx);
    }
  };

  const alterarTitulo = (idx: number, valor: string) => {
    setTopicos(topicos.map((t, i) => (i === idx ? { ...t, titulo: valor } : t)));
  };

  const adicionarLinha = (idx: number) => {
    setTopicos(topicos.map((t, i) => (i === idx ? { ...t, conteudo: [...t.conteudo, ""] } : t)));
  };

  const removerLinha = (tIdx: number, lIdx: number) => {
    setTopicos(
      topicos.map((t, i) =>
        i === tIdx ? { ...t, conteudo: t.conteudo.filter((_, j) => j !== lIdx) } : t
      )
    );
  };

  const alterarLinha = (tIdx: number, lIdx: number, valor: string) => {
    setTopicos(
      topicos.map((t, i) =>
        i === tIdx
          ? { ...t, conteudo: t.conteudo.map((linha, j) => (j === lIdx ? valor : linha)) }
          : t
      )
    );
  };

  const alternarAtualizado = (idx: number) => {
    setTopicos(topicos.map((t, i) => (i === idx ? { ...t, atualizado: !t.atualizado } : t)));
  };

  const handleSalvar = async () => {
    setSalvando(true);
    setMensagem(null);
    setErro(null);

    try {
      const sanitized = normalizeEstatutoTopicos(topicos);
      const payload = {
        ...estatuto,
        atualizadoEm: new Date().toISOString(),
        topicos: sanitized.map((topico, idx) => ({
          ...topico,
          ordem: idx,
          conteudo: (() => {
            const cleaned = (topico.conteudo || []).map((linha) => linha.trim()).filter(Boolean);
            return cleaned.length > 0 ? cleaned : topico.conteudo?.length ? topico.conteudo : [""];
          })(),
        })),
      };

      const salvo = await update(payload);
      if (salvo?.topicos?.length) {
        setTopicos(salvo.topicos);
      }
      if (salvo?.atualizadoEm) {
        setUltimaAtualizacao(salvo.atualizadoEm);
      } else if (payload.atualizadoEm) {
        setUltimaAtualizacao(payload.atualizadoEm);
      }

      setMensagem("Estatuto salvo com sucesso.");
      setTimeout(() => setMensagem(null), 3000);
    } catch (err: any) {
      setErro(err?.message || "Erro ao salvar o estatuto");
    } finally {
      setSalvando(false);
    }
  };

  const ultimaAtualizacaoFormatada = useMemo(
    () => formatarData(ultimaAtualizacao) || "—",
    [ultimaAtualizacao]
  );

  return (
    <>
      <Head>
        <title>Editar Estatuto | Admin | Fut7Pro</title>
        <meta
          name="description"
          content="Painel administrativo para editar o estatuto do racha, regras, criterios de pontuacao, multas, penalidades e organizacao."
        />
        <meta
          name="keywords"
          content="admin estatuto, regras racha, painel administracao, editar estatuto, fut7pro, futebol 7"
        />
      </Head>
      <main className="max-w-3xl mx-auto px-4 pt-20 pb-24 md:pt-6 md:pb-8 flex flex-col gap-8">
        <section>
          <h1 className="text-3xl md:text-4xl font-bold text-yellow-400 mb-4">Editar Estatuto</h1>
          <p className="text-white text-base md:text-lg mb-4">
            Gerencie as regras oficiais, criterios e perguntas frequentes do seu racha de forma
            simples e segura. Depois de salvar, o site publico e as paginas slugadas do racha sao
            revalidadas automaticamente.
            <br />
            <span className="text-yellow-300 text-sm font-semibold block mt-2">
              Os topicos abaixo sao padroes em praticamente todo racha. Voce pode organizar,
              remover, renomear ou criar outros topicos de acordo com a necessidade. Maximo de{" "}
              {MAX_TOPICOS} topicos.
            </span>
          </p>
        </section>

        <section>
          <div className="flex items-center gap-3 mb-4">
            <h2 className="text-2xl font-bold text-yellow-300">Topicos do Estatuto</h2>
            <div className="flex flex-col items-start gap-1">
              <button
                className={`ml-2 px-3 py-2 rounded-md text-sm flex items-center gap-1 font-bold border-2 border-yellow-400 ${topicos.length >= MAX_TOPICOS ? "opacity-40 cursor-not-allowed" : "bg-yellow-400 text-black hover:brightness-110"}`}
                onClick={adicionarTopico}
                disabled={topicos.length >= MAX_TOPICOS}
              >
                <FaPlus /> Novo Topico
              </button>
              {topicos.length >= MAX_TOPICOS ? (
                <span className="text-xs text-amber-300">
                  Limite maximo de {MAX_TOPICOS} topicos atingido.
                </span>
              ) : null}
            </div>
          </div>

          <div className="flex flex-col gap-3">
            {topicos.map((topico, idx) => (
              <div
                key={topico.id ?? idx}
                className="bg-neutral-900 rounded-xl shadow-md overflow-hidden border border-neutral-700"
              >
                <button
                  className={`flex justify-between items-center w-full px-5 py-4 text-left focus:outline-none transition ${aberto === idx ? "bg-yellow-400 text-black" : "text-yellow-300"}`}
                  aria-expanded={aberto === idx}
                  onClick={() => setAberto(aberto === idx ? null : idx)}
                  type="button"
                >
                  <span className="flex items-center gap-2 text-lg font-semibold w-full">
                    <input
                      className={`font-bold bg-transparent outline-none border-0 border-b-2 border-dashed border-yellow-400 text-lg w-full px-1 ${aberto === idx ? "text-black" : "text-yellow-300"}`}
                      value={topico.titulo}
                      ref={(el) => {
                        if (topico.id) {
                          tituloRefs.current[topico.id] = el;
                        }
                      }}
                      onChange={(e) => alterarTitulo(idx, e.target.value)}
                      maxLength={60}
                      title="Titulo do topico"
                    />
                    {topico.atualizado && (
                      <span className="ml-2 text-xs bg-white text-yellow-500 font-bold px-2 py-0.5 rounded">
                        NOVA
                      </span>
                    )}
                  </span>
                  <span className="flex items-center gap-2">
                    <button
                      title="Mover para cima"
                      type="button"
                      className={`p-1 rounded-full ${idx === 0 ? "opacity-30 cursor-not-allowed" : "hover:bg-yellow-200 text-yellow-700"}`}
                      onClick={(e) => {
                        e.stopPropagation();
                        moverTopico(idx, idx - 1);
                      }}
                      disabled={idx === 0}
                      tabIndex={-1}
                    >
                      <FaArrowUp />
                    </button>
                    <button
                      title="Mover para baixo"
                      type="button"
                      className={`p-1 rounded-full ${idx === topicos.length - 1 ? "opacity-30 cursor-not-allowed" : "hover:bg-yellow-200 text-yellow-700"}`}
                      onClick={(e) => {
                        e.stopPropagation();
                        moverTopico(idx, idx + 1);
                      }}
                      disabled={idx === topicos.length - 1}
                      tabIndex={-1}
                    >
                      <FaArrowDown />
                    </button>
                    <button
                      title="Excluir topico"
                      type="button"
                      className="p-1 ml-2 rounded-full hover:bg-red-600 text-red-400"
                      onClick={(e) => {
                        e.stopPropagation();
                        removerTopico(idx);
                      }}
                      disabled={topicos.length <= 1}
                      tabIndex={-1}
                    >
                      <FaTrash />
                    </button>
                    <FaChevronDown
                      className={`ml-3 transition-transform duration-200 ${aberto === idx ? "rotate-180" : ""}`}
                    />
                  </span>
                </button>
                <div
                  className={`transition-all duration-300 px-5 ${aberto === idx ? "max-h-[3000px] py-4 opacity-100" : "max-h-0 py-0 opacity-0"} overflow-hidden bg-neutral-800 text-neutral-200 text-base`}
                >
                  <div className="flex items-center gap-2 mb-3 text-sm text-neutral-300">
                    <input
                      id={`novo-${topico.id ?? idx}`}
                      type="checkbox"
                      className="h-4 w-4"
                      checked={Boolean(topico.atualizado)}
                      onChange={() => alternarAtualizado(idx)}
                    />
                    <label htmlFor={`novo-${topico.id ?? idx}`}>
                      Marcar como NOVO no site publico
                    </label>
                  </div>
                  <ul className="flex flex-col gap-2">
                    {(topico.conteudo ?? [""]).map((linha, lIdx) => (
                      <li key={lIdx} className="flex items-center gap-2">
                        <textarea
                          className="bg-neutral-900 text-white rounded-lg p-2 w-full border border-neutral-700 focus:border-yellow-400 text-base min-h-[36px] resize-y"
                          value={linha}
                          maxLength={200}
                          onChange={(e) => alterarLinha(idx, lIdx, e.target.value)}
                        />
                        {(topico.conteudo ?? []).length > 1 && (
                          <button
                            title="Excluir linha"
                            type="button"
                            className="p-1 rounded-full hover:bg-red-600 text-red-400"
                            onClick={() => removerLinha(idx, lIdx)}
                          >
                            <FaTrash />
                          </button>
                        )}
                      </li>
                    ))}
                  </ul>
                  <button
                    className="mt-3 px-3 py-1 bg-yellow-400 text-black rounded font-bold text-sm flex items-center gap-1"
                    onClick={() => adicionarLinha(idx)}
                    disabled={topico.conteudo.length >= 12}
                    type="button"
                  >
                    <FaPlus /> Nova Linha
                  </button>
                  <div className="text-xs text-neutral-400 mt-3">
                    Dica: voce pode colar emojis na frente de cada linha. Recomendo sites como{" "}
                    <a
                      href="https://emojipedia.org/"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="underline hover:text-yellow-300"
                    >
                      emojipedia.org
                    </a>{" "}
                    ou{" "}
                    <a
                      href="https://www.copyandpasteemoji.com/"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="underline hover:text-yellow-300"
                    >
                      copyandpasteemoji.com
                    </a>
                    .
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="mt-2 text-right text-neutral-400 text-xs">
          Ultima atualizacao: {ultimaAtualizacaoFormatada || "—"}
        </section>

        <div className="flex justify-end mt-6">
          <button
            className="flex items-center gap-2 bg-yellow-400 text-black font-bold px-6 py-3 rounded-xl hover:brightness-110 transition shadow-lg disabled:opacity-60"
            onClick={handleSalvar}
            type="button"
            disabled={salvando}
          >
            {salvando ? "Salvando..." : "Salvar Alteracoes"}
          </button>
        </div>

        {(mensagem || erro) && (
          <div className={`text-sm mt-2 ${erro ? "text-red-400" : "text-green-400"}`} role="status">
            {erro || mensagem}
          </div>
        )}

        {isLoading && (
          <div className="text-neutral-400 text-sm" role="status">
            Carregando estatuto atual...
          </div>
        )}
        {isError && (
          <div className="text-red-400 text-sm" role="status">
            Falha ao carregar o estatuto. Tente novamente ou verifique a autenticacao.
          </div>
        )}
      </main>
    </>
  );
}
