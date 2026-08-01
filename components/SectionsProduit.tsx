"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { BoutonDevenirCreateur } from "@/components/BoutonDevenirCreateur";
import Image from "next/image";
import { siteConfig, type Locale } from "@/lib/site-config";

// Ajouté le 2026-07-31 (Bourama : "il y a 3-4 sections mais rien
// là-dessus" -- les boutons de la page Produit étaient une maquette non
// branchée, voir l'ancien commentaire dans services/page.tsx). Complété
// le même jour avec le 5ème bouton "Langues africaines". Les 5 sections
// ont maintenant de vraies données en base (voir metier/filiere/domaine/
// langue_africaine dans djiguigne-backend/api/agents.py -- texte libre,
// une IA par valeur -- et matiere qui a une liste fixe).
type CleSection = "matieres" | "metier" | "filiere" | "domaine" | "languesAfricaines" | "execution";

// Paramètre de requête `/api/feed` et champ de l'agent à afficher comme
// tag pour chaque section -- voir avec_matiere/avec_metier/avec_filiere/
// avec_domaine/avec_langue_africaine/avec_execution dans api/main.py.
const CONFIG_SECTIONS: Record<CleSection, { param: string; champ: keyof AgentProduit }> = {
  matieres: { param: "avec_matiere", champ: "matiere" },
  metier: { param: "avec_metier", champ: "metier" },
  filiere: { param: "avec_filiere", champ: "filiere" },
  domaine: { param: "avec_domaine", champ: "domaine" },
  languesAfricaines: { param: "avec_langue_africaine", champ: "langue_africaine" },
  execution: { param: "avec_execution", champ: "execution" },
};

type AgentProduit = {
  id: string;
  nom: string;
  icone_page: string;
  image_vitrine_url: string | null;
  description: string;
  matiere: string | null;
  metier: string | null;
  filiere: string | null;
  domaine: string | null;
  langue_africaine: string | null;
  execution: string | null;
};

const API_URL = process.env.NEXT_PUBLIC_API_URL;

// Réutilisée à la fois pour la liste initiale, la barre latérale
// (desktop) et le tiroir (mobile) -- voir redesign du 2026-08-01
// (Bourama : sélectionner une catégorie replie la liste en barre
// latérale ; sur mobile ça devient un bouton qui ouvre un tiroir).
const SECTIONS: { cle: CleSection; icon: JSX.Element }[] = [
  { cle: "matieres", icon: <IconLivre /> },
  { cle: "metier", icon: <IconMallette /> },
  { cle: "filiere", icon: <IconChemin /> },
  { cle: "domaine", icon: <IconGrille /> },
  { cle: "languesAfricaines", icon: <IconGlobe /> },
  { cle: "execution", icon: <IconEclair /> },
];

