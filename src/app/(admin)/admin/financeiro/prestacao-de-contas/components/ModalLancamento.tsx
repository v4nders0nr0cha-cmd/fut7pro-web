"use client";
import { useEffect, useMemo, useRef, useState } from "react";
import type { LancamentoFinanceiro } from "@/types/financeiro";
import {
  CATEGORIAS_DESPESA,
  CATEGORIAS_RECEITA,
  NORMALIZE_CATEGORIA_OUTROS,
} from "../financeiroCategorias";

type Props = {
  open: boolean;
  onClose: () => void;
  onSave?: (data: LancamentoFinanceiro) => void | Promise<void>;
  initialData?: LancamentoFinanceiro | null;
  serverError?: string | null;
  isSaving?: boolean;
  categorias?: string[];
};

type PreviewInfo = {
  url: string;
  label: string;
  kind: "image" | "pdf" | "file";
};

const formatCurrencyValue = (value: number) =>
  new Intl.NumberFormat("pt-BR", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);

const parseCurrencyInput = (value: string) => {
  const digits = value.replace(/\D/g, "");
  const numeric = digits ? Number(digits) / 100 : 0;
  return Number.isNaN(numeric) ? 0 : numeric;
};

const resolvePreviewKind = (url: string) => {
  const normalized = url.toLowerCase();
  if (normalized.includes("application/pdf") || normalized.endsWith(".pdf")) return "pdf";
  if (normalized.startsWith("data:image") || /\.(png|jpe?g|webp|gif|svg)$/.test(normalized)) {
    return "image";
  }
  return "file";
};

const buildCategoriasList = (tipo: string, extras: string[]) => {
  const base = tipo === "saida" ? CATEGORIAS_DESPESA : CATEGORIAS_RECEITA;
  const baseSemOutros = base.filter((item) => item !== NORMALIZE_CATEGORIA_OUTROS);
  const adicionais = extras
    .map((item) => item.trim())
    .filter((item) => item && !baseSemOutros.includes(item) && item !== NORMALIZE_CATEGORIA_OUTROS)
    .sort((a, b) => a.localeCompare(b));

  return [...baseSemOutros, ...adicionais, NORMALIZE_CATEGORIA_OUTROS];
};

