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
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center px-4">
      <div className="bg-[#23272e] p-6 rounded-2xl shadow-2xl w-full max-w-xl flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-white">{title}</h2>
          <button
            type="button"
            onClick={onCancel}
            className="text-gray-300 hover:text-white text-xl leading-none"
            aria-label="Fechar recorte"
          >
            ×
          </button>
        </div>

        <div className="relative w-full h-[360px] bg-gray-900 rounded-xl overflow-hidden">
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

        <div className="flex justify-end gap-3 pt-2">
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
        </div>
      </div>
    </div>
  );
}
