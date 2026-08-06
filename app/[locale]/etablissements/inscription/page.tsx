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

// ?role= (06/08, Bourama) : présélection du rôle quand on arrive depuis
// une des 3 cartes cliquables de /etablissements (voir page.tsx). Ignoré
// si absent ou invalide -- on retombe sur l'étape "role" normale.
const ROLES_VALIDES = new Set(["etablissement", "enseignant", "etudiant"]);

export default function InscriptionEtablissementsPage({
  params,
  searchParams,
}: {
  params: { locale: Locale };
  searchParams: { role?: string };
}) {
  const dict = getDictionary(params.locale);
  const roleInitial = ROLES_VALIDES.has(searchParams.role ?? "")
    ? (searchParams.role as "etablissement" | "enseignant" | "etudiant")
    : null;
  return <InscriptionEtablissements dict={dict} locale={params.locale} roleInitial={roleInitial} />;
}
