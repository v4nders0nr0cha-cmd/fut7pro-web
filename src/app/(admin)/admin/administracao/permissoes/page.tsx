"use client";

import Head from "next/head";

// Forçar renderização no cliente para evitar problemas de template
export const dynamic = "force-dynamic";
import { BadgeCargo } from "@/components/admin/BadgeCargo";
import RestrictAccess from "@/components/admin/RestrictAccess";
import type { PermissaoAdmin } from "@/types/permissao";

const cargoLogado: "Presidente" | "Vice" | "Diretor de Futebol" | "Diretor Financeiro" =
  "Presidente";

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
    podeExcluir: { partidas: true, rankings: true, campeoes: true, atletas: true },
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
    podeExcluir: { partidas: true, rankings: true, campeoes: true, atletas: false },
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
    podeExcluir: { partidas: true, rankings: true, campeoes: true, atletas: false },
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
    podeExcluir: { partidas: false, rankings: false, campeoes: false, atletas: false },
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
      <div className="pt-20 pb-24 md:pt-6 md:pb-8 max-w-5xl mx-auto w-full">
        <h1 className="text-2xl font-bold mb-8 text-zinc-100 text-center">
          Permissões dos Administradores
        </h1>
        <div className="overflow-x-auto">
          <table className="min-w-full bg-[#202126] rounded-xl shadow border border-[#27272a]">
            <thead>
              <tr className="text-zinc-400 text-sm border-b border-[#292929]">
                <th className="py-3 px-4 text-left font-semibold">Cargo</th>
                <th className="py-3 px-4 font-semibold">Pode acessar</th>
                <th className="py-3 px-4 font-semibold">Pode excluir</th>
                <th className="py-3 px-4 font-semibold">Prazo Exclusão</th>
              </tr>
            </thead>
            <tbody>
              {permissoes.map((perm) => (
                <tr
                  key={perm.funcao}
                  className="border-b border-[#242429] hover:bg-[#242529] transition"
                >
                  <td className="py-2 px-4 font-bold">
                    <BadgeCargo cargo={perm.funcao} minimal />
                  </td>
                  <td className="py-2 px-4">
                    <div className="flex flex-wrap gap-1.5">
                      {Object.entries(perm.podeAcessar)
                        .filter(([_, v]) => v)
                        .map(([k]) => (
                          <span
                            key={k}
                            className="bg-zinc-800 text-zinc-200 px-2 py-0.5 rounded text-xs font-medium border border-zinc-700"
                          >
                            {labelAcesso[k] || k}
                          </span>
                        ))}
                    </div>
                  </td>
                  <td className="py-2 px-4">
                    <div className="flex flex-wrap gap-1.5">
                      {Object.entries(perm.podeExcluir)
                        .filter(([_, v]) => v)
                        .map(([k]) => (
                          <span
                            key={k}
                            className="bg-[#23181b] text-red-300 px-2 py-0.5 rounded text-xs font-medium border border-red-900"
                          >
                            {labelExcluir[k] || k}
                          </span>
                        ))}
                      {!Object.values(perm.podeExcluir).some(Boolean) && (
                        <span className="text-zinc-500 italic">Nenhuma</span>
                      )}
                    </div>
                  </td>
                  <td className="py-2 px-4">
                    {perm.prazoExclusaoDias === null ? (
                      <span className="bg-yellow-900 text-yellow-100 px-2 py-0.5 rounded text-xs font-semibold border border-yellow-800">
                        Sem limite
                      </span>
                    ) : (
                      <span className="bg-zinc-800 text-zinc-200 px-2 py-0.5 rounded text-xs font-medium border border-zinc-700">
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
