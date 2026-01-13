"use client";

import { useCallback, useEffect, useState } from "react";
import Cropper from "react-easy-crop";
import getCroppedImg from "@/utils/cropperUtil";

type SponsorLogoCropperModalProps = {
  open: boolean;
  imageSrc: string;
  onCancel: () => void;
  onApply: (croppedBase64: string) => void;
};

const OUTPUT_WIDTH = 1024;
const OUTPUT_HEIGHT = 617;
const ASPECT = OUTPUT_WIDTH / OUTPUT_HEIGHT;
const PREVIEW_WIDTH = 512;
const PREVIEW_HEIGHT = Math.round(PREVIEW_WIDTH / ASPECT);

export default function SponsorLogoCropperModal({
  open,
  imageSrc,
  onCancel,
  onApply,
}: SponsorLogoCropperModalProps) {
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1.1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<{
    x: number;
    y: number;
    width: number;
    height: number;
  } | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const handleCropComplete = useCallback((_: any, croppedPixels: any) => {
    setCroppedAreaPixels(croppedPixels);
  }, []);

  useEffect(() => {
    if (!open) return;
    setCrop({ x: 0, y: 0 });
    setZoom(1.1);
    setPreviewUrl(null);
  }, [open, imageSrc]);

  useEffect(() => {
    if (!croppedAreaPixels || !imageSrc) return;
    let active = true;
    const buildPreview = async () => {
      try {
        const cropped = await getCroppedImg(
          imageSrc,
          croppedAreaPixels,
          PREVIEW_WIDTH,
          PREVIEW_HEIGHT,
          "image/webp",
          0.9
        );
        if (active) setPreviewUrl(cropped);
      } catch (err) {
        console.error(err);
      }
    };
    void buildPreview();
    return () => {
      active = false;
    };
  }, [croppedAreaPixels, imageSrc]);

  const handleApply = useCallback(async () => {
    if (!croppedAreaPixels || !imageSrc) return;
    setSaving(true);
    try {
      const cropped = await getCroppedImg(
        imageSrc,
        croppedAreaPixels,
        OUTPUT_WIDTH,
        OUTPUT_HEIGHT,
        "image/webp",
        0.9
      );
      onApply(cropped);
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  }, [croppedAreaPixels, imageSrc, onApply]);

  if (!open) return null;

  const previewImage = previewUrl || imageSrc;

  return (
    <div className="fixed inset-0 z-[60] bg-black/80 backdrop-blur-sm flex items-center justify-center px-3">
      <div className="bg-[#1a1a1a] rounded-2xl p-5 max-w-3xl w-full shadow-2xl">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-bold text-yellow-300">Ajustar logo do patrocinador</h2>
          <button
            type="button"
            onClick={onCancel}
            className="text-gray-300 hover:text-white text-xl leading-none"
            aria-label="Fechar ajuste de logo"
          >
            x
          </button>
        </div>

        <div className="relative w-full h-[340px] bg-[#0f0f0f] rounded-xl overflow-hidden border border-[#2b2b2b]">
          <Cropper
            image={imageSrc}
            crop={crop}
            zoom={zoom}
            aspect={ASPECT}
            cropShape="rect"
            showGrid={false}
            onCropChange={setCrop}
            onZoomChange={setZoom}
            onCropComplete={handleCropComplete}
          />
        </div>

        <div className="mt-4">
          <label className="text-xs text-gray-300">Zoom</label>
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

        <div className="mt-5 grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="rounded-xl border border-[#2b2b2b] bg-[#151515] p-3">
            <p className="text-xs text-gray-400 mb-2">Preview card parceiro</p>
            <div className="h-24 w-full rounded-lg bg-[#101010] border border-[#2b2b2b] flex items-center justify-center">
              <img
                src={previewImage}
                alt="Preview card parceiro"
                className="h-14 w-full object-contain"
              />
            </div>
            <p className="mt-2 text-[11px] text-gray-500">Exemplo de exibicao no card.</p>
          </div>
          <div className="rounded-xl border border-[#2b2b2b] bg-[#151515] p-3">
            <p className="text-xs text-gray-400 mb-2">Preview carrossel rodape</p>
            <div className="h-16 w-full rounded-lg bg-[#101010] border border-[#2b2b2b] flex items-center justify-center">
              <img
                src={previewImage}
                alt="Preview carrossel rodape"
                className="h-10 w-auto max-w-[160px] object-contain"
              />
            </div>
            <p className="mt-2 text-[11px] text-gray-500">Exemplo de exibicao no rodape.</p>
          </div>
        </div>

        <div className="flex justify-end gap-3 mt-5">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 rounded-lg bg-[#2b2b2b] text-gray-200 hover:bg-[#3a3a3a]"
            disabled={saving}
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={handleApply}
            className="px-4 py-2 rounded-lg bg-yellow-400 text-black font-bold hover:bg-yellow-300 disabled:opacity-70"
            disabled={saving}
          >
            {saving ? "Aplicando..." : "Aplicar logo"}
          </button>
        </div>
      </div>
    </div>
  );
}
