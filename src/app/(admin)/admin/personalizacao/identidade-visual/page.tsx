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
  const [logo, setLogo] = useState<LogoData>({ url: LOGO_PADRAO, nome: "Logo padrão Fut7Pro" });
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
      <div className="pt-20 pb-24 md:pt-6 md:pb-8 w-full max-w-2xl mx-auto px-4">
        <h1 className="text-2xl md:text-3xl font-bold text-white mb-6 text-center">
          Identidade Visual do Racha
        </h1>
        <div className="bg-[#191c22] rounded-2xl shadow-lg p-6 flex flex-col items-center justify-center gap-4">
          {/* Nome do racha */}
          <div className="w-full max-w-xs mb-3">
            <label className="block text-yellow-300 font-semibold mb-2">
              Nome do Racha <span className="text-xs text-gray-400">(até 18 caracteres)</span>
            </label>
            <input
              type="text"
              className="w-full rounded px-4 py-2 bg-[#181a1e] border border-yellow-800 text-white focus:outline-none text-lg"
              placeholder="Digite o nome do seu racha"
              value={nomeRacha}
              onChange={handleNomeChange}
              maxLength={18}
            />
            <div className="text-xs text-gray-400 mt-1">
              Esse nome será exibido no cabeçalho e outras áreas do site.
            </div>
          </div>

          {/* Logo do racha */}
          <div className="w-40 h-40 rounded-full overflow-hidden bg-black flex items-center justify-center shadow-md border-2 border-[#FFD600]">
            <Image
              src={logo.url}
              alt={`Logo do racha ${nomeRacha}`}
              width={160}
              height={160}
              className="object-contain"
              priority
            />
          </div>
          <span className="text-white text-base font-medium mt-2">{logo.nome}</span>
          <button
            type="button"
            className="mt-2 flex items-center gap-2 bg-[#FFD600] text-black px-6 py-2 rounded-lg font-semibold shadow hover:scale-105 active:scale-95 transition"
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
          <div className="text-gray-400 text-xs mt-1 text-center">
            Imagem recomendada: PNG transparente, 400×400px.
            <br />
            Apenas PNG ou JPG. Tamanho máx: 1MB.
          </div>
          <div className="mt-4 flex flex-col items-center gap-2">
            <div className="flex items-center gap-2 text-green-400">
              <FaCheckCircle />
              <span className="font-medium text-sm">Salvo automaticamente</span>
            </div>
            <span className="text-xs text-gray-500">
              Nome e logo visíveis em todas as telas públicas e do painel admin.
            </span>
          </div>
        </div>

        {/* Modal de Cropper */}
        {cropModalOpen && (
          <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center">
            <div className="bg-[#23272e] p-6 rounded-2xl shadow-2xl max-w-lg w-full flex flex-col items-center">
              <h2 className="text-lg font-bold text-white mb-3">Ajustar Logo</h2>
              <div className="relative w-64 h-64 bg-gray-900 rounded-lg overflow-hidden mb-4">
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
                  className="px-4 py-2 bg-[#FFD600] text-black font-bold rounded shadow hover:scale-105 transition"
                  onClick={handleCropSave}
                >
                  Salvar
                </button>
                <button
                  className="px-4 py-2 bg-gray-700 text-white rounded hover:bg-gray-600 transition"
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
