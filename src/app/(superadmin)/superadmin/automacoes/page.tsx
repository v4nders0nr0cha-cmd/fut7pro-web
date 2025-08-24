"use client";

import React from "react";
import Head from "next/head";
import { automacoesPadrao } from "@/components/lists/automacoesPadrao";
import type { AutomacaoNotificacao } from "@/types/automacao";

export default function SuperAdminAutomacoesPage() {
  return (
    <>
      <Head>
        <title>Automação de Notificações – Fut7Pro SuperAdmin</title>
        <meta
          name="description"
          content="Gerencie as notificações automáticas enviadas pelo sistema Fut7Pro. Veja, ative e controle todas as automações críticas para seu SaaS."
        />
        <meta
          name="keywords"
          content="automação, notificações automáticas, SaaS, Fut7Pro, cobrança, trial, onboarding"
        />
      </Head>
      <div className="mx-auto max-w-5xl px-4 py-6 md:px-10">
        <h1 className="mb-6 text-2xl font-bold text-yellow-400 md:text-3xl">
          Automação de Notificações
        </h1>
        <div className="overflow-x-auto rounded-xl bg-zinc-900 shadow-lg">
          <table className="min-w-full text-left text-sm">
            <thead className="bg-zinc-800">
              <tr>
                <th className="px-4 py-3">Nome</th>
                <th className="px-2 py-3">Descrição</th>
                <th className="px-2 py-3">Gatilho</th>
                <th className="px-2 py-3">Canal</th>
                <th className="px-2 py-3">Obrigatória?</th>
                <th className="px-2 py-3">Status</th>
              </tr>
            </thead>
            <tbody>
              {automacoesPadrao.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-6 text-center text-zinc-500">
                    Nenhuma automação configurada.
                  </td>
                </tr>
              ) : (
                automacoesPadrao.map((a: AutomacaoNotificacao) => (
                  <tr key={a.id} className="hover:bg-zinc-800">
                    <td className="px-4 py-3 font-bold text-zinc-50">
                      {a.nome}
                    </td>
                    <td className="max-w-xs px-2 py-3 text-zinc-300">
                      {a.descricao}
                    </td>
                    <td className="px-2 py-3">{a.gatilho}</td>
                    <td className="px-2 py-3">
                      {a.canal.map((c) => (
                        <span
                          key={c}
                          className="mr-1 inline-block rounded-full bg-zinc-700 px-2 py-1 text-xs text-yellow-200"
                        >
                          {c}
                        </span>
                      ))}
                    </td>
                    <td className="px-2 py-3">
                      {a.obrigatoria ? (
                        <span className="font-bold text-green-400">Sim</span>
                      ) : (
                        <span className="font-bold text-yellow-300">
                          Opcional
                        </span>
                      )}
                    </td>
                    <td className="px-2 py-3">
                      {a.status === "ativo" ? (
                        <span className="font-bold text-green-400">Ativo</span>
                      ) : (
                        <span className="font-bold text-red-400">Inativo</span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        <div className="mt-8 text-xs text-zinc-400">
          Todas as notificações automáticas obrigatórias são controladas pelo
          Painel SuperAdmin. Personalização futura estará disponível apenas para
          notificações opcionais.
        </div>
      </div>
    </>
  );
}
