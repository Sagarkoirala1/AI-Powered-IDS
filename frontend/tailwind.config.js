/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        base: {
          DEFAULT: "#0E1A1C",
          panel: "#152528",
          alt: "#1B2E32",
          line: "#2A4247",
        },
        ink: {
          DEFAULT: "#E7EFEF",
          muted: "#8FA8AB",
          faint: "#5C7376",
        },
        signal: {
          DEFAULT: "#E8A33D",
          soft: "#F0C27A",
        },
        state: {
          safe: "#4FD1B3",
          low: "#7FA9C7",
          medium: "#E8A33D",
          high: "#F0793C",
          critical: "#E5484D",
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
