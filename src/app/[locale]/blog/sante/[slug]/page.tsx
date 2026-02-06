'use client';

import { use } from 'react';
import { ArticlePage } from '@/components/blog/ArticlePage';
import { getArticleBySlug } from '@/data/articles';
import { notFound } from 'next/navigation';

interface PageProps {
  params: Promise<{
    slug: string;
  }>;
}

export default function SanteArticlePage({ params }: PageProps) {
  // Next.js 15: params est une Promise, utiliser use() pour l'unwrap
  const { slug } = use(params);
  const article = getArticleBySlug(slug);

  // Si l'article n'existe pas, afficher la page 404
  if (!article) {
    notFound();
  }

  // Vérifier que l'article appartient bien à la catégorie santé
  if (article.category !== 'sante') {
    notFound();
  }

  return <ArticlePage article={article} />;
}
