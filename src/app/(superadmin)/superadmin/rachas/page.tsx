"use client";

import Head from "next/head";
import { useMemo, useState } from "react";
import useSWR from "swr";
import {
  FaSearch,
  FaDownload,
  FaLock,
  FaInfoCircle,
  FaHistory,
  FaUserShield,
} from "react-icons/fa";
import { format } from "date-fns";
import ModalDetalhesRacha from "@/components/superadmin/ModalDetalhesRacha";
import { useBranding } from "@/hooks/useBranding";
import { signIn } from "next-auth/react";

type Tenant = {
  id: string;
  name?: string;
  slug?: string;
  status?: string | null;
  planKey?: string | null;
  plan?: string | null;
  playersCount?: number | null;
  athletes?: number | null;
  adminsCount?: number | null;
  admins?: Array<{ name?: string | null; email?: string | null; createdAt?: string | null }>;
  subscription?: {
    status?: string | null;
    planKey?: string | null;
    plan?: string | null;
    amount?: number | null;
    interval?: string | null;
    trialStart?: string | null;
    trialEnd?: string | null;
  } | null;
  ownerName?: string | null;
  ownerEmail?: string | null;
  createdAt?: string | null;
  blocked?: boolean | null;
  trialEndsAt?: string | null;
  lastLoginAt?: string | null;
  updatedAt?: string | null;
};

type TenantsResponse = { results?: Tenant[] };

const fetcher = async (url: string) => {
  const res = await fetch(url, { cache: "no-store" });
  const text = await res.text();
  if (!res.ok) throw new Error(text || `Request failed ${res.status}`);
  try {
    return JSON.parse(text);
  } catch {
    return text as any;
  }
};

const STATUS_BADGES = {
  ATIVO: "bg-green-700 text-green-200",
  TRIAL: "bg-yellow-700 text-yellow-200",
  INADIMPLENTE: "bg-red-700 text-red-200",
  BLOQUEADO: "bg-gray-600 text-gray-200",
};

const STATUS_LABELS = {
  ATIVO: "Racha ativo e operando normalmente.",
  TRIAL: "Periodo de teste, com limitacao de recursos.",
  INADIMPLENTE: "Pagamento em atraso, risco de bloqueio.",
  BLOQUEADO: "Acesso bloqueado por inadimplencia ou infracao.",
};

function normalizeStatus(raw?: string | null, blocked?: boolean | null) {
  const value = (raw || "").toUpperCase();
  if (blocked) return "BLOQUEADO";
  if (value.includes("INAD")) return "INADIMPLENTE";
  if (value.includes("TRIAL")) return "TRIAL";
  if (value.includes("TRIALING")) return "TRIAL";
  if (value.includes("PAUSE")) return "BLOQUEADO";
  if (value.includes("EXPIRE")) return "INADIMPLENTE";
  if (value.includes("BLOCK")) return "BLOQUEADO";
  if (value.includes("ATIVO") || value.includes("ACTIVE") || value.includes("PAID")) return "ATIVO";
  return value || "ATIVO";
}

function resolvePlanLabel(planKey?: string | null, status?: string | null) {
  const key = (planKey || "").toLowerCase();
  if (status && status.toUpperCase() === "TRIAL") {
    return "Trial (30 dias)";
  }
  if (!key) return "Plano n/d";
  if (key.includes("marketing")) {
    return key.includes("year") || key.includes("anual")
      ? "Anual + Marketing"
      : "Mensal + Marketing";
  }
  if (key.includes("enterprise")) {
    return key.includes("year") || key.includes("anual") ? "Anual Enterprise" : "Mensal Enterprise";
  }
  if (key.includes("year") || key.includes("anual")) return "Anual Essencial";
  return "Mensal Essencial";
}

function formatDate(value?: string | null) {
  if (!value) return "--";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return value;
  return format(d, "dd/MM/yyyy");
}

function daysSince(dateISO?: string | null) {
  if (!dateISO) return null;
  const d = new Date(dateISO);
  if (Number.isNaN(d.getTime())) return null;
  const diffMs = Date.now() - d.getTime();
  return Math.floor(diffMs / (1000 * 60 * 60 * 24));
}

