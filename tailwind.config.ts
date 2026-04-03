import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--mc-bg)",
        foreground: "var(--mc-text)",
        teal: "var(--mc-teal)",
        saffron: "var(--mc-saffron)",
        rose: "var(--mc-rose)",
        muted: "var(--mc-muted)",
        card: "var(--mc-card)",
      },
      borderRadius: {
        card: "16px",
        modal: "24px",
      },
      boxShadow: {
        tealGlow: "var(--mc-glow-teal)",
        saffronGlow: "var(--mc-glow-saffron)",
        roseGlow: "var(--mc-glow-rose)",
      },
      fontFamily: {
        sans: ["var(--font-hind)", "ui-sans-serif", "system-ui", "sans-serif"],
        display: ["var(--font-dm-serif)", "ui-serif", "Georgia", "serif"],
      },
      keyframes: {
        floaty: {
          "0%, 100%": { transform: "translate3d(0,0,0)" },
          "50%": { transform: "translate3d(0,-10px,0)" },
        },
      },
      animation: {
        floaty: "floaty 6s ease-in-out infinite",
      },
    },
  },
  plugins: [],
};
export default config;
