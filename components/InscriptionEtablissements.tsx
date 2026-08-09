"use client";

// DÉSACTIVÉ — 05/08/2026
// Ne pas réutiliser ni réactiver tant que ce n'est pas demandé explicitement.
// Raison : demande de Bourama de couper la section Établissements de la
// navigation normale, en gardant l'URL directe joignable pour qui la
// connaît. Voir SECTIONS_DESACTIVEES.md à la racine du dépôt.

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { inscrireOuConnecter } from "@/lib/authFallback";
import { appelerApi } from "@/lib/api";
import { construireUrlApp } from "@/lib/lienApp";
import { ChampMotDePasse } from "@/components/ChampMotDePasse";
import { ChampTelephone } from "@/components/ChampTelephone";
import { ChampImage } from "@/components/ChampImage";
import type { getDictionary } from "@/lib/dictionaries";
import { siteConfig, type Locale } from "@/lib/site-config";

type Dictionary = ReturnType<typeof getDictionary>;
type Role = "etablissement" | "enseignant" | "etudiant";
type MethodeAuth = "email" | "telephone";
type CompteListe = { user_id: string; nom_affiche: string };

// Agents dédiés par rôle (06/08, Bourama) : après inscription, chacun
// tombe directement sur son IA (id vérifié en base -- table `agents`,
// project rwcyeppxfonvqbvztxyg) plutôt que sur la page de profil.
const AGENT_PAR_ROLE: Record<Role, string> = {
  etudiant: "nitrux",
  enseignant: "stirux",
  etablissement: "lirinus",
};

