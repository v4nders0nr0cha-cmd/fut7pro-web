"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { ReactNode } from "react";
import Image from "next/image";
import { CheckCircle2, AlertTriangle, Plus, ArrowUp, ArrowDown, ExternalLink } from "lucide-react";
import { useAboutAdmin } from "@/hooks/useAbout";
import { usePublicLinks } from "@/hooks/usePublicLinks";
import { useRachaPublic } from "@/hooks/useRachaPublic";
import { usePublicAthletes } from "@/hooks/usePublicAthletes";
import {
  DEFAULT_GALERIA_FOTOS,
  DEFAULT_NOSSA_HISTORIA,
  MAX_GALERIA_FOTOS,
  nossaHistoriaSchema,
} from "@/utils/schemas/nossaHistoria.schema";
import { normalizeYouTubeUrl, youtubeThumb } from "@/utils/youtube";
import type {
  NossaHistoriaData,
  NossaHistoriaMarco,
  NossaHistoriaCuriosidade,
  NossaHistoriaDepoimento,
  NossaHistoriaGaleriaFoto,
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
const DEFAULT_AVATAR = "/images/jogadores/jogador_padrao_01.jpg";
const DESCRICAO_TEMPLATE =
  "O racha {nomeDoRacha} nasceu da amizade e da paixão pelo futebol entre amigos. Fundado por {nomePresidente}, começou como uma pelada de rotina e, com o tempo, virou tradição, união e resenha. Nossa história é feita de gols, rivalidade saudável e momentos inesquecíveis, sempre com respeito, espírito esportivo e aquele clima de time fechado.";
const LEGACY_ANO_REGEX = /^ano\s*\d+/i;
const DEFAULT_DEPOIMENTO_TEXTO =
  "Esse racha é mais do que jogo, é encontro, amizade e respeito. Aqui a disputa é saudável, a resenha é garantida e todo mundo faz parte da história. Vamos manter essa tradição viva e continuar fazendo história juntos.";

const roleLabels: Record<string, string> = {
  presidente: "Presidente",
  vicepresidente: "Vice-Presidente",
  diretorfutebol: "Diretor de Futebol",
  diretorfinanceiro: "Diretor Financeiro",
};

const DEFAULT_GALERIA_IDS = new Set(
  DEFAULT_GALERIA_FOTOS.map((foto) => foto.id).filter((id): id is string => Boolean(id))
);
const DEFAULT_GALERIA_DESCRICAO = "Registro especial do racha.";

type LegacyCategoriaFotos = {
  nome?: string;
  fotos?: { src?: string; alt?: string }[];
};

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

function normalizeLookup(value?: string) {
  if (!value) return "";
  return value
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

function createRandomId(prefix: string) {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return `${prefix}-${crypto.randomUUID()}`;
  }
  return `${prefix}-${Math.random().toString(36).slice(2)}`;
}

function buildCuriosidadeId(titulo?: string, texto?: string, index?: number) {
  const seed = `${titulo ?? ""} ${texto ?? ""}`.trim().toLowerCase();
  if (!seed) return `curiosidade-${index ?? 0}`;
  let hash = 0;
  for (let i = 0; i < seed.length; i += 1) {
    hash = (hash * 31 + seed.charCodeAt(i)) >>> 0;
  }
  return `curiosidade-${hash.toString(36)}`;
}

function normalizeGaleriaFotos(
  input: unknown,
  fallback: NossaHistoriaGaleriaFoto[]
): NossaHistoriaGaleriaFoto[] {
  if (!Array.isArray(input) || input.length === 0) {
    return fallback.map((foto) => ({ ...foto }));
  }

  const hasLegacy = input.some(
    (item) => item && typeof item === "object" && "fotos" in (item as Record<string, unknown>)
  );

  if (hasLegacy) {
    const legacy = input as LegacyCategoriaFotos[];
    const converted: NossaHistoriaGaleriaFoto[] = [];
    legacy.forEach((cat) => {
      const tituloBase = sanitizeText(cat.nome) || "";
      (cat.fotos ?? []).forEach((foto) => {
        const src = sanitizeUrl(foto?.src);
        if (!src) return;
        const descricao = sanitizeText(foto?.alt) || DEFAULT_GALERIA_DESCRICAO;
        const titulo = tituloBase || sanitizeText(foto?.alt) || "Foto do racha";
        converted.push({
          id: createRandomId("galeria"),
          src,
          titulo,
          descricao,
        });
      });
    });
    if (converted.length > 0) {
      return converted.slice(0, MAX_GALERIA_FOTOS);
    }
    return fallback.map((foto) => ({ ...foto }));
  }

  const normalized = (input as NossaHistoriaGaleriaFoto[]).map((foto) => ({
    id: foto?.id?.toString().trim() || createRandomId("galeria"),
    src: sanitizeUrl(foto?.src),
    titulo: sanitizeText(foto?.titulo),
    descricao: sanitizeText(foto?.descricao),
  }));

  return normalized.length > 0
    ? normalized.slice(0, MAX_GALERIA_FOTOS)
    : fallback.map((foto) => ({ ...foto }));
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

type AthleteOption = {
  id: string;
  nome: string;
  apelido?: string | null;
  foto?: string | null;
};

type AthleteSelectProps = {
  label: string;
  options: AthleteOption[];
  value?: string;
  onChange: (value: string) => void;
  disabled?: boolean;
};

function AthleteSelect({ label, options, value, onChange, disabled }: AthleteSelectProps) {
  const [query, setQuery] = useState("");
  const normalizedQuery = normalizeLookup(query);
  const filtered = normalizedQuery
    ? options.filter((option) => {
        const nome = normalizeLookup(option.nome);
        const apelido = normalizeLookup(option.apelido ?? "");
        return nome.includes(normalizedQuery) || apelido.includes(normalizedQuery);
      })
    : options;

  const selected = options.find((option) => option.id === value);

  return (
    <div className="flex flex-col gap-2">
      <label className={labelClass}>{label}</label>
      <input
        type="text"
        className={inputClass}
        value={query}
        onChange={(event) => setQuery(event.target.value)}
        placeholder="Buscar jogador..."
        disabled={disabled}
      />
      <div className="max-h-48 overflow-auto rounded-lg border border-[#2a2d36] bg-[#101218]">
        {disabled && options.length === 0 ? (
          <div className="px-3 py-2 text-xs text-gray-400">Carregando jogadores...</div>
        ) : filtered.length === 0 ? (
          <div className="px-3 py-2 text-xs text-gray-400">Nenhum jogador encontrado.</div>
        ) : (
          filtered.map((option) => (
            <button
              type="button"
              key={option.id}
              onClick={() => onChange(option.id)}
              disabled={disabled}
              className={`w-full flex items-center gap-3 px-3 py-2 text-left text-sm text-white transition ${
                option.id === value ? "bg-[#1f2330]" : "hover:bg-[#1a1e28]"
              }`}
            >
              <Image
                src={option.foto || DEFAULT_AVATAR}
                alt={option.nome}
                width={32}
                height={32}
                className="rounded-full border border-brand"
              />
              <span className="flex-1">
                {option.nome}
                {option.apelido ? ` (${option.apelido})` : ""}
              </span>
            </button>
          ))
        )}
      </div>
      {selected ? (
        <span className="text-xs text-gray-400">
          Selecionado: {selected.nome}
          {selected.apelido ? ` (${selected.apelido})` : ""}
        </span>
      ) : (
        <span className="text-xs text-gray-500">Nenhum jogador selecionado.</span>
      )}
    </div>
  );
}

export default function NossaHistoriaEditor() {
  const { about, update, isLoading } = useAboutAdmin();
  const { publicHref, publicSlug } = usePublicLinks();
  const { racha, isLoading: isLoadingRacha } = useRachaPublic(publicSlug);
  const { athletes, isLoading: isLoadingAthletes } = usePublicAthletes(publicSlug);
  const [formData, setFormData] = useState<NossaHistoriaData>(DEFAULT_NOSSA_HISTORIA);
  const [saving, setSaving] = useState(false);
  const [successOpen, setSuccessOpen] = useState(false);
  const [errorOpen, setErrorOpen] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [isInitialized, setIsInitialized] = useState(false);

  const publicUrl = useMemo(() => publicHref("/sobre-nos/nossa-historia"), [publicHref]);
  const admins = useMemo(() => racha?.admins ?? [], [racha?.admins]);
  const athletesById = useMemo(
    () => new Map(athletes.map((athlete) => [athlete.id, athlete])),
    [athletes]
  );
  const athletesByName = useMemo(() => {
    const map = new Map<string, (typeof athletes)[number]>();
    athletes.forEach((athlete) => {
      const key = normalizeLookup(athlete.nome);
      if (key) map.set(key, athlete);
    });
    return map;
  }, [athletes]);
  const adminsByAthleteId = useMemo(() => {
    const map = new Map<string, (typeof admins)[number]>();
    admins.forEach((admin) => {
      if (admin.athleteId) {
        map.set(admin.athleteId, admin);
      }
    });
    return map;
  }, [admins]);
  const adminsByName = useMemo(() => {
    const map = new Map<string, (typeof admins)[number]>();
    admins.forEach((admin) => {
      const key = normalizeLookup(admin.nome);
      if (key) map.set(key, admin);
    });
    return map;
  }, [admins]);
  const presidenteAdmin = useMemo(
    () => admins.find((admin) => admin.role === "presidente") ?? null,
    [admins]
  );
  const presidenteAthlete = useMemo(() => {
    if (!presidenteAdmin) return null;
    if (presidenteAdmin.athleteId) {
      return athletesById.get(presidenteAdmin.athleteId) ?? null;
    }
    const key = normalizeLookup(presidenteAdmin.nome);
    return key ? (athletesByName.get(key) ?? null) : null;
  }, [presidenteAdmin, athletesById, athletesByName]);
  const presidenteNome = useMemo(() => {
    const presidente = presidenteAdmin;
    return presidente?.nome?.trim() || presidente?.email?.trim() || DEFAULT_PRESIDENTE_NAME;
  }, [presidenteAdmin]);
  const rachaNome = racha?.nome?.trim() || DEFAULT_RACHA_NAME;
  const defaultContent = useMemo(
    () => ({
      ...DEFAULT_NOSSA_HISTORIA,
      titulo: "Nossa História",
      descricao: buildDescricaoPadrao(rachaNome, presidenteNome),
      depoimentos: [
        {
          id: "depoimento-presidente",
          jogadorId: presidenteAthlete?.id || presidenteAdmin?.athleteId || "",
          texto: DEFAULT_DEPOIMENTO_TEXTO,
          destaque: true,
        },
      ],
    }),
    [rachaNome, presidenteNome, presidenteAthlete?.id, presidenteAdmin?.athleteId]
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
      const resolvedCuriosidades = (input?.curiosidades ?? []).map((item, index) => ({
        id:
          item.id?.toString().trim() ||
          buildCuriosidadeId(item.titulo ?? "", item.texto ?? "", index),
        titulo: item.titulo ?? "",
        texto: item.texto ?? "",
        icone: item.icone ?? "",
        curtidas: item.curtidas,
      }));

      const resolvedDepoimentos = (input?.depoimentos ?? [])
        .map((item) => {
          const texto = (item?.texto ?? "").toString().trim();
          if (!texto) return null;
          const explicitId = item?.id?.toString().trim();
          const legacyName = (item as { nome?: string })?.nome ?? "";
          const legacyKey = normalizeLookup(legacyName);
          const legacyAthlete = legacyKey ? athletesByName.get(legacyKey) : null;
          const jogadorId =
            (item as { jogadorId?: string })?.jogadorId?.toString().trim() ||
            legacyAthlete?.id ||
            presidenteAthlete?.id ||
            presidenteAdmin?.athleteId ||
            "";
          return {
            id: explicitId || createRandomId("depoimento"),
            jogadorId,
            texto,
            destaque: Boolean(item?.destaque),
          };
        })
        .filter(
          (item): item is { id: string; jogadorId: string; texto: string; destaque: boolean } =>
            Boolean(item)
        );

      const resolvedGaleriaFotos = normalizeGaleriaFotos(
        input?.categoriasFotos,
        base.categoriasFotos ?? DEFAULT_GALERIA_FOTOS
      );

      const source = {
        titulo: input?.titulo ?? "",
        descricao: input?.descricao ?? "",
        marcos: (input?.marcos ?? []).map((item) => ({
          ano: item.ano ?? "",
          titulo: item.titulo ?? "",
          descricao: item.descricao ?? "",
          conquista: item.conquista ?? "",
        })),
        curiosidades: resolvedCuriosidades,
        depoimentos: resolvedDepoimentos,
        categoriasFotos: resolvedGaleriaFotos,
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
    [athletesByName, presidenteAthlete?.id, presidenteAdmin?.athleteId]
  );

  useEffect(() => {
    if (isInitialized) return;
    if (about && !isLoadingAthletes) {
      const normalized = normalizeFromAbout(about, defaultContent);
      setFormData(normalized);
      setIsInitialized(true);
      return;
    }
    if (!isLoading && !isLoadingRacha && !isLoadingAthletes) {
      setFormData(defaultContent);
      setIsInitialized(true);
    }
  }, [
    about,
    defaultContent,
    isInitialized,
    isLoading,
    isLoadingAthletes,
    isLoadingRacha,
    normalizeFromAbout,
  ]);

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

  const updateGaleriaFoto = (index: number, patch: Partial<NossaHistoriaGaleriaFoto>) => {
    const next = [...(formData.categoriasFotos ?? [])];
    next[index] = { ...next[index], ...patch };
    setField("categoriasFotos", next);
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
      return Boolean(sanitizeText(item.texto) && sanitizeText(item.jogadorId));
    });
    const galeriaFotosRaw = (formData.categoriasFotos ?? []).map((foto) => ({
      id: foto.id?.toString().trim(),
      src: sanitizeUrl(foto.src),
      titulo: sanitizeText(foto.titulo),
      descricao: sanitizeText(foto.descricao),
    }));
    const galeriaFotosFilled = galeriaFotosRaw.filter((foto) =>
      Boolean(foto.src || foto.titulo || foto.descricao)
    );
    if (galeriaFotosFilled.length > MAX_GALERIA_FOTOS) {
      throw new Error("Limite maximo de 6 fotos na galeria.");
    }
    const galeriaFotosInvalid = galeriaFotosFilled.find(
      (foto) => !foto.src || !foto.titulo || !foto.descricao
    );
    if (galeriaFotosInvalid) {
      throw new Error("Preencha imagem, titulo e descricao em todas as fotos da galeria.");
    }
    const categoriasFotos =
      galeriaFotosFilled.length > 0
        ? galeriaFotosFilled.map((foto, index) => ({
            id: foto.id || createRandomId(`galeria-${index + 1}`),
            src: foto.src,
            titulo: foto.titulo,
            descricao: foto.descricao,
          }))
        : DEFAULT_GALERIA_FOTOS.map((foto) => ({ ...foto }));
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
      curiosidades: curiosidades.map((item, index) => ({
        id:
          item.id?.toString().trim() ||
          buildCuriosidadeId(item.titulo ?? "", item.texto ?? "", index),
        titulo: sanitizeText(item.titulo),
        texto: sanitizeText(item.texto),
        icone: sanitizeText(item.icone),
        curtidas: typeof item.curtidas === "number" ? item.curtidas : undefined,
      })),
      curiosidadesCurtidas: (about as { curiosidadesCurtidas?: Record<string, number> })
        ?.curiosidadesCurtidas,
      depoimentos: depoimentos.map((item, index) => ({
        id: item.id?.toString().trim() || createRandomId(`depoimento-${index + 1}`),
        jogadorId: sanitizeText(item.jogadorId),
        texto: sanitizeText(item.texto),
        destaque: Boolean(item.destaque),
      })),
      categoriasFotos,
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
  const galeriaFotos = formData.categoriasFotos ?? [];
  const podeAdicionarGaleria = galeriaFotos.length < MAX_GALERIA_FOTOS;

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
                  {
                    id: createRandomId("depoimento"),
                    jogadorId: presidenteAthlete?.id || presidenteAdmin?.athleteId || "",
                    texto: "",
                    destaque: false,
                  },
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
                <div className="mt-3">
                  <AthleteSelect
                    label="Jogador"
                    options={athletes.map((athlete) => ({
                      id: athlete.id,
                      nome: athlete.nome,
                      apelido: athlete.apelido ?? undefined,
                      foto: athlete.foto ?? undefined,
                    }))}
                    value={dep.jogadorId}
                    onChange={(value) => updateDepoimento(idx, { jogadorId: value })}
                    disabled={isLoadingAthletes}
                  />
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
                <div className="mt-3 flex items-center gap-2">
                  <input
                    id={`destaque-${idx}`}
                    type="checkbox"
                    className="h-4 w-4"
                    checked={Boolean(dep.destaque)}
                    onChange={(event) => updateDepoimento(idx, { destaque: event.target.checked })}
                  />
                  <label htmlFor={`destaque-${idx}`} className="text-sm text-gray-200">
                    Destaque no site
                  </label>
                </div>
                <div className="mt-3 rounded-lg bg-[#111318] p-3 text-xs text-gray-300">
                  {dep.texto || "Escreva o depoimento para visualizar o preview."}
                  {(() => {
                    const athlete = dep.jogadorId ? athletesById.get(dep.jogadorId) : null;
                    const adminMatch =
                      (dep.jogadorId && adminsByAthleteId.get(dep.jogadorId)) ||
                      (athlete ? adminsByName.get(normalizeLookup(athlete.nome)) : null) ||
                      (presidenteAdmin && dep.id === "depoimento-presidente"
                        ? presidenteAdmin
                        : null);
                    const nome = athlete?.nome || adminMatch?.nome || "Jogador";
                    const cargo = adminMatch ? roleLabels[adminMatch.role] || "Atleta" : "Atleta";
                    return (
                      <div className="mt-2 flex items-center gap-2 text-brand-soft font-semibold">
                        <Image
                          src={athlete?.foto || adminMatch?.foto || DEFAULT_AVATAR}
                          alt={nome}
                          width={28}
                          height={28}
                          className="rounded-full border border-brand"
                        />
                        <span>
                          {nome} · {cargo}
                        </span>
                      </div>
                    );
                  })()}
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className={sectionClass}>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 className="text-xl font-bold text-brand">Galeria de Fotos</h2>
            <div className="flex flex-col items-end gap-1">
              <button
                type="button"
                className={buttonSecondary}
                disabled={!podeAdicionarGaleria}
                onClick={() =>
                  setField("categoriasFotos", [
                    ...(formData.categoriasFotos ?? []),
                    { id: createRandomId("galeria"), src: "", titulo: "", descricao: "" },
                  ])
                }
              >
                <Plus size={16} className="inline" /> Adicionar foto
              </button>
              {!podeAdicionarGaleria ? (
                <span className="text-xs text-amber-300">
                  Limite maximo de {MAX_GALERIA_FOTOS} fotos atingido.
                </span>
              ) : null}
            </div>
          </div>
          <div className="grid gap-4">
            {galeriaFotos.map((foto, idx) => {
              const isDefault = Boolean(foto.id && DEFAULT_GALERIA_IDS.has(foto.id));
              return (
                <div
                  key={foto.id ?? `galeria-${idx}`}
                  className="rounded-xl border border-[#2a2d36] p-4"
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-sm text-gray-300">
                      Foto #{idx + 1} {isDefault ? "(padrao)" : ""}
                    </span>
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
                        disabled={idx === 0}
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
                        disabled={idx === galeriaFotos.length - 1}
                      >
                        <ArrowDown size={14} />
                      </button>
                      {!isDefault ? (
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
                      ) : null}
                    </div>
                  </div>
                  <div className="mt-3 grid gap-3 md:grid-cols-2">
                    <ImageField
                      label="Imagem"
                      value={foto.src}
                      onChange={(value) => updateGaleriaFoto(idx, { src: value })}
                      onUpload={uploadImage}
                    />
                    <div className="flex flex-col gap-3">
                      <div>
                        <label className={labelClass}>Titulo</label>
                        <input
                          className={inputClass}
                          value={foto.titulo || ""}
                          onChange={(event) =>
                            updateGaleriaFoto(idx, { titulo: event.target.value })
                          }
                        />
                      </div>
                      <div>
                        <label className={labelClass}>Descricao curta</label>
                        <textarea
                          className={textareaClass}
                          rows={3}
                          value={foto.descricao || ""}
                          onChange={(event) =>
                            updateGaleriaFoto(idx, { descricao: event.target.value })
                          }
                        />
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
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
