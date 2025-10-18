"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Cropper from "react-easy-crop";

import getCroppedImg from "@/utils/cropperUtil";

type AvatarCropModalProps = {
  open: boolean;
  imageSrc: string | null;
  onClose: () => void;
  onConfirm: (dataUrl: string) => void;
};

export default function AvatarCropModal({
  open,
  imageSrc,
  onClose,
  onConfirm,
}: AvatarCropModalProps) {
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<{
    x: number;
    y: number;
    width: number;
    height: number;
  } | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    if (open) {
      setCrop({ x: 0, y: 0 });
      setZoom(1);
      setCroppedAreaPixels(null);
      setIsProcessing(false);
    }
  }, [open, imageSrc]);

  const hasImage = useMemo(() => Boolean(open && imageSrc), [open, imageSrc]);

  const handleConfirm = useCallback(async () => {
    if (!imageSrc || !croppedAreaPixels || isProcessing) return;
    setIsProcessing(true);
    try {
      const dataUrl = await getCroppedImg(imageSrc, croppedAreaPixels, 512, 512);
      onConfirm(dataUrl);
    } catch (error) {
      console.error("Failed to crop avatar", error);
    } finally {
      setIsProcessing(false);
    }
  }, [croppedAreaPixels, imageSrc, isProcessing, onConfirm]);

  if (!hasImage) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 px-4">
      <div className="w-full max-w-lg rounded-xl bg-[#111] p-6 shadow-xl">
        <h2 className="mb-4 text-center text-lg font-semibold text-yellow-300">
          Ajustar foto do perfil
        </h2>
        <div className="relative h-72 w-full overflow-hidden rounded-xl bg-black/40">
          <Cropper
            image={imageSrc ?? undefined}
            crop={crop}
            zoom={zoom}
            aspect={1}
            cropShape="round"
            showGrid={false}
            onCropChange={setCrop}
            onCropComplete={(_, areaPixels) => setCroppedAreaPixels(areaPixels)}
            onZoomChange={setZoom}
            minZoom={1}
            maxZoom={3}
            objectFit="cover"
          />
        </div>
        <div className="mt-6">
          <label
            className="mb-1 block text-sm font-medium text-zinc-300"
            htmlFor="avatar-crop-zoom"
          >
            Zoom
          </label>
          <input
            id="avatar-crop-zoom"
            type="range"
            min={1}
            max={3}
            step={0.05}
            value={zoom}
            onChange={(event) => setZoom(Number(event.target.value))}
            className="w-full accent-yellow-400"
          />
        </div>

        <div className="mt-6 flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={onClose}
            disabled={isProcessing}
            className="flex-1 rounded border border-[#333] bg-[#1f1f1f] px-4 py-2 font-semibold text-white transition hover:bg-[#2a2a2a] disabled:cursor-not-allowed disabled:opacity-50"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={handleConfirm}
            disabled={isProcessing}
            className="flex-1 rounded bg-yellow-400 px-4 py-2 font-bold text-black transition hover:bg-yellow-300 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isProcessing ? "Recortando..." : "Aplicar corte"}
          </button>
        </div>
      </div>
    </div>
  );
}
