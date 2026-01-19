"use client";

import Image from "next/image";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import ConquistasDoAtleta from "@/components/atletas/ConquistasDoAtleta";
import HistoricoJogos from "@/components/atletas/HistoricoJogos";
import ModalEditarPerfil from "@/components/atletas/ModalEditarPerfil";
import { usePerfil } from "@/components/atletas/PerfilContext";
import { usePublicLinks } from "@/hooks/usePublicLinks";

const temporadaAtual = 2025;

// --- Card Mensalista Premium ---
function CartaoMensalistaPremium({
  nome,
  logoRacha,
  ativo = true,
}: {
  nome: string;
  logoRacha: string;
  ativo?: boolean;
}) {
  const [exportando, setExportando] = useState(false);
  const cardRef = useState<HTMLDivElement | null>(null)[0];

  const handleDownload = async () => {
    if (!ativo || !cardRef) return;
    setExportando(true);
    await new Promise((r) => setTimeout(r, 50));
    const html2canvas = (await import("html2canvas")).default;
    const canvas = await html2canvas(cardRef, {
      backgroundColor: null,
      useCORS: true,
      scale: 2,
    });
    setExportando(false);
    const link = document.createElement("a");
    link.download = `cartao-mensalista-${nome.replace(/\s+/g, "_").toLowerCase()}.png`;
    link.href = canvas.toDataURL("image/png");
    link.click();
  };

  return (
    <div
      ref={cardRef as any}
      className={`
        relative w-[340px] h-[160px] rounded-2xl overflow-hidden shadow-2xl
        border-4 flex
        bg-[url('/images/bg-campo-fut7.jpg')] bg-cover bg-center
        transition
        ${ativo ? "border-green-400 shadow-green-400/50 cursor-pointer hover:brightness-110" : "border-gray-400 shadow-gray-700/30"}
      `}
      style={{
        boxShadow: exportando
          ? "none"
          : ativo
            ? "0 0 18px 2px #38ff00, 0 2px 22px #0008"
            : "0 0 10px #6668",
      }}
      title={ativo ? "Clique para salvar seu Cartão Mensalista" : ""}
      onClick={ativo ? handleDownload : undefined}
    >
      {/* Lado esquerdo */}
      <div className="flex flex-col justify-between pl-5 py-4 flex-1">
        <div>
          <div className="text-green-400 font-extrabold text-base drop-shadow-sm tracking-wide">
            MENSALISTA
          </div>
        </div>
      </div>
      {/* Lado direito */}
      <div className="flex flex-col items-center justify-between w-[140px] py-3 pr-5">
        <div className="text-green-400 font-semibold text-xs mb-1 mt-1">Ativo no mês</div>
        <Image
          src={logoRacha}
          alt="Logo do Racha"
          width={54}
          height={54}
          className="rounded-lg border border-white mb-1"
          draggable={false}
        />
        <div
          className="text-white font-bold text-sm mt-2 text-center"
          style={{
            textShadow: "0px 2px 8px #000, 0px 1px 0px #222, 0px 0px 2px #000",
          }}
        >
          {nome}
        </div>
      </div>
      {/* Tooltip - canto inferior esquerdo */}
      {ativo && !exportando && (
        <div className="absolute left-2 bottom-2 bg-black/70 px-2 py-1 rounded text-[10px] text-green-300 pointer-events-none select-none">
          Clique para baixar seu cartão!
        </div>
      )}
      {/* Neon premium (não exporta!) */}
      {!exportando && (
        <div
          className="pointer-events-none absolute inset-0 rounded-2xl border-4 border-green-400 opacity-70"
          style={{
            boxShadow: "0 0 18px 3px #38ff00, 0 0 18px #38ff0050 inset",
          }}
        />
      )}
    </div>
  );
}

