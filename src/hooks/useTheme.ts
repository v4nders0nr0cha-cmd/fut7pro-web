import { useState, useEffect, useCallback } from "react";
import { configuracoesApi } from "@/lib/api";
import type { ApiResponse } from "@/lib/api";
import { getTheme, applyTheme, type ThemeKey } from "@/config/themes";
import { toast } from "react-hot-toast";

interface ThemeConfig {
  id: string;
  name: string;
  key: string;
  primary: string;
  secondary: string;
  highlight: string;
  text: string;
  background: string;
  surface: string;
  accent: string;
  success: string;
  warning: string;
  error: string;
  info: string;
  gradient?: string;
  logo?: string;
  description?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

interface RachaConfig {
  id: string;
  tenantId: string;
  theme: string;
  customColors?: {
    primary?: string;
    secondary?: string;
    accent?: string;
  };
  settings: {
    allowPlayerRegistration: boolean;
    allowMatchCreation: boolean;
    allowFinancialManagement: boolean;
    allowNotifications: boolean;
    allowStatistics: boolean;
    allowRankings: boolean;
  };
  createdAt: string;
  updatedAt: string;
}

export function useTheme() {
  const [currentTheme, setCurrentTheme] = useState<ThemeKey>("amarelo");
  const [availableThemes, setAvailableThemes] = useState<ThemeConfig[]>([]);
  const [rachaConfig, setRachaConfig] = useState<RachaConfig | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Carregar tema do localStorage na inicialização
  useEffect(() => {
    const savedTheme = localStorage.getItem("fut7pro-theme") as ThemeKey;
    if (savedTheme) {
      setCurrentTheme(savedTheme);
      applyTheme(savedTheme);
    }
  }, []);

  // Carregar temas disponíveis da API
  const loadAvailableThemes = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      const response = (await configuracoesApi.getTemas()) as ApiResponse<ThemeConfig[]>;
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

      const response = (await configuracoesApi.getRachaConfig()) as ApiResponse<RachaConfig>;
      if (response.data) {
        setRachaConfig(response.data);
        // Aplicar tema do racha se diferente do atual
        if (response.data.theme && response.data.theme !== currentTheme) {
          setCurrentTheme(response.data.theme as ThemeKey);
          applyTheme(response.data.theme as ThemeKey);
          localStorage.setItem("fut7pro-theme", response.data.theme);
        }
      } else if (response.error) {
        setError(response.error);
      }
    } catch {
      setError("Erro ao carregar configurações do racha");
    } finally {
      setIsLoading(false);
    }
  }, [currentTheme]);

  // Aplicar tema
  const applyThemeToRacha = useCallback(async (theme: ThemeKey) => {
    try {
      setIsLoading(true);
      setError(null);

      const response = (await configuracoesApi.updateTema(theme)) as ApiResponse<RachaConfig>;
      if (response.data) {
        setCurrentTheme(theme);
        applyTheme(theme);
        localStorage.setItem("fut7pro-theme", theme);
        setRachaConfig(response.data);
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
  }, []);

  // Atualizar cores customizadas
  const updateCustomColors = useCallback(
    async (colors: { primary?: string; secondary?: string; accent?: string }) => {
      try {
        setIsLoading(true);
        setError(null);

        const response = (await configuracoesApi.updateCores(colors)) as ApiResponse<RachaConfig>;
        if (response.data) {
          setRachaConfig(response.data);
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
    []
  );

  // Atualizar configurações
  const updateSettings = useCallback(
    async (settings: {
      allowPlayerRegistration?: boolean;
      allowMatchCreation?: boolean;
      allowFinancialManagement?: boolean;
      allowNotifications?: boolean;
      allowStatistics?: boolean;
      allowRankings?: boolean;
    }) => {
      try {
        setIsLoading(true);
        setError(null);

        const response = (await configuracoesApi.updateConfiguracoes(settings)) as ApiResponse<RachaConfig>;
        if (response.data) {
          setRachaConfig(response.data);
          toast.success("Configurações atualizadas com sucesso!");
          return true;
        } else if (response.error) {
          setError(response.error);
          toast.error("Erro ao atualizar configurações");
          return false;
        }
      } catch (err) {
        setError("Erro ao atualizar configurações");
        toast.error("Erro ao atualizar configurações");
        return false;
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  // Resetar configurações
  const resetConfig = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      const response = (await configuracoesApi.resetConfiguracoes()) as ApiResponse<RachaConfig>;
      if (response.data) {
        setRachaConfig(response.data);
        setCurrentTheme("amarelo");
        applyTheme("amarelo");
        localStorage.setItem("fut7pro-theme", "amarelo");
        toast.success("Configurações resetadas com sucesso!");
        return true;
      } else if (response.error) {
        setError(response.error);
        toast.error("Erro ao resetar configurações");
        return false;
      }
    } catch (err) {
      setError("Erro ao resetar configurações");
      toast.error("Erro ao resetar configurações");
      return false;
    } finally {
      setIsLoading(false);
    }
  }, []);

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


