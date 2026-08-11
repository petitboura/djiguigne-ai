import type { Config } from "tailwindcss";

// Palette et typographie = copie exacte de la source de vérité :
// assistant-etudiants/faces/vues/theme_djiguigne.py (COULEURS + CSS).
// Ne jamais dériver ces valeurs autrement — un seul endroit à faire
// évoluer si la marque change côté Streamlit.
//
// Pivot thème clair (2026-08-08, demande Bourama) : passage d'un fond sombre
// à un fond crème clair, inspiré de l'identité visuelle de Claude (Anthropic).
// accent-1/accent-2 inchangés (couleur du logo Djiguignè, conservée). texte/
// texte-muet/succes/inactif recalculés pour rester lisibles sur fond clair.
// Identique à djiguigne-frontend/tailwind.config.ts (même source de vérité).
const config: Config = {
  darkMode: "class",
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        dj: {
          fond: "#F4F3EE",
          surface: "#FBFAF8",
          "surface-haute": "#FFFFFF",
          bordure: "rgba(43,33,24,0.10)",
          "bordure-forte": "rgba(193,68,14,0.35)",
          "accent-1": "#E8934A",
          "accent-2": "#C1440E",
          texte: "#2B2118",
          "texte-muet": "#6E5F4D",
          succes: "#16A34A",
          inactif: "#B0A79B",
        },
      },
      backgroundImage: {
        "dj-gradient": "linear-gradient(135deg, #F2A65A 0%, #D9631F 55%, #8A2E0A 100%)",
        "dj-hero-glow":
          "radial-gradient(ellipse 120% 60% at 50% -10%, rgba(232,147,74,0.10), transparent 60%)",
        // Shimmer (09/08, demande Bourama : remplacer partout le texte figé
        // "Chargement..." et les blocs animate-pulse par un balayage
        // lumineux, comme Claude.ai/Vercel). Gris neutre (dj-inactif), PAS
        // teinté accent-1 -- retour de Bourama (09/08) : l'orange
        // détonnait, la référence (capture Vercel) est grise, comme les
        // tons dj-bordure/dj-inactif déjà utilisés partout ailleurs.
        // Valeurs identiques à djiguigne-frontend/classgpt-frontend, à
        // garder synchronisées.
        //   - dj-shimmer : fond complet des blocs skeleton (composant
        //     Skeleton.tsx), opacité faible.
        //   - dj-shimmer-texte : pour un texte qui scintille sur place,
        //     couleurs pleines + bg-clip-text.
        "dj-shimmer": "linear-gradient(100deg, rgba(43,33,24,0.04) 20%, rgba(176,167,155,0.45) 50%, rgba(43,33,24,0.04) 80%)",
        "dj-shimmer-texte": "linear-gradient(100deg, #6E5F4D 25%, #B0A79B 50%, #6E5F4D 75%)",
      },
      fontFamily: {
        display: ["var(--font-bricolage)", "sans-serif"],
        sans: ["var(--font-inter)", "sans-serif"],
        mono: ["var(--font-jetbrains-mono)", "monospace"],
      },
      keyframes: {
        "dj-fade-up": {
          from: { opacity: "0", transform: "translateY(14px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
        "dj-fade-in": {
          from: { opacity: "0" },
          to: { opacity: "1" },
        },
        "dj-orbit": {
          from: { transform: "rotate(0deg)" },
          to: { transform: "rotate(360deg)" },
        },
        "dj-glow": {
          "0%, 100%": { opacity: "0.55", transform: "scale(1)" },
          "50%": { opacity: "0.9", transform: "scale(1.06)" },
        },
        "dj-scroll": {
          from: { transform: "translateX(0)" },
          to: { transform: "translateX(-50%)" },
        },
        "dj-shimmer": {
          "0%": { backgroundPosition: "200% 0" },
          "100%": { backgroundPosition: "-200% 0" },
        },
      },
      animation: {
        "dj-fade-up": "dj-fade-up 0.5s ease both",
        "dj-fade-in": "dj-fade-in 0.8s ease both",
        "dj-orbit": "dj-orbit 18s linear infinite",
        "dj-glow": "dj-glow 3.2s ease-in-out infinite",
        "dj-scroll": "dj-scroll 32s linear infinite",
        "dj-shimmer": "dj-shimmer 2.2s ease-in-out infinite",
      },
    },
  },
  plugins: [],
};

export default config;
