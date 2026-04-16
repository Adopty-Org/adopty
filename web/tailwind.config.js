import daisyui from "daisyui";

/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        "jakarta": ["Plus Jakarta Sans", "sans-serif"],
        "manrope": ["Manrope", "sans-serif"],
        "chewy": ["Chewy", "cursive"],
        "sora": ["Sora", "sans-serif"],
      }
    },
  },
  plugins: [
    daisyui({
      themes: ["lemonade",
        {
          'mon-theme': {
            "primary": "#154212",
            "primary-content": "#ffffff",
            "secondary": "#944925",
            "secondary-content": "#ffffff",
            "accent": "#6e1c0c",
            "accent-content": "#ffffff",
            "neutral": "#1b1d0e",
            "neutral-content": "#f2f2d9",
            "base-100": "#fbfbe2",
            "base-200": "#efefd7",
            "base-300": "#e4e4cc",
            "base-content": "#1b1d0e",
            "info": "#3b6934",
            "info-content": "#ffffff",
            "success": "#a1d494",
            "success-content": "#002201",
            "warning": "#fe9e72",
            "warning-content": "#360f00",
            "error": "#ba1a1a",
            "error-content": "#ffffff",
          },
        },
        "light", // Optionnel: garde les thèmes par défaut
        "dark",
      ],
    }),
  ],
};