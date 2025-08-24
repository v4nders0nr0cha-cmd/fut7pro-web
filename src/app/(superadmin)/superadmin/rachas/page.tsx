"use client";

import Head from "next/head";
import { useState, useMemo } from "react";
import {
  FaSearch,
  FaDownload,
  FaLock,
  FaUserShield,
  FaInfoCircle,
  FaHistory,
  FaArrowRight,
} from "react-icons/fa";
import { format, parse } from "date-fns";
import ModalDetalhesRacha from "@/components/superadmin/ModalDetalhesRacha";

// --- MOCKS E TIPAGENS ---
const MOCKS_RACHAS = [
  {
    id: "1",
    nome: "Racha Vila União",
    presidente: "João Silva",
    plano: "Mensal",
    status: "ATIVO",
    atletas: 23,
    criadoEm: "2025-06-10",
    ultimoAcesso: "2025-07-01 19:00",
    bloqueado: false,
    historico: [
      { acao: "Criado", data: "2025-06-10 11:11" },
      { acao: "Primeiro login", data: "2025-06-10 12:01" },
      { acao: "Última exportação", data: "2025-07-01 14:43" },
    ],
    ultimoLogBloqueio: null,
  },
  {
    id: "2",
    nome: "Racha Galáticos",
    presidente: "Pedro Souza",
    plano: "Trial",
    status: "BLOQUEADO",
    atletas: 18,
    criadoEm: "2025-06-05",
    ultimoAcesso: "2025-06-30 21:10",
    bloqueado: true,
    historico: [
      { acao: "Criado", data: "2025-06-05 10:00" },
      { acao: "Primeiro login", data: "2025-06-05 10:05" },
      { acao: "Bloqueado", data: "2025-06-15 08:00" },
    ],
    ultimoLogBloqueio: {
      motivo: "Trial expirou sem pagamento",
      data: "2025-06-15 08:00",
    },
  },
  {
    id: "3",
    nome: "Racha Real Matismo",
    presidente: "Paulo Lima",
    plano: "Mensal",
    status: "INADIMPLENTE",
    atletas: 27,
    criadoEm: "2025-06-02",
    ultimoAcesso: "2025-07-01 15:44",
    bloqueado: true,
    historico: [
      { acao: "Criado", data: "2025-06-02 08:00" },
      { acao: "Primeiro login", data: "2025-06-02 09:30" },
      { acao: "Status alterado para Inadimplente", data: "2025-06-30 19:00" },
      { acao: "Bloqueado", data: "2025-07-01 09:00" },
    ],
    ultimoLogBloqueio: {
      motivo: "Pagamento mensalidade não efetuado",
      data: "2025-07-01 09:00",
    },
  },
];

const STATUS_BADGES = {
  ATIVO: "bg-green-700 text-green-200",
  TRIAL: "bg-yellow-700 text-yellow-200",
  INADIMPLENTE: "bg-red-700 text-red-200",
  BLOQUEADO: "bg-gray-600 text-gray-200",
};
const STATUS_LABELS = {
  ATIVO: "Racha ativo e operando normalmente.",
  TRIAL: "Período de teste, com limitação de recursos.",
  INADIMPLENTE: "Pagamento em atraso, risco de bloqueio.",
  BLOQUEADO: "Acesso bloqueado por inadimplência ou infração.",
};

