"use client";

import { useEffect, useState } from "react";
import { lireDroitsAgent, modifierDroitsAgent } from "@/lib/api";
import { GROUPES_GENERATION, GROUPES_SERVEURS, GROUPES_ACTIONS_LOCALES, regrouperOutils } from "@/lib/droits-agent-info";
import { Skeleton } from "@/components/Skeleton";

// Formulaire des droits d'un agent -- categories 1 (generation, par
// outil), 2 et 3 (serveur externe, par serveur entier), et 4
// (actions_locales -- boutons UI du chat, ex. clavier LaTeX/formule,
// position, mode vocal ; ajoutee le 08/08/2026, meme donnee que
// BarreDeSaisie.tsx cote chat). Voir api/droits_agent.py cote backend et
// migration_droits_agents.sql pour le schema. Categorie 5 (connexion
// OAuth de la plateforme) pas couverte ici, a construire separement sur
// le meme pattern que connexions/notion.py.
//
// Principe important : les cases proposees viennent TOUJOURS de
// registre_outils_plateforme en direct (jamais une liste figee ici) --
// un outil retire cote plateforme disparait automatiquement du
// formulaire au prochain chargement, sans rien a changer dans ce
// fichier.

type OutilPlateforme = {
  nom_outil: string;
  categorie: number;
  nom_serveur: string;
  disponible: boolean;
  coche: boolean;
};

type DroitsAgentReponse = {
  generation: OutilPlateforme[];
  serveurs: OutilPlateforme[];
  actions_locales: OutilPlateforme[];
};

