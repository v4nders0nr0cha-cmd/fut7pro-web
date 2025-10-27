"use client";
import { useMemo, useRef, useState } from "react";
import type { Patrocinador as PatroFin } from "@/types/financeiro";
import Image from "next/image";
import { FaUpload, FaTimes } from "react-icons/fa";
import { normalizeAndValidateUrl } from "@/utils/url";
import { rachaConfig } from "@/config/racha.config";
import AvatarCropModal from "@/components/admin/AvatarCropModal";
import { FaInfoCircle } from "react-icons/fa";

type Tier = "basic" | "plus" | "pro";

type AdminSponsorForm = Partial<PatroFin> & {
  ramo?: string;
  sobre?: string;
  cupom?: string;
  beneficio?: string;
  displayOrder?: number;
  tier?: Tier;
  showOnFooter?: boolean;
};

interface Props {
  open: boolean;
  onClose: () => void;
  onSave: (p: Partial<PatroFin> & AdminSponsorForm) => void;
  initial?: Partial<PatroFin> & AdminSponsorForm;
}

const statusOptions = [
  { value: "ativo", label: "Ativo" },
  { value: "inativo", label: "Inativo" },
  { value: "encerrado", label: "Encerrado" },
] as const;

export default function ModalPatrocinador({ open, onClose, onSave, initial }: Props) {
  const fileLogoRef = useRef<HTMLInputElement>(null);
  const [form, setForm] = useState<AdminSponsorForm>(initial || {});
  const [logoPreview, setLogoPreview] = useState<string | undefined>(form.logo);
  const [error, setError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [step, setStep] = useState<1 | 2>(1);
  const [showCrop, setShowCrop] = useState(false);
  const [cropSrc, setCropSrc] = useState<string | null>(null);

  // Custom scrollbar dark (executa só no client)
  if (typeof window !== "undefined") {
    const id = "modal-scrollbar-dark";
    if (!document.getElementById(id)) {
      const style = document.createElement("style");
      style.id = id;
      style.innerHTML = `
        .custom-scrollbar::-webkit-scrollbar { width: 8px; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #444; border-radius: 8px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: #191919; }
      `;
      document.head.appendChild(style);
    }
  }

  const handleLogoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      setCropSrc(result);
      setShowCrop(true);
    };
    reader.readAsDataURL(file);
  };

  if (!open) return null;

  return (
    <div className="fixed z-50 inset-0 flex items-center justify-center bg-black/80 px-2">
      <div
        className="bg-[#1a1a1a] rounded-2xl p-6 max-w-md w-full shadow-xl relative overflow-y-auto max-h-screen custom-scrollbar"
        style={{ scrollbarColor: "#444 #191919", scrollbarWidth: "thin" }}
      >
        {/* Botão de fechar sempre fixo no topo direito */}
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
        <form
          className="flex flex-col gap-3"
          onSubmit={async (e) => {
            e.preventDefault();
            setError(null);
            const normalized = normalizeAndValidateUrl(form.link || undefined);
            if (form.link && !normalized) {
              setError("Link inválido. Use https:// e um domínio permitido.");
              return;
            }
            try {
              setIsSaving(true);
              await Promise.resolve(onSave({ ...form, link: normalized || undefined }));
            } finally {
              setIsSaving(false);
            }
          }}
        >
          {/* Passos do formulário */}
          <div className="flex items-center justify-center gap-2 mb-2 text-xs">
            <span className={`px-2 py-0.5 rounded-full ${step === 1 ? "bg-yellow-500 text-black" : "bg-gray-700 text-gray-200"}`}>1</span>
            <span className="text-gray-300">Dados do patrocinador</span>
            <span className="mx-2">•</span>
            <span className={`px-2 py-0.5 rounded-full ${step === 2 ? "bg-yellow-500 text-black" : "bg-gray-700 text-gray-200"}`}>2</span>
            <span className="text-gray-300">Finanças e período</span>
          </div>
          {error && (
            <div className="bg-red-900/40 text-red-200 border border-red-700 rounded px-3 py-2 text-sm">
              {error}
            </div>
          )}
          {step === 1 && (
            <>
              <label className="text-sm text-gray-200 font-semibold">Nome *</label>
              <input
                type="text"
                value={form.nome || ""}
                required
                maxLength={40}
                autoFocus
                className="input input-bordered bg-[#111] border-gray-600 rounded px-3 py-2 text-white"
                onChange={(e) => setForm((f) => ({ ...f, nome: e.target.value }))}
              />
              <label className="text-sm text-gray-200 font-semibold">Ramo (segmento)</label>
              <input
                type="text"
                value={(form as any).ramo || ""}
                maxLength={80}
                className="input input-bordered bg-[#111] border-gray-600 rounded px-3 py-2 text-white"
                onChange={(e) => setForm((f) => ({ ...f, ramo: e.target.value }))}
              />
              <label className="text-sm text-gray-200 font-semibold">Sobre (descrição curta)</label>
              <textarea
                className="input input-bordered bg-[#111] border-gray-600 rounded px-3 py-2 text-white"
                rows={2}
                value={(form as any).sobre || ""}
                onChange={(e) => setForm((f) => ({ ...f, sobre: e.target.value }))}
              />
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                <div>
                  <label className="text-sm text-gray-200 font-semibold">Nível de apoio</label>
                  <select
                    className="input input-bordered bg-[#111] border-gray-600 rounded px-3 py-2 text-white w-full"
                    value={form.tier || "basic"}
                    onChange={(e) => setForm((f) => ({ ...f, tier: e.target.value as Tier }))}
                  >
                    <option value="basic">Básico</option>
                    <option value="plus">Plus</option>
                    <option value="pro">Pro</option>
                  </select>
                </div>
                <div>
                  <label className="text-sm text-gray-200 font-semibold">Ordem de exibição</label>
                  <input
                    type="number"
                    min={1}
                    className="input input-bordered bg-[#111] border-gray-600 rounded px-3 py-2 text-white w-full"
                    value={form.displayOrder ?? 1}
                    onChange={(e) => setForm((f) => ({ ...f, displayOrder: Number(e.target.value || 1) }))}
                  />
                </div>
                <div className="flex items-end">
                  <label className="flex items-center gap-2 text-sm text-gray-200 font-semibold">
                    <input
                      type="checkbox"
                      checked={!!form.showOnFooter}
                      onChange={(e) => setForm((f) => ({ ...f, showOnFooter: e.target.checked }))}
                    />
                    Mostrar no Rodapé
                  </label>
                </div>
              </div>
              <label className="text-sm text-gray-200 font-semibold">Logo *</label>
              <div className="flex items-center gap-3">
                <input
                  type="file"
                  accept="image/*"
                  ref={fileLogoRef}
                  className="hidden"
                  onChange={handleLogoChange}
                />
                <button type="button" onClick={() => fileLogoRef.current?.click()} className="text-yellow-400 hover:text-yellow-300 flex items-center gap-1">
                  <FaUpload /> Selecionar
                </button>
                {logoPreview && (
                  <>
                    <Image src={logoPreview} alt="Logo patrocinador" width={40} height={40} className="rounded border border-gray-700 bg-[#222]" />
                    <button type="button" onClick={() => setShowCrop(true)} className="text-xs text-blue-300 hover:text-blue-200 underline">
                      Ajustar logo
                    </button>
                  </>
                )}
              </div>
              <label className="text-sm text-gray-200 font-semibold">Descrição/Observações</label>
              <textarea
                className="input input-bordered bg-[#111] border-gray-600 rounded px-3 py-2 text-white"
                rows={2}
                value={form.observacoes || ""}
                onChange={(e) => setForm((f) => ({ ...f, observacoes: e.target.value }))}
              />
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <div>
                  <label className="text-sm text-gray-200 font-semibold">Cupom (opcional)</label>
                  <input
                    type="text"
                    className="input input-bordered bg-[#111] border-gray-600 rounded px-3 py-2 text-white"
                    value={(form as any).cupom || ""}
                    onChange={(e) => setForm((f) => ({ ...f, cupom: e.target.value }))}
                  />
                </div>
                <div>
                  <label className="text-sm text-gray-200 font-semibold">Benefício (opcional)</label>
                  <input
                    type="text"
                    className="input input-bordered bg-[#111] border-gray-600 rounded px-3 py-2 text-white"
                    value={(form as any).beneficio || ""}
                    onChange={(e) => setForm((f) => ({ ...f, beneficio: e.target.value }))}
                  />
                </div>
              </div>
              <div className="flex items-center gap-2">
                <label className="text-sm text-gray-200 font-semibold">Link (opcional)</label>
                <FaInfoCircle className="text-gray-400" title="Insira aqui o link da rede social ou site do patrocinador" />
              </div>
              <input
                type="url"
                className="input input-bordered bg-[#111] border-gray-600 rounded px-3 py-2 text-white"
                value={form.link || ""}
                onChange={(e) => setForm((f) => ({ ...f, link: e.target.value }))}
              />
              <div className="flex justify-end mt-3">
                <button type="button" onClick={() => setStep(2)} className="bg-yellow-400 hover:bg-yellow-500 text-black font-bold py-2 px-6 rounded-xl">
                  Próximo passo
                </button>
              </div>
            </>
          )}

          {step === 2 && (
            <>
              <label className="text-sm text-gray-200 font-semibold">Valor do patrocínio *</label>
              <input
                type="number"
                value={form.valor || ""}
                required
                min={0}
                className="input input-bordered bg-[#111] border-gray-600 rounded px-3 py-2 text-white"
                onChange={(e) => setForm((f) => ({ ...f, valor: parseFloat(e.target.value) }))}
              />
              <div className="flex gap-2">
                <div className="flex-1">
                  <label className="text-sm text-gray-200 font-semibold">Início *</label>
                  <input
                    type="date"
                    value={form.periodoInicio || ""}
                    required
                    className="input input-bordered bg-[#111] border-gray-600 rounded px-2 py-2 text-white w-full"
                    onChange={(e) => setForm((f) => ({ ...f, periodoInicio: e.target.value }))}
                  />
                </div>
                <div className="flex-1">
                  <label className="text-sm text-gray-200 font-semibold">Fim *</label>
                  <input
                    type="date"
                    value={form.periodoFim || ""}
                    required
                    className="input input-bordered bg-[#111] border-gray-600 rounded px-2 py-2 text-white w-full"
                    onChange={(e) => setForm((f) => ({ ...f, periodoFim: e.target.value }))}
                  />
                </div>
              </div>
              {/* Status automático (somente leitura) */}
              <StatusAuto inicio={form.periodoInicio} fim={form.periodoFim} />
              <div className="flex justify-between mt-4">
                <button type="button" onClick={() => setStep(1)} className="bg-gray-700 hover:bg-gray-600 text-white font-semibold py-2 px-4 rounded-xl" disabled={isSaving}>
                  Voltar
                </button>
                <button type="submit" className="bg-yellow-400 hover:bg-yellow-500 text-black font-bold py-2 px-6 rounded-xl disabled:opacity-60" disabled={isSaving}>
                  {isSaving ? "Salvando..." : "Salvar"}
                </button>
              </div>
            </>
          )}
        </form>
      </div>
      {showCrop && cropSrc && (
        <AvatarCropModal
          imageSrc={cropSrc}
          open={showCrop}
          onClose={() => setShowCrop(false)}
          onConfirm={async (base64) => {
            try {
              // envia a imagem recortada para o backend de upload
              const blob = await (await fetch(base64)).blob();
              const data = new FormData();
              data.append("file", new File([blob], "logo.jpg", { type: blob.type || "image/jpeg" }));
              data.append("slug", rachaConfig.slug);
              // usa rota genérica
              data.append("kind", "sponsorLogo");
              const resp = await fetch("/api/upload", { method: "POST", body: data });
              const json = await resp.json();
              if (!resp.ok || !json?.url) throw new Error(json?.error || "Falha no upload");
              setLogoPreview(json.url as string);
              setForm((f) => ({ ...f, logo: json.url as string }));
            } catch (err: any) {
              setError(err?.message || "Falha ao ajustar/enviar logo");
            } finally {
              setShowCrop(false);
              setCropSrc(null);
            }
          }}
        />
      )}
    </div>
  );
}

function StatusAuto({ inicio, fim }: { inicio?: string; fim?: string }) {
  const status = useMemo(() => {
    if (!inicio || !fim) return null;
    const now = new Date();
    const s = new Date(inicio);
    const e = new Date(fim);
    if (e.getTime() < now.getTime()) return { label: "Expirado", color: "bg-red-900/40 border-red-700 text-red-200" };
    if (s.getTime() > now.getTime()) {
      const days = Math.ceil((s.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
      if (days <= 30) return { label: "Em breve", color: "bg-blue-900/40 border-blue-700 text-blue-200" };
      return { label: "Em breve", color: "bg-blue-900/40 border-blue-700 text-blue-200" };
    }
    return { label: "Ativo", color: "bg-green-900/40 border-green-700 text-green-200" };
  }, [inicio, fim]);

  if (!status) return null;
  return (
    <div className={`text-xs font-bold px-3 py-2 rounded border ${status.color}`}>Status (automático): {status.label}</div>
  );
}
