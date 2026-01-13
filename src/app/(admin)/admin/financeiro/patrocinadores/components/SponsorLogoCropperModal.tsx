"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Cropper from "react-easy-crop";
import getCroppedImg from "@/utils/cropperUtil";

type SponsorLogoCropperModalProps = {
  open: boolean;
  imageSrc: string;
  onCancel: () => void;
  onApply: (croppedBase64: string) => void;
};

const OUTPUT_WIDTH = 1200;
const OUTPUT_HEIGHT = 400;
const ASPECT = OUTPUT_WIDTH / OUTPUT_HEIGHT;
const PREVIEW_WIDTH = 520;
const PREVIEW_HEIGHT = Math.round(PREVIEW_WIDTH / ASPECT);
const MIN_ZOOM = 0.6;
const MAX_ZOOM = 4;
const ZOOM_STEP = 0.1;

export default function SponsorLogoCropperModal({
  open,
  imageSrc,
  onCancel,
  onApply,
}: SponsorLogoCropperModalProps) {
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<{
    x: number;
    y: number;
    width: number;
    height: number;
  } | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const previewTimerRef = useRef<number | null>(null);
  const lastPreviewRequestRef = useRef(0);

  const handleCropComplete = useCallback((_: any, croppedPixels: any) => {
    setCroppedAreaPixels(croppedPixels);
  }, []);

  const clampZoom = useCallback(
    (value: number) => Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, value)),
    []
  );

  useEffect(() => {
    if (!open) return;
    setCrop({ x: 0, y: 0 });
    setZoom(1);
    setCroppedAreaPixels(null);
    setPreviewUrl(null);
  }, [open, imageSrc]);

  useEffect(() => {
    if (!open || !croppedAreaPixels || !imageSrc) return;
    let active = true;
    const requestId = (lastPreviewRequestRef.current += 1);
    if (previewTimerRef.current) {
      window.clearTimeout(previewTimerRef.current);
    }
    previewTimerRef.current = window.setTimeout(() => {
      const buildPreview = async () => {
        try {
          const preview = await getCroppedImg(
            imageSrc,
            croppedAreaPixels,
            PREVIEW_WIDTH,
            PREVIEW_HEIGHT,
            "image/png"
          );
          if (active && requestId === lastPreviewRequestRef.current) {
            setPreviewUrl(preview);
          }
        } catch (err) {
          console.error(err);
        }
      };
      void buildPreview();
    }, 140);
    return () => {
      active = false;
      if (previewTimerRef.current) {
        window.clearTimeout(previewTimerRef.current);
      }
    };
  }, [croppedAreaPixels, imageSrc, open]);

  const handleApply = useCallback(async () => {
    if (!croppedAreaPixels || !imageSrc) return;
    setSaving(true);
    try {
      const normalized = await getCroppedImg(
        imageSrc,
        croppedAreaPixels,
        OUTPUT_WIDTH,
        OUTPUT_HEIGHT,
        "image/png"
      );
      onApply(normalized);
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  }, [croppedAreaPixels, imageSrc, onApply]);

  const handleCenter = useCallback(() => {
    setCrop({ x: 0, y: 0 });
    setZoom(1);
  }, []);

  const zoomPercent = useMemo(() => Math.round(zoom * 100), [zoom]);

  if (!open) return null;

  const previewImage = previewUrl || imageSrc;

  return (
    <div className="fixed inset-0 z-[60] bg-black/80 backdrop-blur-sm flex items-center justify-center px-3 py-4">
      <div className="bg-[#1a1a1a] rounded-2xl w-full max-w-5xl shadow-2xl border border-[#2b2b2b] flex flex-col max-h-[92vh]">
        <div className="flex items-center justify-between px-5 py-4 border-b border-[#2b2b2b]">
          <div>
            <h2 className="text-lg font-bold text-yellow-300">Ajustar logo do patrocinador</h2>
            <p className="text-xs text-gray-400">
              Arraste a imagem e ajuste o zoom. O resultado ja fica padronizado.
            </p>
          </div>
          <button
            type="button"
            onClick={onCancel}
            className="text-gray-300 hover:text-white text-2xl leading-none"
            aria-label="Fechar ajuste de logo"
          >
            x
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-5 py-4 custom-scrollbar">
          <div className="grid gap-5 lg:grid-cols-[1.35fr_1fr]">
            <div className="flex flex-col gap-4">
              <div
                className="relative w-full h-[42vh] min-h-[240px] sm:h-[320px] lg:h-[380px] bg-[#0f0f0f] rounded-xl overflow-hidden border border-[#2b2b2b] select-none"
                style={{ touchAction: "none" }}
              >
                <Cropper
                  image={imageSrc}
                  crop={crop}
                  zoom={zoom}
                  minZoom={MIN_ZOOM}
                  maxZoom={MAX_ZOOM}
                  aspect={ASPECT}
                  cropShape="rect"
                  showGrid={false}
                  onCropChange={setCrop}
                  onZoomChange={(value) => setZoom(clampZoom(value))}
                  onCropComplete={handleCropComplete}
                />
              </div>

              <div className="flex flex-wrap items-center gap-3">
                <button
                  type="button"
                  onClick={() => setZoom((prev) => clampZoom(prev - ZOOM_STEP))}
                  className="h-9 w-9 rounded-full bg-[#2b2b2b] text-white hover:bg-[#3a3a3a]"
                  aria-label="Reduzir zoom"
                  disabled={zoom <= MIN_ZOOM}
                >
                  -
                </button>
                <div className="flex-1">
                  <div className="flex items-center justify-between text-xs text-gray-400 mb-1">
                    <span>Zoom</span>
                    <span>{zoomPercent}%</span>
                  </div>
                  <input
                    type="range"
                    min={MIN_ZOOM}
                    max={MAX_ZOOM}
                    step={0.02}
                    value={zoom}
                    onChange={(e) => setZoom(clampZoom(Number(e.target.value)))}
                    className="w-full accent-yellow-400 cursor-pointer"
                  />
                </div>
                <button
                  type="button"
                  onClick={() => setZoom((prev) => clampZoom(prev + ZOOM_STEP))}
                  className="h-9 w-9 rounded-full bg-[#2b2b2b] text-white hover:bg-[#3a3a3a]"
                  aria-label="Aumentar zoom"
                  disabled={zoom >= MAX_ZOOM}
                >
                  +
                </button>
                <button
                  type="button"
                  onClick={handleCenter}
                  className="px-3 py-2 rounded-lg border border-[#3a3a3a] text-xs text-gray-200 hover:border-yellow-400 hover:text-yellow-300"
                  aria-label="Centralizar logo"
                >
                  Centralizar
                </button>
              </div>
            </div>

            <div className="flex flex-col gap-4">
              <div className="rounded-xl border border-[#2b2b2b] bg-[#151515] p-4">
                <p className="text-xs text-gray-400 mb-2">Preview card parceiro</p>
                <div className="h-24 w-full rounded-xl bg-[#101010] border border-[#2b2b2b] flex items-center justify-center">
                  <img
                    src={previewImage}
                    alt="Preview card parceiro"
                    className="h-16 w-full object-contain"
                  />
                </div>
                <p className="mt-2 text-[11px] text-gray-500">Exemplo de exibicao no card.</p>
              </div>
              <div className="rounded-xl border border-[#2b2b2b] bg-[#151515] p-4">
                <p className="text-xs text-gray-400 mb-2">Preview carrossel rodape</p>
                <div className="h-16 w-full rounded-xl bg-[#101010] border border-[#2b2b2b] flex items-center justify-center">
                  <img
                    src={previewImage}
                    alt="Preview carrossel rodape"
                    className="h-16 w-auto max-w-[160px] object-contain"
                  />
                </div>
                <p className="mt-2 text-[11px] text-gray-500">Exemplo de exibicao no rodape.</p>
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 px-5 py-4 border-t border-[#2b2b2b] bg-[#141414]">
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
            className="px-5 py-2 rounded-lg bg-yellow-400 text-black font-bold hover:bg-yellow-300 disabled:opacity-70"
            disabled={saving}
          >
            {saving ? "Aplicando..." : "Aplicar logo"}
          </button>
        </div>
      </div>
    </div>
  );
}
