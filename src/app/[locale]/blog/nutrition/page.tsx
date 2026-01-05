'use client';

import React, { useRef } from 'react';
import { Link } from '@/i18n/navigation';
import { MarketingHeader } from '@/components/landing/MarketingHeader';
import { MarketingFooter } from '@/components/landing/MarketingFooter';
import { CategoryNavBar } from '@/components/blog/CategoryNavBar';
import { motion, useInView } from 'framer-motion';
import { BookOpen } from 'lucide-react';
import { useFirstVisit } from '@/hooks/useFirstVisit';

/**
 * Page Catégorie Nutrition - NutriSensia
 */

// Types
interface Article {
  slug: string;
  title: string;
  excerpt: string;
  image?: string;
  publishedAt: string;
  readingTime: number;
  author: string;
  category: string;
  tags: string[];
}

// Articles de la catégorie Nutrition
const nutritionArticles: Article[] = [
  {
    slug: 'alimentation-equilibree-bases',
    title: "Les bases d'une alimentation équilibrée pour une vie saine",
    excerpt:
      'Découvrez les principes fondamentaux pour construire une alimentation saine et durable au quotidien. Apprenez à équilibrer vos repas avec les bons nutriments pour optimiser votre énergie et votre bien-être.',
    image:
      'https://images.unsplash.com/photo-1490645935967-10de6ba17061?w=800&h=600&fit=crop',
    publishedAt: '2024-12-10',
    readingTime: 8,
    author: 'Lucie Cornille',
    category: 'nutrition',
    tags: ['nutrition', 'santé', 'équilibre'],
  },
  {
    slug: 'alimentation-anti-inflammatoire',
    title: "L'alimentation anti-inflammatoire : guide complet",
    excerpt:
      "Réduisez l'inflammation chronique grâce à des choix alimentaires judicieux. Les meilleurs aliments et habitudes à adopter.",
    image:
      'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=800&h=600&fit=crop',
    publishedAt: '2024-11-28',
    readingTime: 7,
    author: 'Lucie Cornille',
    category: 'nutrition',
    tags: ['inflammation', 'santé', 'prévention'],
  },
  {
    slug: 'superaliments-mythes-realites',
    title: 'Superaliments : entre mythes et réalités',
    excerpt:
      'Quinoa, baies de goji, spiruline... Démêlons le vrai du faux sur ces aliments aux vertus supposées extraordinaires.',
    image:
      'https://images.unsplash.com/photo-1610348725531-843dff563e2c?w=800&h=600&fit=crop',
    publishedAt: '2024-11-05',
    readingTime: 9,
    author: 'Lucie Cornille',
    category: 'nutrition',
    tags: ['superaliments', 'nutrition', 'mythes'],
  },
  {
    slug: 'proteines-vegetales',
    title: 'Protéines végétales : le guide complet',
    excerpt:
      'Tout savoir sur les sources de protéines végétales et comment les intégrer dans votre alimentation quotidienne.',
    image:
      'https://images.unsplash.com/photo-1606787366850-de6330128bfc?w=800&h=600&fit=crop',
    publishedAt: '2024-10-25',
    readingTime: 8,
    author: 'Lucie Cornille',
    category: 'nutrition',
    tags: ['protéines', 'végétal', 'nutrition'],
  },
  {
    slug: 'omega-3-bienfaits',
    title: 'Les bienfaits des oméga-3 pour la santé',
    excerpt:
      'Découvrez pourquoi les oméga-3 sont essentiels et où les trouver dans votre alimentation.',
    image:
      'https://images.unsplash.com/photo-1544943910-4c1dc44aab44?w=800&h=600&fit=crop',
    publishedAt: '2024-10-20',
    readingTime: 7,
    author: 'Lucie Cornille',
    category: 'nutrition',
    tags: ['oméga-3', 'santé', 'nutrition'],
  },
  {
    slug: 'sucres-caches',
    title: 'Sucres cachés : comment les identifier',
    excerpt:
      'Apprenez à repérer les sucres cachés dans les aliments du quotidien et réduisez votre consommation.',
    image:
      'https://images.unsplash.com/photo-1499636136210-6f4ee915583e?w=800&h=600&fit=crop',
    publishedAt: '2024-10-15',
    readingTime: 6,
    author: 'Lucie Cornille',
    category: 'nutrition',
    tags: ['sucre', 'alimentation', 'santé'],
  },
  {
    slug: 'fibres-alimentaires',
    title: "L'importance des fibres dans votre alimentation",
    excerpt:
      'Les fibres sont essentielles pour une bonne santé digestive. Voici comment en consommer suffisamment.',
    image:
      'https://images.unsplash.com/photo-1507367218428-c9104f878385?w=800&h=600&fit=crop',
    publishedAt: '2024-10-10',
    readingTime: 5,
    author: 'Lucie Cornille',
    category: 'nutrition',
    tags: ['fibres', 'digestion', 'nutrition'],
  },
  {
    slug: 'vitamines-essentielles',
    title: 'Les vitamines essentielles et où les trouver',
    excerpt:
      'Guide complet des vitamines indispensables et des aliments qui en sont riches.',
    image:
      'https://images.unsplash.com/photo-1566385101042-1a0aa0c1268c?w=800&h=600&fit=crop',
    publishedAt: '2024-10-05',
    readingTime: 9,
    author: 'Lucie Cornille',
    category: 'nutrition',
    tags: ['vitamines', 'nutriments', 'santé'],
  },
  {
    slug: 'index-glycemique',
    title: "Comprendre l'index glycémique des aliments",
    excerpt:
      "L'index glycémique influence votre énergie et votre poids. Apprenez à l'utiliser à votre avantage.",
    image:
      'https://images.unsplash.com/photo-1609501676725-7186f017a4b7?w=800&h=600&fit=crop',
    publishedAt: '2024-09-30',
    readingTime: 7,
    author: 'Lucie Cornille',
    category: 'nutrition',
    tags: ['glycémie', 'nutrition', 'santé'],
  },
  {
    slug: 'mineraux-oligoelements',
    title: 'Minéraux et oligoéléments : rôles et sources',
    excerpt:
      'Ces nutriments en petites quantités sont cruciaux pour votre santé. Découvrez lesquels et où les trouver.',
    image:
      'https://images.unsplash.com/photo-1476718406336-bb5a9690ee2a?w=800&h=600&fit=crop',
    publishedAt: '2024-09-25',
    readingTime: 8,
    author: 'Lucie Cornille',
    category: 'nutrition',
    tags: ['minéraux', 'oligoéléments', 'nutrition'],
  },
];

