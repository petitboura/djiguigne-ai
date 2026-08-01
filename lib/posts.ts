import type { Locale } from "./site-config";

export type Post = {
  slug: string;
  title: string;
  description: string;
  date: string; // ISO
  body: string;
};

// Un seul article de démarrage par langue, pour prouver que la structure
// fonctionne (page liste + page détail + sitemap + JSON-LD Article).
// Le vrai rythme de publication (2-4 articles/semaine, voir le brief Notion)
// s'ajoute simplement en complétant ces tableaux — aucune autre modification
// de code n'est nécessaire pour publier un nouvel article.
const posts: Record<Locale, Post[]> = {
  fr: [
    {
      slug: "ia-specialisee-vs-ia-generaliste",
      title: "IA spécialisée vs IA généraliste : quelle différence ?",
      description:
        "Une IA généraliste comme ChatGPT répond à tout. Une IA spécialisée est dédiée à un seul domaine. Dans quels cas privilégier l'une ou l'autre.",
      date: "2026-08-01",
      body: "Une IA générative généraliste est conçue pour répondre à peu près à n'importe quel sujet : elle a été entraînée sur une quantité massive et très diverse de contenus, sans domaine de spécialité. C'est ce qui en fait un outil polyvalent, mais aussi ce qui limite sa précision sur un sujet pointu : elle n'a pas de base de connaissance dédiée, et doit \"deviner\" la bonne réponse à partir de ce qu'elle a globalement appris.\n\nUne IA spécialisée, à l'inverse, est configurée pour un seul domaine précis — une matière, un métier, une filière. Elle s'appuie généralement sur une base de connaissance dédiée à ce domaine (voir le RAG, dans notre glossaire), ce qui lui permet de répondre avec un niveau de précision et de fiabilité plus élevé sur ce périmètre restreint.\n\nLa différence se voit surtout sur les questions de niveau avancé ou très contextuelles : un étudiant en classe préparatoire qui pose une question de méthode propre à son programme, ou un client qui demande la politique de retour exacte d'un site précis, obtiendra une réponse plus fiable d'une IA spécialisée sur ce périmètre que d'une IA généraliste qui traite chaque question isolément.\n\nÀ l'inverse, pour une question générale sans lien avec un domaine précis, une IA généraliste reste tout à fait pertinente. Les deux approches sont complémentaires plutôt qu'opposées.",
    },
    {
      slug: "pourquoi-le-rag-ancre-les-reponses-d-une-ia",
      title: "Comment une IA spécialisée s'appuie sur une base de connaissance (le RAG)",
      description:
        "Le RAG (Retrieval-Augmented Generation) permet à une IA de consulter des documents précis avant de répondre, plutôt que de se fier uniquement à sa mémoire d'entraînement.",
      date: "2026-08-01",
      body: "Un modèle de langage seul répond à partir de ce qu'il a appris pendant son entraînement — une mémoire figée à une date donnée, jamais mise à jour ensuite. Pour une IA généraliste sur des sujets courants, c'est rarement un problème. Pour une IA spécialisée censée connaître le programme exact d'une filière, le catalogue précis d'une boutique, ou la réglementation d'un métier, ça ne suffit pas.\n\nLe RAG (Retrieval-Augmented Generation, ou \"génération augmentée par récupération\") résout ce problème autrement : avant de répondre, l'IA consulte une base de documents dédiée à son domaine — cours, catalogue produit, documentation métier — et construit sa réponse à partir de ce qu'elle y trouve, plutôt que de sa seule mémoire.\n\nDeux bénéfices concrets en découlent. D'abord, la réponse reste ancrée dans des sources vérifiées et à jour, ce qui réduit le risque d'hallucination (une réponse inventée mais présentée comme certaine). Ensuite, la base de connaissance peut évoluer indépendamment du modèle lui-même : mettre à jour un document suffit à mettre à jour ce que l'IA \"sait\", sans réentraîner quoi que ce soit.\n\nC'est ce mécanisme qui permet à une IA spécialisée de rester fiable sur un domaine précis, alors qu'une IA généraliste sans base de connaissance dédiée n'a que sa mémoire d'entraînement pour répondre.",
    },
    {
      slug: "essor-agents-ia-specialises-2026",
      title: "L'essor des agents IA spécialisés",
      description:
        "Pourquoi de plus en plus d'usages se tournent vers des IA dédiées à un domaine précis, plutôt que vers des assistants généralistes.",
      date: "2026-08-01",
      body: "Les premières générations d'assistants IA grand public visaient la polyvalence : un seul assistant, capable de répondre à peu près à tout. Cette approche reste utile pour des besoins généraux, mais elle atteint ses limites dès qu'un usage exige une précision de contexte — un programme scolaire précis, la réglementation d'un métier, le catalogue exact d'une entreprise.\n\nLa réponse à cette limite n'est pas un modèle plus gros, mais une spécialisation du contexte : donner à une IA une base de connaissance dédiée à un domaine restreint, plutôt que de compter sur sa seule mémoire générale. C'est ce qui explique la multiplication des IA spécialisées, chacune dédiée à un usage précis plutôt qu'à un usage universel.\n\nCette tendance s'accompagne d'un changement dans la façon de chercher de l'information : de plus en plus de recherches passent directement par une IA plutôt que par une liste de résultats à parcourir. Dans ce contexte, une IA capable de répondre avec précision sur un domaine précis a un avantage net sur une IA généraliste qui traite chaque question sans repère de spécialité.\n\nCette évolution touche aussi bien l'éducation (tutorat par matière et par filière) que le monde professionnel (assistants dédiés à un métier) — et, moins souvent évoqué, les langues et contextes sous-représentés dans les IA généralistes, comme les langues africaines.",
    },
  ],
  en: [
    {
      slug: "specialized-ai-vs-general-purpose-ai",
      title: "Specialized AI vs general-purpose AI: what's the difference?",
      description:
        "A general-purpose AI like ChatGPT answers everything. A specialized AI is dedicated to a single domain. When to prefer one over the other.",
      date: "2026-08-01",
      body: "A general-purpose generative AI is designed to answer more or less any topic: it was trained on a massive, highly diverse set of content, with no specialty domain. That's what makes it a versatile tool, but also what limits its precision on a narrow topic: it has no dedicated knowledge base, and has to \"guess\" the right answer from what it learned overall.\n\nA specialized AI, on the other hand, is configured for a single precise domain — a subject, a profession, a field. It typically relies on a knowledge base dedicated to that domain (see RAG, in our glossary), which lets it answer with a higher level of precision and reliability within that narrower scope.\n\nThe difference shows up most on advanced or highly contextual questions: a student in a preparatory class asking a method question specific to their syllabus, or a customer asking for a specific site's exact return policy, will get a more reliable answer from an AI specialized on that scope than from a general-purpose AI treating each question in isolation.\n\nConversely, for a general question unrelated to a specific domain, a general-purpose AI remains entirely relevant. The two approaches are complementary rather than opposed.",
    },
    {
      slug: "how-rag-grounds-an-ai-answers",
      title: "How a specialized AI relies on a knowledge base (RAG)",
      description:
        "RAG (Retrieval-Augmented Generation) lets an AI consult precise documents before answering, instead of relying solely on its training memory.",
      date: "2026-08-01",
      body: "A language model on its own answers from what it learned during training — a memory frozen at a given date, never updated afterward. For a general-purpose AI on common topics, that's rarely an issue. For a specialized AI expected to know a track's exact syllabus, a shop's precise catalog, or a profession's regulations, it isn't enough.\n\nRAG (Retrieval-Augmented Generation) solves this differently: before answering, the AI consults a document base dedicated to its domain — course material, product catalog, professional documentation — and builds its answer from what it finds there, rather than from memory alone.\n\nTwo concrete benefits follow. First, the answer stays grounded in verified, up-to-date sources, which reduces the risk of hallucination (a made-up answer presented as certain). Second, the knowledge base can evolve independently of the model itself: updating a document is enough to update what the AI \"knows,\" with no retraining required.\n\nThis mechanism is what lets a specialized AI stay reliable on a precise domain, while a general-purpose AI with no dedicated knowledge base only has its training memory to answer from.",
    },
    {
      slug: "rise-of-specialized-ai-agents-2026",
      title: "The rise of specialized AI agents",
      description:
        "Why more and more use cases are turning to AIs dedicated to a precise domain, rather than general-purpose assistants.",
      date: "2026-08-01",
      body: "The first generations of mainstream AI assistants aimed for versatility: a single assistant, able to answer more or less anything. That approach remains useful for general needs, but it hits its limits as soon as a use case demands contextual precision — an exact school syllabus, a profession's regulations, a company's exact catalog.\n\nThe answer to that limit isn't a bigger model, but a specialization of context: giving an AI a knowledge base dedicated to a narrow domain, instead of relying on its general memory alone. That's what explains the growing number of specialized AIs, each dedicated to one precise use rather than a universal one.\n\nThis trend comes alongside a shift in how people search for information: more and more searches go directly through an AI rather than a list of results to browse. In that context, an AI able to answer precisely on a specific domain has a clear edge over a general-purpose AI treating each question with no specialty reference.\n\nThis shift touches education (tutoring by subject and track) as much as the professional world (assistants dedicated to a profession) — and, less often mentioned, languages and contexts underrepresented in general-purpose AIs, such as African languages.",
    },
  ],
};

export function getPosts(locale: Locale): Post[] {
  return posts[locale];
}

export function getPost(locale: Locale, slug: string): Post | undefined {
  return posts[locale].find((p) => p.slug === slug);
}
