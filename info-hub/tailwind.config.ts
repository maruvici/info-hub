import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  darkMode: "class", // Important for manual toggle
  theme: {
    extend: {
      colors: {
        // Light Mode Palette
        sky: {
          500: "#0EA5E9", // Sky Blue
        },
        // Dark Mode Palette
        navy: {
          900: "#0F172A", // Navy Blue
          800: "#1E293B",
        },
        // Semantic Colors (we map these to the palette above in CSS)
        background: "var(--background)",
        foreground: "var(--foreground)",
        primary: "var(--primary)",
        card: "var(--card)",
        "card-foreground": "var(--card-foreground)",
      },
    },
  },
  plugins: [
    require('@tailwindcss/typography'),
  ],
};
export default config;