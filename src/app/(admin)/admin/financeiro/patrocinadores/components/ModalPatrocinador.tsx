"use client";
import { useEffect, useRef, useState } from "react";
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

const billingPlanOptions = [
  { value: "MENSAL", label: "Mensal" },
  { value: "QUADRIMESTRAL", label: "Quadrimestral" },
  { value: "ANUAL", label: "Anual" },
] as const;

const billingPlanValueLabels: Record<string, string> = {
  MENSAL: "Quanto este patrocinador paga por mes?",
  QUADRIMESTRAL: "Quanto este patrocinador paga a cada quatro meses?",
  ANUAL: "Quanto este patrocinador paga por ano?",
};

export default function ModalPatrocinador({ open, onClose, onSave, initial }: Props) {
  const fileLogoRef = useRef<HTMLInputElement>(null);
  const normalizeInitial = (input?: Partial<Patrocinador>) => ({
    status: "ativo" as const,
    billingPlan: input?.billingPlan ?? undefined,
    ...input,
  });
  const [form, setForm] = useState<Partial<Patrocinador>>(normalizeInitial(initial));
  const [logoPreview, setLogoPreview] = useState<string | undefined>(form.logo);
  const [logoUploading, setLogoUploading] = useState(false);
  const [logoError, setLogoError] = useState<string | null>(null);
  const planValueLabel = form.billingPlan ? billingPlanValueLabels[form.billingPlan] : "";
  const shouldShowValue = Boolean(form.billingPlan);

  useEffect(() => {
    if (!open) return;
    setForm(normalizeInitial(initial));
    setLogoPreview(initial?.logo);
    setLogoError(null);
  }, [initial, open]);

  // Custom scrollbar dark (executa so no client)
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

  const isExpired = (() => {
    const dueRaw = form.nextDueAt || form.periodoFim;
    if (!dueRaw) return false;
    const end = new Date(dueRaw);
    if (Number.isNaN(end.getTime())) return false;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    end.setHours(0, 0, 0, 0);
    return end.getTime() < today.getTime();
  })();

  const uploadLogo = async (file: File) => {
    const formData = new FormData();
    const extension = file.name.split(".").pop() || "png";
    formData.append("file", file, `patrocinador-${Date.now()}.${extension}`);

    const res = await fetch("/api/uploads/team-logo", {
      method: "POST",
      body: formData,
    });
    const data = await res.json().catch(() => null);
    if (!res.ok) {
      throw new Error(data?.message || data?.error || "Erro ao enviar logo.");
    }
    return data?.url || data?.path || data?.publicUrl || null;
  };

  const handleLogoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const previewUrl = URL.createObjectURL(file);
    setLogoPreview(previewUrl);
    setLogoUploading(true);
    setLogoError(null);

    try {
      const uploadedUrl = await uploadLogo(file);
      if (!uploadedUrl) {
        throw new Error("URL nao retornada");
      }
      setForm((f) => ({ ...f, logo: uploadedUrl }));
      setLogoPreview(uploadedUrl);
    } catch (err) {
      setLogoError("Falha ao enviar logo. Tente novamente.");
    } finally {
      setLogoUploading(false);
    }
  };

  if (!open) return null;

  return (
    <div className="fixed z-50 inset-0 flex items-center justify-center bg-black/80 px-2">
      <div
        className="bg-[#1a1a1a] rounded-2xl p-6 max-w-md w-full shadow-xl relative overflow-y-auto max-h-screen custom-scrollbar"
        style={{
          scrollbarColor: "#444 #191919",
          scrollbarWidth: "thin",
        }}
      >
        {/* Botao de fechar sempre fixo no topo direito */}
        <button
          className="absolute top-2 right-2 text-gray-400 hover:text-red-400 z-10"
          style={{ zIndex: 10 }}
          onClick={onClose}
          type="button"
          aria-label="Fechar modal"
        >
          <FaTimes size={22} />
        </button>
        <h2 className="text-xl font-bold text-yellow-400 mb-4 pt-3 pr-8">
          {form.id ? "Editar Patrocinador" : "Novo Patrocinador"}
        </h2>
        {form.id && isExpired && (
          <div className="mb-4 rounded-lg border border-red-500/50 bg-red-500/10 px-3 py-2 text-sm text-red-300">
            Este plano esta vencido. A logo continua no site publico. Confirme o recebimento quando
            renovar o ciclo ou exclua manualmente.
          </div>
        )}
        <form
          className="flex flex-col gap-3"
          onSubmit={(e) => {
            e.preventDefault();
            const { periodoInicio, periodoFim, lastPaidAt, nextDueAt, ...payload } = form;
            onSave(payload);
          }}
        >
          <label className="text-sm text-gray-200 font-semibold" htmlFor="patrocinador-nome">
            Nome *
          </label>
          <input
            id="patrocinador-nome"
            type="text"
            value={form.nome || ""}
            required
            maxLength={40}
            autoFocus
            className="input input-bordered bg-[#111] border-gray-600 rounded px-3 py-2 text-white"
            onChange={(e) => setForm((f) => ({ ...f, nome: e.target.value }))}
          />
          <label className="text-sm text-gray-200 font-semibold" htmlFor="patrocinador-ramo">
            Subtitulo/Categoria
          </label>
          <input
            id="patrocinador-ramo"
            type="text"
            value={form.ramo || ""}
            maxLength={80}
            className="input input-bordered bg-[#111] border-gray-600 rounded px-3 py-2 text-white"
            onChange={(e) => setForm((f) => ({ ...f, ramo: e.target.value }))}
          />
          <label className="text-sm text-gray-200 font-semibold" htmlFor="patrocinador-plan">
            Plano do Patrocinador *
          </label>
          <select
            id="patrocinador-plan"
            className="input input-bordered bg-[#111] border-gray-600 rounded px-3 py-2 text-white"
            value={form.billingPlan ?? ""}
            required
            onChange={(e) =>
              setForm((f) => ({
                ...f,
                billingPlan: e.target.value ? (e.target.value as any) : undefined,
              }))
            }
          >
            <option value="" disabled>
              Selecione
            </option>
            {billingPlanOptions.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
          <span className="text-xs text-gray-400">
            Define a frequencia do ciclo e dos alertas. O lancamento no caixa so ocorre apos a
            confirmacao do recebimento.
          </span>
          {shouldShowValue && (
            <>
              <label className="text-sm text-gray-200 font-semibold" htmlFor="patrocinador-valor">
                {planValueLabel}
              </label>
              <input
                id="patrocinador-valor"
                type="number"
                value={form.valor ?? ""}
                required
                min={0}
                className="input input-bordered bg-[#111] border-gray-600 rounded px-3 py-2 text-white"
                onChange={(e) =>
                  setForm((f) => ({
                    ...f,
                    valor: e.target.value === "" ? undefined : parseFloat(e.target.value),
                  }))
                }
              />
            </>
          )}
          <label className="text-sm text-gray-200 font-semibold" htmlFor="patrocinador-status">
            Status *
          </label>
          <select
            id="patrocinador-status"
            className="input input-bordered bg-[#111] border-gray-600 rounded px-3 py-2 text-white"
            value={form.status || "ativo"}
            onChange={(e) => setForm((f) => ({ ...f, status: e.target.value as any }))}
          >
            {statusOptions.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
          <label className="text-sm text-gray-200 font-semibold">Logo *</label>
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
              className="text-yellow-400 hover:text-yellow-300 flex items-center gap-1"
            >
              <FaUpload /> Selecionar
            </button>
            {logoUploading && <span className="text-xs text-gray-400">Enviando...</span>}
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
          {logoError && <div className="text-xs text-red-400">{logoError}</div>}
          <label className="text-sm text-gray-200 font-semibold" htmlFor="patrocinador-descricao">
            Descricao/Observacoes
          </label>
          <textarea
            id="patrocinador-descricao"
            className="input input-bordered bg-[#111] border-gray-600 rounded px-3 py-2 text-white"
            rows={2}
            value={form.observacoes || ""}
            onChange={(e) => setForm((f) => ({ ...f, observacoes: e.target.value }))}
          />
          <label className="text-sm text-gray-200 font-semibold" htmlFor="patrocinador-link">
            Link (opcional)
          </label>
          <input
            id="patrocinador-link"
            type="text"
            inputMode="url"
            className="input input-bordered bg-[#111] border-gray-600 rounded px-3 py-2 text-white"
            value={form.link || ""}
            onChange={(e) => setForm((f) => ({ ...f, link: e.target.value }))}
          />
          <div className="flex justify-end mt-4">
            <button
              type="submit"
              className="bg-yellow-400 hover:bg-yellow-500 text-black font-bold py-2 px-6 rounded-xl disabled:opacity-60 disabled:pointer-events-none"
              disabled={logoUploading || !form.logo}
            >
              Salvar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
