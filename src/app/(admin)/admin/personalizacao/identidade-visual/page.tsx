"use client";

import Head from "next/head";
import { useRef, useState, useEffect } from "react";
import Image from "next/image";
import { FaUpload, FaCheckCircle } from "react-icons/fa";
import Cropper from "react-easy-crop";
import { toast } from "react-hot-toast";
import { useAboutAdmin } from "@/hooks/useAbout";
import { rachaConfig } from "@/config/racha.config";
import type { AboutData } from "@/types/about";

const LOGO_PADRAO = rachaConfig.logo || "/images/logos/logo_fut7pro.png";

type LogoData = {
  url: string;
  nome: string;
};

export default function LogoDoRachaPage() {
  const { about, update, isLoading } = useAboutAdmin();
  const [logo, setLogo] = useState<LogoData>({ url: LOGO_PADRAO, nome: "Logo padrao Fut7Pro" });
  const [nomeRacha, setNomeRacha] = useState(rachaConfig.nome || "Fut7Pro");
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [cropModalOpen, setCropModalOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Cropper states (mock)
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);

  useEffect(() => {
    if (about) {
      setLogo({
        url: about.logoUrl || LOGO_PADRAO,
        nome: about.nome || "Logo do racha",
      });
      setNomeRacha(about.nome || rachaConfig.nome || "Fut7Pro");
    }
  }, [about]);

  function handleLogoUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setSelectedFile(file);
    setCropModalOpen(true);
  }

  const toBase64 = (file: File) =>
    new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = () => reject(new Error("Falha ao ler imagem"));
      reader.readAsDataURL(file);
    });

  async function handleCropSave(e?: React.MouseEvent<HTMLButtonElement>) {
    if (e) e.preventDefault();
    if (!selectedFile) return;
    setUploading(true);
    try {
      const base64 = await toBase64(selectedFile);
      setLogo({ url: base64, nome: selectedFile.name });
      setCropModalOpen(false);
      setSelectedFile(null);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Erro ao processar a imagem");
    } finally {
      setUploading(false);
    }
  }

  function handleNomeChange(e: React.ChangeEvent<HTMLInputElement>) {
    setNomeRacha(e.target.value.slice(0, 18));
  }

  async function handleSalvarIdentidade() {
    setSaving(true);
    try {
      const nextData: AboutData = {
        ...(about || {}),
        nome: nomeRacha.trim() || rachaConfig.nome,
        logoUrl: logo.url || LOGO_PADRAO,
      };
      await update(nextData);
      toast.success("Identidade visual atualizada");
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Erro ao salvar identidade visual. Tente novamente."
      );
    } finally {
      setSaving(false);
    }
  }

  const disableActions = uploading || saving || isLoading;

  return (
    <>
      <Head>
        <title>Personalizar Logo e Nome do Racha | Fut7Pro Painel Admin</title>
        <meta
          name="description"
          content="Personalize a logo e o nome do seu racha de futebol no painel admin Fut7Pro. SaaS de rachas, multi-tenant, customizacao visual total."
        />
        <meta
          name="keywords"
          content="Fut7Pro, logo, nome, personalizacao, racha, painel admin, futebol 7, SaaS"
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
              Nome do Racha <span className="text-xs text-gray-400">(ate 18 caracteres)</span>
            </label>
            <input
              type="text"
              className="w-full rounded px-4 py-2 bg-[#181a1e] border border-yellow-800 text-white focus:outline-none text-lg"
              placeholder="Digite o nome do seu racha"
              value={nomeRacha}
              onChange={handleNomeChange}
              maxLength={18}
              disabled={disableActions}
            />
            <div className="text-xs text-gray-400 mt-1">
              Esse nome sera exibido no cabecalho e outras areas do site.
            </div>
          </div>

          {/* Logo do racha */}
          <div className="w-40 h-40 rounded-full overflow-hidden bg-black flex items-center justify-center shadow-md border-2 border-[#FFD600]">
            <Image
              src={logo.url || LOGO_PADRAO}
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
            disabled={disableActions}
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
            Imagem recomendada: PNG transparente, 400x400px.
            <br />
            Apenas PNG ou JPG. Tamanho max: 1MB.
          </div>
          <div className="mt-4 flex flex-col items-center gap-2">
            <div className="flex items-center gap-2 text-green-400">
              <FaCheckCircle />
              <span className="font-medium text-sm">
                {disableActions ? "Processando..." : "Pronto para salvar"}
              </span>
            </div>
            <span className="text-xs text-gray-500">
              Nome e logo ficam visiveis em todas as telas publicas e do painel.
            </span>
            <button
              className="mt-2 bg-yellow-400 hover:bg-yellow-500 text-black font-bold px-4 py-2 rounded-lg shadow transition disabled:opacity-70"
              onClick={handleSalvarIdentidade}
              disabled={disableActions}
            >
              {saving ? "Salvando..." : "Salvar identidade"}
            </button>
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
                  disabled={uploading}
                >
                  {uploading ? "Salvando..." : "Salvar"}
                </button>
                <button
                  className="px-4 py-2 bg-gray-700 text-white rounded hover:bg-gray-600 transition"
                  onClick={() => setCropModalOpen(false)}
                  disabled={uploading}
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
