"use client";

import Head from "next/head";
import { useEffect, useState } from "react";
import { FaUserPlus, FaSearch, FaEdit, FaTrash, FaExclamationTriangle, FaInfoCircle, FaCheck, FaTimes } from "react-icons/fa";
import Image from "next/image";
import { AnimatePresence, motion } from "framer-motion";
import { useJogadores } from "@/hooks/useJogadores";
import { rachaConfig } from "@/config/racha.config";
import { useSolicitacoes } from "@/hooks/useSolicitacoes";

// --- TIPAGEM ---
interface Jogador {
  id: string;
  nome: string;
  apelido: string;
  email: string;
  posicao: "Goleiro" | "Zagueiro" | "Meia" | "Atacante";
  status: "Ativo" | "Inativo" | "Suspenso";
  mensalista: boolean;
  avatar: string;
}

// --- MODAL EXCLUSÃO ---
function ModalExcluirJogador({
  open,
  jogador,
  onClose,
  onConfirm,
}: {
  open: boolean;
  jogador?: Jogador;
  onClose: () => void;
  onConfirm: () => void;
}) {
  if (!open || !jogador) return null;
  return (
    <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center">
      <div className="bg-[#201414] border-2 border-red-700 rounded-2xl shadow-xl p-8 max-w-xs w-full flex flex-col items-center gap-4">
        <FaExclamationTriangle className="text-4xl text-red-600 animate-pulse" />
        <h2 className="text-lg text-red-500 font-bold text-center">
          Atenção! Exclusão definitiva de jogador
        </h2>
        <div className="text-sm text-gray-200 text-center">
          <b>{jogador.nome}</b> será{" "}
          <span className="text-red-400 font-bold">
            removido de todos os rankings, históricos e estatísticas
          </span>{" "}
          do racha.
          <br />
          <span className="text-red-400 font-bold block mt-2">Essa ação é IRREVERSÍVEL!</span>
          <br />
          Tem certeza que deseja continuar?
        </div>
        <div className="flex gap-3 mt-2">
          <button
            onClick={onClose}
            className="bg-gray-700 hover:bg-gray-600 text-white font-semibold px-4 py-2 rounded-md"
          >
            Cancelar
          </button>
          <button
            onClick={onConfirm}
            className="bg-red-700 hover:bg-red-800 text-white font-bold px-4 py-2 rounded-md"
          >
            Excluir DEFINITIVAMENTE
          </button>
        </div>
      </div>
    </div>
  );
}

// --- BADGE DE STATUS ---
function StatusBadge({ status }: { status: Jogador["status"] }) {
  const color =
    status === "Ativo"
      ? "bg-green-700 text-green-200"
      : status === "Suspenso"
        ? "bg-yellow-700 text-yellow-200"
        : "bg-gray-600 text-gray-200";
  return (
    <span className={`inline-block rounded px-2 py-0.5 text-xs font-bold mr-1 ${color}`}>
      {status}
    </span>
  );
}

