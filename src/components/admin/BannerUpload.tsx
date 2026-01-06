"use client";

import { useEffect, useState } from "react";
import type { ChangeEvent } from "react";
import Image from "next/image";

type Props = {
  bannerUrl: string | null;
  isSaving?: boolean;
  onUpload: (file: File) => void;
  onRemove?: () => void;
};

export default function BannerUpload({ bannerUrl, isSaving = false, onUpload, onRemove }: Props) {
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  useEffect(() => {
    if (!previewUrl) return undefined;
    return () => {
      if (previewUrl.startsWith("blob:")) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  useEffect(() => {
    if (bannerUrl && previewUrl && !bannerUrl.startsWith("blob:")) {
      setPreviewUrl(null);
    }
  }, [bannerUrl, previewUrl]);

  const displayUrl = previewUrl || bannerUrl;
  const isLocal = Boolean(displayUrl?.startsWith("blob:") || displayUrl?.startsWith("data:"));

  const handleUpload = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    const url = URL.createObjectURL(file);
    setPreviewUrl(url);
    onUpload(file);
    event.target.value = "";
  };

  const handleRemove = () => {
    setPreviewUrl(null);
    onRemove?.();
  };

  return (
    <div className="bg-zinc-900 border-2 border-yellow-400 rounded-xl p-6 mt-2 flex flex-col gap-4 items-center justify-center w-full max-w-2xl">
      <div className="w-full text-center text-yellow-300 font-bold text-lg mb-2">
        Banner do Campeao do Dia
      </div>
      {displayUrl ? (
        <div className="flex flex-col items-center gap-2 w-full">
          <Image
            src={displayUrl}
            alt="Banner do Time Campeao do Dia"
            width={600}
            height={150}
            className="rounded-xl object-cover w-full max-w-xl"
            unoptimized={isLocal}
          />
          <div className="flex flex-wrap items-center gap-3">
            <button
              className="mt-2 px-5 py-1 rounded bg-red-600 text-white hover:bg-red-500 font-semibold disabled:opacity-60"
              onClick={handleRemove}
              disabled={isSaving}
            >
              Remover banner
            </button>
            {isSaving && <span className="text-xs text-yellow-300">Salvando...</span>}
          </div>
        </div>
      ) : (
        <label className="cursor-pointer bg-yellow-500 hover:bg-yellow-400 text-black font-bold px-6 py-2 rounded-lg shadow">
          {isSaving ? "Enviando banner..." : "Fazer upload do banner"}
          <input
            type="file"
            accept="image/*"
            onChange={handleUpload}
            className="hidden"
            disabled={isSaving}
          />
        </label>
      )}
    </div>
  );
}
