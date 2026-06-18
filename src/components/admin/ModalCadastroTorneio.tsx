"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import Cropper from "react-easy-crop";
import { FaTimes, FaUpload, FaUser, FaTrash } from "react-icons/fa";
import type { DadosTorneio, Posicao, Torneio } from "@/types/torneio";
import type { Jogador } from "@/types/jogador";

type JogadorSelecionavel = Pick<Jogador, "id" | "nome" | "avatar" | "posicao" | "slug"> &
  Partial<Jogador>;
import { useJogadores } from "@/hooks/useJogadores";
import { useRacha } from "@/context/RachaContext";
import { Fut7DestructiveDialog } from "@/components/ui/feedback";

type UploadState = "idle" | "uploading" | "uploaded" | "failed";

const slugify = (text: string) =>
  text
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "");

const normalizeSearch = (text: string) =>
  text
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();

const toDateInputValue = (value?: string | null) => {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return date.toISOString().slice(0, 10);
};

const readApiError = async (res: Response, fallback: string) => {
  const text = await res.text().catch(() => "");
  if (!text) return fallback;
  try {
    const data = JSON.parse(text);
    return data?.message || data?.error || fallback;
  } catch {
    return text || fallback;
  }
};

interface Props {
  open: boolean;
  onClose: () => void;
  onSave?: (dados: DadosTorneio) => Promise<void> | void;
  onDelete?: (id: string) => Promise<void> | void;
  torneio?: Torneio | null;
}

