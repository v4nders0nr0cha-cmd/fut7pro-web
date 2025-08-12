/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,ts,jsx,tsx}", "./src/styles/globals.css"],
  theme: {
    extend: {
      colors: {
        fundo: "var(--cor-secundaria)",
        primario: "var(--cor-primaria)",
        texto: "var(--texto-primario)",
      },
      animation: {
        "bounce-in": "bounceIn 0.3s ease-out",
        "slide-down": "slideDown 0.5s ease-out",
        "slide-in-left": "slideInLeft 0.4s ease-out",
      },
      keyframes: {
        bounceIn: {
          "0%": { transform: "scale(0.95)", opacity: "0" },
          "100%": { transform: "scale(1)", opacity: "1" },
        },
        slideDown: {
          "0%": { opacity: 0, transform: "translateY(-20px)" },
          "100%": { opacity: 1, transform: "translateY(0)" },
        },
        slideInLeft: {
          "0%": { transform: "translateX(-100%)", opacity: 0 },
          "100%": { transform: "translateX(0)", opacity: 1 },
        },
      },
    },
  },
  plugins: [],
};
