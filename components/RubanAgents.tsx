"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { siteConfig } from "@/lib/site-config";

// Demande de Bourama (2026-07-27), accueil, entre les boutons et la
// section suivante : un ruban qui défile horizontalement en continu,
// listant les IA publiées (GET /api/feed, public, pas d'auth). Chaque
// carte : nom à gauche, image vitrine réduite en icône à droite, puis la
// description publique en dessous (pas de cadre, 2 lignes max, tronquée).
// Carte volontairement étroite -- juste la largeur du nom, pas un large
// bloc -- donc la description se tronque vite, ce qui est le but.
type AgentRuban = {
  id: string;
  nom: string;
  icone_page: string;
  image_vitrine_url: string | null;
  description: string;
};

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export function RubanAgents() {
  const [agents, setAgents] = useState<AgentRuban[] | null>(null);

  useEffect(() => {
    if (!API_URL) return;
    let annule = false;
    fetch(`${API_URL}/api/feed?limite=20`)
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (!annule && data?.agents?.length) setAgents(data.agents);
      })
      .catch(() => {});
    return () => {
      annule = true;
    };
  }, []);

  if (!agents || agents.length === 0) return null;

  // Dupliqué pour boucler sans coupure visible (translateX(-50%) sur un
  // contenu doublé = boucle infinie parfaite).
  const ruban = [...agents, ...agents];

  return (
    <div
      className="mt-10 w-full overflow-hidden animate-dj-fade-in"
      style={{
        animationDelay: "0.4s",
        maskImage: "linear-gradient(90deg, transparent, black 8%, black 92%, transparent)",
        WebkitMaskImage:
          "linear-gradient(90deg, transparent, black 8%, black 92%, transparent)",
      }}
    >
      <div className="flex w-max animate-dj-scroll gap-8 hover:[animation-play-state:paused]">
        {ruban.map((agent, i) => (
          <a
            key={`${agent.id}-${i}`}
            href={`${siteConfig.appUrl}/agent/${agent.id}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex w-max min-w-[96px] max-w-[220px] shrink-0 flex-col items-start gap-1.5"
          >
            <span className="flex items-center gap-2 whitespace-nowrap rounded-full border border-dj-bordure bg-dj-surface-haute py-1.5 pl-1.5 pr-3">
              <span className="relative flex h-7 w-7 shrink-0 items-center justify-center overflow-hidden rounded-full bg-dj-surface">
                {agent.image_vitrine_url ? (
                  <Image
                    src={agent.image_vitrine_url}
                    alt=""
                    fill
                    className="object-cover"
                    sizes="28px"
                  />
                ) : (
                  <span className="text-sm leading-none">{agent.icone_page || "🤖"}</span>
                )}
              </span>
              <span className="font-display text-sm font-bold text-dj-texte">{agent.nom}</span>
            </span>
            {agent.description && (
              <p className="w-full overflow-hidden text-xs leading-snug text-dj-texte-muet [display:-webkit-box] [-webkit-box-orient:vertical] [-webkit-line-clamp:2]">
                {agent.description}
              </p>
            )}
          </a>
        ))}
      </div>
    </div>
  );
}