export function SectionsProduit({
  locale,
  labels,
  strings,
}: {
  locale: Locale;
  labels: Record<CleSection, string>;
  strings: {
    chargement: string;
    vide: string;
    erreur: string;
    bientot: string;
    devenirCreateurLabel: string;
    devenirCreateurExplicationTitre: string;
    devenirCreateurExplicationCorps: string;
    devenirCreateurContinuer: string;
    devenirCreateurAnnuler: string;
  };
}) {
  const [ouverte, setOuverte] = useState<CleSection | null>(null);
  const [tiroirOuvert, setTiroirOuvert] = useState(false);
  // Repliée par défaut dès qu'une catégorie est choisie : plus de place
  // pour les IA (Bourama, 2026-08-01). Icônes seules + bouton pour
  // déplier/replier -- une vraie barre latérale, pas juste des labels
  // raccourcis.
  const [barreRepliee, setBarreRepliee] = useState(true);
  const [monte, setMonte] = useState(false);
  useEffect(() => setMonte(true), []);
  // Un cache par section évite de refaire l'appel API à chaque fois
  // qu'on rouvre un bouton déjà consulté.
  const [agentsParSection, setAgentsParSection] = useState<Partial<Record<CleSection, AgentProduit[]>>>({});
  const [chargement, setChargement] = useState(false);
  const [erreur, setErreur] = useState<string | null>(null);

  async function ouvrir(section: CleSection) {
    setTiroirOuvert(false);
    if (ouverte === section) {
      setOuverte(null);
      return;
    }
    setOuverte(section);
    if (agentsParSection[section]) return; // déjà chargé

    setChargement(true);
    setErreur(null);
    try {
      if (!API_URL) throw new Error("API non configurée.");
      const { param } = CONFIG_SECTIONS[section];
      const reponse = await fetch(`${API_URL}/api/feed?${param}=true&limite=50`);
      if (!reponse.ok) throw new Error(`Erreur API ${reponse.status}`);
      const donnees = await reponse.json();
      setAgentsParSection((prev) => ({ ...prev, [section]: donnees.agents ?? [] }));
    } catch {
      setErreur(strings.erreur);
    } finally {
      setChargement(false);
    }
  }

  const agentsSectionOuverte = ouverte ? agentsParSection[ouverte] : undefined;

  return (
    <div className="flex flex-col items-start gap-6">
      {!ouverte ? (
        // --- Rien de sélectionné : liste empilée classique ---
        <div className="flex w-full max-w-xs flex-col gap-3 animate-dj-fade-up">
          {SECTIONS.map(({ cle, icon }, i) => (
            <button
              key={cle}
              type="button"
              onClick={() => ouvrir(cle)}
              aria-expanded={false}
              className="flex items-center gap-3 rounded-xl border border-dj-bordure bg-dj-surface px-5 py-4 text-left font-display text-base font-semibold text-dj-texte transition-colors hover:border-dj-bordure-forte hover:bg-dj-surface-haute"
              style={{ animationDelay: `${i * 0.05}s` }}
            >
              <span className="text-dj-accent-1">{icon}</span>
              {labels[cle]}
            </button>
          ))}
        </div>
      ) : (
        // --- Une catégorie sélectionnée : barre latérale (desktop) /
        // bouton + tiroir (mobile) à côté des résultats ---
        <div className="flex w-full flex-col gap-4 animate-dj-fade-up sm:flex-row sm:items-start sm:gap-6">
          {/* Barre latérale desktop -- rétractable (icônes seules) */}
          <div
            className={
              barreRepliee
                ? "hidden w-14 shrink-0 flex-col items-center gap-2 sm:flex"
                : "hidden w-52 shrink-0 flex-col gap-2 sm:flex"
            }
          >
            <button
              type="button"
              onClick={() => setBarreRepliee((v) => !v)}
              aria-label={barreRepliee ? "Déplier la liste des catégories" : "Replier la liste des catégories"}
              title={barreRepliee ? "Déplier" : "Replier"}
              className={
                barreRepliee
                  ? "mb-1 flex h-9 w-9 items-center justify-center rounded-lg border border-dj-bordure text-dj-texte-muet transition-colors hover:border-dj-bordure-forte hover:bg-dj-surface-haute"
                  : "mb-1 flex h-9 items-center justify-end gap-1 self-end rounded-lg border border-dj-bordure px-2.5 text-dj-texte-muet transition-colors hover:border-dj-bordure-forte hover:bg-dj-surface-haute"
              }
            >
              <IconChevronDouble replie={barreRepliee} />
            </button>

            {SECTIONS.map(({ cle, icon }) =>
              barreRepliee ? (
                <button
                  key={cle}
                  type="button"
                  onClick={() => ouvrir(cle)}
                  aria-expanded={ouverte === cle}
                  aria-label={labels[cle]}
                  title={labels[cle]}
                  className={
                    ouverte === cle
                      ? "flex h-11 w-11 items-center justify-center rounded-lg border border-dj-bordure-forte bg-dj-surface-haute text-dj-accent-1 transition-colors"
                      : "flex h-11 w-11 items-center justify-center rounded-lg border border-transparent text-dj-texte-muet transition-colors hover:border-dj-bordure hover:bg-dj-surface"
                  }
                >
                  {icon}
                </button>
              ) : (
                <button
                  key={cle}
                  type="button"
                  onClick={() => ouvrir(cle)}
                  aria-expanded={ouverte === cle}
                  className={
                    ouverte === cle
                      ? "flex items-center gap-2.5 rounded-lg border border-dj-bordure-forte bg-dj-surface-haute px-3.5 py-2.5 text-left text-sm font-semibold text-dj-texte transition-colors"
                      : "flex items-center gap-2.5 rounded-lg border border-transparent px-3.5 py-2.5 text-left text-sm font-semibold text-dj-texte-muet transition-colors hover:border-dj-bordure hover:bg-dj-surface"
                  }
                >
                  <span className="text-dj-accent-1">{icon}</span>
                  {labels[cle]}
                </button>
              )
            )}
          </div>

          {/* Déclencheur tiroir mobile */}
          <div className="sm:hidden">
            <button
              type="button"
              onClick={() => setTiroirOuvert(true)}
              className="flex w-full items-center justify-between gap-3 rounded-xl border border-dj-bordure bg-dj-surface px-5 py-3.5 text-left font-display text-sm font-semibold text-dj-texte transition-colors hover:border-dj-bordure-forte"
            >
              <span className="flex items-center gap-3">
                <span className="text-dj-accent-1">
                  {SECTIONS.find((s) => s.cle === ouverte)?.icon}
                </span>
                {labels[ouverte]}
              </span>
              <IconChevronBas />
            </button>

            {monte &&
              tiroirOuvert &&
              createPortal(
                <div
                  className="fixed inset-0 z-[100] flex items-end justify-center bg-black/50 sm:hidden"
                  onClick={() => setTiroirOuvert(false)}
                >
                  <div
                    className="w-full max-w-sm rounded-t-2xl border border-dj-bordure bg-dj-surface p-4 pb-6 shadow-xl"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <div className="mx-auto mb-3 h-1 w-10 rounded-full bg-dj-bordure" />
                    <div className="flex flex-col gap-2">
                      {SECTIONS.map(({ cle, icon }) => (
                        <button
                          key={cle}
                          type="button"
                          onClick={() => ouvrir(cle)}
                          aria-expanded={ouverte === cle}
                          className={
                            ouverte === cle
                              ? "flex items-center gap-3 rounded-xl border border-dj-bordure-forte bg-dj-surface-haute px-4 py-3 text-left text-sm font-semibold text-dj-texte transition-colors"
                              : "flex items-center gap-3 rounded-xl border border-transparent px-4 py-3 text-left text-sm font-semibold text-dj-texte transition-colors hover:bg-dj-surface-haute"
                          }
                        >
                          <span className="text-dj-accent-1">{icon}</span>
                          {labels[cle]}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>,
                document.body
              )}
          </div>

          {/* Résultats */}
          <div className="w-full flex-1">
            {chargement ? (
              <p className="text-sm text-dj-texte-muet">{strings.chargement}</p>
            ) : erreur ? (
              <p className="text-sm text-dj-texte-muet">{erreur}</p>
            ) : !agentsSectionOuverte || agentsSectionOuverte.length === 0 ? (
              <div className="flex flex-col items-start gap-3">
                <p className="text-sm text-dj-texte-muet">{strings.vide}</p>
                <BoutonDevenirCreateur
                  label={strings.devenirCreateurLabel}
                  explicationTitre={strings.devenirCreateurExplicationTitre}
                  explicationCorps={strings.devenirCreateurExplicationCorps}
                  continuerLabel={strings.devenirCreateurContinuer}
                  annulerLabel={strings.devenirCreateurAnnuler}
                />
              </div>
            ) : (
              <div className="grid w-full gap-4 sm:grid-cols-2">
                {agentsSectionOuverte.map((agent) => {
                  const tag = agent[CONFIG_SECTIONS[ouverte].champ];
                  return (
                    <a
                      key={agent.id}
                      href={`${siteConfig.appUrl}/agent/${agent.id}/chat`}
                      className="group flex items-start gap-4 rounded-2xl border border-dj-bordure bg-dj-surface p-4 text-left transition-colors hover:border-dj-bordure-forte hover:bg-dj-surface-haute sm:p-5"
                    >
                      <span className="relative flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-full bg-dj-surface-haute">
                        {agent.image_vitrine_url ? (
                          <Image
                            src={agent.image_vitrine_url}
                            alt=""
                            fill
                            className="object-cover"
                            sizes="56px"
                          />
                        ) : (
                          <span className="text-2xl leading-none">{agent.icone_page || "🤖"}</span>
                        )}
                      </span>
                      <span className="flex min-w-0 flex-col gap-1.5">
                        <span className="flex flex-wrap items-center gap-2">
                          <span className="font-display text-base font-bold text-dj-texte">
                            {agent.nom}
                          </span>
                          {tag && (
                            <span className="shrink-0 rounded-full border border-dj-bordure px-2.5 py-1 text-xs text-dj-texte-muet">
                              {tag}
                            </span>
                          )}
                        </span>
                        {agent.description && (
                          <span className="text-sm text-dj-texte-muet">{agent.description}</span>
                        )}
                      </span>
                    </a>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// Icônes ligne inline reprises telles quelles de l'ancienne maquette
// dans services/page.tsx (même convention SVG stroke currentColor que le
// reste du repo).
function IconLivre() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
      <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
    </svg>
  );
}

function IconMallette() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="7" width="20" height="14" rx="2" />
      <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
      <path d="M2 13h20" />
    </svg>
  );
}

function IconChemin() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="6" cy="19" r="2" />
      <circle cx="18" cy="5" r="2" />
      <path d="M8 19h4.5A4.5 4.5 0 0 0 17 14.5V9a4 4 0 0 1 1-2.6" />
    </svg>
  );
}

function IconGrille() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="7" height="7" rx="1" />
      <rect x="14" y="3" width="7" height="7" rx="1" />
      <rect x="3" y="14" width="7" height="7" rx="1" />
      <rect x="14" y="14" width="7" height="7" rx="1" />
    </svg>
  );
}

// Ajoutée le 2026-07-31 pour le 5ème bouton "Langues africaines" --
// même convention que les icônes ci-dessus.
function IconGlobe() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <path d="M2 12h20" />
      <path d="M12 2a15 15 0 0 1 0 20 15 15 0 0 1 0-20z" />
    </svg>
  );
}

// Ajoutée le 2026-07-31 pour le 6ème bouton "Exécution" -- même
// convention que les icônes ci-dessus.
function IconEclair() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M13 2 3 14h8l-1 8 10-12h-8l1-8z" />
    </svg>
  );
}

// Ajoutée le 2026-08-01 pour le déclencheur du tiroir mobile (redesign
// barre latérale / tiroir, Bourama).
function IconChevronBas() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="m6 9 6 6 6-6" />
    </svg>
  );
}

// Ajoutée le 2026-08-01 pour le bouton plier/déplier la barre latérale
// desktop (redesign, Bourama). Pointe vers la droite quand repliée
// (action = déplier), vers la gauche quand dépliée (action = replier).
function IconChevronDouble({ replie }: { replie: boolean }) {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      style={{ transform: replie ? "none" : "rotate(180deg)" }}
    >
      <path d="m8 5 7 7-7 7" />
      <path d="m14 5 7 7-7 7" />
    </svg>
  );
}
