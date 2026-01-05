'use client';

import { ArticlePage } from '@/components/blog/ArticlePage';
import { getArticleBySlug } from '@/data/articles';
import { notFound } from 'next/navigation';

interface PageProps {
  params: {
    slug: string;
  };
}

export default function BienEtreArticlePage({ params }: PageProps) {
  const article = getArticleBySlug(params.slug);

  // Si l'article n'existe pas, afficher la page 404
  if (!article) {
    notFound();
  }

  // Vérifier que l'article appartient bien à la catégorie bien-être
  if (article.category !== 'bien-etre') {
    notFound();
  }

  return <ArticlePage article={article} />;
}
