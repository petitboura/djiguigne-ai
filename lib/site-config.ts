// Source unique de vérité pour toutes les données de marque (NAP, mission,
// dates...). Ne JAMAIS dupliquer ces valeurs en dur ailleurs dans le code —
// les pages légales, la page à propos, le JSON-LD et le footer lisent tous
// ce fichier, pour garantir une cohérence parfaite (important pour le GEO,
// voir le brief Notion : les IA croisent ces informations entre les pages).

export const siteConfig = {
  brandName: "Djiguignè AI",
  legalName: "Djiguignè AI (Boumi Diarra, auto-entrepreneur)",
  domain: "djiguigne.com",
  url: "https://djiguigne.com",
  // URL de l'application produit (création d'agent / chat), distincte du
  // site vitrine. Piloté par variable d'environnement (à définir dans
  // Vercel : Project Settings -> Environment Variables) pour pouvoir
  // changer d'hébergement (ex: Streamlit Cloud -> Railway) sans toucher
  // au code ni redéployer manuellement. Le repli ci-dessous n'est utilisé
  // que si la variable n'est pas définie (ex: en développement local).
  appUrl: process.env.NEXT_PUBLIC_APP_URL || "https://djiguigne.up.railway.app",
  foundingDate: "2026-07-10",
  legalStatus: "Auto-entrepreneur",
  mission: {
    fr: "Rendre les IA spécialisées accessibles à tous, créées par des créateurs sélectionnés.",
    en: "Making specialized AI accessible to everyone, built by selected creators.",
  },
  tagline: {
    fr: "Découvre des IA spécialisées, créées par des créateurs sélectionnés, prêtes à l'emploi.",
    en: "Discover specialized AIs, built by selected creators, ready to use.",
  },
  location: {
    city: "Tunis",
    country: "Tunisie",
    countryEn: "Tunisia",
  },
  contact: {
    email: "boumiservice@gmail.com",
    phone: "+216 54 361 045",
  },
  social: [] as { name: string; url: string }[],
  locales: ["fr", "en"] as const,
  defaultLocale: "fr" as const,
};

export type Locale = (typeof siteConfig.locales)[number];
