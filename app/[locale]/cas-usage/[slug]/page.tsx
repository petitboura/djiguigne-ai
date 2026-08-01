import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { casUsage } from "@/lib/cas-usage";
import { type Locale } from "@/lib/site-config";

const RETOUR: Record<Locale, string> = { fr: "Tous les cas d'usage", en: "All use cases" };
const VOIR_CATALOGUE: Record<Locale, string> = {
  fr: "Voir les IA disponibles dans ce domaine",
  en: "See the AIs available in this domain",
};

export function generateStaticParams({ params }: { params: { locale: Locale } }) {
  return casUsage[params.locale].map((c) => ({ slug: c.slug }));
}

export function generateMetadata({
  params,
}: {
  params: { locale: Locale; slug: string };
}): Metadata {
  const item = casUsage[params.locale].find((c) => c.slug === params.slug);
  if (!item) return { title: "Introuvable" };

  return {
    title: item.titre,
    description: item.accroche,
    alternates: { canonical: `/${params.locale}/cas-usage/${item.slug}` },
  };
}

export default function CasUsageDetailPage({
  params,
}: {
  params: { locale: Locale; slug: string };
}) {
  const { locale, slug } = params;
  const item = casUsage[locale].find((c) => c.slug === slug);
  if (!item) notFound();

  return (
    <article className="mx-auto max-w-2xl px-5 py-16">
      <Link href={`/${locale}/cas-usage`} className="text-sm text-dj-texte-muet hover:text-dj-texte">
        ← {RETOUR[locale]}
      </Link>

      <h1 className="mt-4 font-display text-3xl font-bold text-dj-texte">{item.titre}</h1>
      <p className="mt-3 text-dj-texte-muet">{item.accroche}</p>

      <div className="mt-8 flex flex-col gap-4 text-dj-texte">
        {item.corps.split("\n\n").map((paragraphe, i) => (
          <p key={i}>{paragraphe}</p>
        ))}
      </div>

      <Link
        href={`/${locale}/services`}
        className="mt-10 inline-block rounded-full bg-dj-accent-1 px-6 py-3 text-sm font-semibold text-dj-fond transition-opacity hover:opacity-90"
      >
        {VOIR_CATALOGUE[locale]}
      </Link>
    </article>
  );
}
