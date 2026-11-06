import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    screens: {
      xs: "360px",
      sm: "640px",
      md: "768px",
      lg: "1024px",
      xl: "1280px",
      "2xl": "1440px",
    },
    extend: {
      colors: {
        ink: {
          950: "#09090f",
          900: "#0f0f19",
          800: "#161624",
          700: "#1f1f31",
          600: "#2b2b42",
        },
        accent: {
          DEFAULT: "#FF4D6D",
          soft: "#FF8FA3",
          deep: "#C9184A",
        },
        mist: {
          100: "#f1f1f7",
          300: "#b9b9cc",
          500: "#8585a0",
        },
      },
      fontFamily: {
        display: ["var(--font-display)", "system-ui", "sans-serif"],
        sans: ["var(--font-body)", "system-ui", "sans-serif"],
      },
      boxShadow: {
        glow: "0 0 0 1px rgba(255,77,109,.5), 0 8px 40px -8px rgba(255,77,109,.55)",
        lift: "0 20px 50px -20px rgba(0,0,0,.8)",
      },
      keyframes: {
        shimmer: {
          "0%": { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
      },
      animation: { shimmer: "shimmer 1.6s linear infinite" },
      transitionTimingFunction: {
        smooth: "cubic-bezier(.22,1,.36,1)",
      },
    },
  },
  plugins: [],
};
export default config;