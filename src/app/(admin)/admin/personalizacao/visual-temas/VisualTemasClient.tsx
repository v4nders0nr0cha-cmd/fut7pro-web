"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { FaCheckCircle } from "react-icons/fa";
import { toast } from "react-hot-toast";
import { useMe } from "@/hooks/useMe";
import { useRachaPublic } from "@/hooks/useRachaPublic";
import {
  DEFAULT_RACHA_THEME_KEY,
  getRachaTheme,
  RACHA_THEMES,
  type RachaThemeKey,
} from "@/config/rachaThemes";

type ThemePreview = {
  src: string;
  filter?: string;
};

const THEME_PREVIEWS: Record<RachaThemeKey, ThemePreview> = {
  dourado_branco: { src: "/images/themes/theme_dourado_branco.png" },
  azul_royal: { src: "/images/themes/theme_azul_royal.png" },
  vermelho_rubi: { src: "/images/themes/theme_vermelho_rubi.png" },
  verde_esmeralda: { src: "/images/themes/theme_verde_esmeralda.png" },
  laranja_flame: { src: "/images/themes/theme_laranja_flame.png" },
  roxo_galaxy: { src: "/images/themes/theme_roxo_galaxy.png" },
};

export default function VisualTemasClient() {
  const router = useRouter();
  const { me, isLoading: isLoadingMe } = useMe();
  const tenantSlug = me?.tenant?.tenantSlug?.trim() || "";
  const shouldLoadRacha = Boolean(tenantSlug);
  const {
    racha,
    isLoading: isLoadingRacha,
    mutate,
  } = useRachaPublic(shouldLoadRacha ? tenantSlug : "");

  const [selectedKey, setSelectedKey] = useState<RachaThemeKey>(DEFAULT_RACHA_THEME_KEY);
  const [savedKey, setSavedKey] = useState<RachaThemeKey>(DEFAULT_RACHA_THEME_KEY);
  const [saving, setSaving] = useState(false);
  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    if (initialized || isLoadingMe || isLoadingRacha || !shouldLoadRacha) return;
    const resolved = getRachaTheme(racha?.themeKey ?? null).key;
    setSelectedKey(resolved);
    setSavedKey(resolved);
    setInitialized(true);
  }, [initialized, isLoadingMe, isLoadingRacha, racha?.themeKey, shouldLoadRacha]);

  const applyThemePreview = useCallback((key: RachaThemeKey) => {
    if (typeof document === "undefined") return;
    const root = document.querySelector<HTMLElement>("[data-theme]");
    if (root) {
      root.setAttribute("data-theme", key);
      return;
    }
    document.documentElement.setAttribute("data-theme", key);
  }, []);

  useEffect(() => {
    if (!initialized) return;
    applyThemePreview(selectedKey);
  }, [applyThemePreview, initialized, selectedKey]);

  useEffect(() => {
    if (!initialized) return;
    return () => {
      applyThemePreview(savedKey);
    };
  }, [applyThemePreview, initialized, savedKey]);

  const hasChanges = selectedKey !== savedKey;
  const disableActions = saving || isLoadingMe || isLoadingRacha;

  const selectedTheme = useMemo(() => getRachaTheme(selectedKey), [selectedKey]);

  const handleSelecionarTema = (key: RachaThemeKey) => {
    setSelectedKey(key);
  };

  const handleSalvar = async () => {
    if (!tenantSlug) {
      toast.error("Nao foi possivel identificar o racha. Refaca o login.");
      return;
    }
    if (!hasChanges) {
      toast("Tema ja esta aplicado.");
      return;
    }

    setSaving(true);
    try {
      const payload: { themeKey: RachaThemeKey; tenantSlug?: string } = {
        themeKey: selectedKey,
      };
      if (tenantSlug) {
        payload.tenantSlug = tenantSlug;
      }
      const response = await fetch("/api/admin/rachas/theme", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!response.ok) {
        const body = await response.text();
        let message = "Erro ao salvar tema.";
        if (body) {
          try {
            const parsed = JSON.parse(body) as { message?: string; error?: string };
            message = parsed.message || parsed.error || body;
          } catch {
            message = body;
          }
        }
        throw new Error(message);
      }

      setSavedKey(selectedKey);
      toast.success("Tema salvo com sucesso!");
      await mutate();
      router.refresh();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Erro ao salvar tema.");
    } finally {
      setSaving(false);
    }
  };

  if (isLoadingMe || isLoadingRacha) {
    return (
      <div className="pt-20 pb-24 md:pt-6 md:pb-8 w-full max-w-4xl mx-auto px-4 text-center">
        <div className="text-gray-300">Carregando temas...</div>
      </div>
    );
  }

  return (
    <div className="pt-20 pb-24 md:pt-6 md:pb-8 w-full max-w-4xl mx-auto px-4">
      <h1 className="text-2xl md:text-3xl font-bold text-white mb-6 text-center">
        Visual & Temas do Racha
      </h1>
      <div className="bg-[#191c22] rounded-2xl shadow-lg p-6 flex flex-col gap-6 items-center">
        <p className="text-gray-200 text-base text-center mb-2">
          Escolha uma paleta de cores para personalizar o visual do seu racha.
          <br />
          Todas as telas do painel e do site publico refletirao a identidade escolhida.
        </p>
        <div className="w-full grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {RACHA_THEMES.map((tema) => {
            const isAtivo = selectedKey === tema.key;
            const borderColor = tema.tokens.brand;
            const preview = THEME_PREVIEWS[tema.key];
            return (
              <button
                key={tema.key}
                className="flex flex-col items-center gap-3 p-4 rounded-2xl shadow transition border-2 outline-none"
                style={{
                  borderColor,
                  background: isAtivo ? "#23272e" : "#17191f",
                  boxShadow: isAtivo ? `0 0 0 3px ${borderColor}55` : undefined,
                }}
                onClick={() => handleSelecionarTema(tema.key)}
                aria-label={`Selecionar tema ${tema.name}`}
                aria-pressed={isAtivo}
                type="button"
                disabled={disableActions}
              >
                <div
                  className="w-16 h-16 rounded-full overflow-hidden border-2 flex items-center justify-center"
                  style={{ borderColor, background: "#000" }}
                >
                  <Image
                    src={preview.src}
                    alt={`Paleta ${tema.name} - visual racha de futebol 7 Fut7Pro`}
                    width={64}
                    height={64}
                    className="object-contain"
                    style={preview.filter ? { filter: preview.filter } : undefined}
                  />
                </div>
                <div className="flex flex-col items-center">
                  <span className="text-lg font-bold text-white">{tema.name}</span>
                  <span className="text-sm text-gray-300">{tema.subtitle}</span>
                </div>
                <div className="flex gap-1 mt-2">
                  {tema.swatches.map((cor) => (
                    <span
                      key={cor}
                      className="w-6 h-6 rounded-full border-2 border-[#23272e] shadow"
                      style={{ background: cor }}
                      aria-label={`Cor ${cor}`}
                    />
                  ))}
                </div>
                {isAtivo && (
                  <div
                    className="flex items-center gap-2 mt-2 font-semibold text-sm"
                    style={{ color: borderColor }}
                  >
                    <FaCheckCircle /> Selecionado
                  </div>
                )}
              </button>
            );
          })}
        </div>
        <button
          className="mt-6 bg-brand text-black px-8 py-3 rounded-lg font-bold shadow hover:scale-105 active:scale-95 transition disabled:opacity-60 disabled:cursor-not-allowed"
          onClick={handleSalvar}
          disabled={disableActions || !hasChanges}
        >
          {saving ? "Salvando..." : "Salvar Tema"}
        </button>
        {!hasChanges && (
          <div className="flex items-center gap-2 text-green-400 mt-2">
            <FaCheckCircle />
            <span className="font-medium text-sm">Tema aplicado: {selectedTheme.name}</span>
          </div>
        )}
      </div>
    </div>
  );
}
