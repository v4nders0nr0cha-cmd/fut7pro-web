"use client";
import { useEffect, useRef, useState } from "react";
import type { Patrocinador } from "@/types/financeiro";
import Image from "next/image";
import { FaUpload, FaTimes } from "react-icons/fa";
import SponsorLogoCropperModal from "./SponsorLogoCropperModal";

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

const billingPlanFirstPaymentQuestions: Record<string, string> = {
  MENSAL: "Voce ja recebeu o 1o pagamento mensal deste patrocinador?",
  QUADRIMESTRAL: "Voce ja recebeu o 1o pagamento quadrimestral deste patrocinador?",
  ANUAL: "Voce ja recebeu o pagamento do plano anual deste patrocinador?",
};

const ALLOWED_LOGO_TYPES = ["image/jpeg", "image/png", "image/webp"];
const MAX_LOGO_SIZE = 10 * 1024 * 1024;

export default function ModalPatrocinador({ open, onClose, onSave, initial }: Props) {
  const fileLogoRef = useRef<HTMLInputElement>(null);
  const normalizeInitial = (input?: Partial<Patrocinador>) => ({
    status: "ativo" as const,
    billingPlan: input?.billingPlan ?? undefined,
    ...input,
  });
  const normalizeDateValue = (value?: string) => {
    if (!value) return "";
    if (value.includes("T")) return value.slice(0, 10);
    return value;
  };
  const [form, setForm] = useState<Partial<Patrocinador>>(normalizeInitial(initial));
  const [logoPreview, setLogoPreview] = useState<string | undefined>(form.logo);
  const [logoUploading, setLogoUploading] = useState(false);
  const [logoError, setLogoError] = useState<string | null>(null);
  const [cropImage, setCropImage] = useState<string | null>(null);
  const [firstPaymentStatus, setFirstPaymentStatus] = useState<"received" | "pending" | "">("");
  const [firstPaymentDate, setFirstPaymentDate] = useState<string>("");
  const [firstPaymentTouched, setFirstPaymentTouched] = useState(false);
  const [firstPaymentError, setFirstPaymentError] = useState<string | null>(null);
  const initialFirstPaymentStatusRef = useRef<"received" | "pending" | "">("");
  const initialFirstPaymentDateRef = useRef<string>("");
  const planValueLabel = form.billingPlan ? billingPlanValueLabels[form.billingPlan] : "";
  const shouldShowValue = Boolean(form.billingPlan);
  const shouldShowFirstPayment =
    Boolean(form.billingPlan) && form.valor !== undefined && !Number.isNaN(form.valor);
  const questionText = form.billingPlan ? billingPlanFirstPaymentQuestions[form.billingPlan] : "";

  useEffect(() => {
    if (!open) return;
    setForm(normalizeInitial(initial));
    setLogoPreview(initial?.logo);
    setLogoError(null);
    const initialReceived = normalizeDateValue(initial?.lastPaidAt);
    const initialDue = normalizeDateValue(initial?.firstDueAt || initial?.nextDueAt);
    let initialStatus: "received" | "pending" | "" = "";
    let initialDate = "";
    if (initialReceived) {
      initialStatus = "received";
      initialDate = initialReceived;
    } else if (initialDue) {
      initialStatus = "pending";
      initialDate = initialDue;
    }
    setFirstPaymentStatus(initialStatus);
    setFirstPaymentDate(initialDate);
    initialFirstPaymentStatusRef.current = initialStatus;
    initialFirstPaymentDateRef.current = initialDate;
    setFirstPaymentTouched(false);
    setFirstPaymentError(null);
  }, [initial, open]);

  useEffect(() => {
    if (!open) {
      setCropImage(null);
    }
  }, [open]);

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

  const dataUrlToFile = (dataUrl: string) => {
    const [header, base64Data] = dataUrl.split(",");
    if (!base64Data) {
      throw new Error("Imagem invalida.");
    }
    const match = header?.match(/data:(.*);base64/);
    const mime = match?.[1] || "image/png";
    const binary = atob(base64Data);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i += 1) {
      bytes[i] = binary.charCodeAt(i);
    }
    const blob = new Blob([bytes], { type: mime });
    if (blob.size > MAX_LOGO_SIZE) {
      throw new Error("Arquivo muito grande. Envie uma imagem menor para sua logo.");
    }
    const ext = mime.split("/")[1] || "png";
    return new File([blob], `logo-patrocinador-${Date.now()}.${ext}`, { type: mime });
  };

  const handleLogoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setLogoError(null);
    if (!ALLOWED_LOGO_TYPES.includes(file.type)) {
      setLogoError("Envie uma imagem JPEG, PNG ou WebP.");
      return;
    }
    if (file.size > MAX_LOGO_SIZE) {
      setLogoError("Arquivo muito grande. Envie uma imagem menor para sua logo.");
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      setCropImage(String(reader.result));
    };
    reader.onerror = () => {
      setLogoError("Falha ao ler a imagem.");
    };
    reader.readAsDataURL(file);
    if (fileLogoRef.current) {
      fileLogoRef.current.value = "";
    }
  };

  const handleCropApply = async (cropped: string) => {
    setLogoUploading(true);
    setLogoError(null);
    setLogoPreview(cropped);
    try {
      const file = dataUrlToFile(cropped);
      const uploadedUrl = await uploadLogo(file);
      if (!uploadedUrl) {
        throw new Error("URL nao retornada");
      }
      setForm((f) => ({ ...f, logo: uploadedUrl }));
      setLogoPreview(uploadedUrl);
      setCropImage(null);
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
            setFirstPaymentError(null);
            const isEdit = Boolean(form.id);
            const hasFirstPaymentChange =
              firstPaymentStatus !== initialFirstPaymentStatusRef.current ||
              firstPaymentDate !== initialFirstPaymentDateRef.current;
            const shouldValidateFirstPayment =
              !isEdit || hasFirstPaymentChange || firstPaymentTouched;
            if (shouldValidateFirstPayment) {
              if (!firstPaymentStatus) {
                setFirstPaymentError("Informe se o primeiro recebimento ja ocorreu.");
                return;
              }
              if (!firstPaymentDate) {
                setFirstPaymentError("Informe a data do primeiro recebimento.");
                return;
              }
            }
            const {
              periodoInicio,
              periodoFim,
              lastPaidAt,
              nextDueAt,
              firstDueAt,
              firstReceivedAt,
              ...payload
            } = form;
            const result: Partial<Patrocinador> = { ...payload };
            if (shouldValidateFirstPayment) {
              if (firstPaymentStatus === "received") {
                result.firstReceivedAt = firstPaymentDate;
              } else if (firstPaymentStatus === "pending") {
                result.firstDueAt = firstPaymentDate;
              }
            }
            onSave(result);
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
          {shouldShowFirstPayment && (
            <div className="rounded-lg border border-gray-700 bg-[#151515] p-3">
              <p className="text-sm font-semibold text-gray-100">Primeiro recebimento</p>
              <p className="text-xs text-gray-400 mt-1">{questionText}</p>
              <div className="mt-3 flex gap-2">
                <label
                  className={`flex-1 text-center text-xs font-semibold rounded px-2 py-2 cursor-pointer border transition ${
                    firstPaymentStatus === "received"
                      ? "bg-yellow-500 text-black border-yellow-500"
                      : "bg-[#111] text-gray-200 border-gray-600 hover:border-yellow-500"
                  }`}
                  onClick={() => {
                    setFirstPaymentTouched(true);
                    setFirstPaymentError(null);
                  }}
                >
                  <input
                    type="radio"
                    name="first-payment-status"
                    value="received"
                    className="hidden"
                    checked={firstPaymentStatus === "received"}
                    onChange={() => {
                      const today = new Date().toISOString().slice(0, 10);
                      setFirstPaymentStatus("received");
                      setFirstPaymentError(null);
                      if (!firstPaymentDate) setFirstPaymentDate(today);
                    }}
                  />
                  Ja recebi
                </label>
                <label
                  className={`flex-1 text-center text-xs font-semibold rounded px-2 py-2 cursor-pointer border transition ${
                    firstPaymentStatus === "pending"
                      ? "bg-yellow-500 text-black border-yellow-500"
                      : "bg-[#111] text-gray-200 border-gray-600 hover:border-yellow-500"
                  }`}
                  onClick={() => {
                    setFirstPaymentTouched(true);
                    setFirstPaymentError(null);
                  }}
                >
                  <input
                    type="radio"
                    name="first-payment-status"
                    value="pending"
                    className="hidden"
                    checked={firstPaymentStatus === "pending"}
                    onChange={() => {
                      const today = new Date().toISOString().slice(0, 10);
                      setFirstPaymentStatus("pending");
                      setFirstPaymentError(null);
                      if (!firstPaymentDate) setFirstPaymentDate(today);
                    }}
                  />
                  Ainda nao
                </label>
              </div>
              {firstPaymentStatus === "received" && (
                <div className="mt-3">
                  <label className="text-xs text-gray-200 font-semibold" htmlFor="first-paid-at">
                    Data do recebimento *
                  </label>
                  <input
                    id="first-paid-at"
                    type="date"
                    value={firstPaymentDate}
                    className="mt-1 w-full input input-bordered bg-[#111] border-gray-600 rounded px-3 py-2 text-white"
                    onChange={(e) => {
                      setFirstPaymentDate(e.target.value);
                      setFirstPaymentTouched(true);
                      setFirstPaymentError(null);
                    }}
                    required={!form.id}
                  />
                </div>
              )}
              {firstPaymentStatus === "pending" && (
                <div className="mt-3">
                  <label className="text-xs text-gray-200 font-semibold" htmlFor="first-due-at">
                    Data combinada para o 1o pagamento *
                  </label>
                  <input
                    id="first-due-at"
                    type="date"
                    value={firstPaymentDate}
                    className="mt-1 w-full input input-bordered bg-[#111] border-gray-600 rounded px-3 py-2 text-white"
                    onChange={(e) => {
                      setFirstPaymentDate(e.target.value);
                      setFirstPaymentTouched(true);
                      setFirstPaymentError(null);
                    }}
                    required={!form.id}
                  />
                  <p className="text-[11px] text-gray-400 mt-1">
                    O sistema so vai lancar na Prestacao de Contas quando esta data chegar.
                  </p>
                </div>
              )}
              {firstPaymentError && (
                <div className="mt-2 text-xs text-red-400">{firstPaymentError}</div>
              )}
            </div>
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
              accept="image/png,image/jpeg,image/webp"
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
      <SponsorLogoCropperModal
        open={Boolean(cropImage)}
        imageSrc={cropImage || ""}
        onCancel={() => setCropImage(null)}
        onApply={handleCropApply}
      />
    </div>
  );
}
