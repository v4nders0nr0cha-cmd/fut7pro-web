"use client";

import Link from "next/link";
import Image from "next/image";
import type { TituloAtleta } from "@/types/estatisticas";
import { usePublicLinks } from "@/hooks/usePublicLinks";

const ICON_PATHS = {
  "trofeu-de-ouro": "/images/icons/trofeu-de-ouro.png",
  "trofeu-de-prata": "/images/icons/trofeu-de-prata.png",
  "bola-de-ouro": "/images/icons/bola-de-ouro.png",
  "bola-de-prata": "/images/icons/bola-de-prata.png",
  "chuteira-de-ouro": "/images/icons/chuteira-de-ouro.png",
  "chuteira-de-prata": "/images/icons/chuteira-de-prata.png",
  "luva-de-ouro": "/images/icons/luva-de-ouro.png",
  "luva-de-prata": "/images/icons/luva-de-prata.png",
  "atacante-do-ano": "/images/icons/atacante-do-ano.png",
  "atacante-do-quadrimestre": "/images/icons/atacante-do-quadrimestre.png",
  "meia-do-ano": "/images/icons/meia-do-ano.png",
  "meia-do-quadrimestre": "/images/icons/meia-do-quadrimestre.png",
  "zagueiro-do-ano": "/images/icons/zagueiro-do-ano.png",
  "zagueiro-do-quadrimestre": "/images/icons/zagueiro-do-quadrimestre.png",
  "goleiro-do-ano": "/images/icons/luva-de-ouro.png",
  "goleiro-do-quadrimestre": "/images/icons/luva-de-prata.png",
} as const;

const ICON_ALIASES: Record<string, keyof typeof ICON_PATHS> = {
  "trofeu-ouro": "trofeu-de-ouro",
  "trofeu-prata": "trofeu-de-prata",
  "trophy-gold": "trofeu-de-ouro",
  "trophy-silver": "trofeu-de-prata",
  "bola-ouro": "bola-de-ouro",
  "bola-prata": "bola-de-prata",
  "ball-gold": "bola-de-ouro",
  "ball-silver": "bola-de-prata",
  "chuteira-ouro": "chuteira-de-ouro",
  "chuteira-prata": "chuteira-de-prata",
  "boot-gold": "chuteira-de-ouro",
  "boot-silver": "chuteira-de-prata",
  "luva-ouro": "luva-de-ouro",
  "luva-prata": "luva-de-prata",
  "glove-gold": "luva-de-ouro",
  "glove-silver": "luva-de-prata",
  "goleiro-do-ano": "goleiro-do-ano",
  "goleiro-do-quadrimestre": "goleiro-do-quadrimestre",
};

type ConquistaCategoria = "grandes" | "anual" | "quadrimestral";

interface Props {
  slug: string;
  titulosGrandesTorneios: TituloAtleta[];
  titulosAnuais: TituloAtleta[];
  titulosQuadrimestrais: TituloAtleta[];
}

