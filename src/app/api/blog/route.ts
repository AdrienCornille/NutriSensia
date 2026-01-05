import { NextRequest, NextResponse } from 'next/server';
import { getAllBlogPosts, getPopularPosts, getAllTags } from '@/lib/mdx';

/**
 * API Route pour récupérer les données du blog
 *
 * Cette route fournit les articles de blog avec pagination,
 * filtrage et métadonnées pour l'interface utilisateur.
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    // Paramètres de requête
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '9');
    const category = searchParams.get('category') || undefined;
    const tag = searchParams.get('tag') || undefined;
    const featured = searchParams.get('featured') === 'true';
    const popular = searchParams.get('popular') === 'true';
    const tags = searchParams.get('tags') === 'true';

    let response: any = {};

    // Récupérer les articles avec pagination
    if (!popular && !tags) {
      const blogData = getAllBlogPosts(page, limit, category, tag, featured);
      response.posts = blogData;
    }

    // Récupérer les articles populaires
    if (popular) {
      const popularPosts = getPopularPosts(5);
      response.popularPosts = popularPosts;
    }

    // Récupérer les tags
    if (tags) {
      const allTags = getAllTags();
      response.tags = allTags.slice(0, 20);
    }

    return NextResponse.json(response);
  } catch (error) {
    console.error('Erreur lors de la récupération des données du blog:', error);

    return NextResponse.json(
      {
        error: 'Erreur lors de la récupération des données du blog',
        posts: {
          posts: [],
          totalPosts: 0,
          totalPages: 0,
          currentPage: 1,
        },
        popularPosts: [],
        tags: [],
      },
      { status: 500 }
    );
  }
}

/**
 * Méthodes HTTP autorisées
 */
export const runtime = 'nodejs'; // Utiliser Node.js runtime pour accéder au système de fichiers
