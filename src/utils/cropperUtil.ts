// src/utils/cropperUtil.ts

/**
 * Realiza o crop de uma imagem com base nos pixels definidos e retorna o resultado como base64.
 * Funciona com imagens base64 ou URLs externas (com crossOrigin anon).
 *
 * @param imageSrc - Fonte da imagem (base64 ou URL).
 * @param croppedAreaPixels - Área recortada (x, y, width, height).
 * @param outputWidth - Largura final desejada (padrão = mesma da área recortada).
 * @param outputHeight - Altura final desejada (padrão = mesma da área recortada).
 * @returns Imagem recortada em base64.
 */
export default async function getCroppedImg(
  imageSrc: string,
  croppedAreaPixels: { x: number; y: number; width: number; height: number },
  outputWidth = croppedAreaPixels.width,
  outputHeight = croppedAreaPixels.height,
  outputType: "image/jpeg" | "image/png" | "image/webp" = "image/jpeg",
  quality = 0.92
): Promise<string> {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.crossOrigin = "anonymous";
    image.src = imageSrc;

    image.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = outputWidth;
      canvas.height = outputHeight;

      const ctx = canvas.getContext("2d");
      if (!ctx) {
        reject(new Error("Falha ao obter contexto do canvas"));
        return;
      }

      ctx.imageSmoothingQuality = "high";
      ctx.drawImage(
        image,
        croppedAreaPixels.x,
        croppedAreaPixels.y,
        croppedAreaPixels.width,
        croppedAreaPixels.height,
        0,
        0,
        outputWidth,
        outputHeight
      );

      const dataUrl = canvas.toDataURL(outputType, quality);
      resolve(dataUrl);
    };

    image.onerror = (err) => reject(err);
  });
}

type RgbColor = { r: number; g: number; b: number; a: number };

const getPixel = (data: Uint8ClampedArray, width: number, x: number, y: number): RgbColor => {
  const idx = (y * width + x) * 4;
  return {
    r: data[idx] ?? 0,
    g: data[idx + 1] ?? 0,
    b: data[idx + 2] ?? 0,
    a: data[idx + 3] ?? 0,
  };
};

const colorDistance = (a: RgbColor, b: RgbColor) =>
  Math.abs(a.r - b.r) + Math.abs(a.g - b.g) + Math.abs(a.b - b.b);

const resolveBackgroundColor = (data: Uint8ClampedArray, width: number, height: number) => {
  const corners = [
    getPixel(data, width, 0, 0),
    getPixel(data, width, width - 1, 0),
    getPixel(data, width, 0, height - 1),
    getPixel(data, width, width - 1, height - 1),
  ];
  const transparentCorners = corners.filter((c) => c.a <= 20);
  if (transparentCorners.length >= 3) {
    return { color: null, transparent: true };
  }

  const opaqueCorners = corners.filter((c) => c.a >= 220);
  if (opaqueCorners.length < 3) {
    return { color: null, transparent: false };
  }

  const base = opaqueCorners[0];
  const close = opaqueCorners.every((c) => colorDistance(c, base) <= 24);
  if (!close) {
    return { color: null, transparent: false };
  }

  const avg = opaqueCorners.reduce(
    (acc, c) => ({
      r: acc.r + c.r,
      g: acc.g + c.g,
      b: acc.b + c.b,
      a: acc.a + c.a,
    }),
    { r: 0, g: 0, b: 0, a: 0 }
  );
  const count = opaqueCorners.length;
  return {
    color: {
      r: Math.round(avg.r / count),
      g: Math.round(avg.g / count),
      b: Math.round(avg.b / count),
      a: Math.round(avg.a / count),
    },
    transparent: false,
  };
};

