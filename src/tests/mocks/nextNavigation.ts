import { jest } from "@jest/globals";

export const useRouter = () => ({
  push: jest.fn(),
  replace: jest.fn(),
  refresh: jest.fn(),
  back: jest.fn(),
  forward: jest.fn(),
  prefetch: jest.fn(),
});

export const usePathname = () => "/";

export const useSearchParams = () => new URLSearchParams();
