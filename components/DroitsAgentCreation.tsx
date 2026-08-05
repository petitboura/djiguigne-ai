"use client";

import { useEffect, useState } from "react";
import { lireRegistreOutils } from "@/lib/api";
import { GROUPES_GENERATION, GROUPES_SERVEURS, regrouperOutils } from "@/lib/droits-agent-info";

// Variante de DroitsAgent.tsx pour le formulaire de CRÉATION : l'agent
// n'existe pas encore, donc pas d'agentId, pas de lecture "coche" déjà
// enregistrée, pas d'appel PATCH. Ce composant se contente de proposer
// les cases (toujours depuis registre_outils_plateforme en direct) et
// de faire remonter la sélection au formulaire parent via onChange, qui
// l'inclut dans le payload de POST /api/agents (outils_generation_choisis,
// serveurs_choisis) -- même création, même requête, comme tous les
// autres champs du formulaire.

type OutilPlateforme = {
  nom_outil: string;
  categorie: number;
  nom_serveur: string;
  disponible: boolean;
};

export function DroitsAgentCreation({
  onChange,
}: {
  onChange: (droits: { outilsGeneration: string[]; serveurs: string[] }) => void;
}) {
  const [registre, setRegistre] = useState<{ generation: OutilPlateforme[]; serveurs: OutilPlateforme[] } | null>(
    null
  );
  const [genererCoches, setGenererCoches] = useState<Set<string>>(new Set());
  const [serveursCoches, setServeursCoches] = useState<Set<string>>(new Set());
  const [erreur, setErreur] = useState<string | null>(null);

  useEffect(() => {
    lireRegistreOutils()
      .then(setRegistre)
      .catch((e) => setErreur(e.message || "Impossible de charger les outils disponibles."));
  }, []);

  useEffect(() => {
    onChange({ outilsGeneration: Array.from(genererCoches), serveurs: Array.from(serveursCoches) });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [genererCoches, serveursCoches]);

  function basculerGeneration(nomOutil: string) {
    setGenererCoches((precedent) => {
      const suivant = new Set(precedent);
      if (suivant.has(nomOutil)) suivant.delete(nomOutil);
      else suivant.add(nomOutil);
      return suivant;
    });
  }

  function basculerServeur(nomServeur: string) {
    setServeursCoches((precedent) => {
      const suivant = new Set(precedent);
      if (suivant.has(nomServeur)) suivant.delete(nomServeur);
      else suivant.add(nomServeur);
      return suivant;
    });
  }

  if (erreur) return <p className="text-sm text-red-500">{erreur}</p>;
  if (!registre) return <p className="text-sm text-dj-texte-muet">Chargement des droits…</p>;

  const serveursParNom = new Map<string, OutilPlateforme>();
  for (const s of registre.serveurs) serveursParNom.set(s.nom_serveur, s);

  const groupesGeneration = regrouperOutils(registre.generation, GROUPES_GENERATION, (o) => o.nom_outil);
  const groupesServeurs = regrouperOutils(
    Array.from(serveursParNom.values()),
    GROUPES_SERVEURS,
    (s) => s.nom_serveur
  );

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <h3 className="text-sm font-semibold text-dj-texte">Génération</h3>
        {groupesGeneration.map((groupe) => (
          <div key={groupe.titre}>
            <h4 className="mb-1.5 text-xs font-semibold uppercase tracking-wide text-dj-texte-muet">
              {groupe.titre}
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {groupe.items.map(({ outil, item }) => (
                <label
                  key={item.nom_outil}
                  className={`flex items-start gap-2 text-sm text-dj-texte ${!item.disponible ? "opacity-40" : ""}`}
                >
                  <input
                    type="checkbox"
                    className="mt-0.5"
                    disabled={!item.disponible}
                    checked={genererCoches.has(item.nom_outil)}
                    onChange={() => basculerGeneration(item.nom_outil)}
                  />
                  <span>
                    <span className="block font-medium">
                      {outil.label}
                      {!item.disponible && <span className="ml-1 text-xs text-dj-texte-muet">(indisponible)</span>}
                    </span>
                    {outil.description && (
                      <span className="block text-xs text-dj-texte-muet">{outil.description}</span>
                    )}
                  </span>
                </label>
              ))}
            </div>
          </div>
        ))}
      </div>

      <div className="space-y-4">
        <h3 className="text-sm font-semibold text-dj-texte">Outils externes</h3>
        {groupesServeurs.map((groupe) => (
          <div key={groupe.titre}>
            <h4 className="mb-1.5 text-xs font-semibold uppercase tracking-wide text-dj-texte-muet">
              {groupe.titre}
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {groupe.items.map(({ outil, item }) => (
                <label
                  key={item.nom_serveur}
                  className={`flex items-start gap-2 text-sm text-dj-texte ${!item.disponible ? "opacity-40" : ""}`}
                >
                  <input
                    type="checkbox"
                    className="mt-0.5"
                    disabled={!item.disponible}
                    checked={serveursCoches.has(item.nom_serveur)}
                    onChange={() => basculerServeur(item.nom_serveur)}
                  />
                  <span>
                    <span className="block font-medium">
                      {outil.label}
                      {!item.disponible && <span className="ml-1 text-xs text-dj-texte-muet">(indisponible)</span>}
                    </span>
                    {outil.description && (
                      <span className="block text-xs text-dj-texte-muet">{outil.description}</span>
                    )}
                  </span>
                </label>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
