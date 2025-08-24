"use client";

import { useState } from "react";
import html2canvas from "html2canvas";
import { rachaConfig } from "@/config/racha.config";

interface Props {
  captureRef: React.RefObject<HTMLDivElement>;
}

export default function ShareTimesButton({ captureRef }: Props) {
  const [downloading, setDownloading] = useState(false);

  async function handleCapture() {
    if (!captureRef.current) return;
    setDownloading(true);
    const canvas = await html2canvas(captureRef.current, {
      backgroundColor: "#18181B",
    });
    const dataUrl = canvas.toDataURL("image/png");
    const link = document.createElement("a");
    link.href = dataUrl;
    link.download = `times-do-dia-${rachaConfig.slug}.png`;
    link.click();
    setDownloading(false);
  }

  return (
    <button
      onClick={handleCapture}
      className={`rounded border border-transparent bg-neutral-800 px-5 py-2 text-base font-medium text-neutral-200 transition hover:border-yellow-400 hover:text-yellow-300 disabled:opacity-60`}
      disabled={downloading}
    >
      {downloading ? "Gerando imagem..." : "Baixar/Compartilhar Times do Dia"}
    </button>
  );
}
