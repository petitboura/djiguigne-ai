"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import Image from "next/image";
import { appelerApi, appelerApiFichier, ajouterFichierBibliotheque, ajouterLienBibliotheque } from "@/lib/api";
import { siteConfig } from "@/lib/site-config";
import { TopBar } from "@/components/TopBar";
import { BoutonRetour } from "@/components/BoutonRetour";
import { BoutonAccueil } from "@/components/BoutonAccueil";
import { ChampImage } from "@/components/ChampImage";
import { IconeGenerique } from "@/components/icones/IconeGenerique";
import { DroitsAgent } from "@/components/DroitsAgent";
import { ProactiviteAgent } from "@/components/ProactiviteAgent";
import { AdministrateursAgent } from "@/components/AdministrateursAgent";
import { LienVersApp } from "@/components/LienVersApp";
import { PopupCategorieSpecialite, LABELS_CATEGORIE, type CleSection, type SelectionCategorie } from "@/components/PopupCategorieSpecialite";

// Étape "modifier un agent" (2026-07-12, demande de Bourama : "on ne peut
// pas modifier ces agents créés" — gros morceau manquant depuis le début
// du pivot social). Consomme GET/PATCH /api/agents/{id}/edition et
// /api/agents/{id} (voir api/agents.py, ajoutés à cette étape).
//
// Le formulaire édite le `system_prompt` BRUT (textarea), pas des champs
// séparés ton/posture/comportements comme à la création : ces champs ne
// sont jamais persistés individuellement en base (voir AgentEditable côté
// backend), seul le texte composé final survit. Même choix que
// faces/vues/mes_agents.py fait déjà côté Streamlit.

type AgentEditable = {
  id: string;
  nom: string;
  // Ajouté 2026-08-05 : distingue le propriétaire d'un administrateur
  // désigné, qui charge la même page mais ne voit pas l'onglet
  // Administrateurs (voir estProprietaireAgent plus bas).
  owner_id: string;
  // Nouveau système d'icône (2026-08-05) : remplace icone_page (emoji) et
  // image_vitrine_url (bannière) partout dans l'affichage. Voir
  // migrations/2026_08_05_ajout_icone_url_agents.sql (djiguigne-backend).
  icone_url: string | null;
  system_prompt: string;
  notion_page_id: string | null;
  texte_libre: string;
  description: string;
  sous_titre: string;
  placeholder_saisie: string;
  actif: boolean;
  matiere: string | null;
  matiere_detail: string | null;
  // Ajoutés le 08/08/2026 : renvoyés par le backend depuis toujours
  // (AgentEditable), simplement jamais lus ni affichés ici -- voir
  // PopupCategorieSpecialite.
  langue_africaine: string | null;
  metier: string | null;
  filiere: string | null;
  domaine: string | null;
  execution: string | null;
  profil_utilisateur_schema: { nom: string; description: string }[];
};

type DocumentIndexe = { nom_stockage: string; nom_affiche: string; url: string };
type FichierBiblio = {
  id: string;
  nom_fichier: string;
  type_mime: string;
  description: string | null;
  url_publique: string;
  created_at: string;
};

// Onglets ajoutés le 27/07 (Bourama : "je veux que le dashboard ressemble
// à ça pour les sections" -- même pattern que les onglets du feed
// (app/page.tsx:Onglet), une seule section affichée à la fois plutôt
// qu'un long scroll. Les 4 premiers restent dans le <form> principal
// (un seul PATCH /api/agents/{id} pour les 4, l'état de chacun survit
// même quand sa section n'est pas affichée) ; les 5 suivants gèrent déjà
// leur propre sauvegarde indépendamment (DroitsAgent, ProactiviteAgent,
// Documents, Bibliothèque, Mise à jour).
const SECTIONS = [
  { id: "vitrine", label: "Vitrine publique" },
  { id: "comportement", label: "Comportement" },
  { id: "connaissance", label: "Base de connaissance" },
  { id: "profil", label: "Profil utilisateur" },
  { id: "droits", label: "Droits" },
  { id: "proactivite", label: "Proactivité" },
  { id: "documents", label: "Documents PDF" },
  // Réservé au propriétaire, jamais à un administrateur désigné (2026-08-05,
  // voir AdministrateursAgent.tsx) -- filtré à l'affichage plus bas, pas ici,
  // pour ne pas dupliquer la liste des ids valides de SectionId.
  { id: "administrateurs", label: "Administrateurs" },
  { id: "maj", label: "Mise à jour" },
] as const;
type SectionId = (typeof SECTIONS)[number]["id"] | "bibliotheque" | "moi" | "article";

// Liste des IA du créateur, affichée en permanence dans la colonne de
// gauche (Bourama, 27/07 : "comme des pubs", plus de puce/popup) --
// cliquer sur l'une d'elles change d'agent en cours d'édition.
type AgentMini = { id: string; nom: string; icone_url?: string | null };

function categorieFichierBiblio(mime: string): "image" | "video" | "audio" | "document" | "lien" {
  if (mime === "text/uri-list") return "lien";
  if (mime.startsWith("image/")) return "image";
  if (mime.startsWith("video/")) return "video";
  if (mime.startsWith("audio/")) return "audio";
  return "document";
}

// Icônes de la sidebar (Bourama, 27/07 : "enlève tes emojis et ajoute des
// icônes dignes de ma plateforme") -- même style que BoutonAccueil.tsx et
// le chevron de la sidebar : traits (stroke), pas de remplissage, currentColor.
function IconeNav({ nom }: { nom: "bibliotheque" | "moi" | "article" | "etablissements" }) {
  const commun = {
    width: 16,
    height: 16,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 2,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
  };

  if (nom === "bibliotheque") {
    return (
      <svg {...commun}>
        <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
        <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
      </svg>
    );
  }

  if (nom === "moi") {
    return (
      <svg {...commun}>
        <circle cx="12" cy="8" r="4" />
        <path d="M4 20c0-4 3.6-6 8-6s8 2 8 6" />
      </svg>
    );
  }

  if (nom === "etablissements") {
    return (
      <svg {...commun}>
        <path d="M4 21V7l8-4 8 4v14" />
        <path d="M4 21h16" />
        <line x1="9" y1="21" x2="9" y2="13" />
        <line x1="15" y1="21" x2="15" y2="13" />
      </svg>
    );
  }

  return (
    <svg {...commun}>
      <path d="M14 3H6a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z" />
      <path d="M14 3v6h6" />
      <line x1="8" y1="13" x2="16" y2="13" />
      <line x1="8" y1="17" x2="16" y2="17" />
    </svg>
  );
}

