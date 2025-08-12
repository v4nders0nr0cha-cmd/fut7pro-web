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
    <div className="bg-zinc-900 border-2 border-yellow-400 rounded-xl p-6 mt-2 flex flex-col gap-4 items-center justify-center w-full max-w-2xl">
      <div className="w-full text-center text-yellow-300 font-bold text-lg mb-2">
        Banner do Campeão do Dia
      </div>
      {bannerUrl ? (
        <div className="flex flex-col items-center gap-2 w-full">
          <Image
            src={bannerUrl}
            alt="Banner do Time Campeão do Dia"
            width={600}
            height={150}
            className="rounded-xl object-cover w-full max-w-xl"
          />
          <button
            className="mt-2 px-5 py-1 rounded bg-red-600 text-white hover:bg-red-500 font-semibold"
            onClick={() => setBannerUrl(null)}
          >
            Remover Banner
          </button>
        </div>
      ) : (
        <label className="cursor-pointer bg-yellow-500 hover:bg-yellow-400 text-black font-bold px-6 py-2 rounded-lg shadow">
          Fazer upload do banner
          <input type="file" accept="image/*" onChange={handleUpload} className="hidden" />
        </label>
      )}
    </div>
  );
}