export default function ConquistasDoAtleta({
  slug,
  titulosGrandesTorneios,
  titulosAnuais,
  titulosQuadrimestrais,
}: Props) {
  const { publicHref } = usePublicLinks();

  const todasConquistas = [...titulosGrandesTorneios, ...titulosAnuais, ...titulosQuadrimestrais];

  const LIMITE_TITULOS = 24;
  const passouDoLimite = todasConquistas.length > LIMITE_TITULOS;

  function distribuiEmLinhas(arr: TituloAtleta[], colunas = 4): TituloAtleta[][] {
    const linhas: TituloAtleta[][] = [];
    for (let i = 0; i < arr.length; i += colunas) {
      linhas.push(arr.slice(i, i + colunas));
    }
    return linhas;
  }

  function renderBloco(
    titulo: string,
    conquistas: TituloAtleta[],
    sliceMax = 8,
    categoria: ConquistaCategoria
  ) {
    if (conquistas.length === 0) return null;
    const grupos = distribuiEmLinhas(conquistas.slice(0, sliceMax), 4);

    return (
      <div className="mb-4">
        <h3 className="text-lg text-brand-soft font-semibold mb-1">{titulo}</h3>
        <div className="flex flex-col gap-1">
          {grupos.map((linha, idx) => (
            <div key={idx} className="flex flex-wrap gap-2 mb-1">
              {linha.map((tituloItem, i) => {
                const iconValue = resolveIconValue(
                  tituloItem.icone,
                  tituloItem.descricao,
                  categoria
                );
                return (
                  <span
                    key={i}
                    className="bg-[#222] rounded-xl px-3 py-1 text-sm flex items-center gap-1 text-brand-soft"
                    title={`${tituloItem.descricao} - ${tituloItem.ano}`}
                    aria-label={`${tituloItem.descricao} ${tituloItem.ano}`}
                  >
                    <span className="inline-flex items-center">
                      {isImageIcon(iconValue) ? (
                        <Image
                          src={iconValue}
                          alt={`Icone ${tituloItem.descricao}`}
                          width={18}
                          height={18}
                          className="inline-block"
                        />
                      ) : (
                        <span>{iconValue}</span>
                      )}
                    </span>
                    <span>
                      {tituloItem.descricao}{" "}
                      <span className="text-xs text-gray-400">{tituloItem.ano}</span>
                    </span>
                  </span>
                );
              })}
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <section className="w-full max-w-4xl mx-auto mb-6">
      <h2 className="text-2xl text-brand font-bold flex items-center gap-2 mb-2 justify-center text-center">
        <Image src={ICON_PATHS["trofeu-de-ouro"]} alt="Icone conquistas" width={22} height={22} />
        Minhas Conquistas
      </h2>

      {renderBloco("Titulos (Grandes Torneios)", titulosGrandesTorneios, 8, "grandes")}
      {renderBloco("Titulos Anuais", titulosAnuais, 8, "anual")}
      {renderBloco("Titulos Quadrimestrais", titulosQuadrimestrais, 8, "quadrimestral")}

      {passouDoLimite && (
        <div className="mt-2 text-center">
          <Link
            href={publicHref(`/atletas/${slug}/conquistas`)}
            className="text-brand hover:underline font-semibold"
          >
            Ver todas as conquistas &rarr;
          </Link>
        </div>
      )}
    </section>
  );
}

function resolveIconValue(
  value: string | null | undefined,
  descricao: string,
  categoria: ConquistaCategoria
): string {
  const raw = typeof value === "string" ? value.trim() : "";
  if (raw && isImageIcon(raw)) return raw;

  const normalized = normalizeToken(raw);
  const normalizedDesc = normalizeToken(descricao);
  const aliased = ICON_ALIASES[normalized] ?? normalized;
  const mapped = ICON_PATHS[aliased as keyof typeof ICON_PATHS];
  if (mapped) return mapped;

  const derived = resolveIconByText(
    [normalized, normalizedDesc].filter(Boolean).join(" "),
    categoria
  );
  if (derived) return derived;

  if (raw) return raw;
  return categoria === "quadrimestral"
    ? ICON_PATHS["trofeu-de-prata"]
    : ICON_PATHS["trofeu-de-ouro"];
}

function resolveIconByText(text: string, categoria: ConquistaCategoria): string | null {
  if (!text) return null;
  const metal = categoria === "quadrimestral" ? "prata" : "ouro";

  if (
    text.includes("artilheiro") ||
    text.includes("bola") ||
    text.includes("ball") ||
    text.includes("gol")
  ) {
    return resolveMetalIcon("bola", metal);
  }
  if (
    text.includes("maestro") ||
    text.includes("assist") ||
    text.includes("passe") ||
    text.includes("boot")
  ) {
    return resolveMetalIcon("chuteira", metal);
  }
  if (
    text.includes("goleiro") ||
    text.includes("luva") ||
    text.includes("goalkeep") ||
    text.includes("goalie") ||
    text.includes("gk") ||
    text.includes("glove")
  ) {
    return resolveMetalIcon("luva", metal);
  }
  if (text.includes("atacante") || text.includes("ata")) {
    return categoria === "quadrimestral"
      ? ICON_PATHS["atacante-do-quadrimestre"]
      : ICON_PATHS["atacante-do-ano"];
  }
  if (text.includes("meia") || text.includes("mei")) {
    return categoria === "quadrimestral"
      ? ICON_PATHS["meia-do-quadrimestre"]
      : ICON_PATHS["meia-do-ano"];
  }
  if (text.includes("zagueiro") || text.includes("zag")) {
    return categoria === "quadrimestral"
      ? ICON_PATHS["zagueiro-do-quadrimestre"]
      : ICON_PATHS["zagueiro-do-ano"];
  }
  if (
    text.includes("campeao") ||
    text.includes("melhor") ||
    text.includes("trofeu") ||
    text.includes("trophy") ||
    text.includes("medal")
  ) {
    return resolveMetalIcon("trofeu", metal);
  }
  return null;
}

function resolveMetalIcon(base: "trofeu" | "bola" | "chuteira" | "luva", metal: "ouro" | "prata") {
  const key = `${base}-de-${metal}` as keyof typeof ICON_PATHS;
  return ICON_PATHS[key];
}

function normalizeToken(value: string) {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/\.png$/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function isImageIcon(value: string) {
  return value.startsWith("/") || value.startsWith("http://") || value.startsWith("https://");
}
