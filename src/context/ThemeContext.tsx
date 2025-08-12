"use client";
import { createContext, useContext, useState, useEffect } from "react";
import type { ReactNode } from "react"; // <- USAR type aqui!
import { themes } from "@/config/themes";
import type { ThemeKey } from "@/config/themes"; // <- USAR type aqui!

// Tipagem do contexto
type ThemeContextType = {
  themeKey: ThemeKey;
  setThemeKey: (key: ThemeKey) => void;
  theme: typeof themes.amarelo;
};

// Contexto
const ThemeContext = createContext<ThemeContextType>({
  themeKey: "amarelo",
  setThemeKey: () => {},
  theme: themes.amarelo,
});

// Provider
export function ThemeProvider({ children }: { children: ReactNode }) {
  const [themeKey, setThemeKey] = useState<ThemeKey>("amarelo");

  // (Opcional) Persistir escolha no localStorage
  useEffect(() => {
    const stored = localStorage.getItem("fut7_theme") as ThemeKey | null;
    if (stored && themes[stored]) setThemeKey(stored);
  }, []);
  useEffect(() => {
    localStorage.setItem("fut7_theme", themeKey);
  }, [themeKey]);

  const theme = themes[themeKey];

  // Seta CSS custom property para fácil uso no Tailwind (opcional)
  useEffect(() => {
    if (typeof window !== "undefined") {
      document.documentElement.style.setProperty("--primary-color", theme.primary);
      document.documentElement.style.setProperty("--highlight-color", theme.highlight);
      document.documentElement.style.setProperty("--text-color", theme.text);
    }
  }, [theme]);

  return (
    <ThemeContext.Provider value={{ themeKey, setThemeKey, theme }}>
      {children}
    </ThemeContext.Provider>
  );
}

// Hook de acesso
export const useTheme = () => useContext(ThemeContext);
