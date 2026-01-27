export type RachaThemeKey =
  | "dourado_branco"
  | "azul_royal"
  | "vermelho_rubi"
  | "verde_esmeralda"
  | "laranja_flame"
  | "roxo_galaxy";

export type RachaThemeTokens = {
  brand: string;
  brandSoft: string;
  brandStrong: string;
  brandRing: string;
};

export type RachaTheme = {
  key: RachaThemeKey;
  name: string;
  subtitle: string;
  swatches: string[];
  tokens: RachaThemeTokens;
};

export const DEFAULT_RACHA_THEME_KEY: RachaThemeKey = "dourado_branco";

export const RACHA_THEMES: RachaTheme[] = [
  {
    key: "dourado_branco",
    name: "Dourado & Branco",
    subtitle: "Dourado, branco e preto",
    swatches: ["#FFD600", "#FFFFFF", "#191C22"],
    tokens: {
      brand: "#FFD600",
      brandSoft: "#FFE88A",
      brandStrong: "#C9A300",
      brandRing: "#FFEC9D",
    },
  },
  {
    key: "azul_royal",
    name: "Azul Royal",
    subtitle: "Azul royal, azul claro e preto",
    swatches: ["#004D98", "#A5D8FF", "#191C22"],
    tokens: {
      brand: "#0A5FB5",
      brandSoft: "#7CC4FF",
      brandStrong: "#073F78",
      brandRing: "#9BD4FF",
    },
  },
  {
    key: "vermelho_rubi",
    name: "Vermelho Rubi",
    subtitle: "Vermelho rubi, dourado e preto",
    swatches: ["#C1121F", "#FFD600", "#191C22"],
    tokens: {
      brand: "#C1121F",
      brandSoft: "#F28B92",
      brandStrong: "#8B0D16",
      brandRing: "#F6A7AC",
    },
  },
  {
    key: "verde_esmeralda",
    name: "Verde Esmeralda",
    subtitle: "Verde esmeralda, verde claro e preto",
    swatches: ["#129E57", "#A9F5A9", "#191C22"],
    tokens: {
      brand: "#129E57",
      brandSoft: "#7FE3B1",
      brandStrong: "#0C6F3D",
      brandRing: "#9AF0C5",
    },
  },
  {
    key: "laranja_flame",
    name: "Laranja Flame",
    subtitle: "Laranja flame, dourado e preto",
    swatches: ["#FF8500", "#FFD600", "#191C22"],
    tokens: {
      brand: "#FF8500",
      brandSoft: "#FFC07A",
      brandStrong: "#C76600",
      brandRing: "#FFD0A3",
    },
  },
  {
    key: "roxo_galaxy",
    name: "Roxo Galaxy",
    subtitle: "Roxo profundo, lilas e preto",
    swatches: ["#6D28D9", "#C4B5FD", "#191C22"],
    tokens: {
      brand: "#C026D3",
      brandSoft: "#F5D0FE",
      brandStrong: "#A21CAF",
      brandRing: "#E879F9",
    },
  },
];

export const RACHA_THEME_MAP = RACHA_THEMES.reduce(
  (acc, theme) => {
    acc[theme.key] = theme;
    return acc;
  },
  {} as Record<RachaThemeKey, RachaTheme>
);

export function isRachaThemeKey(value?: string | null): value is RachaThemeKey {
  if (!value) return false;
  return Object.prototype.hasOwnProperty.call(RACHA_THEME_MAP, value);
}

export function getRachaTheme(key?: string | null): RachaTheme {
  if (isRachaThemeKey(key)) return RACHA_THEME_MAP[key];
  return RACHA_THEME_MAP[DEFAULT_RACHA_THEME_KEY];
}
