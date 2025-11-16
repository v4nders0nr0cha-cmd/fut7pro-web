"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import type { ReactNode } from "react";
import { useSession } from "next-auth/react";
import { themes, getTheme, applyTheme, type ThemeConfig, type ThemeKey } from "@/config/themes";
import { configuracoesApi } from "@/lib/api";
import type { ThemeCustomColors } from "@/types/configuracoes";
import { usePublicTenantSlug } from "@/hooks/usePublicTenantSlug";
import { DEFAULT_PUBLIC_SLUG } from "@/config/tenant-public";

export type ThemeSyncOptions = {
  customColors?: ThemeCustomColors | null;
  persist?: boolean;
};

type ThemeContextType = {
  themeKey: ThemeKey;
  theme: ThemeConfig;
  customColors: ThemeCustomColors | null;
  tenantSlug: string;
  isReady: boolean;
  setThemeKey: (key: ThemeKey, options?: ThemeSyncOptions) => void;
  refreshTheme: () => void;
};

type ThemeCachePayload = {
  key: ThemeKey;
  customColors?: ThemeCustomColors | null;
};

const DEFAULT_THEME_KEY: ThemeKey = "amarelo";
const ThemeContext = createContext<ThemeContextType>({
  themeKey: DEFAULT_THEME_KEY,
  theme: themes[DEFAULT_THEME_KEY],
  customColors: null,
  tenantSlug: DEFAULT_PUBLIC_SLUG,
  isReady: false,
  setThemeKey: () => {},
  refreshTheme: () => {},
});

async function fetchPublicThemeKey(slug: string): Promise<ThemeKey | null> {
  if (!slug) return null;
  try {
    const response = await fetch(`/api/public/rachas/${slug}`, { cache: "no-store" });
    if (!response.ok) {
      return null;
    }
    const payload = (await response.json()) as { tema?: ThemeKey | null };
    if (payload?.tema && themes[payload.tema]) {
      return payload.tema;
    }
  } catch (error) {
    if (process.env.NODE_ENV === "development") {
      console.warn("Falha ao buscar tema publico", error);
    }
  }
  return null;
}

