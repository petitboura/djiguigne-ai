import type { Metadata } from "next";
import Link from "next/link";
import { getDictionary } from "@/lib/dictionaries";
import { siteConfig, type Locale } from "@/lib/site-config";
import { JsonLd } from "@/components/JsonLd";

// Ajouté le 04/08 (Bourama) : espace dédié aux établissements scolaires,
// distinct du parcours créateur. Consomme la hiérarchie de rôles côté
// backend (voir api/roles.py) au moment de l'inscription, pas ici --
// cette page ne fait que présenter le principe et renvoyer vers
// /etablissements/inscription.

export function generateMetadata({ params }: { params: { locale: Locale } }): Metadata {
  const dict = getDictionary(params.locale);
  return {
    title: dict.etablissements.landing.title,
    description: dict.etablissements.landing.subtitle,
    alternates: { canonical: `/${params.locale}/etablissements` },
  };
}

export default function EtablissementsPage({ params }: { params: { locale: Locale } }) {
  const { locale } = params;
  const dict = getDictionary(locale);
  const t = dict.etablissements.landing;

  const roles = [
    { titre: t.roleEtablissementTitle, desc: t.roleEtablissementDesc },
    { titre: t.roleEnseignantTitle, desc: t.roleEnseignantDesc },
    { titre: t.roleEtudiantTitle, desc: t.roleEtudiantDesc },
  ];

  return (
    <>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "Service",
          name: t.title,
          description: t.subtitle,
          provider: { "@type": "Organization", name: siteConfig.brandName },
        }}
      />

      <section className="mx-auto max-w-3xl px-5 py-16 text-center">
        <p className="animate-dj-fade-up font-mono text-xs uppercase tracking-[0.2em] text-dj-accent-1">
          {t.kicker}
        </p>
        <h1
          className="mt-3 animate-dj-fade-up font-display text-3xl font-extrabold text-dj-texte sm:text-4xl"
          style={{ animationDelay: "0.08s" }}
        >
          {t.title}
        </h1>
        <p
          className="mx-auto mt-4 max-w-xl animate-dj-fade-up text-lg text-dj-texte-muet"
          style={{ animationDelay: "0.16s" }}
        >
          {t.subtitle}
        </p>

        {/* Signature visuelle : la hiérarchie établissement -> enseignant ->
            étudiant, littéralement, puisque c'est le principe même de la
            fonctionnalité (voir ROLES_VALIDES côté backend). */}
        <div
          className="mx-auto mt-14 flex max-w-lg animate-dj-fade-up flex-col items-center"
          style={{ animationDelay: "0.24s" }}
        >
          {[t.hierarchyEtablissement, t.hierarchyEnseignant, t.hierarchyEtudiant].map((label, i) => (
            <div key={label} className="flex flex-col items-center">
              <div
                className={`rounded-full border px-6 py-3 font-display text-sm font-bold ${
                  i === 0
                    ? "border-dj-accent-1 bg-dj-gradient text-[#1A0D02]"
                    : "border-dj-bordure bg-dj-surface text-dj-texte"
                }`}
                style={{ width: `${220 - i * 40}px` }}
              >
                {label}
              </div>
              {i < 2 && (
                <svg width="2" height="32" viewBox="0 0 2 32" className="text-dj-bordure-forte">
                  <line x1="1" y1="0" x2="1" y2="32" stroke="currentColor" strokeWidth="2" strokeDasharray="1 5" strokeLinecap="round" />
                </svg>
              )}
            </div>
          ))}
        </div>

        <Link
          href={`/${locale}/etablissements/inscription`}
          className="mt-14 inline-block animate-dj-fade-up rounded-full bg-dj-gradient px-8 py-3 text-sm font-bold text-[#1A0D02] shadow-[0_2px_14px_rgba(217,99,31,0.25)] transition-transform hover:-translate-y-0.5"
          style={{ animationDelay: "0.32s" }}
        >
          {t.cta}
        </Link>
      </section>

      <section className="mx-auto grid max-w-4xl gap-4 px-5 pb-20 sm:grid-cols-3">
        {roles.map((r, i) => (
          <div
            key={r.titre}
            className="animate-dj-fade-up rounded-2xl border border-dj-bordure bg-dj-surface p-6"
            style={{ animationDelay: `${0.4 + i * 0.08}s` }}
          >
            <h2 className="font-display text-lg font-bold text-dj-accent-1">{r.titre}</h2>
            <p className="mt-2 text-sm text-dj-texte-muet">{r.desc}</p>
          </div>
        ))}
      </section>
    </>
  );
}
