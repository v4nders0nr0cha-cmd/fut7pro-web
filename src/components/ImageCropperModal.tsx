"use client";

import { useCallback, useState } from "react";
import Cropper from "react-easy-crop";
import getCroppedImg from "@/utils/cropperUtil";

type ImageCropperModalProps = {
  open: boolean;
  imageSrc: string;
  aspect?: number;
  shape?: "round" | "rect";
  title?: string;
  onCancel: () => void;
  onApply: (croppedBase64: string) => void;
};

export default function ImageCropperModal({
  open,
  imageSrc,
  aspect = 1,
  shape = "round",
  title = "Ajustar imagem",
  onCancel,
  onApply,
}: ImageCropperModalProps) {
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1.1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<{
    x: number;
    y: number;
    width: number;
    height: number;
  } | null>(null);
  const [saving, setSaving] = useState(false);

  const handleCropComplete = useCallback((_: any, croppedPixels: any) => {
    setCroppedAreaPixels(croppedPixels);
  }, []);

  const handleApply = useCallback(async () => {
    if (!croppedAreaPixels || !imageSrc) return;
    setSaving(true);
    try {
      const cropped = await getCroppedImg(imageSrc, croppedAreaPixels);
      onApply(cropped);
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  }, [croppedAreaPixels, imageSrc, onApply]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[110] flex items-end justify-center bg-black/70 px-0 pt-3 backdrop-blur-sm sm:items-center sm:px-4 sm:py-6">
      <div className="flex max-h-[calc(100dvh-0.75rem)] w-full max-w-xl flex-col overflow-hidden rounded-t-2xl bg-[#23272e] shadow-2xl sm:max-h-[calc(100dvh-3rem)] sm:rounded-2xl">
        <header className="flex shrink-0 items-center justify-between border-b border-white/10 px-4 py-3 sm:px-6">
          <h2 className="text-lg font-bold text-white">{title}</h2>
          <button
            type="button"
            onClick={onCancel}
            className="text-gray-300 hover:text-white text-xl leading-none"
            aria-label="Fechar recorte"
          >
            ×
          </button>
        </header>

        <div className="min-h-0 flex-1 space-y-4 overflow-y-auto overscroll-contain px-4 py-4 sm:px-6">
          <div className="relative h-[min(42dvh,360px)] min-h-44 w-full overflow-hidden rounded-xl bg-gray-900">
            <Cropper
              image={imageSrc}
              crop={crop}
              zoom={zoom}
              aspect={aspect}
              cropShape={shape}
              showGrid={false}
              onCropChange={setCrop}
              onZoomChange={setZoom}
              onCropComplete={handleCropComplete}
            />
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-sm text-gray-300">Zoom</label>
            <input
              type="range"
              min={1}
              max={3}
              step={0.05}
              value={zoom}
              onChange={(e) => setZoom(Number(e.target.value))}
              className="w-full accent-yellow-400 cursor-pointer"
            />
          </div>
        </div>

        <footer className="grid shrink-0 grid-cols-2 gap-3 border-t border-white/10 px-4 py-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] sm:flex sm:justify-end sm:px-6">
          <button
            type="button"
            className="px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition"
            onClick={onCancel}
            disabled={saving}
          >
            Cancelar
          </button>
          <button
            type="button"
            className="px-4 py-2 bg-yellow-400 text-black font-bold rounded-lg shadow hover:bg-yellow-300 transition disabled:opacity-70"
            onClick={handleApply}
            disabled={saving}
          >
            {saving ? "Aplicando..." : "Aplicar recorte"}
          </button>
        </footer>
      </div>
    </div>
  );
}
