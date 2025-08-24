"use client";

import Image from "next/image";
import { useState } from "react";
import ConquistasDoAtleta from "@/components/atletas/ConquistasDoAtleta";
import HistoricoJogos from "@/components/atletas/HistoricoJogos";
import ModalEditarPerfil from "@/components/atletas/ModalEditarPerfil";
import { usePerfil } from "@/components/atletas/PerfilContext";

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
      className={`relative flex h-[160px] w-[340px] overflow-hidden rounded-2xl border-4 bg-[url('/images/bg-campo-fut7.jpg')] bg-cover bg-center shadow-2xl transition ${ativo ? "cursor-pointer border-green-400 shadow-green-400/50 hover:brightness-110" : "border-gray-400 shadow-gray-700/30"} `}
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
      <div className="flex flex-1 flex-col justify-between py-4 pl-5">
        <div>
          <div className="text-base font-extrabold tracking-wide text-green-400 drop-shadow-sm">
            MENSALISTA
          </div>
        </div>
      </div>
      {/* Lado direito */}
      <div className="flex w-[140px] flex-col items-center justify-between py-3 pr-5">
        <div className="mb-1 mt-1 text-xs font-semibold text-green-400">
          Ativo no mês
        </div>
        <Image
          src={logoRacha}
          alt="Logo do Racha"
          width={54}
          height={54}
          className="mb-1 rounded-lg border border-white"
          draggable={false}
        />
        <div
          className="mt-2 text-center text-sm font-bold text-white"
          style={{
            textShadow: "0px 2px 8px #000, 0px 1px 0px #222, 0px 0px 2px #000",
          }}
        >
          {nome}
        </div>
      </div>
      {/* Tooltip - canto inferior esquerdo */}
      {ativo && !exportando && (
        <div className="pointer-events-none absolute bottom-2 left-2 select-none rounded bg-black/70 px-2 py-1 text-[10px] text-green-300">
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
        className="relative flex h-[160px] w-[340px] cursor-pointer flex-col items-center justify-center overflow-hidden rounded-2xl border-4 border-yellow-400 bg-gradient-to-br from-yellow-200/60 via-yellow-100/80 to-yellow-300/50 shadow-2xl transition hover:scale-105"
        onClick={() => setModalOpen(true)}
        title="Quero ser Mensalista"
        tabIndex={0}
      >
        <div className="pointer-events-none absolute inset-0 rounded-2xl border-4 border-yellow-400 opacity-60 shadow-yellow-300"></div>
        <div className="z-10 flex h-full w-full flex-col items-center justify-center px-6 py-3">
          <div className="mb-2 text-center text-lg font-extrabold text-yellow-700 drop-shadow-sm">
            Torne-se um Mensalista!
          </div>
          <div className="text-center text-[15px] font-medium leading-snug text-yellow-800">
            Garanta sua vaga como mensalista
            <br />
            e aproveite sua vaga garantida
            <br />
            no racha, e benefícios exclusivos.
            <br />
            <span className="mt-2 block font-bold">
              Clique aqui para solicitar!
            </span>
          </div>
        </div>
      </div>
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
          <div className="flex w-full max-w-sm flex-col items-center rounded-xl border border-yellow-600 bg-zinc-900 p-8 shadow-xl">
            <div className="mb-2 text-center text-lg font-semibold text-yellow-400">
              Solicitar vaga de Mensalista
            </div>
            <div className="mb-6 text-center text-sm text-zinc-100">
              Ao confirmar, seu pedido para se tornar mensalista será enviado ao
              administrador.
              <br />
              <span className="text-yellow-200">
                Caso todas as vagas já estejam ocupadas, você entrará
                automaticamente em uma lista de espera por ordem de solicitação.
              </span>
              <br />
              Deseja realmente enviar este pedido?
            </div>
            <div className="mt-2 flex gap-4">
              <button
                className="rounded bg-yellow-500 px-5 py-2 font-semibold text-black transition hover:bg-yellow-400"
                onClick={() => {
                  setModalOpen(false);
                  onConfirm();
                }}
              >
                Confirmar
              </button>
              <button
                className="rounded bg-zinc-700 px-5 py-2 font-semibold text-white transition hover:bg-zinc-600"
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
  const { usuario } = usePerfil();
  const [filtroStats, setFiltroStats] = useState<"temporada" | "historico">(
    "temporada",
  );
  const [pedidoEnviado, setPedidoEnviado] = useState(false);
  const [modalEditarOpen, setModalEditarOpen] = useState(false);

  const stats =
    filtroStats === "temporada"
      ? (usuario.estatisticas.anual?.[temporadaAtual] ??
        usuario.estatisticas.historico)
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
    <div className="w-full p-6 text-white">
      <h1 className="sr-only">
        Meu Perfil – Estatísticas, Conquistas e Histórico | Fut7Pro
      </h1>
      <div className="flex flex-col items-center gap-6 md:flex-row md:items-start">
        {/* Dados do usuário logado */}
        <div className="flex flex-1 flex-col items-center gap-6 md:flex-row">
          <Image
            src={usuario.foto}
            alt={`Foto de ${usuario.nome}`}
            width={160}
            height={160}
            className="rounded-full border-4 border-yellow-400"
          />

          <div className="flex flex-col gap-1">
            <h2 className="mb-1 text-3xl font-bold">{usuario.nome}</h2>
            {usuario.apelido && (
              <p className="mb-1 text-yellow-300">Apelido: {usuario.apelido}</p>
            )}
            <p className="text-sm">Posição: {usuario.posicao}</p>
            <p
              className="text-sm text-zinc-300"
              title={`Último jogo: ${usuario.ultimaPartida ?? "Data não registrada"}`}
            >
              Status: {usuario.status}
            </p>
            <p className="mt-1 text-sm">
              {usuario.mensalista ? (
                <span className="font-semibold text-green-400">
                  💰 MENSALISTA ATIVO
                </span>
              ) : (
                <span className="text-zinc-400">NÃO É MENSALISTA</span>
              )}
            </p>
            <p className="mt-1 text-sm">
              🔁 Nível de Assiduidade: {nivelAssiduidade(usuario.totalJogos)}
            </p>

            {/* Botão Editar Perfil */}
            <button
              className="mt-4 w-max rounded bg-yellow-500 px-4 py-2 font-semibold text-black transition hover:bg-yellow-400"
              onClick={() => setModalEditarOpen(true)}
            >
              Editar Perfil
            </button>
          </div>
        </div>
        {/* Cartão à direita: Mensalista Premium OU Solicitar Mensalista */}
        <div className="flex w-full flex-shrink-0 justify-center md:w-auto">
          {usuario.mensalista ? (
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
            <div className="flex h-[160px] w-[340px] flex-col items-center justify-center rounded-2xl border-4 border-green-500 bg-green-900/80 text-center text-lg font-semibold text-green-200 shadow-md">
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
      {modalEditarOpen && (
        <ModalEditarPerfil onClose={() => setModalEditarOpen(false)} />
      )}

      {/* Filtro de estatísticas */}
      <div className="mb-2 mt-8 flex items-center gap-4">
        <span className="font-semibold text-yellow-400">Estatísticas:</span>
        <button
          className={`rounded border px-3 py-1 font-semibold transition ${
            filtroStats === "temporada"
              ? "border-yellow-400 bg-yellow-400 text-black"
              : "border-yellow-400 bg-zinc-900 text-yellow-300"
          }`}
          onClick={() => setFiltroStats("temporada")}
        >
          Temporada atual
        </button>
        <button
          className={`rounded border px-3 py-1 font-semibold transition ${
            filtroStats === "historico"
              ? "border-yellow-400 bg-yellow-400 text-black"
              : "border-yellow-400 bg-zinc-900 text-yellow-300"
          }`}
          onClick={() => setFiltroStats("historico")}
        >
          Todas as Temporadas
        </button>
      </div>

      {/* Estatísticas */}
      <section>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-6">
          {[
            { label: "Jogos", valor: stats.jogos ?? "-" },
            { label: "Gols", valor: stats.gols ?? "-" },
            { label: "Assistências", valor: stats.assistencias ?? "-" },
            { label: "Campeão do Dia", valor: stats.campeaoDia ?? "-" },
            {
              label: "Média Vitórias",
              valor:
                typeof stats.mediaVitorias === "number"
                  ? stats.mediaVitorias.toFixed(2)
                  : "-",
            },
            { label: "Pontuação", valor: stats.pontuacao ?? "-" },
          ].map((item) => (
            <div
              key={item.label}
              className="rounded bg-zinc-800 p-4 text-center shadow-md"
            >
              <p className="text-xl font-bold text-yellow-400">{item.valor}</p>
              <p className="mt-1 text-sm text-zinc-400">{item.label}</p>
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
          <div className="mt-4 text-center">
            <span className="inline-block cursor-not-allowed text-sm text-yellow-400 opacity-70">
              Ver histórico completo (apenas admin)
            </span>
          </div>
        </section>
      )}
    </div>
  );
}
