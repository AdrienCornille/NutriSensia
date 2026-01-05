import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import readingTime from 'reading-time';

/**
 * Utilitaires pour la gestion du contenu MDX du blog NutriSensia
 */

// Répertoire des articles de blog
const BLOG_DIRECTORY = path.join(process.cwd(), 'content/blog');

/**
 * Interface pour les métadonnées d'un article de blog
 */
export interface BlogPostMeta {
  title: string;
  description: string;
  date: string;
  author: string;
  authorImage?: string;
  category: string;
  tags: string[];
  image?: string;
  imageAlt?: string;
  published: boolean;
  featured?: boolean;
  seoTitle?: string;
  seoDescription?: string;
  keywords?: string[];
}

/**
 * Interface pour un article de blog complet
 */
export interface BlogPost {
  slug: string;
  meta: BlogPostMeta;
  content: string;
  readingTime: {
    text: string;
    minutes: number;
    time: number;
    words: number;
  };
  excerpt?: string;
}

/**
 * Catégories disponibles pour les articles
 */
export const BLOG_CATEGORIES = [
  {
    slug: 'nutrition-generale',
    name: 'Nutrition Générale',
    description: 'Conseils et informations sur la nutrition au quotidien',
    color: 'blue',
  },
  {
    slug: 'recettes-sante',
    name: 'Recettes Santé',
    description: 'Recettes équilibrées et savoureuses pour votre bien-être',
    color: 'green',
  },
  {
    slug: 'nutrition-sportive',
    name: 'Nutrition Sportive',
    description:
      "Alimentation optimisée pour les sportifs et l'activité physique",
    color: 'orange',
  },
  {
    slug: 'troubles-alimentaires',
    name: 'Troubles Alimentaires',
    description:
      'Accompagnement et conseils pour les troubles du comportement alimentaire',
    color: 'purple',
  },
  {
    slug: 'nutrition-clinique',
    name: 'Nutrition Clinique',
    description: 'Nutrition thérapeutique et prise en charge médicale',
    color: 'red',
  },
  {
    slug: 'actualites',
    name: 'Actualités',
    description: 'Dernières nouvelles et recherches en nutrition',
    color: 'indigo',
  },
] as const;

/**
 * Tags populaires pour les articles
 */
export const POPULAR_TAGS = [
  'perte de poids',
  'diabète',
  'cholestérol',
  'végétarisme',
  'allergies alimentaires',
  'nutrition enfant',
  'nutrition senior',
  'micronutriments',
  'hydratation',
  'digestion',
  'inflammation',
  'antioxydants',
  'fibres',
  'protéines',
  'glucides',
  'lipides',
  'vitamines',
  'minéraux',
] as const;

/**
 * Récupère tous les slugs des articles de blog
 */
export function getAllBlogSlugs(): string[] {
  if (!fs.existsSync(BLOG_DIRECTORY)) {
    return [];
  }

  const files = fs.readdirSync(BLOG_DIRECTORY);
  return files
    .filter(file => file.endsWith('.mdx'))
    .map(file => file.replace(/\.mdx$/, ''));
}

/**
 * Récupère un article de blog par son slug
 */
export function getBlogPost(slug: string): BlogPost | null {
  try {
    const fullPath = path.join(BLOG_DIRECTORY, `${slug}.mdx`);

    if (!fs.existsSync(fullPath)) {
      return null;
    }

    const fileContents = fs.readFileSync(fullPath, 'utf8');
    const { data, content } = matter(fileContents);

    // Validation des métadonnées requises
    const meta = data as BlogPostMeta;
    if (
      !meta.title ||
      !meta.description ||
      !meta.date ||
      !meta.author ||
      !meta.category
    ) {
      console.warn(`Article ${slug} manque de métadonnées requises`);
      return null;
    }

    // Calcul du temps de lecture
    const readingTimeStats = readingTime(content);

    // Génération de l'extrait si non fourni
    const excerpt = meta.description || content.slice(0, 200) + '...';

    return {
      slug,
      meta,
      content,
      readingTime: readingTimeStats,
      excerpt,
    };
  } catch (error) {
    console.error(`Erreur lors de la lecture de l'article ${slug}:`, error);
    return null;
  }
}

