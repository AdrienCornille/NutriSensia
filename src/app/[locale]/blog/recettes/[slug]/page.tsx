'use client';

import { ArticlePage } from '@/components/blog/ArticlePage';
import { getArticleBySlug } from '@/data/articles';
import { notFound } from 'next/navigation';

interface PageProps {
  params: {
    slug: string;
  };
}

export default function RecettesArticlePage({ params }: PageProps) {
  const article = getArticleBySlug(params.slug);

  // Si l'article n'existe pas, afficher la page 404
  if (!article) {
    notFound();
  }

  // Vérifier que l'article appartient bien à la catégorie recettes
  if (article.category !== 'recettes') {
    notFound();
  }

  return <ArticlePage article={article} />;
}
