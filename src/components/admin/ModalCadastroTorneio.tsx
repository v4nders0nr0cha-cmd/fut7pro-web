"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import Cropper from "react-easy-crop";
import { FaTimes, FaUpload, FaUser, FaUserPlus } from "react-icons/fa";
import type { Jogador, DadosTorneio } from "@/types/torneio";

// MOCK LOCAL
const MOCK_JOGADORES: Jogador[] = [
  {
    id: "1",
    nome: "Carlos Silva",
    posicao: "Goleiro",
    avatar: "/images/jogadores/jogador_padrao_01.jpg",
  },
  {
    id: "2",
    nome: "Lucas Souza",
    posicao: "Zagueiro",
    avatar: "/images/jogadores/jogador_padrao_02.jpg",
  },
  {
    id: "3",
    nome: "Renan Costa",
    posicao: "Meia",
    avatar: "/images/jogadores/jogador_padrao_03.jpg",
  },
  {
    id: "4",
    nome: "João Alpha",
    posicao: "Atacante",
    avatar: "/images/jogadores/jogador_padrao_04.jpg",
  },
  {
    id: "5",
    nome: "Bruno Beta",
    posicao: "Zagueiro",
    avatar: "/images/jogadores/jogador_padrao_05.jpg",
  },
  {
    id: "6",
    nome: "Thiago Lima",
    posicao: "Meia",
    avatar: "/images/jogadores/jogador_padrao_06.jpg",
  },
];

const slugify = (text: string) =>
  text
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "");

interface Props {
  open: boolean;
  onClose: () => void;
  onSave?: (dados: DadosTorneio) => void;
}

export default function ModalCadastroTorneio({ open, onClose, onSave }: Props) {
  const [titulo, setTitulo] = useState("");
  const [descricao, setDescricao] = useState("");
  const [banner, setBanner] = useState<string | null>(null);
  const [logo, setLogo] = useState<string | null>(null);
  const [qtdVagas, setQtdVagas] = useState(7);
  const [campeoes, setCampeoes] = useState<(Jogador | null)[]>(Array(7).fill(null));
  const [erro, setErro] = useState("");

  const [cropping, setCropping] = useState(false);
  const [cropSrc, setCropSrc] = useState("");
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<any>(null);

  const [vagaEmSelecao, setVagaEmSelecao] = useState<number | null>(null);
  const inputBannerRef = useRef<HTMLInputElement>(null);
  const inputLogoRef = useRef<HTMLInputElement>(null);

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
    await new Promise((res) => (img.onload = res));
    const canvas = document.createElement("canvas");
    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("Contexto nulo");
    ctx.drawImage(img, area.x, area.y, area.width, area.height, 0, 0, w, h);
    return canvas.toDataURL("image/jpeg", 0.92);
  }

  async function handleCropConfirm() {
    if (!croppedAreaPixels || !cropSrc) return;
    const croppedImage = await getCroppedImg(cropSrc, croppedAreaPixels);
    setBanner(croppedImage);
    setCropping(false);
  }

  function handleLogoUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => setLogo(reader.result as string);
    reader.readAsDataURL(file);
  }

  function handleSelectJogador(vaga: number, jogador: Jogador) {
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

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!titulo || !descricao || !banner || !logo || campeoes.filter(Boolean).length === 0) {
      setErro("Preencha todos os campos obrigat�rios e adicione pelo menos um campe�o.");

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

    const payload: DadosTorneio = {
      nome: titulo.trim(),

      slug: slugify(titulo),

      ano: new Date().getFullYear(),

      descricao,

      descricaoResumida: descricao.slice(0, 180),

      campeao: jogadoresMapeados[0]?.nome,

      status: "rascunho",

      destacarNoSite: false,

      bannerBase64: banner,

      logoBase64: logo,

      jogadoresCampeoes: jogadoresMapeados,
    };

    setErro("");

    onSave?.(payload);

    onClose();
  }

  const idsSelecionados = campeoes.filter(Boolean).map((j) => j!.id);

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

        {/* Título */}
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

        {/* Descrição */}
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
            >
              <FaUpload /> Selecionar Imagem
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
        </div>

        {/* Logo */}
        <div className="mb-3">
          <label className="text-gray-300 font-medium text-sm">Logo do Time Campeão *</label>
          <div className="flex gap-3 items-center">
            <button
              type="button"
              className="flex items-center gap-2 bg-yellow-500 hover:bg-yellow-600 text-black font-semibold px-4 py-2 rounded shadow text-sm"
              onClick={() => inputLogoRef.current?.click()}
            >
              <FaUpload /> Selecionar Logo
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

        {/* Campeões */}
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

        {/* Ações */}
        <div className="flex justify-end gap-2 mt-6">
          <button
            type="button"
            className="bg-gray-700 text-white px-4 py-2 rounded font-semibold hover:bg-gray-600"
            onClick={onClose}
          >
            Cancelar
          </button>
          <button
            type="submit"
            className="bg-yellow-500 hover:bg-yellow-600 text-black px-5 py-2 rounded font-bold"
          >
            Salvar Torneio
          </button>
        </div>

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
      </form>
    </div>
  );
}
