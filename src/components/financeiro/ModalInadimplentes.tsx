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
      className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center"
      aria-modal="true"
      aria-label={titulo}
      tabIndex={-1}
    >
      <div className="bg-zinc-900 rounded-2xl shadow-xl p-6 w-full max-w-2xl mx-2 relative animate-fadeIn">
        <button
          className="absolute top-3 right-3 text-zinc-300 hover:text-red-500 transition"
          onClick={onClose}
          aria-label="Fechar"
        >
          <FaTimes size={22} />
        </button>
        <h2 className="text-2xl font-bold text-white mb-2">{titulo}</h2>
        <p className="text-zinc-400 text-sm mb-4">
          Confira abaixo todos os rachas com cobranças em aberto no sistema. Clique no ícone para
          contatar o presidente.
        </p>
        {inadimplentes.length === 0 ? (
          <div className="text-center text-zinc-400 py-10">
            Nenhum inadimplente encontrado neste período. 🎉
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm text-white mb-0">
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
        <div className="flex justify-end mt-4">
          <button
            className="bg-zinc-800 border border-zinc-700 hover:bg-zinc-700 text-white rounded px-5 py-2 font-semibold transition"
            onClick={onClose}
          >
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
}
