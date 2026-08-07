"use client";

import { siteConfig } from "@/lib/site-config";
import { construireUrlApp } from "@/lib/lienApp";

// Correctif du 07/08/2026 (voir lib/lienApp.ts pour le détail du bug) --
// remplace les <a href={`${siteConfig.appUrl}/...`}> simples utilisés
// jusqu'ici pour tout lien de la vitrine vers l'app produit. Garde un
// href statique (accessibilité, clic droit "ouvrir dans un nouvel
// onglet", cas sans JS) qui pointe vers l'app SANS jeton, et intercepte
// le clic gauche normal pour reconstruire l'URL avec la session -- seul
// cas qu'on peut effectivement contrôler par JS avant navigation.
export function LienVersApp({
  chemin,
  nouvelOnglet = false,
  className,
  children,
  onAvantNavigation,
}: {
  chemin: string;
  nouvelOnglet?: boolean;
  className?: string;
  children: React.ReactNode;
  // Appelé juste avant la navigation (clic gauche normal uniquement) --
  // ex: marquer une notification comme ouverte (NotificationsCloche.tsx).
  onAvantNavigation?: () => void;
}) {
  async function gererClic(e: React.MouseEvent<HTMLAnchorElement>) {
    // Laisse le navigateur gérer lui-même les clics du milieu, ctrl/cmd+clic
    // etc. (ouverture dans un nouvel onglet) -- on ne peut de toute façon
    // pas y attacher le jeton sans JS, autant garder le comportement natif.
    if (e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
    e.preventDefault();
    onAvantNavigation?.();
    const url = await construireUrlApp(chemin);
    if (nouvelOnglet) {
      window.open(url, "_blank", "noopener,noreferrer");
    } else {
      window.location.href = url;
    }
  }

  return (
    <a
      href={`${siteConfig.appUrl}${chemin}`}
      onClick={gererClic}
      className={className}
      {...(nouvelOnglet ? { target: "_blank", rel: "noopener noreferrer" } : {})}
    >
      {children}
    </a>
  );
}
