'use client';

import { ArticlePage } from '@/components/blog/ArticlePage';
import { getArticleBySlug } from '@/data/articles';
import { notFound } from 'next/navigation';

interface PageProps {
  params: {
    slug: string;
  };
}

export default function NutritionArticlePage({ params }: PageProps) {
  const article = getArticleBySlug(params.slug);

  // Si l'article n'existe pas, afficher la page 404
  if (!article) {
    notFound();
  }

  // Vérifier que l'article appartient bien à la catégorie nutrition
  if (article.category !== 'nutrition') {
    notFound();
  }

  return <ArticlePage article={article} />;
}
