"use client";

import Link from "next/link";
import Head from "next/head";
import { useState } from "react";
import {
  FaUserSlash,
  FaExclamationTriangle,
  FaCheckCircle,
  FaQuestionCircle,
  FaLock,
} from "react-icons/fa";
import { useAuth } from "@/hooks/useAuth";
import { useMe } from "@/hooks/useMe";
import { useRacha } from "@/context/RachaContext";

const CANCELLATION_CONFIRMATION_TEXT = "CANCELAR RACHA";

function extractError(payload: unknown, fallback: string) {
  if (!payload || typeof payload !== "object") return fallback;
  const data = payload as Record<string, unknown>;
  const message = data.message;
  if (typeof message === "string" && message.trim()) return message;
  const error = data.error;
  if (typeof error === "string" && error.trim()) return error;
  return fallback;
}

export default function CancelarContaPage() {
  const { user } = useAuth();
  const { tenantSlug } = useRacha();
  const { me, isLoading } = useMe({ context: "admin" });
  const membershipRole = (me?.membership?.role || "").toString().toUpperCase();
  const isPresidente = membershipRole === "PRESIDENTE";
  const [motivo, setMotivo] = useState("");
  const [confirmouEscopoRacha, setConfirmouEscopoRacha] = useState(false);
  const [confirmouImpactoDados, setConfirmouImpactoDados] = useState(false);
  const [textoConfirmacao, setTextoConfirmacao] = useState("");
  const [enviando, setEnviando] = useState(false);
  const [protocoloId, setProtocoloId] = useState<string | null>(null);
  const [ticketCriadoAgora, setTicketCriadoAgora] = useState<boolean | null>(null);
  const [erroEnvio, setErroEnvio] = useState<string | null>(null);
  const [mensagemSucesso, setMensagemSucesso] = useState<string | null>(null);

  const slug = tenantSlug || me?.tenant?.tenantSlug || user?.tenantId || "";
  const confirmacaoValida =
    textoConfirmacao.trim().toUpperCase().replace(/\s+/g, " ") === CANCELLATION_CONFIRMATION_TEXT;

  if (isLoading) {
    return (
      <div className="pt-20 pb-24 md:pt-6 md:pb-8 px-4 max-w-2xl mx-auto w-full text-center">
        <div className="bg-[#232323] rounded-lg p-6 text-gray-200 shadow">
          Carregando permissões...
        </div>
      </div>
    );
  }

  const handleSolicitarCancelamento = async () => {
    if (!confirmouEscopoRacha || !confirmouImpactoDados) {
      setErroEnvio("Confirme os dois termos obrigatórios antes de enviar a solicitação.");
      return;
    }
    if (!confirmacaoValida) {
      setErroEnvio(`Digite exatamente "${CANCELLATION_CONFIRMATION_TEXT}" para confirmar.`);
      return;
    }
    if (!slug) {
      setErroEnvio("Slug do racha não encontrado.");
      return;
    }

    setEnviando(true);
    setErroEnvio(null);
    setMensagemSucesso(null);

    try {
      const response = await fetch("/api/admin/support/tickets/cancelamento-racha", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          reason: motivo.trim() || undefined,
          acknowledgeRachaOnly: confirmouEscopoRacha,
          acknowledgeDataDeletion: confirmouImpactoDados,
          confirmationText: textoConfirmacao,
        }),
      });

      const payload = await response.json().catch(() => ({}));
      if (!response.ok) {
        throw new Error(extractError(payload, "Erro ao enviar solicitação de cancelamento."));
      }

      const data = payload as { id?: string; created?: boolean };
      setProtocoloId(typeof data.id === "string" ? data.id : null);
      setTicketCriadoAgora(typeof data.created === "boolean" ? data.created : null);
      setMensagemSucesso(
        data.created === false
          ? "Já existe uma solicitação de cancelamento aberta para este racha. O protocolo foi recuperado para acompanhamento."
          : "Solicitação de cancelamento do racha registrada com sucesso. Nossa equipe continuará o atendimento pelo suporte."
      );
      setMotivo("");
      setConfirmouEscopoRacha(false);
      setConfirmouImpactoDados(false);
      setTextoConfirmacao("");
    } catch (err) {
      setErroEnvio(err instanceof Error ? err.message : "Erro ao enviar solicitação.");
    } finally {
      setEnviando(false);
    }
  };

  return (
    <>
      <Head>
        <title>Cancelar conta do racha | Fut7Pro Admin</title>
        <meta
          name="description"
          content="Solicite o cancelamento da conta do racha no Fut7Pro com confirmação segura e protocolo de atendimento."
        />
        <meta
          name="keywords"
          content="Fut7Pro, cancelar conta do racha, cancelamento de assinatura, suporte admin"
        />
      </Head>
      <div className="pt-20 pb-24 md:pt-6 md:pb-8 px-4 max-w-2xl mx-auto w-full">
        <h1 className="text-2xl md:text-3xl font-bold text-red-400 mb-2 flex items-center gap-2">
          <FaUserSlash /> Cancelar conta do racha
        </h1>
        <p className="text-sm text-zinc-300 mb-6">
          Esta página cancela apenas o racha ativo ({slug || "sem slug"}). Sua conta global de
          usuário no Fut7Pro não será excluída.
        </p>

        {!isPresidente ? (
          <div className="bg-[#231a1a] border-l-4 border-red-500 rounded-lg p-6 shadow text-red-300 text-center flex flex-col items-center animate-fadeIn">
            <FaLock className="text-3xl mb-2" />
            <b>Recurso restrito ao Presidente do racha.</b>
            <div className="text-gray-400 mt-2">
              Apenas o Presidente pode solicitar o cancelamento da conta do racha.
              <br />
              Para pausa, migração de plano ou dúvidas,{" "}
              <Link href="/admin/comunicacao/suporte" className="underline text-yellow-400">
                abra um chamado no suporte
              </Link>
              .
            </div>
          </div>
        ) : (
          <>
            <div className="mb-6 p-4 rounded-lg bg-[#231a1a] border-l-4 border-red-500 shadow animate-fadeIn text-sm">
              <b className="text-red-300 flex items-center gap-2">
                <FaExclamationTriangle /> Atenção: solicitação crítica de cancelamento
              </b>
              <br />
              Este fluxo trata somente do cancelamento da conta do racha ativo. A conta global do
              usuário solicitante permanece ativa no Fut7Pro.
              <br />
              <span className="text-gray-300 block mt-2">
                Se você quer apenas pausar ou negociar o plano,{" "}
                <Link href="/admin/comunicacao/suporte" className="underline text-yellow-400">
                  fale com nosso suporte
                </Link>
                .
              </span>
            </div>

            <div className="bg-[#232323] rounded-lg p-5 shadow border border-yellow-700 mb-10">
              <div className="font-bold text-yellow-300 mb-2">
                O que acontece ao cancelar a conta do racha?
              </div>
              <ul className="list-disc ml-6 text-gray-200 text-sm space-y-1 mb-4">
                <li>O cancelamento afeta somente este racha e sua assinatura vinculada.</li>
                <li>
                  O acesso administrativo desse racha pode ser bloqueado após a conclusão do
                  processo.
                </li>
                <li>
                  Dados esportivos e financeiros do racha podem ser arquivados ou excluídos conforme
                  política de retenção e compliance.
                </li>
                <li>Não há exclusão da conta global do usuário por este fluxo.</li>
                <li>Rachas adicionais vinculados ao mesmo usuário permanecem inalterados.</li>
              </ul>
              <div className="mb-3">
                <label htmlFor="motivo" className="block text-yellow-300 font-bold mb-1">
                  Motivo do cancelamento do racha (opcional)
                </label>
                <textarea
                  id="motivo"
                  value={motivo}
                  onChange={(e) => setMotivo(e.target.value)}
                  placeholder="Ex.: encerramos as atividades, vamos migrar para outro modelo, custo atual não atende ao momento do racha."
                  className="w-full p-3 rounded bg-[#181818] border border-yellow-400 text-gray-100 min-h-[70px] max-h-36 resize-y"
                  maxLength={600}
                />
              </div>
              <div className="flex items-center gap-2 mb-3">
                <input
                  type="checkbox"
                  id="confirmar-escopo-racha"
                  checked={confirmouEscopoRacha}
                  onChange={(e) => setConfirmouEscopoRacha(e.target.checked)}
                  className="form-checkbox h-5 w-5 text-red-500 bg-[#181818] border-red-400"
                />
                <label htmlFor="confirmar-escopo-racha" className="text-red-300 font-semibold">
                  Confirmo que estou cancelando apenas a conta deste racha, e não minha conta global
                  de usuário.
                </label>
              </div>
              <div className="flex items-center gap-2 mb-4">
                <input
                  type="checkbox"
                  id="confirmar-impacto-dados"
                  checked={confirmouImpactoDados}
                  onChange={(e) => setConfirmouImpactoDados(e.target.checked)}
                  className="form-checkbox h-5 w-5 text-red-500 bg-[#181818] border-red-400"
                />
                <label htmlFor="confirmar-impacto-dados" className="text-red-300 font-semibold">
                  Confirmo que entendi o impacto sobre dados e acesso do racha após o cancelamento.
                </label>
              </div>

              <div className="mb-4">
                <label htmlFor="confirmacao-texto" className="block text-yellow-300 font-bold mb-1">
                  Digite <span className="text-red-300">{CANCELLATION_CONFIRMATION_TEXT}</span> para
                  confirmar
                </label>
                <input
                  id="confirmacao-texto"
                  value={textoConfirmacao}
                  onChange={(e) => setTextoConfirmacao(e.target.value)}
                  placeholder={CANCELLATION_CONFIRMATION_TEXT}
                  className="w-full p-3 rounded bg-[#181818] border border-yellow-400 text-gray-100"
                  maxLength={60}
                />
              </div>

              <button
                className={`bg-red-500 hover:bg-red-600 text-white font-bold px-6 py-2 rounded transition w-fit flex items-center gap-2 disabled:opacity-60`}
                disabled={
                  enviando || !confirmouEscopoRacha || !confirmouImpactoDados || !confirmacaoValida
                }
                onClick={handleSolicitarCancelamento}
                type="button"
              >
                <FaUserSlash /> {enviando ? "Enviando..." : "Solicitar cancelamento do racha"}
              </button>
              {erroEnvio && <div className="mt-3 text-red-400 text-sm">{erroEnvio}</div>}
              {mensagemSucesso && (
                <div className="mt-4 text-green-400 text-sm space-y-2">
                  <div className="flex items-start gap-2 font-bold">
                    <FaCheckCircle className="mt-0.5" />
                    <span>{mensagemSucesso}</span>
                  </div>
                  {protocoloId && (
                    <div className="text-zinc-200">
                      Protocolo: <span className="font-mono">{protocoloId}</span>{" "}
                      {ticketCriadoAgora === false ? "(solicitação já existente)" : ""}
                    </div>
                  )}
                  <div>
                    <Link
                      href={
                        protocoloId
                          ? `/admin/comunicacao/suporte?open=${encodeURIComponent(protocoloId)}`
                          : "/admin/comunicacao/suporte"
                      }
                      className="underline text-yellow-300"
                    >
                      Acompanhar solicitação no Suporte
                    </Link>
                  </div>
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
              <b>Isso apaga minha conta global do Fut7Pro?</b> Não. Esta solicitação cancela somente
              o racha ativo.
            </li>
            <li>
              <b>Posso pausar em vez de cancelar?</b> Sim. Fale com o suporte para avaliar pausa,
              troca de plano ou renegociação.
            </li>
            <li>
              <b>O cancelamento é imediato?</b> Não. Primeiro o pedido é protocolado e analisado
              pela equipe Fut7Pro.
            </li>
            <li>
              <b>Suporte:</b>{" "}
              <Link href="/admin/comunicacao/suporte" className="underline text-yellow-400">
                Abrir chamado
              </Link>
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