// Ajouté le 04/08 (Bourama) : parcours d'inscription dédié aux
// établissements/enseignants/étudiants, séparé du parcours créateur
// (FormulaireInscription.tsx) -- même mécanique d'auth (email/téléphone +
// mot de passe, réutilise inscrireOuConnecter avec le type "utilisateur"),
// mais un flow différent : choix du rôle, éventuel rattachement (un
// enseignant peut choisir son établissement -- optionnel depuis le 06/08),
// création du compte, puis étape "profil" (nom obligatoire + champs
// optionnels selon le rôle). À la fin, POST /api/roles/choisir enregistre
// tout ça en une fois (voir api/roles.py côté backend).
//
// Redirection finale : vers l'agent IA dédié au rôle choisi (voir
// AGENT_PAR_ROLE ci-dessus), sur siteConfig.appUrl (l'app produit, pas
// la vitrine).
//
// roleInitial (06/08, Bourama) : quand on arrive depuis une des 3 cartes
// cliquables de /etablissements (?role=...), on saute directement
// l'étape "role" -- initialise le state avec ce rôle au lieu de null.
// Le bouton "S'inscrire" du haut de la landing, lui, ne passe pas de
// rôle : comportement inchangé (étape "role" affichée normalement).
export function InscriptionEtablissements({
  dict,
  locale,
  roleInitial = null,
}: {
  dict: Dictionary;
  locale: Locale;
  roleInitial?: Role | null;
}) {
  const t = dict.etablissements.inscription;

  const [role, setRole] = useState<Role | null>(roleInitial);
  const [etablissementId, setEtablissementId] = useState<string>("");

  const [etablissements, setEtablissements] = useState<CompteListe[] | null>(null);
  const [erreurListe, setErreurListe] = useState<string | null>(null);

  const [methode, setMethode] = useState<MethodeAuth>("email");
  const [email, setEmail] = useState("");
  const [telephone, setTelephone] = useState("");
  const [motDePasse, setMotDePasse] = useState("");
  const [enCours, setEnCours] = useState(false);
  const [erreur, setErreur] = useState<string | null>(null);
  const [succes, setSucces] = useState(false);

  // Étape "profil" (06/08, Bourama) : nomAffiche est le seul champ
  // obligatoire, le reste (avatarUrl/bio/siteWeb/contact/emailContact/
  // matiere) est optionnel et n'est envoyé à /api/roles/choisir que s'il
  // est rempli -- voir gererSoumissionProfil.
  const [compteCree, setCompteCree] = useState(false);
  const [nomAffiche, setNomAffiche] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");
  const [bio, setBio] = useState("");
  const [siteWeb, setSiteWeb] = useState("");
  const [contact, setContact] = useState("");
  const [emailContact, setEmailContact] = useState("");
  const [matiere, setMatiere] = useState("");

  useEffect(() => {
    if (role === "enseignant" && etablissements === null) {
      appelerApi("/api/roles/etablissements")
        .then((r: CompteListe[]) => setEtablissements(r))
        .catch((e) => setErreurListe(messageErreur(e)));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [role]);

  // Rattachement (établissement pour un enseignant) : SEUL cas restant
  // depuis le 06/08 -- le rattachement étudiant->enseignant a été retiré
  // du parcours (demande Bourama : "pas choisir son enseignant"). Devenu
  // optionnel (voir bouton "Passer cette étape" ci-dessous) : ne bloque
  // plus la suite, contrairement à avant.
  const etapeRattachement = role === "enseignant";

  const [afficherAuth, setAfficherAuth] = useState(false);
  const etapeActuelle: "role" | "rattachement" | "auth" | "profil" = !role
    ? "role"
    : etapeRattachement && !afficherAuth
      ? "rattachement"
      : !compteCree
        ? "auth"
        : "profil";

  // Ne fait plus que créer le compte (email/téléphone + mot de passe) --
  // le choix du rôle/rattachement est déjà fait à ce stade, et
  // l'enregistrement du profil (POST /api/roles/choisir) se fait à
  // l'étape suivante, une fois le compte (et donc la session, nécessaire
  // pour l'upload d'avatar) disponible.
  async function gererSoumissionAuth(e: React.FormEvent) {
    e.preventDefault();
    if (!role) return;
    setErreur(null);
    setEnCours(true);

    const { error: erreurAuth } =
      methode === "email"
        ? await inscrireOuConnecter({ email, password: motDePasse }, "utilisateur")
        : await inscrireOuConnecter(
            { phone: telephone.replace(/\s+/g, ""), password: motDePasse },
            "utilisateur"
          );

    setEnCours(false);
    if (erreurAuth) {
      setErreur(erreurAuth.message);
      return;
    }
    setCompteCree(true);
  }

  async function gererSoumissionProfil(e: React.FormEvent) {
    e.preventDefault();
    if (!role) return;
    setErreur(null);
    setEnCours(true);

    try {
      await appelerApi("/api/roles/choisir", {
        method: "POST",
        body: JSON.stringify({
          role,
          etablissement_id: role === "enseignant" && etablissementId ? etablissementId : undefined,
          nom_affiche: nomAffiche,
          bio: bio || undefined,
          avatar_url: avatarUrl || undefined,
          site_web: role === "etablissement" && siteWeb ? siteWeb : undefined,
          contact: role === "etablissement" && contact ? contact : undefined,
          email_contact: emailContact || undefined,
          matiere: role !== "etablissement" && matiere ? matiere : undefined,
        }),
      });
    } catch (e) {
      setErreur(messageErreur(e));
      setEnCours(false);
      return;
    }

    setEnCours(false);
    setSucces(true);
    // 06/08 (Bourama) : chacun tombe directement sur son IA dédiée
    // (voir AGENT_PAR_ROLE) plutôt que sur /dashboard/profil/modifier.
    // 07/08 : construireUrlApp() attache la session active (voir
    // lib/lienApp.ts) pour que l'app arrive déjà connectée, avec ?retour=
    // pour que l'IA devienne le chat par défaut (voir ChatAgentClient.tsx
    // côté app).
    const retour = encodeURIComponent(`${siteConfig.url}/${locale}`);
    window.location.href = await construireUrlApp(`/agent/${AGENT_PAR_ROLE[role]}?retour=${retour}`);
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

        <div className="animate-dj-fade-up rounded-2xl border border-dj-bordure bg-dj-surface p-6 shadow-[0_2px_24px_rgba(0,0,0,0.35)]">
          {etapeActuelle === "role" && (
            <>
              <h1 className="font-display text-xl font-bold text-dj-texte">{t.stepRoleTitle}</h1>
              <div className="mt-4 flex flex-col gap-2">
                {(
                  [
                    ["etablissement", dict.etablissements.landing.roleEtablissementTitle],
                    ["enseignant", dict.etablissements.landing.roleEnseignantTitle],
                    ["etudiant", dict.etablissements.landing.roleEtudiantTitle],
                  ] as const
                ).map(([r, label]) => (
                  <button
                    key={r}
                    type="button"
                    onClick={() => setRole(r)}
                    className="rounded-xl border border-dj-bordure bg-dj-surface-haute px-4 py-3 text-left text-sm font-medium text-dj-texte transition-colors hover:border-dj-accent-1"
                  >
                    {label}
                  </button>
                ))}
              </div>
            </>
          )}

          {etapeActuelle === "rattachement" && role === "enseignant" && (
            <EtapeRattachement
              titre={t.stepEtablissementTitle}
              placeholder={t.stepEtablissementPlaceholder}
              vide={t.stepEtablissementEmpty}
              options={etablissements}
              erreurListe={erreurListe}
              valeur={etablissementId}
              onChange={setEtablissementId}
              onRetour={() => setRole(null)}
              onSuivant={() => setAfficherAuth(true)}
              labelRetour={t.back}
              labelSuivant={etablissementId ? t.next : t.skip}
            />
          )}

          {etapeActuelle === "auth" && (
            <>
              <h1 className="font-display text-xl font-bold text-dj-texte">{t.stepAuthTitle}</h1>

              <div className="mt-4 grid grid-cols-2 gap-2 rounded-xl border border-dj-bordure bg-dj-surface-haute p-1">
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

              <form onSubmit={gererSoumissionAuth} className="mt-4 space-y-4">
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

                <div className="flex gap-2">
                  {etapeRattachement && (
                    <button
                      type="button"
                      onClick={() => setAfficherAuth(false)}
                      className="rounded-xl border border-dj-bordure px-4 py-2.5 text-sm font-medium text-dj-texte-muet transition-colors hover:border-dj-bordure-forte hover:text-dj-texte"
                    >
                      {t.back}
                    </button>
                  )}
                  {!etapeRattachement && (
                    <button
                      type="button"
                      onClick={() => setRole(null)}
                      className="rounded-xl border border-dj-bordure px-4 py-2.5 text-sm font-medium text-dj-texte-muet transition-colors hover:border-dj-bordure-forte hover:text-dj-texte"
                    >
                      {t.back}
                    </button>
                  )}
                  <button
                    type="submit"
                    disabled={enCours}
                    className="flex-1 rounded-xl bg-dj-gradient px-4 py-2.5 text-sm font-bold text-[#1A0D02] shadow-[0_2px_14px_rgba(217,99,31,0.25)] transition-transform hover:-translate-y-0.5 disabled:opacity-50 disabled:hover:translate-y-0"
                  >
                    {enCours ? t.submitButtonLoading : t.submitButton}
                  </button>
                </div>
              </form>
            </>
          )}

          {etapeActuelle === "profil" && role && (
            <>
              <h1 className="font-display text-xl font-bold text-dj-texte">{t.stepProfilTitle}</h1>

              <form onSubmit={gererSoumissionProfil} className="mt-4 space-y-4">
                <div>
                  <label htmlFor="nom-affiche" className="block text-sm font-medium text-dj-texte-muet">
                    {role === "etablissement" ? t.profilNomEtablissement : t.profilNomPersonne}
                  </label>
                  <input
                    id="nom-affiche"
                    type="text"
                    required
                    value={nomAffiche}
                    onChange={(e) => setNomAffiche(e.target.value)}
                    className="mt-1 w-full rounded-lg border border-dj-bordure bg-dj-surface-haute px-3 py-2 text-dj-texte outline-none focus:border-dj-accent-1"
                  />
                </div>

                {/* rond=false pour le logo d'établissement (souvent
                    rectangulaire), rond=true pour la photo d'une personne
                    (enseignant/étudiant), même convention que ChampImage
                    ailleurs sur le site (avatar vs image de vitrine). */}
                <ChampImage
                  valeur={avatarUrl}
                  onChange={setAvatarUrl}
                  label={role === "etablissement" ? t.profilLogoEtablissement : t.profilPhoto}
                  rond={role !== "etablissement"}
                />

                <div>
                  <label htmlFor="bio" className="block text-sm font-medium text-dj-texte-muet">
                    {t.profilBio}
                  </label>
                  <textarea
                    id="bio"
                    rows={3}
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    className="mt-1 w-full rounded-lg border border-dj-bordure bg-dj-surface-haute px-3 py-2 text-dj-texte outline-none focus:border-dj-accent-1"
                  />
                </div>

                {role === "etablissement" && (
                  <>
                    <div>
                      <label htmlFor="contact" className="block text-sm font-medium text-dj-texte-muet">
                        {t.profilContact}
                      </label>
                      <input
                        id="contact"
                        type="text"
                        value={contact}
                        onChange={(e) => setContact(e.target.value)}
                        className="mt-1 w-full rounded-lg border border-dj-bordure bg-dj-surface-haute px-3 py-2 text-dj-texte outline-none focus:border-dj-accent-1"
                      />
                    </div>
                    <div>
                      <label htmlFor="site-web" className="block text-sm font-medium text-dj-texte-muet">
                        {t.profilSiteWeb}
                      </label>
                      <input
                        id="site-web"
                        type="url"
                        value={siteWeb}
                        onChange={(e) => setSiteWeb(e.target.value)}
                        className="mt-1 w-full rounded-lg border border-dj-bordure bg-dj-surface-haute px-3 py-2 text-dj-texte outline-none focus:border-dj-accent-1"
                      />
                    </div>
                  </>
                )}

                <div>
                  <label htmlFor="email-contact" className="block text-sm font-medium text-dj-texte-muet">
                    {t.profilEmailContact}
                  </label>
                  <input
                    id="email-contact"
                    type="email"
                    value={emailContact}
                    onChange={(e) => setEmailContact(e.target.value)}
                    className="mt-1 w-full rounded-lg border border-dj-bordure bg-dj-surface-haute px-3 py-2 text-dj-texte outline-none focus:border-dj-accent-1"
                  />
                </div>

                {role !== "etablissement" && (
                  <div>
                    <label htmlFor="matiere" className="block text-sm font-medium text-dj-texte-muet">
                      {t.profilMatiere}
                    </label>
                    <input
                      id="matiere"
                      type="text"
                      value={matiere}
                      onChange={(e) => setMatiere(e.target.value)}
                      className="mt-1 w-full rounded-lg border border-dj-bordure bg-dj-surface-haute px-3 py-2 text-dj-texte outline-none focus:border-dj-accent-1"
                    />
                  </div>
                )}

                {erreur && <p className="text-sm text-[#F87171]">{erreur}</p>}
                {succes && <p className="text-sm text-dj-succes">{t.successRedirect}</p>}

                <button
                  type="submit"
                  disabled={enCours || !nomAffiche.trim()}
                  className="w-full rounded-xl bg-dj-gradient px-4 py-2.5 text-sm font-bold text-[#1A0D02] shadow-[0_2px_14px_rgba(217,99,31,0.25)] transition-transform hover:-translate-y-0.5 disabled:opacity-50 disabled:hover:translate-y-0"
                >
                  {enCours ? t.profilSubmitButtonLoading : t.profilSubmitButton}
                </button>
              </form>
            </>
          )}
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

function EtapeRattachement({
  titre,
  placeholder,
  vide,
  options,
  erreurListe,
  valeur,
  onChange,
  onRetour,
  onSuivant,
  labelRetour,
  labelSuivant,
}: {
  titre: string;
  placeholder: string;
  vide: string;
  options: CompteListe[] | null;
  erreurListe: string | null;
  valeur: string;
  onChange: (v: string) => void;
  onRetour: () => void;
  onSuivant: () => void;
  labelRetour: string;
  labelSuivant: string;
}) {
  return (
    <>
      <h1 className="font-display text-xl font-bold text-dj-texte">{titre}</h1>

      {options === null && !erreurListe && (
        <p className="mt-4 text-sm text-dj-texte-muet">…</p>
      )}
      {erreurListe && <p className="mt-4 text-sm text-[#F87171]">{erreurListe}</p>}
      {options !== null && options.length === 0 && !erreurListe && (
        <p className="mt-4 text-sm text-dj-texte-muet">{vide}</p>
      )}

      {options !== null && options.length > 0 && (
        <select
          value={valeur}
          onChange={(e) => onChange(e.target.value)}
          className="mt-4 w-full rounded-lg border border-dj-bordure bg-dj-surface-haute px-3 py-2 text-dj-texte outline-none focus:border-dj-accent-1"
        >
          <option value="" disabled>
            {placeholder}
          </option>
          {options.map((o) => (
            <option key={o.user_id} value={o.user_id}>
              {o.nom_affiche}
            </option>
          ))}
        </select>
      )}

      <div className="mt-4 flex gap-2">
        <button
          type="button"
          onClick={onRetour}
          className="rounded-xl border border-dj-bordure px-4 py-2.5 text-sm font-medium text-dj-texte-muet transition-colors hover:border-dj-bordure-forte hover:text-dj-texte"
        >
          {labelRetour}
        </button>
        <button
          type="button"
          onClick={onSuivant}
          className="flex-1 rounded-xl bg-dj-gradient px-4 py-2.5 text-sm font-bold text-[#1A0D02] shadow-[0_2px_14px_rgba(217,99,31,0.25)] transition-transform hover:-translate-y-0.5"
        >
          {labelSuivant}
        </button>
      </div>
    </>
  );
}

// Extrait les codes/messages standardisés du backend (voir
// core/erreurs.py:erreur_api -> {"detail": {"code", "message"}}) pour
// afficher un texte propre plutôt que le JSON brut. Repli sur le message
// d'erreur générique si le corps n'a pas ce format.
function messageErreur(e: unknown): string {
  if (e instanceof Error) {
    const correspondance = e.message.match(/\{.*\}$/);
    if (correspondance) {
      try {
        const corps = JSON.parse(correspondance[0]);
        if (corps?.detail?.message) return corps.detail.message as string;
      } catch {
        // Corps non-JSON : on garde le message brut ci-dessous.
      }
    }
    return e.message;
  }
  return "Une erreur est survenue.";
}
