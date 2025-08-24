"use client";

import Head from "next/head";
import { BadgeCargo } from "@/components/admin/BadgeCargo";
import RestrictAccess from "@/components/admin/RestrictAccess";
import type { PermissaoAdmin } from "@/types/permissao";

const cargoLogado:
  | "Presidente"
  | "Vice"
  | "Diretor de Futebol"
  | "Diretor Financeiro" = "Presidente";

const permissoes: PermissaoAdmin[] = [
  {
    funcao: "Presidente",
    podeAcessar: {
      administradores: true,
      permissoes: true,
      logs: true,
      transferirPropriedade: true,
      partidas: true,
      jogadores: true,
      financeiro: true,
    },
    podeExcluir: {
      partidas: true,
      rankings: true,
      campeoes: true,
      atletas: true,
    },
    prazoExclusaoDias: null,
  },
  {
    funcao: "Vice",
    podeAcessar: {
      administradores: true,
      permissoes: true,
      logs: true,
      transferirPropriedade: false,
      partidas: true,
      jogadores: true,
      financeiro: true,
    },
    podeExcluir: {
      partidas: true,
      rankings: true,
      campeoes: true,
      atletas: false,
    },
    prazoExclusaoDias: 15,
  },
  {
    funcao: "Diretor de Futebol",
    podeAcessar: {
      administradores: false,
      permissoes: false,
      logs: true,
      transferirPropriedade: false,
      partidas: true,
      jogadores: true,
      financeiro: false,
    },
    podeExcluir: {
      partidas: true,
      rankings: true,
      campeoes: true,
      atletas: false,
    },
    prazoExclusaoDias: 15,
  },
  {
    funcao: "Diretor Financeiro",
    podeAcessar: {
      administradores: false,
      permissoes: false,
      logs: true,
      transferirPropriedade: false,
      partidas: false,
      jogadores: false,
      financeiro: true,
    },
    podeExcluir: {
      partidas: false,
      rankings: false,
      campeoes: false,
      atletas: false,
    },
    prazoExclusaoDias: 15,
  },
];

const labelAcesso: Record<string, string> = {
  administradores: "Admins",
  permissoes: "Permissões",
  logs: "Logs",
  transferirPropriedade: "Transferência",
  partidas: "Partidas",
  jogadores: "Jogadores",
  financeiro: "Financeiro",
};

const labelExcluir: Record<string, string> = {
  partidas: "Partidas",
  rankings: "Rankings",
  campeoes: "Campeões",
  atletas: "Atletas",
};

export default function PermissoesPage() {
  if (!["Presidente", "Vice"].includes(cargoLogado)) return <RestrictAccess />;
  return (
    <>
      <Head>
        <title>Permissões dos Administradores | Fut7Pro Admin</title>
        <meta
          name="description"
          content="Veja e edite as permissões dos cargos de administrador do racha."
        />
        <meta name="keywords" content="Fut7, racha, permissões, cargos, SaaS" />
      </Head>
      <div className="mx-auto w-full max-w-5xl pb-24 pt-20 md:pb-8 md:pt-6">
        <h1 className="mb-8 text-center text-2xl font-bold text-zinc-100">
          Permissões dos Administradores
        </h1>
        <div className="overflow-x-auto">
          <table className="min-w-full rounded-xl border border-[#27272a] bg-[#202126] shadow">
            <thead>
              <tr className="border-b border-[#292929] text-sm text-zinc-400">
                <th className="px-4 py-3 text-left font-semibold">Cargo</th>
                <th className="px-4 py-3 font-semibold">Pode acessar</th>
                <th className="px-4 py-3 font-semibold">Pode excluir</th>
                <th className="px-4 py-3 font-semibold">Prazo Exclusão</th>
              </tr>
            </thead>
            <tbody>
              {permissoes.map((perm) => (
                <tr
                  key={perm.funcao}
                  className="border-b border-[#242429] transition hover:bg-[#242529]"
                >
                  <td className="px-4 py-2 font-bold">
                    <BadgeCargo cargo={perm.funcao} minimal />
                  </td>
                  <td className="px-4 py-2">
                    <div className="flex flex-wrap gap-1.5">
                      {Object.entries(perm.podeAcessar)
                        .filter(([_, v]) => v)
                        .map(([k]) => (
                          <span
                            key={k}
                            className="rounded border border-zinc-700 bg-zinc-800 px-2 py-0.5 text-xs font-medium text-zinc-200"
                          >
                            {labelAcesso[k] || k}
                          </span>
                        ))}
                    </div>
                  </td>
                  <td className="px-4 py-2">
                    <div className="flex flex-wrap gap-1.5">
                      {Object.entries(perm.podeExcluir)
                        .filter(([_, v]) => v)
                        .map(([k]) => (
                          <span
                            key={k}
                            className="rounded border border-red-900 bg-[#23181b] px-2 py-0.5 text-xs font-medium text-red-300"
                          >
                            {labelExcluir[k] || k}
                          </span>
                        ))}
                      {!Object.values(perm.podeExcluir).some(Boolean) && (
                        <span className="italic text-zinc-500">Nenhuma</span>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-2">
                    {perm.prazoExclusaoDias === null ? (
                      <span className="rounded border border-yellow-800 bg-yellow-900 px-2 py-0.5 text-xs font-semibold text-yellow-100">
                        Sem limite
                      </span>
                    ) : (
                      <span className="rounded border border-zinc-700 bg-zinc-800 px-2 py-0.5 text-xs font-medium text-zinc-200">
                        {perm.prazoExclusaoDias} dias
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}
