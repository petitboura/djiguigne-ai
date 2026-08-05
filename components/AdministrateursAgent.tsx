"use client";

import { useEffect, useState } from "react";
import { appelerApi } from "@/lib/api";

// Section "Administrateurs" (2026-08-05, demande Bourama : "juste tu
// entres son email et c'est fait, pas de confirmation pour l'instant").
// Consomme GET/POST /api/agents/{id}/administrateurs (voir api/agents.py)
// -- table `agents_administrateurs`, qui donne accès à l'onglet
// "Administrer" de "Mon espace" côté app pour la personne ajoutée. Réservé
// au propriétaire (même vérification que /edition côté backend) : un
// administrateur désigné ne peut pas lui-même en désigner d'autres.

type Administrateur = { user_id: string; email: string };

export function AdministrateursAgent({ agentId }: { agentId: string }) {
  const [administrateurs, setAdministrateurs] = useState<Administrateur[] | null>(null);
  const [erreurChargement, setErreurChargement] = useState<string | null>(null);

  const [email, setEmail] = useState("");
  const [ajout, setAjout] = useState(false);
  const [erreurAjout, setErreurAjout] = useState<string | null>(null);

  useEffect(() => {
    appelerApi(`/api/agents/${agentId}/administrateurs`)
      .then((r: { administrateurs: Administrateur[] }) => setAdministrateurs(r.administrateurs))
      .catch((e) => setErreurChargement(e instanceof Error ? e.message : "Erreur inconnue."));
  }, [agentId]);

  async function ajouter() {
    const emailPropre = email.trim();
    if (!emailPropre) return;
    setAjout(true);
    setErreurAjout(null);
    try {
      const r = (await appelerApi(`/api/agents/${agentId}/administrateurs`, {
        method: "POST",
        body: JSON.stringify({ email: emailPropre }),
      })) as { administrateurs: Administrateur[] };
      setAdministrateurs(r.administrateurs);
      setEmail("");
    } catch (e) {
      setErreurAjout(e instanceof Error ? e.message : "Impossible d'ajouter pour le moment.");
    } finally {
      setAjout(false);
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <p className="text-sm text-dj-texte-muet">
        Donne à quelqu&apos;un le droit d&apos;administrer cette IA (comportement, documents, bibliothèque) en
        entrant son email. Effectif immédiatement, dès qu&apos;il a un compte Djiguignè -- pas de confirmation de
        sa part.
      </p>

      <div className="flex flex-col gap-1.5 sm:flex-row sm:items-center sm:gap-3">
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              ajouter();
            }
          }}
          placeholder="email@exemple.com"
          className="flex-1 rounded-lg border border-dj-bordure bg-dj-fond px-3 py-2 text-sm text-dj-texte placeholder:text-dj-texte-muet"
        />
        <button
          type="button"
          onClick={ajouter}
          disabled={ajout || !email.trim()}
          className="self-start rounded-full bg-dj-gradient px-5 py-2 text-sm font-bold text-[#1A0D02] transition-transform hover:-translate-y-0.5 disabled:opacity-50"
        >
          {ajout ? "Ajout…" : "Ajouter comme administrateur"}
        </button>
      </div>
      {erreurAjout && <p className="text-sm text-[#F87171]">{erreurAjout}</p>}

      <div className="rounded-xl border border-dj-bordure bg-dj-surface p-4">
        <p className="mb-2 text-xs font-medium text-dj-texte-muet">Administrateurs actuels</p>
        {erreurChargement && <p className="text-sm text-[#F87171]">{erreurChargement}</p>}
        {!erreurChargement && !administrateurs && <p className="text-sm text-dj-texte-muet">Chargement…</p>}
        {administrateurs && administrateurs.length === 0 && (
          <p className="text-sm text-dj-texte-muet">Personne d&apos;autre que toi pour l&apos;instant.</p>
        )}
        {administrateurs && administrateurs.length > 0 && (
          <ul className="flex flex-col gap-1.5">
            {administrateurs.map((a) => (
              <li key={a.user_id} className="text-sm text-dj-texte">
                {a.email}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
