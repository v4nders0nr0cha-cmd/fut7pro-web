"use client";

import { useEffect, useRef, useState } from "react";
import { FaFutbol } from "react-icons/fa";

export default function PublicMembershipCard({
  variant,
  groupName,
  onConfirm,
}: {
  variant: "active" | "pending" | "request";
  groupName: string;
  onConfirm?: () => Promise<void>;
}) {
  const [open, setOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const cancelRef = useRef<HTMLButtonElement>(null);
  const name = groupName.trim() || "seu grupo";

  useEffect(() => {
    if (!open) return;
    cancelRef.current?.focus();
    const close = (event: KeyboardEvent) => {
      if (event.key === "Escape" && !submitting) setOpen(false);
    };
    document.addEventListener("keydown", close);
    return () => document.removeEventListener("keydown", close);
  }, [open, submitting]);

  async function submitRequest() {
    if (!onConfirm || submitting) return;
    setSubmitting(true);
    setError(null);
    try {
      await onConfirm();
      setOpen(false);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Não foi possível enviar o pedido.");
    } finally {
      setSubmitting(false);
    }
  }

  if (variant === "active") {
    return (
      <div className="rounded-xl border border-brand/25 bg-brand/5 p-4 text-sm text-zinc-200">
        <strong className="block text-brand">Mensalista do grupo</strong>Participação mensalista
        confirmada
      </div>
    );
  }

  return (
    <>
      <section className="rounded-2xl border border-brand/30 bg-[linear-gradient(125deg,#242017,#111216)] p-5 shadow-lg sm:p-6">
        <FaFutbol className="text-2xl text-brand" aria-hidden="true" />
        <h2 className="mt-3 text-xl font-extrabold text-white">
          {variant === "pending" ? "Solicitação em análise" : `Seja mensalista do ${name}!`}
        </h2>
        <p className="mt-2 max-w-[65ch] text-sm leading-relaxed text-zinc-300">
          {variant === "pending"
            ? `Seu pedido de mensalista no ${name} foi enviado e está aguardando avaliação do administrador.`
            : `Solicite uma vaga de mensalista no ${name}. O administrador avaliará seu pedido e poderá aprová-lo conforme a disponibilidade de vagas.`}
        </p>
        {variant === "request" && (
          <button
            type="button"
            onClick={() => setOpen(true)}
            className="mt-5 min-h-11 rounded-lg bg-brand px-5 py-2 font-bold text-black hover:brightness-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
          >
            Solicitar vaga de mensalista
          </button>
        )}
      </section>
      {variant === "request" && open && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center overflow-y-auto bg-black/75 p-4"
          role="presentation"
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="membership-confirm-title"
            className="w-full max-w-sm rounded-xl border border-brand/50 bg-zinc-950 p-6 shadow-xl"
          >
            <h2 id="membership-confirm-title" className="text-lg font-bold text-brand">
              Confirmar solicitação
            </h2>
            <p className="mt-3 text-sm text-zinc-200">
              Seu pedido de mensalista no {name} será enviado ao administrador. A aprovação depende
              da disponibilidade de vagas e das regras do grupo.
            </p>
            {error && (
              <p role="alert" className="mt-3 text-sm text-red-300">
                {error}
              </p>
            )}
            <div className="mt-5 flex flex-wrap gap-3">
              <button
                type="button"
                disabled={submitting}
                onClick={submitRequest}
                className="min-h-11 rounded-lg bg-brand px-4 font-bold text-black disabled:opacity-60"
              >
                {submitting ? "Enviando..." : "Confirmar"}
              </button>
              <button
                type="button"
                disabled={submitting}
                onClick={() => setOpen(false)}
                ref={cancelRef}
                className="min-h-11 rounded-lg border border-white/20 px-4 text-white disabled:opacity-60"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
