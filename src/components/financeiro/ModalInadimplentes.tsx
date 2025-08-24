"use client";

import React from "react";
import { FaWhatsapp, FaEnvelope, FaTimes } from "react-icons/fa";
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
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60"
      aria-modal="true"
      aria-label={titulo}
      tabIndex={-1}
    >
      <div className="animate-fadeIn relative mx-2 w-full max-w-2xl rounded-2xl bg-zinc-900 p-6 shadow-xl">
        <button
          className="absolute right-3 top-3 text-zinc-300 transition hover:text-red-500"
          onClick={onClose}
          aria-label="Fechar"
        >
          <FaTimes size={22} />
        </button>
        <h2 className="mb-2 text-2xl font-bold text-white">{titulo}</h2>
        <p className="mb-4 text-sm text-zinc-400">
          Confira abaixo todos os rachas com cobranças em aberto no sistema.
          Clique no ícone para contatar o presidente.
        </p>
        {inadimplentes.length === 0 ? (
          <div className="py-10 text-center text-zinc-400">
            Nenhum inadimplente encontrado neste período. 🎉
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="mb-0 min-w-full text-sm text-white">
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
                    className="border-b border-zinc-800 transition hover:bg-zinc-800/50"
                  >
                    <td className="px-2 py-2">{item.racha}</td>
                    <td className="px-2 py-2">{item.presidente}</td>
                    <td className="px-2 py-2">{item.plano}</td>
                    <td className="px-2 py-2 font-bold text-red-400">
                      {item.valor.toLocaleString("pt-BR", {
                        style: "currency",
                        currency: "BRL",
                      })}
                    </td>
                    <td className="px-2 py-2">{item.vencimento}</td>
                    <td className="flex items-center gap-2 px-2 py-2">
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
        <div className="mt-4 flex justify-end">
          <button
            className="rounded border border-zinc-700 bg-zinc-800 px-5 py-2 font-semibold text-white transition hover:bg-zinc-700"
            onClick={onClose}
          >
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
}
