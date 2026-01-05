import { notFound } from 'next/navigation';
import { Metadata } from 'next';
import { getBlogPostForComponent, getBlogPostsForComponent } from '@/lib/mdx';
import { BlogPost } from '@/components/blog/BlogPost';
import { BlogSidebar } from '@/components/blog/BlogSidebar';
import { BlogNavigation } from '@/components/blog/BlogNavigation';
import { cn } from '@/lib/utils';

interface BlogPostPageProps {
  params: {
    slug: string;
  };
}

export async function generateStaticParams() {
  const posts = await getBlogPostsForComponent();
  return posts.map(post => ({
    slug: post.slug,
  }));
}

export async function generateMetadata({
  params,
}: BlogPostPageProps): Promise<Metadata> {
  const post = await getBlogPostForComponent(params.slug);

  if (!post) {
    return {
      title: 'Article non trouvé',
      description: "Cet article de blog n'existe pas.",
    };
  }

  return {
    title: `${post.title} | NutriSensia Blog`,
    description: post.excerpt,
    keywords: post.tags?.join(', '),
    authors: [{ name: post.author || 'NutriSensia' }],
    openGraph: {
      title: post.title,
      description: post.excerpt,
      type: 'article',
      publishedTime: post.publishedAt,
      modifiedTime: post.updatedAt,
      authors: [post.author || 'NutriSensia'],
      tags: post.tags,
      images: post.image
        ? [
            {
              url: post.image,
              alt: post.title,
              width: 1200,
              height: 630,
            },
          ]
        : undefined,
    },
    twitter: {
      card: 'summary_large_image',
      title: post.title,
      description: post.excerpt,
      images: post.image ? [post.image] : undefined,
    },
  };
}

export default async function BlogPostPage({ params }: BlogPostPageProps) {
  const post = await getBlogPostForComponent(params.slug);

  if (!post) {
    notFound();
  }

  // Récupérer les articles liés pour la sidebar
  const allPosts = await getBlogPostsForComponent();
  const relatedPosts = allPosts
    .filter(p => p.slug !== post.slug)
    .filter(p => p.tags?.some(tag => post.tags?.includes(tag)))
    .slice(0, 3);

  return (
    <div className='min-h-screen bg-gradient-to-br from-blue-50 to-white dark:from-gray-900 dark:to-gray-800'>
      <div className='container mx-auto px-4 py-8'>
        <div className='max-w-7xl mx-auto'>
          {/* Navigation breadcrumb */}
          <nav className='mb-8'>
            <div className='flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400'>
              <a
                href='/'
                className='hover:text-blue-600 dark:hover:text-blue-400'
              >
                Accueil
              </a>
              <span>/</span>
              <a
                href='/blog'
                className='hover:text-blue-600 dark:hover:text-blue-400'
              >
                Blog
              </a>
              <span>/</span>
              <span className='text-gray-900 dark:text-white font-medium'>
                {post.title}
              </span>
            </div>
          </nav>

          <div className='grid lg:grid-cols-4 gap-8'>
            {/* Article principal */}
            <article className='lg:col-span-3'>
              <BlogPost post={post} />
            </article>

            {/* Sidebar */}
            <aside className='lg:col-span-1'>
              <div className='sticky top-8 space-y-8'>
                <BlogSidebar
                  relatedPosts={relatedPosts}
                  categories={[]} // TODO: Implémenter les catégories
                  tags={post.tags || []}
                />
              </div>
            </aside>
          </div>

          {/* Navigation entre articles */}
          <div className='mt-16'>
            <BlogNavigation currentSlug={post.slug} />
          </div>
        </div>
      </div>
    </div>
  );
}
