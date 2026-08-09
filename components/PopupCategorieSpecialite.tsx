"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";

// Ajouté le 08/08/2026 (Bourama : la section "Matière" affichait la liste
// complète de spécialités en permanence après création, alors que ça ne
// se choisit qu'une fois -- remplacée par ce bouton). Même logique de
// catégorie/spécialité que BoutonDevenirCreateur.tsx (popup "Devenir
// créateur"), mais pour CHANGER la catégorie d'un agent existant plutôt
// que d'en créer un : met à jour l'état du formulaire parent
// (dashboard/agents/[id]/modifier) au lieu de rediriger vers la création.
// La sauvegarde réelle (PATCH) se fait par le bouton "Enregistrer"
// existant du formulaire, pas ici -- ce composant ne fait que choisir la
// valeur.
export type CleSection = "matieres" | "metier" | "filiere" | "domaine" | "languesAfricaines" | "execution";

export const LABELS_CATEGORIE: Record<CleSection, string> = {
  matieres: "Matières",
  metier: "Métier",
  filiere: "Filière",
  domaine: "Domaine",
  languesAfricaines: "Langues africaines",
  execution: "Exécution",
};

type Etape = "ferme" | "categorie" | "matiere" | "champLibre";

export type SelectionCategorie =
  | { categorie: "matieres"; matiere: string; matiereDetail: string | null }
  | { categorie: Exclude<CleSection, "matieres">; valeur: string };

