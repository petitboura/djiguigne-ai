/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Ajouté avec le ruban d'agents de l'accueil (2026-07-27) : les icônes
  // y utilisent image_vitrine_url, hébergée sur Supabase Storage. Sans ce
  // remotePattern, next/image refuse de charger un hôte externe non
  // déclaré (erreur au runtime, pas au build). Motif générique en
  // *.supabase.co plutôt qu'un sous-domaine figé, pour ne pas se casser
  // si le projet Supabase change un jour.
  images: {
    remotePatterns: [{ protocol: "https", hostname: "*.supabase.co" }],
  },
};

export default nextConfig;