// --- COMPONENTE PRINCIPAL ---
export default function RachasCadastradosPage() {
  const [search, setSearch] = useState("");
  const [filtroStatus, setFiltroStatus] = useState("");
  const [modalRacha, setModalRacha] = useState<any>(null);
  const [impersonate, setImpersonate] = useState<any>(null);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  // Busca/filtro avançado (já filtrando por enum UPPERCASE)
  const rachasFiltrados = useMemo(() => {
    return MOCKS_RACHAS.filter((r) => {
      const busca = search.toLowerCase();
      const matchNome = r.nome.toLowerCase().includes(busca);
      const matchPresidente = r.presidente.toLowerCase().includes(busca);
      // Se vier filtro visual, transforma para enum
      const filtro = filtroStatus.toUpperCase();
      const matchStatus = filtro
        ? r.status === filtro || (filtro === "BLOQUEADO" && r.bloqueado)
        : true;
      return (matchNome || matchPresidente) && matchStatus;
    });
  }, [search, filtroStatus]);

  // Contadores (tudo por enum UPPERCASE)
  const total = MOCKS_RACHAS.length;
  const ativos = MOCKS_RACHAS.filter((r) => r.status === "ATIVO").length;
  const trials = MOCKS_RACHAS.filter((r) => r.status === "TRIAL").length;
  const inadimplentes = MOCKS_RACHAS.filter(
    (r) => r.status === "INADIMPLENTE",
  ).length;
  const bloqueados = MOCKS_RACHAS.filter(
    (r) => r.status === "BLOQUEADO" || r.bloqueado,
  ).length;
  const novosHoje = MOCKS_RACHAS.filter(
    (r) => r.criadoEm === format(new Date(), "yyyy-MM-dd"),
  ).length;

  function handleSelecionarTodos(e: React.ChangeEvent<HTMLInputElement>) {
    setSelectedIds(e.target.checked ? rachasFiltrados.map((r) => r.id) : []);
  }
  function handleSelecionar(id: string) {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    );
  }
  function handleImpersonate(racha: any) {
    setImpersonate(racha);
  }

  // Mapeia status para exibição
  function statusLabel(status: string) {
    if (status === "ATIVO") return "Ativo";
    if (status === "TRIAL") return "Trial";
    if (status === "INADIMPLENTE") return "Inadimplente";
    if (status === "BLOQUEADO") return "Bloqueado";
    return status;
  }

  return (
    <>
      <Head>
        <title>Gestão de Rachas – Painel SuperAdmin | Fut7Pro</title>
        <meta
          name="description"
          content="Administre todos os rachas SaaS na plataforma Fut7Pro: veja status, planos, atletas, bloqueie, exporte, filtre e otimize sua gestão multi-tenant."
        />
        <meta
          name="keywords"
          content="fut7pro, gestão de racha, plataforma saas, administrar racha, superadmin, futebol 7, controle de clubes, exportar csv, bloqueio de clientes, status racha"
        />
      </Head>
      <div className="m-0 min-h-screen w-full p-0">
        {/* RESUMO NO TOPO */}
        <div className="mb-6 grid w-full grid-cols-2 gap-2 md:grid-cols-6">
          <ResumoCard title="Total" value={total} />
          <ResumoCard title="Ativos" value={ativos} badge="bg-green-700" />
          <ResumoCard title="Trials" value={trials} badge="bg-yellow-700" />
          <ResumoCard
            title="Inadimplentes"
            value={inadimplentes}
            badge="bg-red-700"
          />
          <ResumoCard
            title="Bloqueados"
            value={bloqueados}
            badge="bg-gray-700"
          />
          <ResumoCard
            title="Novos Hoje"
            value={novosHoje}
            badge="bg-blue-700"
          />
        </div>

        {/* BUSCA E FILTRO */}
        <div className="mb-4 flex flex-col items-start gap-2 md:flex-row md:items-center">
          <div className="flex w-full items-center rounded-lg bg-zinc-900 px-3 py-2 md:w-auto">
            <FaSearch className="mr-2 text-zinc-500" />
            <input
              className="w-full bg-transparent text-zinc-100 outline-none"
              placeholder="Buscar por nome, presidente ou status..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              aria-label="Buscar racha"
            />
          </div>
          <select
            className="ml-0 rounded-lg bg-zinc-800 px-4 py-2 text-zinc-100 md:ml-2"
            value={filtroStatus}
            onChange={(e) => setFiltroStatus(e.target.value)}
            aria-label="Filtrar status"
          >
            <option value="">Todos os status</option>
            <option value="Ativo">Ativos</option>
            <option value="Trial">Trial</option>
            <option value="Inadimplente">Inadimplentes</option>
            <option value="Bloqueado">Bloqueados</option>
          </select>
          <button
            className="ml-0 flex items-center gap-2 rounded-lg bg-yellow-500 px-4 py-2 font-bold text-black shadow duration-150 hover:scale-105 md:ml-2"
            onClick={() => alert("Função de exportação será ativada")}
          >
            <FaDownload /> Exportar .CSV
          </button>
        </div>

        {/* AÇÕES EM MASSA */}
        <div className="mb-2 flex flex-wrap gap-2">
          <button
            className="rounded bg-blue-900 px-3 py-1 text-zinc-100 shadow hover:bg-blue-700"
            disabled={selectedIds.length === 0}
          >
            Acessar como Admin
          </button>
          <button
            className="rounded bg-red-900 px-3 py-1 text-zinc-100 shadow hover:bg-red-700"
            disabled={selectedIds.length === 0}
          >
            Bloquear
          </button>
          <button
            className="rounded bg-zinc-600 px-3 py-1 text-zinc-100 shadow hover:bg-zinc-800"
            disabled={selectedIds.length === 0}
          >
            Enviar Aviso
          </button>
        </div>

        {/* TABELA */}
        <div className="overflow-x-auto">
          <table className="min-w-full rounded-xl bg-zinc-900 text-zinc-100 shadow">
            <thead>
              <tr>
                <th className="p-3 text-left">
                  <input
                    type="checkbox"
                    checked={
                      selectedIds.length === rachasFiltrados.length &&
                      rachasFiltrados.length > 0
                    }
                    onChange={handleSelecionarTodos}
                  />
                </th>
                <th className="p-3 text-left">Nome</th>
                <th className="p-3 text-left">Presidente</th>
                <th className="p-3 text-left">Plano</th>
                <th className="p-3 text-left">Status</th>
                <th className="p-3 text-center">Atletas</th>
                <th className="p-3 text-center">Criado em</th>
                <th className="p-3 text-center">Ações</th>
                <th className="p-3 text-center">Bloqueio</th>
              </tr>
            </thead>
            <tbody>
              {rachasFiltrados.map((r) => (
                <tr key={r.id} className="duration-100 hover:bg-zinc-800">
                  <td className="p-3">
                    <input
                      type="checkbox"
                      checked={selectedIds.includes(r.id)}
                      onChange={() => handleSelecionar(r.id)}
                    />
                  </td>
                  <td className="p-3 font-semibold">{r.nome}</td>
                  <td className="p-3">{r.presidente}</td>
                  <td className="p-3">{r.plano}</td>
                  <td className="p-3">
                    <span
                      className={`cursor-pointer rounded-full px-2 py-1 text-xs font-bold ${STATUS_BADGES[r.status as keyof typeof STATUS_BADGES] || "bg-gray-700 text-zinc-300"}`}
                      title={
                        STATUS_LABELS[r.status as keyof typeof STATUS_LABELS] ||
                        r.status
                      }
                    >
                      {statusLabel(r.status)}
                    </span>
                  </td>
                  <td className="p-3 text-center">{r.atletas}</td>
                  <td className="p-3 text-center">
                    {format(
                      parse(r.criadoEm, "yyyy-MM-dd", new Date()),
                      "dd/MM/yyyy",
                    )}
                  </td>
                  <td className="flex gap-2 p-3 text-center">
                    <button
                      className="flex items-center gap-1 rounded bg-blue-700 px-3 py-1 text-xs font-bold hover:bg-blue-900"
                      onClick={() => setModalRacha(r)}
                      title="Detalhes e Ações"
                    >
                      <FaInfoCircle /> Detalhes
                    </button>
                    <button
                      className="flex items-center gap-1 rounded bg-green-800 px-3 py-1 text-xs font-bold hover:bg-green-900"
                      onClick={() => handleImpersonate(r)}
                      title="Acessar Painel Admin como Presidente"
                    >
                      <FaUserShield /> Login como Admin
                    </button>
                    <button
                      className="flex items-center gap-1 rounded bg-red-700 px-3 py-1 text-xs font-bold hover:bg-red-900"
                      title="Bloquear Racha"
                    >
                      <FaLock /> Bloquear
                    </button>
                  </td>
                  <td className="p-3 text-center">
                    {r.status === "BLOQUEADO" || r.bloqueado ? (
                      <span className="flex items-center gap-1 font-bold text-red-400">
                        <FaLock /> Bloqueado
                      </span>
                    ) : (
                      <span className="font-bold text-green-400">Liberado</span>
                    )}
                  </td>
                </tr>
              ))}
              {rachasFiltrados.length === 0 && (
                <tr>
                  <td colSpan={9} className="p-6 text-center text-zinc-400">
                    Nenhum racha encontrado.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* MODAL DETALHES DO RACHA */}
        {modalRacha && (
          <ModalDetalhesRacha
            racha={modalRacha}
            onClose={() => setModalRacha(null)}
          />
        )}

        {/* MODAL IMPERSONATE (AGINDO COMO PRESIDENTE) */}
        {impersonate && (
          <div
            className="fixed inset-0 z-40 flex items-center justify-center bg-black bg-opacity-60"
            onClick={() => setImpersonate(null)}
          >
            <div
              className="mx-auto w-full max-w-lg rounded-xl bg-zinc-900 p-6 text-center shadow-xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex flex-col items-center">
                <FaUserShield className="mb-2 text-3xl text-green-400" />
                <h3 className="mb-1 text-xl font-bold">
                  Você está “agindo como presidente” deste racha
                </h3>
                <span className="mb-4 text-sm text-zinc-400">
                  <b>{impersonate.nome}</b> (Presidente:{" "}
                  {impersonate.presidente})<br />
                  Todo acesso, edição ou exclusão será registrado em log de
                  auditoria, visível para a equipe da plataforma.
                </span>
                <button
                  className="mb-2 flex items-center gap-2 rounded bg-blue-700 px-5 py-2 text-white hover:bg-blue-900"
                  onClick={() => {
                    setImpersonate(null);
                    alert(
                      "Redirecionar para painel Admin real deste racha (/admin?impersonate=rachaId)",
                    );
                  }}
                >
                  <FaArrowRight /> Entrar no Painel Administrativo do Presidente
                </button>
                <button
                  className="rounded bg-zinc-700 px-4 py-2 text-white hover:bg-zinc-900"
                  onClick={() => setImpersonate(null)}
                >
                  Cancelar
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}

// Card de resumo
function ResumoCard({
  title,
  value,
  badge,
}: {
  title: string;
  value: number;
  badge?: string;
}) {
  return (
    <div
      className={`flex min-w-[85px] flex-col items-center justify-center rounded-lg bg-zinc-800 p-3 text-center`}
    >
      <span className="text-xs uppercase text-zinc-400">{title}</span>
      <span className={`text-2xl font-bold ${badge || ""}`}>{value}</span>
    </div>
  );
}
