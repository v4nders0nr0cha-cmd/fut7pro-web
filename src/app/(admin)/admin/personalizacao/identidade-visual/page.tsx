"use client";

import Head from "next/head";
import { useRef, useState } from "react";
import Image from "next/image";
import { FaUpload, FaCheckCircle } from "react-icons/fa";
import Cropper from "react-easy-crop";

const LOGO_PADRAO = "/images/logos/logo_fut7pro.png";

type LogoData = {
  url: string;
  nome: string;
};

export default function LogoDoRachaPage() {
  const [logo, setLogo] = useState<LogoData>({
    url: LOGO_PADRAO,
    nome: "Logo padrão Fut7Pro",
  });
  const [nomeRacha, setNomeRacha] = useState("Fut7Pro");
  const [uploading, setUploading] = useState(false);
  const [cropModalOpen, setCropModalOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Cropper states (mock)
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);

  function handleLogoUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setSelectedFile(file);
    setCropModalOpen(true);
  }

  function handleCropSave(e?: React.MouseEvent<HTMLButtonElement>) {
    if (e) e.preventDefault();
    if (!selectedFile) return;
    const url = URL.createObjectURL(selectedFile);
    setLogo({ url, nome: selectedFile.name });
    setCropModalOpen(false);
  }

  function handleNomeChange(e: React.ChangeEvent<HTMLInputElement>) {
    setNomeRacha(e.target.value.slice(0, 18));
  }

  return (
    <>
      <Head>
        <title>Personalizar Logo e Nome do Racha | Fut7Pro Painel Admin</title>
        <meta
          name="description"
          content="Personalize a logo e o nome do seu racha de futebol no painel admin Fut7Pro. SaaS de rachas, multi-tenant, customização visual total."
        />
        <meta
          name="keywords"
          content="Fut7Pro, logo, nome, personalização, racha, painel admin, futebol 7, SaaS"
        />
      </Head>
      <div className="mx-auto w-full max-w-2xl px-4 pb-24 pt-20 md:pb-8 md:pt-6">
        <h1 className="mb-6 text-center text-2xl font-bold text-white md:text-3xl">
          Identidade Visual do Racha
        </h1>
        <div className="flex flex-col items-center justify-center gap-4 rounded-2xl bg-[#191c22] p-6 shadow-lg">
          {/* Nome do racha */}
          <div className="mb-3 w-full max-w-xs">
            <label className="mb-2 block font-semibold text-yellow-300">
              Nome do Racha{" "}
              <span className="text-xs text-gray-400">(até 18 caracteres)</span>
            </label>
            <input
              type="text"
              className="w-full rounded border border-yellow-800 bg-[#181a1e] px-4 py-2 text-lg text-white focus:outline-none"
              placeholder="Digite o nome do seu racha"
              value={nomeRacha}
              onChange={handleNomeChange}
              maxLength={18}
            />
            <div className="mt-1 text-xs text-gray-400">
              Esse nome será exibido no cabeçalho e outras áreas do site.
            </div>
          </div>

          {/* Logo do racha */}
          <div className="flex h-40 w-40 items-center justify-center overflow-hidden rounded-full border-2 border-[#FFD600] bg-black shadow-md">
            <Image
              src={logo.url}
              alt={`Logo do racha ${nomeRacha}`}
              width={160}
              height={160}
              className="object-contain"
              priority
            />
          </div>
          <span className="mt-2 text-base font-medium text-white">
            {logo.nome}
          </span>
          <button
            type="button"
            className="mt-2 flex items-center gap-2 rounded-lg bg-[#FFD600] px-6 py-2 font-semibold text-black shadow transition hover:scale-105 active:scale-95"
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
          >
            <FaUpload /> Alterar Logo
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/png, image/jpeg"
            className="hidden"
            onChange={handleLogoUpload}
            aria-label="Upload logo do racha"
          />
          <div className="mt-1 text-center text-xs text-gray-400">
            Imagem recomendada: PNG transparente, 400×400px.
            <br />
            Apenas PNG ou JPG. Tamanho máx: 1MB.
          </div>
          <div className="mt-4 flex flex-col items-center gap-2">
            <div className="flex items-center gap-2 text-green-400">
              <FaCheckCircle />
              <span className="text-sm font-medium">Salvo automaticamente</span>
            </div>
            <span className="text-xs text-gray-500">
              Nome e logo visíveis em todas as telas públicas e do painel admin.
            </span>
          </div>
        </div>

        {/* Modal de Cropper */}
        {cropModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70">
            <div className="flex w-full max-w-lg flex-col items-center rounded-2xl bg-[#23272e] p-6 shadow-2xl">
              <h2 className="mb-3 text-lg font-bold text-white">
                Ajustar Logo
              </h2>
              <div className="relative mb-4 h-64 w-64 overflow-hidden rounded-lg bg-gray-900">
                <Cropper
                  image={selectedFile ? URL.createObjectURL(selectedFile) : ""}
                  crop={crop}
                  zoom={zoom}
                  aspect={1}
                  cropShape="round"
                  showGrid={false}
                  onCropChange={setCrop}
                  onZoomChange={setZoom}
                />
              </div>
              <div className="flex gap-3">
                <button
                  className="rounded bg-[#FFD600] px-4 py-2 font-bold text-black shadow transition hover:scale-105"
                  onClick={handleCropSave}
                >
                  Salvar
                </button>
                <button
                  className="rounded bg-gray-700 px-4 py-2 text-white transition hover:bg-gray-600"
                  onClick={() => setCropModalOpen(false)}
                >
                  Cancelar
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
