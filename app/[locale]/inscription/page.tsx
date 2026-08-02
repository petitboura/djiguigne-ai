import { getDictionary } from "@/lib/dictionaries";
import type { Locale } from "@/lib/site-config";
import { FormulaireInscription } from "./FormulaireInscription";

// Composant serveur (01/08, audit vitesse) : même principe que
// app/[locale]/connexion/page.tsx.
export default function PageInscription({ params }: { params: { locale: Locale } }) {
  const { locale } = params;
  const dict = getDictionary(locale);
  return <FormulaireInscription dict={dict} locale={locale} />;
}
