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
type Cargo = "Presidente" | "Vice" | "Diretor de Futebol" | "Diretor Financeiro";
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
      <div className="pt-20 pb-24 md:pt-6 md:pb-8 px-4 max-w-2xl mx-auto w-full">
        <h1 className="text-2xl md:text-3xl font-bold text-red-400 mb-2 flex items-center gap-2">
          <FaUserSlash /> Cancelar Conta
        </h1>

        {!isPresidente ? (
          <div className="bg-[#231a1a] border-l-4 border-red-500 rounded-lg p-6 shadow text-red-300 text-center flex flex-col items-center animate-fadeIn">
            <FaLock className="text-3xl mb-2" />
            <b>Recurso restrito ao Presidente do racha.</b>
            <div className="text-gray-400 mt-2">
              Apenas o Presidente pode cancelar ou excluir o painel Fut7Pro.
              <br />
              Caso deseje pausar ou migrar a conta, solicite ao presidente ou{" "}
              <a href="/admin/comunicacao/suporte" className="underline text-yellow-400">
                abra um chamado
              </a>
              .
            </div>
          </div>
        ) : (
          <>
            <div className="mb-6 p-4 rounded-lg bg-[#231a1a] border-l-4 border-red-500 shadow animate-fadeIn text-sm">
              <b className="text-red-300 flex items-center gap-2">
                <FaExclamationTriangle /> Atenção: esta ação é irreversível!
              </b>
              <br />
              Ao cancelar sua conta Fut7Pro, todos os dados do racha, jogadores, partidas e
              histórico financeiro serão permanentemente excluídos.
              <br />
              <span className="text-gray-300 block mt-2">
                Se desejar apenas suspender temporariamente ou migrar para outro plano,{" "}
                <a href="/admin/comunicacao/suporte" className="underline text-yellow-400">
                  fale com nosso suporte
                </a>
                .
              </span>
            </div>

            <div className="bg-[#232323] rounded-lg p-5 shadow border border-yellow-700 mb-10">
              <div className="font-bold text-yellow-300 mb-2">
                O que acontece ao cancelar a conta?
              </div>
              <ul className="list-disc ml-6 text-gray-200 text-sm space-y-1 mb-4">
                <li>
                  Todos os dados do racha e jogadores serão apagados e não poderão ser recuperados.
                </li>
                <li>O acesso de todos os administradores será bloqueado.</li>
                <li>Relatórios, histórico de partidas e conquistas serão excluídos.</li>
                <li>Seu domínio próprio (se houver) será desvinculado.</li>
                <li>Não haverá estorno de valores já pagos.</li>
              </ul>
              <div className="mb-3">
                <label htmlFor="motivo" className="block text-yellow-300 font-bold mb-1">
                  Motivo do cancelamento (opcional)
                </label>
                <textarea
                  id="motivo"
                  value={motivo}
                  onChange={(e) => setMotivo(e.target.value)}
                  placeholder="Nos ajude a entender o motivo (ex: não vou mais jogar, plataforma não atendeu, etc.)"
                  className="w-full p-3 rounded bg-[#181818] border border-yellow-400 text-gray-100 min-h-[70px] max-h-36 resize-y"
                  maxLength={280}
                />
              </div>
              <div className="flex items-center gap-2 mb-4">
                <input
                  type="checkbox"
                  id="confirmar"
                  checked={confirmado}
                  onChange={(e) => setConfirmado(e.target.checked)}
                  className="form-checkbox h-5 w-5 text-red-500 bg-[#181818] border-red-400"
                />
                <label htmlFor="confirmar" className="text-red-300 font-semibold">
                  Eu li e entendi que todos os dados serão apagados de forma permanente.
                </label>
              </div>
              <button
                className={`bg-red-500 hover:bg-red-600 text-white font-bold px-6 py-2 rounded transition w-fit flex items-center gap-2 disabled:opacity-60`}
                disabled={!confirmado || enviado}
                onClick={handleCancelar}
                type="button"
              >
                <FaUserSlash /> Cancelar Conta
              </button>
              {enviado && (
                <div className="mt-4 text-green-400 flex items-center gap-2 font-bold">
                  <FaCheckCircle /> Solicitação enviada! Sua conta será excluída em até 48h úteis.
                  <span className="text-xs text-gray-300 ml-2">
                    (Em caso de dúvidas,{" "}
                    <a href="/admin/comunicacao/suporte" className="underline text-yellow-400">
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
        <div className="bg-[#232323] rounded-lg p-5 shadow border border-yellow-700">
          <div className="font-bold text-yellow-300 mb-2 flex items-center gap-1">
            <FaQuestionCircle className="text-base" />
            Dúvidas Frequentes
          </div>
          <ul className="text-gray-300 text-sm space-y-2">
            <li>
              <b>Posso reativar a conta depois?</b> Não. Após o cancelamento e exclusão, não há como
              recuperar dados.
            </li>
            <li>
              <b>Consigo só pausar ou suspender?</b> Sim! Fale com nosso suporte para suspender sem
              perder o histórico.
            </li>
            <li>
              <b>Fiz o cancelamento por engano, e agora?</b> Tente abrir chamado imediatamente. Se
              não foi processado ainda, tentaremos reverter.
            </li>
            <li>
              <b>Suporte:</b>{" "}
              <a href="/admin/comunicacao/suporte" className="underline text-yellow-400">
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
