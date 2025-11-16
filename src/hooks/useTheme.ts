"use client";

import { useState, useEffect, useCallback } from "react";
import { configuracoesApi } from "@/lib/api";
import { getTheme, applyTheme, type ThemeKey } from "@/config/themes";
import { toast } from "react-hot-toast";
import type {
  TenantConfigResponse,
  ThemeCatalogItem,
  ThemeCustomColors,
} from "@/types/configuracoes";
import { useThemeContext } from "@/context/ThemeContext";

export function useTheme() {
  const { themeKey: contextThemeKey, setThemeKey: setContextThemeKey } = useThemeContext();
  const [currentTheme, setCurrentTheme] = useState<ThemeKey>(contextThemeKey);
  const [availableThemes, setAvailableThemes] = useState<ThemeCatalogItem[]>([]);
  const [rachaConfig, setRachaConfig] = useState<TenantConfigResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setCurrentTheme(contextThemeKey);
  }, [contextThemeKey]);

  const syncThemeFromConfig = useCallback(
    (config: TenantConfigResponse) => {
      const resolvedKey = (config.theme ?? "amarelo") as ThemeKey;
      setCurrentTheme(resolvedKey);
      setContextThemeKey(resolvedKey, { customColors: config.customColors ?? null });
      setRachaConfig(config);
    },
    [setContextThemeKey]
  );

  // Carregar temas disponíveis da API
  const loadAvailableThemes = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await configuracoesApi.getTemas();
      if (response.data) {
        setAvailableThemes(response.data);
      } else if (response.error) {
        setError(response.error);
        toast.error("Erro ao carregar temas");
      }
    } catch {
      setError("Erro ao carregar temas");
      toast.error("Erro ao carregar temas");
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Carregar configurações do racha
  const loadRachaConfig = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await configuracoesApi.getRachaConfig();
      if (response.data) {
        syncThemeFromConfig(response.data);
      } else if (response.error) {
        setError(response.error);
      }
    } catch {
      setError("Erro ao carregar configurações do racha");
    } finally {
      setIsLoading(false);
    }
  }, [syncThemeFromConfig]);

  // Aplicar tema
  const applyThemeToRacha = useCallback(
    async (theme: ThemeKey) => {
      try {
        setIsLoading(true);
        setError(null);

        const response = await configuracoesApi.updateTema(theme);
        if (response.data) {
          syncThemeFromConfig(response.data);
          applyTheme(theme);
          toast.success("Tema aplicado com sucesso!");
          return true;
        } else if (response.error) {
          setError(response.error);
          toast.error("Erro ao aplicar tema");
          return false;
        }
      } catch {
        setError("Erro ao aplicar tema");
        toast.error("Erro ao aplicar tema");
        return false;
      } finally {
        setIsLoading(false);
      }
    },
    [syncThemeFromConfig]
  );

  // Atualizar cores customizadas
  const updateCustomColors = useCallback(
    async (colors: ThemeCustomColors) => {
      try {
        setIsLoading(true);
        setError(null);

        const response = await configuracoesApi.updateCores(colors);
        if (response.data) {
          syncThemeFromConfig(response.data);
          toast.success("Cores atualizadas com sucesso!");
          return true;
        } else if (response.error) {
          setError(response.error);
          toast.error("Erro ao atualizar cores");
          return false;
        }
      } catch {
        setError("Erro ao atualizar cores");
        toast.error("Erro ao atualizar cores");
        return false;
      } finally {
        setIsLoading(false);
      }
    },
    [syncThemeFromConfig]
  );

  // Atualizar configurações
  const updateSettings = useCallback(
    async (settings: Partial<TenantConfigResponse["settings"]>) => {
      try {
        setIsLoading(true);
        setError(null);

        const response = await configuracoesApi.updateConfiguracoes(settings);
        if (response.data) {
          syncThemeFromConfig(response.data);
          toast.success("Configurações atualizadas com sucesso!");
          return true;
        } else if (response.error) {
          setError(response.error);
          toast.error("Erro ao atualizar configurações");
          return false;
        }
      } catch {
        setError("Erro ao atualizar configurações");
        toast.error("Erro ao atualizar configurações");
        return false;
      } finally {
        setIsLoading(false);
      }
    },
    [syncThemeFromConfig]
  );

  // Resetar configurações
  const resetConfig = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await configuracoesApi.resetConfiguracoes();
      if (response.data) {
        syncThemeFromConfig(response.data);
        applyTheme("amarelo");
        toast.success("Configurações resetadas com sucesso!");
        return true;
      } else if (response.error) {
        setError(response.error);
        toast.error("Erro ao resetar configurações");
        return false;
      }
    } catch {
      setError("Erro ao resetar configurações");
      toast.error("Erro ao resetar configurações");
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [syncThemeFromConfig]);

  // Prévia de tema (sem salvar)
  const previewTheme = useCallback((theme: ThemeKey) => {
    applyTheme(theme);
  }, []);

  // Cancelar prévia
  const cancelPreview = useCallback(() => {
    applyTheme(currentTheme);
  }, [currentTheme]);

  // Obter tema atual
  const getCurrentThemeConfig = useCallback(() => {
    return getTheme(currentTheme);
  }, [currentTheme]);

  // Carregar dados iniciais
  useEffect(() => {
    loadAvailableThemes();
    loadRachaConfig();
  }, [loadAvailableThemes, loadRachaConfig]);

  return {
    // Estado
    currentTheme,
    availableThemes,
    rachaConfig,
    isLoading,
    error,

    // Ações
    applyTheme: applyThemeToRacha,
    previewTheme,
    cancelPreview,
    updateCustomColors,
    updateSettings,
    resetConfig,
    loadAvailableThemes,
    loadRachaConfig,

    // Utilitários
    getCurrentThemeConfig,
  };
}
