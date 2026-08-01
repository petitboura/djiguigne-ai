import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { getDictionary } from "@/lib/dictionaries";
import type { Locale } from "@/lib/site-config";
import { JsonLd } from "@/components/JsonLd";
import { BoutonDevenirCreateur } from "@/components/BoutonDevenirCreateur";
import { RubanAgents } from "@/components/RubanAgents";

export function generateMetadata({ params }: { params: { locale: Locale } }): Metadata {
  const dict = getDictionary(params.locale);
  return {
    title: dict.home.heroTitle,
    description: dict.home.heroSubtitle,
    alternates: { canonical: `/${params.locale}` },
  };
}

// Ce que voit un VISITEUR (pas un créateur) : comment trouver et utiliser
// une IA. Remplace l'ancienne version qui décrivait le formulaire de
// création (Identité/Comportement/Outils/...) — hors-sujet ici depuis que
// "Devenir créateur" a son propre flow d'explication dédié (Bourama,
// 2026-07-27 : "c'est plus la création" sur cette page).
const STEPS: Record<Locale, { title: string; body: string }[]> = {
  fr: [
    { title: "Choisis une matière", body: "Maths, code, langues, coaching... filtre les IA par domaine." },
    { title: "Trouve ton IA", body: "Regarde son profil, sa description, ce qu'elle sait faire." },
    { title: "Discute avec elle", body: "Directement dans le chat, sans rien installer ni configurer." },
  ],
  en: [
    { title: "Pick a subject", body: "Math, code, languages, coaching... filter AIs by domain." },
    { title: "Find your AI", body: "Check its profile, description, and what it can do." },
    { title: "Start chatting", body: "Right in the chat, nothing to install or configure." },
  ],
};

export default function HomePage({ params }: { params: { locale: Locale } }) {
  const { locale } = params;
  const dict = getDictionary(locale);
  const steps = STEPS[locale];

  return (
    <>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "FAQPage",
          mainEntity: dict.home.faq.map((f) => ({
            "@type": "Question",
            name: f.q,
            acceptedAnswer: { "@type": "Answer", text: f.a },
          })),
        }}
      />

      {/* --- Hero : signature visuelle = logo + halo pulsant + anneau
          orbital, reprise à l'identique du thème Streamlit. --- */}
      <section className="mx-auto flex max-w-3xl flex-col items-center px-5 pb-16 pt-14 text-center sm:pt-20">
        <div
          className="relative mb-8 flex items-center justify-center animate-dj-fade-in"
          style={{ width: 202, height: 202 }}
        >
          <div
            className="absolute rounded-full bg-[radial-gradient(circle,rgba(232,147,74,0.35)_0%,transparent_70%)] animate-dj-glow"
            style={{ width: 192, height: 192 }}
          />
          <div
            className="absolute rounded-full border border-dashed border-dj-accent-1/30 animate-dj-orbit"
            style={{ width: 172, height: 172 }}
          >
            <span
              className="absolute -top-1 left-1/2 h-2 w-2 -translate-x-1/2 rounded-full bg-dj-accent-1 shadow-[0_0_10px_2px_rgba(232,147,74,0.7)]"
              aria-hidden
            />
          </div>
          <Image
            src="/logo.png"
            alt="Djiguignè AI"
            width={132}
            height={132}
            priority
            className="relative z-10 drop-shadow-[0_8px_24px_rgba(0,0,0,0.5)]"
          />
        </div>

        <p className="mb-4 font-mono text-xs uppercase tracking-[0.2em] text-dj-accent-1 animate-dj-fade-up">
          {dict.home.heroKicker}
        </p>
        <h1
          className="font-display text-4xl font-extrabold tracking-tight text-dj-texte animate-dj-fade-up sm:text-5xl"
          style={{ animationDelay: "0.1s" }}
        >
          {dict.home.heroTitle}
        </h1>
        <p
          className="mt-5 max-w-xl text-balance text-lg text-dj-texte-muet animate-dj-fade-up"
          style={{ animationDelay: "0.2s" }}
        >
          {dict.home.heroSubtitle}
        </p>

        <RubanAgents />

        <div
          className="mt-8 flex flex-col gap-3 animate-dj-fade-up sm:flex-row"
          style={{ animationDelay: "0.3s" }}
        >
          <Link
            href={`/${locale}/services`}
            className="rounded-full bg-dj-gradient px-6 py-3 text-sm font-bold text-[#1A0D02] shadow-[0_2px_14px_rgba(217,99,31,0.25)] transition-transform hover:-translate-y-0.5"
          >
            {dict.home.heroCta}
          </Link>
          <BoutonDevenirCreateur
            label={dict.home.heroCtaSecondary}
            explicationTitre={dict.home.heroCtaExplicationTitre}
            explicationCorps={dict.home.heroCtaExplicationCorps}
            continuerLabel={dict.home.heroCtaExplicationContinuer}
            annulerLabel={dict.home.heroCtaExplicationAnnuler}
            categorieTitre={dict.home.heroCtaCategorieTitre}
            categorieLabels={dict.services.sections}
            champLibrePlaceholder={dict.home.heroCtaChampLibrePlaceholder}
            validerLabel={dict.home.heroCtaValider}
          />
        </div>
      </section>

      {/* --- Ce que fait la plateforme --- */}
      <section className="mx-auto max-w-3xl px-5 py-14 text-center">
        <h2 className="font-display text-2xl font-bold text-dj-texte sm:text-3xl">
          {dict.home.sectionWhatTitle}
        </h2>
        <p className="mx-auto mt-4 max-w-2xl text-dj-texte-muet">{dict.home.sectionWhatBody}</p>
      </section>

      {/* --- Process en 3 étapes (côté visiteur) : vraie séquence ->
          numérotation justifiée (voir skill frontend-design). --- */}
      <section className="mx-auto max-w-4xl px-5 py-10">
        <ol className="grid gap-4 sm:grid-cols-3">
          {steps.map((step, i) => (
            <li
              key={step.title}
              className="animate-dj-fade-up rounded-2xl border border-dj-bordure bg-dj-surface p-5 transition-colors hover:border-dj-bordure-forte"
              style={{ animationDelay: `${0.1 * i}s` }}
            >
              <span className="font-mono text-xs text-dj-accent-1">{String(i + 1).padStart(2, "0")}</span>
              <h3 className="mt-2 font-display text-base font-bold text-dj-texte">{step.title}</h3>
              <p className="mt-1.5 text-sm text-dj-texte-muet">{step.body}</p>
            </li>
          ))}
        </ol>
      </section>

      {/* --- FAQ --- */}
      <section className="mx-auto max-w-2xl px-5 py-14">
        <h2 className="mb-6 font-display text-2xl font-bold text-dj-texte">{dict.home.faqTitle}</h2>
        <div className="flex flex-col gap-3">
          {dict.home.faq.map((item) => (
            <details
              key={item.q}
              className="group rounded-xl border border-dj-bordure bg-dj-surface p-4 open:border-dj-bordure-forte"
            >
              <summary className="cursor-pointer list-none font-display text-sm font-semibold text-dj-texte marker:content-none">
                <span className="flex items-center justify-between gap-3">
                  {item.q}
                  <span className="text-dj-accent-1 transition-transform group-open:rotate-45">+</span>
                </span>
              </summary>
              <p className="mt-3 text-sm text-dj-texte-muet">{item.a}</p>
            </details>
          ))}
        </div>
      </section>
    </>
  );
}