// === COMPONENTE PRINCIPAL ===
export default function Page() {
  const rachaId = rachaConfig.slug;
  const { jogadores, addJogador, updateJogador, deleteJogador } = useJogadores(rachaId);
  const { solicitacoes, mutate: reloadSolic } = useSolicitacoes("PENDENTE");
  const [busca, setBusca] = useState("");
  const [showModalExcluir, setShowModalExcluir] = useState(false);
  const [excluirJogador, setExcluirJogador] = useState<Jogador | undefined>();
  const [autoApprove, setAutoApprove] = useState<boolean>(false);
  const [showAutoModal, setShowAutoModal] = useState(false);

  useEffect(() => {
    // Carrega flag autoAprovarAtletas do racha
    async function loadFlag() {
      try {
        const res = await fetch(`/api/admin/rachas/${rachaConfig.slug}`);
        const data = await res.json();
        if (res.ok && typeof data.autoAprovarAtletas === "boolean") setAutoApprove(Boolean(data.autoAprovarAtletas));
      } catch {}
    }
    loadFlag();
  }, []);

  async function toggleAutoApprove() {
    const next = !autoApprove;
    setAutoApprove(next);
    try {
      await fetch(`/api/admin/rachas/${rachaConfig.slug}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ autoAprovarAtletas: next }),
      });
    } catch {}
  }

  const jogadoresFiltrados = jogadores.filter(
    (j) =>
      j.nome.toLowerCase().includes(busca.toLowerCase()) ||
      j.apelido.toLowerCase().includes(busca.toLowerCase())
  );

  const cardVariants = {
    hidden: { opacity: 0, y: 18 },
    visible: (i: number) => ({
      opacity: 1,
      y: 0,
      transition: { delay: i * 0.06, type: "spring", stiffness: 60, damping: 18 },
    }),
    exit: { opacity: 0, y: 14, transition: { duration: 0.2 } },
  };

  return (
    <>
      <Head>
        <title>Gestão de Jogadores | Painel Admin - Fut7Pro</title>
        <meta
          name="description"
          content="Administre a lista de jogadores do seu racha, incluindo cadastro, edição e exclusão."
        />
      </Head>

      <div className="pt-20 pb-24 md:pt-6 md:pb-8 px-2 sm:px-6 max-w-5xl mx-auto">
        {/* SOLICITAÇÕES DE ENTRADA */}
        <div className="bg-[#1a1a1a] border border-[#2b2b2b] rounded-lg p-4 mb-6">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-3">
              <span className="text-cyan-400 font-bold">Solicitações para fazer parte do racha</span>
              <button
                type="button"
                onClick={() => setShowAutoModal(true)}
                className="text-yellow-400 hover:text-yellow-300"
                aria-label="Ajuda sobre aprovação automática"
              >
                <FaInfoCircle />
              </button>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-300">Aprovação automática</span>
              <button
                onClick={toggleAutoApprove}
                className={`px-3 py-1 rounded-full text-xs font-bold border ${
                  autoApprove
                    ? "bg-green-600/20 border-green-500 text-green-300"
                    : "bg-red-600/20 border-red-500 text-red-300"
                }`}
              >
                {autoApprove ? "ATIVADA" : "DESATIVADA"}
              </button>
            </div>
          </div>
          {solicitacoes.length === 0 ? (
            <div className="text-gray-400 text-sm">Nenhuma solicitação pendente no momento.</div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {solicitacoes.map((s) => (
                <div key={s.id} className="bg-[#23272f] border border-cyan-800 rounded-xl p-4">
                  <div className="flex items-center gap-3">
                    <Image
                      src={s.fotoUrl || "/images/Perfil-sem-Foto-Fut7.png"}
                      alt={s.nome}
                      width={44}
                      height={44}
                      className="rounded-full object-cover"
                    />
                    <div>
                      <div className="text-white font-bold">{s.nome}</div>
                      <div className="text-gray-300 text-xs">{s.apelido || ""} • {s.posicao}</div>
                      <div className="text-gray-400 text-xs">{s.email}</div>
                    </div>
                  </div>
                  <div className="mt-3 flex gap-2 justify-end">
                    <button
                      className="bg-green-700 hover:bg-green-800 text-white text-xs px-3 py-1 rounded flex items-center gap-1"
                      onClick={async () => {
                        await fetch(`/api/admin/solicitacoes/${s.id}/approve`, { method: "PUT" });
                        reloadSolic();
                      }}
                    >
                      <FaCheck /> Aceitar
                    </button>
                    <button
                      className="bg-red-700 hover:bg-red-800 text-white text-xs px-3 py-1 rounded flex items-center gap-1"
                      onClick={async () => {
                        await fetch(`/api/admin/solicitacoes/${s.id}/reject`, { method: "PUT" });
                        reloadSolic();
                      }}
                    >
                      <FaTimes /> Rejeitar
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* DESCRIÇÃO ADMIN */}
        <div className="bg-[#1a1a1a] border border-yellow-600 rounded-lg p-4 mb-6 text-sm text-gray-300">
          <p className="mb-2">
            <strong className="text-yellow-400">📌 Importante:</strong> Todos os atletas do seu
            racha podem se cadastrar diretamente pelo <strong>site público</strong>.
          </p>
          <p className="mb-2">
            Recomendamos que você incentive os jogadores a realizarem o cadastro por conta própria,
            garantindo dados corretos e integração automática com os rankings.
          </p>
          <p className="mb-2">
            Utilize o botão <strong>&quot;Cadastrar Jogador&quot;</strong> apenas em casos
            específicos, como:
          </p>
          <ul className="list-disc ml-5 mt-2">
            <li>Jogadores com dificuldade de acesso à internet;</li>
            <li>Atletas com pouca familiaridade com tecnologia;</li>
            <li>Casos excepcionais onde o administrador precisa intervir manualmente.</li>
          </ul>
        </div>

        {/* BARRA DE BUSCA */}
        <div className="flex flex-col sm:flex-row gap-3 justify-between items-center mb-6">
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <input
              type="text"
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
              placeholder="Buscar por nome ou apelido..."
              className="rounded-md bg-[#23272f] border border-gray-700 text-white px-3 py-2 w-full sm:w-72 focus:border-cyan-600"
            />
            <FaSearch className="text-gray-400 text-lg -ml-8 pointer-events-none" />
          </div>
          <button
            onClick={() => alert("Cadastro manual implementado apenas em casos específicos.")}
            className="flex items-center gap-2 bg-cyan-700 hover:bg-cyan-800 text-white px-4 py-2 rounded-lg font-bold"
          >
            <FaUserPlus /> Cadastrar Jogador
          </button>
        </div>

        {/* LISTA DE JOGADORES */}
        <div className="mb-6">
          <div className="flex items-center gap-2 text-cyan-400 font-bold text-sm mb-2">
            Jogadores cadastrados ({jogadoresFiltrados.length})
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            <AnimatePresence>
              {jogadoresFiltrados.map((j, i) => (
                <motion.div
                  key={j.id}
                  custom={i}
                  initial="hidden"
                  animate="visible"
                  exit="exit"
                  variants={cardVariants}
                  layout
                  className="bg-[#23272f] border border-cyan-700 rounded-xl p-4 shadow-xl"
                >
                  <div className="flex items-center">
                    <Image
                      src={j.avatar}
                      alt={j.nome}
                      width={48}
                      height={48}
                      className="rounded-full object-cover"
                    />
                    <div className="pl-4 flex-1">
                      <div className="font-bold text-white">
                        {j.nome} <span className="text-gray-400">({j.apelido})</span>
                      </div>
                      <div className="text-sm text-gray-300">{j.posicao}</div>
                      <div className="text-xs mt-1 flex gap-1 items-center">
                        <StatusBadge status={j.status} />
                        {j.mensalista && (
                          <span className="bg-yellow-700 text-yellow-200 font-bold rounded px-2 py-0.5 text-xs">
                            Mensalista
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="border-t border-cyan-900/40 mt-4 pt-3 flex gap-2 justify-end">
                    <button
                      className="bg-gray-700 hover:bg-cyan-800 text-white px-2 py-1 rounded text-xs flex items-center gap-1"
                      onClick={() => alert("Função de edição em desenvolvimento.")}
                    >
                      <FaEdit /> Editar
                    </button>
                    <button
                      className="bg-red-700 hover:bg-red-800 text-white px-2 py-1 rounded text-xs flex items-center gap-1"
                      onClick={() => {
                        setExcluirJogador(j);
                        setShowModalExcluir(true);
                      }}
                    >
                      <FaTrash /> Excluir
                    </button>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </div>
      </div>

      <ModalExcluirJogador
        open={showModalExcluir}
        jogador={excluirJogador}
        onClose={() => setShowModalExcluir(false)}
        onConfirm={() => {
          if (excluirJogador) deleteJogador(excluirJogador.id);
          setShowModalExcluir(false);
        }}
      />

      {/* Modal explicativo da aprovação automática */}
      {showAutoModal && (
        <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4">
          <div className="bg-[#1a1a1a] border border-yellow-700 rounded-xl max-w-xl w-full p-6 text-gray-200">
            <h2 className="text-yellow-400 font-bold text-lg mb-3">Aprovação automática de atletas</h2>
            <p className="text-sm leading-relaxed">
              Ao ativar esta opção, toda nova solicitação de cadastro no site do seu racha será
              aprovada automaticamente, sem revisão do administrador. Recomendamos manter esta
              opção desativada na maior parte do tempo. Use apenas em situações específicas, por
              exemplo, no primeiro dia em que você divulgar o site no grupo de WhatsApp para
              agilizar a entrada dos atletas que você já conhece. Em seguida, desligue a opção
              para evitar cadastros de visitantes e manter controle total sobre quem realmente
              faz parte do racha.
            </p>
            <div className="flex justify-end mt-4">
              <button
                className="px-4 py-1.5 rounded bg-yellow-500 text-black font-bold hover:bg-yellow-400"
                onClick={() => setShowAutoModal(false)}
              >
                Entendi
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
