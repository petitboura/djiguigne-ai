import type { Metadata } from "next";
import Image from "next/image";
import { getDictionary } from "@/lib/dictionaries";
import { siteConfig, type Locale } from "@/lib/site-config";
import { JsonLd } from "@/components/JsonLd";
import { SectionsProduit } from "@/components/SectionsProduit";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

type AgentCatalogue = {
  id: string;
  nom: string;
  icone_page: string;
  image_vitrine_url: string | null;
  description: string;
};

// Chantier SEO/AEO (2026-08-01) : catalogue complet, récupéré côté
// serveur (contrairement à SectionsProduit qui fetch côté client après
// interaction). Boucle sur la pagination de /api/feed comme
// djiguigne-frontend/app/sitemap.ts -- même garde-fou à 40 pages.
async function recupererCatalogueComplet(): Promise<AgentCatalogue[]> {
  if (!API_URL) return [];

  const agents: AgentCatalogue[] = [];
  let page = 1;

  while (page <= 40) {
    const reponse = await fetch(`${API_URL}/api/feed?page=${page}&limite=50`, {
      next: { revalidate: 3600 },
    }).catch(() => null);

    if (!reponse || !reponse.ok) break;

    const donnees = await reponse.json();
    agents.push(...(donnees.agents ?? []));

    if (agents.length >= (donnees.total ?? 0) || (donnees.agents ?? []).length === 0) break;
    page += 1;
  }

  return agents;
}

export function generateMetadata({ params }: { params: { locale: Locale } }): Metadata {
  const dict = getDictionary(params.locale);
  return {
    title: dict.services.title,
    description: dict.services.intro,
    alternates: { canonical: `/${params.locale}/services` },
  };
}

// Pas dans dictionaries.ts : section ajoutée après coup pour le
// chantier SEO/AEO, même pattern que STEPS dans app/[locale]/page.tsx
// (objet inline par locale plutôt que toucher au fichier de traductions
// partagé pour 2 chaînes).
const CATALOGUE: Record<Locale, { titre: string; intro: string }> = {
  fr: { titre: "Toutes nos IA", intro: "Le catalogue complet des IA spécialisées disponibles sur Djiguignè." },
  en: { titre: "All our AIs", intro: "The full catalogue of specialized AIs available on Djiguignè." },
};

export default async function ServicesPage({ params }: { params: { locale: Locale } }) {
  const { locale } = params;
  const dict = getDictionary(locale);
  const catalogue = CATALOGUE[locale];
  const agents = await recupererCatalogueComplet();

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

      {agents.length > 0 && (
        <JsonLd
          data={{
            "@context": "https://schema.org",
            "@type": "ItemList",
            itemListElement: agents.map((agent, i) => ({
              "@type": "ListItem",
              position: i + 1,
              name: agent.nom,
              url: `${siteConfig.appUrl}/agent/${agent.id}`,
            })),
          }}
        />
      )}

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
            devenirCreateurLabel: dict.home.heroCtaSecondary,
            devenirCreateurExplicationTitre: dict.home.heroCtaExplicationTitre,
            devenirCreateurExplicationCorps: dict.home.heroCtaExplicationCorps,
            devenirCreateurContinuer: dict.home.heroCtaExplicationContinuer,
            devenirCreateurAnnuler: dict.home.heroCtaExplicationAnnuler,
            devenirCreateurCategorieTitre: dict.home.heroCtaCategorieTitre,
            devenirCreateurChampLibrePlaceholder: dict.home.heroCtaChampLibrePlaceholder,
            devenirCreateurValider: dict.home.heroCtaValider,
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

      {agents.length > 0 && (
        <section className="mx-auto max-w-4xl px-5 pb-16">
          <h2 className="font-display text-2xl font-bold text-dj-texte">{catalogue.titre}</h2>
          <p className="mt-2 text-dj-texte-muet">{catalogue.intro}</p>
          <ul className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {agents.map((agent) => (
              <li key={agent.id}>
                <a
                  href={`${siteConfig.appUrl}/agent/${agent.id}`}
                  className="group flex flex-col gap-3 rounded-2xl border border-dj-bordure bg-dj-surface p-4 transition-colors hover:border-dj-bordure-forte hover:bg-dj-surface-haute"
                >
                  <span className="flex items-center gap-3">
                    <span className="relative flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-full bg-dj-surface-haute">
                      {agent.image_vitrine_url ? (
                        <Image
                          src={agent.image_vitrine_url}
                          alt=""
                          fill
                          className="object-cover"
                          sizes="48px"
                        />
                      ) : (
                        <span className="text-xl leading-none">{agent.icone_page || "🤖"}</span>
                      )}
                    </span>
                    <span className="truncate font-display text-sm font-bold text-dj-texte">{agent.nom}</span>
                  </span>
                  {agent.description && (
                    <span className="line-clamp-2 text-sm text-dj-texte-muet">{agent.description}</span>
                  )}
                </a>
              </li>
            ))}
          </ul>
        </section>
      )}
    </>
  );
}

