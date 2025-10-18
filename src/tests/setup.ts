import "@testing-library/jest-dom";

declare global {
  // Adicione aqui polyfills específicos caso o JSDOM falhe em alguma API
  // Ex.: interface Navigator, window.matchMedia, ResizeObserver, etc.
}
