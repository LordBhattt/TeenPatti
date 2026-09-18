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
        base: '#0F0F11',
        surface: '#1A1A1E',
        border: '#28282E',
        muted: '#6B6B73',
        primary: '#E2E2E5',
        accent: '#3B7A57',
        'accent-dim': '#2E6144',
        'card-red': '#B91C1C',
        'card-black': '#1A1A1E',
      },
      fontFamily: {
        serif: ['var(--font-dm-serif)', 'Georgia', 'serif'],
        sans: ['var(--font-dm-sans)', 'system-ui', 'sans-serif'],
      },
      animation: {
        'deal': 'deal 0.4s ease-out forwards',
        'deal-1': 'deal 0.4s ease-out 0.08s forwards',
        'deal-2': 'deal 0.4s ease-out 0.16s forwards',
        'deal-3': 'deal 0.4s ease-out 0.24s forwards',
        'fade-in': 'fadeIn 0.3s ease-out forwards',
      },
      keyframes: {
        deal: {
          '0%': { opacity: '0', transform: 'translateY(-20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
      },
    },
  },
  plugins: [],
};
export default config;
