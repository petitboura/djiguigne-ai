"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { connecterOuInscrire } from "@/lib/authFallback";
import { appelerApi } from "@/lib/api";
import { ChampMotDePasse } from "@/components/ChampMotDePasse";
import { ChampTelephone } from "@/components/ChampTelephone";
import type { getDictionary } from "@/lib/dictionaries";
import { siteConfig, type Locale } from "@/lib/site-config";

type MethodeConnexion = "email" | "telephone";
type Dictionary = ReturnType<typeof getDictionary>;

// Extrait de page.tsx le 01/08 (audit vitesse) : le dictionnaire (les
// DEUX langues) est désormais résolu côté serveur dans page.tsx et
// passé ici en prop, au lieu d'appeler getDictionary(locale) depuis ce
// composant client -- qui embarquait sinon lib/dictionaries.ts (les deux
// langues) dans le bundle JS envoyé au navigateur, alors qu'une seule
// sert jamais pour une page donnée.
export function FormulaireConnexion({ dict, locale }: { dict: Dictionary; locale: Locale }) {
  const router = useRouter();
  const [methode, setMethode] = useState<MethodeConnexion>("email");
  const [email, setEmail] = useState("");
  const [telephone, setTelephone] = useState("");
  const [motDePasse, setMotDePasse] = useState("");
  const [enCours, setEnCours] = useState(false);
  const [erreur, setErreur] = useState<string | null>(null);

  async function gererSoumission(e: React.FormEvent) {
    e.preventDefault();
    setErreur(null);
    setEnCours(true);

    // Connexion sur le compte existant (même Supabase que l'app). Si aucun
    // compte n'existe avec ces identifiants, connecterOuInscrire() en crée
    // un de type "utilisateur" par défaut (voir lib/authFallback.ts).
    const { error } =
      methode === "email"
        ? await connecterOuInscrire({ email, password: motDePasse })
        : await connecterOuInscrire({
            phone: telephone.replace(/\s+/g, ""),
            password: motDePasse,
          });

    setEnCours(false);

    if (error) {
      setErreur(error.message);
      return;
    }

    // Établissement/enseignant/étudiant (06/08) : même destination que la
    // fin de l'inscription dédiée (InscriptionEtablissements.tsx) --
    // directement sur l'IA dédiée au rôle, sur l'app produit. Ce
    // comportement n'existait pas encore le 27/07 quand la règle "reste
    // sur la vitrine après connexion" ci-dessous a été écrite : elle ne
    // s'applique donc plus qu'aux comptes sans rôle (créateurs/visiteurs
    // classiques). Si l'appel échoue (réseau, etc.), on ne bloque pas la
    // connexion -- repli silencieux sur le comportement existant.
    try {
      const monRole: { role: string | null; agent_id: string | null } = await appelerApi("/api/roles/moi");
      if (monRole.role && monRole.agent_id) {
        window.location.href = `${siteConfig.appUrl}/agent/${monRole.agent_id}`;
        return;
      }
    } catch {
      // Repli silencieux ci-dessous.
    }

    // Reste sur le vitrine après connexion — ne renvoie plus vers l'app
    // externe (voir discussion du 27/07 : "la connexion dans la vitrine
    // reste dans la vitrine, il n'emmène nulle part").
    router.push(`/${locale}`);
  }

  return (
    <main className="flex min-h-[70vh] items-center justify-center px-4 py-16">
      <div className="w-full max-w-sm">
        <Link href={`/${locale}`} className="mb-8 flex items-center justify-center gap-2.5">
          <Image src="/logo.png" alt={siteConfig.brandName} width={36} height={36} priority />
          <span className="font-display text-lg font-bold tracking-tight text-dj-texte">
            Djiguignè <span className="text-dj-accent-1">AI</span>
          </span>
        </Link>

        <div className="rounded-2xl border border-dj-bordure bg-dj-surface p-6 shadow-[0_2px_24px_rgba(0,0,0,0.35)]">
          <h1 className="font-display text-xl font-bold text-dj-texte">{dict.auth.loginTitle}</h1>

          <div className="mt-4 grid grid-cols-2 gap-2 rounded-full border border-dj-bordure bg-dj-surface-haute p-1">
            <button
              type="button"
              onClick={() => setMethode("email")}
              className={`rounded-full py-1.5 text-sm font-medium transition-colors ${
                methode === "email"
                  ? "bg-dj-gradient text-[#1A0D02]"
                  : "text-dj-texte-muet hover:text-dj-texte"
              }`}
            >
              {dict.auth.email}
            </button>
            <button
              type="button"
              onClick={() => setMethode("telephone")}
              className={`rounded-full py-1.5 text-sm font-medium transition-colors ${
                methode === "telephone"
                  ? "bg-dj-gradient text-[#1A0D02]"
                  : "text-dj-texte-muet hover:text-dj-texte"
              }`}
            >
              {dict.auth.phone}
            </button>
          </div>

          <form onSubmit={gererSoumission} className="mt-4 space-y-4">
            {methode === "email" ? (
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-dj-texte-muet">
                  {dict.auth.email}
                </label>
                <input
                  id="email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="mt-1 w-full rounded-lg border border-dj-bordure bg-dj-surface-haute px-3 py-2 text-dj-texte outline-none focus:border-dj-accent-1"
                />
              </div>
            ) : (
              <ChampTelephone id="telephone" value={telephone} onChange={setTelephone} label={dict.auth.phone} />
            )}

            <ChampMotDePasse id="mot-de-passe" value={motDePasse} onChange={setMotDePasse} />

            <p className="text-right text-xs text-dj-accent-1">{dict.auth.forgotPassword}</p>

            {erreur && <p className="text-sm text-[#F87171]">{erreur}</p>}

            <button
              type="submit"
              disabled={enCours}
              className="w-full rounded-full bg-dj-gradient px-4 py-2.5 text-sm font-bold text-[#1A0D02] shadow-[0_2px_14px_rgba(217,99,31,0.25)] transition-transform hover:-translate-y-0.5 disabled:opacity-50 disabled:hover:translate-y-0"
            >
              {enCours ? dict.auth.loginButtonLoading : dict.auth.loginButton}
            </button>
          </form>
        </div>

        <p className="mt-5 text-center text-sm text-dj-texte-muet">
          {dict.auth.noAccount}{" "}
          <Link href={`/${locale}/inscription`} className="text-dj-accent-1 hover:underline">
            {dict.auth.signupLink}
          </Link>
        </p>
      </div>
    </main>
  );
}
