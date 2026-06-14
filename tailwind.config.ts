import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        ink: {
          950: "#0a0b0f",
          900: "#0e1016",
          800: "#14171f",
          700: "#1b1f29",
          600: "#252a37",
        },
        ascend: {
          DEFAULT: "#ff4655",
          bright: "#ff6b76",
          deep: "#c8202f",
        },
        tactical: {
          DEFAULT: "#1ce5d4",
          deep: "#0f9b8f",
        },
        rarity: {
          common: "#9aa4b2",
          uncommon: "#46d17a",
          rare: "#3ea6ff",
          epic: "#b15cff",
          legendary: "#ffb017",
          mythic: "#ff4655",
        },
      },
      fontFamily: {
        display: ["var(--font-display)", "system-ui", "sans-serif"],
        body: ["var(--font-body)", "system-ui", "sans-serif"],
        mono: ["var(--font-mono)", "monospace"],
      },
      borderRadius: {
        xl: "1rem",
        "2xl": "1.25rem",
      },
      boxShadow: {
        glow: "0 0 24px -4px rgba(255,70,85,0.45)",
        "glow-cyan": "0 0 24px -4px rgba(28,229,212,0.4)",
        card: "0 10px 40px -12px rgba(0,0,0,0.7)",
      },
      backgroundImage: {
        "grid-faint":
          "linear-gradient(rgba(255,255,255,0.025) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.025) 1px, transparent 1px)",
      },
      keyframes: {
        shimmer: {
          "100%": { transform: "translateX(100%)" },
        },
        "pulse-glow": {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: "0.6" },
        },
      },
      animation: {
        shimmer: "shimmer 1.6s infinite",
        "pulse-glow": "pulse-glow 2.4s ease-in-out infinite",
      },
    },
  },
  plugins: [],
};
export default config;
