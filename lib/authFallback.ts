import { supabase } from "@/lib/supabase";
import type { AuthError, Session, User } from "@supabase/supabase-js";

export type TypeCompte = "utilisateur" | "createur";

export type IdentifiantsAuth = { email: string; password: string } | { phone: string; password: string };

export type ResultatAuth = {
  session: Session | null;
  user: User | null;
  error: AuthError | null;
};

/**
 * Même logique que côté app (djiguigne-frontend/lib/authFallback.ts) :
 * Supabase masque volontairement si un compte existe déjà (anti-énumération) :
 * signUp() sur un identifiant déjà utilisé ne renvoie pas d'erreur explicite,
 * juste une réponse sans session active. C'est le seul signal fiable pour
 * détecter "ce compte existe déjà".
 */

/**
 * Page inscription : crée le compte avec son type (utilisateur/créateur),
 * stocké dans les métadonnées Supabase Auth (user_metadata.type_compte).
 * Si le compte existe déjà, tente une connexion avec les mêmes identifiants
 * (le type_compte d'origine n'est alors pas modifié).
 */
export async function inscrireOuConnecter(
  identifiants: IdentifiantsAuth,
  typeCompte: TypeCompte
): Promise<ResultatAuth> {
  const { data, error } = await supabase.auth.signUp({
    ...identifiants,
    options: { data: { type_compte: typeCompte } },
  });

  if (error) return { session: null, user: null, error };
  if (data.session) return { session: data.session, user: data.user, error: null };

  // Pas d'erreur mais pas de session : le compte existe déjà. On retente en connexion.
  const resultat = await supabase.auth.signInWithPassword(identifiants);
  return { session: resultat.data.session, user: resultat.data.user, error: resultat.error };
}

/** Page connexion : si aucun compte n'existe, en crée un avec le type "utilisateur" par défaut. */
export async function connecterOuInscrire(identifiants: IdentifiantsAuth): Promise<ResultatAuth> {
  const resultatConnexion = await supabase.auth.signInWithPassword(identifiants);
  if (!resultatConnexion.error) {
    return {
      session: resultatConnexion.data.session,
      user: resultatConnexion.data.user,
      error: null,
    };
  }

  const resultatInscription = await supabase.auth.signUp({
    ...identifiants,
    options: { data: { type_compte: "utilisateur" satisfies TypeCompte } },
  });

  if (resultatInscription.error) {
    // Erreur de connexion d'origine, plus parlante pour la personne.
    return { session: null, user: null, error: resultatConnexion.error };
  }

  if (resultatInscription.data.session) {
    // Aucun compte n'existait : on vient d'en créer un, la personne est connectée.
    return { session: resultatInscription.data.session, user: resultatInscription.data.user, error: null };
  }

  // Un compte existait déjà (signUp n'a pas ouvert de session) : l'échec de
  // connexion d'origine était donc un vrai mauvais mot de passe.
  return { session: null, user: null, error: resultatConnexion.error };
}
