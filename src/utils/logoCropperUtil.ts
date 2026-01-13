type CropAreaPixels = {
  x: number;
  y: number;
  width: number;
  height: number;
};

export default function getLogoCroppedImage(
  imageSrc: string,
  crop: CropAreaPixels,
  outputWidth: number,
  outputHeight: number,
  outputType: "image/png" | "image/webp" = "image/png",
  quality = 0.92
): Promise<string> {
  return new Promise((resolve, reject) => {
    if (!crop.width || !crop.height) {
      reject(new Error("Area de recorte invalida."));
      return;
    }

    const image = new Image();
    image.crossOrigin = "anonymous";
    image.src = imageSrc;

    image.onload = () => {
      const naturalWidth = image.naturalWidth || image.width;
      const naturalHeight = image.naturalHeight || image.height;
      if (!naturalWidth || !naturalHeight) {
        reject(new Error("Falha ao ler o tamanho da imagem."));
        return;
      }

      const canvas = document.createElement("canvas");
      canvas.width = outputWidth;
      canvas.height = outputHeight;
      const ctx = canvas.getContext("2d");
      if (!ctx) {
        reject(new Error("Falha ao obter contexto do canvas"));
        return;
      }

      const scaleX = outputWidth / crop.width;
      const scaleY = outputHeight / crop.height;
      const drawX = -crop.x * scaleX;
      const drawY = -crop.y * scaleY;
      const drawWidth = naturalWidth * scaleX;
      const drawHeight = naturalHeight * scaleY;

      ctx.clearRect(0, 0, outputWidth, outputHeight);
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = "high";
      ctx.drawImage(image, 0, 0, naturalWidth, naturalHeight, drawX, drawY, drawWidth, drawHeight);

      resolve(canvas.toDataURL(outputType, quality));
    };

    image.onerror = (err) => reject(err);
  });
}
