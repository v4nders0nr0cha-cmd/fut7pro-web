"use client";

import Head from "next/head";
import Image from "next/image";
import { useCallback, useEffect, useMemo, useRef, useState, type ChangeEvent } from "react";
import { useSession } from "next-auth/react";
import AvatarCropModal from "@/components/admin/AvatarCropModal";
import ConquistasDoAtleta from "@/components/atletas/ConquistasDoAtleta";
import HistoricoJogos from "@/components/atletas/HistoricoJogos";
import { useNotification } from "@/context/NotificationContext";
import {
  atualizarPerfilAdministrador,
  obterConquistasAdministrador,
  obterEstatisticasAdministrador,
  obterHistoricoAdministrador,
  obterPerfilAdministrador,
  fallbackConquistas,
  fallbackEstatisticas,
  fallbackHistorico,
} from "@/lib/api/atletas";
import type { Atleta, EstatisticasSimples, JogoAtleta, PosicaoAtleta } from "@/types/atletas";
import type { ConquistasAtleta } from "@/types/estatisticas";

const AVATAR_FALLBACK = "/images/Perfil-sem-Foto-Fut7.png";
const CURRENT_YEAR = new Date().getFullYear();
const POSICOES: PosicaoAtleta[] = ["Goleiro", "Zagueiro", "Meia", "Atacante"];
const FOTO_INPUT_ID = "admin-perfil-foto-upload";

const ESTATISTICAS_INICIAIS = {
  temporadaAtual: { ...fallbackEstatisticas },
  historico: { ...fallbackEstatisticas },
};

const FALLBACK_ATLETA: Atleta = {
  id: "",
  nome: "Presidente Fut7Pro",
  apelido: "",
  slug: "",
  foto: AVATAR_FALLBACK,
  posicao: "Atacante",
  status: "Ativo",
  mensalista: true,
  ultimaPartida: undefined,
  totalJogos: 0,
  estatisticas: {
    historico: { ...fallbackEstatisticas },
    anual: {},
  },
  historico: [...fallbackHistorico],
  conquistas: { ...fallbackConquistas } as ConquistasAtleta,
  icones: [],
};

function cloneEstatisticas(value?: EstatisticasSimples) {
  if (!value) return { ...fallbackEstatisticas };
  return { ...value };
}

function sanitizeFileBaseName(value?: string | null): string {
  if (!value) return "avatar";
  const base = value.replace(/\.[^/.]+$/, "");
  const normalized = base
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9-_]/gi, "")
    .toLowerCase()
    .trim();
  if (!normalized) return "avatar";
  return normalized.slice(0, 40);
}

function dataUrlToFile(dataUrl: string, originalName?: string | null): File | null {
  const [header, body] = dataUrl.split(",");
  if (!header || !body) return null;
  const mimeMatch = header.match(/data:(.*?);/);
  const mime = mimeMatch?.[1] ?? "image/jpeg";
  const binaryString = atob(body);
  const len = binaryString.length;
  const buffer = new Uint8Array(len);
  for (let i = 0; i < len; i += 1) {
    buffer[i] = binaryString.charCodeAt(i);
  }
  const extensionRaw = mime.split("/")[1] ?? "jpeg";
  const extension = extensionRaw === "jpeg" ? "jpg" : extensionRaw;
  const fileName = `${sanitizeFileBaseName(originalName)}.${extension}`;
  try {
    return new File([buffer], fileName, { type: mime });
  } catch (error) {
    console.error("dataUrlToFile failed", error);
    return null;
  }
}

