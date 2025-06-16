/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        fundo: "var(--cor-secundaria)",
        primario: "var(--cor-primaria)",
        texto: "var(--texto-primario)",
        secundario: "#1A1A1A",
        destaque: "#FFD700",
        textoSuave: "#CCCCCC",
        sucesso: "#43A047",
        erro: "#E53935",
      },
    },
  },
  plugins: [],
};
