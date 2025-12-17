"use client";

import Head from "next/head";
import { useState } from "react";
import { FaSearch, FaBook, FaVideo, FaFire, FaRegQuestionCircle, FaYoutube } from "react-icons/fa";
import { useAboutPublic } from "@/hooks/useAbout";
import { useRacha } from "@/context/RachaContext";
import { rachaConfig } from "@/config/racha.config";

type ArtigoAjuda = {
  id?: number | string;
  categoria?: string;
  titulo: string;
  conteudo: string;
  destaque?: boolean;
};

// 🔥 PRINCIPAIS TÓPICOS EM DESTAQUE SÃO OS MAIS COBRADOS OU QUE EVITAM ERROS NA GESTÃO

const artigosMock: ArtigoAjuda[] = [
  // DASHBOARD
  {
    id: 1,
    categoria: "Primeiros Passos",
    titulo: "Visão Geral do Dashboard",
    conteudo:
      "O Dashboard concentra atalhos, alertas, resumos financeiros e notificações do seu racha. Confira sempre os avisos no topo antes de começar a gestão do dia. Utilize os cards para acessar rapidamente funções essenciais como Time Campeão, Times do Dia e Sorteio Inteligente.",
    destaque: true,
  },

  // PARTIDAS
  {
    id: 2,
    categoria: "Partidas",
    titulo: "Como cadastrar resultados no Histórico de Partidas?",
    conteudo:
      "Acesse 'Partidas' > 'Histórico'. Clique em uma partida para ver detalhes, editar resultados, gols, cartões e destaques. Use os filtros de datas para localizar jogos rapidamente.",
    destaque: true,
  },
  {
    id: 3,
    categoria: "Partidas",
    titulo: "Como programar e gerenciar Próximos Rachas?",
    conteudo:
      "Vá em 'Partidas' > 'Próximos Rachas'. Programe novos jogos, informe data, horário e local. Confirme a presença dos jogadores e ajuste os dados conforme necessário antes do sorteio.",
  },
  {
    id: 4,
    categoria: "Partidas",
    titulo: "Como usar o Time Campeão do Dia?",
    conteudo:
      "Após o jogo, acesse 'Partidas' > 'Time Campeão do Dia'. Clique em 'Editar Campeão', envie uma foto, cadastre gols, passes, destaques e artilheiros do dia. Salve para atualizar o mural de campeões e o perfil dos atletas.",
    destaque: true,
  },
  {
    id: 5,
    categoria: "Partidas",
    titulo: "Como ver e ajustar as Escalações (Times do Dia)?",
    conteudo:
      "Em 'Partidas' > 'Times do Dia', confira as escalações automáticas do sistema. Ajuste manualmente se necessário (só admins podem editar). Garanta que todos estejam marcados como titulares para o sorteio funcionar.",
  },
  {
    id: 6,
    categoria: "Partidas",
    titulo: "Como usar o Sorteio Inteligente de Times?",
    conteudo:
      "No menu 'Partidas', clique em 'Sorteio Inteligente'. Selecione os jogadores titulares. O sistema monta times balanceados conforme ranking, estrelas e assiduidade. Ajuste manualmente se precisar, depois salve.",
    destaque: true,
  },

  // JOGADORES
  {
    id: 7,
    categoria: "Jogadores",
    titulo: "Como cadastrar, editar e gerenciar jogadores?",
    conteudo:
      "Entre em 'Jogadores' > 'Listar/Cadastrar'. Veja a lista completa, filtre por status, posição ou mensalistas. Clique em 'Novo Jogador' para cadastrar ou edite/remova jogadores existentes conforme a necessidade. Campos obrigatórios são destacados.",
    destaque: true,
  },
  {
    id: 8,
    categoria: "Jogadores",
    titulo: "Como funciona o Ranking de Assiduidade?",
    conteudo:
      "Em 'Jogadores' > 'Ranking Assiduidade', visualize quem mais participa dos jogos. Use o ranking para premiar e motivar os jogadores mais comprometidos com o grupo.",
  },
  {
    id: 9,
    categoria: "Jogadores",
    titulo: "Como controlar pagamentos dos Mensalistas?",
    conteudo:
      "Acesse 'Jogadores' > 'Mensalistas' ou 'Financeiro' > 'Mensalistas'. Veja a lista, marque pagamentos realizados ou pendentes, e mantenha os registros sempre atualizados.",
  },

  // CONQUISTAS
  {
    id: 10,
    categoria: "Conquistas",
    titulo: "Como finalizar temporadas e gerar os Campeões do Ano?",
    conteudo:
      "Em 'Conquistas' > 'Os Campeões', finalize a temporada manualmente ou aguarde o sistema encerrar no fim do ano. Os campeões anuais e por posição são atualizados automaticamente nos perfis dos atletas.",
    destaque: true,
  },
  {
    id: 11,
    categoria: "Conquistas",
    titulo: "Como cadastrar e gerenciar Grandes Torneios?",
    conteudo:
      "Em 'Conquistas' > 'Grandes Torneios', cadastre campeonatos internos, copas e eventos. Informe nome, descrição, data/período, time e jogadores campeões. Prêmios e ícones aparecem automaticamente nos perfis dos atletas.",
  },

  // FINANCEIRO
  {
    id: 12,
    categoria: "Financeiro",
    titulo: "Como lançar entradas e saídas em Prestação de Contas?",
    conteudo:
      "Em 'Financeiro' > 'Prestação de Contas', clique em 'Novo Lançamento'. Preencha categoria (mensalidade, diária, multa, patrocínio, etc), valor, data e tipo (entrada/saída). Exporte relatórios em PDF para transparência total.",
    destaque: true,
  },
  {
    id: 13,
    categoria: "Financeiro",
    titulo: "Como cadastrar e editar Patrocinadores?",
    conteudo:
      "Em 'Financeiro' > 'Patrocinadores', adicione patrocinadores, defina planos, valores e exposição (logo, banners, rodapé). Histórico de entradas é atualizado automaticamente.",
  },

  // PERSONALIZAÇÃO
  {
    id: 14,
    categoria: "Personalização",
    titulo: "Como personalizar logo, nome e visual do racha?",
    conteudo:
      "Vá em 'Personalização' > 'Identidade Visual'. Troque logo, nome, slogan e descrição do seu racha. As mudanças aparecem instantaneamente no painel e na página pública.",
    destaque: true,
  },
  {
    id: 15,
    categoria: "Personalização",
    titulo: "Como mudar tema e cores do painel?",
    conteudo:
      "Em 'Personalização' > 'Visual/Temas', escolha entre diversas paletas de cores e temas visuais para personalizar seu painel Fut7Pro.",
  },
  {
    id: 16,
    categoria: "Personalização",
    titulo: "Como editar textos e rodapé do site?",
    conteudo:
      "Use 'Personalização' > 'Editar Páginas' e 'Rodapé/Footer' para customizar textos institucionais, links e redes sociais exibidos no site.",
  },
  {
    id: 17,
    categoria: "Personalização",
    titulo: "Como cadastrar e exibir as Redes Sociais?",
    conteudo:
      "Em 'Personalização' > 'Redes Sociais', inclua ou edite links para Instagram, Facebook, WhatsApp e outras redes. Os ícones aparecem automaticamente no rodapé do site.",
  },

  // ADMINISTRAÇÃO
  {
    id: 18,
    categoria: "Administração",
    titulo: "Como gerenciar administradores e permissões?",
    conteudo:
      "Em 'Administração' > 'Administradores', adicione ou remova administradores, defina cargos e funções. Use 'Permissões' para restringir ou liberar acessos específicos a cada admin.",
    destaque: true,
  },
  {
    id: 19,
    categoria: "Administração",
    titulo: "Como consultar logs administrativos?",
    conteudo:
      "Acesse 'Administração' > 'Logs/Admin' para ver o histórico detalhado de ações, alterações e eventos do painel.",
  },
  {
    id: 20,
    categoria: "Administração",
    titulo: "Como transferir a propriedade do racha?",
    conteudo:
      "Em 'Administração' > 'Transferir Propriedade', busque o novo presidente (precisa estar cadastrado) e confirme a transferência de posse.",
  },

  // COMUNICAÇÃO
  {
    id: 21,
    categoria: "Comunicação",
    titulo: "Como publicar Comunicados no mural?",
    conteudo:
      "Entre em 'Comunicação' > 'Comunicados'. Clique em 'Novo Comunicado', escreva sua mensagem e defina até quando ficará visível. Ideal para avisos importantes e regras do racha.",
    destaque: true,
  },
  {
    id: 22,
    categoria: "Comunicação",
    titulo: "Como enviar Notificações em Massa?",
    conteudo:
      "Acesse 'Comunicação' > 'Notificações'. Selecione o(s) canal(is): badge, push, e-mail ou WhatsApp. Escolha o grupo (ex: só mensalistas), escreva a mensagem e envie. Apenas jogadores com cadastro completo recebem pelo canal escolhido.",
    destaque: true,
  },
  {
    id: 23,
    categoria: "Comunicação",
    titulo: "Como abrir e acompanhar chamados de Suporte?",
    conteudo:
      "Vá em 'Comunicação' > 'Suporte'. Abra chamados para dúvidas, problemas ou sugestões. Anexe imagens se necessário e acompanhe o status (aguardando, respondido, finalizado).",
  },
  {
    id: 24,
    categoria: "Comunicação",
    titulo: "Como usar a Central de Ajuda?",
    conteudo:
      "Na Central de Ajuda, busque por artigos, tutoriais ou vídeos de cada funcionalidade do painel. Use a busca para localizar rapidamente o que precisa.",
  },
  {
    id: 25,
    categoria: "Comunicação",
    titulo: "Como receber Sugestões dos jogadores?",
    conteudo:
      "Em 'Comunicação' > 'Sugestões', veja as sugestões enviadas pelos jogadores. Responda e utilize as ideias para melhorar o racha.",
  },
  {
    id: 26,
    categoria: "Comunicação",
    titulo: "Como criar e gerenciar Enquetes?",
    conteudo:
      "No menu 'Comunicação' > 'Enquetes', crie enquetes para engajar jogadores, votar decisões importantes e conhecer opiniões do grupo.",
  },

  // RELATÓRIOS / MONETIZAÇÃO / EXTRAS
  {
    id: 27,
    categoria: "Relatórios",
    titulo: "Como visualizar Relatórios de Engajamento?",
    conteudo:
      "Em 'Relatórios de Engajamento', acompanhe os principais indicadores do seu racha: acessos, engajamento, tempo médio de permanência, exportação de PDF e compartilhamento de resultados.",
    destaque: true,
  },
  {
    id: 28,
    categoria: "Monetização",
    titulo: "Como usar a área de Monetização (Lucre Mais)?",
    conteudo:
      "No card 'Monetização' do Dashboard ou na futura área própria, acesse dicas, estratégias, arquivos editáveis e ideias para aumentar as receitas do seu racha, vender espaços para patrocinadores e criar eventos pagos.",
  },
  {
    id: 29,
    categoria: "Primeiros Passos",
    titulo: "Como acompanhar o Ciclo do Plano e mudar de plano?",
    conteudo:
      "Na seção 'Ciclo do Plano', veja quantos dias restam do seu ciclo de cobrança, status do teste grátis e opções para upgrade de plano.",
  },
  {
    id: 30,
    categoria: "Dúvidas Frequentes",
    titulo: "Como redefinir a senha de um administrador?",
    conteudo:
      "Vá em 'Administração' > 'Administradores', selecione o admin e clique em 'Redefinir senha'.",
  },
];

