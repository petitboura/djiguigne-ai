import type { Locale } from "./site-config";

export type CasUsage = {
  slug: string;
  titre: string;
  accroche: string;
  corps: string;
};

// Chantier SEO/AEO (2026-08-01) : pages piliers par segment, distinctes
// du blog (pas datées, pas narratives -- voir discussion "hub-and-spoke").
// Angle volontairement "trouver/utiliser une IA existante sur ce segment",
// jamais "comment créer" (positionnement clarifié le 01/08).
export const casUsage: Record<Locale, CasUsage[]> = {
  fr: [
    {
      slug: "preparation-concours",
      titre: "IA spécialisée pour la préparation aux concours",
      accroche: "Un accompagnement ciblé pour les filières exigeantes (MPSI, MP, et classes préparatoires similaires).",
      corps:
        "La préparation aux concours (MPSI, MP, et filières similaires) demande un accompagnement régulier, sur un programme précis et exigeant. Une IA spécialisée sur ces filières connaît le programme, le niveau attendu, et les méthodes de résolution propres à ces classes — contrairement à une IA généraliste qui traite chaque question isolément, sans repères sur le référentiel de la filière.\n\nSur Djiguignè AI, ces IA sont classées par matière (mathématiques, physique...) et par filière, pour permettre de trouver directement l'assistant adapté au programme suivi.",
    },
    {
      slug: "e-commerce-support-client",
      titre: "IA spécialisée pour le e-commerce et le support client",
      accroche: "Répondre aux questions produits et au support client, sur un catalogue et un ton précis.",
      corps:
        "Le support client en e-commerce répond à des questions récurrentes : disponibilité, livraison, retours, caractéristiques produit. Une IA spécialisée pour ce métier connaît le catalogue et les politiques d'une activité précise, et peut répondre avec le ton de marque attendu — plutôt que des réponses génériques qui ne tiennent pas compte du contexte commercial réel.\n\nCe type d'usage correspond au champ \"métier\" du catalogue Djiguignè AI.",
    },
    {
      slug: "langues-africaines",
      titre: "IA spécialisée en langues africaines",
      accroche: "Des IA capables d'échanger dans des langues africaines, au-delà des langues les plus courantes du web.",
      corps:
        "La majorité des IA génératives grand public sont entraînées très majoritairement sur du contenu en anglais, français ou d'autres langues très représentées sur le web — les langues africaines y sont largement sous-représentées. Une IA spécialisée dédiée à une langue africaine précise comble ce manque pour les locuteurs de cette langue.\n\nDjiguignè AI, basé à Tunis, propose une catégorie dédiée aux langues africaines dans son catalogue.",
    },
    {
      slug: "metiers",
      titre: "IA spécialisée pour un métier précis",
      accroche: "Comptabilité, juridique, gestion... une IA dédiée au vocabulaire et aux cas pratiques d'un métier.",
      corps:
        "Chaque métier a son vocabulaire, ses réglementations et ses cas pratiques récurrents. Une IA spécialisée sur un métier précis (comptabilité, juridique, gestion...) est configurée pour ce contexte, plutôt que de traiter une question métier avec des réponses génériques non adaptées au cadre réglementaire ou aux usages du secteur.\n\nCes IA sont classées dans la catégorie \"Métier\" du catalogue Djiguignè AI.",
    },
  ],
  en: [
    {
      slug: "preparation-concours",
      titre: "Specialized AI for competitive exam prep",
      accroche: "Focused support for demanding tracks (MPSI, MP, and similar preparatory classes).",
      corps:
        "Preparing for competitive exams (MPSI, MP, and similar tracks) requires regular support on a precise, demanding syllabus. A specialized AI for these tracks knows the syllabus, the expected level, and the problem-solving methods specific to these classes — unlike a general-purpose AI that treats each question in isolation, with no reference to the track's curriculum.\n\nOn Djiguignè AI, these AIs are organized by subject (math, physics...) and by track, to help you find the assistant matching your syllabus directly.",
    },
    {
      slug: "e-commerce-support-client",
      titre: "Specialized AI for e-commerce and customer support",
      accroche: "Answering product and support questions, on a precise catalog and tone.",
      corps:
        "E-commerce customer support handles recurring questions: availability, shipping, returns, product specs. A specialized AI for this profession knows a specific business's catalog and policies, and can answer with the expected brand tone — instead of generic answers that ignore the real commercial context.\n\nThis use case maps to the \"profession\" field in the Djiguignè AI catalog.",
    },
    {
      slug: "langues-africaines",
      titre: "Specialized AI for African languages",
      accroche: "AIs able to converse in African languages, beyond the web's most common languages.",
      corps:
        "Most mainstream generative AIs are trained overwhelmingly on English, French, or other heavily represented web languages — African languages remain largely underrepresented. A specialized AI dedicated to a specific African language fills that gap for speakers of that language.\n\nDjiguignè AI, based in Tunis, offers a dedicated African languages category in its catalog.",
    },
    {
      slug: "metiers",
      titre: "Specialized AI for a specific profession",
      accroche: "Accounting, legal, management... an AI dedicated to a profession's vocabulary and practical cases.",
      corps:
        "Every profession has its own vocabulary, regulations, and recurring practical cases. A specialized AI for a specific profession (accounting, legal, management...) is configured for that context, instead of handling a professional question with generic answers that don't fit the regulatory framework or industry practices.\n\nThese AIs are organized under the \"Profession\" category in the Djiguignè AI catalog.",
    },
  ],
};
