import Image from "next/image";
import Link from "next/link";

type SponsorPublic = {
  id: string;
  name: string;
  logoUrl: string;
  link?: string | null;
  ramo?: string | null;
  about?: string | null;
  coupon?: string | null;
  benefit?: string | null;
  tier?: 'BASIC'|'PLUS'|'PRO';
  displayOrder?: number;
  status?: 'em_breve'|'ativo';
};

async function loadSponsors(slug: string): Promise<SponsorPublic[]> {
  const base = (process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:3333").replace(/\/$/, "");
  const res = await fetch(`${base}/sponsors/public?slug=${encodeURIComponent(slug)}`, {
    // Revalidação por tags é disparada via /api/revalidate/sponsors (admin)
    next: { tags: [`sponsors:${slug}`, `footer:${slug}`], revalidate: 3600 },
  });
  if (!res.ok) return [];
  const data = await res.json().catch(() => []);
  return Array.isArray(data) ? data : [];
}

export default async function Page({ params }: { params: { slug: string } }) {
  const { slug } = params;
  const sponsors = await loadSponsors(slug);

  return (
    <div className="max-w-7xl mx-auto px-4 pt-16 pb-24">
      <h1 className="text-3xl md:text-4xl font-black text-center text-yellow-400 mb-3">Nossos Parceiros</h1>
      <p className="text-center text-gray-300 mb-10">
        Valorize quem fortalece o nosso racha! Siga, prestigie e dê preferência aos nossos parceiros.
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {sponsors.map((s, idx) => {
          const tier = (s.tier || 'BASIC').toUpperCase();
          const tierClass = tier === 'PRO' ? 'ring-2 ring-yellow-400' : tier === 'PLUS' ? 'ring-1 ring-yellow-700' : 'ring-0';
          const num = String(idx + 1).padStart(2, '0');
          const emBreve = s.status === 'em_breve';
          return (
            <div key={s.id} className={`bg-[#1b1b1b] border border-[#2b2b2b] rounded-2xl p-6 flex flex-col gap-3 ${tierClass}`}>
              <div className="text-xs text-gray-400 uppercase tracking-widest">Patrocinador {num}</div>
              <div className="flex items-center gap-3">
                <Image src={s.logoUrl} alt={`Logo ${s.name}`} width={56} height={56} className="rounded-lg object-contain bg-[#111] border border-gray-700" />
                <div className="flex-1">
                  <div className="text-lg font-extrabold text-yellow-300">{s.name}</div>
                  {s.ramo && <div className="text-xs text-gray-300">{s.ramo}</div>}
                </div>
                {emBreve && (
                  <span className="text-[10px] bg-blue-900/40 border border-blue-700 text-blue-200 px-2 py-0.5 rounded font-bold">Em breve</span>
                )}
              </div>
              {s.about && <div className="text-sm text-gray-200">{s.about}</div>}
              {(s.coupon || s.benefit) && (
                <div className="text-xs text-gray-300">
                  {s.coupon && <span className="mr-2">Cupom: <b className="text-yellow-300">{s.coupon}</b></span>}
                  {s.benefit && <span className="">{s.benefit}</span>}
                </div>
              )}
              {s.link && (
                <div className="mt-2">
                  <Link href={s.link} target="_blank" className="inline-block bg-yellow-400 hover:bg-yellow-500 text-black font-bold px-4 py-2 rounded-full text-sm">
                    Saiba mais
                  </Link>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