export function PopupCategorieSpecialite({
  labelActuel,
  matieresDisponibles,
  matiereActuelle,
  onValider,
}: {
  // Résumé affiché à côté du bouton, ex. "Matières — Informatique".
  labelActuel: string;
  matieresDisponibles: { nom: string; disponible: boolean }[] | null;
  // La matière actuelle de CET agent doit rester sélectionnable même si
  // /api/matieres la marque "prise" -- même règle que l'ancien picker.
  matiereActuelle: string | null;
  onValider: (selection: SelectionCategorie) => void;
}) {
  const [monte, setMonte] = useState(false);
  const [etape, setEtape] = useState<Etape>("ferme");
  const [categorieChoisie, setCategorieChoisie] = useState<Exclude<CleSection, "matieres"> | null>(null);
  const [valeurLibre, setValeurLibre] = useState("");
  const [autreMatiereActive, setAutreMatiereActive] = useState(false);
  const [autreMatiereTexte, setAutreMatiereTexte] = useState("");

  useEffect(() => setMonte(true), []);

  function fermer() {
    setEtape("ferme");
    setCategorieChoisie(null);
    setValeurLibre("");
    setAutreMatiereActive(false);
    setAutreMatiereTexte("");
  }

  function choisirCategorie(cle: CleSection) {
    if (cle === "matieres") {
      setEtape("matiere");
    } else {
      setCategorieChoisie(cle);
      setEtape("champLibre");
    }
  }

  function choisirMatiere(matiere: string) {
    if (matiere === "Autre" && !autreMatiereTexte.trim()) return;
    onValider({
      categorie: "matieres",
      matiere,
      matiereDetail: matiere === "Autre" ? autreMatiereTexte.trim() : null,
    });
    fermer();
  }

  function validerChampLibre() {
    if (!categorieChoisie || !valeurLibre.trim()) return;
    onValider({ categorie: categorieChoisie, valeur: valeurLibre.trim() });
    fermer();
  }

  return (
    <>
      <div className="flex flex-wrap items-center gap-3">
        <span className="text-sm text-dj-texte">{labelActuel}</span>
        <button
          type="button"
          onClick={() => setEtape("categorie")}
          className="rounded-lg border border-dj-bordure bg-dj-surface-haute px-3 py-1.5 text-xs font-semibold text-dj-texte transition-colors hover:border-dj-bordure-forte"
        >
          Changer de catégorie/spécialité
        </button>
      </div>

      {monte &&
        etape === "categorie" &&
        createPortal(
          <div
            className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 p-4"
            onClick={fermer}
          >
            <div
              className="w-full max-w-sm rounded-2xl border border-dj-bordure bg-dj-surface p-5 shadow-xl"
              onClick={(e) => e.stopPropagation()}
            >
              <h2 className="font-display text-lg font-bold text-dj-texte">Choisis une catégorie</h2>
              <div className="mt-4 flex flex-col gap-2">
                {(Object.keys(LABELS_CATEGORIE) as CleSection[]).map((cle) => (
                  <button
                    key={cle}
                    type="button"
                    onClick={() => choisirCategorie(cle)}
                    className="rounded-lg border border-dj-bordure bg-dj-surface-haute px-4 py-2.5 text-left text-sm text-dj-texte transition-colors hover:border-dj-bordure-forte"
                  >
                    {LABELS_CATEGORIE[cle]}
                  </button>
                ))}
              </div>
            </div>
          </div>,
          document.body
        )}

      {monte &&
        etape === "matiere" &&
        createPortal(
          <div
            className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 p-4"
            onClick={fermer}
          >
            <div
              className="w-full max-w-sm rounded-2xl border border-dj-bordure bg-dj-surface p-5 shadow-xl"
              onClick={(e) => e.stopPropagation()}
            >
              <h2 className="font-display text-lg font-bold text-dj-texte">{LABELS_CATEGORIE.matieres}</h2>
              {matieresDisponibles === null && (
                <p className="mt-3 text-sm text-dj-texte-muet">Chargement...</p>
              )}
              {!autreMatiereActive ? (
                <div className="mt-4 flex flex-col gap-2">
                  {matieresDisponibles
                    ?.filter((m) => m.disponible || m.nom === matiereActuelle)
                    .map(({ nom: m }) => (
                      <button
                        key={m}
                        type="button"
                        onClick={() => choisirMatiere(m)}
                        className="rounded-lg border border-dj-bordure bg-dj-surface-haute px-4 py-2.5 text-left text-sm text-dj-texte transition-colors hover:border-dj-bordure-forte"
                      >
                        {m}
                      </button>
                    ))}
                  <button
                    type="button"
                    onClick={() => setAutreMatiereActive(true)}
                    className="rounded-lg border border-dj-bordure bg-dj-surface-haute px-4 py-2.5 text-left text-sm text-dj-texte transition-colors hover:border-dj-bordure-forte"
                  >
                    Autre
                  </button>
                </div>
              ) : (
                <>
                  <input
                    type="text"
                    autoFocus
                    value={autreMatiereTexte}
                    onChange={(e) => setAutreMatiereTexte(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && choisirMatiere("Autre")}
                    placeholder="Précise la matière..."
                    className="mt-4 w-full rounded-lg border border-dj-bordure bg-dj-surface-haute px-4 py-2.5 text-sm text-dj-texte outline-none focus:border-dj-bordure-forte"
                  />
                  <div className="mt-5 flex justify-end">
                    <button
                      type="button"
                      onClick={() => choisirMatiere("Autre")}
                      disabled={!autreMatiereTexte.trim()}
                      className="rounded-xl bg-dj-gradient px-4 py-2 text-sm font-bold text-[#1A0D02] shadow-[0_2px_14px_rgba(217,99,31,0.25)] transition-transform hover:-translate-y-0.5 disabled:opacity-40"
                    >
                      Valider
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>,
          document.body
        )}

      {monte &&
        etape === "champLibre" &&
        categorieChoisie &&
        createPortal(
          <div
            className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 p-4"
            onClick={fermer}
          >
            <div
              className="w-full max-w-sm rounded-2xl border border-dj-bordure bg-dj-surface p-5 shadow-xl"
              onClick={(e) => e.stopPropagation()}
            >
              <h2 className="font-display text-lg font-bold text-dj-texte">
                {LABELS_CATEGORIE[categorieChoisie]}
              </h2>
              <input
                type="text"
                autoFocus
                value={valeurLibre}
                onChange={(e) => setValeurLibre(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && validerChampLibre()}
                placeholder={`Précise ${LABELS_CATEGORIE[categorieChoisie].toLowerCase()}...`}
                className="mt-4 w-full rounded-lg border border-dj-bordure bg-dj-surface-haute px-4 py-2.5 text-sm text-dj-texte outline-none focus:border-dj-bordure-forte"
              />
              <div className="mt-5 flex justify-end">
                <button
                  type="button"
                  onClick={validerChampLibre}
                  disabled={!valeurLibre.trim()}
                  className="rounded-xl bg-dj-gradient px-4 py-2 text-sm font-bold text-[#1A0D02] shadow-[0_2px_14px_rgba(217,99,31,0.25)] transition-transform hover:-translate-y-0.5 disabled:opacity-40"
                >
                  Valider
                </button>
              </div>
            </div>
          </div>,
          document.body
        )}
    </>
  );
}
