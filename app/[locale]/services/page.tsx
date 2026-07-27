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
          confirmé. Rien à droite pour l'instant (laissé volontairement
          vide).
        */}
        <div className="flex justify-start">
          <div className="flex w-full max-w-xs flex-col gap-3 animate-dj-fade-up">
            {(
              [
                { label: dict.services.sections.matieres, icon: <IconLivre /> },
                { label: dict.services.sections.metier, icon: <IconMallette /> },
                { label: dict.services.sections.filiere, icon: <IconChemin /> },
                { label: dict.services.sections.domaine, icon: <IconGrille /> },
              ] as const
            ).map(({ label, icon }, i) => (
              <button
                key={label}
                type="button"
                className="flex items-center gap-3 rounded-xl border border-dj-bordure bg-dj-surface px-5 py-4 text-left font-display text-base font-semibold text-dj-texte transition-colors hover:border-dj-bordure-forte hover:bg-dj-surface-haute"
                style={{ animationDelay: `${i * 0.05}s` }}
              >
                <span className="text-dj-accent-1">{icon}</span>
                {label}
              </button>
            ))}
          </div>
        </div>

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

// Icônes ligne inline (même convention que le reste du repo -- voir
// ChampMotDePasse.tsx / BoutonAccueil.tsx : SVG stroke currentColor,
// pas de librairie externe, pas d'emoji).
function IconLivre() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
      <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
    </svg>
  );
}

function IconMallette() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="7" width="20" height="14" rx="2" />
      <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
      <path d="M2 13h20" />
    </svg>
  );
}

function IconChemin() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="6" cy="19" r="2" />
      <circle cx="18" cy="5" r="2" />
      <path d="M8 19h4.5A4.5 4.5 0 0 0 17 14.5V9a4 4 0 0 1 1-2.6" />
    </svg>
  );
}

function IconGrille() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="7" height="7" rx="1" />
      <rect x="14" y="3" width="7" height="7" rx="1" />
      <rect x="3" y="14" width="7" height="7" rx="1" />
      <rect x="14" y="14" width="7" height="7" rx="1" />
    </svg>
  );
}
