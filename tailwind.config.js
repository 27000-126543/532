/** @type {import('tailwindcss').Config} */

export default {
  darkMode: "class",
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    container: {
      center: true,
    },
    extend: {
      colors: {
        bg: {
          primary: "#0A1628",
          secondary: "#0F1F3A",
          tertiary: "#162A4A",
          glass: "rgba(10, 22, 40, 0.75)",
        },
        brand: {
          50: "#E8F0FE",
          100: "#C7D9FB",
          200: "#8FB5F7",
          300: "#5A90F2",
          400: "#2E6EEB",
          500: "#1E54B7",
          600: "#174394",
          700: "#113372",
          800: "#0B2350",
          900: "#06132E",
        },
        status: {
          normal: "#10B981",
          warning: "#F59E0B",
          danger: "#EF4444",
          vacant: "#F97316",
          available: "#34D399",
        },
        accent: {
          gold: "#D4AF37",
          cyan: "#22D3EE",
        },
      },
      fontFamily: {
        sans: ["Source Han Sans SC", "PingFang SC", "Microsoft YaHei", "sans-serif"],
        mono: ["JetBrains Mono", "Fira Code", "monospace"],
      },
      boxShadow: {
        glow: "0 0 20px rgba(30, 84, 183, 0.5)",
        "glow-green": "0 0 20px rgba(16, 185, 129, 0.6)",
        "glow-yellow": "0 0 20px rgba(245, 158, 11, 0.6)",
        "glow-red": "0 0 20px rgba(239, 68, 68, 0.6)",
        "glow-gold": "0 0 15px rgba(212, 175, 55, 0.5)",
      },
      backdropBlur: {
        xs: "2px",
      },
      animation: {
        "pulse-slow": "pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite",
        "pulse-fast": "pulse 1s cubic-bezier(0.4, 0, 0.6, 1) infinite",
        "border-flow": "borderFlow 3s linear infinite",
        "scan-line": "scanLine 4s linear infinite",
        float: "float 6s ease-in-out infinite",
      },
      keyframes: {
        borderFlow: {
          "0%, 100%": { "border-color": "rgba(30, 84, 183, 0.3)" },
          "50%": { "border-color": "rgba(30, 84, 183, 0.9)" },
        },
        scanLine: {
          "0%": { transform: "translateY(-100%)" },
          "100%": { transform: "translateY(100%)" },
        },
        float: {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-10px)" },
        },
      },
    },
  },
  plugins: [],
};