// Utilitaires
function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}

/**
 * Carte Article - Style NutriSensia
 */
function ArticleCard({ article }: { article: Article }) {
  const [isHovered, setIsHovered] = React.useState(false);

  return (
    <Link
      href={`/blog/${article.category}/${article.slug}` as any}
      className='block'
    >
      <article
        style={{
          backgroundColor: '#ffffff',
          border: '1px solid #e5e5e5',
          borderRadius: '10px',
          overflow: 'hidden',
          boxShadow: isHovered ? '10px 10px 0 #E5DED6' : '8px 8px 0 #E5DED6',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          transition: 'transform 0.3s ease-out, box-shadow 0.3s ease-out',
          transform: isHovered ? 'translateY(-4px)' : 'translateY(0)',
        }}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {/* Image */}
        <div
          style={{
            position: 'relative',
            width: '100%',
            height: '220px',
            overflow: 'hidden',
          }}
        >
          {article.image ? (
            <>
              <img
                src={article.image}
                alt={article.title}
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
              <div
                className='absolute inset-0 pointer-events-none'
                style={{
                  backgroundColor: 'rgba(27, 153, 139, 0.2)',
                }}
              />
            </>
          ) : (
            <div className='w-full h-full flex items-center justify-center bg-gradient-to-br from-[#E8F3EF] to-[#E5DED6]'>
              <BookOpen className='w-20 h-20 text-[#1B998B] opacity-30' />
            </div>
          )}
        </div>

        {/* Content */}
        <div
          style={{
            padding: '24px',
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          {/* Category badge */}
          <div style={{ marginBottom: '16px' }}>
            <span
              style={{
                backgroundColor: 'rgba(27, 153, 139, 0.08)',
                color: '#1B998B',
                border: '1px solid #E5DED6',
                padding: '3px 10px',
                borderRadius: '9999px',
                fontSize: '10px',
                fontWeight: 600,
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
                fontFamily:
                  "'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
              }}
            >
              Nutrition
            </span>
          </div>

          {/* Title */}
          <h3
            style={{
              fontFamily: "'Marcellus', serif",
              fontSize: '24px',
              fontWeight: 400,
              lineHeight: '1.4',
              color: '#1a1a1a',
              paddingBottom: '12px',
              marginBottom: '12px',
              borderBottom: '1px solid #e5e5e5',
            }}
          >
            {article.title}
          </h3>

          {/* Author */}
          <p
            style={{
              fontFamily:
                "'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
              fontSize: '11.2px',
              color: '#41556b',
              marginTop: 'auto',
            }}
          >
            Rédigé par{' '}
            <span style={{ color: '#1a1a1a', fontWeight: 600 }}>
              {article.author}
            </span>
          </p>
        </div>
      </article>
    </Link>
  );
}

/**
 * Page Nutrition
 */
export default function NutritionPage() {
  const headerRef = useRef(null);
  const gridRef = useRef(null);
  const isHeaderInView = useInView(headerRef, { once: true, margin: '-100px' });
  const isGridInView = useInView(gridRef, { once: true, margin: '-100px' });
  const { isFirstVisit, isReady } = useFirstVisit();

  return (
    <div
      className='min-h-screen'
      style={{
        backgroundColor: '#FBF9F7',
        backgroundImage:
          'radial-gradient(ellipse 2500px 800px at 0% 0%, rgba(27, 153, 139, 0.15) 0%, transparent 50%)',
      }}
    >
      {/* Header - disparaît au scroll, réapparaît uniquement en haut */}
      <MarketingHeader hideOnScroll={true} />

      {/* Spacer pour le header flottant fixe */}
      <div style={{ height: '100px' }} />

      {/* Barre de navigation des catégories */}
      <CategoryNavBar activeCategory='nutrition' topOffset='80px' />

      {/* Main Content */}
      <main className='pt-8 pb-24'>
        <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
          {/* Breadcrumb */}
          <div
            className='mb-8 flex items-center gap-2 text-sm'
            style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
          >
            <Link
              href='/blog'
              className='transition-colors hover:text-[#1B998B]'
              style={{ color: '#666666' }}
            >
              Blog
            </Link>
            <span style={{ color: '#666666' }}>›</span>
            <span style={{ color: '#1a1a1a' }}>Nutrition</span>
          </div>

          {/* Titre de la catégorie */}
          <motion.div
            ref={headerRef}
            style={
              isFirstVisit ? { opacity: 0, transform: 'translateY(30px)' } : {}
            }
            animate={
              isReady && isHeaderInView
                ? { opacity: 1, y: 0 }
                : { opacity: 0, y: 30 }
            }
            transition={
              isFirstVisit && isReady ? { duration: 0.6 } : { duration: 0 }
            }
            className='mb-12'
          >
            <h1
              className='text-4xl lg:text-5xl font-bold mb-4'
              style={{
                fontFamily: "'Marcellus', serif",
                color: '#1B998B',
                lineHeight: '1.2',
              }}
            >
              Nutrition
            </h1>
            <p
              className='text-lg max-w-3xl'
              style={{
                fontFamily: "'Plus Jakarta Sans', sans-serif",
                color: '#666666',
                lineHeight: '1.6',
              }}
            >
              Découvrez nos articles sur la nutrition, les nutriments
              essentiels, et comment optimiser votre alimentation pour une santé
              optimale.
            </p>
          </motion.div>

          {/* Grille d'articles */}
          <motion.div
            ref={gridRef}
            style={
              isFirstVisit ? { opacity: 0, transform: 'translateY(30px)' } : {}
            }
            animate={
              isReady && isGridInView
                ? { opacity: 1, y: 0 }
                : { opacity: 0, y: 30 }
            }
            transition={
              isFirstVisit && isReady
                ? { duration: 0.6, delay: 0.2 }
                : { duration: 0 }
            }
            className='grid md:grid-cols-2 lg:grid-cols-3 gap-8'
          >
            {nutritionArticles.map(article => (
              <ArticleCard key={article.slug} article={article} />
            ))}
          </motion.div>
        </div>
      </main>

      {/* Footer */}
      <MarketingFooter />
    </div>
  );
}
