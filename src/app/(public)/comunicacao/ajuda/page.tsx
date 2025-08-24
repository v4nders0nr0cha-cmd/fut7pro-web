export const metadata = {
  title: "Ajuda | Fut7Pro",
  description:
    "Dúvidas? Assista vídeos e acesse o canal oficial do Fut7Pro no YouTube.",
  keywords: "fut7, ajuda, tutorial, vídeo, YouTube, SaaS",
};

const videos = [
  {
    id: 1,
    titulo: "Como criar seu racha no Fut7Pro",
    url: "https://www.youtube.com/embed/EXEMPLO1",
  },
  {
    id: 2,
    titulo: "Como participar de um racha pelo app",
    url: "https://www.youtube.com/embed/EXEMPLO2",
  },
];

export default function AjudaPage() {
  return (
    <div className="mx-auto max-w-2xl pb-24 pt-20 md:pb-8 md:pt-6">
      <h1 className="mb-6 text-xl font-bold text-zinc-100">Central de Ajuda</h1>
      <p className="mb-6 text-zinc-400">
        Assista aos vídeos abaixo e confira tutoriais rápidos! Para mais
        conteúdo, acesse nosso canal oficial no&nbsp;
        <a
          href="https://youtube.com/@fut7pro"
          className="font-semibold text-yellow-400 underline"
          target="_blank"
          rel="noopener noreferrer"
        >
          YouTube
        </a>
        .
      </p>
      <ul className="space-y-6">
        {videos.map((v) => (
          <li
            key={v.id}
            className="flex flex-col items-start rounded-lg border-l-4 border-yellow-400 bg-zinc-800 p-4"
          >
            <span className="mb-2 font-bold text-zinc-200">{v.titulo}</span>
            <div className="aspect-[16/9] w-full overflow-hidden rounded">
              <iframe
                src={v.url}
                title={v.titulo}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                className="h-44 w-full rounded"
              />
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
