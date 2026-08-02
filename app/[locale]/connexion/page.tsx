import { getDictionary } from "@/lib/dictionaries";
import type { Locale } from "@/lib/site-config";
import { FormulaireConnexion } from "./FormulaireConnexion";

// Composant serveur (01/08, audit vitesse) : résout le dictionnaire ICI,
// où seule la langue demandée part dans le HTML -- FormulaireConnexion.tsx
// (client, formulaire interactif) le reçoit en prop plutôt que
// d'appeler getDictionary(locale) lui-même, ce qui embarquerait les DEUX
// langues dans le bundle JS envoyé au navigateur.
export default function PageConnexion({ params }: { params: { locale: Locale } }) {
  const { locale } = params;
  const dict = getDictionary(locale);
  return <FormulaireConnexion dict={dict} locale={locale} />;
}
