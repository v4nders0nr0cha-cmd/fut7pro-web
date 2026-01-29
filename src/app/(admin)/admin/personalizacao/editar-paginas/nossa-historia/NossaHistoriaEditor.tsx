"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { ReactNode } from "react";
import Image from "next/image";
import { CheckCircle2, AlertTriangle, Plus, ArrowUp, ArrowDown, ExternalLink } from "lucide-react";
import { useAboutAdmin } from "@/hooks/useAbout";
import { usePublicLinks } from "@/hooks/usePublicLinks";
import { useRachaPublic } from "@/hooks/useRachaPublic";
import { DEFAULT_NOSSA_HISTORIA, nossaHistoriaSchema } from "@/utils/schemas/nossaHistoria.schema";
import type {
  NossaHistoriaData,
  NossaHistoriaMarco,
  NossaHistoriaCuriosidade,
  NossaHistoriaDepoimento,
  NossaHistoriaCategoriaFotos,
  NossaHistoriaFoto,
  NossaHistoriaVideo,
  NossaHistoriaCampo,
} from "@/types/paginasInstitucionais";
import type { AboutData } from "@/types/about";

const inputClass =
  "w-full rounded-lg bg-[#101218] border border-[#2a2d36] px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-brand";
const textareaClass =
  "w-full rounded-lg bg-[#101218] border border-[#2a2d36] px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-brand";
const labelClass = "text-sm text-gray-200 font-semibold";
const sectionClass = "bg-[#191c22] rounded-2xl p-6 shadow-lg flex flex-col gap-4";
const buttonPrimary =
  "bg-brand text-black px-4 py-2 rounded-lg font-semibold transition hover:bg-brand-soft disabled:opacity-60 disabled:cursor-not-allowed";
const buttonSecondary =
  "border border-brand text-brand px-4 py-2 rounded-lg font-semibold transition hover:bg-brand hover:text-black";
const buttonGhost =
  "border border-transparent text-sm text-gray-300 hover:text-white hover:border-gray-600 px-2 py-1 rounded";

const MAX_UPLOAD_SIZE = 10 * 1024 * 1024;
const ALLOWED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp"];
const DEFAULT_RACHA_NAME = "seu racha";
const DEFAULT_PRESIDENTE_NAME = "o presidente do racha";
const DESCRICAO_TEMPLATE =
  "O racha {nomeDoRacha} nasceu da amizade e da paixão pelo futebol entre amigos. Fundado por {nomePresidente}, começou como uma pelada de rotina e, com o tempo, virou tradição, união e resenha. Nossa história é feita de gols, rivalidade saudável e momentos inesquecíveis, sempre com respeito, espírito esportivo e aquele clima de time fechado.";
const LEGACY_ANO_REGEX = /^ano\s*\d+/i;

function isLegacyMarcos(marcos?: NossaHistoriaMarco[] | null) {
  if (!marcos || marcos.length === 0) return false;
  return marcos.every((marco) => LEGACY_ANO_REGEX.test((marco.ano ?? "").trim()));
}

function sanitizeText(value?: string) {
  if (!value) return "";
  return value.replace(/<[^>]*>/g, "").trim();
}

function sanitizeUrl(value?: string) {
  if (!value) return "";
  return value.trim();
}

function extractYouTubeId(url: string) {
  const normalized = url.trim();
  if (!normalized) return null;
  const match =
    normalized.match(/v=([a-zA-Z0-9_-]{6,})/) ||
    normalized.match(/youtu\.be\/([a-zA-Z0-9_-]{6,})/) ||
    normalized.match(/embed\/([a-zA-Z0-9_-]{6,})/);
  return match?.[1] || null;
}

function normalizeYouTubeUrl(url: string) {
  const id = extractYouTubeId(url);
  if (!id) return url;
  return `https://www.youtube.com/embed/${id}`;
}

function youtubeThumb(url: string) {
  const id = extractYouTubeId(url);
  if (!id) return null;
  return `https://img.youtube.com/vi/${id}/hqdefault.jpg`;
}

function moveItem<T>(items: T[], index: number, direction: -1 | 1) {
  const next = [...items];
  const target = index + direction;
  if (target < 0 || target >= next.length) return next;
  const temp = next[target];
  next[target] = next[index];
  next[index] = temp;
  return next;
}

function buildDescricaoPadrao(nomeDoRacha: string, nomePresidente: string) {
  return DESCRICAO_TEMPLATE.replace("{nomeDoRacha}", nomeDoRacha).replace(
    "{nomePresidente}",
    nomePresidente
  );
}

type FeedbackModalProps = {
  open: boolean;
  onClose: () => void;
  title: string;
  subtitle: string;
  actions: ReactNode;
  tone?: "success" | "error";
};