export default function ModalCadastroTorneio({ open, onClose, onSave, onDelete, torneio }: Props) {
  const [titulo, setTitulo] = useState("");
  const [descricao, setDescricao] = useState("");
  const [campeao, setCampeao] = useState("");
  const [dataInicio, setDataInicio] = useState("");
  const [dataFim, setDataFim] = useState("");
  const [banner, setBanner] = useState<string | null>(null);
  const [logo, setLogo] = useState<string | null>(null);
  const [bannerUrl, setBannerUrl] = useState<string | null>(null);
  const [logoUrl, setLogoUrl] = useState<string | null>(null);
  const [bannerUploadState, setBannerUploadState] = useState<UploadState>("idle");
  const [logoUploadState, setLogoUploadState] = useState<UploadState>("idle");
  const [qtdVagas, setQtdVagas] = useState(7);
  const [campeoes, setCampeoes] = useState<(JogadorSelecionavel | null)[]>(Array(7).fill(null));
  const [erro, setErro] = useState("");
  const [salvando, setSalvando] = useState(false);
  const [premioTotal, setPremioTotal] = useState<number | null>(null);
  const [premioMvp, setPremioMvp] = useState<string>("");
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);

  const [cropping, setCropping] = useState(false);
  const [cropSrc, setCropSrc] = useState("");
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<any>(null);

  const [vagaEmSelecao, setVagaEmSelecao] = useState<number | null>(null);
  const [buscaJogador, setBuscaJogador] = useState("");
  const inputBannerRef = useRef<HTMLInputElement>(null);
  const inputLogoRef = useRef<HTMLInputElement>(null);
  const { rachaId } = useRacha();
  const { jogadores, isLoading: loadingJogadores } = useJogadores(rachaId);
  const isEdicao = Boolean(torneio);

  const jogadoresDisponiveis: JogadorSelecionavel[] = useMemo(() => {
    const mapPosicao = (posicao?: string): Posicao => {
      const value = String(posicao || "").toLowerCase();
      if (value.startsWith("gol")) return "Goleiro";
      if (value.startsWith("zag")) return "Zagueiro";
      if (value.startsWith("ata")) return "Atacante";
      return "Meia";
    };

    return (jogadores || []).map((j) => ({
      id: j.id,
      nome: j.nome || j.apelido || "Jogador",
      apelido: j.apelido || "",
      avatar: j.avatar || j.foto || "/images/jogadores/jogador_padrao_01.jpg",
      posicao: mapPosicao(j.posicao),
      slug: (j as any).slug ?? slugify(j.nome || j.apelido || j.id),
    }));
  }, [jogadores]);

  const extensionByMime: Record<string, string> = {
    "image/jpeg": "jpg",
    "image/png": "png",
    "image/webp": "webp",
  };

  async function uploadArquivo(file: Blob, tipo: "banner" | "logo") {
    const mimeType = file.type || "image/jpeg";
    const extension = extensionByMime[mimeType] || "jpg";
    const formData = new FormData();
    formData.append("file", file, `${tipo}-${Date.now()}.${extension}`);
    formData.append("type", tipo);

    const res = await fetch("/api/admin/torneios/upload", {
      method: "POST",
      body: formData,
    }).catch(() => {
      throw new Error("Nao foi possivel conectar ao servidor de upload.");
    });
    if (!res.ok) throw new Error(await readApiError(res, "Falha no upload"));
    const data = await res.json();
    const uploaded = data?.url || data?.path || data?.publicUrl || null;
    if (!uploaded) throw new Error("Upload concluído, mas nenhuma URL foi retornada.");
    return uploaded;
  }

  function handleQtdVagasChange(v: number) {
    setQtdVagas(v);
    setCampeoes((old) => {
      const novos = [...old];
      if (novos.length > v) return novos.slice(0, v);
      while (novos.length < v) novos.push(null);
      return novos;
    });
  }

  function handleBannerUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setErro("");
    setBannerUrl(null);
    setBannerUploadState("idle");
    const reader = new FileReader();
    reader.onloadend = () => {
      setCropSrc(reader.result as string);
      setCropping(true);
    };
    reader.readAsDataURL(file);
  }

  async function getCroppedImg(
    src: string,
    area: { x: number; y: number; width: number; height: number },
    w = 1200,
    h = 400
  ) {
    const img = new window.Image() as HTMLImageElement;
    img.src = src;
    await new Promise((resolve, reject) => {
      img.onload = resolve;
      img.onerror = () => reject(new Error("Falha ao carregar a imagem do banner."));
    });
    const canvas = document.createElement("canvas");
    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("Contexto nulo");
    ctx.drawImage(img, area.x, area.y, area.width, area.height, 0, 0, w, h);
    const preview = canvas.toDataURL("image/jpeg", 0.92);
    return new Promise<{ file: File; preview: string }>((resolve, reject) => {
      canvas.toBlob(
        (blob) => {
          if (!blob) {
            reject(new Error("Falha ao preparar o banner recortado."));
            return;
          }
          const file = new File([blob], `banner-${Date.now()}.jpg`, { type: "image/jpeg" });
          resolve({ file, preview });
        },
        "image/jpeg",
        0.92
      );
    });
  }

  async function handleCropConfirm() {
    if (!croppedAreaPixels || !cropSrc) return;
    setBannerUrl(null);
    setBannerUploadState("uploading");
    setErro("");
    try {
      const croppedImage = await getCroppedImg(cropSrc, croppedAreaPixels);
      setBanner(croppedImage.preview);
      const uploaded = await uploadArquivo(croppedImage.file, "banner");
      setBannerUrl(uploaded);
      setBannerUploadState("uploaded");
    } catch (err) {
      setBannerUploadState("failed");
      setErro(err instanceof Error ? err.message : "Falha ao enviar banner.");
    } finally {
      setCropping(false);
    }
  }

  function handleLogoUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setErro("");
    setLogoUrl(null);
    setLogoUploadState("uploading");
    const reader = new FileReader();
    reader.onloadend = () => setLogo(reader.result as string);
    reader.readAsDataURL(file);

    uploadArquivo(file, "logo")
      .then((uploaded) => {
        setLogoUrl(uploaded);
        setLogoUploadState("uploaded");
      })
      .catch((err) => {
        setLogoUploadState("failed");
        setErro(err instanceof Error ? err.message : "Falha ao enviar logo.");
      });
  }

  function handleSelectJogador(vaga: number, jogador: JogadorSelecionavel) {
    setCampeoes((prev) => {
      const atual = [...prev];
      atual[vaga] = jogador;
      return atual;
    });
  }

  function handleRemoverJogador(vaga: number) {
    setCampeoes((prev) => {
      const atual = [...prev];
      atual[vaga] = null;
      return atual;
    });
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    const resolvedBannerUrl = bannerUrl || torneio?.bannerUrl || "";
    const resolvedLogoUrl = logoUrl || torneio?.logoUrl || "";
    const pendencias: string[] = [];

    if (!titulo.trim()) pendencias.push("Informe o título do campeonato.");
    if (!descricao.trim()) pendencias.push("Informe a descrição do campeonato.");
    if (!campeao.trim()) pendencias.push("Informe o nome do time campeão.");
    if (!dataInicio) pendencias.push("Informe a data de início.");
    if (campeoes.filter(Boolean).length === 0) {
      pendencias.push("Adicione pelo menos um campeão.");
    }
    if (bannerUploadState === "uploading") pendencias.push("Aguarde o envio do banner terminar.");
    if (logoUploadState === "uploading") pendencias.push("Aguarde o envio da logo terminar.");
    if (!resolvedBannerUrl) pendencias.push("Envie o banner do torneio.");
    if (!resolvedLogoUrl) pendencias.push("Envie a logo do time campeao.");

    if (pendencias.length > 0) {
      setErro(pendencias.join(" "));
      return;
    }

    const jogadoresMapeados = campeoes
      .filter((jogador): jogador is Jogador => Boolean(jogador))
      .map((jogador) => ({
        athleteId: jogador.id,
        athleteSlug: jogador.slug ?? slugify(jogador.nome),
        nome: jogador.nome,
        posicao: jogador.posicao,
        fotoUrl: jogador.avatar,
      }));

    const dateForYear = dataInicio || dataFim;
    const resolvedAno = dateForYear
      ? new Date(dateForYear).getFullYear()
      : (torneio?.ano ?? new Date().getFullYear());

    const payload: DadosTorneio = {
      nome: titulo.trim(),
      slug: torneio?.slug ?? slugify(titulo),
      ano: resolvedAno,
      descricao,
      descricaoResumida: descricao.slice(0, 180),
      campeao: campeao.trim(),
      status: torneio?.status ?? "publicado",
      destacarNoSite: false,
      bannerUrl: resolvedBannerUrl || undefined,
      logoUrl: resolvedLogoUrl || undefined,
      dataInicio: dataInicio || undefined,
      dataFim: dataFim || undefined,
      jogadoresCampeoes: jogadoresMapeados.length
        ? jogadoresMapeados
        : ((torneio?.jogadoresCampeoes as any) ?? []),
      premioTotal: premioTotal ?? torneio?.premioTotal,
      premioMvp: premioMvp || torneio?.mvp,
      // campos extras para update
      ...(torneio?.id ? { id: torneio.id, rachaId: torneio.rachaId } : {}),
    };

    setErro("");

    try {
      setSalvando(true);
      await onSave?.(payload);
      onClose();
    } catch (err) {
      setErro(err instanceof Error ? err.message : "Falha ao salvar torneio.");
    } finally {
      setSalvando(false);
    }
  }

  const idsSelecionados = campeoes.filter(Boolean).map((j) => j!.id);
  const jogadoresFiltrados = useMemo(() => {
    const termo = normalizeSearch(buscaJogador.trim());
    return jogadoresDisponiveis
      .filter((j) => !idsSelecionados.includes(j.id))
      .filter((j) => {
        if (!termo) return true;
        const alvo = normalizeSearch(`${j.nome} ${j.apelido ?? ""} ${j.posicao}`);
        return alvo.includes(termo);
      });
  }, [buscaJogador, idsSelecionados, jogadoresDisponiveis]);

  // Preenche estado em modo edicao
  useEffect(() => {
    if (!torneio || !open) return;
    setTitulo(torneio.nome || "");
    setDescricao(torneio.descricao || "");
    setCampeao(torneio.campeao || "");
    setDataInicio(toDateInputValue(torneio.dataInicio));
    setDataFim(toDateInputValue(torneio.dataFim));
    setQtdVagas(torneio.jogadoresCampeoes?.length || 7);
    setPremioTotal(torneio.premioTotal ?? null);
    setPremioMvp(torneio.mvp ?? "");
    setCampeoes(
      (torneio.jogadoresCampeoes || []).map((j: any) => ({
        id: j.athleteId || j.id || j.athleteSlug || "",
        nome: j.nome || "",
        avatar: j.fotoUrl || j.avatar || "/images/jogadores/jogador_padrao_01.jpg",
        posicao: (j.posicao as Posicao) || "Meia",
        slug: j.athleteSlug || j.slug,
      }))
    );
    setBanner(torneio.banner || torneio.bannerUrl || null);
    setLogo(torneio.logo || torneio.logoUrl || null);
    setBannerUrl(torneio.bannerUrl || torneio.banner || null);
    setLogoUrl(torneio.logoUrl || torneio.logo || null);
    setBannerUploadState(torneio.bannerUrl || torneio.banner ? "uploaded" : "idle");
    setLogoUploadState(torneio.logoUrl || torneio.logo ? "uploaded" : "idle");
    setErro("");
  }, [torneio, open]);

  // Reseta campos ao abrir para criar novo
  useEffect(() => {
    if (!open || torneio) return;
    setTitulo("");
    setDescricao("");
    setCampeao("");
    setDataInicio("");
    setDataFim("");
    setQtdVagas(7);
    setPremioTotal(null);
    setPremioMvp("");
    setCampeoes(Array(7).fill(null));
    setBanner(null);
    setLogo(null);
    setBannerUrl(null);
    setLogoUrl(null);
    setBannerUploadState("idle");
    setLogoUploadState("idle");
    setErro("");
  }, [open, torneio]);

  useEffect(() => {
    if (vagaEmSelecao !== null) {
      setBuscaJogador("");
    }
  }, [vagaEmSelecao]);

  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 bg-black/85 flex items-center justify-center">
      <form
        className="bg-[#191b1f] rounded-2xl p-6 max-w-2xl w-full shadow-2xl overflow-y-auto max-h-[98vh]"
        onSubmit={handleSubmit}
      >
        <div className="flex justify-between items-center mb-3">
          <h2 className="text-xl font-bold text-yellow-400">+ Novo Grande Torneio</h2>
          <button
            type="button"
            className="text-gray-300 hover:text-yellow-400 text-xl"
            onClick={onClose}
          >
            <FaTimes />
          </button>
        </div>

        {/* Titulo */}
        <div className="mb-3">
          <label className="text-gray-300 font-medium text-sm">Título do Campeonato *</label>
          <input
            type="text"
            className="mt-1 rounded px-3 py-2 w-full bg-zinc-800 text-white border border-gray-600 focus:border-yellow-400"
            value={titulo}
            onChange={(e) => setTitulo(e.target.value)}
            required
            maxLength={40}
            placeholder="Ex: Torneio Matador 2025"
          />
        </div>

        {/* Descricao */}
        <div className="mb-3">
          <label className="text-gray-300 font-medium text-sm">Descrição do Campeonato *</label>
          <textarea
            className="mt-1 rounded px-3 py-2 w-full bg-zinc-800 text-white border border-gray-600 focus:border-yellow-400 resize-none"
            value={descricao}
            onChange={(e) => setDescricao(e.target.value)}
            required
            rows={3}
            maxLength={200}
            placeholder="Ex: Edição especial realizada em 2025 com os melhores jogadores do racha."
          />
        </div>

        {/* Data do evento */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
          <div>
            <label className="text-gray-300 font-medium text-sm">Data início *</label>
            <input
              type="date"
              className="mt-1 rounded px-3 py-2 w-full bg-zinc-800 text-white border border-gray-600 focus:border-yellow-400"
              value={dataInicio}
              onChange={(e) => setDataInicio(e.target.value)}
              required
            />
          </div>
          <div>
            <label className="text-gray-300 font-medium text-sm">Data fim (opcional)</label>
            <input
              type="date"
              className="mt-1 rounded px-3 py-2 w-full bg-zinc-800 text-white border border-gray-600 focus:border-yellow-400"
              value={dataFim}
              onChange={(e) => setDataFim(e.target.value)}
            />
          </div>
        </div>

        {/* Time campeao */}
        <div className="mb-3">
          <label className="text-gray-300 font-medium text-sm">Time campeão (nome) *</label>
          <input
            type="text"
            className="mt-1 rounded px-3 py-2 w-full bg-zinc-800 text-white border border-gray-600 focus:border-yellow-400"
            value={campeao}
            onChange={(e) => setCampeao(e.target.value)}
            required
            maxLength={60}
            placeholder="Ex: Time Azul"
          />
        </div>

        {/* Banner */}
        <div className="mb-3">
          <label className="text-gray-300 font-medium text-sm">
            Banner do Torneio (1200x400px) *
          </label>
          <div className="flex flex-col sm:flex-row gap-3 items-center">
            <button
              type="button"
              className="flex items-center gap-2 bg-yellow-500 hover:bg-yellow-600 text-black font-semibold px-4 py-2 rounded shadow text-sm"
              onClick={() => inputBannerRef.current?.click()}
              disabled={bannerUploadState === "uploading"}
            >
              <FaUpload /> {bannerUploadState === "uploading" ? "Enviando..." : "Selecionar Imagem"}
            </button>
            <input
              ref={inputBannerRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleBannerUpload}
            />
            {banner && (
              <div className="w-full sm:w-60 h-20 relative mt-2 sm:mt-0">
                <Image
                  src={banner}
                  alt="Preview Banner"
                  fill
                  className="object-cover rounded border-2 border-yellow-400"
                />
              </div>
            )}
          </div>
          {bannerUploadState === "uploaded" && (
            <p className="mt-1 text-xs font-semibold text-green-400">Banner enviado.</p>
          )}
          {bannerUploadState === "failed" && (
            <p className="mt-1 text-xs font-semibold text-red-400">
              Falha ao enviar banner. Selecione a imagem novamente.
            </p>
          )}
        </div>

        {/* Logo */}
        <div className="mb-3">
          <label className="text-gray-300 font-medium text-sm">Logo do Time Campeão *</label>
          <div className="flex gap-3 items-center">
            <button
              type="button"
              className="flex items-center gap-2 bg-yellow-500 hover:bg-yellow-600 text-black font-semibold px-4 py-2 rounded shadow text-sm"
              onClick={() => inputLogoRef.current?.click()}
              disabled={logoUploadState === "uploading"}
            >
              <FaUpload /> {logoUploadState === "uploading" ? "Enviando..." : "Selecionar Logo"}
            </button>
            <input
              ref={inputLogoRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleLogoUpload}
            />
            {logo && (
              <div className="w-20 h-20 relative">
                <Image
                  src={logo}
                  alt="Preview Logo"
                  fill
                  className="object-cover rounded-full border-2 border-yellow-400"
                />
              </div>
            )}
          </div>
          {logoUploadState === "uploaded" && (
            <p className="mt-1 text-xs font-semibold text-green-400">Logo enviada.</p>
          )}
          {logoUploadState === "failed" && (
            <p className="mt-1 text-xs font-semibold text-red-400">
              Falha ao enviar logo. Selecione a logo novamente.
            </p>
          )}
        </div>

        {/* Vagas */}
        <div className="mb-3">
          <label className="text-gray-300 font-medium text-sm">Quantidade de Campeões *</label>
          <input
            type="number"
            min={1}
            max={20}
            className="bg-zinc-800 text-yellow-200 rounded px-3 py-1 w-24 border border-yellow-500 text-lg font-bold"
            value={qtdVagas}
            onChange={(e) => handleQtdVagasChange(Number(e.target.value))}
          />
        </div>

        {/* Premiacoes */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
          <div>
            <label className="text-gray-300 font-medium text-sm">Premiação Total (R$)</label>
            <input
              type="number"
              min={0}
              step="0.01"
              className="mt-1 rounded px-3 py-2 w-full bg-zinc-800 text-white border border-gray-600 focus:border-yellow-400"
              value={premioTotal ?? ""}
              onChange={(e) =>
                setPremioTotal(e.target.value === "" ? null : Number(e.target.value))
              }
              placeholder="Ex: 500.00"
            />
          </div>
          <div>
            <label className="text-gray-300 font-medium text-sm">Premiação MVP</label>
            <input
              type="text"
              className="mt-1 rounded px-3 py-2 w-full bg-zinc-800 text-white border border-gray-600 focus:border-yellow-400"
              value={premioMvp}
              onChange={(e) => setPremioMvp(e.target.value)}
              maxLength={60}
              placeholder="Ex: Troféu + Voucher"
            />
          </div>
        </div>

        {/* Campeoes */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {campeoes.map((jogador, idx) => (
            <div
              key={idx}
              className="flex items-center gap-3 bg-zinc-900 border border-yellow-600 rounded-xl px-3 py-2 relative"
            >
              {jogador ? (
                <>
                  <Image
                    src={jogador.avatar ?? "/images/jogadores/jogador_padrao_01.jpg"}
                    alt={`Avatar de ${jogador.nome}`}
                    width={34}
                    height={34}
                    className="rounded-full border border-yellow-300"
                  />
                  <div className="flex-1">
                    <span className="font-semibold text-white">{jogador.nome}</span>
                    <span className="text-xs text-yellow-400 ml-2">{jogador.posicao}</span>
                  </div>
                  <button
                    type="button"
                    className="ml-2 text-red-400 hover:text-red-700"
                    onClick={() => handleRemoverJogador(idx)}
                  >
                    <FaTimes />
                  </button>
                </>
              ) : (
                <button
                  type="button"
                  className="flex-1 flex items-center gap-2 text-yellow-300 hover:text-yellow-400 font-semibold py-1"
                  onClick={() => setVagaEmSelecao(idx)}
                >
                  <FaUser className="text-lg" /> Adicione o jogador
                </button>
              )}
            </div>
          ))}
        </div>

        {erro && <div className="text-red-400 font-bold text-sm mt-4 text-center">{erro}</div>}

        {/* Acoes */}
        <div className="flex justify-end gap-2 mt-6">
          {isEdicao && torneio?.id && onDelete && (
            <button
              type="button"
              className="bg-red-600 text-white px-4 py-2 rounded font-semibold hover:bg-red-500"
              onClick={() => setDeleteConfirmOpen(true)}
            >
              <FaTrash className="inline mr-1" /> Excluir
            </button>
          )}
          <button
            type="button"
            className="bg-gray-700 text-white px-4 py-2 rounded font-semibold hover:bg-gray-600"
            onClick={onClose}
          >
            Cancelar
          </button>
          <button
            type="submit"
            className="bg-yellow-500 hover:bg-yellow-600 text-black px-5 py-2 rounded font-bold disabled:opacity-60 disabled:pointer-events-none"
            disabled={
              salvando || bannerUploadState === "uploading" || logoUploadState === "uploading"
            }
          >
            {salvando
              ? "Salvando..."
              : bannerUploadState === "uploading" || logoUploadState === "uploading"
                ? "Aguardando uploads..."
                : "Salvar Torneio"}
          </button>
        </div>

        {/* Selecionar campeao */}
        {vagaEmSelecao !== null && (
          <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center">
            <div className="bg-[#1c1e22] rounded-xl p-5 shadow-2xl max-w-md w-full">
              <div className="flex justify-between items-center mb-3">
                <h3 className="text-lg font-bold text-yellow-400">Selecione o campeão</h3>
                <button
                  type="button"
                  className="text-gray-300 hover:text-yellow-400"
                  onClick={() => setVagaEmSelecao(null)}
                >
                  <FaTimes />
                </button>
              </div>
              {loadingJogadores && (
                <div className="text-sm text-gray-300">Carregando jogadores...</div>
              )}
              {!loadingJogadores && (
                <>
                  <input
                    type="text"
                    value={buscaJogador}
                    onChange={(e) => setBuscaJogador(e.target.value)}
                    placeholder="Buscar jogador..."
                    className="mb-3 w-full rounded bg-zinc-900 text-white text-sm px-3 py-2 border border-zinc-700 focus:border-yellow-400"
                  />
                  <div className="max-h-64 overflow-y-auto space-y-2 pr-1">
                    {jogadoresFiltrados.map((jogador) => (
                      <button
                        key={jogador.id}
                        type="button"
                        className="w-full flex items-center gap-2 bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 rounded px-3 py-2 text-left"
                        onClick={() => {
                          handleSelectJogador(vagaEmSelecao, jogador);
                          setVagaEmSelecao(null);
                        }}
                      >
                        <Image
                          src={jogador.avatar ?? "/images/jogadores/jogador_padrao_01.jpg"}
                          alt={`Avatar de ${jogador.nome}`}
                          width={32}
                          height={32}
                          className="rounded-full border border-yellow-300"
                        />
                        <div className="flex-1">
                          <p className="text-sm font-semibold text-white">{jogador.nome}</p>
                          <span className="text-xs text-yellow-400">{jogador.posicao}</span>
                        </div>
                      </button>
                    ))}
                    {jogadoresFiltrados.length === 0 && (
                      <p className="text-xs text-gray-300">Nenhum jogador encontrado.</p>
                    )}
                  </div>
                </>
              )}
            </div>
          </div>
        )}

        {/* Modal de crop */}
        {cropping && (
          <div className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center">
            <div className="bg-[#1c1e22] rounded-xl p-6 shadow-2xl max-w-3xl w-full">
              <h3 className="text-lg text-yellow-400 font-bold mb-2">
                Ajuste o Banner (proporção 3:1)
              </h3>
              <div className="relative w-full h-48 sm:h-64 bg-black rounded overflow-hidden">
                <Cropper
                  image={cropSrc}
                  crop={crop}
                  zoom={zoom}
                  aspect={3 / 1}
                  onCropChange={setCrop}
                  onZoomChange={setZoom}
                  onCropComplete={(_, cropped) => setCroppedAreaPixels(cropped)}
                />
              </div>
              <div className="flex justify-end gap-2 mt-4">
                <button
                  type="button"
                  className="bg-gray-600 text-white px-4 py-2 rounded"
                  onClick={() => setCropping(false)}
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  className="bg-yellow-500 text-black px-4 py-2 rounded font-bold"
                  onClick={handleCropConfirm}
                >
                  Confirmar Recorte
                </button>
              </div>
            </div>
          </div>
        )}
        <Fut7DestructiveDialog
          open={deleteConfirmOpen}
          title={`Excluir ${torneio?.nome || titulo || "torneio"}?`}
          description="Esta exclusão remove o torneio especial e os destaques vinculados a ele. Confirme apenas se o cadastro estiver incorreto."
          confirmLabel="Excluir torneio"
          cancelLabel="Manter torneio"
          impactItems={[
            "O torneio deixa de aparecer no painel e no site público.",
            "Os campeões deixam de exibir esse título especial.",
            "A ação deve ser reservada para erro de cadastro ou duplicidade.",
          ]}
          onClose={() => setDeleteConfirmOpen(false)}
          onConfirm={async () => {
            if (!torneio?.id || !onDelete) return;
            await onDelete(torneio.id);
            setDeleteConfirmOpen(false);
            onClose();
          }}
        />
      </form>
    </div>
  );
}
