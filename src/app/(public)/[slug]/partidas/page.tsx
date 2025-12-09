import { redirect } from "next/navigation";

type PartidasSlugPageProps = {
  params: { slug: string };
};

export default function PartidasSlugPage({ params }: PartidasSlugPageProps) {
  const slug = params.slug || "racha";
  redirect(`/${slug}/partidas/times-do-dia`);
}