export default function PageModifierAgent() {
  const router = useRouter();
  const params = useParams();
  const agentId = params.id as string;

  const [session, setSession] = useState<
    Awaited<ReturnType<typeof supabase.auth.getSession>>["data"]["session"] | null | undefined
  >(undefined);

  const [chargement, setChargement] = useState(true);
  const [erreurChargement, setErreurChargement] = useState<string | null>(null);

  const [nom, setNom] = useState("");
  const [iconeUrl, setIconeUrl] = useState("");
  const [description, setDescription] = useState("");
  // Ajouté le 2026-07-12 (Bourama : "le dashboard de modification aussi
  // changer") -- même correctif que le formulaire de création, distinct
  // de `description` (taille libre).
  const [sousTitre, setSousTitre] = useState("");
  const [placeholderSaisie, setPlaceholderSaisie] = useState("");
  const [systemPrompt, setSystemPrompt] = useState("");
  const [lienNotion, setLienNotion] = useState("");
  const [texteLibre, setTexteLibre] = useState("");
  // Même correctif que la page de création (2026-07-12, Bourama).
  const [pleinEcranTexteLibre, setPleinEcranTexteLibre] = useState(false);
  const [pleinEcranSystemPrompt, setPleinEcranSystemPrompt] = useState(false);
  const [actif, setActif] = useState(true);
  // Système "matière" (2026-07-29) : remplace le picker de catégorie ici
  // aussi, même logique que le formulaire de création -- indépendant de
  // l'ancien système catégorie (categorie_id reste en base, inutilisé
  // par ce formulaire).
  const [matiereChoisie, setMatiereChoisie] = useState<string | null>(null);
  const [autreMatiereTexte, setAutreMatiereTexte] = useState("");
  const [matieresDisponibles, setMatieresDisponibles] = useState<
    { nom: string; disponible: boolean }[] | null
  >(null);
  // Catégorie/spécialité (08/08/2026) : un agent peut appartenir à l'une
  // des 6 catégories (matieres/metier/filiere/domaine/languesAfricaines/
  // execution), pas seulement "matiere" -- voir PopupCategorieSpecialite.
  // categorieActive détermine laquelle est actuellement remplie en base ;
  // valeurCategorieLibre porte la valeur pour les 5 catégories texte
  // libre (metier/filiere/domaine/languesAfricaines/execution), matiere
  // continue d'utiliser matiereChoisie/autreMatiereTexte ci-dessus.
  const [categorieActive, setCategorieActive] = useState<CleSection | null>(null);
  const [valeurCategorieLibre, setValeurCategorieLibre] = useState("");

  useEffect(() => {
    appelerApi("/api/matieres")
      .then((data) => setMatieresDisponibles(data as { nom: string; disponible: boolean }[]))
      .catch(() => setMatieresDisponibles([]));
  }, []);

  // Même fonctionnalité que la page de création (2026-07-21), voir
  // ChampProfilUtilisateur côté api/agents.py.
  const [profilChamps, setProfilChamps] = useState<
    { nom: string; description: string }[]
  >([]);
  function ajouterChampProfil() {
    setProfilChamps((prev) => [...prev, { nom: "", description: "" }]);
  }
  function majChampProfil(i: number, champ: "nom" | "description", valeur: string) {
    setProfilChamps((prev) =>
      prev.map((c, idx) => (idx === i ? { ...c, [champ]: valeur } : c))
    );
  }
  function supprimerChampProfil(i: number) {
    setProfilChamps((prev) => prev.filter((_, idx) => idx !== i));
  }

  const [documents, setDocuments] = useState<DocumentIndexe[] | null>(null);
  const [nouveauPdf, setNouveauPdf] = useState<File | null>(null);
  const [envoiPdf, setEnvoiPdf] = useState(false);

  const [fichiersBiblio, setFichiersBiblio] = useState<FichierBiblio[] | null>(null);
  const [nouveauFichierBiblio, setNouveauFichierBiblio] = useState<File | null>(null);
  const [titreFichierBiblio, setTitreFichierBiblio] = useState("");
  const [descriptionFichierBiblio, setDescriptionFichierBiblio] = useState("");
  const [envoiBiblio, setEnvoiBiblio] = useState(false);
  // Ajoutés le 01/08 (Bourama : "Lien" demandait quand même un upload,
  // alors que ça n'a rien à voir) -- bascule le formulaire entre les deux
  // modes ; urlLienBiblio n'est utilisé qu'en mode "lien".
  const [modeAjoutBiblio, setModeAjoutBiblio] = useState<"fichier" | "lien">("fichier");
  const [urlLienBiblio, setUrlLienBiblio] = useState("");
  // Sous-onglets Bibliothèque (Bourama, 27/07 : "il y a plusieurs [types]
  // du coup je veux que... son clic affiche aussi des onglets, images
  // vidéos etc") -- catégorie déduite du type_mime déjà stocké côté
  // backend (core/bibliotheque_fichiers.py), pas de nouveau champ.
  const [biblioFiltre, setBiblioFiltre] = useState<
    "tous" | "image" | "video" | "audio" | "document" | "lien"
  >("tous");

  const [enregistrement, setEnregistrement] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [erreur, setErreur] = useState<string | null>(null);

  const [sectionActive, setSectionActive] = useState<SectionId>("vitrine");

  const [mesAgents, setMesAgents] = useState<AgentMini[] | null>(null);
  // Lien vers /etablissements réservé à Bourama (Bourama, 04/08 : "juste
  // moi dans mon espace dans la vitrine") -- dynamique via profiles.role
  // === "admin" (voir api/roles.py), jamais un email en dur.
  const [estAdmin, setEstAdmin] = useState(false);
  // Propriétaire vs administrateur désigné (2026-08-05) : les deux
  // chargent la même page /edition (peut_modifier_comportement accepte
  // maintenant agents_administrateurs, voir permissions_hierarchie.py),
  // mais seul le propriétaire peut désigner d'autres administrateurs.
  const [estProprietaireAgent, setEstProprietaireAgent] = useState(false);
  // Repliable "comme un tableau de bord" (Bourama, 27/07) : par défaut
  // ouverte, un bouton replie vers la gauche (largeur réduite, icônes
  // seules, plus de nom ni de bouton créer).
  const [sidebarReduite, setSidebarReduite] = useState(false);

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
    if (!session || !agentId) return;

    appelerApi(`/api/agents/${agentId}/edition`)
      .then((r: AgentEditable) => {
        setNom(r.nom);
        setEstProprietaireAgent(r.owner_id === session.user.id);
        setIconeUrl(r.icone_url || "");
        setDescription(r.description || "");
        setSousTitre(r.sous_titre || "");
        setPlaceholderSaisie(r.placeholder_saisie || "");
        setSystemPrompt(r.system_prompt || "");
        setLienNotion(r.notion_page_id || "");
        setTexteLibre(r.texte_libre || "");
        setActif(r.actif);
        setProfilChamps(r.profil_utilisateur_schema || []);
        setMatiereChoisie(r.matiere || null);
        setAutreMatiereTexte(r.matiere_detail || "");
        // Détermine laquelle des 6 catégories est actuellement remplie
        // en base (un agent n'en a jamais qu'une, cf. exclusivité côté
        // backend) -- voir PopupCategorieSpecialite.
        if (r.matiere) {
          setCategorieActive("matieres");
        } else if (r.metier) {
          setCategorieActive("metier");
          setValeurCategorieLibre(r.metier);
        } else if (r.filiere) {
          setCategorieActive("filiere");
          setValeurCategorieLibre(r.filiere);
        } else if (r.domaine) {
          setCategorieActive("domaine");
          setValeurCategorieLibre(r.domaine);
        } else if (r.langue_africaine) {
          setCategorieActive("languesAfricaines");
          setValeurCategorieLibre(r.langue_africaine);
        } else if (r.execution) {
          setCategorieActive("execution");
          setValeurCategorieLibre(r.execution);
        }
      })
      .catch((e) => setErreurChargement(e instanceof Error ? e.message : "Erreur inconnue."))
      .finally(() => setChargement(false));

    chargerDocuments();
    chargerBibliotheque();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session, agentId]);

  useEffect(() => {
    if (!session) return;
    // Même endpoint que /dashboard (GET /api/profiles/{user_id}) : on
    // n'a besoin ici que de id/nom/icone_url, mais la route ne renvoie
    // pas moins -- champs superflus ignorés côté AgentMini.
    appelerApi(`/api/profiles/${session.user.id}`)
      .then((r: { agents: AgentMini[] }) => setMesAgents(r.agents))
      .catch(() => setMesAgents([]));
  }, [session]);

  useEffect(() => {
    if (!session) return;
    appelerApi("/api/roles/moi")
      .then((r: { role: string | null }) => setEstAdmin(r.role === "admin"))
      .catch(() => setEstAdmin(false));
  }, [session]);

  function chargerDocuments() {
    appelerApi(`/api/agents/${agentId}/documents`)
      .then((r: DocumentIndexe[]) => setDocuments(r))
      .catch(() => setDocuments([]));
  }

  function chargerBibliotheque() {
    appelerApi(`/api/agents/${agentId}/bibliotheque`)
      .then((r: FichierBiblio[]) => setFichiersBiblio(r))
      .catch(() => setFichiersBiblio([]));
  }

  async function enregistrer(e: React.FormEvent) {
    e.preventDefault();
    if (categorieActive === "matieres" && matiereChoisie === "Autre" && !autreMatiereTexte.trim()) {
      setErreur('Précise la matière dans "Autre".');
      return;
    }
    setEnregistrement(true);
    setMessage(null);
    setErreur(null);
    try {
      // Catégorie/spécialité (08/08/2026) : seul le champ de la catégorie
      // ACTIVE est envoyé (les 5 autres restent `undefined`, donc absents
      // du JSON -- JSON.stringify élimine les clés undefined). Le
      // backend vide alors automatiquement les 5 autres colonnes
      // (exclusivité, voir api/agents.py:modifier_agent) -- pas besoin de
      // les envoyer explicitement à null ici.
      const champsCategorie: Record<string, string | null | undefined> = {
        matiere: categorieActive === "matieres" ? matiereChoisie : undefined,
        matiere_detail:
          categorieActive === "matieres"
            ? matiereChoisie === "Autre"
              ? autreMatiereTexte.trim()
              : null
            : undefined,
        metier: categorieActive === "metier" ? valeurCategorieLibre : undefined,
        filiere: categorieActive === "filiere" ? valeurCategorieLibre : undefined,
        domaine: categorieActive === "domaine" ? valeurCategorieLibre : undefined,
        langue_africaine: categorieActive === "languesAfricaines" ? valeurCategorieLibre : undefined,
        execution: categorieActive === "execution" ? valeurCategorieLibre : undefined,
      };
      await appelerApi(`/api/agents/${agentId}`, {
        method: "PATCH",
        body: JSON.stringify({
          nom,
          icone_url: iconeUrl || null,
          system_prompt: systemPrompt,
          lien_notion: lienNotion || null,
          texte_libre: texteLibre,
          description,
          sous_titre: sousTitre,
          placeholder_saisie: placeholderSaisie,
          actif,
          ...champsCategorie,
          profil_utilisateur_schema: profilChamps
            .filter((c) => c.nom.trim())
            .map((c) => ({ nom: c.nom.trim(), description: c.description.trim() })),
        }),
      });
      setMessage("IA mise à jour.");
    } catch (e) {
      setErreur(e instanceof Error ? e.message : "Erreur inconnue.");
    } finally {
      setEnregistrement(false);
    }
  }

  async function ajouterPdf() {
    if (!nouveauPdf) return;
    setEnvoiPdf(true);
    try {
      await appelerApiFichier(`/api/agents/${agentId}/documents`, nouveauPdf);
      setNouveauPdf(null);
      chargerDocuments();
    } catch (e) {
      window.alert(e instanceof Error ? e.message : "Échec de l'ajout du PDF.");
    } finally {
      setEnvoiPdf(false);
    }
  }

  async function supprimerPdf(nomStockage: string) {
    if (!window.confirm(`Supprimer « ${nomStockage.split("__").slice(1).join("__")} » ?`)) return;
    try {
      await appelerApi(`/api/agents/${agentId}/documents/${encodeURIComponent(nomStockage)}`, {
        method: "DELETE",
      });
      chargerDocuments();
    } catch (e) {
      window.alert(e instanceof Error ? e.message : "Échec de la suppression.");
    }
  }

  async function ajouterFichierBiblio() {
    if (modeAjoutBiblio === "lien") {
      if (!urlLienBiblio.trim() || !descriptionFichierBiblio.trim()) return;
      setEnvoiBiblio(true);
      try {
        await ajouterLienBibliotheque(
          agentId,
          urlLienBiblio.trim(),
          descriptionFichierBiblio.trim(),
          titreFichierBiblio.trim()
        );
        setUrlLienBiblio("");
        setTitreFichierBiblio("");
        setDescriptionFichierBiblio("");
        chargerBibliotheque();
      } catch (e) {
        window.alert(e instanceof Error ? e.message : "Échec de l'ajout du lien.");
      } finally {
        setEnvoiBiblio(false);
      }
      return;
    }
    if (!nouveauFichierBiblio || !descriptionFichierBiblio.trim()) return;
    setEnvoiBiblio(true);
    try {
      await ajouterFichierBibliotheque(
        agentId,
        nouveauFichierBiblio,
        descriptionFichierBiblio.trim(),
        titreFichierBiblio.trim()
      );
      setNouveauFichierBiblio(null);
      setTitreFichierBiblio("");
      setDescriptionFichierBiblio("");
      chargerBibliotheque();
    } catch (e) {
      window.alert(e instanceof Error ? e.message : "Échec de l'ajout du fichier.");
    } finally {
      setEnvoiBiblio(false);
    }
  }

  async function supprimerFichierBiblio(id: string, nom: string) {
    if (!window.confirm(`Supprimer « ${nom} » de la bibliothèque ?`)) return;
    try {
      await appelerApi(`/api/agents/${agentId}/bibliotheque/${id}`, { method: "DELETE" });
      chargerBibliotheque();
    } catch (e) {
      window.alert(e instanceof Error ? e.message : "Échec de la suppression.");
    }
  }

  if (session === undefined || session === null) return null;
  if (chargement) {
    return (
      <div className="min-h-screen">
        <TopBar />
        <p className="px-5 py-10 text-dj-texte-muet">Chargement...</p>
      </div>
    );
  }
  if (erreurChargement) {
    return (
      <div className="min-h-screen">
        <TopBar />
        <p className="px-5 py-10 text-[#F87171]">{erreurChargement}</p>
      </div>
    );
  }

  const champClasse =
    "mt-1 w-full rounded-lg border border-dj-bordure bg-dj-surface-haute px-3 py-2 text-dj-texte outline-none focus:border-dj-accent-1";
  const labelClasse = "block text-sm font-medium text-dj-texte-muet";

  return (
    <div className="min-h-screen">
      <TopBar />

      <main className="mx-auto max-w-6xl px-5 py-10">
        <div className="flex flex-col gap-8 md:flex-row md:items-start">
          {/* Liste de tes IA "comme des pubs" (Bourama, 27/07) : plus de
              puce/popup "Mes IA" -- la liste reste affichée en
              permanence à gauche, cette page EST le dashboard. L'ancien
              /dashboard (grille "IA créées (N)" + bouton créer)
              disparaît, son contenu est ici. Repliable comme un vrai
              tableau de bord (même jour) : bouton chevron en haut, se
              réduit à une bande d'icônes ; "+ Créer une IA" retiré (la
              création passe maintenant par "Devenir créateur"/
              /dashboard/agents/nouveau directement). */}
          <aside
            className={`flex flex-shrink-0 flex-row gap-3 overflow-x-auto pb-2 transition-[width] md:flex-col md:overflow-visible md:pb-0 ${
              sidebarReduite ? "md:w-14" : "md:w-64"
            }`}
          >
            <button
              type="button"
              onClick={() => setSidebarReduite((v) => !v)}
              aria-label={sidebarReduite ? "Déplier la liste" : "Replier la liste"}
              className="hidden h-9 w-9 flex-shrink-0 items-center justify-center self-end rounded-full border border-dj-bordure text-dj-texte-muet transition-colors hover:border-dj-bordure-forte hover:text-dj-texte md:flex"
            >
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className={`transition-transform ${sidebarReduite ? "rotate-180" : ""}`}
              >
                <path d="M15 6l-6 6 6 6" />
              </svg>
            </button>

            {/* Bibliothèque sort des onglets du haut et vit ici (Bourama,
                27/07) : "autre chose" que les 8 sections simples --
                plusieurs types de contenu (image/vidéo/document...), son
                clic affiche ses propres sous-onglets (voir plus bas,
                sectionActive === "bibliotheque"). */}
            <button
              type="button"
              onClick={() => setSectionActive("bibliotheque")}
              title="Bibliothèque"
              className={`flex flex-shrink-0 items-center gap-2 whitespace-nowrap rounded-2xl border px-4 py-3 text-sm transition-colors md:justify-start ${
                sidebarReduite ? "md:w-10 md:justify-center md:px-0" : ""
              } ${
                sectionActive === "bibliotheque"
                  ? "border-dj-accent-1 bg-dj-surface-haute text-dj-texte"
                  : "border-dj-bordure text-dj-texte-muet hover:border-dj-bordure-forte hover:text-dj-texte"
              }`}
            >
              <IconeNav nom="bibliotheque" />
              <span className={sidebarReduite ? "truncate md:hidden" : "truncate"}>Bibliothèque</span>
            </button>

            {/* Moi / Article : ajoutés le 27/07 à la demande de Bourama,
                contenu pas encore défini ("je te dirais quoi mettre
                après") -- pour l'instant juste la navigation + un
                placeholder, comme Bibliothèque au moment de sa création. */}
            {(
              [
                ["moi", "Moi"],
                ["article", "Article"],
              ] as const
            ).map(([id, label]) => (
              <button
                key={id}
                type="button"
                onClick={() => setSectionActive(id)}
                title={label}
                className={`flex flex-shrink-0 items-center gap-2 whitespace-nowrap rounded-2xl border px-4 py-3 text-sm transition-colors md:justify-start ${
                  sidebarReduite ? "md:w-10 md:justify-center md:px-0" : ""
                } ${
                  sectionActive === id
                    ? "border-dj-accent-1 bg-dj-surface-haute text-dj-texte"
                    : "border-dj-bordure text-dj-texte-muet hover:border-dj-bordure-forte hover:text-dj-texte"
                }`}
              >
                <IconeNav nom={id} />
                <span className={sidebarReduite ? "truncate md:hidden" : "truncate"}>{label}</span>
              </button>
            ))}

            {estAdmin && (
              <Link
                href={`/${siteConfig.defaultLocale}/etablissements`}
                title="Établissements"
                className={`flex flex-shrink-0 items-center gap-2 whitespace-nowrap rounded-2xl border border-dj-bordure px-4 py-3 text-sm text-dj-texte-muet transition-colors hover:border-dj-bordure-forte hover:text-dj-texte md:justify-start ${
                  sidebarReduite ? "md:w-10 md:justify-center md:px-0" : ""
                }`}
              >
                <IconeNav nom="etablissements" />
                <span className={sidebarReduite ? "truncate md:hidden" : "truncate"}>Établissements</span>
              </Link>
            )}

            <div className="my-1 hidden h-px w-full bg-dj-bordure md:block" />

            {mesAgents === null && (
              <p className="px-3 py-3 text-sm text-dj-texte-muet">Chargement...</p>
            )}
            {mesAgents?.map((a) => (
              <Link
                key={a.id}
                href={`/dashboard/agents/${a.id}/modifier`}
                title={a.nom}
                className={`flex flex-shrink-0 items-center gap-2 whitespace-nowrap rounded-2xl border px-4 py-3 text-sm transition-colors md:justify-start ${
                  sidebarReduite ? "md:w-10 md:justify-center md:px-0" : ""
                } ${
                  a.id === agentId
                    ? "border-dj-accent-1 bg-dj-surface-haute text-dj-texte"
                    : "border-dj-bordure text-dj-texte-muet hover:border-dj-bordure-forte hover:text-dj-texte"
                }`}
              >
                <span className="relative flex h-6 w-6 shrink-0 items-center justify-center overflow-hidden rounded-full bg-dj-surface-haute">
                  {a.icone_url ? (
                    <Image src={a.icone_url} alt="" fill className="object-cover" sizes="24px" />
                  ) : (
                    <IconeGenerique className="h-3.5 w-3.5 text-dj-accent-1" />
                  )}
                </span>
                <span className={sidebarReduite ? "truncate md:hidden" : "truncate"}>{a.nom}</span>
              </Link>
            ))}
          </aside>

          <div className="min-w-0 flex-1">
        <div className="sticky top-3 z-20 mb-5 flex gap-2">
          <BoutonRetour />
          <BoutonAccueil />
        </div>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h1 className="font-display text-2xl font-bold text-dj-texte">Modifier {nom}</h1>

          {/* "Tester" (2026-08-04, demande Bourama) : équivalent du bouton
              présent dans "Mon espace" côté app (djiguigne-frontend,
              AgentCard.tsx) -- accès direct au chat de l'IA. La vitrine
              n'héberge pas le chat elle-même, donc on pointe vers l'app
              via siteConfig.appUrl plutôt qu'une route locale.
              07/08 : LienVersApp transporte la session pour arriver déjà
              connecté -- volontairement SANS ?retour= : un test par le
              créateur ne doit pas remplacer son IA par défaut. */}
          <LienVersApp
            chemin={`/agent/${agentId}/chat`}
            nouvelOnglet
            className="rounded-full border border-dj-bordure bg-dj-fond/80 px-4 py-2 text-sm font-medium text-dj-texte-muet transition-colors hover:border-dj-bordure-forte hover:text-dj-texte"
          >
            Tester
          </LienVersApp>
        </div>

        {sectionActive !== "bibliotheque" && sectionActive !== "moi" && sectionActive !== "article" && (
        <div className="mb-2 mt-6 flex flex-wrap gap-x-6 gap-y-3 border-b border-dj-bordure pb-0">
            {SECTIONS.filter((s) => s.id !== "administrateurs" || estProprietaireAgent).map((s) => (
              <Onglet key={s.id} actif={sectionActive === s.id} onClick={() => setSectionActive(s.id)}>
                {s.label}
              </Onglet>
            ))}
        </div>
        )}

        <form onSubmit={enregistrer} className="mt-6 flex flex-col gap-8">
          {sectionActive === "vitrine" && (
          <section className="flex flex-col gap-4 rounded-2xl border border-dj-bordure bg-dj-surface p-6">
            <h2 className="font-display text-base font-bold text-dj-texte">Vitrine publique</h2>

            <div>
              <label className={labelClasse}>Nom de l&apos;IA</label>
              <input value={nom} onChange={(e) => setNom(e.target.value)} className={champClasse} />
            </div>

            <ChampImage
              label="Icône"
              valeur={iconeUrl}
              onChange={setIconeUrl}
              rond
            />

            <div>
              <label className={labelClasse}>Description publique</label>
              <p className="mt-1 text-xs text-dj-texte-muet">
                Le texte de présentation de l&apos;agent (fiche, recherche) — aucune
                limite de taille.
              </p>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
                className={champClasse}
              />
            </div>

            <div>
              <label className={labelClasse}>Catégorie / spécialité</label>
              <p className="mt-1 text-xs text-dj-texte-muet">
                Choisie à la création, une seule à la fois — un bouton pour la
                changer plutôt que la liste complète affichée en permanence.
              </p>
              <div className="mt-2">
                <PopupCategorieSpecialite
                  labelActuel={
                    categorieActive
                      ? `${LABELS_CATEGORIE[categorieActive]} — ${
                          categorieActive === "matieres"
                            ? matiereChoisie === "Autre"
                              ? autreMatiereTexte || "Autre"
                              : matiereChoisie
                            : valeurCategorieLibre
                        }`
                      : "Aucune catégorie choisie"
                  }
                  matieresDisponibles={matieresDisponibles}
                  matiereActuelle={matiereChoisie}
                  onValider={(selection: SelectionCategorie) => {
                    if (selection.categorie === "matieres") {
                      setCategorieActive("matieres");
                      setMatiereChoisie(selection.matiere);
                      setAutreMatiereTexte(selection.matiereDetail || "");
                      setValeurCategorieLibre("");
                    } else {
                      setCategorieActive(selection.categorie);
                      setValeurCategorieLibre(selection.valeur);
                      setMatiereChoisie(null);
                      setAutreMatiereTexte("");
                    }
                  }}
                />
              </div>
            </div>

            <div>
              <label className={labelClasse}>Phrase d&apos;accueil</label>
              <p className="mt-1 text-xs text-dj-texte-muet">
                Une phrase courte, affichée sous le titre au tout premier écran du
                chat, avant le premier message — distincte de la description
                publique ci-dessus.
              </p>
              <input
                value={sousTitre}
                onChange={(e) => setSousTitre(e.target.value)}
                placeholder="Ex : Je t'aide à structurer ton entraînement de la semaine."
                className={champClasse}
              />
            </div>

            <div>
              <label className={labelClasse}>Texte de la barre de saisie</label>
              <p className="mt-1 text-xs text-dj-texte-muet">
                Le texte affiché en fond dans le champ où l&apos;utilisateur écrit son
                message (avant qu&apos;il commence à taper).
              </p>
              <input
                value={placeholderSaisie}
                onChange={(e) => setPlaceholderSaisie(e.target.value)}
                placeholder="Pose ta question..."
                className={champClasse}
              />
            </div>

            <label className="flex items-center gap-2 text-sm text-dj-texte">
              <input
                type="checkbox"
                checked={actif}
                onChange={(e) => setActif(e.target.checked)}
              />
              Agent actif (visible et utilisable publiquement)
            </label>
          </section>
          )}

          {sectionActive === "comportement" && (
          <section className="flex flex-col gap-4 rounded-2xl border border-dj-bordure bg-dj-surface p-6">
            <h2 className="font-display text-base font-bold text-dj-texte">Comportement</h2>
            <div>
              <div className="flex items-center justify-between">
                <label className={labelClasse}>System prompt</label>
                <button
                  type="button"
                  onClick={() => setPleinEcranSystemPrompt(true)}
                  className="text-xs text-dj-accent-1 transition-colors hover:text-dj-accent-2"
                >
                  Plein écran ⤢
                </button>
              </div>
              <textarea
                value={systemPrompt}
                onChange={(e) => setSystemPrompt(e.target.value)}
                rows={10}
                className={`${champClasse} font-mono text-sm`}
              />
              <p className="mt-1 text-xs text-dj-texte-muet">
                C&apos;est le texte complet qui pilote le comportement de l&apos;agent — le
                modifier ici remplace directement ce qui avait été généré à la création.
              </p>
            </div>

            {pleinEcranSystemPrompt && (
              // Même pattern que "Connaissance libre" juste en dessous
              // (pleinEcranTexteLibre) -- system prompt tout aussi long,
              // même besoin d'espace pour l'éditer confortablement.
              <div className="fixed inset-0 z-50 flex flex-col bg-dj-fond p-5">
                <div className="flex items-center justify-between pb-3">
                  <h2 className="font-display text-lg font-bold text-dj-texte">System prompt</h2>
                  <button
                    type="button"
                    onClick={() => setPleinEcranSystemPrompt(false)}
                    className="rounded-full border border-dj-bordure px-4 py-2 text-sm text-dj-texte transition-colors hover:border-dj-bordure-forte"
                  >
                    Fermer
                  </button>
                </div>
                <textarea
                  value={systemPrompt}
                  onChange={(e) => setSystemPrompt(e.target.value)}
                  autoFocus
                  className={`${champClasse} flex-1 resize-none font-mono text-sm`}
                />
              </div>
            )}
          </section>
          )}

          {sectionActive === "connaissance" && (
          <section className="flex flex-col gap-4 rounded-2xl border border-dj-bordure bg-dj-surface p-6">
            <h2 className="font-display text-base font-bold text-dj-texte">
              Base de connaissance
            </h2>

            <div>
              <label className={labelClasse}>Lien ou ID d&apos;une page Notion</label>
              <input
                value={lienNotion}
                onChange={(e) => setLienNotion(e.target.value)}
                placeholder="https://www.notion.so/..."
                className={champClasse}
              />
            </div>

            <div>
              <div className="flex items-center justify-between">
                <label className={labelClasse}>Connaissance libre</label>
                <button
                  type="button"
                  onClick={() => setPleinEcranTexteLibre(true)}
                  className="text-xs text-dj-accent-1 transition-colors hover:text-dj-accent-2"
                >
                  Plein écran ⤢
                </button>
              </div>
              <p className="mt-1 text-xs text-dj-texte-muet">
                Pour une connaissance étendue que l&apos;agent doit avoir, mais qui
                n&apos;existe pas en PDF ou qui change souvent. Aucune limite de
                taille.
              </p>
              <textarea
                value={texteLibre}
                onChange={(e) => setTexteLibre(e.target.value)}
                rows={8}
                className={`${champClasse} resize-y`}
              />
            </div>

            {pleinEcranTexteLibre && (
              <div className="fixed inset-0 z-50 flex flex-col bg-dj-fond p-5">
                <div className="flex items-center justify-between pb-3">
                  <div>
                    <h2 className="font-display text-lg font-bold text-dj-texte">
                      Connaissance libre
                    </h2>
                    <p className="text-xs text-dj-texte-muet">
                      Pour une connaissance étendue, pas en PDF, ou qui change
                      souvent. Aucune limite de taille.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setPleinEcranTexteLibre(false)}
                    className="rounded-full border border-dj-bordure px-4 py-2 text-sm text-dj-texte transition-colors hover:border-dj-bordure-forte"
                  >
                    Fermer
                  </button>
                </div>
                <textarea
                  value={texteLibre}
                  onChange={(e) => setTexteLibre(e.target.value)}
                  autoFocus
                  className={`${champClasse} flex-1 resize-none font-mono text-sm`}
                />
              </div>
            )}
          </section>
          )}

          {sectionActive === "profil" && (
          <section className="flex flex-col gap-4 rounded-2xl border border-dj-bordure bg-dj-surface p-6">
            <h2 className="font-display text-base font-bold text-dj-texte">
              Profil utilisateur
            </h2>
            <p className="text-sm text-dj-texte-muet">
              Informations que ton IA retient automatiquement sur les personnes qui
              lui parlent (utilisateurs connectés). Vide = fonctionnalité désactivée.
            </p>

            {profilChamps.map((champ, i) => (
              <div
                key={i}
                className="flex flex-col gap-2 rounded-xl border border-dj-bordure bg-dj-surface-haute p-4 sm:flex-row sm:items-start"
              >
                <div className="flex-1">
                  <label className="text-xs font-semibold text-dj-texte-muet">
                    Nom du champ
                  </label>
                  <input
                    value={champ.nom}
                    onChange={(e) => majChampProfil(i, "nom", e.target.value)}
                    placeholder="Ex: niveau_scolaire"
                    className={champClasse}
                  />
                </div>
                <div className="flex-[2]">
                  <label className="text-xs font-semibold text-dj-texte-muet">
                    Description (guide l&apos;IA sur quoi chercher)
                  </label>
                  <input
                    value={champ.description}
                    onChange={(e) => majChampProfil(i, "description", e.target.value)}
                    placeholder="Ex: Niveau étudié actuellement (collège, lycée, prépa...)"
                    className={champClasse}
                  />
                </div>
                <button
                  type="button"
                  onClick={() => supprimerChampProfil(i)}
                  className="mt-1 self-start rounded-full border border-dj-bordure px-3 py-2 text-xs text-dj-texte-muet transition-colors hover:border-[#F87171] hover:text-[#F87171] sm:mt-6"
                >
                  Retirer
                </button>
              </div>
            ))}

            <button
              type="button"
              onClick={ajouterChampProfil}
              className="self-start rounded-full border border-dj-bordure px-4 py-2 text-sm text-dj-texte transition-colors hover:border-dj-bordure-forte"
            >
              + Ajouter un champ
            </button>
          </section>
          )}

          {(["vitrine", "comportement", "connaissance", "profil"] as SectionId[]).includes(
            sectionActive
          ) && (
            <>
              {erreur && <p className="text-sm text-[#F87171]">{erreur}</p>}

              <div className="flex items-center gap-3">
                <button
                  type="submit"
                  disabled={enregistrement}
                  className="rounded-full bg-dj-gradient px-6 py-3 text-sm font-bold text-[#1A0D02] transition-transform hover:-translate-y-0.5 disabled:opacity-50"
                >
                  {enregistrement ? "Enregistrement…" : "Enregistrer"}
                </button>
                {message && <span className="text-sm text-dj-texte-muet">{message}</span>}
              </div>
            </>
          )}
        </form>

        {sectionActive === "droits" && (
        <section className="mt-6">
          <h2 className="text-lg font-bold mb-4">Droits de l&apos;agent</h2>
          <DroitsAgent agentId={agentId} />
        </section>
        )}

        {sectionActive === "proactivite" && (
        <section className="mt-6">
          <h2 className="text-lg font-bold mb-4">Proactivité</h2>
          <ProactiviteAgent agentId={agentId} />
        </section>
        )}

        {sectionActive === "administrateurs" && estProprietaireAgent && (
        <section className="mt-6">
          <h2 className="text-lg font-bold mb-4">Administrateurs</h2>
          <AdministrateursAgent agentId={agentId} />
        </section>
        )}

        {sectionActive === "documents" && (
        <section className="mt-6 flex flex-col gap-4">
          <h2 className="font-display text-lg font-bold text-dj-texte">Documents PDF indexés</h2>

          {documents === null && <p className="text-sm text-dj-texte-muet">Chargement...</p>}
          {documents?.length === 0 && (
            <p className="text-sm text-dj-texte-muet">Aucun PDF indexé pour cette IA.</p>
          )}
          {documents && documents.length > 0 && (
            <div className="flex flex-col gap-2">
              {documents.map((doc) => (
                <div
                  key={doc.nom_stockage}
                  className="flex items-center justify-between rounded-xl border border-dj-bordure bg-dj-surface px-4 py-3"
                >
                  <a
                    href={doc.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-dj-accent-1 hover:text-dj-accent-2"
                  >
                    {doc.nom_affiche}
                  </a>
                  <button
                    onClick={() => supprimerPdf(doc.nom_stockage)}
                    className="text-xs text-dj-texte-muet transition-colors hover:text-[#F87171]"
                  >
                    Supprimer
                  </button>
                </div>
              ))}
            </div>
          )}

          <div className="flex items-center gap-3">
            <input
              type="file"
              accept="application/pdf"
              onChange={(e) => setNouveauPdf(e.target.files?.[0] ?? null)}
              className="text-sm text-dj-texte file:mr-3 file:rounded-full file:border file:border-dj-bordure file:bg-dj-surface-haute file:px-4 file:py-2 file:text-xs file:text-dj-texte hover:file:border-dj-bordure-forte"
            />
            <button
              type="button"
              onClick={ajouterPdf}
              disabled={!nouveauPdf || envoiPdf}
              className="rounded-full border border-dj-bordure px-4 py-2 text-xs text-dj-texte transition-colors hover:border-dj-bordure-forte disabled:opacity-50"
            >
              {envoiPdf ? "Envoi…" : "Ajouter"}
            </button>
          </div>
        </section>
        )}

        {sectionActive === "bibliotheque" && (
        <section className="mt-6 flex flex-col gap-4">
          {/* Sans ça, aucun moyen de repasser aux autres onglets une fois
              ici (Bourama, 27/07) : leur barre du haut est masquée sur
              cette section (demande précédente). */}
          <button
            type="button"
            onClick={() => setSectionActive("vitrine")}
            className="flex items-center gap-1.5 self-start text-sm text-dj-texte-muet transition-colors hover:text-dj-texte"
          >
            ← Retour aux sections
          </button>

          <h2 className="font-display text-lg font-bold text-dj-texte">
            Bibliothèque (images, audio, vidéo, PDF...)
          </h2>
          <p className="text-sm text-dj-texte-muet">
            Un fichier ajouté ici que ton IA peut retrouver et donner pendant une
            conversation. Un PDF est en plus automatiquement analysé pour enrichir les
            réponses de l&apos;IA, comme ci-dessus.
          </p>

          <div className="flex flex-wrap gap-x-5 gap-y-2 border-b border-dj-bordure pb-0">
            {(
              [
                ["tous", "Tous"],
                ["image", "Images"],
                ["video", "Vidéos"],
                ["audio", "Audio"],
                ["document", "Documents"],
                ["lien", "Lien"],
              ] as const
            ).map(([valeur, label]) => (
              <Onglet
                key={valeur}
                actif={biblioFiltre === valeur}
                onClick={() => {
                  setBiblioFiltre(valeur);
                  // Ajouté le 01/08 (Bourama : "pourquoi il y a fichier
                  // dans la section lien, je comprends pas" -- le
                  // formulaire d'ajout restait sur "Fichier" par défaut
                  // même en filtrant sur "Lien", aucun lien entre les
                  // deux). Le formulaire suit maintenant l'onglet cliqué.
                  setModeAjoutBiblio(valeur === "lien" ? "lien" : "fichier");
                }}
              >
                {label}
              </Onglet>
            ))}
          </div>

          {fichiersBiblio === null && <p className="text-sm text-dj-texte-muet">Chargement...</p>}
          {fichiersBiblio?.length === 0 && (
            <p className="text-sm text-dj-texte-muet">Aucun fichier dans la bibliothèque.</p>
          )}
          {fichiersBiblio && fichiersBiblio.length > 0 && (
            <div className="flex flex-col gap-2">
              {fichiersBiblio
                .filter(
                  (f) => biblioFiltre === "tous" || categorieFichierBiblio(f.type_mime) === biblioFiltre
                )
                .map((f) => (
                <div
                  key={f.id}
                  className="flex items-center justify-between rounded-xl border border-dj-bordure bg-dj-surface px-4 py-3"
                >
                  <a
                    href={f.url_publique}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-dj-accent-1 hover:text-dj-accent-2"
                  >
                    {f.description || f.nom_fichier}
                  </a>
                  <button
                    onClick={() => supprimerFichierBiblio(f.id, f.description || f.nom_fichier)}
                    className="text-xs text-dj-texte-muet transition-colors hover:text-[#F87171]"
                  >
                    Supprimer
                  </button>
                </div>
              ))}
            </div>
          )}

          <div className="flex flex-col gap-3">
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setModeAjoutBiblio("fichier")}
                className={`rounded-full border px-4 py-1.5 text-xs transition-colors ${
                  modeAjoutBiblio === "fichier"
                    ? "border-dj-bordure-forte bg-dj-surface-haute text-dj-texte"
                    : "border-dj-bordure text-dj-texte-muet hover:text-dj-texte"
                }`}
              >
                Fichier
              </button>
              <button
                type="button"
                onClick={() => setModeAjoutBiblio("lien")}
                className={`rounded-full border px-4 py-1.5 text-xs transition-colors ${
                  modeAjoutBiblio === "lien"
                    ? "border-dj-bordure-forte bg-dj-surface-haute text-dj-texte"
                    : "border-dj-bordure text-dj-texte-muet hover:text-dj-texte"
                }`}
              >
                Lien
              </button>
            </div>
            <textarea
              placeholder={
                modeAjoutBiblio === "lien"
                  ? "Description (obligatoire) : de quoi parle ce lien, dans quel contexte l'IA doit le proposer ?"
                  : "Description (obligatoire) : de quoi parle ce fichier, dans quel contexte l'IA doit le proposer ?"
              }
              value={descriptionFichierBiblio}
              onChange={(e) => setDescriptionFichierBiblio(e.target.value)}
              rows={2}
              className="rounded-2xl border border-dj-bordure bg-dj-surface px-4 py-2 text-sm text-dj-texte outline-none focus:border-dj-bordure-forte"
            />
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
              <input
                type="text"
                placeholder="Titre (optionnel)"
                value={titreFichierBiblio}
                onChange={(e) => setTitreFichierBiblio(e.target.value)}
                className="rounded-full border border-dj-bordure bg-dj-surface px-4 py-2 text-sm text-dj-texte outline-none focus:border-dj-bordure-forte sm:w-1/3"
              />
              {modeAjoutBiblio === "lien" ? (
                <input
                  type="url"
                  placeholder="https://…"
                  value={urlLienBiblio}
                  onChange={(e) => setUrlLienBiblio(e.target.value)}
                  className="flex-1 rounded-full border border-dj-bordure bg-dj-surface px-4 py-2 text-sm text-dj-texte outline-none focus:border-dj-bordure-forte"
                />
              ) : (
                <input
                  type="file"
                  accept="application/pdf,image/jpeg,image/png,image/webp,audio/mpeg,audio/wav,audio/ogg,video/mp4,video/webm,video/quicktime"
                  onChange={(e) => setNouveauFichierBiblio(e.target.files?.[0] ?? null)}
                  className="text-sm text-dj-texte file:mr-3 file:rounded-full file:border file:border-dj-bordure file:bg-dj-surface-haute file:px-4 file:py-2 file:text-xs file:text-dj-texte hover:file:border-dj-bordure-forte"
                />
              )}
              <button
                type="button"
                onClick={ajouterFichierBiblio}
                disabled={
                  modeAjoutBiblio === "lien"
                    ? !urlLienBiblio.trim() || !descriptionFichierBiblio.trim() || envoiBiblio
                    : !nouveauFichierBiblio || !descriptionFichierBiblio.trim() || envoiBiblio
                }
                className="rounded-full border border-dj-bordure px-4 py-2 text-xs text-dj-texte transition-colors hover:border-dj-bordure-forte disabled:opacity-50"
              >
                {envoiBiblio ? "Envoi…" : "Ajouter"}
              </button>
            </div>
          </div>
        </section>
        )}

        {sectionActive === "maj" && <SectionMiseAJour agentId={agentId} />}

        {(sectionActive === "moi" || sectionActive === "article") && (
          <section className="mt-6 flex flex-col gap-4">
            <button
              type="button"
              onClick={() => setSectionActive("vitrine")}
              className="flex items-center gap-1.5 self-start text-sm text-dj-texte-muet transition-colors hover:text-dj-texte"
            >
              ← Retour aux sections
            </button>
            <h2 className="font-display text-lg font-bold text-dj-texte">
              {sectionActive === "moi" ? "Moi" : "Article"}
            </h2>
            <p className="text-sm text-dj-texte-muet">
              Contenu à venir — dis-moi ce que tu veux mettre ici.
            </p>
          </section>
        )}
          </div>
        </div>
      </main>
    </div>
  );
}

