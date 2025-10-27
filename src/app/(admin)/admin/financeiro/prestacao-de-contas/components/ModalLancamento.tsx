"use client";
import Image from "next/image";
import { useState, useEffect } from "react";
import type { Lancamento } from "../mocks/mockLancamentosFinanceiro";

type Props = {
  open: boolean;
  onClose: () => void;
  onSave?: (data: Lancamento) => void;
  initialData?: Lancamento | null;
};

const categoriasMock = ["Campo", "Material", "Diárias", "Multa", "Premiação", "Evento", "Outros"];

export default function ModalLancamento({ open, onClose, onSave, initialData }: Props) {
  const isEdit = !!initialData;
  const [form, setForm] = useState<Lancamento>({
    id: initialData?.id || "",
    data: initialData?.data || new Date().toISOString().slice(0, 10),
    tipo: initialData?.tipo || "Receita",
    categoria: initialData?.categoria || "",
    descricao: initialData?.descricao || "",
    valor: initialData?.valor || 0,
    comprovante: initialData?.comprovante || "",
  });
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(initialData?.comprovante || null);
  const [error, setError] = useState<string>("");

  useEffect(() => {
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => setPreview(String(e.target?.result));
      reader.readAsDataURL(file);
    }
  }, [file]);

  useEffect(() => {
    if (initialData) {
      setForm(initialData);
      setPreview(initialData.comprovante || null);
    } else {
      setForm({
        id: "",
        data: new Date().toISOString().slice(0, 10),
        tipo: "Receita",
        categoria: "",
        descricao: "",
        valor: 0,
        comprovante: "",
      });
      setPreview(null);
    }
    setFile(null);
    setError("");
  }, [open, initialData]);

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) {
    const { name, value } = e.target;
    // Campo valor: remove zeros à esquerda
    if (name === "valor") {
      let valLimpo = value.replace(/^0+(?=\d)/, "");
      setForm((f) => ({
        ...f,
        valor: valLimpo === "" ? 0 : Number(valLimpo),
      }));
    } else {
      setForm((f) => ({
        ...f,
        [name]: value,
      }));
    }
  }

  function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    setFile(file || null);
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.data || !form.categoria || !form.descricao || !form.valor || isNaN(form.valor)) {
      setError("Preencha todos os campos obrigatórios.");
      return;
    }
    if (form.valor === 0) {
      setError("O valor não pode ser zero.");
      return;
    }
    let comprovanteFinal = form.comprovante;
    if (file && preview) comprovanteFinal = preview;
    if (onSave) {
      onSave({
        ...form,
        id: form.id || Math.random().toString(36).substring(2, 9),
        comprovante: comprovanteFinal,
      });
    }
    onClose();
  }

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <form
        onSubmit={handleSubmit}
        className="bg-neutral-900 rounded-xl shadow-xl p-6 w-full max-w-md relative"
        style={{ minWidth: 320 }}
        autoComplete="off"
      >
        <h2 className="text-xl font-bold mb-2 text-yellow-500">
          {isEdit ? "Editar Lançamento" : "Novo Lançamento"}
        </h2>
        <button
          type="button"
          className="absolute top-2 right-3 text-xl text-gray-400 hover:text-yellow-500"
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
              className="w-full bg-neutral-800 rounded px-2 py-1 text-sm text-white outline-yellow-500 border border-neutral-700"
              required
            />
          </div>
          <div>
            <label className="text-xs text-gray-300 font-bold mb-1 block">Tipo *</label>
            <select
              name="tipo"
              value={form.tipo}
              onChange={handleChange}
              className="w-full bg-neutral-800 rounded px-2 py-1 text-sm text-white outline-yellow-500 border border-neutral-700"
              required
            >
              <option value="Receita">Receita</option>
              <option value="Despesa">Despesa</option>
            </select>
          </div>
        </div>
        <div className="mb-2">
          <label className="text-xs text-gray-300 font-bold mb-1 block">Categoria *</label>
          <select
            name="categoria"
            value={form.categoria}
            onChange={handleChange}
            className="w-full bg-neutral-800 rounded px-2 py-1 text-sm text-white outline-yellow-500 border border-neutral-700"
            required
          >
            <option value="">Selecione...</option>
            {categoriasMock.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
        </div>
        <div className="mb-2">
          <label className="text-xs text-gray-300 font-bold mb-1 block">Descrição *</label>
          <input
            name="descricao"
            type="text"
            value={form.descricao}
            onChange={handleChange}
            className="w-full bg-neutral-800 rounded px-2 py-1 text-sm text-white outline-yellow-500 border border-neutral-700"
            maxLength={50}
            required
          />
        </div>
        <div className="mb-2">
          <label className="text-xs text-gray-300 font-bold mb-1 block">Valor (R$) *</label>
          <input
            name="valor"
            type="number"
            step="0.01"
            inputMode="decimal"
            placeholder="Ex: 120.00"
            value={form.valor === 0 ? "" : form.valor}
            onChange={handleChange}
            className="w-full bg-neutral-800 rounded px-2 py-1 text-sm text-white text-left outline-yellow-500 border border-neutral-700"
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
            className="w-full text-xs bg-neutral-800 rounded"
          />
          {preview && (
            <Image
              src={preview}
              alt="Comprovante preview"
              className="w-16 h-16 rounded mt-1 border border-neutral-700 object-contain"
            />
          )}
        </div>
        {error && <div className="mb-2 text-red-400 text-xs">{error}</div>}
        <button
          type="submit"
          className="w-full mt-2 py-2 rounded bg-yellow-500 hover:bg-yellow-600 text-black font-bold text-sm transition"
        >
          {isEdit ? "Salvar Alterações" : "Adicionar Lançamento"}
        </button>
      </form>
    </div>
  );
}
