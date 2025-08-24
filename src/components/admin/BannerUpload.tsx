"use client";
import Image from "next/image";
type Props = {
  bannerUrl: string | null;
  setBannerUrl: (url: string | null) => void;
  timeCampeao: any;
};
export default function BannerUpload({ bannerUrl, setBannerUrl }: Props) {
  function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const url = URL.createObjectURL(file);
      setBannerUrl(url);
    }
  }
  return (
    <div className="mt-2 flex w-full max-w-2xl flex-col items-center justify-center gap-4 rounded-xl border-2 border-yellow-400 bg-zinc-900 p-6">
      <div className="mb-2 w-full text-center text-lg font-bold text-yellow-300">
        Banner do Campeão do Dia
      </div>
      {bannerUrl ? (
        <div className="flex w-full flex-col items-center gap-2">
          <Image
            src={bannerUrl}
            alt="Banner do Time Campeão do Dia"
            width={600}
            height={150}
            className="w-full max-w-xl rounded-xl object-cover"
          />
          <button
            className="mt-2 rounded bg-red-600 px-5 py-1 font-semibold text-white hover:bg-red-500"
            onClick={() => setBannerUrl(null)}
          >
            Remover Banner
          </button>
        </div>
      ) : (
        <label className="cursor-pointer rounded-lg bg-yellow-500 px-6 py-2 font-bold text-black shadow hover:bg-yellow-400">
          Fazer upload do banner
          <input
            type="file"
            accept="image/*"
            onChange={handleUpload}
            className="hidden"
          />
        </label>
      )}
    </div>
  );
}
