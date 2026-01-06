"use client";

import { useEffect, useRef, useState } from "react";
import type { ChangeEvent } from "react";
import Image from "next/image";

type Props = {
  bannerUrl: string | null;
  isSaving?: boolean;
  onUpload: (file: File) => Promise<boolean>;
  onRemove?: () => void;
};

export default function BannerUpload({ bannerUrl, isSaving = false, onUpload, onRemove }: Props) {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [pendingFile, setPendingFile] = useState<File | null>(null);
  const [loadError, setLoadError] = useState(false);

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
  const hasPending = Boolean(pendingFile);

  const handleUpload = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    const url = URL.createObjectURL(file);
    setPreviewUrl(url);
    setPendingFile(file);
    setLoadError(false);
    event.target.value = "";
  };

  const handleRemove = () => {
    setPreviewUrl(null);
    setPendingFile(null);
    onRemove?.();
  };

  const handleSelect = () => {
    inputRef.current?.click();
  };

  const handleCancel = () => {
    setPreviewUrl(null);
    setPendingFile(null);
  };

  const handleSave = async () => {
    if (!pendingFile) return;
    const ok = await onUpload(pendingFile);
    if (ok) {
      setPendingFile(null);
      setPreviewUrl(null);
    }
  };

  return (
    <div className="bg-zinc-900 border-2 border-yellow-400 rounded-xl p-6 mt-2 flex flex-col gap-4 items-center justify-center w-full max-w-2xl">
      <div className="w-full text-center text-yellow-300 font-bold text-lg mb-2">
        Banner do Campeao do Dia
      </div>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        onChange={handleUpload}
        className="hidden"
        disabled={isSaving}
      />
      {displayUrl ? (
        <div className="flex flex-col items-center gap-2 w-full">
          {!loadError ? (
            <Image
              src={displayUrl}
              alt="Banner do Time Campeao do Dia"
              width={600}
              height={150}
              className="rounded-xl object-cover w-full max-w-xl"
              unoptimized={isLocal}
              onError={() => setLoadError(true)}
            />
          ) : (
            <div className="w-full max-w-xl rounded-xl border border-yellow-400/40 bg-zinc-800 px-4 py-6 text-center text-sm text-yellow-200">
              Nao foi possivel carregar a imagem. Tente selecionar outra foto.
            </div>
          )}
          <div className="flex flex-wrap items-center gap-3">
            {hasPending ? (
              <>
                <button
                  className="mt-2 px-5 py-1 rounded bg-yellow-500 text-black hover:bg-yellow-400 font-semibold disabled:opacity-60"
                  onClick={handleSave}
                  disabled={isSaving}
                >
                  Salvar banner
                </button>
                <button
                  className="mt-2 px-5 py-1 rounded bg-zinc-700 text-white hover:bg-zinc-600 font-semibold disabled:opacity-60"
                  onClick={handleSelect}
                  disabled={isSaving}
                >
                  Ajustar banner
                </button>
                <button
                  className="mt-2 px-5 py-1 rounded bg-zinc-800 text-white hover:bg-zinc-700 font-semibold disabled:opacity-60"
                  onClick={handleCancel}
                  disabled={isSaving}
                >
                  Cancelar
                </button>
              </>
            ) : (
              <>
                <button
                  className="mt-2 px-5 py-1 rounded bg-yellow-500 text-black hover:bg-yellow-400 font-semibold disabled:opacity-60"
                  onClick={handleSelect}
                  disabled={isSaving}
                >
                  Ajustar banner
                </button>
                <button
                  className="mt-2 px-5 py-1 rounded bg-red-600 text-white hover:bg-red-500 font-semibold disabled:opacity-60"
                  onClick={handleRemove}
                  disabled={isSaving}
                >
                  Remover banner
                </button>
              </>
            )}
            {isSaving && <span className="text-xs text-yellow-300">Salvando...</span>}
          </div>
        </div>
      ) : (
        <button
          type="button"
          className="cursor-pointer bg-yellow-500 hover:bg-yellow-400 text-black font-bold px-6 py-2 rounded-lg shadow disabled:opacity-60"
          onClick={handleSelect}
          disabled={isSaving}
        >
          {isSaving ? "Enviando banner..." : "Fazer upload do banner"}
        </button>
      )}
    </div>
  );
}
