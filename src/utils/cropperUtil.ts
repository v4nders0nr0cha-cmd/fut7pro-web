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
