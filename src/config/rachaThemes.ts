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
    swatches: ["#1E90FF", "#7DD3FC", "#191C22"],
    tokens: {
      brand: "#1E90FF",
      brandSoft: "#7DD3FC",
      brandStrong: "#1A6FE0",
      brandRing: "#A6E1FF",
    },
  },
  {
    key: "vermelho_rubi",
    name: "Vermelho Rubi",
    subtitle: "Vermelho rubi, dourado e preto",
    swatches: ["#FF2D2D", "#FFD54A", "#191C22"],
    tokens: {
      brand: "#FF2D2D",
      brandSoft: "#FFD54A",
      brandStrong: "#D91F1F",
      brandRing: "#FF7A7A",
    },
  },
  {
    key: "verde_esmeralda",
    name: "Verde Esmeralda",
    subtitle: "Verde esmeralda, verde claro e preto",
    swatches: ["#00E676", "#B9FFD2", "#191C22"],
    tokens: {
      brand: "#00E676",
      brandSoft: "#B9FFD2",
      brandStrong: "#00C965",
      brandRing: "#7CFFB0",
    },
  },
  {
    key: "laranja_flame",
    name: "Laranja Flame",
    subtitle: "Laranja flame, dourado e preto",
    swatches: ["#FF8A00", "#FFD54A", "#191C22"],
    tokens: {
      brand: "#FF8A00",
      brandSoft: "#FFD54A",
      brandStrong: "#E67600",
      brandRing: "#FFE08A",
    },
  },
  {
    key: "roxo_galaxy",
    name: "Roxo Galaxy",
    subtitle: "Roxo profundo, lilas e preto",
    swatches: ["#B12CFF", "#E2B7FF", "#191C22"],
    tokens: {
      brand: "#B12CFF",
      brandSoft: "#E2B7FF",
      brandStrong: "#8F1FE0",
      brandRing: "#D58BFF",
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
