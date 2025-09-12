import "@testing-library/jest-dom";
import React from "react";

// Mock do Next.js router
jest.mock("next/router", () => ({
  useRouter() {
    return {
      route: "/",
      pathname: "/",
      query: {},
      asPath: "/",
      push: jest.fn(),
      pop: jest.fn(),
      reload: jest.fn(),
      back: jest.fn(),
      prefetch: jest.fn().mockResolvedValue(undefined),
      beforePopState: jest.fn(),
      events: {
        on: jest.fn(),
        off: jest.fn(),
        emit: jest.fn(),
      },
      isFallback: false,
    };
  },
}));

// Mock do Next.js Image
jest.mock("next/image", () => ({
  __esModule: true,
  default: (props: any) => {
    // eslint-disable-next-line @next/next/no-img-element
    return React.createElement("img", props);
  },
}));

// Mock do SWR
jest.mock("swr", () => ({
  __esModule: true,
  default: (key: string, fetcher: any) => {
    const mockData = {
      "/api/rachas": { data: [], isLoading: false, error: null },
      "/api/users": { data: [], isLoading: false, error: null },
      "/api/partidas": { data: [], isLoading: false, error: null },
    };
    return mockData[key] || { data: null, isLoading: true, error: null };
  },
}));

// Mock do window.matchMedia
Object.defineProperty(window, "matchMedia", {
  writable: true,
  value: jest.fn().mockImplementation((query) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(), // deprecated
    removeListener: jest.fn(), // deprecated
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
});

// Mock do ResizeObserver
global.ResizeObserver = jest.fn().mockImplementation(() => ({
  observe: jest.fn(),
  unobserve: jest.fn(),
  disconnect: jest.fn(),
}));

// Mock do IntersectionObserver
global.IntersectionObserver = jest.fn().mockImplementation(() => ({
  observe: jest.fn(),
  unobserve: jest.fn(),
  disconnect: jest.fn(),
}));

// Mock do console para evitar logs nos testes
global.console = {
  ...console,
  log: jest.fn(),
  error: jest.fn(),
  warn: jest.fn(),
  info: jest.fn(),
};
