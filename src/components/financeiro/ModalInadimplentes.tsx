"use client";

import React from "react";
import { FaWhatsapp, FaEnvelope } from "react-icons/fa";
import Fut7DialogBase from "@/components/ui/feedback/Fut7DialogBase";
import type { Inadimplente } from "@/components/financeiro/types";

interface ModalInadimplentesProps {
  open: boolean;
  onClose: () => void;
  inadimplentes: Inadimplente[];
  titulo?: string;
}

export default function ModalInadimplentes({
  open,
  onClose,
  inadimplentes,
  titulo = "Lista de Inadimplentes",
}: ModalInadimplentesProps) {
  if (!open) return null;

  return (
    <Fut7DialogBase
      open
      title={titulo}
      size="xl"
      onClose={onClose}
      description="Confira os grupos com pagamentos em aberto e use o contato para falar com o presidente."
      footer={
        <button
          type="button"
          className="col-span-2 rounded-xl border border-white/15 px-5 py-2.5 font-semibold text-white hover:bg-white/10"
          onClick={onClose}
        >
          Fechar
        </button>
      }
    >
      {inadimplentes.length === 0 ? (
        <div className="text-center text-zinc-400 py-10">
          Nenhum inadimplente encontrado neste período. 🎉
        </div>
      ) : (
        <div className="max-w-full overflow-x-auto rounded-xl border border-white/10">
          <table className="min-w-[620px] text-sm text-white">
            <thead>
              <tr className="border-b border-zinc-700">
                <th className="px-2 py-2">Racha</th>
                <th className="px-2 py-2">Presidente</th>
                <th className="px-2 py-2">Plano</th>
                <th className="px-2 py-2">Valor (R$)</th>
                <th className="px-2 py-2">Vencimento</th>
                <th className="px-2 py-2">Contato</th>
              </tr>
            </thead>
            <tbody>
              {inadimplentes.map((item) => (
                <tr
                  key={item.id}
                  className="border-b border-zinc-800 hover:bg-zinc-800/50 transition"
                >
                  <td className="px-2 py-2">{item.racha}</td>
                  <td className="px-2 py-2">{item.presidente}</td>
                  <td className="px-2 py-2">{item.plano}</td>
                  <td className="px-2 py-2 text-red-400 font-bold">
                    {item.valor.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
                  </td>
                  <td className="px-2 py-2">{item.vencimento}</td>
                  <td className="px-2 py-2 flex gap-2 items-center">
                    {item.contato.startsWith("55") ? (
                      <a
                        href={`https://wa.me/${item.contato}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-green-400 hover:text-green-600"
                        title="Enviar WhatsApp"
                        aria-label="Enviar WhatsApp"
                      >
                        <FaWhatsapp size={18} />
                      </a>
                    ) : (
                      <a
                        href={`mailto:${item.contato}`}
                        className="text-blue-400 hover:text-blue-600"
                        title="Enviar E-mail"
                        aria-label="Enviar E-mail"
                      >
                        <FaEnvelope size={18} />
                      </a>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </Fut7DialogBase>
  );
}
