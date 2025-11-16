"use client";

import { useEffect, useMemo, useState } from "react";
import type { LancamentoFinanceiro, MovimentoFinanceiro } from "@/types/financeiro";
import { FINANCE_CATEGORIES } from "../constants";

type FormLancamento = Omit<LancamentoFinanceiro, "id"> & { id?: string };

type Props = {
  open: boolean;
  onClose: () => void;
  onSave?: (data: FormLancamento) => Promise<void> | void;
  initialData?: LancamentoFinanceiro | null;
  submitting?: boolean;
};

const tipoOptions: { value: MovimentoFinanceiro; label: string }[] = [
  { value: "entrada", label: "Receita" },
  { value: "saida", label: "Despesa" },
];

const emptyForm: FormLancamento = {
  id: undefined,
  tipo: "entrada",
  categoria: "",
  descricao: "",
  valor: 0,
  data: new Date().toISOString().slice(0, 10),
  responsavel: "",
  comprovanteUrl: undefined,
};

export default function ModalLancamento({
  open,
  onClose,
  onSave,
  initialData,
  submitting = false,
}: Props) {
  const [form, setForm] = useState<FormLancamento>(emptyForm);
  const [filePreview, setFilePreview] = useState<string | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [error, setError] = useState<string>("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (initialData) {
      setForm({
        ...initialData,
        id: initialData.id,
        valor: Math.abs(initialData.valor ?? 0),
      });
      setFilePreview(initialData.comprovanteUrl ?? null);
    } else {
      setForm(emptyForm);
      setFilePreview(null);
    }
    setFile(null);
    setError("");
    setSaving(false);
  }, [open, initialData]);

  useEffect(() => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      setFilePreview(event.target?.result ? String(event.target.result) : null);
    };
    reader.readAsDataURL(file);
  }, [file]);

  const categories = useMemo(() => FINANCE_CATEGORIES, []);

  const handleChange = (event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = event.target;

    if (name === "valor") {
      const parsed = Number(value);
      setForm((prev) => ({
        ...prev,
        valor: Number.isFinite(parsed) ? Math.abs(parsed) : 0,
      }));
      return;
    }

    if (name === "tipo") {
      setForm((prev) => ({
        ...prev,
        tipo: value === "saida" ? "saida" : "entrada",
      }));
      return;
    }

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleFile = (event: React.ChangeEvent<HTMLInputElement>) => {
    const nextFile = event.target.files?.[0];
    setFile(nextFile ?? null);
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!form.data || !form.categoria || !form.descricao || form.valor <= 0) {
      setError("Preencha todos os campos obrigatórios com valores válidos.");
      return;
    }

    if (!onSave) {
      onClose();
      return;
    }

    setSaving(true);
    try {
      await onSave({
        ...form,
        comprovanteUrl: filePreview ?? form.comprovanteUrl,
      });
      onClose();
    } catch (err) {
      const message = err instanceof Error ? err.message : "Falha ao salvar lançamento.";
      setError(message);
    } finally {
      setSaving(false);
    }
  };

  if (!open) {
    return null;
  }

  const isEditing = Boolean(form.id);
  const disabled = saving || submitting;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
      <form
        onSubmit={handleSubmit}
        className="bg-neutral-900 rounded-xl shadow-xl p-6 w-full max-w-md relative"
        autoComplete="off"
      >
        <h2 className="text-xl font-bold mb-2 text-yellow-500">
          {isEditing ? "Editar Lançamento" : "Novo Lançamento"}
        </h2>
        <button
          type="button"
          className="absolute top-3 right-4 text-xl text-gray-400 hover:text-yellow-500"
          onClick={onClose}
          aria-label="Fechar"
        >
          ×
        </button>

        <div className="grid grid-cols-2 gap-2 mb-2">
          <div>
            <label className="text-xs text-gray-300 font-bold mb-1 block">Data *</label>
            <input
              name="data"
              type="date"
              value={form.data}
              onChange={handleChange}
              disabled={disabled}
              className="w-full bg-neutral-800 rounded px-2 py-1 text-sm text-white border border-neutral-700"
              required
            />
          </div>
          <div>
            <label className="text-xs text-gray-300 font-bold mb-1 block">Tipo *</label>
            <select
              name="tipo"
              value={form.tipo}
              onChange={handleChange}
              disabled={disabled}
              className="w-full bg-neutral-800 rounded px-2 py-1 text-sm text-white border border-neutral-700"
              required
            >
              {tipoOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="mb-2">
          <label className="text-xs text-gray-300 font-bold mb-1 block">Categoria *</label>
          <select
            name="categoria"
            value={form.categoria}
            onChange={handleChange}
            disabled={disabled}
            className="w-full bg-neutral-800 rounded px-2 py-1 text-sm text-white border border-neutral-700"
            required
          >
            <option value="">Selecione...</option>
            {categories.map((categoria) => (
              <option key={categoria.value} value={categoria.value}>
                {categoria.label}
              </option>
            ))}
          </select>
        </div>

        <div className="mb-2">
          <label className="text-xs text-gray-300 font-bold mb-1 block">Descrição *</label>
          <input
            name="descricao"
            type="text"
            value={form.descricao ?? ""}
            onChange={handleChange}
            disabled={disabled}
            className="w-full bg-neutral-800 rounded px-2 py-1 text-sm text-white border border-neutral-700"
            maxLength={50}
            required
          />
        </div>

        <div className="mb-2">
          <label className="text-xs text-gray-300 font-bold mb-1 block">Valor (R$) *</label>
          <input
            name="valor"
            type="number"
            min="0"
            step="0.01"
            value={form.valor ? String(form.valor) : ""}
            onChange={handleChange}
            disabled={disabled}
            className="w-full bg-neutral-800 rounded px-2 py-1 text-sm text-white border border-neutral-700"
            required
          />
        </div>

        <div className="mb-2">
          <label className="text-xs text-gray-300 font-bold mb-1 block">Comprovante (imagem)</label>
          <input
            name="comprovante"
            type="file"
            accept="image/*"
            onChange={handleFile}
            disabled={disabled}
            className="w-full text-xs bg-neutral-800 rounded"
          />
          {filePreview && (
            <img
              src={filePreview}
              alt="Comprovante preview"
              className="w-16 h-16 rounded mt-1 border border-neutral-700 object-contain"
            />
          )}
        </div>

        {error && <div className="mb-2 text-red-400 text-xs">{error}</div>}

        <button
          type="submit"
          disabled={disabled}
          className="w-full mt-2 py-2 rounded bg-yellow-500 hover:bg-yellow-600 text-black font-bold text-sm transition disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {saving || submitting ? "Salvando..." : isEditing ? "Salvar Alterações" : "Adicionar"}
        </button>
      </form>
    </div>
  );
}
