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
  const [campeoes, setCampeoes] = useState<(Jogador | null)[]>(
    Array(7).fill(null),
  );
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
    h = 400,
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
    if (
      !titulo ||
      !descricao ||
      !banner ||
      !logo ||
      campeoes.filter(Boolean).length === 0
    ) {
      setErro(
        "Preencha todos os campos obrigatórios e adicione pelo menos um campeão.",
      );
      return;
    }
    setErro("");
    onSave?.({ titulo, descricao, banner, logo, campeoes });
    onClose();
  }

  const idsSelecionados = campeoes.filter(Boolean).map((j) => j!.id);

  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85">
      <form
        className="max-h-[98vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-[#191b1f] p-6 shadow-2xl"
        onSubmit={handleSubmit}
      >
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-xl font-bold text-yellow-400">
            + Novo Grande Torneio
          </h2>
          <button
            type="button"
            className="text-xl text-gray-300 hover:text-yellow-400"
            onClick={onClose}
          >
            <FaTimes />
          </button>
        </div>

        {/* Título */}
        <div className="mb-3">
          <label className="text-sm font-medium text-gray-300">
            Título do Campeonato *
          </label>
          <input
            type="text"
            className="mt-1 w-full rounded border border-gray-600 bg-zinc-800 px-3 py-2 text-white focus:border-yellow-400"
            value={titulo}
            onChange={(e) => setTitulo(e.target.value)}
            required
            maxLength={40}
            placeholder="Ex: Torneio Matador 2025"
          />
        </div>

        {/* Descrição */}
        <div className="mb-3">
          <label className="text-sm font-medium text-gray-300">
            Descrição do Campeonato *
          </label>
          <textarea
            className="mt-1 w-full resize-none rounded border border-gray-600 bg-zinc-800 px-3 py-2 text-white focus:border-yellow-400"
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
          <label className="text-sm font-medium text-gray-300">
            Banner do Torneio (1200x400px) *
          </label>
          <div className="flex flex-col items-center gap-3 sm:flex-row">
            <button
              type="button"
              className="flex items-center gap-2 rounded bg-yellow-500 px-4 py-2 text-sm font-semibold text-black shadow hover:bg-yellow-600"
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
              <div className="relative mt-2 h-20 w-full sm:mt-0 sm:w-60">
                <Image
                  src={banner}
                  alt="Preview Banner"
                  fill
                  className="rounded border-2 border-yellow-400 object-cover"
                />
              </div>
            )}
          </div>
        </div>

        {/* Logo */}
        <div className="mb-3">
          <label className="text-sm font-medium text-gray-300">
            Logo do Time Campeão *
          </label>
          <div className="flex items-center gap-3">
            <button
              type="button"
              className="flex items-center gap-2 rounded bg-yellow-500 px-4 py-2 text-sm font-semibold text-black shadow hover:bg-yellow-600"
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
              <div className="relative h-20 w-20">
                <Image
                  src={logo}
                  alt="Preview Logo"
                  fill
                  className="rounded-full border-2 border-yellow-400 object-cover"
                />
              </div>
            )}
          </div>
        </div>

        {/* Vagas */}
        <div className="mb-3">
          <label className="text-sm font-medium text-gray-300">
            Quantidade de Campeões *
          </label>
          <input
            type="number"
            min={1}
            max={20}
            className="w-24 rounded border border-yellow-500 bg-zinc-800 px-3 py-1 text-lg font-bold text-yellow-200"
            value={qtdVagas}
            onChange={(e) => handleQtdVagasChange(Number(e.target.value))}
          />
        </div>

        {/* Campeões */}
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
          {campeoes.map((jogador, idx) => (
            <div
              key={idx}
              className="relative flex items-center gap-3 rounded-xl border border-yellow-600 bg-zinc-900 px-3 py-2"
            >
              {jogador ? (
                <>
                  <Image
                    src={
                      jogador.avatar ??
                      "/images/jogadores/jogador_padrao_01.jpg"
                    }
                    alt={`Avatar de ${jogador.nome}`}
                    width={34}
                    height={34}
                    className="rounded-full border border-yellow-300"
                  />
                  <div className="flex-1">
                    <span className="font-semibold text-white">
                      {jogador.nome}
                    </span>
                    <span className="ml-2 text-xs text-yellow-400">
                      {jogador.posicao}
                    </span>
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
                  className="flex flex-1 items-center gap-2 py-1 font-semibold text-yellow-300 hover:text-yellow-400"
                  onClick={() => setVagaEmSelecao(idx)}
                >
                  <FaUser className="text-lg" /> Adicione o jogador
                </button>
              )}
            </div>
          ))}
        </div>

        {erro && (
          <div className="mt-4 text-center text-sm font-bold text-red-400">
            {erro}
          </div>
        )}

        {/* Ações */}
        <div className="mt-6 flex justify-end gap-2">
          <button
            type="button"
            className="rounded bg-gray-700 px-4 py-2 font-semibold text-white hover:bg-gray-600"
            onClick={onClose}
          >
            Cancelar
          </button>
          <button
            type="submit"
            className="rounded bg-yellow-500 px-5 py-2 font-bold text-black hover:bg-yellow-600"
          >
            Salvar Torneio
          </button>
        </div>

        {/* Modal de crop */}
        {cropping && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90">
            <div className="w-full max-w-3xl rounded-xl bg-[#1c1e22] p-6 shadow-2xl">
              <h3 className="mb-2 text-lg font-bold text-yellow-400">
                Ajuste o Banner (proporção 3:1)
              </h3>
              <div className="relative h-48 w-full overflow-hidden rounded bg-black sm:h-64">
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
              <div className="mt-4 flex justify-end gap-2">
                <button
                  type="button"
                  className="rounded bg-gray-600 px-4 py-2 text-white"
                  onClick={() => setCropping(false)}
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  className="rounded bg-yellow-500 px-4 py-2 font-bold text-black"
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
