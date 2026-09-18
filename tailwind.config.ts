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
        background: "var(--background)",
        foreground: "var(--foreground)",
        felt: {
          DEFAULT: "#0B4D2C",
          dark: "#073D22",
          light: "#0E6038",
        },
        gold: {
          DEFAULT: "#D4AF37",
          dark: "#B8960F",
          light: "#E8C84A",
        },
        card: {
          red: "#DC2626",
          black: "#1A1A2E",
          back: "#1E3A5F",
        },
      },
      boxShadow: {
        'card': '0 4px 12px rgba(0, 0, 0, 0.3)',
        'card-hover': '0 8px 24px rgba(0, 0, 0, 0.4)',
        'glow': '0 0 20px rgba(212, 175, 55, 0.4)',
        'glow-green': '0 0 20px rgba(14, 96, 56, 0.6)',
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'bounce-in': 'bounceIn 0.5s ease-out',
        'slide-up': 'slideUp 0.3s ease-out',
        'flip': 'flip 0.6s ease-in-out',
        'chip-bounce': 'chipBounce 0.4s ease-out',
      },
      keyframes: {
        bounceIn: {
          '0%': { transform: 'scale(0.3)', opacity: '0' },
          '50%': { transform: 'scale(1.05)' },
          '70%': { transform: 'scale(0.9)' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        flip: {
          '0%': { transform: 'rotateY(0deg)' },
          '100%': { transform: 'rotateY(180deg)' },
        },
        chipBounce: {
          '0%': { transform: 'translateY(-30px) scale(0.8)', opacity: '0' },
          '60%': { transform: 'translateY(5px) scale(1.05)' },
          '100%': { transform: 'translateY(0) scale(1)', opacity: '1' },
        },
      },
    },
  },
  plugins: [],
};
export default config;