/**
 * Récupère un article de blog par son slug avec format adapté pour les composants
 */
export async function getBlogPostForComponent(slug: string) {
  const post = getBlogPost(slug);
  if (!post) return null;

  return {
    slug: post.slug,
    title: post.meta.title,
    excerpt: post.excerpt || post.meta.description,
    content: post.content,
    publishedAt: post.meta.date,
    updatedAt: post.meta.date, // TODO: Ajouter un champ updatedAt dans les métadonnées
    author: post.meta.author,
    tags: post.meta.tags || [],
    category: post.meta.category,
    image: post.meta.image,
    readingTime: Math.ceil(post.readingTime.minutes),
  };
}

/**
 * Récupère tous les articles de blog avec format adapté pour les composants
 */
export async function getBlogPostsForComponent() {
  const slugs = getAllBlogSlugs();
  const posts = slugs
    .map(slug => getBlogPost(slug))
    .filter((post): post is BlogPost => post !== null)
    .filter(post => post.meta.published)
    .sort(
      (a, b) =>
        new Date(b.meta.date).getTime() - new Date(a.meta.date).getTime()
    );

  return posts.map(post => ({
    slug: post.slug,
    title: post.meta.title,
    excerpt: post.excerpt || post.meta.description,
    content: post.content,
    publishedAt: post.meta.date,
    updatedAt: post.meta.date,
    author: post.meta.author,
    tags: post.meta.tags || [],
    category: post.meta.category,
    image: post.meta.image,
    readingTime: Math.ceil(post.readingTime.minutes),
  }));
}

/**
 * Récupère tous les articles de blog avec pagination
 */
export function getAllBlogPosts(
  page: number = 1,
  limit: number = 10,
  category?: string,
  tag?: string,
  featured?: boolean
): {
  posts: BlogPost[];
  totalPosts: number;
  totalPages: number;
  currentPage: number;
} {
  const slugs = getAllBlogSlugs();
  let posts = slugs
    .map(slug => getBlogPost(slug))
    .filter((post): post is BlogPost => post !== null)
    .filter(post => post.meta.published); // Seulement les articles publiés

  // Filtrage par catégorie
  if (category) {
    posts = posts.filter(post => post.meta.category === category);
  }

  // Filtrage par tag
  if (tag) {
    posts = posts.filter(post => post.meta.tags.includes(tag));
  }

  // Filtrage par articles en vedette
  if (featured) {
    posts = posts.filter(post => post.meta.featured);
  }

  // Tri par date (plus récent en premier)
  posts.sort(
    (a, b) => new Date(b.meta.date).getTime() - new Date(a.meta.date).getTime()
  );

  const totalPosts = posts.length;
  const totalPages = Math.ceil(totalPosts / limit);
  const startIndex = (page - 1) * limit;
  const endIndex = startIndex + limit;

  return {
    posts: posts.slice(startIndex, endIndex),
    totalPosts,
    totalPages,
    currentPage: page,
  };
}

/**
 * Récupère les articles similaires basés sur les tags et la catégorie
 */
export function getSimilarPosts(
  currentSlug: string,
  limit: number = 3
): BlogPost[] {
  const currentPost = getBlogPost(currentSlug);
  if (!currentPost) return [];

  const allPosts = getAllBlogPosts(1, 100).posts;

  // Calcul du score de similarité
  const postsWithScore = allPosts
    .filter(post => post.slug !== currentSlug)
    .map(post => {
      let score = 0;

      // Points pour la même catégorie
      if (post.meta.category === currentPost.meta.category) {
        score += 3;
      }

      // Points pour les tags communs
      const commonTags = post.meta.tags.filter(tag =>
        currentPost.meta.tags.includes(tag)
      );
      score += commonTags.length;

      return { post, score };
    })
    .filter(item => item.score > 0)
    .sort((a, b) => b.score - a.score);

  return postsWithScore.slice(0, limit).map(item => item.post);
}