const detectContentBounds = (
  data: Uint8ClampedArray,
  width: number,
  height: number,
  background: { color: RgbColor | null; transparent: boolean }
) => {
  let minX = width;
  let minY = height;
  let maxX = 0;
  let maxY = 0;
  const alphaThreshold = 20;
  const bg = background.color;
  const bgThreshold = 28;

  for (let y = 0; y < height; y += 1) {
    for (let x = 0; x < width; x += 1) {
      const idx = (y * width + x) * 4;
      const a = data[idx + 3] ?? 0;
      if (a <= alphaThreshold) continue;
      if (bg) {
        const r = data[idx] ?? 0;
        const g = data[idx + 1] ?? 0;
        const b = data[idx + 2] ?? 0;
        const diff = Math.abs(r - bg.r) + Math.abs(g - bg.g) + Math.abs(b - bg.b);
        if (diff <= bgThreshold) continue;
      }
      if (x < minX) minX = x;
      if (y < minY) minY = y;
      if (x > maxX) maxX = x;
      if (y > maxY) maxY = y;
    }
  }

  if (minX > maxX || minY > maxY) {
    return { x: 0, y: 0, width, height };
  }

  const padX = Math.round(width * 0.02);
  const padY = Math.round(height * 0.02);
  const startX = Math.max(0, minX - padX);
  const startY = Math.max(0, minY - padY);
  const endX = Math.min(width - 1, maxX + padX);
  const endY = Math.min(height - 1, maxY + padY);

  return {
    x: startX,
    y: startY,
    width: endX - startX + 1,
    height: endY - startY + 1,
  };
};

const detectTransparency = (data: Uint8ClampedArray) => {
  for (let i = 3; i < data.length; i += 4) {
    if ((data[i] ?? 255) < 255) return true;
  }
  return false;
};

export async function getNormalizedLogo(
  imageSrc: string,
  croppedAreaPixels: { x: number; y: number; width: number; height: number },
  outputWidth = 1024,
  outputHeight = 617
): Promise<string> {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.crossOrigin = "anonymous";
    image.src = imageSrc;

    image.onload = () => {
      const cropCanvas = document.createElement("canvas");
      cropCanvas.width = croppedAreaPixels.width;
      cropCanvas.height = croppedAreaPixels.height;
      const cropCtx = cropCanvas.getContext("2d");
      if (!cropCtx) {
        reject(new Error("Falha ao obter contexto do canvas"));
        return;
      }

      cropCtx.imageSmoothingQuality = "high";
      cropCtx.drawImage(
        image,
        croppedAreaPixels.x,
        croppedAreaPixels.y,
        croppedAreaPixels.width,
        croppedAreaPixels.height,
        0,
        0,
        croppedAreaPixels.width,
        croppedAreaPixels.height
      );

      const cropData = cropCtx.getImageData(0, 0, cropCanvas.width, cropCanvas.height);
      const background = resolveBackgroundColor(cropData.data, cropCanvas.width, cropCanvas.height);
      const bounds = detectContentBounds(
        cropData.data,
        cropCanvas.width,
        cropCanvas.height,
        background
      );

      const trimmedCanvas = document.createElement("canvas");
      trimmedCanvas.width = bounds.width;
      trimmedCanvas.height = bounds.height;
      const trimmedCtx = trimmedCanvas.getContext("2d");
      if (!trimmedCtx) {
        reject(new Error("Falha ao obter contexto do canvas"));
        return;
      }
      trimmedCtx.imageSmoothingQuality = "high";
      trimmedCtx.drawImage(
        cropCanvas,
        bounds.x,
        bounds.y,
        bounds.width,
        bounds.height,
        0,
        0,
        bounds.width,
        bounds.height
      );

      const outputCanvas = document.createElement("canvas");
      outputCanvas.width = outputWidth;
      outputCanvas.height = outputHeight;
      const outputCtx = outputCanvas.getContext("2d");
      if (!outputCtx) {
        reject(new Error("Falha ao obter contexto do canvas"));
        return;
      }

      outputCtx.clearRect(0, 0, outputWidth, outputHeight);
      outputCtx.imageSmoothingQuality = "high";
      const paddingRatio = 0.08;
      const maxWidth = outputWidth * (1 - paddingRatio * 2);
      const maxHeight = outputHeight * (1 - paddingRatio * 2);
      const scale = Math.min(maxWidth / bounds.width, maxHeight / bounds.height);
      const drawWidth = Math.round(bounds.width * scale);
      const drawHeight = Math.round(bounds.height * scale);
      const offsetX = Math.round((outputWidth - drawWidth) / 2);
      const offsetY = Math.round((outputHeight - drawHeight) / 2);

      outputCtx.drawImage(
        trimmedCanvas,
        0,
        0,
        bounds.width,
        bounds.height,
        offsetX,
        offsetY,
        drawWidth,
        drawHeight
      );

      const outputData = outputCtx.getImageData(0, 0, outputWidth, outputHeight);
      const hasTransparency = detectTransparency(outputData.data);
      const outputType = hasTransparency ? "image/png" : "image/webp";
      const dataUrl = outputCanvas.toDataURL(outputType, 0.9);
      resolve(dataUrl);
    };

    image.onerror = (err) => reject(err);
  });
}
