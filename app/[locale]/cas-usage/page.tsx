import type { Metadata } from "next";
import Link from "next/link";
import { casUsage } from "@/lib/cas-usage";
import { type Locale } from "@/lib/site-config";

const TITRE: Record<Locale, { titre: string; intro: string }> = {
  fr: {
    titre: "Cas d'usage",
    intro: "Les domaines où une IA spécialisée fait une vraie différence par rapport à une IA généraliste.",
  },
  en: {
    titre: "Use cases",
    intro: "The domains where a specialized AI makes a real difference compared to a general-purpose AI.",
  },
};

export function generateMetadata({ params }: { params: { locale: Locale } }): Metadata {
  const t = TITRE[params.locale];
  return {
    title: t.titre,
    description: t.intro,
    alternates: { canonical: `/${params.locale}/cas-usage` },
  };
}

export default function CasUsagePage({ params }: { params: { locale: Locale } }) {
  const { locale } = params;
  const t = TITRE[locale];
  const items = casUsage[locale];

  return (
    <section className="mx-auto max-w-2xl px-5 py-16">
      <h1 className="font-display text-3xl font-bold text-dj-texte">{t.titre}</h1>
      <p className="mt-3 text-dj-texte-muet">{t.intro}</p>

      <ul className="mt-10 flex flex-col gap-4">
        {items.map((item) => (
          <li key={item.slug}>
            <Link
              href={`/${locale}/cas-usage/${item.slug}`}
              className="block rounded-2xl border border-dj-bordure bg-dj-surface p-5 transition-colors hover:border-dj-bordure-forte hover:bg-dj-surface-haute"
            >
              <h2 className="font-display text-lg font-bold text-dj-texte">{item.titre}</h2>
              <p className="mt-2 text-sm text-dj-texte-muet">{item.accroche}</p>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
