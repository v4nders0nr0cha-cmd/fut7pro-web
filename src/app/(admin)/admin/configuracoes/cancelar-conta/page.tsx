"use client";

import Head from "next/head";
import { useState } from "react";
import {
  FaUserSlash,
  FaExclamationTriangle,
  FaCheckCircle,
  FaQuestionCircle,
  FaLock,
} from "react-icons/fa";

// Mock do usuário logado (troque para integração real)
type Cargo =
  | "Presidente"
  | "Vice"
  | "Diretor de Futebol"
  | "Diretor Financeiro";
const cargoLogado: Cargo = "Vice"; // Troque para "Presidente" para simular acesso liberado

export default function CancelarContaPage() {
  const isPresidente = cargoLogado === "Presidente";
  const [motivo, setMotivo] = useState("");
  const [confirmado, setConfirmado] = useState(false);
  const [enviado, setEnviado] = useState(false);

  const handleCancelar = () => {
    if (!motivo || !confirmado) return;
    setEnviado(true);
    setTimeout(() => setEnviado(false), 8000);
  };

  return (
    <>
      <Head>
        <title>Cancelar Conta | Fut7Pro Admin</title>
        <meta
          name="description"
          content="Cancele ou exclua seu painel Fut7Pro. Leia com atenção as consequências antes de prosseguir."
        />
        <meta
          name="keywords"
          content="Fut7, cancelar conta, excluir conta, SaaS, admin, segurança"
        />
      </Head>
      <div className="mx-auto w-full max-w-2xl px-4 pb-24 pt-20 md:pb-8 md:pt-6">
        <h1 className="mb-2 flex items-center gap-2 text-2xl font-bold text-red-400 md:text-3xl">
          <FaUserSlash /> Cancelar Conta
        </h1>

        {!isPresidente ? (
          <div className="animate-fadeIn flex flex-col items-center rounded-lg border-l-4 border-red-500 bg-[#231a1a] p-6 text-center text-red-300 shadow">
            <FaLock className="mb-2 text-3xl" />
            <b>Recurso restrito ao Presidente do racha.</b>
            <div className="mt-2 text-gray-400">
              Apenas o Presidente pode cancelar ou excluir o painel Fut7Pro.
              <br />
              Caso deseje pausar ou migrar a conta, solicite ao presidente ou{" "}
              <a
                href="/admin/comunicacao/suporte"
                className="text-yellow-400 underline"
              >
                abra um chamado
              </a>
              .
            </div>
          </div>
        ) : (
          <>
            <div className="animate-fadeIn mb-6 rounded-lg border-l-4 border-red-500 bg-[#231a1a] p-4 text-sm shadow">
              <b className="flex items-center gap-2 text-red-300">
                <FaExclamationTriangle /> Atenção: esta ação é irreversível!
              </b>
              <br />
              Ao cancelar sua conta Fut7Pro, todos os dados do racha, jogadores,
              partidas e histórico financeiro serão permanentemente excluídos.
              <br />
              <span className="mt-2 block text-gray-300">
                Se desejar apenas suspender temporariamente ou migrar para outro
                plano,{" "}
                <a
                  href="/admin/comunicacao/suporte"
                  className="text-yellow-400 underline"
                >
                  fale com nosso suporte
                </a>
                .
              </span>
            </div>

            <div className="mb-10 rounded-lg border border-yellow-700 bg-[#232323] p-5 shadow">
              <div className="mb-2 font-bold text-yellow-300">
                O que acontece ao cancelar a conta?
              </div>
              <ul className="mb-4 ml-6 list-disc space-y-1 text-sm text-gray-200">
                <li>
                  Todos os dados do racha e jogadores serão apagados e não
                  poderão ser recuperados.
                </li>
                <li>O acesso de todos os administradores será bloqueado.</li>
                <li>
                  Relatórios, histórico de partidas e conquistas serão
                  excluídos.
                </li>
                <li>Seu domínio próprio (se houver) será desvinculado.</li>
                <li>Não haverá estorno de valores já pagos.</li>
              </ul>
              <div className="mb-3">
                <label
                  htmlFor="motivo"
                  className="mb-1 block font-bold text-yellow-300"
                >
                  Motivo do cancelamento (opcional)
                </label>
                <textarea
                  id="motivo"
                  value={motivo}
                  onChange={(e) => setMotivo(e.target.value)}
                  placeholder="Nos ajude a entender o motivo (ex: não vou mais jogar, plataforma não atendeu, etc.)"
                  className="max-h-36 min-h-[70px] w-full resize-y rounded border border-yellow-400 bg-[#181818] p-3 text-gray-100"
                  maxLength={280}
                />
              </div>
              <div className="mb-4 flex items-center gap-2">
                <input
                  type="checkbox"
                  id="confirmar"
                  checked={confirmado}
                  onChange={(e) => setConfirmado(e.target.checked)}
                  className="form-checkbox h-5 w-5 border-red-400 bg-[#181818] text-red-500"
                />
                <label
                  htmlFor="confirmar"
                  className="font-semibold text-red-300"
                >
                  Eu li e entendi que todos os dados serão apagados de forma
                  permanente.
                </label>
              </div>
              <button
                className={`flex w-fit items-center gap-2 rounded bg-red-500 px-6 py-2 font-bold text-white transition hover:bg-red-600 disabled:opacity-60`}
                disabled={!confirmado || enviado}
                onClick={handleCancelar}
                type="button"
              >
                <FaUserSlash /> Cancelar Conta
              </button>
              {enviado && (
                <div className="mt-4 flex items-center gap-2 font-bold text-green-400">
                  <FaCheckCircle /> Solicitação enviada! Sua conta será excluída
                  em até 48h úteis.
                  <span className="ml-2 text-xs text-gray-300">
                    (Em caso de dúvidas,{" "}
                    <a
                      href="/admin/comunicacao/suporte"
                      className="text-yellow-400 underline"
                    >
                      abra um chamado
                    </a>
                    .)
                  </span>
                </div>
              )}
            </div>
          </>
        )}

        {/* FAQ */}
        <div className="rounded-lg border border-yellow-700 bg-[#232323] p-5 shadow">
          <div className="mb-2 flex items-center gap-1 font-bold text-yellow-300">
            <FaQuestionCircle className="text-base" />
            Dúvidas Frequentes
          </div>
          <ul className="space-y-2 text-sm text-gray-300">
            <li>
              <b>Posso reativar a conta depois?</b> Não. Após o cancelamento e
              exclusão, não há como recuperar dados.
            </li>
            <li>
              <b>Consigo só pausar ou suspender?</b> Sim! Fale com nosso suporte
              para suspender sem perder o histórico.
            </li>
            <li>
              <b>Fiz o cancelamento por engano, e agora?</b> Tente abrir chamado
              imediatamente. Se não foi processado ainda, tentaremos reverter.
            </li>
            <li>
              <b>Suporte:</b>{" "}
              <a
                href="/admin/comunicacao/suporte"
                className="text-yellow-400 underline"
              >
                Abrir chamado
              </a>
            </li>
          </ul>
        </div>
      </div>
      <style>{`
                .animate-fadeIn { animation: fadeIn 0.3s; }
                @keyframes fadeIn {
                    from { opacity: 0; transform: translateY(14px); }
                    to { opacity: 1; transform: none; }
                }
            `}</style>
    </>
  );
}
