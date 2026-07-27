"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { appelerApi } from "@/lib/api";
import { AgentCard, type AgentResume } from "@/components/AgentCard";
import { TopBar } from "@/components/TopBar";
import { BoutonRetour } from "@/components/BoutonRetour";
import { BoutonAccueil } from "@/components/BoutonAccueil";

// Page racine de /dashboard ("Mon espace"), jamais construite jusqu'ici
// (voir TopBar.tsx : "pas encore construit (Étape D.5)") — les 4
// sous-pages (agents/nouveau, agents/[id]/modifier, memoire,
// profil/modifier) existaient déjà mais restaient orphelines, rien ne
// pointait vers elles.
//
// Version volontairement réduite par rapport à l'équivalent
// djiguigne-frontend/app/dashboard/page.tsx (27/07, demande explicite de
// Bourama : "juste ceux-ci") : uniquement la liste des IA créées + le
// bouton de création. Pas de profil/bio/avatar, pas de follow, pas de
// publications, pas d'historique — ces fonctionnalités sociales restent
// côté app frontend, hors du rôle vitrine/créateur de ce dépôt.
//
// Réutilise GET /api/profiles/{user_id} (même endpoint que le portfolio
// public /u/[id] et que le dashboard frontend) : `utilisateur_optionnel`
// côté backend fait qu'on voit ici TOUTES ses IA, actives ou non (voir
// docstring de api/profiles.py:obtenir_profil_public).

type ProfilMoi = {
  user_id: string;
  agents: AgentResume[];
};

export default function PageDashboard() {
  const router = useRouter();
  const [session, setSession] = useState<
    Awaited<ReturnType<typeof supabase.auth.getSession>>["data"]["session"] | null | undefined
  >(undefined);
  const [profil, setProfil] = useState<ProfilMoi | null>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) {
        router.push("/connexion");
        return;
      }
      setSession(session);
    });
  }, [router]);

  useEffect(() => {
    if (!session) return;
    // 404 tolérée (pas encore de ligne `profiles` tant que
    // /dashboard/profil/modifier n'a jamais été enregistrée) : liste
    // vide plutôt qu'une erreur bloquante, même logique que côté
    // frontend.
    appelerApi(`/api/profiles/${session.user.id}`)
      .then((r: ProfilMoi) => setProfil(r))
      .catch(() => setProfil({ user_id: session.user.id, agents: [] }));
  }, [session]);

  if (session === undefined || session === null) return null;

  return (
    <div className="min-h-screen">
      <TopBar />

      <main className="mx-auto flex max-w-5xl flex-col gap-8 px-5 py-10">
        <div className="flex gap-2">
          <BoutonRetour />
          <BoutonAccueil />
        </div>

        <section className="flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <h2 className="font-display text-lg font-bold text-dj-texte">
              IA créées ({profil?.agents.length ?? 0})
            </h2>

            <Link
              href="/dashboard/agents/nouveau"
              className="rounded-full bg-dj-gradient px-4 py-2 text-sm font-bold text-[#1A0D02] shadow-[0_2px_14px_rgba(217,99,31,0.25)] transition-transform hover:-translate-y-0.5"
            >
              + Créer une IA
            </Link>
          </div>

          {profil === null && <p className="text-sm text-dj-texte-muet">Chargement...</p>}
          {profil?.agents.length === 0 && (
            <p className="text-sm text-dj-texte-muet">Aucune IA créée pour l&apos;instant.</p>
          )}
          {profil && profil.agents.length > 0 && (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3">
              {profil.agents.map((agent) => (
                <div key={agent.id} className="flex flex-col gap-2">
                  <AgentCard agent={agent} />
                  <Link
                    href={`/dashboard/agents/${agent.id}/modifier`}
                    className="self-start rounded-full border border-dj-bordure px-4 py-1.5 text-sm text-dj-texte transition-colors hover:border-dj-bordure-forte"
                  >
                    Modifier
                  </Link>
                </div>
              ))}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
