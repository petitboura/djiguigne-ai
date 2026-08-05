// DÉSACTIVÉ — 05/08/2026
// Ne pas réutiliser ni réactiver tant que ce n'est pas demandé explicitement.
// Raison : demande de Bourama de couper la section Établissements de la
// navigation normale, en gardant l'URL directe joignable pour qui la
// connaît. Voir SECTIONS_DESACTIVEES.md à la racine du dépôt.

import type { Metadata } from "next";
import { getDictionary } from "@/lib/dictionaries";
import type { Locale } from "@/lib/site-config";
import { InscriptionEtablissements } from "@/components/InscriptionEtablissements";

export function generateMetadata({ params }: { params: { locale: Locale } }): Metadata {
  const dict = getDictionary(params.locale);
  return {
    title: dict.etablissements.inscription.stepRoleTitle,
    alternates: { canonical: `/${params.locale}/etablissements/inscription` },
  };
}

export default function InscriptionEtablissementsPage({ params }: { params: { locale: Locale } }) {
  const dict = getDictionary(params.locale);
  return <InscriptionEtablissements dict={dict} locale={params.locale} />;
}
