"use client";

import React from "react";
import Head from "next/head";
import { automacoesPadrao } from "@/components/lists/automacoesPadrao";
import type { AutomacaoNotificacao } from "@/types/automacao";
import { useNotificationTemplates } from "@/hooks/useNotificationTemplates";

export default function SuperAdminAutomacoesPage() {
  const { findTemplate } = useNotificationTemplates();
  return (
    <>
      <Head>
        <title>Automações de Notificações - Fut7Pro SuperAdmin</title>
        <meta
          name="description"
          content="Gerencie as notificações automáticas enviadas pelo sistema Fut7Pro. Veja, ative e controle todas as automações críticas para seu SaaS."
        />
        <meta
          name="keywords"
          content="automações, notificações automáticas, SaaS, Fut7Pro, cobrança, trial, onboarding"
        />
      </Head>
      <div className="px-4 py-6 md:px-10 max-w-5xl mx-auto">
        <h1 className="text-2xl md:text-3xl font-bold text-yellow-400 mb-6">
          Automação de Notificações
        </h1>
        <div className="overflow-x-auto rounded-xl shadow-lg bg-zinc-900">
          <table className="min-w-full text-left text-sm">
            <thead className="bg-zinc-800">
              <tr>
                <th className="px-4 py-3">Nome</th>
                <th className="px-2 py-3">Descrição</th>
                <th className="px-2 py-3">Gatilho</th>
                <th className="px-2 py-3">Canais</th>
                <th className="px-2 py-3">Template</th>
                <th className="px-2 py-3">Obrigatória?</th>
                <th className="px-2 py-3">Status</th>
              </tr>
            </thead>
            <tbody>
              {automacoesPadrao.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-6 text-zinc-500">
                    Nenhuma automação configurada.
                  </td>
                </tr>
              ) : (
                automacoesPadrao.map((a: AutomacaoNotificacao) => (
                  <tr key={a.id} className="hover:bg-zinc-800">
                    <td className="px-4 py-3 font-bold text-zinc-50">{a.nome}</td>
                    <td className="px-2 py-3 max-w-xs text-zinc-300">{a.descricao}</td>
                    <td className="px-2 py-3">{a.gatilho}</td>
                    <td className="px-2 py-3">
                      {a.canal.map((c) => (
                        <span
                          key={c}
                          className="inline-block bg-zinc-700 rounded-full px-2 py-1 text-xs text-yellow-200 mr-1"
                        >
                          {c}
                        </span>
                      ))}
                    </td>
                    <td className="px-2 py-3 text-sm text-zinc-300">
                      {a.templateId ? (findTemplate(a.templateId)?.name ?? "-") : "-"}
                    </td>
                    <td className="px-2 py-3">
                      {a.obrigatoria ? (
                        <span className="text-green-400 font-bold">Sim</span>
                      ) : (
                        <span className="text-yellow-300 font-bold">Opcional</span>
                      )}
                    </td>
                    <td className="px-2 py-3">
                      {a.status === "ativo" ? (
                        <span className="text-green-400 font-bold">Ativo</span>
                      ) : (
                        <span className="text-red-400 font-bold">Inativo</span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        <div className="mt-8 text-zinc-400 text-xs">
          Todas as notificações automáticas obrigatórias são controladas pelo Painel SuperAdmin.
          Personalização futura estará disponível apenas para notificações opcionais.
        </div>
      </div>
    </>
  );
}
