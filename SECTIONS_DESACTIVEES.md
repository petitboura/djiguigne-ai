# Sections désactivées

Ce document recense les sections coupées de la navigation normale du site,
mais dont le code est conservé intact (rien n'est supprimé). Ne pas
réactiver une section listée ici sans l'accord explicite de Bourama.

---

## Établissements / Enseignant / Étudiant

- **Où se trouve le code aujourd'hui :**
  - `app/[locale]/etablissements/page.tsx` (page de présentation publique)
  - `app/[locale]/etablissements/inscription/page.tsx` (page du formulaire)
  - `components/InscriptionEtablissements.tsx` (logique du formulaire)
- **Date de désactivation :** 05/08/2026
- **Raison :** demande explicite de Bourama de couper l'accès normal à
  cette section (elle n'était de toute façon déjà reliée à aucun lien
  public dans le menu ou l'accueil).
- **État de l'URL directe :** volontairement laissée joignable
  (`/etablissements` et `/etablissements/inscription` fonctionnent
  toujours pour qui connaît l'adresse). Rien n'a été retiré du routage.
- **Lien externe conservé :** dans le dépôt `djiguigne-frontend` (l'app),
  un bouton réservé à Bourama (visible uniquement si son compte a le rôle
  admin) pointe toujours vers `/etablissements` de la vitrine. Ce lien a
  été conservé à sa demande — il n'est donc pas listé comme "à couper"
  ici, mais dépend de cette section désactivée.
- **Rappel :** ne pas réutiliser ni réactiver cette section tant que
  Bourama ne le demande pas explicitement.
- **Mise à jour du 06/08/2026 :** Bourama a explicitement demandé un
  lien vers `/etablissements` depuis la page Produit (7ème bouton
  "Pour les établissements" dans `SectionsProduit.tsx`, voir aussi
  `lib/dictionaries.ts` clé `services.sections.etablissement`). C'est
  la seule exception accordée : ce bouton mène vers la page, mais rien
  d'autre n'a été réactivé (toujours aucun lien dans le menu principal
  ni sur l'accueil). Le reste des règles ci-dessus reste valable.