function FeedbackModal({
  open,
  onClose,
  title,
  subtitle,
  actions,
  tone = "success",
}: FeedbackModalProps) {
  const okRef = useRef<HTMLButtonElement | null>(null);
  const lastBodyOverflow = useRef<string | null>(null);

  useEffect(() => {
    if (!open) return;
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [open, onClose]);

  useEffect(() => {
    if (!open) return;
    lastBodyOverflow.current = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = lastBodyOverflow.current ?? "";
    };
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const id = window.setTimeout(() => okRef.current?.focus(), 0);
    return () => window.clearTimeout(id);
  }, [open]);

  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center transition-opacity duration-200 ${
        open ? "opacity-100" : "opacity-0 pointer-events-none"
      }`}
      aria-hidden={!open}
    >
      <div className="absolute inset-0 bg-black/60" onClick={onClose} aria-hidden="true" />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="page-modal-title"
        aria-describedby="page-modal-subtitle"
        className={`relative mx-4 w-full max-w-md rounded-2xl border border-brand bg-[#13151b] p-6 text-white shadow-xl transition-transform duration-200 ${
          open ? "scale-100" : "scale-95"
        }`}
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex items-center justify-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-full border border-brand bg-[#0f1117] text-brand">
            {tone === "success" ? <CheckCircle2 size={28} /> : <AlertTriangle size={28} />}
          </div>
        </div>
        <h2 id="page-modal-title" className="mt-4 text-center text-2xl font-bold text-brand">
          {title}
        </h2>
        <p id="page-modal-subtitle" className="mt-2 text-center text-sm text-gray-200">
          {subtitle}
        </p>
        <div className="mt-6 flex flex-col gap-3">{actions}</div>
        <button
          ref={okRef}
          onClick={onClose}
          className="sr-only"
          aria-label="Fechar modal"
          type="button"
        />
      </div>
    </div>
  );
}

type ImageFieldProps = {
  label: string;
  value?: string;
  onChange: (value: string) => void;
  disabled?: boolean;
  onUpload?: (file: File) => Promise<string | null>;
};

function ImageField({ label, value, onChange, disabled, onUpload }: ImageFieldProps) {
  const fileRef = useRef<HTMLInputElement | null>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !onUpload) return;
    setError(null);
    if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
      setError("Envie uma imagem JPEG, PNG ou WebP.");
      return;
    }
    if (file.size > MAX_UPLOAD_SIZE) {
      setError("Arquivo muito grande. Envie uma imagem menor.");
      return;
    }
    setUploading(true);
    try {
      const uploaded = await onUpload(file);
      if (uploaded) onChange(uploaded);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Falha ao enviar imagem.");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="flex flex-col gap-2">
      <label className={labelClass}>{label}</label>
      <div className="flex flex-col gap-2">
        <input
          type="text"
          className={inputClass}
          placeholder="Cole a URL da imagem"
          value={value || ""}
          onChange={(event) => onChange(event.target.value)}
          disabled={disabled}
        />
        <div className="flex items-center gap-3">
          <input
            ref={fileRef}
            type="file"
            accept="image/png,image/jpeg,image/webp"
            className="hidden"
            onChange={handleFileChange}
            disabled={disabled}
          />
          <button
            type="button"
            className={buttonSecondary}
            onClick={() => fileRef.current?.click()}
            disabled={disabled || uploading || !onUpload}
          >
            {uploading ? "Enviando..." : "Enviar imagem"}
          </button>
          {value ? (
            <div className="h-10 w-10 overflow-hidden rounded border border-[#2a2d36] bg-[#0f1117]">
              <Image
                src={value}
                alt="Preview"
                width={40}
                height={40}
                className="h-full w-full object-cover"
              />
            </div>
          ) : null}
        </div>
        {error ? <span className="text-xs text-red-400">{error}</span> : null}
      </div>
    </div>
  );
}

export default function NossaHistoriaEditor() {
  const { about, update, isLoading } = useAboutAdmin();
  const { publicHref, publicSlug } = usePublicLinks();
  const { racha, isLoading: isLoadingRacha } = useRachaPublic(publicSlug);
  const [formData, setFormData] = useState<NossaHistoriaData>(DEFAULT_NOSSA_HISTORIA);
  const [saving, setSaving] = useState(false);
  const [successOpen, setSuccessOpen] = useState(false);
  const [errorOpen, setErrorOpen] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [isInitialized, setIsInitialized] = useState(false);

  const publicUrl = useMemo(() => publicHref("/sobre-nos/nossa-historia"), [publicHref]);
  const presidenteNome = useMemo(() => {
    const presidente = racha?.admins?.find((admin) => admin.role === "presidente");
    return presidente?.nome?.trim() || presidente?.email?.trim() || DEFAULT_PRESIDENTE_NAME;
  }, [racha?.admins]);
  const rachaNome = racha?.nome?.trim() || DEFAULT_RACHA_NAME;
  const defaultContent = useMemo(
    () => ({
      ...DEFAULT_NOSSA_HISTORIA,
      titulo: "Nossa História",
      descricao: buildDescricaoPadrao(rachaNome, presidenteNome),
    }),
    [rachaNome, presidenteNome]
  );

  const uploadImage = useCallback(async (file: File) => {
    const formData = new FormData();
    const ext = file.name.split(".").pop() || "png";
    formData.append("file", file, `nossa-historia-${Date.now()}.${ext}`);
    const res = await fetch("/api/uploads/team-logo", { method: "POST", body: formData });
    const data = await res.json().catch(() => null);
    if (!res.ok) {
      throw new Error(data?.message || data?.error || "Erro ao enviar imagem.");
    }
    return data?.url || data?.path || data?.publicUrl || null;
  }, []);

  const normalizeFromAbout = useCallback(
    (input?: AboutData | null, fallback?: NossaHistoriaData) => {
      const base = fallback ?? DEFAULT_NOSSA_HISTORIA;
      const source = {
        titulo: input?.titulo ?? "",
        descricao: input?.descricao ?? "",
        marcos: (input?.marcos ?? []).map((item) => ({
          ano: item.ano ?? "",
          titulo: item.titulo ?? "",
          descricao: item.descricao ?? "",
          conquista: item.conquista ?? "",
        })),
        curiosidades: (input?.curiosidades ?? []).map((item) => ({
          titulo: item.titulo ?? "",
          texto: item.texto ?? "",
          icone: item.icone ?? "",
          curtidas: item.curtidas,
        })),
        depoimentos: (input?.depoimentos ?? []).map((item) => ({
          nome: item.nome ?? "",
          cargo: item.cargo ?? "",
          texto: item.texto ?? "",
          foto: item.foto ?? "",
          destaque: item.destaque ?? false,
        })),
        categoriasFotos: (input?.categoriasFotos ?? []).map((cat) => ({
          nome: cat.nome ?? "",
          fotos: (cat.fotos ?? []).map((foto) => ({
            src: foto.src ?? "",
            alt: foto.alt ?? "",
          })),
        })),
        videos: (input?.videos ?? []).map((video) => ({
          titulo: video.titulo ?? "",
          url: video.url ?? "",
        })),
        camposHistoricos: input?.camposHistoricos?.length
          ? [
              {
                nome: input.camposHistoricos[0]?.nome ?? "",
                endereco: input.camposHistoricos[0]?.endereco ?? "",
                mapa: input.camposHistoricos[0]?.mapa ?? "",
                descricao: input.camposHistoricos[0]?.descricao ?? "",
              },
            ]
          : [],
        campoAtual: undefined,
        membrosAntigos: (input?.membrosAntigos ?? []).map((membro) => ({
          nome: membro.nome ?? "",
          status: membro.status ?? "",
          desde: membro.desde !== undefined && membro.desde !== null ? String(membro.desde) : "",
          foto: membro.foto ?? "",
        })),
        campeoesHistoricos: (input?.campeoesHistoricos ?? []).map((item) => ({
          nome: item.nome ?? "",
          slug: item.slug ?? "",
          pontos: item.pontos ?? 0,
          posicao: item.posicao ?? "",
          foto: item.foto ?? "",
        })),
        diretoria: (input?.diretoria ?? base.diretoria ?? []).map((item) => ({
          cargo: item.cargo ?? "",
          nome: item.nome ?? "",
          foto: item.foto ?? "",
        })),
      };
      const parsed = nossaHistoriaSchema.safeParse(source);
      if (!parsed.success) {
        return { ...base } as NossaHistoriaData;
      }
      const parsedData = parsed.data as NossaHistoriaData;
      const resolved: NossaHistoriaData = {
        ...base,
        ...parsedData,
      };
      if (!parsedData.titulo?.trim()) {
        resolved.titulo = base.titulo;
      }
      if (!parsedData.descricao?.trim()) {
        resolved.descricao = base.descricao;
      }
      if (parsedData.descricao?.trim() === DEFAULT_NOSSA_HISTORIA.descricao) {
        resolved.descricao = base.descricao;
      }
      if (!parsedData.marcos?.length || isLegacyMarcos(parsedData.marcos)) {
        resolved.marcos = base.marcos;
      }
      if (!parsedData.curiosidades?.length) {
        resolved.curiosidades = base.curiosidades;
      }
      if (!parsedData.depoimentos?.length) {
        resolved.depoimentos = base.depoimentos;
      }
      if (!parsedData.categoriasFotos?.length) {
        resolved.categoriasFotos = base.categoriasFotos;
      }
      if (!parsedData.videos?.length) {
        resolved.videos = base.videos;
      }
      resolved.diretoria =
        parsedData.diretoria && parsedData.diretoria.length ? parsedData.diretoria : base.diretoria;
      return resolved;
    },
    []
  );

  useEffect(() => {
    if (isInitialized) return;
    if (about) {
      const normalized = normalizeFromAbout(about, defaultContent);
      setFormData(normalized);
      setIsInitialized(true);
      return;
    }
    if (!isLoading && !isLoadingRacha) {
      setFormData(defaultContent);
      setIsInitialized(true);
    }
  }, [about, defaultContent, isInitialized, isLoading, isLoadingRacha, normalizeFromAbout]);

  const setField = <K extends keyof NossaHistoriaData>(key: K, value: NossaHistoriaData[K]) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
  };

  const updateMarco = (index: number, patch: Partial<NossaHistoriaMarco>) => {
    const next = [...(formData.marcos ?? [])];
    next[index] = { ...next[index], ...patch };
    setField("marcos", next);
  };

  const updateCuriosidade = (index: number, patch: Partial<NossaHistoriaCuriosidade>) => {
    const next = [...(formData.curiosidades ?? [])];
    next[index] = { ...next[index], ...patch };
    setField("curiosidades", next);
  };

  const updateDepoimento = (index: number, patch: Partial<NossaHistoriaDepoimento>) => {
    const next = [...(formData.depoimentos ?? [])];
    next[index] = { ...next[index], ...patch };
    setField("depoimentos", next);
  };

  const updateCategoriaFotos = (index: number, patch: Partial<NossaHistoriaCategoriaFotos>) => {
    const next = [...(formData.categoriasFotos ?? [])];
    next[index] = { ...next[index], ...patch };
    setField("categoriasFotos", next);
  };

  const updateFoto = (catIndex: number, fotoIndex: number, patch: Partial<NossaHistoriaFoto>) => {
    const categories = [...(formData.categoriasFotos ?? [])];
    const fotos = [...(categories[catIndex]?.fotos ?? [])];
    fotos[fotoIndex] = { ...fotos[fotoIndex], ...patch };
    categories[catIndex] = { ...categories[catIndex], fotos };
    setField("categoriasFotos", categories);
  };

  const updateVideo = (index: number, patch: Partial<NossaHistoriaVideo>) => {
    const next = [...(formData.videos ?? [])];
    next[index] = { ...next[index], ...patch };
    setField("videos", next);
  };

  const buildPayload = () => {
    const marcos = (formData.marcos ?? []).filter((item) => {
      return Boolean(
        sanitizeText(item.ano) || sanitizeText(item.titulo) || sanitizeText(item.descricao)
      );
    });
    const curiosidades = (formData.curiosidades ?? []).filter((item) => {
      return Boolean(
        sanitizeText(item.texto) || sanitizeText(item.titulo) || sanitizeText(item.icone)
      );
    });
    const depoimentos = (formData.depoimentos ?? []).filter((item) => {
      return Boolean(
        sanitizeText(item.nome) || sanitizeText(item.texto) || sanitizeText(item.cargo)
      );
    });
    const categoriasFotos = (formData.categoriasFotos ?? [])
      .map((cat) => ({
        ...cat,
        fotos: (cat.fotos ?? []).filter((foto) => Boolean(sanitizeUrl(foto.src))),
      }))
      .filter((cat) => Boolean(sanitizeText(cat.nome)) || (cat.fotos?.length ?? 0) > 0);
    const videos = (formData.videos ?? []).filter((video) => {
      return Boolean(sanitizeText(video.titulo) || sanitizeUrl(video.url));
    });
    const camposHistoricos = (formData.camposHistoricos ?? []).filter((campo) => {
      return Boolean(
        sanitizeText(campo.nome) ||
          sanitizeText(campo.endereco) ||
          sanitizeUrl(campo.mapa) ||
          sanitizeText(campo.descricao)
      );
    });
    const primeiroCampo = camposHistoricos[0];
    const cleaned: NossaHistoriaData = {
      titulo: sanitizeText(formData.titulo),
      descricao: sanitizeText(formData.descricao),
      marcos: marcos.map((item) => ({
        ano: sanitizeText(item.ano),
        titulo: sanitizeText(item.titulo),
        descricao: sanitizeText(item.descricao),
        conquista: sanitizeText(item.conquista),
      })),
      curiosidades: curiosidades.map((item) => ({
        titulo: sanitizeText(item.titulo),
        texto: sanitizeText(item.texto),
        icone: sanitizeText(item.icone),
        curtidas: typeof item.curtidas === "number" ? item.curtidas : undefined,
      })),
      depoimentos: depoimentos.map((item) => ({
        nome: sanitizeText(item.nome),
        cargo: sanitizeText(item.cargo),
        texto: sanitizeText(item.texto),
        foto: sanitizeUrl(item.foto),
        destaque: Boolean(item.destaque),
      })),
      categoriasFotos: categoriasFotos.map((cat) => ({
        nome: sanitizeText(cat.nome),
        fotos: (cat.fotos ?? []).map((foto) => ({
          src: sanitizeUrl(foto.src),
          alt: sanitizeText(foto.alt),
        })),
      })),
      videos: videos.map((video) => ({
        titulo: sanitizeText(video.titulo),
        url: normalizeYouTubeUrl(sanitizeUrl(video.url)),
      })),
      camposHistoricos: primeiroCampo
        ? [
            {
              nome: sanitizeText(primeiroCampo.nome),
              endereco: sanitizeText(primeiroCampo.endereco),
              mapa: sanitizeUrl(primeiroCampo.mapa),
              descricao: sanitizeText(primeiroCampo.descricao),
            },
          ]
        : [],
      campoAtual: undefined,
      membrosAntigos: undefined,
      campeoesHistoricos: undefined,
      diretoria: undefined,
    };

    const parsed = nossaHistoriaSchema.safeParse(cleaned);
    if (!parsed.success) {
      throw new Error(parsed.error.errors.map((err) => err.message).join(" | "));
    }
    return parsed.data;
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const payload = buildPayload();
      const nextData = {
        ...(about || {}),
        ...payload,
      } as AboutData;
      await update(nextData);
      setSuccessOpen(true);
    } catch (err) {
      setErrorMessage(err instanceof Error ? err.message : "Erro ao salvar a pagina.");
      setErrorOpen(true);
    } finally {
      setSaving(false);
    }
  };

  const campoHistorico = formData.camposHistoricos?.[0] ?? {
    nome: "",
    endereco: "",
    mapa: "",
    descricao: "",
  };

  if (isLoading && !isInitialized) {
    return (
      <div className="pt-20 pb-24 md:pt-6 md:pb-8 w-full max-w-4xl mx-auto px-4 text-center">
        <div className="text-gray-300">Carregando conteudo...</div>
      </div>
    );
  }

  return (
    <div className="pt-20 pb-24 md:pt-6 md:pb-8 w-full max-w-5xl mx-auto px-4">
      <FeedbackModal
        open={successOpen}
        onClose={() => setSuccessOpen(false)}
        title="Pagina atualizada!"
        subtitle="Nossa Historia foi atualizada no site publico."
        actions={
          <>
            <a href={publicUrl} target="_blank" rel="noreferrer" className={buttonSecondary}>
              Ver no site publico
            </a>
            <button type="button" onClick={() => setSuccessOpen(false)} className={buttonPrimary}>
              Fechar
            </button>
          </>
        }
      />
      <FeedbackModal
        open={errorOpen}
        onClose={() => setErrorOpen(false)}
        title="Falha ao salvar"
        subtitle={errorMessage || "Nao foi possivel salvar. Tente novamente."}
        tone="error"
        actions={
          <>
            <button type="button" onClick={() => setErrorOpen(false)} className={buttonPrimary}>
              Fechar
            </button>
          </>
        }
      />

      <div className="flex flex-col gap-4 mb-6">
        <h1 className="text-2xl md:text-3xl font-bold text-white text-center">
          Nossa Historia (pagina publica)
        </h1>
      </div>

      <div className="flex flex-col gap-8">
        <section className={sectionClass}>
          <h2 className="text-xl font-bold text-brand">Cabecalho</h2>
          <div className="grid gap-4">
            <div>
              <label className={labelClass}>Titulo</label>
              <input
                className={inputClass}
                value={formData.titulo || ""}
                onChange={(event) => setField("titulo", event.target.value)}
                placeholder="Ex: Nossa Historia"
              />
            </div>
            <div>
              <label className={labelClass}>Descricao</label>
              <textarea
                className={textareaClass}
                rows={4}
                value={formData.descricao || ""}
                onChange={(event) => setField("descricao", event.target.value)}
                placeholder="Conte a origem e os valores do racha."
              />
              <div className="text-xs text-gray-400 mt-1">
                {formData.descricao?.length || 0} caracteres
              </div>
            </div>
          </div>
        </section>

        <section className={sectionClass}>
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-brand">Linha do Tempo</h2>
            <button
              type="button"
              className={buttonSecondary}
              onClick={() =>
                setField("marcos", [
                  ...(formData.marcos ?? []),
                  { ano: "", titulo: "", descricao: "", conquista: "" },
                ])
              }
            >
              <Plus size={16} className="inline" /> Adicionar marco
            </button>
          </div>
          <div className="flex flex-col gap-4">
            {(formData.marcos ?? []).map((marco, idx) => (
              <div key={`marco-${idx}`} className="rounded-xl border border-[#2a2d36] p-4">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-sm text-gray-300">Marco #{idx + 1}</span>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      className={buttonGhost}
                      onClick={() => setField("marcos", moveItem(formData.marcos ?? [], idx, -1))}
                    >
                      <ArrowUp size={14} />
                    </button>
                    <button
                      type="button"
                      className={buttonGhost}
                      onClick={() => setField("marcos", moveItem(formData.marcos ?? [], idx, 1))}
                    >
                      <ArrowDown size={14} />
                    </button>
                    <button
                      type="button"
                      className="text-xs text-red-400 hover:text-red-300"
                      onClick={() =>
                        setField(
                          "marcos",
                          (formData.marcos ?? []).filter((_, i) => i !== idx)
                        )
                      }
                    >
                      Remover
                    </button>
                  </div>
                </div>
                <div className="grid gap-3 mt-3 md:grid-cols-2">
                  <div>
                    <label className={labelClass}>Ano</label>
                    <input
                      className={inputClass}
                      value={marco.ano}
                      onChange={(event) => updateMarco(idx, { ano: event.target.value })}
                      placeholder="2024"
                    />
                  </div>
                  <div>
                    <label className={labelClass}>Titulo</label>
                    <input
                      className={inputClass}
                      value={marco.titulo}
                      onChange={(event) => updateMarco(idx, { titulo: event.target.value })}
                      placeholder="Fundacao do racha"
                    />
                  </div>
                </div>
                <div className="grid gap-3 mt-3 md:grid-cols-2">
                  <div>
                    <label className={labelClass}>Icone/Conquista</label>
                    <input
                      className={inputClass}
                      value={marco.conquista || ""}
                      onChange={(event) => updateMarco(idx, { conquista: event.target.value })}
                      placeholder="🏆"
                    />
                  </div>
                  <div>
                    <label className={labelClass}>Descricao</label>
                    <textarea
                      className={textareaClass}
                      rows={2}
                      value={marco.descricao}
                      onChange={(event) => updateMarco(idx, { descricao: event.target.value })}
                    />
                  </div>
                </div>
                <div className="mt-3 rounded-lg bg-[#111318] p-3 text-xs text-gray-300">
                  <span className="text-brand font-semibold">{marco.ano}</span> · {marco.titulo}
                  {marco.conquista ? ` ${marco.conquista}` : ""} — {marco.descricao}
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className={sectionClass}>
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-brand">Curiosidades</h2>
            <button
              type="button"
              className={buttonSecondary}
              onClick={() =>
                setField("curiosidades", [
                  ...(formData.curiosidades ?? []),
                  { titulo: "", texto: "", icone: "" },
                ])
              }
            >
              <Plus size={16} className="inline" /> Adicionar curiosidade
            </button>
          </div>
          <div className="grid gap-4">
            {(formData.curiosidades ?? []).map((curiosidade, idx) => (
              <div key={`curiosidade-${idx}`} className="rounded-xl border border-[#2a2d36] p-4">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-sm text-gray-300">Curiosidade #{idx + 1}</span>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      className={buttonGhost}
                      onClick={() =>
                        setField("curiosidades", moveItem(formData.curiosidades ?? [], idx, -1))
                      }
                    >
                      <ArrowUp size={14} />
                    </button>
                    <button
                      type="button"
                      className={buttonGhost}
                      onClick={() =>
                        setField("curiosidades", moveItem(formData.curiosidades ?? [], idx, 1))
                      }
                    >
                      <ArrowDown size={14} />
                    </button>
                    <button
                      type="button"
                      className="text-xs text-red-400 hover:text-red-300"
                      onClick={() =>
                        setField(
                          "curiosidades",
                          (formData.curiosidades ?? []).filter((_, i) => i !== idx)
                        )
                      }
                    >
                      Remover
                    </button>
                  </div>
                </div>
                <div className="grid gap-3 mt-3 md:grid-cols-2">
                  <div>
                    <label className={labelClass}>Titulo</label>
                    <input
                      className={inputClass}
                      value={curiosidade.titulo || ""}
                      onChange={(event) => updateCuriosidade(idx, { titulo: event.target.value })}
                      placeholder="Curiosidade"
                    />
                  </div>
                  <div>
                    <label className={labelClass}>Emoji</label>
                    <input
                      className={inputClass}
                      value={curiosidade.icone || ""}
                      onChange={(event) => updateCuriosidade(idx, { icone: event.target.value })}
                      placeholder="⚽"
                    />
                  </div>
                </div>
                <div className="mt-3">
                  <label className={labelClass}>Texto</label>
                  <textarea
                    className={textareaClass}
                    rows={2}
                    value={curiosidade.texto}
                    onChange={(event) => updateCuriosidade(idx, { texto: event.target.value })}
                  />
                </div>
                <div className="mt-3 rounded-lg bg-[#111318] p-3 text-xs text-gray-300">
                  {curiosidade.icone ? `${curiosidade.icone} ` : ""}
                  {curiosidade.texto}
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className={sectionClass}>
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-brand">Depoimentos</h2>
            <button
              type="button"
              className={buttonSecondary}
              onClick={() =>
                setField("depoimentos", [
                  ...(formData.depoimentos ?? []),
                  { nome: "", cargo: "", texto: "", foto: "", destaque: false },
                ])
              }
            >
              <Plus size={16} className="inline" /> Adicionar depoimento
            </button>
          </div>
          <div className="grid gap-4">
            {(formData.depoimentos ?? []).map((dep, idx) => (
              <div key={`depoimento-${idx}`} className="rounded-xl border border-[#2a2d36] p-4">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-sm text-gray-300">Depoimento #{idx + 1}</span>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      className={buttonGhost}
                      onClick={() =>
                        setField("depoimentos", moveItem(formData.depoimentos ?? [], idx, -1))
                      }
                    >
                      <ArrowUp size={14} />
                    </button>
                    <button
                      type="button"
                      className={buttonGhost}
                      onClick={() =>
                        setField("depoimentos", moveItem(formData.depoimentos ?? [], idx, 1))
                      }
                    >
                      <ArrowDown size={14} />
                    </button>
                    <button
                      type="button"
                      className="text-xs text-red-400 hover:text-red-300"
                      onClick={() =>
                        setField(
                          "depoimentos",
                          (formData.depoimentos ?? []).filter((_, i) => i !== idx)
                        )
                      }
                    >
                      Remover
                    </button>
                  </div>
                </div>
                <div className="grid gap-3 mt-3 md:grid-cols-2">
                  <div>
                    <label className={labelClass}>Nome</label>
                    <input
                      className={inputClass}
                      value={dep.nome}
                      onChange={(event) => updateDepoimento(idx, { nome: event.target.value })}
                    />
                  </div>
                  <div>
                    <label className={labelClass}>Cargo</label>
                    <input
                      className={inputClass}
                      value={dep.cargo || ""}
                      onChange={(event) => updateDepoimento(idx, { cargo: event.target.value })}
                    />
                  </div>
                </div>
                <div className="mt-3">
                  <label className={labelClass}>Depoimento</label>
                  <textarea
                    className={textareaClass}
                    rows={3}
                    value={dep.texto}
                    onChange={(event) => updateDepoimento(idx, { texto: event.target.value })}
                  />
                </div>
                <div className="mt-3 grid gap-3 md:grid-cols-2">
                  <ImageField
                    label="Foto"
                    value={dep.foto}
                    onChange={(value) => updateDepoimento(idx, { foto: value })}
                    onUpload={uploadImage}
                  />
                  <div className="flex items-center gap-2 mt-6">
                    <input
                      id={`destaque-${idx}`}
                      type="checkbox"
                      className="h-4 w-4"
                      checked={Boolean(dep.destaque)}
                      onChange={(event) =>
                        updateDepoimento(idx, { destaque: event.target.checked })
                      }
                    />
                    <label htmlFor={`destaque-${idx}`} className="text-sm text-gray-200">
                      Destaque no site
                    </label>
                  </div>
                </div>
                <div className="mt-3 rounded-lg bg-[#111318] p-3 text-xs text-gray-300">
                  {dep.texto}
                  <div className="text-brand-soft mt-2 font-semibold">{dep.nome}</div>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className={sectionClass}>
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-brand">Galeria de Fotos</h2>
            <button
              type="button"
              className={buttonSecondary}
              onClick={() =>
                setField("categoriasFotos", [
                  ...(formData.categoriasFotos ?? []),
                  { nome: "", fotos: [] },
                ])
              }
            >
              <Plus size={16} className="inline" /> Adicionar categoria
            </button>
          </div>
          <div className="flex flex-col gap-4">
            {(formData.categoriasFotos ?? []).map((categoria, idx) => (
              <div key={`categoria-${idx}`} className="rounded-xl border border-[#2a2d36] p-4">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-sm text-gray-300">Categoria #{idx + 1}</span>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      className={buttonGhost}
                      onClick={() =>
                        setField(
                          "categoriasFotos",
                          moveItem(formData.categoriasFotos ?? [], idx, -1)
                        )
                      }
                    >
                      <ArrowUp size={14} />
                    </button>
                    <button
                      type="button"
                      className={buttonGhost}
                      onClick={() =>
                        setField(
                          "categoriasFotos",
                          moveItem(formData.categoriasFotos ?? [], idx, 1)
                        )
                      }
                    >
                      <ArrowDown size={14} />
                    </button>
                    <button
                      type="button"
                      className="text-xs text-red-400 hover:text-red-300"
                      onClick={() =>
                        setField(
                          "categoriasFotos",
                          (formData.categoriasFotos ?? []).filter((_, i) => i !== idx)
                        )
                      }
                    >
                      Remover
                    </button>
                  </div>
                </div>
                <div className="mt-3">
                  <label className={labelClass}>Nome da categoria</label>
                  <input
                    className={inputClass}
                    value={categoria.nome || ""}
                    onChange={(event) => updateCategoriaFotos(idx, { nome: event.target.value })}
                  />
                </div>
                <div className="mt-4 flex items-center justify-between">
                  <span className="text-sm text-gray-300">Fotos</span>
                  <button
                    type="button"
                    className={buttonSecondary}
                    onClick={() =>
                      updateCategoriaFotos(idx, {
                        fotos: [...(categoria.fotos ?? []), { src: "", alt: "" }],
                      })
                    }
                  >
                    <Plus size={16} className="inline" /> Adicionar foto
                  </button>
                </div>
                <div className="mt-3 grid gap-4">
                  {(categoria.fotos ?? []).map((foto, fotoIdx) => (
                    <div
                      key={`foto-${idx}-${fotoIdx}`}
                      className="rounded-lg border border-[#2a2d36] p-3"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-xs text-gray-400">Foto #{fotoIdx + 1}</span>
                        <div className="flex gap-2">
                          <button
                            type="button"
                            className={buttonGhost}
                            onClick={() =>
                              updateCategoriaFotos(idx, {
                                fotos: moveItem(categoria.fotos ?? [], fotoIdx, -1),
                              })
                            }
                          >
                            <ArrowUp size={14} />
                          </button>
                          <button
                            type="button"
                            className={buttonGhost}
                            onClick={() =>
                              updateCategoriaFotos(idx, {
                                fotos: moveItem(categoria.fotos ?? [], fotoIdx, 1),
                              })
                            }
                          >
                            <ArrowDown size={14} />
                          </button>
                          <button
                            type="button"
                            className="text-xs text-red-400 hover:text-red-300"
                            onClick={() =>
                              updateCategoriaFotos(idx, {
                                fotos: (categoria.fotos ?? []).filter((_, i) => i !== fotoIdx),
                              })
                            }
                          >
                            Remover
                          </button>
                        </div>
                      </div>
                      <div className="mt-3 grid gap-3 md:grid-cols-2">
                        <ImageField
                          label="Imagem"
                          value={foto.src}
                          onChange={(value) => updateFoto(idx, fotoIdx, { src: value })}
                          onUpload={uploadImage}
                        />
                        <div>
                          <label className={labelClass}>Descricao curta</label>
                          <input
                            className={inputClass}
                            value={foto.alt || ""}
                            onChange={(event) =>
                              updateFoto(idx, fotoIdx, { alt: event.target.value })
                            }
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className={sectionClass}>
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-brand">Videos Historicos</h2>
            <button
              type="button"
              className={buttonSecondary}
              onClick={() =>
                setField("videos", [...(formData.videos ?? []), { titulo: "", url: "" }])
              }
            >
              <Plus size={16} className="inline" /> Adicionar video
            </button>
          </div>
          <div className="grid gap-4">
            {(formData.videos ?? []).map((video, idx) => {
              const thumb = youtubeThumb(video.url || "");
              return (
                <div key={`video-${idx}`} className="rounded-xl border border-[#2a2d36] p-4">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-sm text-gray-300">Video #{idx + 1}</span>
                    <div className="flex gap-2">
                      <button
                        type="button"
                        className={buttonGhost}
                        onClick={() => setField("videos", moveItem(formData.videos ?? [], idx, -1))}
                      >
                        <ArrowUp size={14} />
                      </button>
                      <button
                        type="button"
                        className={buttonGhost}
                        onClick={() => setField("videos", moveItem(formData.videos ?? [], idx, 1))}
                      >
                        <ArrowDown size={14} />
                      </button>
                      <button
                        type="button"
                        className="text-xs text-red-400 hover:text-red-300"
                        onClick={() =>
                          setField(
                            "videos",
                            (formData.videos ?? []).filter((_, i) => i !== idx)
                          )
                        }
                      >
                        Remover
                      </button>
                    </div>
                  </div>
                  <div className="grid gap-3 mt-3 md:grid-cols-2">
                    <div>
                      <label className={labelClass}>Titulo</label>
                      <input
                        className={inputClass}
                        value={video.titulo || ""}
                        onChange={(event) => updateVideo(idx, { titulo: event.target.value })}
                      />
                    </div>
                    <div>
                      <label className={labelClass}>URL do YouTube</label>
                      <input
                        className={inputClass}
                        value={video.url || ""}
                        onChange={(event) => updateVideo(idx, { url: event.target.value })}
                        placeholder="https://youtu.be/..."
                      />
                    </div>
                  </div>
                  {thumb ? (
                    <div className="mt-3 flex items-center gap-3 text-xs text-gray-300">
                      <Image
                        src={thumb}
                        alt="Preview do video"
                        width={120}
                        height={68}
                        className="rounded border border-[#2a2d36]"
                      />
                      <a
                        className="flex items-center gap-1 text-brand hover:text-brand-soft"
                        href={video.url}
                        target="_blank"
                        rel="noreferrer"
                      >
                        Abrir video <ExternalLink size={12} />
                      </a>
                    </div>
                  ) : null}
                </div>
              );
            })}
          </div>
        </section>

        <section className={sectionClass}>
          <div className="flex items-start justify-between gap-4 flex-wrap">
            <div>
              <h2 className="text-xl font-bold text-brand">Onde Começou (Primeiro Campo)</h2>
              <p className="text-sm text-gray-400 mt-1">
                O campo atual é configurado no Rodape. Aqui voce informa apenas o primeiro campo do
                racha.
              </p>
            </div>
          </div>
          <div className="mt-4 rounded-xl border border-[#2a2d36] p-4">
            <div className="grid gap-3 md:grid-cols-2">
              <div>
                <label className={labelClass}>Nome ou titulo do primeiro campo</label>
                <input
                  className={inputClass}
                  value={campoHistorico.nome || ""}
                  onChange={(event) =>
                    setField("camposHistoricos", [{ ...campoHistorico, nome: event.target.value }])
                  }
                />
              </div>
              <div>
                <label className={labelClass}>Endereco do campo (aparece abaixo do titulo)</label>
                <input
                  className={inputClass}
                  value={campoHistorico.endereco || ""}
                  onChange={(event) =>
                    setField("camposHistoricos", [
                      { ...campoHistorico, endereco: event.target.value },
                    ])
                  }
                />
              </div>
            </div>
            <div className="grid gap-3 mt-3 md:grid-cols-2">
              <div>
                <label className={labelClass}>Link do Google Maps (iframe/preview)</label>
                <input
                  className={inputClass}
                  value={campoHistorico.mapa || ""}
                  onChange={(event) =>
                    setField("camposHistoricos", [{ ...campoHistorico, mapa: event.target.value }])
                  }
                />
              </div>
            </div>
          </div>
        </section>

        <section className={sectionClass}>
          <h2 className="text-xl font-bold text-brand">Secoes automaticas</h2>
          <div className="rounded-xl border border-[#2a2d36] bg-[#111318] p-4 text-sm text-gray-300">
            As secoes abaixo sao preenchidas automaticamente pelo sistema e nao sao editaveis aqui:
            <ul className="list-disc pl-5 mt-2 text-gray-300">
              <li>Membros Mais Antigos (top 5 do ranking de assiduidade - Todos os Anos)</li>
              <li>Campeoes Historicos (top 5 pontuadores - Todas as Temporadas)</li>
              <li>Presidencia e Diretoria (admins configurados em Administradores)</li>
            </ul>
          </div>
        </section>
      </div>

      <div className="mt-8 flex flex-col items-center gap-3">
        <button type="button" className={buttonPrimary} onClick={handleSave} disabled={saving}>
          {saving ? "Salvando..." : "Salvar pagina"}
        </button>
        <div className="text-xs text-gray-400">As mudancas sao refletidas no site publico.</div>
      </div>
    </div>
  );
}
