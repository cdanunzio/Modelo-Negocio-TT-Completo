import type { Config } from "tailwindcss";
export default {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        puerto: {
          50: "#f3f7ee", 100: "#e2efd9", 200: "#c9e0b4",
          500: "#4d7c2a", 600: "#3c6420", 700: "#27500a", 900: "#173404",
        },
        edit: "#fff2cc", ref: "#ddebf7", calc: "#f2f2f2", chk: "#ffe6e6",
      },
      fontFamily: { sans: ["ui-sans-serif", "system-ui", "-apple-system", "Segoe UI", "Roboto", "sans-serif"] },
    },
  },
  plugins: [],
} satisfies Config;
