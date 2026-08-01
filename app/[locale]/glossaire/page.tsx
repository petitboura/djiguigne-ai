import type { Metadata } from "next";
import { glossaire } from "@/lib/glossaire";
import { siteConfig, type Locale } from "@/lib/site-config";
import { JsonLd } from "@/components/JsonLd";

const TITRE: Record<Locale, { titre: string; intro: string }> = {
  fr: {
    titre: "Glossaire des IA spécialisées",
    intro: "Les termes du secteur des IA spécialisées et agents IA, expliqués simplement.",
  },
  en: {
    titre: "Specialized AI glossary",
    intro: "Specialized AI and AI agent terms, explained simply.",
  },
};

export function generateMetadata({ params }: { params: { locale: Locale } }): Metadata {
  const t = TITRE[params.locale];
  return {
    title: t.titre,
    description: t.intro,
    alternates: { canonical: `/${params.locale}/glossaire` },
  };
}

export default function GlossairePage({ params }: { params: { locale: Locale } }) {
  const { locale } = params;
  const t = TITRE[locale];
  const termes = glossaire[locale];

  return (
    <>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "DefinedTermSet",
          name: t.titre,
          hasDefinedTerm: termes.map((terme) => ({
            "@type": "DefinedTerm",
            name: terme.terme,
            description: terme.definition,
            url: `${siteConfig.url}/${locale}/glossaire#${terme.slug}`,
          })),
        }}
      />

      <section className="mx-auto max-w-2xl px-5 py-16">
        <h1 className="font-display text-3xl font-bold text-dj-texte">{t.titre}</h1>
        <p className="mt-3 text-dj-texte-muet">{t.intro}</p>

        <dl className="mt-10 flex flex-col gap-8">
          {termes.map((terme) => (
            <div key={terme.slug} id={terme.slug} className="scroll-mt-24">
              <dt className="font-display text-lg font-bold text-dj-texte">{terme.terme}</dt>
              <dd className="mt-2 text-dj-texte-muet">{terme.definition}</dd>
            </div>
          ))}
        </dl>
      </section>
    </>
  );
}