function applyCustomOverrides(overrides?: ThemeCustomColors | null) {
  if (typeof document === "undefined" || !overrides) return;
  const root = document.documentElement;
  if (overrides.primary) {
    root.style.setProperty("--color-primary", overrides.primary);
    root.style.setProperty("--primary-color", overrides.primary);
  }
  if (overrides.secondary) {
    root.style.setProperty("--color-secondary", overrides.secondary);
    root.style.setProperty("--secondary-color", overrides.secondary);
  }
  if (overrides.accent) {
    root.style.setProperty("--color-accent", overrides.accent);
    root.style.setProperty("--accent-color", overrides.accent);
  }
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const { data: session, status } = useSession();
  const slugFromPath = usePublicTenantSlug();
  const sessionTenantSlug = session?.user?.tenantSlug ?? null;
  const tenantSlug = slugFromPath ?? sessionTenantSlug ?? DEFAULT_PUBLIC_SLUG;
  const storageKey = `fut7_theme_${tenantSlug}`;
  const waitingForSession = !slugFromPath && status === "loading";

  const [themeKey, setThemeKeyState] = useState<ThemeKey>(DEFAULT_THEME_KEY);
  const [theme, setTheme] = useState<ThemeConfig>(themes[DEFAULT_THEME_KEY]);
  const [customColors, setCustomColors] = useState<ThemeCustomColors | null>(null);
  const [isReady, setIsReady] = useState(false);
  const [refreshCounter, setRefreshCounter] = useState(0);
  const lastFetchSignature = useRef<string | null>(null);

  const persistCache = useCallback(
    (key: ThemeKey, overrides?: ThemeCustomColors | null) => {
      if (typeof window === "undefined") return;
      try {
        const payload: ThemeCachePayload = { key, customColors: overrides ?? null };
        localStorage.setItem(storageKey, JSON.stringify(payload));
      } catch (error) {
        if (process.env.NODE_ENV === "development") {
          console.warn("Nao foi possivel salvar cache de tema", error);
        }
      }
    },
    [storageKey]
  );

  const readCache = useCallback((): ThemeCachePayload | null => {
    if (typeof window === "undefined") return null;
    try {
      const raw = localStorage.getItem(storageKey);
      if (!raw) return null;
      const parsed = JSON.parse(raw) as ThemeCachePayload;
      if (parsed.key && themes[parsed.key]) {
        return parsed;
      }
    } catch (error) {
      if (process.env.NODE_ENV === "development") {
        console.warn("Cache de tema invalido", error);
      }
    }
    return null;
  }, [storageKey]);

  const applyThemeState = useCallback(
    (nextKey: ThemeKey, overrides?: ThemeCustomColors | null, options?: ThemeSyncOptions) => {
      const safeKey = themes[nextKey] ? nextKey : DEFAULT_THEME_KEY;
      setThemeKeyState(safeKey);
      const baseTheme = getTheme(safeKey);
      const resolvedTheme: ThemeConfig = {
        ...baseTheme,
        primary: overrides?.primary ?? baseTheme.primary,
        secondary: overrides?.secondary ?? baseTheme.secondary,
        accent: overrides?.accent ?? baseTheme.accent,
      };
      setTheme(resolvedTheme);
      setCustomColors(overrides ?? null);

      if (typeof window !== "undefined") {
        applyTheme(safeKey);
        applyCustomOverrides(overrides);
        const root = document.documentElement;
        root.style.setProperty("--color-background", resolvedTheme.background);
        root.style.setProperty("--color-surface", resolvedTheme.surface);
        root.style.setProperty("--color-highlight", resolvedTheme.highlight);
        root.style.setProperty("--color-text", resolvedTheme.text);
        root.style.setProperty("--text-color", resolvedTheme.text);
        if (resolvedTheme.gradient) {
          root.style.setProperty("--gradient-primary", resolvedTheme.gradient);
        }
      }

      if (options?.persist !== false) {
        persistCache(safeKey, overrides ?? null);
      }
    },
    [persistCache]
  );

  const hydrateFromCache = useCallback(() => {
    const cached = readCache();
    if (cached) {
      applyThemeState(cached.key, cached.customColors ?? null, { persist: false });
      setIsReady(true);
    }
  }, [applyThemeState, readCache]);

  useEffect(() => {
    setIsReady(false);
    lastFetchSignature.current = null;
    hydrateFromCache();
  }, [hydrateFromCache, storageKey]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const handleStorage = (event: StorageEvent) => {
      if (event.key !== storageKey || !event.newValue) return;
      try {
        const parsed = JSON.parse(event.newValue) as ThemeCachePayload;
        if (parsed.key && themes[parsed.key]) {
          applyThemeState(parsed.key, parsed.customColors ?? null, { persist: false });
          setIsReady(true);
        }
      } catch {
        // Ignora entradas invalidas
      }
    };
    window.addEventListener("storage", handleStorage);
    return () => window.removeEventListener("storage", handleStorage);
  }, [applyThemeState, storageKey]);

  useEffect(() => {
    if (!tenantSlug || waitingForSession) return;
    let cancelled = false;
    const fetchSignature = `${tenantSlug}:${slugFromPath ? "public" : "private"}:${refreshCounter}`;

    async function hydrateThemeFromRemote() {
      if (lastFetchSignature.current === fetchSignature) {
        if (!isReady) {
          setIsReady(true);
        }
        return;
      }

      try {
        if (slugFromPath || status !== "authenticated" || !sessionTenantSlug) {
          const publicTheme = await fetchPublicThemeKey(tenantSlug);
          if (cancelled) return;
          if (publicTheme) {
            applyThemeState(publicTheme, null);
            setIsReady(true);
            lastFetchSignature.current = fetchSignature;
            return;
          }
        } else {
          const response = await configuracoesApi.getRachaConfig();
          if (cancelled) return;
          if (response.data?.theme) {
            applyThemeState(response.data.theme, response.data.customColors ?? null);
            setIsReady(true);
            lastFetchSignature.current = fetchSignature;
            return;
          }
        }
      } catch (error) {
        if (process.env.NODE_ENV === "development") {
          console.warn("Falha ao carregar tema remoto", error);
        }
      }

      if (!cancelled && !isReady) {
        applyThemeState(DEFAULT_THEME_KEY, null, { persist: false });
        setIsReady(true);
      }
    }

    hydrateThemeFromRemote();

    return () => {
      cancelled = true;
    };
  }, [
    tenantSlug,
    slugFromPath,
    sessionTenantSlug,
    status,
    waitingForSession,
    refreshCounter,
    applyThemeState,
    isReady,
  ]);

  const handleSetThemeKey = useCallback(
    (key: ThemeKey, options?: ThemeSyncOptions) => {
      const overrides =
        options && "customColors" in options ? (options.customColors ?? null) : customColors;
      applyThemeState(key, overrides ?? null, options);
    },
    [applyThemeState, customColors]
  );

  const refreshTheme = useCallback(() => {
    setRefreshCounter((count) => count + 1);
  }, []);

  const value = useMemo(
    () => ({
      themeKey,
      theme,
      customColors,
      tenantSlug,
      isReady,
      setThemeKey: handleSetThemeKey,
      refreshTheme,
    }),
    [themeKey, theme, customColors, tenantSlug, isReady, handleSetThemeKey, refreshTheme]
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export const useThemeContext = () => useContext(ThemeContext);
