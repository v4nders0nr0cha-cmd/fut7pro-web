"use client";

import Head from 'next/head';
import { useSuperadminNotifications } from '@/hooks/useSuperadminNotifications';

export default function SuperAdminLogsPage() {
  const { notificacoes, isLoading, error, refresh } = useSuperadminNotifications();

  return (
    <div className="min-h-screen bg-[#101826] text-white px-4 py-6 md:px-8">
      <Head>
        <title>Logs e auditoria - SuperAdmin Fut7Pro</title>
        <meta name="description" content="Auditoria das ações executadas pelos administradores da plataforma." />
      </Head>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-yellow-400">Logs e auditoria</h1>
        <button
          className="bg-zinc-800 text-zinc-100 px-4 py-2 rounded-xl font-semibold hover:bg-zinc-700 transition"
          onClick={() => refresh()}
          disabled={isLoading}
        >
          Atualizar
        </button>
      </div>
      {error ? <p className="text-sm text-red-400 mb-4">Erro ao carregar logs.</p> : null}
      <div className="bg-zinc-900 rounded-xl shadow p-6 overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-zinc-800 text-zinc-400 uppercase text-xs">
              <th className="py-2 px-2">Data/Hora</th>
              <th className="py-2 px-2">Ação</th>
              <th className="py-2 px-2">Usuário</th>
              <th className="py-2 px-2">Detalhes</th>
              <th className="py-2 px-2">Destino</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr>
                <td colSpan={5} className="py-6 text-center text-zinc-400">
                  Carregando registros...
                </td>
              </tr>
            ) : notificacoes.length === 0 ? (
              <tr>
                <td colSpan={5} className="py-6 text-center text-zinc-400">
                  Nenhum registro encontrado.
                </td>
              </tr>
            ) : (
              notificacoes.map((item) => (
                <tr key={item.id} className="border-b border-zinc-800 hover:bg-zinc-800">
                  <td className="py-2 px-2 text-zinc-300">
                    {new Date(item.criadoEm).toLocaleString('pt-BR')}
                  </td>
                  <td className="py-2 px-2 font-semibold text-yellow-300">{item.titulo}</td>
                  <td className="py-2 px-2 text-zinc-200">{item.enviadoPor}</td>
                  <td className="py-2 px-2 text-zinc-300">{item.mensagem}</td>
                  <td className="py-2 px-2 text-zinc-400">{item.destino}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
