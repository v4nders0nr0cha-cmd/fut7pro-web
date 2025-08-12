export const metadata = {
  title: "Ajuda | Fut7Pro",
  description: "Dúvidas? Assista vídeos e acesse o canal oficial do Fut7Pro no YouTube.",
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
    <div className="pt-20 pb-24 md:pt-6 md:pb-8 max-w-2xl mx-auto">
      <h1 className="text-xl font-bold text-zinc-100 mb-6">Central de Ajuda</h1>
      <p className="text-zinc-400 mb-6">
        Assista aos vídeos abaixo e confira tutoriais rápidos! Para mais conteúdo, acesse nosso
        canal oficial no&nbsp;
        <a
          href="https://youtube.com/@fut7pro"
          className="text-yellow-400 font-semibold underline"
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
            className="bg-zinc-800 rounded-lg p-4 flex flex-col items-start border-l-4 border-yellow-400"
          >
            <span className="font-bold text-zinc-200 mb-2">{v.titulo}</span>
            <div className="w-full aspect-[16/9] rounded overflow-hidden">
              <iframe
                src={v.url}
                title={v.titulo}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                className="w-full h-44 rounded"
              />
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