export default function RachasCadastradosPage() {
  const { nome: brandingName } = useBranding({ scope: "superadmin" });
  const brand = brandingName || "Fut7Pro";
  const brandText = (text: string) => text.replace(/fut7pro/gi, () => brand);
  const brandLabel = brandText("Fut7Pro");
  const [search, setSearch] = useState("");
  const [filtroStatus, setFiltroStatus] = useState("");
  const [filtroInatividade, setFiltroInatividade] = useState("");
  const [modalRacha, setModalRacha] = useState<any>(null);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [pendingAction, setPendingAction] = useState<string | null>(null);

  const { data, isLoading, error, mutate } = useSWR<TenantsResponse | Tenant[]>(
    "/api/superadmin/tenants",
    fetcher,
    { revalidateOnFocus: false }
  );

  const tenants: Tenant[] = useMemo(() => {
    if (!data) return [];
    if (Array.isArray(data)) return data;
    if (Array.isArray((data as TenantsResponse).results)) return (data as TenantsResponse).results!;
    return [];
  }, [data]);

  const rachas = useMemo(
    () =>
      tenants.map((t) => {
        const subscription = t.subscription as any;
        const status = normalizeStatus(subscription?.status ?? t.status, t.blocked);
        const planLabel = resolvePlanLabel(
          subscription?.planKey ?? t.planKey ?? t.plan ?? subscription?.plan,
          status
        );
        const admin = t.ownerName || t.ownerEmail || t.admins?.[0]?.name || t.admins?.[0]?.email;
        const ultimaAtividade = t.lastLoginAt || t.updatedAt || t.createdAt || null;

        return {
          id: t.id,
          nome: t.name || t.slug || "Racha sem nome",
          presidente: admin || "--",
          plano: planLabel,
          status,
          ativo: status === "ATIVO" || status === "TRIAL",
          atletas:
            t.playersCount ?? t.athletes ?? t.adminsCount ?? (t as any)?._count?.players ?? 0,
          criadoEm: t.createdAt || "",
          ultimaAtividade,
          diasInativo: daysSince(ultimaAtividade),
          bloqueado: status === "BLOQUEADO",
          historico: [
            { acao: "Criado", criadoEm: t.createdAt || "" },
            { acao: "Ultima atualizacao", criadoEm: t.updatedAt || "" },
          ].filter((h) => h.criadoEm),
          ultimoLogBloqueio: t.blocked
            ? { detalhes: "Bloqueado no backend", criadoEm: t.updatedAt }
            : null,
        };
      }),
    [tenants]
  );

  const rachasFiltrados = useMemo(() => {
    const busca = search.toLowerCase();
    return rachas.filter((r) => {
      const matchNome = r.nome.toLowerCase().includes(busca);
      const matchPresidente = (r.presidente || "").toLowerCase().includes(busca);
      const filtro = filtroStatus.toUpperCase();
      const matchStatus = filtro ? r.status === filtro : true;
      const dias = r.diasInativo ?? null;
      const cutoff =
        filtroInatividade === "90"
          ? 90
          : filtroInatividade === "180"
            ? 180
            : filtroInatividade === "365"
              ? 365
              : filtroInatividade === "730"
                ? 730
                : filtroInatividade === "1095"
                  ? 1095
                  : null;
      const matchInatividade = cutoff ? dias !== null && dias >= cutoff : true;
      return (matchNome || matchPresidente) && matchStatus && matchInatividade;
    });
  }, [rachas, search, filtroStatus, filtroInatividade]);

  const total = rachas.length;
  const ativos = rachas.filter((r) => r.status === "ATIVO").length;
  const trials = rachas.filter((r) => r.status === "TRIAL").length;
  const inadimplentes = rachas.filter((r) => r.status === "INADIMPLENTE").length;
  const bloqueados = rachas.filter((r) => r.status === "BLOQUEADO" || r.bloqueado).length;
  const hoje = format(new Date(), "yyyy-MM-dd");
  const novosHoje = rachas.filter((r) => (r.criadoEm || "").startsWith(hoje)).length;

  function handleSelecionarTodos(e: React.ChangeEvent<HTMLInputElement>) {
    setSelectedIds(e.target.checked ? rachasFiltrados.map((r) => r.id) : []);
  }
  function handleSelecionar(id: string) {
    setSelectedIds((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  }
  function statusLabel(status: string) {
    if (status === "ATIVO") return "Ativo";
    if (status === "TRIAL") return "Trial";
    if (status === "INADIMPLENTE") return "Inadimplente";
    if (status === "BLOQUEADO") return "Bloqueado";
    return status;
  }

  function handleBlock(selected: string[]) {
    if (!selected.length) return;
    const reason = "Bloqueio manual pelo superadmin";
    setPendingAction("Bloquear");
    Promise.all(
      selected.map((id) =>
        fetch(`/api/superadmin/tenants/${id}/block`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ reason }),
        })
      )
    )
      .then(() => mutate())
      .catch(() => alert("Falha ao bloquear racha(s)."))
      .finally(() => setPendingAction(null));
  }

  function handleAviso(selected: string[]) {
    if (!selected.length) return;
    setPendingAction("Aviso");
    Promise.all(
      selected.map((id) =>
        fetch(`/api/superadmin/tenants/${id}/notify`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            title: "Aviso do Superadmin",
            message: "Contato iniciado pelo superadmin. Favor checar o painel.",
          }),
        })
      )
    )
      .then(() => mutate())
      .catch(() => alert("Falha ao enviar aviso."))
      .finally(() => setPendingAction(null));
  }

  async function handleImpersonate(tenant: any) {
    if (!tenant?.id) return;
    setPendingAction("Impersonate");
    try {
      const resp = await fetch(`/api/superadmin/tenants/${tenant.id}/impersonate`, {
        method: "POST",
      });
      const data = await resp.json().catch(() => ({}) as any);
      if (!resp.ok) {
        const msg = (data as any)?.message || "Falha ao impersonar admin.";
        throw new Error(msg);
      }

      const result = await signIn("credentials", {
        redirect: false,
        accessToken: data.accessToken,
        refreshToken: data.refreshToken,
        email: data?.user?.email,
        name: data?.user?.name,
        role: data?.user?.role,
        tenantId: data?.user?.tenantId,
        tenantSlug: data?.user?.tenantSlug,
      });

      if (result?.ok) {
        window.open("/admin/dashboard", "_blank", "noopener");
      } else {
        throw new Error("Falha ao criar sessao de impersonate.");
      }
    } catch (error) {
      const msg = error instanceof Error ? error.message : String(error);
      alert(`Nao foi possivel acessar como admin: ${msg}`);
    } finally {
      setPendingAction(null);
    }
  }

  return (
    <>
      <Head>
        <title>{`Gestao de Rachas - Painel SuperAdmin | ${brandLabel}`}</title>
        <meta
          name="description"
          content={`Administre todos os rachas SaaS na plataforma ${brandLabel}: veja status, planos, atletas, bloqueie, exporte, filtre e otimize sua gestao multi-tenant.`}
        />
        <meta
          name="keywords"
          content={`gestao de racha, plataforma saas, administrar racha, superadmin, futebol 7, controle de clubes, exportar csv, bloqueio de clientes, status racha, ${brandLabel}`}
        />
      </Head>
      <div className="w-full min-h-screen p-0 m-0">
        {error && (
          <div className="mb-4 rounded border border-red-500 bg-red-900/40 px-4 py-2 text-sm text-red-100">
            Falha ao carregar rachas. Verifique a API /superadmin/tenants.
          </div>
        )}

        {/* RESUMO NO TOPO */}
        <div className="grid grid-cols-2 md:grid-cols-6 gap-2 w-full mb-6">
          <ResumoCard title="Total" value={total} />
          <ResumoCard title="Ativos" value={ativos} badge="bg-green-700" />
          <ResumoCard title="Trials" value={trials} badge="bg-yellow-700" />
          <ResumoCard title="Inadimplentes" value={inadimplentes} badge="bg-red-700" />
          <ResumoCard title="Bloqueados" value={bloqueados} badge="bg-gray-700" />
          <ResumoCard title="Novos Hoje" value={novosHoje} badge="bg-blue-700" />
        </div>

        {/* BUSCA E FILTRO */}
        <div className="flex flex-col md:flex-row items-start md:items-center gap-2 mb-4">
          <div className="flex items-center w-full md:w-auto bg-zinc-900 rounded-lg px-3 py-2">
            <FaSearch className="text-zinc-500 mr-2" />
            <input
              className="bg-transparent outline-none w-full text-zinc-100"
              placeholder="Buscar por nome, presidente ou status..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              aria-label="Buscar racha"
            />
          </div>
          <select
            className="bg-zinc-800 text-zinc-100 px-4 py-2 rounded-lg ml-0 md:ml-2"
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
          <select
            className="bg-zinc-800 text-zinc-100 px-4 py-2 rounded-lg ml-0 md:ml-2"
            value={filtroInatividade}
            onChange={(e) => setFiltroInatividade(e.target.value)}
            aria-label="Filtrar por inatividade"
            title="Sem login/atualizacao ha pelo menos X dias"
          >
            <option value="">Todas as inatividades</option>
            <option value="90">Inativos ha 3+ meses</option>
            <option value="180">Inativos ha 6+ meses</option>
            <option value="365">Inativos ha 12+ meses</option>
            <option value="730">Inativos ha 24+ meses</option>
            <option value="1095">Inativos ha 36+ meses</option>
          </select>
          <button
            className="bg-yellow-500 text-black px-4 py-2 rounded-lg ml-0 md:ml-2 flex items-center gap-2 font-bold shadow opacity-60 cursor-not-allowed"
            disabled
            title="Export em desenvolvimento (aguarda endpoint oficial)"
          >
            <FaDownload /> Exportar .CSV
          </button>
        </div>

        {/* ACOES EM MASSA */}
        <div className="flex flex-wrap gap-2 mb-2">
          <button
            className="bg-blue-900 text-zinc-100 px-3 py-1 rounded shadow hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={selectedIds.length === 0}
          >
            Acessar como Admin
          </button>
          <button
            className="bg-red-900 text-zinc-100 px-3 py-1 rounded shadow hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={selectedIds.length === 0 || Boolean(pendingAction)}
            onClick={() => selectedIds.length && handleBlock(selectedIds)}
          >
            Bloquear
          </button>
          <button
            className="bg-zinc-600 text-zinc-100 px-3 py-1 rounded shadow hover:bg-zinc-800 disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={selectedIds.length === 0 || Boolean(pendingAction)}
            onClick={() => selectedIds.length && handleAviso(selectedIds)}
          >
            Enviar Aviso
          </button>
        </div>

        {/* TABELA */}
        <div className="overflow-x-auto">
          <table className="min-w-full bg-zinc-900 rounded-xl shadow text-zinc-100">
            <thead>
              <tr>
                <th className="p-3 text-left">
                  <input
                    type="checkbox"
                    checked={
                      selectedIds.length === rachasFiltrados.length && rachasFiltrados.length > 0
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
                <th className="p-3 text-center">Ultima atividade</th>
                <th className="p-3 text-center">Acoes</th>
                <th className="p-3 text-center">Bloqueio</th>
              </tr>
            </thead>
            <tbody>
              {isLoading && (
                <tr>
                  <td colSpan={9} className="p-6 text-center text-zinc-400">
                    Carregando rachas...
                  </td>
                </tr>
              )}
              {!isLoading &&
                rachasFiltrados.map((r) => (
                  <tr key={r.id} className="hover:bg-zinc-800 duration-100">
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
                        className={`px-2 py-1 rounded-full text-xs font-bold cursor-default ${STATUS_BADGES[r.status as keyof typeof STATUS_BADGES] || "bg-gray-700 text-zinc-300"}`}
                        title={STATUS_LABELS[r.status as keyof typeof STATUS_LABELS] || r.status}
                      >
                        {statusLabel(r.status)}
                      </span>
                    </td>
                    <td className="p-3 text-center">{r.atletas ?? 0}</td>
                    <td className="p-3 text-center">
                      {r.criadoEm ? formatDate(r.criadoEm) : "--"}
                    </td>
                    <td className="p-3 text-center">
                      {r.ultimaAtividade ? formatDate(r.ultimaAtividade) : "--"}
                      {typeof r.diasInativo === "number" ? (
                        <span className="block text-xs text-zinc-400">
                          {r.diasInativo} dias sem login
                        </span>
                      ) : null}
                    </td>
                    <td className="p-3 text-center flex gap-2">
                      <button
                        className="bg-blue-700 px-3 py-1 rounded text-xs font-bold hover:bg-blue-900 flex items-center gap-1"
                        onClick={() => setModalRacha(r)}
                        title="Detalhes e Acoes"
                      >
                        <FaInfoCircle /> Detalhes
                      </button>
                      <button
                        className="bg-green-800 px-3 py-1 rounded text-xs font-bold hover:bg-green-900 flex items-center gap-1 disabled:opacity-50 disabled:cursor-not-allowed"
                        onClick={() => handleImpersonate(r)}
                        title="Acessar Painel Admin como Presidente"
                        disabled={Boolean(pendingAction)}
                      >
                        <FaUserShield /> Login como Admin
                      </button>
                      <button
                        className="bg-red-700 px-3 py-1 rounded text-xs font-bold hover:bg-red-900 flex items-center gap-1 disabled:opacity-50 disabled:cursor-not-allowed"
                        title="Bloquear Racha"
                        disabled={Boolean(pendingAction)}
                        onClick={() => handleBlock([r.id])}
                      >
                        <FaLock /> Bloquear
                      </button>
                    </td>
                    <td className="p-3 text-center">
                      {r.status === "BLOQUEADO" || r.bloqueado ? (
                        <span className="flex items-center gap-1 text-red-400 font-bold">
                          <FaLock /> Bloqueado
                        </span>
                      ) : (
                        <span className="text-green-400 font-bold">Liberado</span>
                      )}
                    </td>
                  </tr>
                ))}
              {!isLoading && rachasFiltrados.length === 0 && (
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
            onRefresh={() => mutate()}
          />
        )}
      </div>
    </>
  );
}

function ResumoCard({ title, value, badge }: { title: string; value: number; badge?: string }) {
  return (
    <div
      className={`flex flex-col bg-zinc-800 p-3 rounded-lg items-center justify-center text-center min-w-[85px]`}
    >
      <span className="text-zinc-400 text-xs uppercase">{title}</span>
      <span className={`text-2xl font-bold ${badge || ""}`}>{value}</span>
    </div>
  );
}
