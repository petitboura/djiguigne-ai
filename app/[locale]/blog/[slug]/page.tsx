import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getDictionary } from "@/lib/dictionaries";
import { siteConfig, type Locale } from "@/lib/site-config";
import { getPost, getPosts } from "@/lib/posts";
import { JsonLd } from "@/components/JsonLd";
import { BoutonPartager } from "@/components/BoutonPartager";

// Les articles viennent de Supabase (table `articles_vitrine`), modifiable
// depuis le dashboard sans toucher au code. `dynamicParams` (true par
// défaut) permet à un article ajouté après le build d'être rendu à la
// demande -- sans lui, un nouveau slug donnerait 404 jusqu'au prochain
// déploiement. `revalidate` régénère ensuite la page périodiquement pour
// refléter les modifications/suppressions sans redéploiement manuel.
export const revalidate = 60;
export const dynamicParams = true;

export async function generateStaticParams() {
  const tousLesPosts = await Promise.all(
    siteConfig.locales.map(async (locale) => {
      const posts = await getPosts(locale);
      return posts.map((post) => ({ locale, slug: post.slug }));
    })
  );
  return tousLesPosts.flat();
}

export async function generateMetadata({
  params,
}: {
  params: { locale: Locale; slug: string };
}): Promise<Metadata> {
  const post = await getPost(params.locale, params.slug);
  if (!post) return {};
  // Next.js REMPLACE tout l'objet openGraph du layout parent dès qu'une
  // page en redéfinit un (pas de fusion profonde) -- sans siteName/locale/
  // url/images ici, un article partagé perdait silencieusement l'image de
  // prévisualisation (WhatsApp, LinkedIn, etc. n'affichaient qu'un lien nu).
  // Même chose pour twitter : absent ici, la carte de partage X retombait
  // sur le titre/résumé génériques du site plutôt que ceux de l'article.
  const image = `${siteConfig.url}/opengraph-image.png`;
  return {
    title: post.title,
    description: post.description,
    alternates: { canonical: `/${params.locale}/blog/${post.slug}` },
    openGraph: {
      type: "article",
      locale: params.locale,
      siteName: siteConfig.brandName,
      title: post.title,
      description: post.description,
      publishedTime: post.date,
      url: `${siteConfig.url}/${params.locale}/blog/${post.slug}`,
      images: [{ url: image, width: 1200, height: 630 }],
    },
    twitter: {
      card: "summary_large_image",
      title: post.title,
      description: post.description,
      images: [image],
    },
  };
}

export default async function BlogPostPage({
  params,
}: {
  params: { locale: Locale; slug: string };
}) {
  const { locale, slug } = params;
  const dict = getDictionary(locale);
  const post = await getPost(locale, slug);
  if (!post) notFound();

  const paragraphs = post.body.split("\n\n");

  return (
    <>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "Article",
          headline: post.title,
          description: post.description,
          datePublished: post.date,
          author: { "@type": "Organization", name: siteConfig.brandName },
          publisher: { "@type": "Organization", name: siteConfig.brandName },
        }}
      />

      <article className="mx-auto max-w-2xl px-5 py-16">
        <Link
          href={`/${locale}/blog`}
          className="animate-dj-fade-up text-sm font-semibold text-dj-accent-1 hover:underline"
        >
          ← {dict.blog.back}
        </Link>

        <div
          className="mt-6 flex animate-dj-fade-up items-center justify-between gap-4"
          style={{ animationDelay: "0.05s" }}
        >
          <time dateTime={post.date} className="font-mono text-xs text-dj-texte-muet">
            {new Date(post.date).toLocaleDateString(locale === "fr" ? "fr-FR" : "en-US", {
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </time>
          <BoutonPartager
            chemin={`/${locale}/blog/${post.slug}`}
            titre={post.title}
            libelle={dict.blog.share}
            texteCopie={dict.blog.shared}
          />
        </div>

        <h1
          className="mt-2 animate-dj-fade-up font-display text-3xl font-extrabold text-dj-texte sm:text-4xl"
          style={{ animationDelay: "0.1s" }}
        >
          {post.title}
        </h1>

        <div
          className="mt-8 animate-dj-fade-up text-base text-dj-texte-muet"
          style={{ animationDelay: "0.2s" }}
        >
          {paragraphs.map((p, i) => (
            <p key={i} className="mb-4 leading-relaxed">
              {p}
            </p>
          ))}
        </div>

        <div className="mt-10 flex justify-center border-t border-dj-bordure pt-8">
          <BoutonPartager
            chemin={`/${locale}/blog/${post.slug}`}
            titre={post.title}
            libelle={dict.blog.share}
            texteCopie={dict.blog.shared}
          />
        </div>
      </article>
    </>
  );
}
