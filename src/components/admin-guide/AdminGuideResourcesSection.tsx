"use client";

import Link from "next/link";
import { BookOpen, ChartNoAxesCombined, Megaphone, Trophy, Video, Handshake } from "lucide-react";
import { guideResourceDestinations } from "@/lib/admin-guide-navigation";
import type { AdminGuideData, AdminGuidePatch } from "@/types/admin-guide";

type ResourceCardProps = {
  title: string;
  description: string;
  details?: string;
  icon: typeof BookOpen;
  links?: Array<{ label: string; href: string; external?: boolean }>;
};

function ResourceCard({ title, description, details, icon: Icon, links = [] }: ResourceCardProps) {
  return (
    <article className="min-w-0 rounded-xl border border-white/10 bg-[#23272F] p-4 sm:p-5">
      <div className="flex items-start gap-3">
        <Icon aria-hidden="true" size={20} className="mt-0.5 shrink-0 text-yellow-300" />
        <div className="min-w-0">
          <h3 className="font-semibold text-white">{title}</h3>
          <p className="mt-1 text-sm text-zinc-300">{description}</p>
          {details && (
            <details className="mt-2 text-sm text-zinc-300">
              <summary className="cursor-pointer text-yellow-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-yellow-300">
                Saiba mais
              </summary>
              <p className="mt-2">{details}</p>
            </details>
          )}
          {links.length > 0 && (
            <div className="mt-4 flex flex-wrap gap-2">
              {links.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  target={link.external ? "_blank" : undefined}
                  rel={link.external ? "noopener noreferrer" : undefined}
                  className="rounded-lg border border-yellow-400/50 px-3 py-2 text-sm font-semibold text-yellow-200 hover:bg-yellow-400/10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-yellow-300"
                >
                  {link.label}
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </article>
  );
}

const VIDEOS = [
  {
    id: "VIDEO_SORTEIO_INTELIGENTE",
    title: "Veja um sorteio inteligente na prática",
    description: "Acompanhe um exemplo de sorteio e conheça opções para organizar os times do dia.",
    href: "https://youtu.be/3uQGCjk19Uk",
  },
  {
    id: "VIDEO_PATROCINADORES",
    title: "Conheça ideias para apresentar patrocinadores",
    description: "Veja como a divulgação pode ajudar a buscar apoio para sua pelada.",
    href: "https://youtu.be/q5gSuNLZso4",
  },
] as const;

export default function AdminGuideResourcesSection({
  guide,
  updating,
  update,
}: {
  guide: AdminGuideData;
  updating: boolean;
  update: (action: AdminGuidePatch) => Promise<boolean>;
}) {
  const destinations = guideResourceDestinations(guide);

  return (
    <section aria-labelledby="guide-resources-title" className="space-y-4">
      <div>
        <h2 id="guide-resources-title" className="text-xl font-bold text-white sm:text-2xl">
          Explore mais recursos do Fut7Pro
        </h2>
        <p className="mt-2 text-sm text-zinc-300">
          Além de organizar os jogos, você pode valorizar os atletas, divulgar parceiros e manter
          seu grupo conectado. Estes recursos são opcionais e não alteram o progresso da jornada
          inicial.
        </p>
        {guide.activationProgress.complete && (
          <p className="mt-2 text-sm font-semibold text-yellow-200">
            Seu grupo já concluiu os primeiros passos. Continue aproveitando o Fut7Pro!
          </p>
        )}
      </div>
      <div className="grid gap-3 md:grid-cols-2">
        <ResourceCard
          title="Dê visibilidade aos patrocinadores do grupo"
          description="Divulgue as empresas que apoiam o grupo e valorize essas parcerias."
          details="Um espaço organizado para apresentar patrocinadores pode ajudar o grupo a buscar novas oportunidades de apoio, sem garantia de retorno financeiro."
          icon={Handshake}
          links={
            destinations.sponsors
              ? [{ label: "Gerenciar patrocinadores", href: destinations.sponsors }]
              : []
          }
        />
        <ResourceCard
          title="Acompanhe os rankings do grupo"
          description="Confira a participação nos jogos e os atletas que estiveram em equipes campeãs."
          details="Os rankings dependem dos registros esportivos oficiais. Em um grupo novo, eles podem ainda não apresentar resultados."
          icon={Trophy}
          links={[
            ...(destinations.attendanceRanking
              ? [{ label: "Ver Ranking de Assiduidade", href: destinations.attendanceRanking }]
              : []),
            ...(destinations.championsRanking
              ? [{ label: "Ver Ranking Campeões do Dia", href: destinations.championsRanking }]
              : []),
          ]}
        />
        <ResourceCard
          title="Explore as estatísticas do seu grupo"
          description="Conheça artilheiros, assistências, classificação e outros dados alimentados pelos jogos registrados."
          icon={ChartNoAxesCombined}
          links={
            destinations.statistics
              ? [
                  {
                    label: "Ver estatísticas do grupo (nova aba)",
                    href: destinations.statistics,
                    external: true,
                  },
                ]
              : []
          }
        />
        <ResourceCard
          title="Valorize as conquistas dos jogadores"
          description="Conheça os títulos e as premiações que preservam a história do seu grupo."
          details="O acesso à página de Conquistas não concede permissão para criar ou editar títulos."
          icon={BookOpen}
          links={
            destinations.achievements
              ? [{ label: "Conhecer Conquistas", href: destinations.achievements }]
              : []
          }
        />
        <ResourceCard
          title="Mantenha seu grupo conectado"
          description="Compartilhe avisos com comunicados e conheça as enquetes para ouvir os participantes."
          icon={Megaphone}
          links={[
            ...(destinations.announcements
              ? [{ label: "Gerenciar comunicados", href: destinations.announcements }]
              : []),
            ...(destinations.polls
              ? [{ label: "Conhecer enquetes", href: destinations.polls }]
              : []),
          ]}
        />
        <article className="min-w-0 rounded-xl border border-white/10 bg-[#23272F] p-4 sm:p-5">
          <div className="flex items-start gap-3">
            <Video aria-hidden="true" size={20} className="mt-0.5 shrink-0 text-yellow-300" />
            <div className="min-w-0">
              <h3 className="font-semibold text-white">Vídeos explicativos</h3>
              <p className="mt-1 text-sm text-zinc-300">
                Materiais opcionais do YouTube para conhecer recursos da plataforma. A reprodução
                começa apenas se você abrir o vídeo.
              </p>
              <ul className="mt-3 space-y-3">
                {VIDEOS.map((video) => {
                  const viewed = guide.pedagogicalState.viewedResources.includes(video.id);
                  return (
                    <li key={video.id} className="border-t border-white/10 pt-3 text-sm">
                      <p className="font-semibold text-white">{video.title}</p>
                      <p className="mt-1 text-zinc-300">{video.description}</p>
                      {viewed && <p className="mt-1 text-yellow-200">Material já acessado</p>}
                      <a
                        href={video.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={() => {
                          if (!viewed && !updating)
                            void update({ action: "RESOURCE_VIEWED", resourceId: video.id });
                        }}
                        className="mt-2 inline-block rounded-lg border border-yellow-400/50 px-3 py-2 font-semibold text-yellow-200 hover:bg-yellow-400/10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-yellow-300"
                      >
                        Assistir tutorial (YouTube, nova aba)
                      </a>
                    </li>
                  );
                })}
              </ul>
            </div>
          </div>
        </article>
      </div>
    </section>
  );
}