const videosMock = [
  {
    id: 1,
    titulo: "Tour pelo Painel Fut7Pro",
    url: "https://www.youtube.com/embed/6mR8Z-gmK1g",
  },
];

const categorias = [
  "Primeiros Passos",
  "Partidas",
  "Jogadores",
  "Conquistas",
  "Financeiro",
  "Personalização",
  "Administração",
  "Comunicação",
  "Relatórios",
  "Monetização",
  "Dúvidas Frequentes",
];

export default function CentralAjudaPage() {
  const { tenantSlug } = useRacha();
  const slug = tenantSlug || rachaConfig.slug;
  const { about } = useAboutPublic(slug);
  const [busca, setBusca] = useState("");
  const artigosOrigem =
    (about as any)?.ajudaArtigos && Array.isArray((about as any).ajudaArtigos)
      ? ((about as any).ajudaArtigos as ArtigoAjuda[])
      : artigosMock;
  // Busca filtra só Tópicos em Destaque + Artigos e Tutoriais
  const artigosFiltrados = artigosOrigem.filter(
    (a) =>
      a.titulo.toLowerCase().includes(busca.toLowerCase()) ||
      a.conteudo.toLowerCase().includes(busca.toLowerCase())
  );
  const artigosDestaqueFiltrados = artigosFiltrados.filter((a) => a.destaque);
  const artigosPorCategoriaFiltrados = (cat: string) =>
    artigosFiltrados.filter((a) => a.categoria === cat);
  const categoriasDinamicas = Array.from(
    new Set([...artigosOrigem.map((a) => a.categoria).filter(Boolean), ...categorias])
  );
  return (
    <>
      <Head>
        <title>Central de Ajuda | Fut7Pro Admin</title>
        <meta
          name="description"
          content="Manual do administrador, vídeos rápidos, tutoriais e dicas para gestão no Fut7Pro."
        />
        <meta name="keywords" content="Fut7, racha, ajuda, tutorial, SaaS, admin, manual" />
      </Head>
      <div className="pt-20 pb-24 md:pt-6 md:pb-8 px-4 max-w-6xl mx-auto w-full">
        <h1 className="text-2xl md:text-3xl font-bold text-yellow-400 mb-2 flex items-center gap-2">
          <FaBook /> Central de Ajuda
        </h1>
        {/* Bloco Youtube */}
        <div className="mb-5 p-4 rounded-lg bg-[#232323] border-l-4 border-red-500 shadow flex flex-col md:flex-row md:items-center md:justify-between gap-2 animate-fadeIn">
          <div className="flex items-center gap-2 mb-2 md:mb-0">
            <FaYoutube className="text-red-500 text-2xl" />
            <span className="font-bold text-red-500 text-lg">Nosso Canal no YouTube</span>
          </div>
          <div className="flex-1 text-gray-300 md:ml-4 text-sm">
            Assista a tutoriais em vídeo, dicas, novidades e exemplos de uso do Fut7Pro direto no
            nosso canal.
          </div>
          <a
            href="https://www.youtube.com/@Fut7ProSite/videos"
            target="_blank"
            rel="noopener noreferrer"
            className="bg-red-600 hover:bg-red-700 text-white font-bold px-4 py-2 rounded flex items-center gap-2 transition mt-3 md:mt-0 shadow"
            title="Acessar canal Fut7Pro no Youtube"
          >
            <FaYoutube className="text-xl" /> Ir para o YouTube
          </a>
        </div>

        <div className="mb-6 p-4 rounded-lg bg-[#232323] border-l-4 border-yellow-400 shadow animate-fadeIn text-sm">
          <b className="text-yellow-300">Bem-vindo à Central de Ajuda do Fut7Pro!</b>
          <br />
          Encontre aqui manuais, vídeos rápidos, tutoriais e dicas práticas para facilitar sua
          gestão e maximizar os resultados do seu racha.
          <br />
          <span className="text-gray-300">
            Busque um tema, assista a um vídeo ou explore as dúvidas frequentes.
          </span>
        </div>

        {/* Vídeos rápidos (fallback quando a API não retornar) */}
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-2">
            <FaVideo className="text-yellow-400" />
            <span className="text-lg font-bold text-yellow-400">Vídeos Rápidos</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {(about?.videos ?? videosMock).map((video, idx) => (
              <div
                key={(video as any).id ?? idx}
                className="bg-[#232323] rounded-lg p-3 shadow flex flex-col items-center"
              >
                <iframe
                  width="100%"
                  height="180"
                  src={video.url}
                  title={video.titulo}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  className="rounded mb-2"
                ></iframe>
                <span className="text-gray-100 font-semibold text-center">{video.titulo}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Busca - agora só para tópicos em destaque e artigos */}
        <div className="mb-8 flex flex-col md:flex-row md:items-center gap-3">
          <label htmlFor="busca" className="sr-only">
            Buscar em tópicos de ajuda
          </label>
          <div className="flex flex-1 items-center rounded bg-[#181818] border border-yellow-400">
            <FaSearch className="mx-3 text-yellow-400" />
            <input
              id="busca"
              type="text"
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
              placeholder="Digite uma dúvida, palavra-chave ou função…"
              className="bg-transparent border-none outline-none py-2 pr-3 w-full text-gray-200"
              autoComplete="off"
            />
          </div>
        </div>

        {/* Tópicos em destaque / dúvidas frequentes */}
        <div className="mb-10">
          <div className="flex items-center gap-2 mb-2">
            <FaFire className="text-yellow-400" />
            <span className="text-lg font-bold text-yellow-400">Tópicos em Destaque</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {artigosDestaqueFiltrados.length === 0 && (
              <div className="text-gray-400 col-span-3">Nenhum tópico em destaque encontrado.</div>
            )}
            {artigosDestaqueFiltrados.map((a) => (
              <div
                key={a.id}
                className="bg-[#232323] rounded-lg p-4 shadow border-l-4 border-yellow-400 animate-fadeIn"
              >
                <div className="font-bold text-yellow-300 mb-1">{a.titulo}</div>
                <div className="text-gray-200 text-sm mb-2">{a.conteudo}</div>
                <div className="text-xs text-gray-400">{a.categoria}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Lista de artigos por categoria + busca */}
        <div className="mb-12">
          <div className="flex items-center gap-2 mb-2">
            <FaRegQuestionCircle className="text-yellow-400" />
            <span className="text-lg font-bold text-yellow-400">Artigos e Tutoriais</span>
          </div>
          {categoriasDinamicas.map((cat) => (
            <div key={cat} className="mb-5">
              <div className="font-bold text-gray-200 mb-2 mt-4">{cat}</div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {artigosPorCategoriaFiltrados(cat).length === 0 && (
                  <div className="text-gray-400 text-sm italic">Nenhum artigo nesta categoria.</div>
                )}
                {artigosPorCategoriaFiltrados(cat).map((a) => (
                  <div
                    key={a.id}
                    className="bg-[#181818] rounded-lg p-4 shadow border-l-4 border-yellow-400 animate-fadeIn"
                  >
                    <div className="font-bold text-yellow-300 mb-1">{a.titulo}</div>
                    <div className="text-gray-200 text-sm">{a.conteudo}</div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
      <style>{`
                .animate-fadeIn { animation: fadeIn 0.35s; }
                @keyframes fadeIn {
                    from { opacity: 0; transform: translateY(12px); }
                    to { opacity: 1; transform: none; }
                }
            `}</style>
    </>
  );
}
