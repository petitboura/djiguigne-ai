import type { Locale } from "./site-config";

export const dictionaries = {
  fr: {
    nav: {
      home: "Accueil",
      about: "À propos",
      services: "Produit",
      blog: "Articles",
      contact: "Contact",
      cta: "Explorer les IA",
    },
    footer: {
      rights: "Tous droits réservés.",
      legal: "Mentions légales",
      privacy: "Confidentialité",
      cookies: "Cookies",
      contact: "Contact",
      location: "Basé à Tunis, Tunisie",
    },
    home: {
      heroKicker: "Le laboratoire d'IA spécialisées",
      heroTitle: "Des IA spécialisées, prêtes à l'emploi.",
      heroSubtitle:
        "Djiguignè AI réunit des IA spécialisées dans un domaine précis, publiées par des créateurs sélectionnés. Choisis la tienne et utilise-la immédiatement — aucune compétence technique requise.",
      heroCta: "Explorer les IA",
      heroCtaSecondary: "Devenir créateur",
      heroCtaExplicationTitre: "Comment ça marche",
      heroCtaExplicationCorps:
        "Choisis d'abord la matière de ton IA, puis remplis le formulaire de création (identité, comportement, base de connaissance...). Ton IA est publiée dès que tu la crées.",
      heroCtaExplicationContinuer: "Continuer",
      heroCtaExplicationAnnuler: "Annuler",
      sectionWhatTitle: "Comment ça marche",
      sectionWhatBody: "Trois étapes pour trouver l'IA qu'il te faut et commencer à l'utiliser.",
      faqTitle: "Questions fréquentes",
      faq: [
        {
          q: "Qui crée les IA publiées sur Djiguignè AI ?",
          a: "Des créateurs sélectionnés par l'équipe Djiguignè AI, chacun spécialisé dans un domaine précis.",
        },
        {
          q: "Comment utiliser une IA ?",
          a: "Choisis une IA dans le catalogue, crée un compte utilisateur, et commence à discuter avec elle immédiatement.",
        },
        {
          q: "Puis-je devenir créateur sur Djiguignè AI ?",
          a: "Oui, en le précisant lors de l'inscription. Chaque candidature est examinée avant validation.",
        },
        {
          q: "Djiguignè AI est-il payant ?",
          a: "Le modèle tarifaire n'est pas encore fixé. La plateforme est actuellement en phase de lancement.",
        },
      ],
    },
    about: {
      title: "À propos de Djiguignè AI",
      intro:
        "Djiguignè AI est un projet fondé par Bourama Diarra (auto-entrepreneur), basé à Tunis, en Tunisie, lancé le 10 juillet 2026.",
      missionTitle: "Notre mission",
      founderTitle: "Le fondateur",
      founderBody:
        "Djiguignè AI est développé par Bourama Diarra, également fondateur de Maame, une entreprise dédiée à rendre l'entrepreneuriat accessible.",
    },
    services: {
      title: "Le produit",
      intro:
        "Djiguignè AI est un laboratoire d'IA spécialisées : des créateurs sélectionnés y publient des agents dédiés à un domaine précis, que n'importe qui peut utiliser immédiatement, sans compétence technique.",
      sections: {
        matieres: "Matières",
        metier: "Métier",
        filiere: "Filière",
        domaine: "Domaine",
        languesAfricaines: "Langues africaines",
        execution: "Exécution",
      },
      // Ajouté le 2026-07-31 (Bourama : les 4 boutons de section doivent
      // afficher les IA correspondantes -- voir SectionsProduit.tsx).
      // "Métier"/"Filière"/"Domaine" n'ont pas encore de champ en base
      // (seul le système "matière" existe), d'où sectionBientot.
      sectionChargement: "Chargement…",
      sectionVide:
        "Il n'y a pas encore d'IA dans cette catégorie, c'est l'occasion de créer la vôtre !",
      sectionErreur: "Impossible de charger les IA pour le moment.",
      sectionBientot: "Cette catégorie arrive bientôt.",
      faqButton: "FAQ",
      faqTitle: "Tarifs et accès",
      faq: [
        {
          q: "L'utilisation d'une IA est-elle payante ?",
          a: "Le modèle tarifaire n'est pas encore fixé — la plateforme est en phase de lancement.",
        },
        {
          q: "Comment devenir créateur sur Djiguignè AI ?",
          a: "En le précisant lors de l'inscription. Chaque candidature est examinée par l'équipe avant validation.",
        },
      ],
    },
    contact: {
      title: "Contact",
      intro: "Une question, une idée, un partenariat ? Écris-nous.",
      faqTitle: "Comment nous contacter",
      faq: [
        {
          q: "Comment contacter Djiguignè AI ?",
          a: "Par email à boumiservice@gmail.com, ou par téléphone.",
        },
      ],
    },
    blog: {
      title: "Articles",
      intro: "Réflexions sur la création d'agents IA, le RAG, et l'accessibilité de l'IA spécialisée.",
      readMore: "Lire l'article",
      back: "Retour aux articles",
    },
    legal: {
      mentionsTitle: "Mentions légales",
      privacyTitle: "Politique de confidentialité",
      cookiesTitle: "Politique de cookies",
    },
    cookieBanner: {
      text: "Ce site utilise uniquement des cookies techniques nécessaires à son fonctionnement. Aucun cookie de suivi publicitaire ou analytique n'est utilisé.",
      accept: "Compris",
      learnMore: "En savoir plus",
    },
    auth: {
      loginTitle: "Se connecter",
      signupTitle: "Créer un compte",
      email: "Email",
      phone: "Téléphone",
      loginButton: "Se connecter",
      loginButtonLoading: "Connexion…",
      signupButton: "Créer mon compte",
      signupButtonLoading: "Création…",
      forgotPassword: "Mot de passe oublié ?",
      noAccount: "Pas encore de compte ?",
      signupLink: "S'inscrire",
      hasAccount: "Déjà un compte ?",
      loginLink: "Se connecter",
      accountTypeLabel: "Je m'inscris en tant que",
      accountTypeUser: "Utilisateur",
      accountTypeUserDesc: "J'utilise des agents créés par d'autres",
      accountTypeCreator: "Créateur",
      accountTypeCreatorDesc: "Je candidate pour publier mes propres IA",
      creatorNote: "La création est sur sélection. Ta candidature sera examinée par l'équipe avant validation.",
    },
  },
  en: {
    nav: {
      home: "Home",
      about: "About",
      services: "Product",
      blog: "Blog",
      contact: "Contact",
      cta: "Explore the AIs",
    },
    footer: {
      rights: "All rights reserved.",
      legal: "Legal notice",
      privacy: "Privacy",
      cookies: "Cookies",
      contact: "Contact",
      location: "Based in Tunis, Tunisia",
    },
    home: {
      heroKicker: "The specialized AI laboratory",
      heroTitle: "Specialized AIs, ready to use.",
      heroSubtitle:
        "Djiguignè AI brings together specialized AIs for precise domains, published by selected creators. Pick the one you need and start using it right away — no technical skills required.",
      heroCta: "Explore the AIs",
      heroCtaSecondary: "Become a creator",
      heroCtaExplicationTitre: "How it works",
      heroCtaExplicationCorps:
        "First pick the subject of your AI, then fill in the creation form (identity, behavior, knowledge base...). Your AI is published as soon as you create it.",
      heroCtaExplicationContinuer: "Continue",
      heroCtaExplicationAnnuler: "Cancel",
      sectionWhatTitle: "How it works",
      sectionWhatBody: "Three steps to find the right AI and start using it.",
      faqTitle: "Frequently asked questions",
      faq: [
        {
          q: "Who creates the AIs published on Djiguignè AI?",
          a: "Creators selected by the Djiguignè AI team, each specialized in a precise domain.",
        },
        {
          q: "How do I use an AI?",
          a: "Pick an AI from the catalog, create a user account, and start chatting with it right away.",
        },
        {
          q: "Can I become a creator on Djiguignè AI?",
          a: "Yes, by indicating so during sign-up. Every application is reviewed before approval.",
        },
        {
          q: "Is Djiguignè AI paid?",
          a: "The pricing model isn't finalized yet. The platform is currently in its launch phase.",
        },
      ],
    },
    about: {
      title: "About Djiguignè AI",
      intro:
        "Djiguignè AI is a project founded by Bourama Diarra (sole proprietor), based in Tunis, Tunisia, launched on July 10, 2026.",
      missionTitle: "Our mission",
      founderTitle: "The founder",
      founderBody:
        "Djiguignè AI is built by Bourama Diarra, also founder of Maame, a company dedicated to making entrepreneurship accessible.",
    },
    services: {
      title: "The product",
      intro:
        "Djiguignè AI is a specialized AI laboratory: selected creators publish agents dedicated to a precise domain, which anyone can use right away, with no technical skills required.",
      sections: {
        matieres: "Subjects",
        metier: "Profession",
        filiere: "Track",
        domaine: "Domain",
        languesAfricaines: "African languages",
        execution: "Execution",
      },
      sectionChargement: "Loading…",
      sectionVide:
        "There's no AI in this category yet, it's a great opportunity to create yours!",
      sectionErreur: "Couldn't load the AIs right now.",
      sectionBientot: "This category is coming soon.",
      faqButton: "FAQ",
      faqTitle: "Pricing and access",
      faq: [
        {
          q: "Is using an AI paid?",
          a: "The pricing model isn't finalized yet — the platform is in its launch phase.",
        },
        {
          q: "How do I become a creator on Djiguignè AI?",
          a: "By indicating so during sign-up. Every application is reviewed by the team before approval.",
        },
      ],
    },
    contact: {
      title: "Contact",
      intro: "A question, an idea, a partnership? Get in touch.",
      faqTitle: "How to reach us",
      faq: [
        {
          q: "How can I contact Djiguignè AI?",
          a: "By email at boumiservice@gmail.com, or by phone.",
        },
      ],
    },
    blog: {
      title: "Articles",
      intro: "Thoughts on AI agent creation, RAG, and making specialized AI accessible.",
      readMore: "Read article",
      back: "Back to articles",
    },
    legal: {
      mentionsTitle: "Legal notice",
      privacyTitle: "Privacy policy",
      cookiesTitle: "Cookie policy",
    },
    cookieBanner: {
      text: "This site only uses technical cookies required for it to function. No advertising or analytics tracking cookies are used.",
      accept: "Got it",
      learnMore: "Learn more",
    },
    auth: {
      loginTitle: "Sign in",
      signupTitle: "Create an account",
      email: "Email",
      phone: "Phone",
      loginButton: "Sign in",
      loginButtonLoading: "Signing in…",
      signupButton: "Create my account",
      signupButtonLoading: "Creating…",
      forgotPassword: "Forgot password?",
      noAccount: "No account yet?",
      signupLink: "Sign up",
      hasAccount: "Already have an account?",
      loginLink: "Sign in",
      accountTypeLabel: "I'm signing up as",
      accountTypeUser: "User",
      accountTypeUserDesc: "I use agents created by others",
      accountTypeCreator: "Creator",
      accountTypeCreatorDesc: "I apply to publish my own AIs",
      creatorNote: "Creator access is selective. Your application will be reviewed by the team before approval.",
    },
  },
} as const;

export function getDictionary(locale: Locale) {
  return dictionaries[locale];
}