export function DroitsAgent({ agentId }: { agentId: string }) {
  const [droits, setDroits] = useState<DroitsAgentReponse | null>(null);
  const [genererCoches, setGenererCoches] = useState<Set<string>>(new Set());
  const [serveursCoches, setServeursCoches] = useState<Set<string>>(new Set());
  const [localesCoches, setLocalesCoches] = useState<Set<string>>(new Set());
  const [informerUtilisateurs, setInformerUtilisateurs] = useState(true);
  const [enregistrement, setEnregistrement] = useState(false);
  const [erreur, setErreur] = useState<string | null>(null);
  const [messageSucces, setMessageSucces] = useState<string | null>(null);

  useEffect(() => {
    lireDroitsAgent(agentId)
      .then((reponse: DroitsAgentReponse) => {
        setDroits(reponse);
        setGenererCoches(new Set(reponse.generation.filter((o) => o.coche).map((o) => o.nom_outil)));
        setServeursCoches(new Set(reponse.serveurs.filter((o) => o.coche).map((o) => o.nom_serveur)));
        setLocalesCoches(new Set(reponse.actions_locales.filter((o) => o.coche).map((o) => o.nom_outil)));
      })
      .catch((e) => setErreur(e.message || "Impossible de charger les droits de cet agent."));
  }, [agentId]);

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

  function basculerLocale(nomAction: string) {
    setLocalesCoches((precedent) => {
      const suivant = new Set(precedent);
      if (suivant.has(nomAction)) suivant.delete(nomAction);
      else suivant.add(nomAction);
      return suivant;
    });
  }

  async function enregistrer() {
    setEnregistrement(true);
    setErreur(null);
    setMessageSucces(null);
    try {
      const resultat = await modifierDroitsAgent(agentId, {
        outils_generation: Array.from(genererCoches),
        serveurs: Array.from(serveursCoches),
        actions_locales: Array.from(localesCoches),
        informer_utilisateurs: informerUtilisateurs,
      });
      setMessageSucces(
        resultat?.a_change
          ? "Droits enregistrés. Tes utilisateurs ont été informés du changement."
          : "Droits enregistrés (aucun changement détecté)."
      );
    } catch (e: any) {
      setErreur(e.message || "Impossible d'enregistrer les droits pour le moment.");
    } finally {
      setEnregistrement(false);
    }
  }

  if (erreur && !droits) {
    return <p className="text-sm text-red-500">{erreur}</p>;
  }
  if (!droits) {
    return (
      <div className="flex flex-col gap-2" aria-hidden>
        <Skeleton className="h-4 w-1/3 rounded" />
        <Skeleton className="h-9 w-full rounded-lg" style={{ animationDelay: "80ms" }} />
        <Skeleton className="h-9 w-full rounded-lg" style={{ animationDelay: "160ms" }} />
        <Skeleton className="h-9 w-2/3 rounded-lg" style={{ animationDelay: "240ms" }} />
      </div>
    );
  }

  // Regroupe la categorie 2/3 par serveur (une seule ligne registre par
  // serveur aujourd'hui, mais le regroupement protege si un jour un
  // serveur a plusieurs lignes).
  const serveursParNom = new Map<string, OutilPlateforme>();
  for (const s of droits.serveurs) serveursParNom.set(s.nom_serveur, s);

  const groupesGeneration = regrouperOutils(droits.generation, GROUPES_GENERATION, (o) => o.nom_outil);
  const groupesServeurs = regrouperOutils(
    Array.from(serveursParNom.values()),
    GROUPES_SERVEURS,
    (s) => s.nom_serveur
  );
  const groupesActionsLocales = regrouperOutils(
    droits.actions_locales,
    GROUPES_ACTIONS_LOCALES,
    (o) => o.nom_outil
  );

  return (
    <div className="space-y-6">
      <section className="space-y-4">
        <h3 className="font-semibold">Génération (documents, images, audio, vidéo…)</h3>
        {groupesGeneration.map((groupe) => (
          <div key={groupe.titre}>
            <h4 className="mb-1.5 text-xs font-semibold uppercase tracking-wide text-neutral-500">
              {groupe.titre}
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {groupe.items.map(({ outil, item }) => (
                <label
                  key={item.nom_outil}
                  className={`flex items-start gap-2 text-sm ${!item.disponible ? "opacity-40" : ""}`}
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
                      {!item.disponible && <span className="ml-1 text-xs text-neutral-400">(indisponible)</span>}
                    </span>
                    {outil.description && (
                      <span className="block text-xs text-neutral-500">{outil.description}</span>
                    )}
                  </span>
                </label>
              ))}
            </div>
          </div>
        ))}
      </section>

      <section className="space-y-4">
        <h3 className="font-semibold">Outils externes</h3>
        {groupesServeurs.map((groupe) => (
          <div key={groupe.titre}>
            <h4 className="mb-1.5 text-xs font-semibold uppercase tracking-wide text-neutral-500">
              {groupe.titre}
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {groupe.items.map(({ outil, item }) => (
                <label
                  key={item.nom_serveur}
                  className={`flex items-start gap-2 text-sm ${!item.disponible ? "opacity-40" : ""}`}
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
                      {!item.disponible && <span className="ml-1 text-xs text-neutral-400">(indisponible)</span>}
                    </span>
                    {outil.description && (
                      <span className="block text-xs text-neutral-500">{outil.description}</span>
                    )}
                  </span>
                </label>
              ))}
            </div>
          </div>
        ))}
      </section>

      <section className="space-y-4">
        <h3 className="font-semibold">Boutons de la barre de saisie</h3>
        {groupesActionsLocales.map((groupe) => (
          <div key={groupe.titre}>
            <h4 className="mb-1.5 text-xs font-semibold uppercase tracking-wide text-neutral-500">
              {groupe.titre}
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {groupe.items.map(({ outil, item }) => (
                <label
                  key={item.nom_outil}
                  className={`flex items-start gap-2 text-sm ${!item.disponible ? "opacity-40" : ""}`}
                >
                  <input
                    type="checkbox"
                    className="mt-0.5"
                    disabled={!item.disponible}
                    checked={localesCoches.has(item.nom_outil)}
                    onChange={() => basculerLocale(item.nom_outil)}
                  />
                  <span>
                    <span className="block font-medium">
                      {outil.label}
                      {!item.disponible && <span className="ml-1 text-xs text-neutral-400">(indisponible)</span>}
                    </span>
                    {outil.description && (
                      <span className="block text-xs text-neutral-500">{outil.description}</span>
                    )}
                  </span>
                </label>
              ))}
            </div>
          </div>
        ))}
      </section>

      <label className="flex items-center gap-2 text-sm">
        <input
          type="checkbox"
          checked={informerUtilisateurs}
          onChange={(e) => setInformerUtilisateurs(e.target.checked)}
        />
        Informer mes utilisateurs de ce changement
      </label>

      <button
        type="button"
        onClick={enregistrer}
        disabled={enregistrement}
        className="px-4 py-2 rounded bg-black text-white text-sm disabled:opacity-50"
      >
        {enregistrement ? "Enregistrement…" : "Enregistrer les droits"}
      </button>

      {erreur && <p className="text-sm text-red-500">{erreur}</p>}
      {messageSucces && <p className="text-sm text-green-600">{messageSucces}</p>}
    </div>
  );
}
