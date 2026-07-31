import type { Metadata } from "next";
import { getDictionary } from "@/lib/dictionaries";
import { type Locale } from "@/lib/site-config";
import { JsonLd } from "@/components/JsonLd";
import { SectionsProduit } from "@/components/SectionsProduit";

export function generateMetadata({ params }: { params: { locale: Locale } }): Metadata {
  const dict = getDictionary(params.locale);
  return {
    title: dict.services.title,
    description: dict.services.intro,
    alternates: { canonical: `/${params.locale}/services` },
  };
}

export default function ServicesPage({ params }: { params: { locale: Locale } }) {
  const { locale } = params;
  const dict = getDictionary(locale);

  return (
    <>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "FAQPage",
          mainEntity: dict.services.faq.map((f) => ({
            "@type": "Question",
            name: f.q,
            acceptedAnswer: { "@type": "Answer", text: f.a },
          })),
        }}
      />

      <section className="mx-auto max-w-2xl px-5 py-16">
        {/*
          Branché le 2026-07-31 (Bourama : "il y a 3-4 sections mais rien
          là-dessus") -- voir SectionsProduit.tsx. Seule "Matières" charge
          de vraies IA pour l'instant (GET /api/feed?avec_matiere=true),
          les 3 autres affichent un message "bientôt" tant que leur
          modèle de données n'est pas défini.
        */}
        <SectionsProduit
          locale={locale}
          labels={dict.services.sections}
          strings={{
            chargement: dict.services.sectionChargement,
            vide: dict.services.sectionVide,
            erreur: dict.services.sectionErreur,
            bientot: dict.services.sectionBientot,
          }}
        />

        <div className="mt-6 flex justify-start animate-dj-fade-up" style={{ animationDelay: "0.2s" }}>
          <button
            type="button"
            className="rounded-full border border-dj-bordure px-5 py-2 text-sm font-medium text-dj-texte-muet transition-colors hover:border-dj-bordure-forte hover:text-dj-texte"
          >
            {dict.services.faqButton}
          </button>
        </div>
      </section>
    </>
  );
}

