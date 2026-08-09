import type { Locale } from "./site-config";
import { supabase } from "./supabase";

export type Post = {
  slug: string;
  title: string;
  description: string;
  date: string; // ISO
  body: string;
};

// Les articles sont stockés dans Supabase (table `articles_vitrine`), pas
// dans le code. Ajouter, modifier ou supprimer un article se fait
// directement depuis le Table Editor du dashboard Supabase (projet
// "Djiguigne AI") -- aucune modification de code ni redéploiement manuel
// n'est nécessaire : les pages ci-dessous utilisent l'ISR (revalidation
// périodique, voir `revalidate` dans les fichiers app/[locale]/blog/*),
// donc un changement en base apparaît sur le site tout seul, en général en
// moins d'une minute.
//
// Seuls les articles avec `publie = true` sont renvoyés (politique RLS
// "Lecture publique des articles publiés").

type LigneArticle = {
  slug: string;
  titre: string;
  description: string;
  date_publication: string;
  contenu: string;
};

function versPost(ligne: LigneArticle): Post {
  return {
    slug: ligne.slug,
    title: ligne.titre,
    description: ligne.description,
    date: ligne.date_publication,
    body: ligne.contenu,
  };
}

export async function getPosts(locale: Locale): Promise<Post[]> {
  const { data, error } = await supabase
    .from("articles_vitrine")
    .select("slug, titre, description, date_publication, contenu")
    .eq("locale", locale)
    .eq("publie", true)
    .order("date_publication", { ascending: false });

  if (error) {
    // Ne jamais faire planter la page vitrine à cause d'un souci Supabase
    // ponctuel -- on affiche une liste vide plutôt qu'une erreur brute.
    console.error("Erreur chargement articles_vitrine (getPosts):", error.message);
    return [];
  }

  return (data ?? []).map(versPost);
}

export async function getPost(locale: Locale, slug: string): Promise<Post | undefined> {
  const { data, error } = await supabase
    .from("articles_vitrine")
    .select("slug, titre, description, date_publication, contenu")
    .eq("locale", locale)
    .eq("slug", slug)
    .eq("publie", true)
    .maybeSingle();

  if (error) {
    console.error("Erreur chargement articles_vitrine (getPost):", error.message);
    return undefined;
  }

  return data ? versPost(data) : undefined;
}