function SectionMiseAJour({ agentId }: { agentId: string }) {
  // Champ "Mise à jour" (demande Bourama, 2026-07-15) : en dessous dans
  // "Modifier agent", pour dire ce qui vient d'être changé -- titre +
  // texte + bouton plein écran, même pattern exact que "Connaissance
  // libre" plus haut sur cette page (pleinEcranTexteLibre). Publier
  // ENVOIE tout de suite (POST /api/agents/{id}/updates) et vide les
  // champs pour la prochaine fois -- ce n'est pas un brouillon qui se
  // sauvegarde avec le reste du formulaire "Enregistrer".
  const champClasseLocal =
    "mt-1 w-full rounded-xl border border-dj-bordure bg-dj-surface-haute px-3 py-2 text-sm text-dj-texte placeholder:text-dj-inactif focus:border-dj-bordure-forte focus:outline-none";
  const labelClasseLocal = "text-xs font-medium text-dj-texte-muet";

  const [titre, setTitre] = useState("");
  const [contenu, setContenu] = useState("");
  const [pleinEcran, setPleinEcran] = useState(false);
  const [envoi, setEnvoi] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [erreur, setErreur] = useState<string | null>(null);

  async function publier(e: React.FormEvent) {
    e.preventDefault();
    if (!titre.trim() || !contenu.trim()) return;

    setEnvoi(true);
    setMessage(null);
    setErreur(null);
    try {
      await appelerApi(`/api/agents/${agentId}/updates`, {
        method: "POST",
        body: JSON.stringify({ titre, contenu }),
      });
      setTitre("");
      setContenu("");
      setPleinEcran(false);
      setMessage("Mise à jour publiée — les personnes ayant déjà utilisé cet agent sont notifiées.");
    } catch (e) {
      setErreur(e instanceof Error ? e.message : "Erreur inconnue.");
    } finally {
      setEnvoi(false);
    }
  }

  return (
    <section className="mt-10 flex flex-col gap-4 rounded-2xl border border-dj-bordure bg-dj-surface p-6">
      <h2 className="font-display text-lg font-bold text-dj-texte">Mise à jour</h2>
      <p className="text-xs text-dj-texte-muet">
        Dis ce que tu viens de modifier sur cet agent — affiché avec la date sur sa page
        publique, avec notification aux personnes qui l&apos;ont déjà utilisé.
      </p>

      <form onSubmit={publier} className="flex flex-col gap-4">
        <div>
          <label className={labelClasseLocal}>Titre</label>
          <input
            value={titre}
            onChange={(e) => setTitre(e.target.value)}
            placeholder="Ex : Nouvelle base de connaissance ajoutée"
            className={champClasseLocal}
          />
        </div>

        <div>
          <div className="flex items-center justify-between">
            <label className={labelClasseLocal}>Détail</label>
            <button
              type="button"
              onClick={() => setPleinEcran(true)}
              className="text-xs text-dj-accent-1 transition-colors hover:text-dj-accent-2"
            >
              Plein écran ⤢
            </button>
          </div>
          <textarea
            value={contenu}
            onChange={(e) => setContenu(e.target.value)}
            rows={4}
            className={`${champClasseLocal} resize-y`}
          />
        </div>

        {erreur && <p className="text-sm text-[#F87171]">{erreur}</p>}

        <div className="flex items-center gap-3">
          <button
            type="submit"
            disabled={envoi || !titre.trim() || !contenu.trim()}
            className="self-start rounded-full bg-dj-gradient px-6 py-2.5 text-sm font-bold text-[#1A0D02] transition-transform hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {envoi ? "Publication…" : "Publier la mise à jour"}
          </button>
          {message && <span className="text-sm text-dj-texte-muet">{message}</span>}
        </div>
      </form>

      {pleinEcran && (
        <div className="fixed inset-0 z-50 flex flex-col bg-dj-fond p-5">
          <div className="flex items-center justify-between pb-3">
            <h2 className="font-display text-lg font-bold text-dj-texte">Mise à jour — {titre || "Détail"}</h2>
            <button
              type="button"
              onClick={() => setPleinEcran(false)}
              className="rounded-full border border-dj-bordure px-4 py-2 text-sm text-dj-texte transition-colors hover:border-dj-bordure-forte"
            >
              Fermer
            </button>
          </div>
          <textarea
            value={contenu}
            onChange={(e) => setContenu(e.target.value)}
            autoFocus
            className={`${champClasseLocal} flex-1 resize-none`}
          />
        </div>
      )}
    </section>
  );
}

// Même pattern que l'onglet du feed (djiguigne-frontend/app/page.tsx),
// repris ici tel quel (Bourama, 27/07 : "je veux que le dashboard
// ressemble à ça pour les sections") : une ligne de couleur sous
// l'onglet actif, transparent au repos pour ne pas sauter d'1-2px au
// clic.
function Onglet({
  actif,
  onClick,
  children,
}: {
  actif: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`border-b-2 px-1 pb-3 text-sm transition-colors ${
        actif
          ? "border-dj-accent-1 font-medium text-dj-texte"
          : "border-transparent text-dj-texte-muet hover:text-dj-texte"
      }`}
    >
      {children}
    </button>
  );
}