export default function PerfilAdministradorPage() {
  const { data: session, update } = useSession();
  const { notify } = useNotification();

  const [perfil, setPerfil] = useState<Atleta>(FALLBACK_ATLETA);
  const [estatisticas, setEstatisticas] = useState(ESTATISTICAS_INICIAIS);
  const [conquistas, setConquistas] = useState<ConquistasAtleta>(fallbackConquistas);
  const [historico, setHistorico] = useState<JogoAtleta[]>(fallbackHistorico);

  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const [nome, setNome] = useState("");
  const [apelido, setApelido] = useState("");
  const [posicao, setPosicao] = useState<PosicaoAtleta | "">("");

  const [fotoPreview, setFotoPreview] = useState(AVATAR_FALLBACK);
  const [fotoFile, setFotoFile] = useState<File | null>(null);
  const [removerFoto, setRemoverFoto] = useState(false);

  const [filtroEstatistica, setFiltroEstatistica] = useState<"temporada" | "historico">(
    "temporada"
  );
  const [isCropModalOpen, setIsCropModalOpen] = useState(false);
  const [cropImageSrc, setCropImageSrc] = useState<string | null>(null);
  const [pendingFileName, setPendingFileName] = useState<string | null>(null);

  const previewUrlRef = useRef<string | null>(null);

  const resetPreview = useCallback((src?: string) => {
    if (previewUrlRef.current) {
      URL.revokeObjectURL(previewUrlRef.current);
      previewUrlRef.current = null;
    }
    setFotoPreview(src && src.trim().length > 0 ? src : AVATAR_FALLBACK);
  }, []);

  const aplicarPerfil = useCallback(
    (dados: Atleta) => {
      setPerfil(dados);
      setNome(dados.nome ?? "");
      setApelido(dados.apelido ?? "");
      setPosicao(dados.posicao ?? "");
      setRemoverFoto(false);
      setFotoFile(null);
      resetPreview(dados.foto);
    },
    [resetPreview]
  );

  const carregarDados = useCallback(async () => {
    setIsLoading(true);
    setLoadError(null);

    try {
      const [perfilRaw, estatisticasRaw, conquistasRaw, historicoRaw] = await Promise.all([
        obterPerfilAdministrador(),
        obterEstatisticasAdministrador({ temporada: CURRENT_YEAR }),
        obterConquistasAdministrador(),
        obterHistoricoAdministrador(),
      ]);

      const estatisticasFormatadas = {
        temporadaAtual: {
          ...fallbackEstatisticas,
          ...cloneEstatisticas(estatisticasRaw?.temporadaAtual),
        },
        historico: {
          ...fallbackEstatisticas,
          ...cloneEstatisticas(estatisticasRaw?.historico),
        },
      };

      const conquistasFormatadas = conquistasRaw ?? { ...fallbackConquistas };
      const historicoFormatado = historicoRaw ?? [...fallbackHistorico];
      const perfilBase = perfilRaw ?? FALLBACK_ATLETA;

      const estatisticasAnuais = {
        ...(perfilBase.estatisticas?.anual ?? {}),
        ...(estatisticasFormatadas.temporadaAtual
          ? { [CURRENT_YEAR]: estatisticasFormatadas.temporadaAtual }
          : {}),
      };

      const perfilComDefaults: Atleta = {
        ...FALLBACK_ATLETA,
        ...perfilBase,
        foto: perfilBase.foto ?? FALLBACK_ATLETA.foto,
        estatisticas: {
          historico: estatisticasFormatadas.historico,
          anual: estatisticasAnuais,
        },
        conquistas: conquistasFormatadas,
        historico: historicoFormatado,
      };

      aplicarPerfil(perfilComDefaults);
      setEstatisticas(estatisticasFormatadas);
      setConquistas(conquistasFormatadas);
      setHistorico(historicoFormatado);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Não foi possível carregar seu perfil agora.";
      setLoadError(message);
    } finally {
      setIsLoading(false);
    }
  }, [aplicarPerfil]);

  useEffect(() => {
    carregarDados();
    return () => {
      if (previewUrlRef.current) {
        URL.revokeObjectURL(previewUrlRef.current);
        previewUrlRef.current = null;
      }
    };
  }, [carregarDados]);

  const handleArquivoChange = (event: ChangeEvent<HTMLInputElement>) => {
    if (!isEditing) return;
    const file = event.target.files?.[0];
    if (!file) return;
    event.target.value = "";

    if (!file.type.startsWith("image/")) {
      notify({ type: "error", message: "Selecione um arquivo de imagem válido." });
      return;
    }

    const reader = new FileReader();
    reader.onload = (loadEvent) => {
      const result = loadEvent.target?.result;
      if (typeof result !== "string") {
        notify({ type: "error", message: "Não foi possível carregar a imagem selecionada." });
        return;
      }
      if (previewUrlRef.current) {
        URL.revokeObjectURL(previewUrlRef.current);
        previewUrlRef.current = null;
      }
      setCropImageSrc(result);
      setPendingFileName(file.name);
      setIsCropModalOpen(true);
    };
    reader.onerror = () => {
      notify({ type: "error", message: "Não foi possível carregar a imagem selecionada." });
    };
    reader.readAsDataURL(file);
  };

  const handleRemoverFoto = () => {
    if (!isEditing) return;
    if (previewUrlRef.current) {
      URL.revokeObjectURL(previewUrlRef.current);
      previewUrlRef.current = null;
    }
    setFotoFile(null);
    setRemoverFoto(true);
    setFotoPreview(AVATAR_FALLBACK);
    setCropImageSrc(null);
    setPendingFileName(null);
    setIsCropModalOpen(false);
  };

  const fecharCropModal = useCallback(() => {
    setIsCropModalOpen(false);
    setCropImageSrc(null);
    setPendingFileName(null);
  }, []);

  const handleCropConfirm = useCallback(
    (dataUrl: string) => {
      const file = dataUrlToFile(dataUrl, pendingFileName);
      if (!file) {
        notify({ type: "error", message: "Não foi possível processar a imagem recortada." });
        return;
      }
      setFotoFile(file);
      setRemoverFoto(false);
      resetPreview(dataUrl);
      fecharCropModal();
    },
    [fecharCropModal, pendingFileName, notify, resetPreview]
  );

  const iniciarEdicao = () => {
    setIsEditing(true);
    setRemoverFoto(false);
    setFotoFile(null);
    resetPreview(perfil.foto);
  };

  const cancelarEdicao = () => {
    setIsEditing(false);
    setNome(perfil.nome ?? "");
    setApelido(perfil.apelido ?? "");
    setPosicao(perfil.posicao ?? "");
    setFotoFile(null);
    setRemoverFoto(false);
    fecharCropModal();
    resetPreview(perfil.foto);
  };

  const salvarAlteracoes = async () => {
    if (!isEditing || isSaving) return;

    const nomeTrim = nome.trim();
    const apelidoTrim = apelido.trim();

    if (!nomeTrim) {
      notify({ type: "error", message: "Informe um nome para o presidente." });
      return;
    }

    const formData = new FormData();
    formData.set("nome", nomeTrim);
    formData.set("apelido", apelidoTrim);
    formData.set("posicao", posicao ? posicao : "");
    if (fotoFile) {
      try {
        const up = new FormData();
        up.set("kind", "avatar");
        up.set("slug", perfil.slug || "fut7pro");
        if ((session?.user as any)?.id) up.set("userId", String((session?.user as any).id));
        up.set("file", fotoFile);
        const resp = await fetch("/api/upload", { method: "POST", body: up });
        const json = await resp.json();
        if (resp.ok && json?.url) {
          formData.set("fotoUrl", json.url as string);
        } else {
          throw new Error(json?.error || "Falha no upload da foto");
        }
      } catch (e) {
        notify({ type: "error", message: "Falha ao enviar a foto do perfil." });
      }
    } else if (removerFoto) {
      formData.set("removerFoto", "true");
    }

    setIsSaving(true);
    try {
      const atualizado = await atualizarPerfilAdministrador(formData);

      if (atualizado) {
        const perfilMesclado: Atleta = {
          ...perfil,
          ...atualizado,
          nome: atualizado.nome ?? nomeTrim,
          apelido: atualizado.apelido ?? apelidoTrim,
          posicao: (atualizado.posicao as PosicaoAtleta | undefined) ?? (posicao || perfil.posicao),
          foto:
            atualizado.foto ?? (removerFoto ? AVATAR_FALLBACK : (perfil.foto ?? AVATAR_FALLBACK)),
          conquistas,
          historico,
          estatisticas: perfil.estatisticas,
        };
        aplicarPerfil(perfilMesclado);
      } else {
        await carregarDados();
      }

      setIsEditing(false);
      notify({ type: "success", message: "Perfil atualizado com sucesso!" });
      if (typeof update === "function") {
        await update();
      }
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Não foi possível salvar as alterações.";
      notify({ type: "error", message });
    } finally {
      setIsSaving(false);
    }
  };

  const estatisticasSelecionadas = useMemo(
    () =>
      filtroEstatistica === "temporada" ? estatisticas.temporadaAtual : estatisticas.historico,
    [estatisticas, filtroEstatistica]
  );

  const estatisticasCards = useMemo(
    () =>
      [
        { label: "Jogos", valor: estatisticasSelecionadas.jogos },
        { label: "Gols", valor: estatisticasSelecionadas.gols },
        { label: "Assistências", valor: estatisticasSelecionadas.assistencias },
        { label: "Campeão do Dia", valor: estatisticasSelecionadas.campeaoDia },
        {
          label: "Média de Vitórias",
          valor:
            typeof estatisticasSelecionadas.mediaVitorias === "number"
              ? estatisticasSelecionadas.mediaVitorias.toFixed(2)
              : "-",
        },
        { label: "Pontuação", valor: estatisticasSelecionadas.pontuacao },
      ].map((item) => ({
        ...item,
        valor:
          item.valor === null || item.valor === undefined || item.valor === "" ? "-" : item.valor,
      })),
    [estatisticasSelecionadas]
  );

  const nomeExibicao = perfil.nome || session?.user?.name || "Presidente Fut7Pro";

  if (isLoading) {
    return (
      <section className="max-w-5xl mx-auto px-4">
        <div className="flex flex-col items-center gap-3 text-neutral-300 py-10">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-yellow-400" />
          <span>Carregando perfil…</span>
        </div>
      </section>
    );
  }

  return (
    <>
      <Head>
        <title>Perfil do Presidente | Fut7Pro Admin</title>
        <meta
          name="description"
          content="Gerencie o perfil do presidente do racha e suas estatísticas."
        />
        <meta name="robots" content="noindex,nofollow" />
      </Head>

      <section className="max-w-6xl mx-auto px-4">
        <h1 className="text-2xl font-bold text-yellow-400 mb-2 flex items-center gap-2">
          <span role="img" aria-label="coroa">
            👑
          </span>
          Perfil do Presidente
        </h1>
        <p className="text-sm text-zinc-300 mb-6">
          Sua conta de administrador também representa o primeiro atleta do racha. Atualize os dados
          abaixo para manter o perfil dos atletas em dia.
        </p>

        {loadError && (
          <div className="mb-6 rounded-lg border border-red-500/40 bg-red-500/10 px-4 py-3 text-red-200">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <span>{loadError}</span>
              <button
                type="button"
                onClick={carregarDados}
                className="self-start rounded bg-red-500 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-white shadow hover:bg-red-400 transition"
              >
                Tentar novamente
              </button>
            </div>
          </div>
        )}

        <div className="bg-[#181818] border border-[#292929] rounded-xl shadow-lg p-6 flex flex-col md:flex-row gap-6">
          <div className="flex flex-col items-center md:items-start gap-3">
            <div className="relative">
              <Image
                src={fotoPreview}
                alt={`Avatar do presidente ${nomeExibicao}`}
                width={140}
                height={140}
                className="rounded-full border-4 border-yellow-500 object-cover shadow-lg"
                unoptimized
              />
            </div>
            <label
              htmlFor={FOTO_INPUT_ID}
              className={`text-sm font-semibold transition ${
                isEditing
                  ? "text-yellow-300 hover:text-yellow-200 cursor-pointer"
                  : "text-zinc-500 cursor-not-allowed"
              }`}
            >
              Trocar foto do perfil
            </label>
            <input
              id={FOTO_INPUT_ID}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleArquivoChange}
              disabled={!isEditing}
            />
            {isEditing && (
              <button
                type="button"
                onClick={handleRemoverFoto}
                className="text-xs uppercase tracking-wide font-semibold text-red-300 hover:text-red-200 transition"
              >
                Remover foto
              </button>
            )}
          </div>

          <div className="flex-1 w-full">
            <div className="flex flex-col gap-4 md:flex-row md:items-start">
              <div className="flex-1 space-y-4">
                {isEditing ? (
                  <div className="grid gap-4 md:grid-cols-2">
                    <label className="flex flex-col gap-1 text-sm">
                      <span className="font-semibold text-zinc-200">Nome</span>
                      <input
                        value={nome}
                        onChange={(event) => setNome(event.target.value)}
                        maxLength={60}
                        className="rounded border border-yellow-500/40 bg-[#1f1f1f] px-3 py-2 text-white focus:border-yellow-400 focus:outline-none"
                        placeholder="Nome do presidente"
                      />
                    </label>
                    <label className="flex flex-col gap-1 text-sm">
                      <span className="font-semibold text-zinc-200">Apelido</span>
                      <input
                        value={apelido}
                        onChange={(event) => setApelido(event.target.value)}
                        maxLength={30}
                        className="rounded border border-yellow-500/40 bg-[#1f1f1f] px-3 py-2 text-white focus:border-yellow-400 focus:outline-none"
                        placeholder="Como aparece no racha"
                      />
                    </label>
                    <label className="flex flex-col gap-1 text-sm md:col-span-2 md:max-w-xs">
                      <span className="font-semibold text-zinc-200">Posição</span>
                      <select
                        value={posicao}
                        onChange={(event) => setPosicao(event.target.value as PosicaoAtleta | "")}
                        className="rounded border border-yellow-500/40 bg-[#1f1f1f] px-3 py-2 text-white focus:border-yellow-400 focus:outline-none"
                      >
                        <option value="">Selecionar posição</option>
                        {POSICOES.map((opcao) => (
                          <option key={opcao} value={opcao}>
                            {opcao}
                          </option>
                        ))}
                      </select>
                    </label>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <h2 className="text-2xl font-semibold text-white">{perfil.nome}</h2>
                    <div className="flex flex-wrap items-center gap-3 text-sm text-zinc-300">
                      <span className="inline-flex items-center gap-2 rounded-full border border-yellow-500/40 bg-yellow-500/10 px-3 py-1 text-yellow-300 font-semibold">
                        <span role="img" aria-label="coroa pequena">
                          👑
                        </span>
                        Presidente do Racha
                      </span>
                      {perfil.apelido && (
                        <span className="bg-[#1f1f1f] px-3 py-1 rounded-full border border-[#333]">
                          Apelido: {perfil.apelido}
                        </span>
                      )}
                      <span className="bg-[#1f1f1f] px-3 py-1 rounded-full border border-[#333]">
                        Posição: {perfil.posicao || "Não informada"}
                      </span>
                    </div>
                    <p className="text-sm text-zinc-400">
                      Status: {perfil.status || "Ativo"} • Total de jogos: {perfil.totalJogos}
                    </p>
                    <p className="text-sm text-zinc-400">
                      E-mail: {session?.user?.email ?? "Não informado"}
                    </p>
                  </div>
                )}
              </div>

              <div className="flex w-full max-w-[220px] flex-col gap-2">
                {isEditing ? (
                  <>
                    <button
                      type="button"
                      onClick={salvarAlteracoes}
                      disabled={isSaving}
                      className="rounded bg-yellow-400 px-4 py-2 font-bold text-black transition hover:bg-yellow-300 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      {isSaving ? "Salvando..." : "Salvar alterações"}
                    </button>
                    <button
                      type="button"
                      onClick={cancelarEdicao}
                      disabled={isSaving}
                      className="rounded border border-[#333] bg-[#1f1f1f] px-4 py-2 font-semibold text-white transition hover:bg-[#2a2a2a] disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      Cancelar
                    </button>
                  </>
                ) : (
                  <button
                    type="button"
                    onClick={iniciarEdicao}
                    className="rounded bg-yellow-400 px-4 py-2 font-bold text-black transition hover:bg-yellow-300"
                  >
                    Editar perfil
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>

        <section className="mt-10">
          <div className="flex flex-wrap items-center gap-4">
            <span className="font-semibold text-yellow-400">Estatísticas:</span>
            <button
              type="button"
              onClick={() => setFiltroEstatistica("temporada")}
              className={`rounded px-3 py-1 font-semibold border transition ${
                filtroEstatistica === "temporada"
                  ? "bg-yellow-400 text-black border-yellow-400"
                  : "bg-[#1f1f1f] text-yellow-300 border-yellow-500/40 hover:border-yellow-400"
              }`}
            >
              Temporada atual
            </button>
            <button
              type="button"
              onClick={() => setFiltroEstatistica("historico")}
              className={`rounded px-3 py-1 font-semibold border transition ${
                filtroEstatistica === "historico"
                  ? "bg-yellow-400 text-black border-yellow-400"
                  : "bg-[#1f1f1f] text-yellow-300 border-yellow-500/40 hover:border-yellow-400"
              }`}
            >
              Todas as temporadas
            </button>
          </div>

          <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-6">
            {estatisticasCards.map((item) => (
              <div
                key={item.label}
                className="rounded-lg border border-[#2d2d2d] bg-[#1c1c1c] p-4 text-center shadow-md"
              >
                <p className="text-2xl font-bold text-yellow-400">{item.valor}</p>
                <p className="text-xs text-zinc-400 mt-1 uppercase tracking-wide">{item.label}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="mt-12">
          <ConquistasDoAtleta
            slug={perfil.slug}
            titulosGrandesTorneios={conquistas.titulosGrandesTorneios}
            titulosAnuais={conquistas.titulosAnuais}
            titulosQuadrimestrais={conquistas.titulosQuadrimestrais}
          />
        </section>

        <section className="mt-12 mb-8">
          {historico.length > 0 ? (
            <HistoricoJogos historico={historico} />
          ) : (
            <div className="rounded-lg border border-[#292929] bg-[#181818] px-6 py-10 text-center text-zinc-400">
              Nenhum jogo registrado ainda para o presidente. Assim que você participar dos
              rachinhas, o histórico aparecerá aqui.
            </div>
          )}
        </section>
      </section>

      <AvatarCropModal
        open={isCropModalOpen}
        imageSrc={cropImageSrc}
        onClose={fecharCropModal}
        onConfirm={handleCropConfirm}
      />
    </>
  );
}

