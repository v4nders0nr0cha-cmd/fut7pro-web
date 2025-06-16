"use client";

import { useEffect } from "react";

export function SetTema() {
  useEffect(() => {
    const slug = window.location.pathname.split("/")[1] || "padrao";

    const temas: Record<string, Record<string, string>> = {
      padrao: {
        "--cor-primaria": "#FFCC00",
        "--cor-secundaria": "#1a1a1a",
        "--texto-primario": "#ffffff",
        "--texto-secundario": "#cccccc",
        "--cor-destaque": "#FFD700",
      },
      // futuros temas poderão ser adicionados aqui com o nome do slug
    };

    const tema = temas[slug] || temas["padrao"];

    Object.entries(tema).forEach(([key, value]) => {
      document.documentElement.style.setProperty(key, value);
    });
  }, []);

  return null;
}