export default function ModalLancamento({
  open,
  onClose,
  onSave,
  initialData,
  serverError,
  isSaving,
  categorias,
}: Props) {
  const isEdit = !!initialData;
  const categoriasDisponiveis = useMemo(
    () => (Array.isArray(categorias) ? categorias : []),
    [categorias]
  );
  const [form, setForm] = useState<LancamentoFinanceiro>({
    id: initialData?.id || "",
    data: initialData?.data || new Date().toISOString().slice(0, 10),
    tipo: initialData?.tipo || "entrada",
    categoria: initialData?.categoria || "",
    descricao: initialData?.descricao || "",
    valor: Math.abs(initialData?.valor || 0),
    comprovanteUrl: initialData?.comprovanteUrl || "",
    responsavel: initialData?.responsavel || "Admin",
    observacoes: initialData?.observacoes || "",
  });
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<PreviewInfo | null>(
    initialData?.comprovanteUrl
      ? {
          url: initialData.comprovanteUrl,
          label: "Comprovante atual",
          kind: resolvePreviewKind(initialData.comprovanteUrl),
        }
      : null
  );
  const [valorTexto, setValorTexto] = useState(
    initialData?.valor ? formatCurrencyValue(Math.abs(initialData.valor)) : ""
  );
  const [error, setError] = useState<string>("");
  const [categoriaSelecionada, setCategoriaSelecionada] = useState<string>("");
  const [categoriaCustom, setCategoriaCustom] = useState<string>("");
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const categoriasOpcoes = useMemo(
    () => buildCategoriasList(form.tipo, categoriasDisponiveis),
    [form.tipo, categoriasDisponiveis]
  );

  useEffect(() => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      const url = String(e.target?.result);
      const kind =
        file.type === "application/pdf" ? "pdf" : file.type.startsWith("image/") ? "image" : "file";
      setPreview({ url, label: file.name, kind });
    };
    reader.readAsDataURL(file);
  }, [file]);

  useEffect(() => {
    if (initialData) {
      const tipoInicial = initialData.tipo || "entrada";
      const valorInicial = Math.abs(initialData.valor || 0);
      setForm({
        ...initialData,
        tipo: tipoInicial,
        valor: valorInicial,
        responsavel: initialData.responsavel || "Admin",
        observacoes: initialData.observacoes || "",
      });
      setValorTexto(valorInicial ? formatCurrencyValue(valorInicial) : "");
      setPreview(
        initialData.comprovanteUrl
          ? {
              url: initialData.comprovanteUrl,
              label: "Comprovante atual",
              kind: resolvePreviewKind(initialData.comprovanteUrl),
            }
          : null
      );
      const lista = buildCategoriasList(tipoInicial, categoriasDisponiveis);
      const categoriaInicial = (initialData.categoria || "").trim();
      if (categoriaInicial && lista.includes(categoriaInicial)) {
        setCategoriaSelecionada(categoriaInicial);
        setCategoriaCustom("");
      } else if (categoriaInicial) {
        setCategoriaSelecionada(NORMALIZE_CATEGORIA_OUTROS);
        setCategoriaCustom(categoriaInicial);
      } else {
        setCategoriaSelecionada("");
        setCategoriaCustom("");
      }
    } else {
      setForm({
        id: "",
        data: new Date().toISOString().slice(0, 10),
        tipo: "entrada",
        categoria: "",
        descricao: "",
        valor: 0,
        comprovanteUrl: "",
        responsavel: "Admin",
        observacoes: "",
      });
      setPreview(null);
      setCategoriaSelecionada("");
      setCategoriaCustom("");
      setValorTexto("");
    }
    setFile(null);
    setError("");
  }, [open, initialData, categoriasDisponiveis]);

  useEffect(() => {
    if (serverError) {
      setError(serverError);
    }
  }, [serverError]);

  useEffect(() => {
    if (!form.categoria) {
      setCategoriaSelecionada("");
      setCategoriaCustom("");
      return;
    }
    if (categoriasOpcoes.includes(form.categoria)) {
      setCategoriaSelecionada(form.categoria);
      setCategoriaCustom("");
      return;
    }
    setCategoriaSelecionada(NORMALIZE_CATEGORIA_OUTROS);
    setCategoriaCustom(form.categoria);
  }, [form.categoria, categoriasOpcoes]);

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) {
    const { name, value } = e.target;
    setForm((f) => ({
      ...f,
      [name]: value,
    }));
  }

  function handleCategoriaChange(e: React.ChangeEvent<HTMLSelectElement>) {
    const value = e.target.value;
    setCategoriaSelecionada(value);
    if (value === NORMALIZE_CATEGORIA_OUTROS) {
      setCategoriaCustom("");
      setForm((f) => ({ ...f, categoria: "" }));
      return;
    }
    setCategoriaCustom("");
    setForm((f) => ({ ...f, categoria: value }));
  }

  function handleCategoriaCustomChange(e: React.ChangeEvent<HTMLInputElement>) {
    const value = e.target.value;
    setCategoriaCustom(value);
    setForm((f) => ({ ...f, categoria: value }));
  }

  function handleValorChange(e: React.ChangeEvent<HTMLInputElement>) {
    const numeric = parseCurrencyInput(e.target.value);
    setForm((f) => ({
      ...f,
      valor: numeric,
    }));
    setValorTexto(numeric ? formatCurrencyValue(numeric) : "");
  }

  function handleFile(fileSelecionado?: File | null) {
    setFile(fileSelecionado || null);
    if (!fileSelecionado) {
      setPreview(null);
      setForm((f) => ({ ...f, comprovanteUrl: "" }));
    }
  }

  function handleFileInput(e: React.ChangeEvent<HTMLInputElement>) {
    handleFile(e.target.files?.[0] || null);
  }

  function handleDrop(e: React.DragEvent<HTMLDivElement>) {
    e.preventDefault();
    setDragActive(false);
    handleFile(e.dataTransfer.files?.[0] || null);
  }

  function handleDragOver(e: React.DragEvent<HTMLDivElement>) {
    e.preventDefault();
    setDragActive(true);
  }

  function handleDragLeave() {
    setDragActive(false);
  }

  function handleSelectFile() {
    fileInputRef.current?.click();
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const categoriaValida = form.categoria?.trim();
    const descricaoValida = form.descricao?.trim();
    if (!form.data || !categoriaValida || !descricaoValida || !form.valor || isNaN(form.valor)) {
      setError("Preencha todos os campos obrigatorios.");
      return;
    }
    if (categoriaSelecionada === NORMALIZE_CATEGORIA_OUTROS && !categoriaValida) {
      setError("Informe a categoria para a opcao Outros.");
      return;
    }
    if (form.valor === 0) {
      setError("O valor nao pode ser zero.");
      return;
    }
    let comprovanteFinal = form.comprovanteUrl;
    if (file && preview) comprovanteFinal = preview.url;

    try {
      if (onSave) {
        await onSave({
          ...form,
          id: form.id || Math.random().toString(36).substring(2, 9),
          comprovanteUrl: comprovanteFinal,
          observacoes: form.observacoes?.trim() || "",
          responsavel: form.responsavel || "Admin",
          tipo: form.tipo === "saida" ? "saida" : "entrada",
          valor: form.tipo === "saida" ? -Math.abs(form.valor) : Math.abs(form.valor),
        });
      }
      onClose();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Nao foi possivel salvar.";
      setError(message);
    }
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
          {isEdit ? "Editar Lancamento" : "Novo Lancamento"}
        </h2>
        <button
          type="button"
          className="absolute top-2 right-3 text-xl text-gray-400 hover:text-yellow-500"
          onClick={onClose}
          aria-label="Fechar"
        >
          x
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
              <option value="entrada">Receita</option>
              <option value="saida">Despesa</option>
            </select>
          </div>
        </div>
        <div className="mb-2">
          <label className="text-xs text-gray-300 font-bold mb-1 block">Categoria *</label>
          <select
            name="categoria"
            value={categoriaSelecionada}
            onChange={handleCategoriaChange}
            className="w-full bg-neutral-800 rounded px-2 py-1 text-sm text-white outline-yellow-500 border border-neutral-700"
            required
          >
            <option value="">Selecione</option>
            {categoriasOpcoes.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
          {categoriaSelecionada === NORMALIZE_CATEGORIA_OUTROS && (
            <input
              name="categoriaCustom"
              value={categoriaCustom}
              onChange={handleCategoriaCustomChange}
              className="mt-2 w-full bg-neutral-800 rounded px-2 py-1 text-sm text-white outline-yellow-500 border border-neutral-700"
              placeholder="Especificar categoria"
              required
            />
          )}
        </div>
        <div className="mb-2">
          <label className="text-xs text-gray-300 font-bold mb-1 block">Descricao *</label>
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
          <label className="text-xs text-gray-300 font-bold mb-1 block">
            Observacao (opcional)
          </label>
          <input
            name="observacoes"
            type="text"
            value={form.observacoes ?? ""}
            onChange={handleChange}
            className="w-full bg-neutral-800 rounded px-2 py-1 text-sm text-white outline-yellow-500 border border-neutral-700"
            maxLength={80}
            placeholder="Ex: pagamento adiantado, ajuste combinado"
          />
        </div>
        <div className="mb-2">
          <label className="text-xs text-gray-300 font-bold mb-1 block">Valor (R$) *</label>
          <input
            name="valor"
            type="text"
            inputMode="decimal"
            placeholder="0,00"
            value={valorTexto}
            onChange={handleValorChange}
            className="w-full bg-neutral-800 rounded px-2 py-1 text-sm text-white text-left outline-yellow-500 border border-neutral-700"
            required
          />
        </div>
        <div className="mb-2">
          <label className="text-xs text-gray-300 font-bold mb-1 block">
            Comprovante (opcional)
          </label>
          <div
            className={`w-full border-2 border-dashed rounded-lg px-3 py-3 text-xs text-gray-300 cursor-pointer transition ${
              dragActive
                ? "border-yellow-500 bg-neutral-800/80"
                : "border-neutral-700 bg-neutral-800"
            }`}
            onClick={handleSelectFile}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            role="button"
            tabIndex={0}
          >
            <input
              ref={fileInputRef}
              name="comprovante"
              type="file"
              accept="image/*,application/pdf"
              onChange={handleFileInput}
              className="hidden"
            />
            <div className="font-semibold text-gray-200">
              Arraste o arquivo ou clique para enviar
            </div>
            <div className="text-gray-400">Imagens ou PDF</div>
          </div>
          {preview && (
            <div className="mt-2 flex items-center gap-3 bg-neutral-800 border border-neutral-700 rounded p-2">
              {preview.kind === "image" ? (
                <img
                  src={preview.url}
                  alt="Comprovante preview"
                  className="w-16 h-16 rounded border border-neutral-700 object-contain"
                />
              ) : (
                <a
                  href={preview.url}
                  target="_blank"
                  rel="noreferrer"
                  className="text-yellow-400 text-xs font-bold underline"
                >
                  {preview.kind === "pdf" ? "Visualizar PDF" : "Abrir arquivo"}
                </a>
              )}
              <div className="flex-1 text-xs text-gray-300 truncate">{preview.label}</div>
              <button
                type="button"
                className="text-xs text-red-400 hover:underline"
                onClick={(e) => {
                  e.stopPropagation();
                  handleFile(null);
                  setPreview(null);
                }}
              >
                Remover
              </button>
            </div>
          )}
        </div>
        {error && <div className="mb-2 text-red-400 text-xs">{error}</div>}
        <button
          type="submit"
          className="w-full mt-2 py-2 rounded bg-yellow-500 hover:bg-yellow-600 text-black font-bold text-sm transition disabled:opacity-60"
          disabled={isSaving}
        >
          {isEdit ? "Salvar Alteracoes" : "Adicionar Lancamento"}
        </button>
      </form>
    </div>
  );
}
