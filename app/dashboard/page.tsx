"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { appelerApi } from "@/lib/api";

// /dashboard n'affiche plus rien lui-même (Bourama, 27/07 : "la première
// [page] ne doit plus y être, son contenu doit être dans le second") --
// la page /dashboard/agents/{id}/modifier EST désormais le dashboard,
// avec la liste des IA en colonne de gauche. Ici on redirige juste vers
// la première IA du créateur (ou vers la création s'il n'en a aucune).
export default function PageDashboard() {
  const router = useRouter();

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) {
        router.replace("/connexion");
        return;
      }
      appelerApi(`/api/profiles/${session.user.id}`)
        .then((r: { agents: { id: string }[] }) => {
          if (r.agents.length > 0) {
            router.replace(`/dashboard/agents/${r.agents[0].id}/modifier`);
          } else {
            router.replace("/dashboard/agents/nouveau");
          }
        })
        .catch(() => router.replace("/dashboard/agents/nouveau"));
    });
  }, [router]);

  return null;
}
