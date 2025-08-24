"use client";

import Head from "next/head";
import { useState } from "react";
import { FaPlus, FaEdit, FaArchive, FaCheck, FaTimes } from "react-icons/fa";

type Comunicado = {
  id: number;
  titulo: string;
  mensagem: string;
  data: string; // ISO date
  autor: string;
  ativo: boolean;
};

const comunicadosMock: Comunicado[] = [
  {
    id: 1,
    titulo: "Pagamento da Mensalidade",
    mensagem:
      "Lembrete: O vencimento da mensalidade é dia 10. Não deixe de regularizar!",
    data: "2025-07-10T10:00:00Z",
    autor: "Presidente",
    ativo: true,
  },
  {
    id: 2,
    titulo: "Novo Horário de Jogo",
    mensagem:
      "Atenção: O racha desta semana será às 19h. Fique atento ao novo horário!",
    data: "2025-07-08T15:30:00Z",
    autor: "Diretor de Futebol",
    ativo: true,
  },
];

export default function ComunicadosPage() {
  const [comunicados, setComunicados] = useState<Comunicado[]>(comunicadosMock);
  const [showForm, setShowForm] = useState(false);
  const [novo, setNovo] = useState<{ titulo: string; mensagem: string }>({
    titulo: "",
    mensagem: "",
  });
  const [editando, setEditando] = useState<number | null>(null);
  const [edicao, setEdicao] = useState<{ titulo: string; mensagem: string }>({
    titulo: "",
    mensagem: "",
  });
  const [confirmarArquivar, setConfirmarArquivar] = useState<number | null>(
    null,
  );

  function handleNovoComunicado() {
    if (!novo.titulo.trim() || !novo.mensagem.trim()) return;
    setComunicados((prev) => [
      {
        id: Math.max(...prev.map((c) => c.id)) + 1,
        titulo: novo.titulo,
        mensagem: novo.mensagem,
        data: new Date().toISOString(),
        autor: "Você",
        ativo: true,
      },
      ...prev,
    ]);
    setNovo({ titulo: "", mensagem: "" });
    setShowForm(false);
  }

  function handleEditarComunicado(id: number) {
    setComunicados((prev) =>
      prev.map((c) =>
        c.id === id
          ? { ...c, titulo: edicao.titulo, mensagem: edicao.mensagem }
          : c,
      ),
    );
    setEditando(null);
  }

  function handleArquivarComunicado(id: number) {
    setComunicados((prev) =>
      prev.map((c) => (c.id === id ? { ...c, ativo: false } : c)),
    );
    setConfirmarArquivar(null);
  }

  return (
    <>
      <Head>
        <title>Comunicados | Fut7Pro Admin</title>
        <meta
          name="description"
          content="Envie e visualize comunicados importantes para todos os jogadores do seu racha no Fut7Pro."
        />
        <meta
          name="keywords"
          content="Fut7, racha, comunicados, avisos, SaaS"
        />
      </Head>
      <div className="mx-auto w-full max-w-4xl px-4 pb-24 pt-20 md:pb-8 md:pt-6">
        <h1 className="mb-2 text-2xl font-bold text-yellow-400 md:text-3xl">
          Comunicados
        </h1>
        {/* Bloco explicativo */}
        <div className="animate-fadeIn mb-6 rounded-lg border-l-4 border-yellow-400 bg-[#232323] p-4 shadow">
          <div className="mb-1 flex items-center gap-2 font-bold text-yellow-300">
            📢 O que são Comunicados?
          </div>
          <p className="text-sm text-gray-200">
            <b>Comunicados</b> são avisos fixos, institucionais ou recorrentes
            que ficam visíveis toda vez que o jogador acessa a plataforma, como
            um mural digital.
            <br />
            <b>Exemplos:</b> calendário de jogos do mês, nova regra aprovada,
            mudanças permanentes no grupo ou avisos de reajuste na mensalidade.
            <br />
            <br />
            Eles aparecem na dashboard/área de avisos para todos, permanecendo
            publicados até serem arquivados. Não necessariamente disparam push,
            e-mail ou notificação ativa.
          </p>
        </div>
        <p className="mb-8 max-w-2xl text-gray-300">
          Use esta página para criar, editar e visualizar comunicados
          importantes do seu racha. Todos os jogadores visualizam estes avisos
          ao acessar a plataforma.
        </p>

        {/* Botão Novo Comunicado */}
        {!showForm && (
          <button
            onClick={() => setShowForm(true)}
            className="mb-6 flex items-center gap-2 rounded bg-yellow-400 px-4 py-2 font-semibold text-black shadow transition hover:bg-yellow-300"
          >
            <FaPlus /> Novo Comunicado
          </button>
        )}

        {/* Formulário de Novo Comunicado */}
        {showForm && (
          <div className="animate-fadeIn mb-8 flex flex-col gap-3 rounded-lg bg-[#222] p-4 shadow">
            <input
              type="text"
              className="rounded border border-yellow-400 bg-[#111] px-3 py-2 text-lg font-bold text-yellow-300"
              placeholder="Título do comunicado"
              value={novo.titulo}
              maxLength={60}
              onChange={(e) =>
                setNovo((v) => ({ ...v, titulo: e.target.value }))
              }
            />
            <textarea
              className="min-h-[60px] rounded border border-yellow-400 bg-[#111] px-3 py-2 text-gray-200"
              placeholder="Digite a mensagem do comunicado"
              value={novo.mensagem}
              maxLength={300}
              onChange={(e) =>
                setNovo((v) => ({ ...v, mensagem: e.target.value }))
              }
            />
            <div className="flex gap-3">
              <button
                onClick={handleNovoComunicado}
                className="rounded bg-yellow-400 px-4 py-2 font-bold text-black transition hover:bg-yellow-300"
              >
                Publicar
              </button>
              <button
                onClick={() => setShowForm(false)}
                className="rounded bg-[#333] px-4 py-2 text-gray-300 transition hover:bg-[#222]"
              >
                Cancelar
              </button>
            </div>
          </div>
        )}

        {/* Lista de Comunicados */}
        <div className="space-y-4">
          {comunicados.filter((c) => c.ativo).length === 0 && (
            <div className="py-12 text-center text-gray-400">
              Nenhum comunicado ativo.
            </div>
          )}
          {comunicados
            .filter((c) => c.ativo)
            .map((com) =>
              editando === com.id ? (
                <div
                  key={com.id}
                  className="animate-fadeIn flex flex-col gap-2 rounded-lg border-l-4 border-yellow-400 bg-[#222] p-4 shadow"
                >
                  <input
                    type="text"
                    className="rounded border border-yellow-400 bg-[#111] px-3 py-2 text-lg font-bold text-yellow-300"
                    value={edicao.titulo}
                    maxLength={60}
                    onChange={(e) =>
                      setEdicao((v) => ({ ...v, titulo: e.target.value }))
                    }
                  />
                  <textarea
                    className="min-h-[60px] rounded border border-yellow-400 bg-[#111] px-3 py-2 text-gray-200"
                    value={edicao.mensagem}
                    maxLength={300}
                    onChange={(e) =>
                      setEdicao((v) => ({ ...v, mensagem: e.target.value }))
                    }
                  />
                  <div className="mt-2 flex gap-3">
                    <button
                      onClick={() => handleEditarComunicado(com.id)}
                      className="rounded bg-yellow-400 px-4 py-2 font-bold text-black transition hover:bg-yellow-300"
                    >
                      <FaCheck /> Salvar
                    </button>
                    <button
                      onClick={() => setEditando(null)}
                      className="rounded bg-[#333] px-4 py-2 text-gray-300 transition hover:bg-[#222]"
                    >
                      <FaTimes /> Cancelar
                    </button>
                  </div>
                </div>
              ) : (
                <div
                  key={com.id}
                  className="animate-fadeIn flex flex-col justify-between rounded-lg border-l-4 border-yellow-400 bg-[#232323] p-4 shadow md:flex-row md:items-center"
                >
                  <div>
                    <div className="text-lg font-bold text-yellow-300">
                      {com.titulo}
                    </div>
                    <div className="mt-1 text-gray-200">{com.mensagem}</div>
                    <div className="mt-2 text-xs text-gray-500">
                      Publicado em {new Date(com.data).toLocaleDateString()} por{" "}
                      <span className="font-semibold">{com.autor}</span>
                    </div>
                  </div>
                  <div className="mt-3 flex gap-2 md:mt-0">
                    <button
                      className="flex items-center gap-1 rounded px-3 py-1 font-bold text-yellow-400 transition hover:text-yellow-300"
                      onClick={() => {
                        setEditando(com.id);
                        setEdicao({
                          titulo: com.titulo,
                          mensagem: com.mensagem,
                        });
                      }}
                      title="Editar comunicado"
                    >
                      <FaEdit /> Editar
                    </button>
                    <button
                      className="flex items-center gap-1 rounded px-3 py-1 text-gray-300 transition hover:text-red-400"
                      onClick={() => setConfirmarArquivar(com.id)}
                      title="Arquivar comunicado"
                    >
                      <FaArchive /> Arquivar
                    </button>
                  </div>
                  {confirmarArquivar === com.id && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-70">
                      <div className="flex flex-col items-center gap-4 rounded-lg bg-[#232323] p-8 shadow-xl">
                        <div className="text-lg font-bold text-yellow-300">
                          Arquivar comunicado?
                        </div>
                        <div className="text-sm text-gray-400">
                          Deseja realmente arquivar este comunicado? Jogadores
                          não verão mais este aviso.
                        </div>
                        <div className="mt-2 flex gap-3">
                          <button
                            onClick={() => handleArquivarComunicado(com.id)}
                            className="rounded bg-red-500 px-4 py-2 font-bold text-white transition hover:bg-red-600"
                          >
                            Arquivar
                          </button>
                          <button
                            onClick={() => setConfirmarArquivar(null)}
                            className="rounded bg-gray-400 px-4 py-2 text-black transition hover:bg-gray-500"
                          >
                            Cancelar
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ),
            )}
        </div>
      </div>
      <style>{`
                .animate-fadeIn { animation: fadeIn 0.35s; }
                @keyframes fadeIn {
                    from { opacity: 0; transform: translateY(12px); }
                    to { opacity: 1; transform: none; }
                }
            `}</style>
    </>
  );
}
