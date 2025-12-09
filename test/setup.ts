import "@testing-library/jest-dom";
import React from "react";

const useRouterMock = jest.fn().mockReturnValue({
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
});

// Mock do Next.js router (Pages) e navigation (App Router)
jest.mock("next/router", () => ({
  useRouter: useRouterMock,
  withRouter: (comp: any) => comp,
  Router: {},
}));

jest.mock("next/navigation", () => ({
  useRouter: useRouterMock,
  usePathname: jest.fn(() => "/"),
  useSearchParams: jest.fn(() => ({ get: () => null })),
  redirect: jest.fn(),
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
const swrMock = jest.fn((key: string) => {
  const mockData = {
    "/api/rachas": { data: [], isLoading: false, error: undefined, mutate: jest.fn() },
    "/api/users": { data: [], isLoading: false, error: undefined, mutate: jest.fn() },
    "/api/partidas": { data: [], isLoading: false, error: undefined, mutate: jest.fn() },
    "/api/times": { data: [], isLoading: false, error: undefined, mutate: jest.fn() },
  };
  if (key && key.startsWith("/api/admin/rachas/") && key.endsWith("/times")) {
    return { data: [], isLoading: false, error: undefined, mutate: jest.fn() };
  }
  if (mockData[key]) return mockData[key];
  return { data: [], isLoading: false, error: undefined, mutate: jest.fn() };
});

jest.mock("swr", () => ({
  __esModule: true,
  default: swrMock,
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
