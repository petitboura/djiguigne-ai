import { supabase } from "@/lib/supabase";
import { siteConfig } from "@/lib/site-config";

// Correctif du 07/08/2026 (bug remonté par Bourama : "je me connecte depuis
// la vitrine, je suis envoyé dans l'app, ma connexion n'est pas
// transférée"). Cause : djiguigne-ai et djiguigne-frontend sont deux
// domaines Vercel distincts (voir siteConfig.appUrl) ; Supabase stocke la
// session dans le localStorage, isolé par domaine. Une simple redirection
// HTTP (window.location.href / <a href>) ne transporte donc aucun jeton --
// l'app arrive déconnectée même si la vitrine était connectée.
//
// Ce helper récupère la session active côté vitrine et l'attache dans le
// HASH de l'URL cible (#access_token=...&refresh_token=...), jamais en
// query : le hash n'est jamais envoyé au serveur (ni logs Vercel, ni
// Referer), donc les jetons ne transitent qu'entre les deux navigateurs
// via l'URL locale. Voir djiguigne-frontend/components/SessionSyncVitrine.tsx
// pour la réception et le nettoyage de ce hash côté app.
export async function construireUrlApp(chemin: string): Promise<string> {
  // Certains liens (ex: NotificationsCloche.tsx, "voir la mise à jour")
  // portent déjà une ancre native (#mises-a-jour, #maj-xxx) pour que le
  // navigateur défile jusqu'à la bonne section sur la page fiche de
  // l'app. Une URL n'a qu'un seul hash possible -- on l'extrait donc ici
  // pour la fusionner avec les jetons de session sous une clé dédiée
  // (`ancre`), plutôt que de la perdre. Voir SessionSyncVitrine.tsx côté
  // app pour la restauration de cette ancre après consommation des jetons.
  const [chemainSansAncre, ancre] = chemin.split("#");
  const base = `${siteConfig.appUrl}${chemainSansAncre}`;

  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session) return ancre ? `${base}#${ancre}` : base;

  const jeton = new URLSearchParams({
    access_token: session.access_token,
    refresh_token: session.refresh_token,
    ...(ancre ? { ancre } : {}),
  });

  return `${base}#${jeton.toString()}`;
}
