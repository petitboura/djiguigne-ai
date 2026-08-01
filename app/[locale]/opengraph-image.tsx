import { ImageResponse } from "next/og";
import { siteConfig, type Locale } from "@/lib/site-config";

// Chantier SEO/AEO (2026-08-01) : image de partage par défaut pour toute
// la vitrine (accueil, about, services, contact, blog -- héritée sauf
// override par page). Générée à la volée, aucun asset PNG à fournir ou
// maintenir. Mêmes couleurs de marque que djiguigne-frontend (dj-*).

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OgImageVitrine({ params }: { params: { locale: Locale } }) {
  const tagline = siteConfig.tagline[params.locale];

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "#0B0908",
          padding: 80,
        }}
      >
        <div
          style={{
            fontSize: 64,
            fontWeight: 800,
            color: "#F5ECE0",
            textAlign: "center",
          }}
        >
          {siteConfig.brandName}
        </div>
        <div
          style={{
            marginTop: 24,
            fontSize: 30,
            color: "#A79A8C",
            textAlign: "center",
            maxWidth: 900,
          }}
        >
          {tagline}
        </div>
      </div>
    ),
    { ...size }
  );
}