// --- Card Solicitar Mensalista ---
function CardSolicitarMensalista({ onConfirm }: { onConfirm: () => void }) {
  const [modalOpen, setModalOpen] = useState(false);

  return (
    <>
      <div
        className="relative w-[340px] h-[160px] rounded-2xl overflow-hidden shadow-2xl border-4 border-yellow-400 flex flex-col justify-center items-center cursor-pointer bg-gradient-to-br from-yellow-200/60 via-yellow-100/80 to-yellow-300/50 hover:scale-105 transition"
        onClick={() => setModalOpen(true)}
        title="Quero ser Mensalista"
        tabIndex={0}
      >
        <div className="absolute inset-0 pointer-events-none rounded-2xl border-4 border-yellow-400 opacity-60 shadow-yellow-300"></div>
        <div className="flex flex-col items-center justify-center z-10 px-6 py-3 h-full w-full">
          <div className="text-yellow-700 font-extrabold text-lg text-center drop-shadow-sm mb-2">
            Torne-se um Mensalista!
          </div>
          <div className="text-yellow-800 text-[15px] text-center font-medium leading-snug">
            Garanta sua vaga como mensalista
            <br />
            e aproveite sua vaga garantida
            <br />
            no racha, e benefícios exclusivos.
            <br />
            <span className="font-bold block mt-2">Clique aqui para solicitar!</span>
          </div>
        </div>
      </div>
      {modalOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/60 z-50">
          <div className="bg-zinc-900 p-8 rounded-xl max-w-sm w-full shadow-xl border border-yellow-600 flex flex-col items-center">
            <div className="text-lg font-semibold text-yellow-400 mb-2 text-center">
              Solicitar vaga de Mensalista
            </div>
            <div className="text-sm text-zinc-100 text-center mb-6">
              Ao confirmar, seu pedido para se tornar mensalista será enviado ao administrador.
              <br />
              <span className="text-yellow-200">
                Caso todas as vagas já estejam ocupadas, você entrará automaticamente em uma lista
                de espera por ordem de solicitação.
              </span>
              <br />
              Deseja realmente enviar este pedido?
            </div>
            <div className="flex gap-4 mt-2">
              <button
                className="px-5 py-2 rounded bg-yellow-500 text-black font-semibold hover:bg-yellow-400 transition"
                onClick={() => {
                  setModalOpen(false);
                  onConfirm();
                }}
              >
                Confirmar
              </button>
              <button
                className="px-5 py-2 rounded bg-zinc-700 text-white font-semibold hover:bg-zinc-600 transition"
                onClick={() => setModalOpen(false)}
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

// --- Página ---
export default function PerfilUsuarioPage() {
  const { usuario, roleLabel, isLoading, isError, isAuthenticated, isPendingApproval } =
    usePerfil();
  const router = useRouter();
  const { publicHref } = usePublicLinks();
  const loginHref = useMemo(() => {
    const params = new URLSearchParams();
    params.set("callbackUrl", publicHref("/perfil"));
    return `${publicHref("/login")}?${params.toString()}`;
  }, [publicHref]);
  const [filtroStats, setFiltroStats] = useState<"temporada" | "historico">("temporada");
  const [pedidoEnviado, setPedidoEnviado] = useState(false);
  const [modalEditarOpen, setModalEditarOpen] = useState(false);

  useEffect(() => {
    if (!isAuthenticated || isLoading) return;
    if (isPendingApproval) {
      router.replace(publicHref("/aguardando-aprovacao"));
    }
  }, [isAuthenticated, isLoading, isPendingApproval, router, publicHref]);

  useEffect(() => {
    if (isLoading) return;
    if (!isAuthenticated) {
      router.replace(loginHref);
    }
  }, [isAuthenticated, isLoading, router, loginHref]);

  if (isLoading) {
    return <div className="max-w-3xl mx-auto px-4 py-16 text-zinc-200">Carregando perfil...</div>;
  }

  if (!isAuthenticated) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-16 text-zinc-200">
        Redirecionando para o login...
      </div>
    );
  }

  if (isError || !usuario) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-16 text-red-200">
        Nao foi possivel carregar o perfil. Tente novamente mais tarde.
      </div>
    );
  }

  if (isPendingApproval) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-16 text-zinc-200">
        Redirecionando para a tela de aguardando aprovacao...
      </div>
    );
  }

  const stats =
    filtroStats === "temporada"
      ? (usuario.estatisticas.anual?.[temporadaAtual] ?? usuario.estatisticas.historico)
      : usuario.estatisticas.historico;

  const nivelAssiduidade = (jogos: number) => {
    if (jogos >= 100) return "🐐 Lenda";
    if (jogos >= 50) return "🦾 Veterano";
    if (jogos >= 20) return "✨ Destaque";
    if (jogos >= 10) return "🧢 Titular";
    if (jogos >= 3) return "🔄 Juvenil";
    return "🎓 Novato";
  };

  const {
    titulosGrandesTorneios = [],
    titulosAnuais = [],
    titulosQuadrimestrais = [],
  } = usuario.conquistas ?? {};

  return (
    <div className="p-6 text-white w-full">
      <h1 className="sr-only">Meu Perfil – Estatísticas, Conquistas e Histórico | Fut7Pro</h1>
      {isPendingApproval && (
        <div className="mb-6 rounded-xl border border-yellow-400/40 bg-yellow-400/10 px-4 py-3 text-sm text-yellow-100">
          <strong className="block text-yellow-200">Aguardando aprovacao do admin.</strong>
          Seu cadastro foi recebido e o acesso completo sera liberado em breve.
        </div>
      )}
      <div className="flex flex-col md:flex-row gap-6 items-center md:items-start">
        {/* Dados do usuário logado */}
        <div className="flex-1 flex flex-col md:flex-row gap-6 items-center">
          <Image
            src={usuario.foto}
            alt={`Foto de ${usuario.nome}`}
            width={160}
            height={160}
            className="rounded-full border-4 border-yellow-400"
          />

          <div className="flex flex-col gap-1">
            <h2 className="text-3xl font-bold mb-1">{usuario.nome}</h2>
            {usuario.apelido && <p className="text-yellow-300 mb-1">Apelido: {usuario.apelido}</p>}
            {roleLabel && (
              <span className="inline-block bg-yellow-400 text-black rounded px-3 py-1 text-xs font-bold mt-1">
                {roleLabel}
              </span>
            )}
            <p className="text-sm">Posição: {usuario.posicao}</p>
            <p className="text-sm">
              Posicao secundaria: {usuario.posicaoSecundaria || "Nao informado"}
            </p>
            <p
              className="text-sm text-zinc-300"
              title={`Último jogo: ${usuario.ultimaPartida ?? "Data não registrada"}`}
            >
              Status: {usuario.status}
            </p>
            <p className="text-sm mt-1">
              {usuario.mensalista ? (
                <span className="text-green-400 font-semibold">💰 MENSALISTA ATIVO</span>
              ) : (
                <span className="text-zinc-400">NÃO É MENSALISTA</span>
              )}
            </p>
            <p className="text-sm mt-1">
              🔁 Nível de Assiduidade: {nivelAssiduidade(usuario.totalJogos)}
            </p>

            {/* Botão Editar Perfil */}
            <button
              className="mt-4 px-4 py-2 bg-yellow-500 hover:bg-yellow-400 text-black font-semibold rounded transition w-max disabled:cursor-not-allowed disabled:opacity-60"
              onClick={() => setModalEditarOpen(true)}
              disabled={isPendingApproval}
            >
              {isPendingApproval ? "Cadastro em aprovacao" : "Editar Perfil"}
            </button>
          </div>
        </div>
        {/* Cartão à direita: Mensalista Premium OU Solicitar Mensalista */}
        <div className="w-full md:w-auto flex-shrink-0 flex justify-center">
          {isPendingApproval ? (
            <div className="w-[340px] h-[160px] flex flex-col items-center justify-center bg-yellow-900/40 border-4 border-yellow-500/60 rounded-2xl shadow-md text-center text-yellow-100 font-semibold text-lg">
              Cadastro em analise.
              <br />
              <span className="text-sm font-normal text-yellow-200">
                Aguarde a aprovacao para liberar as acoes do perfil.
              </span>
            </div>
          ) : usuario.mensalista ? (
            <CartaoMensalistaPremium
              nome={usuario.nome}
              logoRacha="/images/logos/logo_fut7pro.png"
              ativo={usuario.mensalista}
            />
          ) : !pedidoEnviado ? (
            <CardSolicitarMensalista
              onConfirm={() => {
                setPedidoEnviado(true);
              }}
            />
          ) : (
            <div className="w-[340px] h-[160px] flex flex-col items-center justify-center bg-green-900/80 border-4 border-green-500 rounded-2xl shadow-md text-center text-green-200 font-semibold text-lg">
              Pedido enviado! Aguarde a análise do administrador.
              <br />
              <span className="text-sm font-normal text-green-300">
                Você será avisado assim que houver uma vaga disponível.
              </span>
            </div>
          )}
        </div>
      </div>

      {/* MODAL EDIÇÃO DE PERFIL */}
      {modalEditarOpen && <ModalEditarPerfil onClose={() => setModalEditarOpen(false)} />}

      {/* Filtro de estatísticas */}
      <div className="flex gap-4 mt-8 mb-2 items-center">
        <span className="font-semibold text-yellow-400">Estatísticas:</span>
        <button
          className={`px-3 py-1 rounded font-semibold border transition ${
            filtroStats === "temporada"
              ? "bg-yellow-400 text-black border-yellow-400"
              : "bg-zinc-900 text-yellow-300 border-yellow-400"
          }`}
          onClick={() => setFiltroStats("temporada")}
        >
          Temporada atual
        </button>
        <button
          className={`px-3 py-1 rounded font-semibold border transition ${
            filtroStats === "historico"
              ? "bg-yellow-400 text-black border-yellow-400"
              : "bg-zinc-900 text-yellow-300 border-yellow-400"
          }`}
          onClick={() => setFiltroStats("historico")}
        >
          Todas as Temporadas
        </button>
      </div>

      {/* Estatísticas */}
      <section>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-4">
          {[
            { label: "Jogos", valor: stats.jogos ?? "-" },
            { label: "Gols", valor: stats.gols ?? "-" },
            { label: "Assistências", valor: stats.assistencias ?? "-" },
            { label: "Campeão do Dia", valor: stats.campeaoDia ?? "-" },
            {
              label: "Média Vitórias",
              valor: typeof stats.mediaVitorias === "number" ? stats.mediaVitorias.toFixed(2) : "-",
            },
            { label: "Pontuação", valor: stats.pontuacao ?? "-" },
          ].map((item) => (
            <div key={item.label} className="bg-zinc-800 p-4 rounded text-center shadow-md">
              <p className="text-xl font-bold text-yellow-400">{item.valor}</p>
              <p className="text-sm text-zinc-400 mt-1">{item.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Conquistas */}
      <section className="mt-12">
        <ConquistasDoAtleta
          slug={usuario.slug}
          titulosGrandesTorneios={titulosGrandesTorneios}
          titulosAnuais={titulosAnuais}
          titulosQuadrimestrais={titulosQuadrimestrais}
        />
      </section>

      {/* Histórico */}
      {usuario.historico && usuario.historico.length > 0 && (
        <section className="mt-12">
          <HistoricoJogos historico={usuario.historico} />
          <div className="text-center mt-4">
            <span className="inline-block text-yellow-400 text-sm opacity-70 cursor-not-allowed">
              Ver histórico completo (apenas admin)
            </span>
          </div>
        </section>
      )}
    </div>
  );
}
