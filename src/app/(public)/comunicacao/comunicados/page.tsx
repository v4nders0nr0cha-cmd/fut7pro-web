export const metadata = {
  title: "Comunicados | Fut7Pro",
  description: "Veja comunicados e avisos fixos publicados pela administração do seu racha.",
  keywords: "fut7, comunicados, avisos, racha, SaaS",
};

type Comunicado = {
  id: number;
  titulo: string;
  mensagem: string;
  data: string;
  autor: string;
  ativo: boolean;
};

const comunicadosMock: Comunicado[] = [
  {
    id: 1,
    titulo: "Pagamento da Mensalidade",
    mensagem: "Lembrete: O vencimento da mensalidade é dia 10. Não deixe de regularizar!",
    data: "2025-07-10T10:00:00Z",
    autor: "Presidente",
    ativo: true,
  },
  {
    id: 2,
    titulo: "Novo Horário de Jogo",
    mensagem: "Atenção: O racha desta semana será às 19h. Fique atento ao novo horário!",
    data: "2025-07-08T15:30:00Z",
    autor: "Diretor de Futebol",
    ativo: true,
  },
];

export default function ComunicadosPage() {
  return (
    <div className="pt-20 pb-24 md:pt-6 md:pb-8 max-w-2xl mx-auto">
      <h1 className="text-xl font-bold text-zinc-100 mb-4">Comunicados Oficiais</h1>
      <ul className="space-y-4">
        {comunicadosMock.filter((c) => c.ativo).length === 0 && (
          <li className="text-zinc-400">Nenhum comunicado ativo.</li>
        )}
        {comunicadosMock
          .filter((c) => c.ativo)
          .map((com) => (
            <li
              key={com.id}
              className="bg-zinc-800 rounded-lg p-4 text-zinc-100 border-l-4 border-yellow-400"
            >
              <div className="flex items-center justify-between">
                <span className="text-lg font-bold text-yellow-300">{com.titulo}</span>
                <span className="text-xs text-gray-400">
                  {new Date(com.data).toLocaleDateString()}
                </span>
              </div>
              <div className="mt-1">{com.mensagem}</div>
              <div className="text-xs text-gray-400 mt-2">
                Publicado por <span className="font-semibold">{com.autor}</span>
              </div>
            </li>
          ))}
      </ul>
    </div>
  );
}