/**
 * Récupère les articles populaires (basés sur la propriété featured)
 */
export function getPopularPosts(limit: number = 5): BlogPost[] {
  return getAllBlogPosts(1, 100, undefined, undefined, true).posts.slice(
    0,
    limit
  );
}

/**
 * Récupère tous les tags utilisés avec leur fréquence
 */
export function getAllTags(): Array<{ tag: string; count: number }> {
  const allPosts = getAllBlogPosts(1, 1000).posts;
  const tagCounts: Record<string, number> = {};

  allPosts.forEach(post => {
    post.meta.tags.forEach(tag => {
      tagCounts[tag] = (tagCounts[tag] || 0) + 1;
    });
  });

  return Object.entries(tagCounts)
    .map(([tag, count]) => ({ tag, count }))
    .sort((a, b) => b.count - a.count);
}

/**
 * Génère les métadonnées SEO pour un article de blog
 */
export function generateBlogPostSEO(post: BlogPost) {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://nutrisensia.ch';
  const postUrl = `${siteUrl}/blog/${post.slug}`;

  return {
    title: post.meta.seoTitle || post.meta.title,
    description: post.meta.seoDescription || post.meta.description,
    canonical: postUrl,
    openGraph: {
      type: 'article',
      url: postUrl,
      title: post.meta.title,
      description: post.meta.description,
      images: post.meta.image
        ? [
            {
              url: `${siteUrl}${post.meta.image}`,
              width: 1200,
              height: 630,
              alt: post.meta.imageAlt || post.meta.title,
            },
          ]
        : [],
      article: {
        publishedTime: post.meta.date,
        authors: [post.meta.author],
        tags: post.meta.tags,
        section: post.meta.category,
      },
    },
    twitter: {
      cardType: 'summary_large_image',
      title: post.meta.title,
      description: post.meta.description,
      image: post.meta.image ? `${siteUrl}${post.meta.image}` : undefined,
    },
    additionalMetaTags: [
      {
        name: 'keywords',
        content: post.meta.keywords?.join(', ') || post.meta.tags.join(', '),
      },
      {
        name: 'author',
        content: post.meta.author,
      },
      {
        property: 'article:author',
        content: post.meta.author,
      },
      {
        property: 'article:published_time',
        content: post.meta.date,
      },
      {
        property: 'article:section',
        content: post.meta.category,
      },
      ...post.meta.tags.map(tag => ({
        property: 'article:tag',
        content: tag,
      })),
    ],
  };
}

/**
 * Génère les données structurées pour un article de blog
 */
export function generateBlogPostStructuredData(post: BlogPost) {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://nutrisensia.ch';
  const postUrl = `${siteUrl}/blog/${post.slug}`;

  return {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: post.meta.title,
    description: post.meta.description,
    image: post.meta.image ? `${siteUrl}${post.meta.image}` : undefined,
    author: {
      '@type': 'Person',
      name: post.meta.author,
      image: post.meta.authorImage
        ? `${siteUrl}${post.meta.authorImage}`
        : undefined,
    },
    publisher: {
      '@type': 'Organization',
      name: 'NutriSensia',
      logo: {
        '@type': 'ImageObject',
        url: `${siteUrl}/images/logo.png`,
      },
    },
    datePublished: post.meta.date,
    dateModified: post.meta.date,
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': postUrl,
    },
    url: postUrl,
    keywords: post.meta.tags.join(', '),
    articleSection: post.meta.category,
    wordCount: post.readingTime.words,
    timeRequired: `PT${Math.ceil(post.readingTime.minutes)}M`,
  };
}

/**
 * Crée le répertoire de blog s'il n'existe pas
 */
export function ensureBlogDirectory(): void {
  if (!fs.existsSync(BLOG_DIRECTORY)) {
    fs.mkdirSync(BLOG_DIRECTORY, { recursive: true });
  }
}
