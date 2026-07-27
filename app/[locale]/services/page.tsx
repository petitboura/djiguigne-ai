import type { Metadata } from "next";
import { getDictionary } from "@/lib/dictionaries";
import { type Locale } from "@/lib/site-config";
import { JsonLd } from "@/components/JsonLd";

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
          Maquette uniquement (Bourama, 2026-07-27) : les 4 boutons de
          section ci-dessous ne sont PAS encore branchés -- pas de
          onClick, pas d'appel API. Le comportement réel (afficher les
          IA d'une section selon leur date/moment de création) sera
          câblé dans une session dédiée une fois le modèle de données
          confirmé. Rien à gauche pour l'instant (laissé volontairement
          vide).
        */}
        <div className="flex justify-end">
          <div className="flex w-full max-w-xs flex-col gap-3 animate-dj-fade-up">
            {(
              [
                dict.services.sections.matieres,
                dict.services.sections.metier,
                dict.services.sections.filiere,
                dict.services.sections.domaine,
              ] as const
            ).map((label, i) => (
              <button
                key={label}
                type="button"
                className="rounded-xl border border-dj-bordure bg-dj-surface px-5 py-4 text-left font-display text-base font-semibold text-dj-texte transition-colors hover:border-dj-bordure-forte hover:bg-dj-surface-haute"
                style={{ animationDelay: `${i * 0.05}s` }}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        <div className="mt-6 flex justify-end animate-dj-fade-up" style={{ animationDelay: "0.2s" }}>
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
