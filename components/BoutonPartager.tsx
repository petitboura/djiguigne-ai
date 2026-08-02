"use client";

import { useState } from "react";

// Demande de Bourama (2026-07-12) : un bouton "Partager" pour un agent ou
// un profil créateur, utilisable dans la page agent, le portfolio, et le
// dashboard. Sur mobile/navigateurs compatibles (navigator.share), ouvre
// le sélecteur natif de partage (SMS, WhatsApp, etc.) ; sinon, copie le
// lien dans le presse-papiers avec une confirmation visuelle "Copié !".
//
// `chemin` plutôt qu'une URL absolue : construite ici via
// `window.location.origin`, pour ne pas dépendre d'une variable d'env
// séparée juste pour ça (le composant tourne toujours côté client, donc
// `window` est toujours disponible).

// Prop texteCopie ajoutée le 02/08 (partage des articles de blog, bilingue
// fr/en) : optionnelle, valeur par défaut identique à avant -- les 3
// appelants existants (page agent, dashboard) n'ont rien à changer.

export function BoutonPartager({
  chemin,
  titre,
  libelle = "Partager",
  texteCopie = "Copié !",
}: {
  chemin: string;
  titre: string;
  libelle?: string;
  texteCopie?: string;
}) {
  const [copie, setCopie] = useState(false);

  async function partager() {
    const url = `${window.location.origin}${chemin}`;

    if (typeof navigator !== "undefined" && navigator.share) {
      try {
        await navigator.share({ title: titre, url });
      } catch {
        // Annulé par la personne ou échec silencieux du sélecteur natif
        // (ex: fermé sans choisir) -- pas une erreur à afficher, c'est un
        // flux normal du Web Share API.
      }
      return;
    }

    try {
      await navigator.clipboard.writeText(url);
      setCopie(true);
      setTimeout(() => setCopie(false), 2000);
    } catch {
      // Presse-papiers indisponible (permissions, contexte non sécurisé) :
      // repli le plus simple qui marche partout. Texte laissé en français
      // (chemin quasi jamais emprunté par un navigateur moderne) plutôt
      // que d'ajouter encore une prop pour ce cas limite.
      window.prompt("Copie ce lien :", url);
    }
  }

  return (
    <button
      type="button"
      onClick={partager}
      className="flex items-center gap-1.5 rounded-full border border-dj-bordure px-4 py-2 text-sm text-dj-texte transition-colors hover:border-dj-bordure-forte"
    >
      {copie ? texteCopie : libelle}
    </button>
  );
}
