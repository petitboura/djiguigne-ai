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
