// Noms "embellis" + descriptions courtes pour l'écran "Droits de l'agent"
// (DroitsAgent.tsx en édition, DroitsAgentCreation.tsx en création).
// Demande de Bourama (05/08/2026) : les cases à cocher affichaient les
// noms de code bruts des outils (generer_document, serveur_tavily...),
// sans description, et mélangeaient des outils de natures différentes
// (clé partagée par la plateforme vs compte personnel du créateur) dans
// un seul bloc "Outils externes".
//
// Contenu volontairement en dur ici plutôt que dans lib/dictionaries.ts :
// l'écran "Droits de l'agent" fait partie du dashboard (app/dashboard/...,
// HORS du routage [locale]), qui est français uniquement partout ailleurs
// dans ce fichier -- pas de prop locale disponible ici, contrairement aux
// pages vitrine. Si le dashboard devient multilingue un jour, ce fichier
// devra être adapté au même moment.
//
// Sources des descriptions : docstrings réelles des outils côté backend
// (core/serveur_mcp_generation.py, core/serveur_mcp_github.py,
// core/registre_outils.py) au 05/08/2026 -- pas inventées.
//
// Un outil renvoyé par l'API mais absent d'ici (nouvel outil ajouté côté
// plateforme, registre_outils_plateforme) n'est PAS perdu : il retombe
// dans le groupe "Autres" ajouté automatiquement par les composants, avec
// son nom de code brut. Penser à compléter ce fichier quand Bourama
// ajoute un nouvel outil.

export type OutilInfo = {
  nom: string; // doit correspondre à nom_outil (génération) ou nom_serveur (serveurs)
  label: string;
  description: string;
};

export type GroupeOutils = {
  titre: string;
  outils: OutilInfo[];
};

export const GROUPES_GENERATION: GroupeOutils[] = [
  {
    titre: "Documents",
    outils: [
      { nom: "generer_document", label: "Document PDF", description: "Crée un PDF à partir d'un titre et d'un texte." },
      { nom: "generer_document_word", label: "Document Word", description: "Crée un fichier Word (.docx)." },
      { nom: "generer_document_excel", label: "Classeur Excel", description: "Crée un fichier Excel avec colonnes et lignes." },
      { nom: "generer_document_powerpoint", label: "Présentation PowerPoint", description: "Crée un diaporama (.pptx)." },
      { nom: "generer_document_latex", label: "Fichier LaTeX", description: "Crée un fichier source LaTeX, réutilisable dans un éditeur comme Overleaf." },
      { nom: "envoyer_pour_signature", label: "Envoi pour signature", description: "Envoie un PDF à signer électroniquement par email." },
      { nom: "consulter_statut_signature", label: "Suivi de signature", description: "Vérifie où en est une demande de signature envoyée." },
    ],
  },
  {
    titre: "Code & site web",
    outils: [
      { nom: "generer_code", label: "Fichier de code", description: "Crée un ou plusieurs fichiers de code à télécharger." },
      { nom: "generer_site_zip", label: "Site en téléchargement", description: "Crée le code d'un site web à héberger ailleurs." },
      { nom: "deployer_site", label: "Mise en ligne de site", description: "Publie un site web avec un lien accessible immédiatement." },
    ],
  },
  {
    titre: "Images, audio, vidéo, 3D",
    outils: [
      { nom: "generer_image", label: "Génération d'image", description: "Crée une image à partir d'une description." },
      { nom: "generer_audio", label: "Génération audio", description: "Transforme un texte en voix parlée." },
      { nom: "lancer_generation_video", label: "Génération vidéo", description: "Crée une courte vidéo (1 à 3 min de traitement)." },
      { nom: "consulter_statut_video", label: "Suivi vidéo", description: "Vérifie si une vidéo lancée est prête." },
      { nom: "lancer_generation_3d", label: "Génération 3D", description: "Crée un modèle 3D à partir d'une description." },
      { nom: "consulter_statut_3d", label: "Suivi 3D", description: "Vérifie si un modèle 3D lancé est prêt." },
    ],
  },
  {
    titre: "Données & fichiers",
    outils: [
      { nom: "exporter_donnees", label: "Export de données", description: "Enregistre des données dans un fichier JSON ou XML." },
      { nom: "generer_bundle", label: "Regroupement de fichiers", description: "Rassemble plusieurs fichiers déjà créés dans une seule archive." },
      { nom: "chercher_fichier", label: "Recherche de fichier", description: "Retrouve un fichier déjà envoyé (photo, PDF, audio, vidéo…)." },
    ],
  },
  {
    titre: "Autres",
    outils: [
      { nom: "calculer_symbolique", label: "Calcul mathématique exact", description: "Résout, simplifie, dérive ou intègre une expression (résultat exact, pas une approximation)." },
      { nom: "planifier_rappel", label: "Rappel programmé", description: "Programme une notification à envoyer plus tard à l'utilisateur." },
      { nom: "envoyer_message", label: "Message interne", description: "Envoie un message à une personne autorisée (établissement, enseignant, étudiant)." },
    ],
  },
];

// Croise une liste d'outils venue de l'API (registre_outils_plateforme)
// avec un groupement configuré ci-dessus. `cle` extrait la valeur qui
// sert de correspondance (nom_outil pour la génération, nom_serveur pour
// les serveurs). Tout élément renvoyé par l'API mais absent de la config
// atterrit dans un groupe "Nouveaux outils" ajouté à la fin, avec son nom
// de code brut en guise de libellé -- jamais silencieusement ignoré.
export function regrouperOutils<T>(
  items: T[],
  groupes: GroupeOutils[],
  cle: (item: T) => string
): { titre: string; items: { outil: OutilInfo; item: T }[] }[] {
  const parCle = new Map(items.map((item) => [cle(item), item]));
  const utilises = new Set<string>();

  const resultat = groupes
    .map((groupe) => ({
      titre: groupe.titre,
      items: groupe.outils
        .filter((o) => parCle.has(o.nom))
        .map((o) => {
          utilises.add(o.nom);
          return { outil: o, item: parCle.get(o.nom) as T };
        }),
    }))
    .filter((g) => g.items.length > 0);

  const restants = items.filter((item) => !utilises.has(cle(item)));
  if (restants.length > 0) {
    resultat.push({
      titre: "Nouveaux outils",
      items: restants.map((item) => {
        const nom = cle(item);
        return { outil: { nom, label: nom, description: "" }, item };
      }),
    });
  }

  return resultat;
}

export const GROUPES_SERVEURS: GroupeOutils[] = [
  {
    titre: "Intégré à la plateforme",
    outils: [
      { nom: "wolfram", label: "Wolfram (calcul & sciences)", description: "Répond aux questions de calcul et de connaissances scientifiques. Gratuit, une question à la fois." },
      { nom: "tavily", label: "Recherche web", description: "Cherche des informations à jour sur internet." },
    ],
  },
  {
    titre: "Fonctionne avec ou sans compte",
    outils: [
      { nom: "github", label: "GitHub", description: "Explore et lit un dépôt GitHub. Fonctionne sans compte pour les dépôts publics ; connecter son propre compte donne aussi accès aux dépôts privés. Toute modification demande une confirmation." },
    ],
  },
  {
    titre: "Nécessite un compte",
    outils: [
      { nom: "notion", label: "Notion", description: "Recherche, crée et modifie des pages dans l'espace Notion connecté par le créateur." },
    ],
  },
];
