import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        udea: {
          green: "#006e3a", // verde institucional exacto
          light: "#4caf50",
          gray: "#f3f4f6",
          text: "#1f2937",
        },
      },
    },
  },
  plugins: [],
};

export default config;
