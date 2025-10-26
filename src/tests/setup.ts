import "@testing-library/jest-dom";

declare global {
  // Adicione aqui polyfills específicos caso o JSDOM falhe em alguma API
  // Ex.: interface Navigator, window.matchMedia, ResizeObserver, etc.
}

// Polyfills comuns para ambiente JSDOM
// matchMedia
Object.defineProperty(window, "matchMedia", {
  writable: true,
  value: (query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: () => {},
    removeListener: () => {},
    addEventListener: () => {},
    removeEventListener: () => {},
    dispatchEvent: () => false,
  }),
});

// ResizeObserver
// @ts-ignore
global.ResizeObserver = class {
  observe() {}
  unobserve() {}
  disconnect() {}
};

// IntersectionObserver
// @ts-ignore
global.IntersectionObserver = class {
  constructor() {}
  observe() {}
  unobserve() {}
  disconnect() {}
  takeRecords() { return []; }
  root = null;
  rootMargin = "0px";
  thresholds = [] as number[];
};

// SWR mock simples para evitar invalid hook em testes que chamam diretamente
jest.mock("swr", () => ({
  __esModule: true,
  default: (..._args: any[]) => ({
    data: undefined,
    error: undefined,
    isLoading: false,
    mutate: jest.fn(),
  }),
}));
