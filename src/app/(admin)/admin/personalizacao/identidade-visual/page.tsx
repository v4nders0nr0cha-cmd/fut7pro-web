"use client";

import Head from "next/head";
import { useRef, useState, useEffect, useMemo } from "react";
import Image from "next/image";
import { FaUpload, FaCheckCircle } from "react-icons/fa";
import { toast } from "react-hot-toast";
import { useAboutAdmin } from "@/hooks/useAbout";
import { useMe } from "@/hooks/useMe";
import { useRacha } from "@/context/RachaContext";
import { rachaConfig } from "@/config/racha.config";
import type { AboutData } from "@/types/about";
import ImageCropperModal from "@/components/ImageCropperModal";
import RestrictAccess from "@/components/admin/RestrictAccess";
import { slugify } from "@/utils/slugify";

const LOGO_PADRAO = rachaConfig.logo || "/images/logos/logo_fut7pro.png";
const APP_PUBLIC_URL = (process.env.NEXT_PUBLIC_APP_URL || "https://app.fut7pro.com.br").replace(
  /\/+$/,
  ""
);

type LogoData = {
  url: string;
  nome: string;
};
type SlugStatus = "idle" | "checking" | "available" | "unavailable" | "invalid";

export default function LogoDoRachaPage() {
  const { about, update, isLoading } = useAboutAdmin();
  const { me, isLoading: isLoadingMe } = useMe();
  const { setTenantSlug } = useRacha();
  const tenantSlug = me?.tenant?.tenantSlug || rachaConfig.slug || "";
  const membershipRole = (me?.membership?.role || "").toUpperCase();
  const presidenteEmail = about?.presidente?.email?.toLowerCase() || null;
  const userEmail = me?.user?.email?.toLowerCase() || null;
  const isPresidente =
    membershipRole === "PRESIDENTE" ||
    (presidenteEmail && userEmail && presidenteEmail === userEmail);
  const [logo, setLogo] = useState<LogoData>({ url: LOGO_PADRAO, nome: "Logo padrao Fut7Pro" });
  const [nomeRacha, setNomeRacha] = useState("");
  const [saving, setSaving] = useState(false);
  const [cropImage, setCropImage] = useState<string | null>(null);
  const [slugStatus, setSlugStatus] = useState<SlugStatus>("idle");
  const [slugHint, setSlugHint] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (about) {
      const nomeAtual = about.nome?.trim() || "";
      const shouldPrefill = nomeAtual && nomeAtual.toLowerCase() !== "fut7pro";
      setLogo({
        url: about.logoUrl || LOGO_PADRAO,
        nome: about.nome || "Logo do racha",
      });
      setNomeRacha(shouldPrefill ? nomeAtual : "");
    }
  }, [about]);

  const slugPreview = useMemo(() => slugify(nomeRacha.trim()), [nomeRacha]);
  const slugChanged = Boolean(slugPreview && tenantSlug && slugPreview !== tenantSlug);
  const currentLink = useMemo(() => {
    const slug = tenantSlug || rachaConfig.slug;
    return `${APP_PUBLIC_URL}/${slug}`;
  }, [tenantSlug]);
  const nextLink = useMemo(() => {
    const slug = slugPreview || tenantSlug || rachaConfig.slug;
    return `${APP_PUBLIC_URL}/${slug}`;
  }, [slugPreview, tenantSlug]);

  useEffect(() => {
    if (!slugChanged) {
      setSlugStatus("idle");
      setSlugHint(null);
      return;
    }

    if (slugPreview.length < 3) {
      setSlugStatus("invalid");
      setSlugHint("Slug deve ter ao menos 3 caracteres.");
      return;
    }

    let active = true;
    setSlugStatus("checking");
    setSlugHint("Verificando disponibilidade do link...");
    const timeout = setTimeout(async () => {
      try {
        const res = await fetch(`/api/public/slug?value=${encodeURIComponent(slugPreview)}`);
        const data = await res.json().catch(() => null);
        if (!active) return;
        if (res.ok && data?.available) {
          setSlugStatus("available");
          setSlugHint("Link disponivel.");
        } else {
          setSlugStatus("unavailable");
          setSlugHint("Esse link ja esta em uso.");
        }
      } catch {
        if (!active) return;
        setSlugStatus("unavailable");
        setSlugHint("Nao foi possivel validar o link agora.");
      }
    }, 400);

    return () => {
      active = false;
      clearTimeout(timeout);
    };
  }, [slugChanged, slugPreview]);

  function handleLogoUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/") || file.size > 1_000_000) {
      toast.error("Envie uma imagem PNG ou JPG de ate 1MB.");
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      setCropImage(String(reader.result));
    };
    reader.onerror = () => toast.error("Falha ao ler imagem");
    reader.readAsDataURL(file);
  }

  function handleNomeChange(e: React.ChangeEvent<HTMLInputElement>) {
    setNomeRacha(e.target.value.slice(0, 18));
  }

  async function handleSalvarIdentidade() {
    const nomeDigitado = nomeRacha.trim();
    const shouldUpdateName = nomeDigitado.length > 0;
    if (slugChanged && slugStatus !== "available") {
      toast.error("Escolha um nome com link disponivel antes de salvar.");
      return;
    }
    if (slugChanged) {
      const confirmed = window.confirm(
        `O link publico do racha sera alterado para:\n${nextLink}\n\nDeseja continuar?`
      );
      if (!confirmed) {
        return;
      }
    }
    setSaving(true);
    try {
      const nextData: AboutData = {
        ...(about || {}),
        ...(shouldUpdateName ? { nome: nomeDigitado } : {}),
        logoUrl: logo.url || LOGO_PADRAO,
      };
      await update(nextData);

      if (tenantSlug) {
        const payload: Record<string, string> = {};
        if (shouldUpdateName) {
          payload.name = nomeDigitado;
        }
        if (shouldUpdateName && slugChanged) {
          payload.slug = slugPreview;
          payload.subdomain = slugPreview;
        }
        if (Object.keys(payload).length > 0) {
          const res = await fetch(`/api/admin/rachas/slug/${encodeURIComponent(tenantSlug)}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
          });
          if (!res.ok) {
            const body = await res.text();
            throw new Error(body || "Erro ao atualizar link do racha.");
          }
        }
      }

      toast.success("Identidade visual atualizada");
      if (slugChanged) {
        setTenantSlug(slugPreview);
        toast("Novo link publico: " + nextLink);
        toast("Se o painel nao atualizar, saia e entre novamente.");
      }
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Erro ao salvar identidade visual. Tente novamente."
      );
    } finally {
      setSaving(false);
    }
  }

  const disableActions = saving || isLoading || isLoadingMe;
  const disableSave = disableActions || (slugChanged && slugStatus !== "available");

  if (isLoadingMe || isLoading) {
    return (
      <div className="pt-20 pb-24 md:pt-6 md:pb-8 w-full max-w-2xl mx-auto px-4 text-center">
        <div className="text-gray-300">Carregando perfil...</div>
      </div>
    );
  }

  if (!isPresidente) {
    return (
      <div className="pt-20 pb-24 md:pt-6 md:pb-8 w-full max-w-2xl mx-auto px-4">
        <RestrictAccess msg="Apenas o Presidente pode editar a identidade visual do racha." />
      </div>
    );
  }

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
            <div className="text-xs text-gray-400 mt-1">
              Se nao quiser alterar o nome do racha, deixe o campo em branco e troque apenas a logo.
            </div>
            <div className="text-xs text-gray-400 mt-2">
              Link publico atual: <span className="text-yellow-300">{currentLink}</span>
            </div>
            {slugChanged && (
              <div className="mt-2 rounded-md border border-yellow-700/60 bg-[#121212] px-3 py-2">
                <div className="text-xs text-yellow-200">
                  Aviso: ao alterar o nome, o link publico do racha tambem muda.
                </div>
                <div className="text-xs text-gray-300 mt-1">
                  Novo link: <span className="text-yellow-300">{nextLink}</span>
                </div>
                {slugHint && (
                  <div
                    className={`text-xs mt-1 ${
                      slugStatus === "available"
                        ? "text-green-400"
                        : slugStatus === "checking"
                          ? "text-yellow-300"
                          : "text-red-400"
                    }`}
                  >
                    {slugHint}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Logo do racha */}
          <div className="w-40 h-40 rounded-full overflow-hidden bg-black flex items-center justify-center shadow-md border-2 border-[#FFD600]">
            <Image
              src={logo.url || LOGO_PADRAO}
              alt={`Logo do racha ${nomeRacha.trim() || about?.nome || "Racha"}`}
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
              disabled={disableSave}
            >
              {saving ? "Salvando..." : "Salvar identidade"}
            </button>
          </div>
        </div>

        {/* Modal de Cropper */}
        <ImageCropperModal
          open={!!cropImage}
          imageSrc={cropImage || ""}
          aspect={1}
          shape="round"
          title="Ajustar logo"
          onCancel={() => setCropImage(null)}
          onApply={(cropped) => {
            setLogo({ url: cropped, nome: "Logo ajustada" });
            setCropImage(null);
          }}
        />
      </div>
    </>
  );
}
