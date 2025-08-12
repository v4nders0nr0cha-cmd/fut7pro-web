// src/config/themes.ts

export type ThemeKey =
  | "amarelo"
  | "azul"
  | "vermelho"
  | "verde"
  | "laranja"
  | "roxo"
  | "rosa"
  | "cinza"
  | "preto"
  | "branco"
  | "dourado"
  | "prata"
  | "corinthians"
  | "palmeiras"
  | "flamengo"
  | "santos"
  | "saopaulo"
  | "cruzeiro"
  | "internacional"
  | "gremio"
  | "atletico"
  | "vasco"
  | "botafogo"
  | "fluminense";

export interface ThemeConfig {
  name: string;
  primary: string; // Cor principal dos títulos, bordas, etc
  secondary: string; // Cor secundária
  highlight: string; // Cor de destaque
  text: string; // Cor padrão de textos de destaque
  background: string; // Cor de fundo
  surface: string; // Cor de superfície (cards)
  accent: string; // Cor de acento
  success: string; // Cor de sucesso
  warning: string; // Cor de aviso
  error: string; // Cor de erro
  info: string; // Cor de informação
  gradient?: string; // Gradiente opcional
  logo?: string; // Logo específico do tema
  description?: string; // Descrição do tema
}

export const themes: Record<ThemeKey, ThemeConfig> = {
  // Temas Básicos
  amarelo: {
    name: "Amarelo Fut7Pro",
    primary: "#FFCC00",
    secondary: "#FFD700",
    highlight: "#FFEB3B",
    text: "#ffffff",
    background: "#121212",
    surface: "#1A1A1A",
    accent: "#FFCC00",
    success: "#4CAF50",
    warning: "#FF9800",
    error: "#F44336",
    info: "#2196F3",
    gradient: "linear-gradient(135deg, #FFCC00 0%, #FFD700 100%)",
    description: "Tema oficial do Fut7Pro com dourado vibrante",
  },
  azul: {
    name: "Azul Popular",
    primary: "#1976D2",
    secondary: "#2196F3",
    highlight: "#42A5F5",
    text: "#ffffff",
    background: "#0A1929",
    surface: "#132F4C",
    accent: "#1976D2",
    success: "#4CAF50",
    warning: "#FF9800",
    error: "#F44336",
    info: "#2196F3",
    gradient: "linear-gradient(135deg, #1976D2 0%, #2196F3 100%)",
    description: "Azul profissional e confiável",
  },
  vermelho: {
    name: "Vermelho Raiz",
    primary: "#C62828",
    secondary: "#E53935",
    highlight: "#EF5350",
    text: "#ffffff",
    background: "#1A0000",
    surface: "#2D0000",
    accent: "#C62828",
    success: "#4CAF50",
    warning: "#FF9800",
    error: "#F44336",
    info: "#2196F3",
    gradient: "linear-gradient(135deg, #C62828 0%, #E53935 100%)",
    description: "Vermelho vibrante e energético",
  },
  verde: {
    name: "Verde Brasil",
    primary: "#388E3C",
    secondary: "#43A047",
    highlight: "#66BB6A",
    text: "#ffffff",
    background: "#0A1A0A",
    surface: "#132F13",
    accent: "#388E3C",
    success: "#4CAF50",
    warning: "#FF9800",
    error: "#F44336",
    info: "#2196F3",
    gradient: "linear-gradient(135deg, #388E3C 0%, #43A047 100%)",
    description: "Verde brasileiro e natural",
  },
  laranja: {
    name: "Laranja Flame",
    primary: "#FF5722",
    secondary: "#FF7043",
    highlight: "#FF8A65",
    text: "#ffffff",
    background: "#1A0A00",
    surface: "#2D1300",
    accent: "#FF5722",
    success: "#4CAF50",
    warning: "#FF9800",
    error: "#F44336",
    info: "#2196F3",
    gradient: "linear-gradient(135deg, #FF5722 0%, #FF7043 100%)",
    description: "Laranja quente e energético",
  },
  roxo: {
    name: "Roxo Royal",
    primary: "#7B1FA2",
    secondary: "#8E24AA",
    highlight: "#AB47BC",
    text: "#ffffff",
    background: "#1A0A1A",
    surface: "#2D132D",
    accent: "#7B1FA2",
    success: "#4CAF50",
    warning: "#FF9800",
    error: "#F44336",
    info: "#2196F3",
    gradient: "linear-gradient(135deg, #7B1FA2 0%, #8E24AA 100%)",
    description: "Roxo elegante e sofisticado",
  },
  rosa: {
    name: "Rosa Vibrante",
    primary: "#E91E63",
    secondary: "#EC407A",
    highlight: "#F06292",
    text: "#ffffff",
    background: "#1A0A0F",
    surface: "#2D1320",
    accent: "#E91E63",
    success: "#4CAF50",
    warning: "#FF9800",
    error: "#F44336",
    info: "#2196F3",
    gradient: "linear-gradient(135deg, #E91E63 0%, #EC407A 100%)",
    description: "Rosa moderno e vibrante",
  },
  cinza: {
    name: "Cinza Moderno",
    primary: "#607D8B",
    secondary: "#78909C",
    highlight: "#90A4AE",
    text: "#ffffff",
    background: "#1A1A1A",
    surface: "#2D2D2D",
    accent: "#607D8B",
    success: "#4CAF50",
    warning: "#FF9800",
    error: "#F44336",
    info: "#2196F3",
    gradient: "linear-gradient(135deg, #607D8B 0%, #78909C 100%)",
    description: "Cinza elegante e profissional",
  },
  preto: {
    name: "Preto Elegante",
    primary: "#212121",
    secondary: "#424242",
    highlight: "#616161",
    text: "#ffffff",
    background: "#000000",
    surface: "#121212",
    accent: "#212121",
    success: "#4CAF50",
    warning: "#FF9800",
    error: "#F44336",
    info: "#2196F3",
    gradient: "linear-gradient(135deg, #212121 0%, #424242 100%)",
    description: "Preto sofisticado e minimalista",
  },
  branco: {
    name: "Branco Clean",
    primary: "#FFFFFF",
    secondary: "#F5F5F5",
    highlight: "#E0E0E0",
    text: "#000000",
    background: "#FFFFFF",
    surface: "#F5F5F5",
    accent: "#2196F3",
    success: "#4CAF50",
    warning: "#FF9800",
    error: "#F44336",
    info: "#2196F3",
    gradient: "linear-gradient(135deg, #FFFFFF 0%, #F5F5F5 100%)",
    description: "Branco limpo e minimalista",
  },
  dourado: {
    name: "Dourado Premium",
    primary: "#FFD700",
    secondary: "#FFC107",
    highlight: "#FFEB3B",
    text: "#000000",
    background: "#1A1A00",
    surface: "#2D2D00",
    accent: "#FFD700",
    success: "#4CAF50",
    warning: "#FF9800",
    error: "#F44336",
    info: "#2196F3",
    gradient: "linear-gradient(135deg, #FFD700 0%, #FFC107 100%)",
    description: "Dourado premium e luxuoso",
  },
  prata: {
    name: "Prata Metálico",
    primary: "#C0C0C0",
    secondary: "#D3D3D3",
    highlight: "#E5E5E5",
    text: "#000000",
    background: "#1A1A1A",
    surface: "#2D2D2D",
    accent: "#C0C0C0",
    success: "#4CAF50",
    warning: "#FF9800",
    error: "#F44336",
    info: "#2196F3",
    gradient: "linear-gradient(135deg, #C0C0C0 0%, #D3D3D3 100%)",
    description: "Prata metálico e moderno",
  },

  // Temas de Clubes Brasileiros
  corinthians: {
    name: "Corinthians Style",
    primary: "#000000",
    secondary: "#FFFFFF",
    highlight: "#FFCC00",
    text: "#FFFFFF",
    background: "#000000",
    surface: "#1A1A1A",
    accent: "#FFCC00",
    success: "#4CAF50",
    warning: "#FF9800",
    error: "#F44336",
    info: "#2196F3",
    gradient: "linear-gradient(135deg, #000000 0%, #1A1A1A 100%)",
    logo: "/images/themes/corinthians-logo.png",
    description: "Racha inspirado na garra corintiana. Timão!",
  },
  palmeiras: {
    name: "Palmeiras Style",
    primary: "#1E7E34",
    secondary: "#FFFFFF",
    highlight: "#28A745",
    text: "#FFFFFF",
    background: "#0A1A0A",
    surface: "#132F13",
    accent: "#1E7E34",
    success: "#28A745",
    warning: "#FF9800",
    error: "#F44336",
    info: "#2196F3",
    gradient: "linear-gradient(135deg, #1E7E34 0%, #28A745 100%)",
    logo: "/images/themes/palmeiras-logo.png",
    description: "Aqui tem mundial (segundo alguns).",
  },
  flamengo: {
    name: "Flamengo Style",
    primary: "#FF0000",
    secondary: "#000000",
    highlight: "#FF3333",
    text: "#FFFFFF",
    background: "#1A0000",
    surface: "#2D0000",
    accent: "#FF0000",
    success: "#4CAF50",
    warning: "#FF9800",
    error: "#F44336",
    info: "#2196F3",
    gradient: "linear-gradient(135deg, #FF0000 0%, #FF3333 100%)",
    logo: "/images/themes/flamengo-logo.png",
    description: "O racha mais popular do Brasil. Mengão!",
  },
  santos: {
    name: "Santos Clássico",
    primary: "#FFFFFF",
    secondary: "#000000",
    highlight: "#F5F5F5",
    text: "#000000",
    background: "#FFFFFF",
    surface: "#F5F5F5",
    accent: "#000000",
    success: "#4CAF50",
    warning: "#FF9800",
    error: "#F44336",
    info: "#2196F3",
    gradient: "linear-gradient(135deg, #FFFFFF 0%, #F5F5F5 100%)",
    logo: "/images/themes/santos-logo.png",
    description: "O peixe dominando as areias do Fut7!",
  },
  saopaulo: {
    name: "Tricolor Paulista",
    primary: "#CC0000",
    secondary: "#FFFFFF",
    highlight: "#FF3333",
    text: "#FFFFFF",
    background: "#1A0000",
    surface: "#2D0000",
    accent: "#CC0000",
    success: "#4CAF50",
    warning: "#FF9800",
    error: "#F44336",
    info: "#2196F3",
    gradient: "linear-gradient(135deg, #CC0000 0%, #FF3333 100%)",
    logo: "/images/themes/saopaulo-logo.png",
    description: "O racha do soberano!",
  },
  cruzeiro: {
    name: "Cruzeiro Estrela",
    primary: "#0033A0",
    secondary: "#FFFFFF",
    highlight: "#3366CC",
    text: "#FFFFFF",
    background: "#0A0A1A",
    surface: "#13132D",
    accent: "#0033A0",
    success: "#4CAF50",
    warning: "#FF9800",
    error: "#F44336",
    info: "#2196F3",
    gradient: "linear-gradient(135deg, #0033A0 0%, #3366CC 100%)",
    logo: "/images/themes/cruzeiro-logo.png",
    description: "Racha estrelado, digno da raposa!",
  },
  internacional: {
    name: "Inter Vermelhão",
    primary: "#CC0000",
    secondary: "#FFFFFF",
    highlight: "#FF3333",
    text: "#FFFFFF",
    background: "#1A0000",
    surface: "#2D0000",
    accent: "#CC0000",
    success: "#4CAF50",
    warning: "#FF9800",
    error: "#F44336",
    info: "#2196F3",
    gradient: "linear-gradient(135deg, #CC0000 0%, #FF3333 100%)",
    logo: "/images/themes/internacional-logo.png",
    description: "Racha vermelho, sangue colorado!",
  },
  gremio: {
    name: "Grêmio Tricolor",
    primary: "#0066CC",
    secondary: "#FFFFFF",
    highlight: "#3399FF",
    text: "#FFFFFF",
    background: "#0A0A1A",
    surface: "#13132D",
    accent: "#0066CC",
    success: "#4CAF50",
    warning: "#FF9800",
    error: "#F44336",
    info: "#2196F3",
    gradient: "linear-gradient(135deg, #0066CC 0%, #3399FF 100%)",
    logo: "/images/themes/gremio-logo.png",
    description: "Racha azul, branco e preto!",
  },
  atletico: {
    name: "Atlético Mineiro",
    primary: "#000000",
    secondary: "#FFFFFF",
    highlight: "#FFCC00",
    text: "#FFFFFF",
    background: "#000000",
    surface: "#1A1A1A",
    accent: "#FFCC00",
    success: "#4CAF50",
    warning: "#FF9800",
    error: "#F44336",
    info: "#2196F3",
    gradient: "linear-gradient(135deg, #000000 0%, #1A1A1A 100%)",
    logo: "/images/themes/atletico-logo.png",
    description: "Racha galo, força e tradição!",
  },
  vasco: {
    name: "Vasco da Gama",
    primary: "#000000",
    secondary: "#FFFFFF",
    highlight: "#FFCC00",
    text: "#FFFFFF",
    background: "#000000",
    surface: "#1A1A1A",
    accent: "#FFCC00",
    success: "#4CAF50",
    warning: "#FF9800",
    error: "#F44336",
    info: "#2196F3",
    gradient: "linear-gradient(135deg, #000000 0%, #1A1A1A 100%)",
    logo: "/images/themes/vasco-logo.png",
    description: "Racha cruz de malta!",
  },
  botafogo: {
    name: "Botafogo",
    primary: "#000000",
    secondary: "#FFFFFF",
    highlight: "#FFCC00",
    text: "#FFFFFF",
    background: "#000000",
    surface: "#1A1A1A",
    accent: "#FFCC00",
    success: "#4CAF50",
    warning: "#FF9800",
    error: "#F44336",
    info: "#2196F3",
    gradient: "linear-gradient(135deg, #000000 0%, #1A1A1A 100%)",
    logo: "/images/themes/botafogo-logo.png",
    description: "Racha fogão, tradição e glória!",
  },
  fluminense: {
    name: "Fluminense",
    primary: "#CC0000",
    secondary: "#FFFFFF",
    highlight: "#FF3333",
    text: "#FFFFFF",
    background: "#1A0000",
    surface: "#2D0000",
    accent: "#CC0000",
    success: "#4CAF50",
    warning: "#FF9800",
    error: "#F44336",
    info: "#2196F3",
    gradient: "linear-gradient(135deg, #CC0000 0%, #FF3333 100%)",
    logo: "/images/themes/fluminense-logo.png",
    description: "Racha tricolor, flu de ferro!",
  },
};

// Função para obter tema por chave
export function getTheme(key: ThemeKey): ThemeConfig {
  return themes[key] || themes.amarelo;
}

// Função para listar todos os temas
export function getAllThemes(): Array<{ key: ThemeKey; config: ThemeConfig }> {
  return Object.entries(themes).map(([key, config]) => ({
    key: key as ThemeKey,
    config,
  }));
}

// Função para aplicar tema ao CSS
export function applyTheme(key: ThemeKey): void {
  const theme = getTheme(key);

  const root = document.documentElement;
  root.style.setProperty("--color-primary", theme.primary);
  root.style.setProperty("--color-secondary", theme.secondary);
  root.style.setProperty("--color-highlight", theme.highlight);
  root.style.setProperty("--color-text", theme.text);
  root.style.setProperty("--color-background", theme.background);
  root.style.setProperty("--color-surface", theme.surface);
  root.style.setProperty("--color-accent", theme.accent);
  root.style.setProperty("--color-success", theme.success);
  root.style.setProperty("--color-warning", theme.warning);
  root.style.setProperty("--color-error", theme.error);
  root.style.setProperty("--color-info", theme.info);

  if (theme.gradient) {
    root.style.setProperty("--gradient-primary", theme.gradient);
  }
}
