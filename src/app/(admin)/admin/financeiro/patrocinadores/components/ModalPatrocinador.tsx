"use client";

import { useEffect, useMemo, useState } from "react";
import type { Patrocinador, PatrocinadorPayload, SponsorTier } from "@/types/patrocinador";
import { FaTimes } from "react-icons/fa";

interface Props {
  open: boolean;
  onClose: () => void;
  onSave: (payload: PatrocinadorPayload, id?: string) => Promise<void> | void;
  initial?: Patrocinador | null;
  submitting?: boolean;
}

type FormState = {
  id?: string;
  name: string;
  logoUrl: string;
  link: string;
  value: string;
  periodStart: string;
  periodEnd: string;
  tier: SponsorTier;
  displayOrder: number;
  showOnFooter: boolean;
  ramo: string;
  about: string;
  coupon: string;
  benefit: string;
};

const EMPTY_FORM: FormState = {
  name: "",
  logoUrl: "",
  link: "",
  value: "",
  periodStart: "",
  periodEnd: "",
  tier: "BASIC",
  displayOrder: 1,
  showOnFooter: true,
  ramo: "",
  about: "",
  coupon: "",
  benefit: "",
};

const tierOptions: SponsorTier[] = ["BASIC", "PLUS", "PRO"];

export default function ModalPatrocinador({
  open,
  onClose,
  onSave,
  initial = null,
  submitting = false,
}: Props) {
  const [form, setForm] = useState<FormState>(EMPTY_FORM);

  useEffect(() => {
    if (!open) return;
    if (initial) {
      setForm({
        id: initial.id,
        name: initial.name ?? "",
        logoUrl: initial.logoUrl ?? "",
        link: initial.link ?? "",
        value:
          typeof initial.value === "number" && !Number.isNaN(initial.value)
            ? String(initial.value)
            : "",
        periodStart: initial.periodStart?.slice(0, 10) ?? "",
        periodEnd: initial.periodEnd?.slice(0, 10) ?? "",
        tier: initial.tier ?? "BASIC",
        displayOrder: initial.displayOrder ?? 1,
        showOnFooter: Boolean(initial.showOnFooter),
        ramo: initial.ramo ?? "",
        about: initial.about ?? "",
        coupon: initial.coupon ?? "",
        benefit: initial.benefit ?? "",
      });
    } else {
      setForm(EMPTY_FORM);
    }
  }, [initial, open]);

  const isEdit = useMemo(() => Boolean(form.id), [form.id]);

  if (!open) return null;

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const valueNumber =
      form.value.trim().length > 0 ? Number(form.value.replace(",", ".")) : undefined;

    const payload: PatrocinadorPayload = {
      name: form.name.trim(),
      logoUrl: form.logoUrl.trim(),
      link: form.link.trim() || undefined,
      value:
        typeof valueNumber === "number" && !Number.isNaN(valueNumber) ? valueNumber : undefined,
      periodStart: form.periodStart || undefined,
      periodEnd: form.periodEnd || undefined,
      tier: form.tier,
      displayOrder: Number.isNaN(form.displayOrder) ? 1 : form.displayOrder,
      showOnFooter: form.showOnFooter,
      ramo: form.ramo.trim() || undefined,
      about: form.about.trim() || undefined,
      coupon: form.coupon.trim() || undefined,
      benefit: form.benefit.trim() || undefined,
    };

    await onSave(payload, form.id);
  };

  return (
    <div className="fixed z-50 inset-0 flex items-center justify-center bg-black/80 px-2">
      <div className="bg-[#1a1a1a] rounded-2xl p-6 max-w-xl w-full shadow-xl relative overflow-y-auto max-h-screen">
        <button
          className="absolute top-2 right-2 text-gray-400 hover:text-red-400"
          onClick={onClose}
          type="button"
          aria-label="Fechar modal"
          disabled={submitting}
        >
          <FaTimes size={22} />
        </button>

        <h2 className="text-xl font-bold text-yellow-400 mb-4 pr-8">
          {isEdit ? "Editar Patrocinador" : "Novo Patrocinador"}
        </h2>

        <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <label className="flex flex-col gap-1 text-sm text-gray-200 font-semibold">
              Nome *
              <input
                type="text"
                value={form.name}
                required
                maxLength={80}
                className="input input-bordered bg-[#111] border-gray-600 rounded px-3 py-2 text-white"
                onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))}
              />
            </label>
            <label className="flex flex-col gap-1 text-sm text-gray-200 font-semibold">
              Tier *
              <select
                value={form.tier}
                className="input input-bordered bg-[#111] border-gray-600 rounded px-3 py-2 text-white"
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, tier: e.target.value as SponsorTier }))
                }
              >
                {tierOptions.map((tier) => (
                  <option key={tier} value={tier}>
                    {tier}
                  </option>
                ))}
              </select>
            </label>
          </div>

          <label className="flex flex-col gap-1 text-sm text-gray-200 font-semibold">
            URL da logo (https://) *
            <input
              type="url"
              value={form.logoUrl}
              required
              className="input input-bordered bg-[#111] border-gray-600 rounded px-3 py-2 text-white"
              onChange={(e) => setForm((prev) => ({ ...prev, logoUrl: e.target.value }))}
            />
          </label>

          <label className="flex flex-col gap-1 text-sm text-gray-200 font-semibold">
            Link do patrocinador
            <input
              type="url"
              value={form.link}
              placeholder="https://"
              className="input input-bordered bg-[#111] border-gray-600 rounded px-3 py-2 text-white"
              onChange={(e) => setForm((prev) => ({ ...prev, link: e.target.value }))}
            />
          </label>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <label className="flex flex-col gap-1 text-sm text-gray-200 font-semibold">
              Valor mensal (R$)
              <input
                type="number"
                min="0"
                step="0.01"
                value={form.value}
                className="input input-bordered bg-[#111] border-gray-600 rounded px-3 py-2 text-white"
                onChange={(e) => setForm((prev) => ({ ...prev, value: e.target.value }))}
              />
            </label>
            <label className="flex flex-col gap-1 text-sm text-gray-200 font-semibold">
              Início
              <input
                type="date"
                value={form.periodStart}
                className="input input-bordered bg-[#111] border-gray-600 rounded px-3 py-2 text-white"
                onChange={(e) => setForm((prev) => ({ ...prev, periodStart: e.target.value }))}
              />
            </label>
            <label className="flex flex-col gap-1 text-sm text-gray-200 font-semibold">
              Fim
              <input
                type="date"
                value={form.periodEnd}
                className="input input-bordered bg-[#111] border-gray-600 rounded px-3 py-2 text-white"
                onChange={(e) => setForm((prev) => ({ ...prev, periodEnd: e.target.value }))}
              />
            </label>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <label className="flex flex-col gap-1 text-sm text-gray-200 font-semibold">
              Ramo / segmento
              <input
                type="text"
                value={form.ramo}
                maxLength={80}
                className="input input-bordered bg-[#111] border-gray-600 rounded px-3 py-2 text-white"
                onChange={(e) => setForm((prev) => ({ ...prev, ramo: e.target.value }))}
              />
            </label>
            <label className="flex flex-col gap-1 text-sm text-gray-200 font-semibold">
              Cupom / código
              <input
                type="text"
                value={form.coupon}
                maxLength={40}
                className="input input-bordered bg-[#111] border-gray-600 rounded px-3 py-2 text-white"
                onChange={(e) => setForm((prev) => ({ ...prev, coupon: e.target.value }))}
              />
            </label>
          </div>

          <label className="flex flex-col gap-1 text-sm text-gray-200 font-semibold">
            Benefício oferecido
            <input
              type="text"
              value={form.benefit}
              maxLength={120}
              className="input input-bordered bg-[#111] border-gray-600 rounded px-3 py-2 text-white"
              onChange={(e) => setForm((prev) => ({ ...prev, benefit: e.target.value }))}
            />
          </label>

          <label className="flex flex-col gap-1 text-sm text-gray-200 font-semibold">
            Descrição
            <textarea
              value={form.about}
              maxLength={280}
              rows={3}
              className="input input-bordered bg-[#111] border-gray-600 rounded px-3 py-2 text-white"
              onChange={(e) => setForm((prev) => ({ ...prev, about: e.target.value }))}
            />
          </label>

          <div className="flex flex-wrap items-center gap-4">
            <label className="flex items-center gap-2 text-sm text-gray-200 font-semibold">
              <input
                type="checkbox"
                checked={form.showOnFooter}
                onChange={(e) => setForm((prev) => ({ ...prev, showOnFooter: e.target.checked }))}
                className="h-4 w-4 accent-yellow-400"
              />
              Exibir no rodapé e página pública
            </label>
            <label className="flex items-center gap-2 text-sm text-gray-200 font-semibold">
              Ordem de exibição
              <input
                type="number"
                min={1}
                max={99}
                value={form.displayOrder}
                className="w-20 input input-bordered bg-[#111] border-gray-600 rounded px-3 py-2 text-white"
                onChange={(e) =>
                  setForm((prev) => ({
                    ...prev,
                    displayOrder: Number(e.target.value) || 1,
                  }))
                }
              />
            </label>
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <button
              type="button"
              className="btn-secondary px-5 py-2 rounded-xl border border-gray-600 text-gray-200 hover:bg-gray-700 transition"
              onClick={onClose}
              disabled={submitting}
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="bg-yellow-400 hover:bg-yellow-500 text-black font-bold py-2 px-6 rounded-xl disabled:opacity-50"
              disabled={submitting}
            >
              {submitting ? "Salvando..." : "Salvar"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
