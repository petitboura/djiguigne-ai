import type { Locale } from "./site-config";

export type TermeGlossaire = {
  slug: string;
  terme: string;
  definition: string;
};

// Chantier SEO/AEO (2026-08-01) : réponses courtes et neutres à des
// questions de pure définition ("c'est quoi un agent IA ?") -- ni assez
// substantielles pour un article, ni vraiment des FAQ sur Djiguignè en
// tant que produit. Format volontairement factuel, sans angle "comment
// créer" (voir positionnement clarifié le 01/08 : on décrit les concepts
// du secteur, pas comment fabriquer sa propre IA).
export const glossaire: Record<Locale, TermeGlossaire[]> = {
  fr: [
    {
      slug: "agent-ia",
      terme: "Agent IA",
      definition:
        "Un agent IA est un programme basé sur un modèle de langage, conçu pour accomplir une tâche ou répondre à des questions dans un rôle défini (un tuteur, un assistant support, un conseiller...), plutôt que de simplement générer du texte de manière générique.",
    },
    {
      slug: "ia-specialisee",
      terme: "IA spécialisée",
      definition:
        "Une IA spécialisée est un agent IA dédié à un seul domaine précis — une matière, un métier, une filière — plutôt qu'à des sujets illimités. Elle est configurée et alimentée spécifiquement sur ce domaine, ce qui la rend en général plus pertinente qu'une IA généraliste sur cet usage précis.",
    },
    {
      slug: "ia-generative-generaliste",
      terme: "IA générative généraliste",
      definition:
        "Une IA générative généraliste (comme un assistant conversationnel grand public) est conçue pour répondre à n'importe quel sujet, sans domaine de spécialité ni base de connaissance dédiée à un usage précis.",
    },
    {
      slug: "rag",
      terme: "RAG (Retrieval-Augmented Generation)",
      definition:
        "Le RAG est une méthode qui permet à une IA de consulter une base de documents précise avant de répondre, au lieu de se fier uniquement à ce qu'elle a appris pendant son entraînement. C'est ce qui permet à une IA spécialisée de donner des réponses ancrées dans des sources fiables et à jour sur son domaine.",
    },
    {
      slug: "base-de-connaissance",
      terme: "Base de connaissance",
      definition:
        "La base de connaissance d'un agent IA est l'ensemble des documents et informations sur lesquels il s'appuie pour répondre dans son domaine de spécialité, généralement consultée via le RAG.",
    },
    {
      slug: "chatbot-vs-agent-conversationnel",
      terme: "Chatbot vs agent conversationnel IA",
      definition:
        "Un chatbot classique suit un arbre de réponses préécrites et scriptées. Un agent conversationnel IA génère ses réponses dynamiquement à partir d'un modèle de langage, ce qui lui permet de comprendre des formulations variées et de traiter des questions non prévues à l'avance.",
    },
    {
      slug: "hallucination",
      terme: "Hallucination (IA)",
      definition:
        "Une hallucination désigne le cas où une IA génère une réponse qui semble plausible mais qui est factuellement fausse ou inventée. Une IA spécialisée appuyée sur une base de connaissance dédiée (RAG) réduit ce risque en s'ancrant sur des sources vérifiées plutôt que sur sa seule mémoire.",
    },
    {
      slug: "llm",
      terme: "LLM (grand modèle de langage)",
      definition:
        "Un LLM (Large Language Model) est le modèle d'intelligence artificielle entraîné sur de grandes quantités de texte, qui sert de moteur de génération de réponse à un agent IA.",
    },
  ],
  en: [
    {
      slug: "agent-ia",
      terme: "AI agent",
      definition:
        "An AI agent is a program built on a language model, designed to perform a task or answer questions within a defined role (a tutor, a support assistant, an advisor...), rather than simply generating generic text.",
    },
    {
      slug: "ia-specialisee",
      terme: "Specialized AI",
      definition:
        "A specialized AI is an AI agent dedicated to a single precise domain — a subject, a profession, a field — rather than unlimited topics. It's configured and fed specifically on that domain, which generally makes it more relevant than a general-purpose AI for that particular use.",
    },
    {
      slug: "ia-generative-generaliste",
      terme: "General-purpose generative AI",
      definition:
        "A general-purpose generative AI (like a mainstream conversational assistant) is designed to answer any topic, with no specialty domain or knowledge base dedicated to a specific use.",
    },
    {
      slug: "rag",
      terme: "RAG (Retrieval-Augmented Generation)",
      definition:
        "RAG is a method that lets an AI consult a precise set of documents before answering, instead of relying solely on what it learned during training. It's what allows a specialized AI to give answers grounded in reliable, up-to-date sources on its domain.",
    },
    {
      slug: "base-de-connaissance",
      terme: "Knowledge base",
      definition:
        "An AI agent's knowledge base is the set of documents and information it relies on to answer within its area of specialty, typically consulted through RAG.",
    },
    {
      slug: "chatbot-vs-agent-conversationnel",
      terme: "Chatbot vs AI conversational agent",
      definition:
        "A classic chatbot follows a tree of pre-written, scripted replies. An AI conversational agent generates its answers dynamically from a language model, letting it understand varied phrasings and handle questions not planned in advance.",
    },
    {
      slug: "hallucination",
      terme: "Hallucination (AI)",
      definition:
        "A hallucination is when an AI generates an answer that sounds plausible but is factually wrong or made up. A specialized AI backed by a dedicated knowledge base (RAG) reduces this risk by grounding itself in verified sources rather than memory alone.",
    },
    {
      slug: "llm",
      terme: "LLM (large language model)",
      definition:
        "An LLM (Large Language Model) is the AI model trained on large amounts of text that serves as the response-generation engine for an AI agent.",
    },
  ],
};
