"use client";
import { useRef, useState } from "react";
import type { Patrocinador } from "@/types/financeiro";
import Image from "next/image";
import { FaUpload, FaTimes } from "react-icons/fa";

interface Props {
  open: boolean;
  onClose: () => void;
  onSave: (p: Partial<Patrocinador>) => void;
  initial?: Partial<Patrocinador>;
}

const statusOptions = [
  { value: "ativo", label: "Ativo" },
  { value: "inativo", label: "Inativo" },
  { value: "encerrado", label: "Encerrado" },
] as const;

export default function ModalPatrocinador({
  open,
  onClose,
  onSave,
  initial,
}: Props) {
  const fileLogoRef = useRef<HTMLInputElement>(null);
  const [form, setForm] = useState<Partial<Patrocinador>>(initial || {});
  const [logoPreview, setLogoPreview] = useState<string | undefined>(form.logo);

  // Custom scrollbar dark (executa só no client)
  if (typeof window !== "undefined") {
    const id = "modal-scrollbar-dark";
    if (!document.getElementById(id)) {
      const style = document.createElement("style");
      style.id = id;
      style.innerHTML = `
        .custom-scrollbar::-webkit-scrollbar {
          width: 8px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #444;
          border-radius: 8px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: #191919;
        }
      `;
      document.head.appendChild(style);
    }
  }

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setLogoPreview(url);
      setForm((f) => ({ ...f, logo: url }));
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 px-2">
      <div
        className="custom-scrollbar relative max-h-screen w-full max-w-md overflow-y-auto rounded-2xl bg-[#1a1a1a] p-6 shadow-xl"
        style={{
          scrollbarColor: "#444 #191919",
          scrollbarWidth: "thin",
        }}
      >
        {/* Botão de fechar sempre fixo no topo direito */}
        <button
          className="absolute right-2 top-2 z-10 text-gray-400 hover:text-red-400"
          style={{ zIndex: 10 }}
          onClick={onClose}
          type="button"
          aria-label="Fechar modal"
        >
          <FaTimes size={22} />
        </button>
        <h2 className="mb-4 pr-8 pt-3 text-xl font-bold text-yellow-400">
          {form.id ? "Editar Patrocinador" : "Novo Patrocinador"}
        </h2>
        <form
          className="flex flex-col gap-3"
          onSubmit={(e) => {
            e.preventDefault();
            onSave(form);
          }}
        >
          <label className="text-sm font-semibold text-gray-200">Nome *</label>
          <input
            type="text"
            value={form.nome || ""}
            required
            maxLength={40}
            autoFocus
            className="input input-bordered rounded border-gray-600 bg-[#111] px-3 py-2 text-white"
            onChange={(e) => setForm((f) => ({ ...f, nome: e.target.value }))}
          />
          <label className="text-sm font-semibold text-gray-200">Valor *</label>
          <input
            type="number"
            value={form.valor || ""}
            required
            min={0}
            className="input input-bordered rounded border-gray-600 bg-[#111] px-3 py-2 text-white"
            onChange={(e) =>
              setForm((f) => ({ ...f, valor: parseFloat(e.target.value) }))
            }
          />
          <div className="flex gap-2">
            <div className="flex-1">
              <label className="text-sm font-semibold text-gray-200">
                Início *
              </label>
              <input
                type="date"
                value={form.periodoInicio || ""}
                required
                className="input input-bordered w-full rounded border-gray-600 bg-[#111] px-2 py-2 text-white"
                onChange={(e) =>
                  setForm((f) => ({ ...f, periodoInicio: e.target.value }))
                }
              />
            </div>
            <div className="flex-1">
              <label className="text-sm font-semibold text-gray-200">
                Fim *
              </label>
              <input
                type="date"
                value={form.periodoFim || ""}
                required
                className="input input-bordered w-full rounded border-gray-600 bg-[#111] px-2 py-2 text-white"
                onChange={(e) =>
                  setForm((f) => ({ ...f, periodoFim: e.target.value }))
                }
              />
            </div>
          </div>
          <label className="text-sm font-semibold text-gray-200">
            Status *
          </label>
          <select
            className="input input-bordered rounded border-gray-600 bg-[#111] px-3 py-2 text-white"
            value={form.status || "ativo"}
            onChange={(e) =>
              setForm((f) => ({ ...f, status: e.target.value as any }))
            }
          >
            {statusOptions.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
          <label className="text-sm font-semibold text-gray-200">Logo *</label>
          <div className="flex items-center gap-3">
            <input
              type="file"
              accept="image/*"
              ref={fileLogoRef}
              className="hidden"
              onChange={handleLogoChange}
            />
            <button
              type="button"
              onClick={() => fileLogoRef.current?.click()}
              className="flex items-center gap-1 text-yellow-400 hover:text-yellow-300"
            >
              <FaUpload /> Selecionar
            </button>
            {logoPreview && (
              <Image
                src={logoPreview}
                alt="Logo patrocinador"
                width={40}
                height={40}
                className="rounded border border-gray-700 bg-[#222]"
              />
            )}
          </div>
          <label className="text-sm font-semibold text-gray-200">
            Descrição/Observações
          </label>
          <textarea
            className="input input-bordered rounded border-gray-600 bg-[#111] px-3 py-2 text-white"
            rows={2}
            value={form.observacoes || ""}
            onChange={(e) =>
              setForm((f) => ({ ...f, observacoes: e.target.value }))
            }
          />
          <label className="text-sm font-semibold text-gray-200">
            Link (opcional)
          </label>
          <input
            type="url"
            className="input input-bordered rounded border-gray-600 bg-[#111] px-3 py-2 text-white"
            value={form.link || ""}
            onChange={(e) => setForm((f) => ({ ...f, link: e.target.value }))}
          />
          <div className="mt-4 flex justify-end">
            <button
              type="submit"
              className="rounded-xl bg-yellow-400 px-6 py-2 font-bold text-black hover:bg-yellow-500"
            >
              Salvar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
