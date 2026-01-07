"use client";

import { useEffect, useRef, useState } from "react";
import type { ChangeEvent } from "react";
import Cropper, { type Area, type Point } from "react-easy-crop";

type Props = {
  bannerUrl: string | null;
  isSaving?: boolean;
  onUpload: (file: File) => Promise<boolean>;
  onRemove?: () => void;
};

const loadImage = (url: string) =>
  new Promise<HTMLImageElement>((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error("Falha ao carregar imagem"));
    image.src = url;
  });

const getCroppedFile = async (previewUrl: string | null, file: File, cropPixels: Area | null) => {
  if (!cropPixels) return file;
  const sourceUrl = previewUrl || URL.createObjectURL(file);
  const shouldRevoke = !previewUrl;

  try {
    const image = await loadImage(sourceUrl);
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    if (!ctx) return file;

    const cropX = Math.max(0, Math.round(cropPixels.x));
    const cropY = Math.max(0, Math.round(cropPixels.y));
    const cropWidth = Math.min(image.naturalWidth - cropX, Math.round(cropPixels.width));
    const cropHeight = Math.min(image.naturalHeight - cropY, Math.round(cropPixels.height));

    canvas.width = Math.max(1, cropWidth);
    canvas.height = Math.max(1, cropHeight);

    ctx.drawImage(image, cropX, cropY, cropWidth, cropHeight, 0, 0, cropWidth, cropHeight);

    const blob = await new Promise<Blob | null>((resolve) =>
      canvas.toBlob(resolve, file.type || "image/jpeg", 0.92)
    );

    if (!blob) return file;
    return new File([blob], file.name, {
      type: file.type || "image/jpeg",
      lastModified: file.lastModified,
    });
  } finally {
    if (shouldRevoke) {
      URL.revokeObjectURL(sourceUrl);
    }
  }
};

export default function BannerUpload({ bannerUrl, isSaving = false, onUpload, onRemove }: Props) {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [pendingFile, setPendingFile] = useState<File | null>(null);
  const [loadError, setLoadError] = useState(false);
  const [crop, setCrop] = useState<Point>({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null);
  const [isCropping, setIsCropping] = useState(false);

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
  const hasPending = Boolean(pendingFile);

  const handleUpload = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    const url = URL.createObjectURL(file);
    setPreviewUrl(url);
    setPendingFile(file);
    setLoadError(false);
    setCrop({ x: 0, y: 0 });
    setZoom(1);
    setCroppedAreaPixels(null);
    setIsCropping(true);
    event.target.value = "";
  };

  const handleRemove = () => {
    setPreviewUrl(null);
    setPendingFile(null);
    setLoadError(false);
    setIsCropping(false);
    onRemove?.();
  };

  const handleSelect = () => {
    inputRef.current?.click();
  };

  const handleCancel = () => {
    setPreviewUrl(null);
    setPendingFile(null);
    setLoadError(false);
    setIsCropping(false);
  };

  const handleSave = async () => {
    if (!pendingFile) return;
    const output = await getCroppedFile(previewUrl, pendingFile, croppedAreaPixels);
    const ok = await onUpload(output);
    if (ok) {
      setPendingFile(null);
      setPreviewUrl(null);
      setIsCropping(false);
    }
  };

  useEffect(() => {
    setLoadError(false);
  }, [displayUrl]);

  const handleCropComplete = (_area: Area, pixels: Area) => {
    setCroppedAreaPixels(pixels);
  };

  const handleZoomChange = (value: number) => {
    setZoom(value);
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
          {isCropping && previewUrl ? (
            <div className="w-full max-w-xl flex flex-col gap-3">
              <div className="relative w-full aspect-video rounded-xl overflow-hidden border border-yellow-400/40 bg-zinc-950">
                <Cropper
                  image={previewUrl}
                  crop={crop}
                  zoom={zoom}
                  rotation={0}
                  aspect={16 / 9}
                  minZoom={1}
                  maxZoom={3}
                  cropShape="rect"
                  showGrid={true}
                  zoomSpeed={0.2}
                  restrictPosition={true}
                  onCropChange={setCrop}
                  onZoomChange={handleZoomChange}
                  onCropComplete={handleCropComplete}
                  style={{
                    containerStyle: { width: "100%", height: "100%" },
                    cropAreaStyle: {
                      border: "2px solid rgba(250, 204, 21, 0.9)",
                      boxShadow: "0 0 0 9999px rgba(0, 0, 0, 0.55)",
                    },
                  }}
                  classes={{}}
                  mediaProps={{}}
                  cropperProps={{}}
                  zoomWithScroll={false}
                  keyboardStep={1}
                />
                <div className="pointer-events-none absolute inset-0">
                  <div className="absolute inset-0 border-2 border-yellow-400/70 rounded-xl" />
                  <div className="absolute left-1/2 top-0 bottom-0 w-px bg-yellow-400/30" />
                  <div className="absolute top-1/2 left-0 right-0 h-px bg-yellow-400/30" />
                </div>
              </div>
              <div className="w-full flex items-center justify-between text-xs text-zinc-300">
                <span>Area do banner (16:9). Arraste para posicionar.</span>
                <span>Zoom: {zoom.toFixed(2)}x</span>
              </div>
              <input
                type="range"
                min={1}
                max={3}
                step={0.05}
                value={zoom}
                onChange={(event) => handleZoomChange(Number(event.target.value))}
                className="w-full accent-yellow-400"
              />
            </div>
          ) : !loadError ? (
            <img
              src={displayUrl}
              alt="Banner do Time Campeao do Dia"
              className="rounded-xl object-cover w-full max-w-xl"
              onError={() => setLoadError(true)}
              loading="lazy"
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
