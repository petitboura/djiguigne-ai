"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { inscrireOuConnecter, type TypeCompte } from "@/lib/authFallback";
import { ChampMotDePasse } from "@/components/ChampMotDePasse";
import { ChampTelephone } from "@/components/ChampTelephone";
import { getDictionary } from "@/lib/dictionaries";
import { siteConfig, type Locale } from "@/lib/site-config";

type MethodeInscription = "email" | "telephone";

export default function PageInscription({ params }: { params: { locale: Locale } }) {
  const { locale } = params;
  const router = useRouter();
  const dict = getDictionary(locale);
  const [typeCompte, setTypeCompte] = useState<TypeCompte>("utilisateur");
  const [methode, setMethode] = useState<MethodeInscription>("email");
  const [email, setEmail] = useState("");
  const [telephone, setTelephone] = useState("");
  const [motDePasse, setMotDePasse] = useState("");
  const [enCours, setEnCours] = useState(false);
  const [erreur, setErreur] = useState<string | null>(null);

  async function gererSoumission(e: React.FormEvent) {
    e.preventDefault();
    setErreur(null);
    setEnCours(true);

    // Le type de compte choisi est stocké dans les métadonnées Supabase
    // Auth (user_metadata.type_compte) — voir lib/authFallback.ts. Aucune
    // différence de droits pour l'instant, juste l'info stockée.
    const { error } =
      methode === "email"
        ? await inscrireOuConnecter({ email, password: motDePasse }, typeCompte)
        : await inscrireOuConnecter(
            { phone: telephone.replace(/\s+/g, ""), password: motDePasse },
            typeCompte
          );

    setEnCours(false);

    if (error) {
      setErreur(error.message);
      return;
    }

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
          <h1 className="font-display text-xl font-bold text-dj-texte">{dict.auth.signupTitle}</h1>

          <div className="mt-4">
            <p className="text-sm font-medium text-dj-texte-muet">{dict.auth.accountTypeLabel}</p>
            <div className="mt-2 grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setTypeCompte("utilisateur")}
                className={`rounded-xl border p-3 text-left transition-colors ${
                  typeCompte === "utilisateur"
                    ? "border-dj-bordure-forte bg-dj-surface-haute"
                    : "border-dj-bordure hover:border-dj-bordure-forte"
                }`}
              >
                <span className="block text-sm font-semibold text-dj-texte">
                  {dict.auth.accountTypeUser}
                </span>
                <span className="mt-0.5 block text-xs text-dj-texte-muet">
                  {dict.auth.accountTypeUserDesc}
                </span>
              </button>
              <button
                type="button"
                onClick={() => setTypeCompte("createur")}
                className={`rounded-xl border p-3 text-left transition-colors ${
                  typeCompte === "createur"
                    ? "border-dj-bordure-forte bg-dj-surface-haute"
                    : "border-dj-bordure hover:border-dj-bordure-forte"
                }`}
              >
                <span className="block text-sm font-semibold text-dj-texte">
                  {dict.auth.accountTypeCreator}
                </span>
                <span className="mt-0.5 block text-xs text-dj-texte-muet">
                  {dict.auth.accountTypeCreatorDesc}
                </span>
              </button>
            </div>
          </div>

          {typeCompte === "createur" && (
            <p className="mt-3 rounded-lg bg-dj-surface-haute px-3 py-2 text-xs text-dj-texte-muet">
              {dict.auth.creatorNote}
            </p>
          )}

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

            <ChampMotDePasse
              id="mot-de-passe"
              value={motDePasse}
              onChange={setMotDePasse}
              autoComplete="new-password"
            />

            {erreur && <p className="text-sm text-[#F87171]">{erreur}</p>}

            <button
              type="submit"
              disabled={enCours}
              className="w-full rounded-full bg-dj-gradient px-4 py-2.5 text-sm font-bold text-[#1A0D02] shadow-[0_2px_14px_rgba(217,99,31,0.25)] transition-transform hover:-translate-y-0.5 disabled:opacity-50 disabled:hover:translate-y-0"
            >
              {enCours ? dict.auth.signupButtonLoading : dict.auth.signupButton}
            </button>
          </form>
        </div>

        <p className="mt-5 text-center text-sm text-dj-texte-muet">
          {dict.auth.hasAccount}{" "}
          <Link href={`/${locale}/connexion`} className="text-dj-accent-1 hover:underline">
            {dict.auth.loginLink}
          </Link>
        </p>
      </div>
    </main>
  );
}
