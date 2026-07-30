/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        base: {
          DEFAULT: "#0B1220",
          panel: "#121C2E",
          alt: "#182640",
          line: "#253552",
        },
        ink: {
          DEFAULT: "#EAF2FB",
          muted: "#93A6C4",
          faint: "#58698A",
        },
        signal: {
          DEFAULT: "#2DD4C8",
          soft: "#7EEAE0",
        },
        state: {
          safe: "#22C55E",
          low: "#60A5FA",
          medium: "#FBBF24",
          high: "#FB923C",
          critical: "#F87171",
        },
      },
      fontFamily: {
        display: ["'IBM Plex Sans'", "system-ui", "sans-serif"],
        mono: ["'IBM Plex Mono'", "ui-monospace", "monospace"],
      },
      boxShadow: {
        panel: "0 1px 0 rgba(0,0,0,0.4), 0 0 0 1px rgba(255,255,255,0.02)",
      },
    },
  },
  plugins: [],
};
