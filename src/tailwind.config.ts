import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        udea: {
          green: "#006e3a",   // Verde institucional UdeA
          dark: "#004f2e",    // Verde profundo (hover / contrast)
          light: "#4caf50",   // Verde claro complementario
          gray: "#f7f9f7",    // Gris fondo institucional
          text: "#1f2937",    // Gris oscuro para textos
        },
      },
    },
  },
  plugins: [],
};

export default config;
