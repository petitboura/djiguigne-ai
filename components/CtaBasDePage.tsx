import Link from "next/link";
import type { Locale } from "@/lib/site-config";
import type { getDictionary } from "@/lib/dictionaries";
import { BoutonDevenirCreateur } from "@/components/BoutonDevenirCreateur";

type Dictionary = ReturnType<typeof getDictionary>;

// Demande de Bourama (2026-07-27) : les deux CTA du hero (Explorer les
// IA / Devenir créateur) réapparaissent tout en bas de CHAQUE page (au-
// dessus du footer, dans le layout [locale]), pour l'utilisateur qui
// scrolle jusqu'au bout sans avoir cliqué plus haut.
export function CtaBasDePage({ locale, dict }: { locale: Locale; dict: Dictionary }) {
  return (
    <div className="flex flex-col items-center gap-3 border-t border-dj-bordure px-5 py-14 sm:flex-row sm:justify-center">
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
  );
}
