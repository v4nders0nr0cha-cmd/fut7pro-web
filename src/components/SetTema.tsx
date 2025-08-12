// src/components/SetTema.tsx
"use client";

import { useEffect, useState } from "react";

export default function SetTema() {
  const [slug, setSlug] = useState<string>("padrao");

  useEffect(() => {
    // Só executa no client-side para evitar hydration mismatch
    if (typeof window !== "undefined") {
      const pathSlug = window.location.pathname.split("/")[1] || "padrao";
      setSlug(pathSlug);
    }
  }, []);

  useEffect(() => {
    // Aplica o tema apenas no client-side
    if (typeof window !== "undefined" && typeof document !== "undefined") {
      const tema = {
        primary: "#FFCC00",
        highlight: "#1A1A1A",
        text: "#FFFFFF",
      };

      Object.entries(tema).forEach(([key, value]) => {
        document.documentElement.style.setProperty(`--${key}-color`, value);
      });
    }
  }, [slug]);

  return null;
}
