'use client';

import React, { useRef } from 'react';
import { Link } from '@/i18n/navigation';
import { MarketingHeader } from '@/components/landing/MarketingHeader';
import { MarketingFooter } from '@/components/landing/MarketingFooter';
import { CategoryNavBar } from '@/components/blog/CategoryNavBar';
import { motion, useInView } from 'framer-motion';
import { useFirstVisit } from '@/hooks/useFirstVisit';
import {
  TrendingUp,
  BookOpen,
  Mail,
  ChevronRight,
  ChevronLeft,
  ArrowRight,
  Sparkles,
} from 'lucide-react';

/**
 * Page Blog NutriSensia - Design inspiré de Finary
 *
 * Structure:
 * 1. Header avec titre et sous-titre
 * 2. Onglets de catégories horizontaux
 * 3. Section "Nouveaux articles" - grille featured (1 grand + 2 moyens)
 * 4. Section "Articles tendances" - 4 cartes horizontales
 * 5. Sections par catégorie avec slider
 * 6. Newsletter CTA
 *
 * Style: NutriSensia Design System - Palette Méditerranée
 * - Signature shadow: 8px 8px 0 #E5DED6
 * - Typography: Marcellus + Plus Jakarta Sans
 * - Colors: #1B998B, #41556b, #FBF9F7
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

// Catégories
const categories = [
  { id: 'all', label: 'Tous les articles' },
  { id: 'nutrition', label: 'Nutrition' },
  { id: 'sante', label: 'Santé' },
  { id: 'bien-etre', label: 'Bien-être' },
  { id: 'recettes', label: 'Recettes' },
  { id: 'conseils', label: 'Conseils pratiques' },
];

// Articles de démonstration enrichis
const allArticles: Article[] = [
  {
    slug: 'alimentation-equilibree-bases',
    title: "Les bases d'une alimentation équilibrée pour une vie saine",
    excerpt:
      'Découvrez les principes fondamentaux pour construire une alimentation saine et durable au quotidien. Apprenez à équilibrer vos repas avec les bons nutriments pour optimiser votre énergie et votre bien-être.',
    image:
      'https://images.unsplash.com/photo-1490645935967-10de6ba17061?w=800&h=600&fit=crop',
    publishedAt: '2024-12-10',
    readingTime: 8,
    author: 'Sarah Dupont',
    category: 'nutrition',
    tags: ['nutrition', 'santé', 'équilibre'],
  },
  {
    slug: 'microbiote-intestinal',
    title: 'Prendre soin de son microbiote intestinal',
    excerpt:
      'Le microbiote intestinal joue un rôle crucial dans notre santé. Voici comment le nourrir et le préserver pour un bien-être optimal.',
    image:
      'https://images.unsplash.com/photo-1505576399279-565b52d4ac71?w=800&h=600&fit=crop',
    publishedAt: '2024-12-05',
    readingTime: 10,
    author: 'Sarah Dupont',
    category: 'sante',
    tags: ['microbiote', 'digestion', 'santé'],
  },
  {
    slug: 'systeme-immunitaire-alimentation',
    title: "Renforcer son système immunitaire par l'alimentation",
    excerpt:
      'Découvrez les nutriments essentiels et les aliments clés pour booster naturellement vos défenses immunitaires.',
    image:
      'https://images.unsplash.com/photo-1610465299996-e4558eecfdd4?w=800&h=600&fit=crop',
    publishedAt: '2024-12-01',
    readingTime: 7,
    author: 'Sarah Dupont',
    category: 'sante',
    tags: ['immunité', 'santé', 'prévention'],
  },
  {
    slug: 'sante-cardiovasculaire',
    title: 'Protéger sa santé cardiovasculaire au quotidien',
    excerpt:
      'Les habitudes alimentaires qui contribuent à maintenir un cœur en bonne santé et prévenir les maladies cardiovasculaires.',
    image:
      'https://images.unsplash.com/photo-1505751172876-fa1923c5c528?w=800&h=600&fit=crop',
    publishedAt: '2024-11-25',
    readingTime: 9,
    author: 'Sarah Dupont',
    category: 'sante',
    tags: ['cardiovasculaire', 'santé', 'prévention'],
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
    author: 'Sarah Dupont',
    category: 'nutrition',
    tags: ['inflammation', 'santé', 'prévention'],
  },
  {
    slug: 'gerer-stress-alimentation',
    title: "Gérer le stress par l'alimentation",
    excerpt:
      "Certains aliments peuvent aider à réguler le stress et l'anxiété. Découvrez les nutriments essentiels pour un système nerveux apaisé.",
    image:
      'https://images.unsplash.com/photo-1543362906-acfc16c67564?w=800&h=600&fit=crop',
    publishedAt: '2024-11-20',
    readingTime: 6,
    author: 'Sarah Dupont',
    category: 'bien-etre',
    tags: ['stress', 'bien-être', 'nutrition'],
  },
  {
    slug: 'petit-dejeuner-energetique',
    title: '5 petits-déjeuners énergétiques pour bien commencer la journée',
    excerpt:
      "Des recettes simples et nutritives pour un petit-déjeuner qui vous donnera l'énergie nécessaire toute la matinée.",
    image:
      'https://images.unsplash.com/photo-1533089860892-a7c6f0a88666?w=800&h=600&fit=crop',
    publishedAt: '2024-11-15',
    readingTime: 5,
    author: 'Sarah Dupont',
    category: 'recettes',
    tags: ['recettes', 'petit-déjeuner', 'énergie'],
  },
  {
    slug: 'bowls-equilibres',
    title: 'Bowls équilibrés : 10 recettes colorées et nutritives',
    excerpt:
      'Découvrez comment composer des bowls savoureux et complets pour vos déjeuners et dîners.',
    image:
      'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=800&h=600&fit=crop',
    publishedAt: '2024-11-08',
    readingTime: 6,
    author: 'Sarah Dupont',
    category: 'recettes',
    tags: ['recettes', 'bowls', 'déjeuner'],
  },
  {
    slug: 'snacks-sains',
    title: 'Snacks sains pour combler les petites faims',
    excerpt:
      'Des idées de collations nutritives et faciles à préparer pour éviter les grignotages malsains.',
    image:
      'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=800&h=600&fit=crop',
    publishedAt: '2024-11-02',
    readingTime: 4,
    author: 'Sarah Dupont',
    category: 'recettes',
    tags: ['recettes', 'snacks', 'collations'],
  },
  {
    slug: 'hydratation-importance',
    title: "L'importance de l'hydratation pour votre santé",
    excerpt:
      "L'eau est essentielle à notre organisme. Découvrez combien boire et comment optimiser votre hydratation au quotidien.",
    image:
      'https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=800&h=600&fit=crop',
    publishedAt: '2024-11-10',
    readingTime: 4,
    author: 'Sarah Dupont',
    category: 'conseils',
    tags: ['hydratation', 'conseils', 'santé'],
  },
  {
    slug: 'lire-etiquettes-alimentaires',
    title: 'Apprendre à lire les étiquettes alimentaires',
    excerpt:
      'Comprendre les informations nutritionnelles sur les emballages pour faire des choix éclairés au supermarché.',
    image:
      'https://images.unsplash.com/photo-1534723328310-e82dad3ee43f?w=800&h=600&fit=crop',
    publishedAt: '2024-11-05',
    readingTime: 6,
    author: 'Sarah Dupont',
    category: 'conseils',
    tags: ['étiquettes', 'conseils', 'alimentation'],
  },
  {
    slug: 'courses-intelligentes',
    title: 'Faire ses courses intelligemment pour mieux manger',
    excerpt:
      'Des astuces pratiques pour organiser vos courses et remplir votre panier de produits sains et nutritifs.',
    image:
      'https://images.unsplash.com/photo-1542838132-92c53300491e?w=800&h=600&fit=crop',
    publishedAt: '2024-10-28',
    readingTime: 5,
    author: 'Sarah Dupont',
    category: 'conseils',
    tags: ['courses', 'conseils', 'organisation'],
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
    author: 'Sarah Dupont',
    category: 'nutrition',
    tags: ['superaliments', 'nutrition', 'mythes'],
  },
  {
    slug: 'sommeil-alimentation',
    title: "Comment l'alimentation influence votre sommeil",
    excerpt:
      'Ce que vous mangez affecte directement la qualité de votre sommeil. Voici les aliments à privilégier et ceux à éviter.',
    image:
      'https://images.unsplash.com/photo-1541781774459-bb2af2f05b55?w=800&h=600&fit=crop',
    publishedAt: '2024-10-30',
    readingTime: 6,
    author: 'Sarah Dupont',
    category: 'bien-etre',
    tags: ['sommeil', 'bien-être', 'alimentation'],
  },
  {
    slug: 'meditation-pleine-conscience',
    title: 'Méditation et pleine conscience au quotidien',
    excerpt:
      'Découvrez comment intégrer la méditation dans votre routine quotidienne pour réduire le stress et améliorer votre bien-être global.',
    image:
      'https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=800&h=600&fit=crop',
    publishedAt: '2024-10-22',
    readingTime: 7,
    author: 'Sarah Dupont',
    category: 'bien-etre',
    tags: ['méditation', 'bien-être', 'mindfulness'],
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
    author: 'Sarah Dupont',
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
    author: 'Sarah Dupont',
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
    author: 'Sarah Dupont',
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
    author: 'Sarah Dupont',
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
    author: 'Sarah Dupont',
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
    author: 'Sarah Dupont',
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
    author: 'Sarah Dupont',
    category: 'nutrition',
    tags: ['minéraux', 'oligoéléments', 'nutrition'],
  },
  {
    slug: 'hydratation-quotidienne',
    title: "L'importance de l'hydratation pour votre santé",
    excerpt:
      "Découvrez pourquoi bien s'hydrater est essentiel pour votre organisme et comment adapter vos besoins en eau selon votre activité.",
    image:
      'https://images.unsplash.com/photo-1548839140-29a749e1cf4d?w=800&h=600&fit=crop',
    publishedAt: '2024-09-20',
    readingTime: 6,
    author: 'Sarah Dupont',
    category: 'nutrition',
    tags: ['hydratation', 'eau', 'santé'],
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
 * Badge de catégorie - Style NutriSensia
 */
function CategoryBadge({ category }: { category: string }) {
  const categoryLabel =
    categories.find(c => c.id === category)?.label || category;

  return (
    <span
      style={{
        backgroundColor: 'rgba(27, 153, 139, 0.08)' /* Turquoise pale */,
        color: '#1B998B' /* Turquoise Azur */,
        border: '1px solid #E5DED6' /* Beige Sand */,
        padding: '3px 10px',
        borderRadius: '9999px',
        fontSize: '10px',
        fontWeight: 600,
        textTransform: 'uppercase',
        letterSpacing: '0.05em',
        fontFamily:
          "'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
        display: 'inline-block',
      }}
    >
      {categoryLabel}
    </span>
  );
}

/**
 * Carte Article Featured (Grande) - Style Hybride (Finary + NutriSensia)
 */
function FeaturedCard({ article }: { article: Article }) {
  return (
    <Link
      href={`/blog/${article.category}/${article.slug}` as any}
      className='block group h-full'
    >
      <article
        className='h-full flex flex-col'
        style={{
          border: '1px solid #e5e5e5',
          borderRadius: '16px',
          boxShadow: '4px 4px 0 #E5DED6' /* Beige Sand */,
          overflow: 'hidden',
          backgroundColor: '#ffffff',
          transition: 'transform 0.3s ease-out, box-shadow 0.3s ease-out',
          transform: 'translateY(0)',
        }}
        onMouseEnter={e => {
          e.currentTarget.style.transform = 'translateY(-4px)';
          e.currentTarget.style.boxShadow = '6px 6px 0 #E5DED6';
        }}
        onMouseLeave={e => {
          e.currentTarget.style.transform = 'translateY(0)';
          e.currentTarget.style.boxShadow = '4px 4px 0 #E5DED6';
        }}
      >
        {/* Image - Grande, prend l'espace disponible */}
        <div className='w-full overflow-hidden bg-[#E8F3EF] relative flex-1'>
          {article.image ? (
            <>
              <img
                src={article.image}
                alt={article.title}
                className='w-full h-full object-cover'
              />
              <div
                className='absolute inset-0 pointer-events-none'
                style={{
                  backgroundColor:
                    'rgba(27, 153, 139, 0.2)' /* Turquoise Azur overlay */,
                }}
              />
            </>
          ) : (
            <div className='w-full h-full flex items-center justify-center bg-gradient-to-br from-[#E8F3EF] to-[#E5DED6]'>
              <BookOpen className='w-20 h-20 text-[#1B998B] opacity-30' />
            </div>
          )}
        </div>

        {/* Content - Sous l'image */}
        <div style={{ padding: '16px 16px 18px 16px', flexShrink: 0 }}>
          {/* Category badge NutriSensia */}
          <div style={{ marginBottom: '10px' }}>
            <CategoryBadge category={article.category} />
          </div>

          {/* Title */}
          <h3
            className='text-xl transition-colors group-hover:text-[#147569]'
            style={{
              fontFamily: "'Marcellus', serif",
              color: '#1a1a1a',
              lineHeight: '1.35',
              fontWeight: '400',
              paddingBottom: '10px',
              marginBottom: '10px',
              borderBottom: '1px solid #e5e5e5',
              fontSize: '24px',
            }}
          >
            {article.title}
          </h3>

          {/* Author */}
          <p
            style={{
              fontFamily:
                "'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
              fontSize: '10px',
              color: '#41556b',
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
 * Simple Article List Item - Sans image, style compact
 */
function SimpleArticleListItem({ article }: { article: Article }) {
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
          padding: '20px',
          boxShadow: '4px 4px 0 #E5DED6',
          transition: 'transform 0.3s ease-out, box-shadow 0.3s ease-out',
          transform: 'translateY(0)',
        }}
        onMouseEnter={e => {
          e.currentTarget.style.transform = 'translateY(-2px)';
          e.currentTarget.style.boxShadow = '6px 6px 0 #E5DED6';
        }}
        onMouseLeave={e => {
          e.currentTarget.style.transform = 'translateY(0)';
          e.currentTarget.style.boxShadow = '4px 4px 0 #E5DED6';
        }}
      >
        <div style={{ marginBottom: '12px' }}>
          <CategoryBadge category={article.category} />
        </div>
        <h3
          style={{
            fontFamily: "'Marcellus', serif",
            fontSize: '18px',
            fontWeight: 400,
            lineHeight: '1.4',
            color: '#1a1a1a',
            marginBottom: '12px',
          }}
        >
          {article.title}
        </h3>
        <p
          style={{
            fontFamily:
              "'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
            fontSize: '10px',
            color: '#41556b',
          }}
        >
          Rédigé par{' '}
          <span style={{ color: '#1a1a1a', fontWeight: 600 }}>
            {article.author}
          </span>
        </p>
      </article>
    </Link>
  );
}

/**
 * Carte Article Tendance (Horizontale) - Style Hybride (Finary + NutriSensia)
 */
function TrendCard({ article }: { article: Article }) {
  return (
    <Link
      href={`/blog/${article.category}/${article.slug}` as any}
      className='block group'
    >
      <article
        className='flex gap-0'
        style={{
          border: '1px solid #e5e5e5',
          borderRadius: '12px',
          boxShadow: '4px 4px 0 #E5DED6' /* Beige Sand */,
          overflow: 'hidden',
          backgroundColor: '#ffffff',
          transition: 'transform 0.3s ease-out, box-shadow 0.3s ease-out',
          transform: 'translateY(0)',
        }}
        onMouseEnter={e => {
          e.currentTarget.style.transform = 'translateY(-4px)';
          e.currentTarget.style.boxShadow = '6px 6px 0 #E5DED6';
        }}
        onMouseLeave={e => {
          e.currentTarget.style.transform = 'translateY(0)';
          e.currentTarget.style.boxShadow = '4px 4px 0 #E5DED6';
        }}
      >
        {/* Image miniature - prend toute la hauteur de la carte */}
        <div className='w-48 flex-shrink-0 overflow-hidden bg-[#E8F3EF] relative self-stretch'>
          {article.image ? (
            <>
              <img
                src={article.image}
                alt={article.title}
                className='w-full h-full object-cover'
              />
              <div
                className='absolute inset-0 pointer-events-none'
                style={{
                  backgroundColor:
                    'rgba(27, 153, 139, 0.2)' /* Turquoise Azur overlay */,
                }}
              />
            </>
          ) : (
            <div className='w-full h-full flex items-center justify-center bg-gradient-to-br from-[#E8F3EF] to-[#E5DED6]'>
              <BookOpen className='w-8 h-8 text-[#1B998B] opacity-30' />
            </div>
          )}
        </div>

        {/* Content */}
        <div className='flex-1 py-3 px-4'>
          {/* Category badge NutriSensia */}
          <div className='mb-2'>
            <CategoryBadge category={article.category} />
          </div>

          {/* Title */}
          <h3
            className='text-base line-clamp-2 transition-colors group-hover:text-[#147569]'
            style={{
              fontFamily: "'Marcellus', serif",
              color: '#1a1a1a',
              lineHeight: '1.35',
              fontWeight: '400',
              paddingBottom: '8px',
              marginBottom: '8px',
              borderBottom: '1px solid #e5e5e5',
              fontSize: '20px',
            }}
          >
            {article.title}
          </h3>

          {/* Author */}
          <p
            style={{
              fontFamily:
                "'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
              fontSize: '10px',
              color: '#41556b',
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
 * Carte Article Compacte (pour sliders) - Style page d'accueil
 */
function CompactCard({ article }: { article: Article }) {
  return (
    <Link
      href={`/blog/${article.category}/${article.slug}` as any}
      className='block flex-shrink-0 w-72'
    >
      <article
        style={{
          backgroundColor: '#ffffff',
          border: '1px solid #e5e5e5',
          borderRadius: '10px',
          overflow: 'hidden',
          boxShadow: '8px 8px 0 #E5DED6' /* Beige Sand */,
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
        }}
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
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                }}
              />
              <div
                className='absolute inset-0 pointer-events-none'
                style={{
                  backgroundColor:
                    'rgba(27, 153, 139, 0.2)' /* Turquoise Azur overlay */,
                }}
              />
            </>
          ) : (
            <div className='w-full h-full flex items-center justify-center bg-gradient-to-br from-[#E8F3EF] to-[#E5DED6]'>
              <BookOpen className='w-10 h-10 text-[#1B998B] opacity-30' />
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
          {/* Badge catégorie */}
          <div style={{ marginBottom: '16px' }}>
            <CategoryBadge category={article.category} />
          </div>

          {/* Titre */}
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

          {/* Auteur */}
          <p
            style={{
              fontFamily:
                "'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
              fontSize: '10px',
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
 * Carte Article Minimaliste (texte seul) - Style Hybride (Finary + NutriSensia)
 */
function MinimalCard({ article }: { article: Article }) {
  return (
    <Link
      href={`/blog/${article.category}/${article.slug}` as any}
      className='block group pb-6 mb-6 border-b border-[#e5e5e5] relative'
    >
      <article>
        {/* Category badge NutriSensia */}
        <div className='mb-3'>
          <CategoryBadge category={article.category} />
        </div>

        {/* Title */}
        <h3
          className='text-base mb-3 pb-2 transition-colors group-hover:text-[#147569]'
          style={{
            fontFamily: "'Marcellus', serif",
            color: '#1a1a1a',
            lineHeight: '1.45',
            fontWeight: '400',
            borderBottom: '1px solid #f0f0f0',
            fontSize: '18px',
          }}
        >
          {article.title}
        </h3>

        {/* Author */}
        <p
          style={{
            fontFamily:
              "'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
            fontSize: '10px',
            color: '#41556b',
          }}
        >
          Rédigé par{' '}
          <span style={{ color: '#1a1a1a', fontWeight: 600 }}>
            {article.author}
          </span>
        </p>
      </article>

      {/* Barre verte animée au hover */}
      <span
        className='absolute bottom-0 left-0 h-[2px] bg-[#1B998B] w-0 group-hover:w-full transition-all duration-500 ease-out'
        style={{
          transitionProperty: 'width',
        }}
      />
    </Link>
  );
}

/**
 * Section avec slider horizontal
 */
function CategorySection({
  title,
  articles,
  icon: Icon,
}: {
  title: string;
  articles: Article[];
  icon: React.ElementType;
}) {
  const scrollRef = useRef<HTMLDivElement>(null);

  const scroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const scrollAmount = 300;
      scrollRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth',
      });
    }
  };

  if (articles.length === 0) return null;

  return (
    <section className='mb-16'>
      {/* Header */}
      <div className='flex items-center justify-between mb-6'>
        <h2
          className='text-2xl font-bold flex items-center gap-3'
          style={{
            fontFamily: "'Marcellus', serif",
            color: '#1B998B' /* Turquoise Azur */,
          }}
        >
          <Icon className='w-6 h-6' />
          {title}
        </h2>
        <div className='flex items-center gap-2'>
          <button
            onClick={() => scroll('left')}
            className='w-10 h-10 rounded-full border border-[#1B998B] flex items-center justify-center transition-all hover:bg-[#1B998B] hover:text-white'
            style={{ color: '#1B998B' }}
          >
            <ChevronLeft className='w-5 h-5' />
          </button>
          <button
            onClick={() => scroll('right')}
            className='w-10 h-10 rounded-full border border-[#1B998B] flex items-center justify-center transition-all hover:bg-[#1B998B] hover:text-white'
            style={{ color: '#1B998B' }}
          >
            <ChevronRight className='w-5 h-5' />
          </button>
          <Link
            href='/blog'
            className='ml-4 flex items-center gap-2 text-sm font-semibold transition-colors hover:text-[#147569]'
            style={{
              color: '#1B998B',
              /* Turquoise Azur */ fontFamily:
                "'Plus Jakarta Sans', sans-serif",
            }}
          >
            Voir plus
            <ArrowRight className='w-4 h-4' />
          </Link>
        </div>
      </div>

      {/* Slider */}
      <div
        ref={scrollRef}
        className='flex gap-6 overflow-x-auto pb-4 scrollbar-hide'
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        {articles.map(article => (
          <CompactCard key={article.slug} article={article} />
        ))}
      </div>
    </section>
  );
}

/**
 * Newsletter CTA Section
 */
function NewsletterCTA() {
  return (
    <section
      className='rounded-3xl p-8 md:p-12 text-center mb-16'
      style={{
        backgroundColor: '#1B998B' /* Turquoise Azur */,
        boxShadow: '8px 8px 0 #E5DED6' /* Beige Sand */,
      }}
    >
      <div className='max-w-2xl mx-auto'>
        <div
          className='w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6'
          style={{ backgroundColor: 'rgba(255, 255, 255, 0.2)' }}
        >
          <Mail className='w-8 h-8 text-white' />
        </div>
        <h2
          className='text-3xl font-bold mb-4 text-white'
          style={{ fontFamily: "'Marcellus', serif" }}
        >
          Restez informé(e) chaque semaine
        </h2>
        <p
          className='text-lg mb-8'
          style={{
            fontFamily: "'Plus Jakarta Sans', sans-serif",
            color: 'rgba(255, 255, 255, 0.9)',
          }}
        >
          Recevez nos meilleurs conseils nutrition, recettes exclusives et
          actualités directement dans votre boîte mail.
        </p>
        <div className='flex flex-col sm:flex-row gap-4 justify-center max-w-md mx-auto'>
          <input
            type='email'
            placeholder='Votre adresse email'
            className='flex-1 px-6 py-3 rounded-full text-[#147569] outline-none'
            style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
          />
          <button
            className='px-8 py-3 font-semibold transition-all duration-300 hover:opacity-90'
            style={{
              backgroundColor: '#ffffff',
              color: '#147569' /* Turquoise foncé */,
              borderRadius: '35px',
              fontFamily: "'Plus Jakarta Sans', sans-serif",
            }}
          >
            S&apos;abonner →
          </button>
        </div>
      </div>
    </section>
  );
}

/**
 * Page principale du Blog
 */
export default function BlogPage() {
  // Refs pour les animations
  const titleRef = useRef(null);
  const mainSectionRef = useRef(null);
  const nutritionRef = useRef(null);
  const santeRef = useRef(null);
  const bienEtreRef = useRef(null);
  const recettesRef = useRef(null);
  const conseilsRef = useRef(null);

  // First visit check pour animations conditionnelles
  const { isFirstVisit, isReady } = useFirstVisit();

  // Hooks useInView
  const isTitleInView = useInView(titleRef, { once: true, margin: '-100px' });
  const isMainSectionInView = useInView(mainSectionRef, {
    once: true,
    margin: '-100px',
  });
  const isNutritionInView = useInView(nutritionRef, {
    once: true,
    margin: '-100px',
  });
  const isSanteInView = useInView(santeRef, { once: true, margin: '-100px' });
  const isBienEtreInView = useInView(bienEtreRef, {
    once: true,
    margin: '-100px',
  });
  const isRecettesInView = useInView(recettesRef, {
    once: true,
    margin: '-100px',
  });
  const isConseilsInView = useInView(conseilsRef, {
    once: true,
    margin: '-100px',
  });

  // Articles pour chaque section
  const newArticles = allArticles.slice(0, 3);
  const trendArticles = allArticles.slice(0, 4);
  const nutritionArticles = allArticles.filter(a => a.category === 'nutrition');
  const santeArticles = allArticles.filter(a => a.category === 'sante');
  const recettesArticles = allArticles.filter(a => a.category === 'recettes');
  const bienEtreArticles = allArticles.filter(a => a.category === 'bien-etre');
  const conseilsArticles = allArticles.filter(a => a.category === 'conseils');

  return (
    <div
      className='min-h-screen'
      style={{
        backgroundColor: '#FBF9F7' /* Warm Cream - Méditerranée */,
        backgroundImage:
          'radial-gradient(ellipse 2500px 800px at 0% 0%, rgba(27, 153, 139, 0.15) 0%, transparent 50%)',
      }}
    >
      {/* Header - disparaît au scroll, réapparaît uniquement en haut */}
      <MarketingHeader hideOnScroll={true} />

      {/* Spacer pour le header flottant fixe (announcement bar + header) */}
      <div style={{ height: '100px' }} />

      {/* Barre de navigation des catégories - Style Blog */}
      <CategoryNavBar activeCategory='all' topOffset='80px' />

      {/* Main Content */}
      <main className='pt-8 pb-24'>
        <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
          {/* Titre principal de la page - Style Finary */}
          <motion.h1
            ref={titleRef}
            animate={
              isReady && isTitleInView
                ? { opacity: 1, y: 0 }
                : { opacity: 0, y: 30 }
            }
            transition={
              isFirstVisit && isReady ? { duration: 0.6 } : { duration: 0 }
            }
            className='text-4xl lg:text-5xl font-bold mb-12'
            style={{
              fontFamily: "'Marcellus', serif",
              color: '#1B998B' /* Turquoise Azur */,
              lineHeight: '1.2',
            }}
          >
            Tout savoir sur la nutrition avec NutriSensia
          </motion.h1>

          {/* Section principale: Nouveaux articles + Articles tendances - Style Finary */}
          <motion.section
            ref={mainSectionRef}
            animate={
              isReady && isMainSectionInView
                ? { opacity: 1, y: 0 }
                : { opacity: 0, y: 30 }
            }
            transition={
              isFirstVisit && isReady
                ? { duration: 0.6, delay: 0.2 }
                : { duration: 0 }
            }
            className='mb-16'
          >
            <div className='grid lg:grid-cols-[1fr_1px_1fr] gap-8 lg:gap-12'>
              {/* Colonne gauche: Nouveaux articles */}
              <div className='flex flex-col'>
                {/* Header avec flèches de navigation */}
                <div className='flex items-center justify-between mb-6'>
                  <h2
                    className='text-2xl font-bold'
                    style={{
                      fontFamily: "'Marcellus', serif",
                      color: '#1a1a1a',
                    }}
                  >
                    Nouveaux articles
                  </h2>
                  <div className='flex items-center gap-2'>
                    <button
                      className='w-8 h-8 rounded-full border border-[#e5e5e5] flex items-center justify-center transition-all hover:border-[#1B998B] hover:text-[#1B998B]'
                      style={{ color: '#999999' }}
                    >
                      <ChevronLeft className='w-4 h-4' />
                    </button>
                    <button
                      className='w-8 h-8 rounded-full border border-[#e5e5e5] flex items-center justify-center transition-all hover:border-[#1B998B] hover:text-[#1B998B]'
                      style={{ color: '#999999' }}
                    >
                      <ChevronRight className='w-4 h-4' />
                    </button>
                  </div>
                </div>

                {/* Grande carte article - Prend tout l'espace restant */}
                <div className='flex-1'>
                  {newArticles.length > 0 ? (
                    <FeaturedCard article={newArticles[0]} />
                  ) : (
                    <div className='aspect-[4/3] rounded-2xl bg-[#E8F3EF] flex items-center justify-center'>
                      <BookOpen className='w-16 h-16 text-[#1B998B] opacity-30' />
                    </div>
                  )}
                </div>
              </div>

              {/* Barre séparatrice verticale */}
              <div className='hidden lg:block w-px bg-[#e5e5e5]' />

              {/* Colonne droite: Articles tendances */}
              <div className='flex flex-col'>
                <h2
                  className='text-2xl font-bold mb-6'
                  style={{
                    fontFamily: "'Marcellus', serif",
                    color: '#1a1a1a',
                  }}
                >
                  Articles tendances
                </h2>

                {/* Liste verticale de 4 cartes horizontales */}
                <div className='flex flex-col gap-6'>
                  {trendArticles.slice(0, 4).map(article => (
                    <TrendCard key={article.slug} article={article} />
                  ))}
                </div>
              </div>
            </div>
          </motion.section>

          {/* Section Nutrition - 2 colonnes avec séparateur - Style Finary */}
          <motion.section
            ref={nutritionRef}
            style={
              isFirstVisit ? { opacity: 0, transform: 'translateY(30px)' } : {}
            }
            animate={
              isReady && isNutritionInView
                ? { opacity: 1, y: 0 }
                : { opacity: 0, y: 30 }
            }
            transition={
              isFirstVisit && isReady ? { duration: 0.6 } : { duration: 0 }
            }
            className='mb-16 mt-[125px]'
          >
            {/* Header principal */}
            <div className='flex items-center justify-between mb-8'>
              <h2
                className='text-2xl font-bold'
                style={{
                  fontFamily: "'Marcellus', serif",
                  color: '#1a1a1a',
                }}
              >
                Nutrition
              </h2>
              <Link
                href={'/blog/nutrition' as any}
                className='flex items-center gap-2 px-4 py-2 text-sm border border-[#d0d0d0] rounded-full transition-all duration-300'
                style={{
                  color: '#1a1a1a',
                  fontFamily: "'Plus Jakarta Sans', sans-serif",
                }}
                onMouseEnter={e =>
                  (e.currentTarget.style.backgroundColor =
                    'rgba(27, 153, 139, 0.08)')
                }
                onMouseLeave={e =>
                  (e.currentTarget.style.backgroundColor = 'transparent')
                }
              >
                Voir plus
                <ChevronRight className='w-4 h-4' />
              </Link>
            </div>

            {/* Layout 2 colonnes - Ratio 2/3 - 1/3 */}
            <div className='grid lg:grid-cols-[2fr_1fr] gap-4 lg:gap-6'>
              {/* Colonne gauche: Grille d'articles avec images */}
              <div className='flex flex-col'>
                <div className='grid md:grid-cols-2 gap-x-4 gap-y-8'>
                  {nutritionArticles.slice(0, 4).map(article => (
                    <FeaturedCard key={article.slug} article={article} />
                  ))}
                </div>
              </div>

              {/* Colonne droite: Liste d'articles sans image - Style NutriSensia */}
              <div className='flex flex-col gap-4'>
                {nutritionArticles.slice(4, 10).map(article => (
                  <SimpleArticleListItem key={article.slug} article={article} />
                ))}
              </div>
            </div>
          </motion.section>

          {/* Section Santé - 3 colonnes - Style Finary */}
          <motion.section
            ref={santeRef}
            style={
              isFirstVisit ? { opacity: 0, transform: 'translateY(30px)' } : {}
            }
            animate={
              isReady && isSanteInView
                ? { opacity: 1, y: 0 }
                : { opacity: 0, y: 30 }
            }
            transition={
              isFirstVisit && isReady ? { duration: 0.6 } : { duration: 0 }
            }
            className='mb-16 mt-[125px]'
          >
            {/* Header principal */}
            <div className='flex items-center justify-between mb-8'>
              <h2
                className='text-2xl font-bold'
                style={{
                  fontFamily: "'Marcellus', serif",
                  color: '#1a1a1a',
                }}
              >
                Santé
              </h2>
              <Link
                href={'/blog/sante' as any}
                className='flex items-center gap-2 px-4 py-2 text-sm border border-[#d0d0d0] rounded-full transition-all duration-300'
                style={{
                  color: '#1a1a1a',
                  fontFamily: "'Plus Jakarta Sans', sans-serif",
                }}
                onMouseEnter={e =>
                  (e.currentTarget.style.backgroundColor =
                    'rgba(27, 153, 139, 0.08)')
                }
                onMouseLeave={e =>
                  (e.currentTarget.style.backgroundColor = 'transparent')
                }
              >
                Voir plus
                <ChevronRight className='w-4 h-4' />
              </Link>
            </div>

            {/* Grille 3 colonnes */}
            <div className='grid md:grid-cols-3 gap-x-6'>
              {santeArticles.slice(0, 3).map(article => (
                <FeaturedCard key={article.slug} article={article} />
              ))}
            </div>
          </motion.section>

          {/* Section Bien-être - Layout asymétrique - Style Finary */}
          <motion.section
            ref={bienEtreRef}
            style={
              isFirstVisit ? { opacity: 0, transform: 'translateY(30px)' } : {}
            }
            animate={
              isReady && isBienEtreInView
                ? { opacity: 1, y: 0 }
                : { opacity: 0, y: 30 }
            }
            transition={
              isFirstVisit && isReady ? { duration: 0.6 } : { duration: 0 }
            }
            className='mb-16 mt-[125px]'
          >
            {/* Header principal */}
            <div className='flex items-center justify-between mb-8'>
              <h2
                className='text-2xl font-bold'
                style={{
                  fontFamily: "'Marcellus', serif",
                  color: '#1a1a1a',
                }}
              >
                Bien-être
              </h2>
              <Link
                href={'/blog/bien-etre' as any}
                className='flex items-center gap-2 px-4 py-2 text-sm border border-[#d0d0d0] rounded-full transition-all duration-300'
                style={{
                  color: '#1a1a1a',
                  fontFamily: "'Plus Jakarta Sans', sans-serif",
                }}
                onMouseEnter={e =>
                  (e.currentTarget.style.backgroundColor =
                    'rgba(27, 153, 139, 0.08)')
                }
                onMouseLeave={e =>
                  (e.currentTarget.style.backgroundColor = 'transparent')
                }
              >
                Voir plus
                <ChevronRight className='w-4 h-4' />
              </Link>
            </div>

            {/* Layout asymétrique: petite à gauche, grande au centre, moyenne à droite */}
            <div className='grid grid-cols-12 gap-6'>
              {/* Colonne gauche - Petite carte */}
              <div className='col-span-3'>
                {bienEtreArticles[0] && (
                  <FeaturedCard article={bienEtreArticles[0]} />
                )}
              </div>

              {/* Colonne centre - Grande carte */}
              <div className='col-span-6'>
                {bienEtreArticles[1] && (
                  <FeaturedCard article={bienEtreArticles[1]} />
                )}
              </div>

              {/* Colonne droite - Moyenne carte */}
              <div className='col-span-3'>
                {bienEtreArticles[2] && (
                  <FeaturedCard article={bienEtreArticles[2]} />
                )}
              </div>
            </div>
          </motion.section>

          {/* Section Recettes - Layout 2 colonnes asymétrique - Style Finary */}
          <motion.section
            ref={recettesRef}
            style={
              isFirstVisit ? { opacity: 0, transform: 'translateY(30px)' } : {}
            }
            animate={
              isReady && isRecettesInView
                ? { opacity: 1, y: 0 }
                : { opacity: 0, y: 30 }
            }
            transition={
              isFirstVisit && isReady ? { duration: 0.6 } : { duration: 0 }
            }
            className='mb-16 mt-[125px]'
          >
            {/* Header principal */}
            <div className='flex items-center justify-between mb-8'>
              <h2
                className='text-2xl font-bold'
                style={{
                  fontFamily: "'Marcellus', serif",
                  color: '#1a1a1a',
                }}
              >
                Recettes
              </h2>
              <Link
                href={'/blog/recettes' as any}
                className='flex items-center gap-2 px-4 py-2 text-sm border border-[#d0d0d0] rounded-full transition-all duration-300'
                style={{
                  color: '#1a1a1a',
                  fontFamily: "'Plus Jakarta Sans', sans-serif",
                }}
                onMouseEnter={e =>
                  (e.currentTarget.style.backgroundColor =
                    'rgba(27, 153, 139, 0.08)')
                }
                onMouseLeave={e =>
                  (e.currentTarget.style.backgroundColor = 'transparent')
                }
              >
                Voir plus
                <ChevronRight className='w-4 h-4' />
              </Link>
            </div>

            {/* Layout: 2 grandes cartes + 1 petite carte sur la même ligne */}
            <div className='grid grid-cols-12 gap-6'>
              {/* Première grande carte */}
              <div className='col-span-4'>
                {recettesArticles[0] && (
                  <FeaturedCard article={recettesArticles[0]} />
                )}
              </div>

              {/* Deuxième grande carte */}
              <div className='col-span-5'>
                {recettesArticles[1] && (
                  <FeaturedCard article={recettesArticles[1]} />
                )}
              </div>

              {/* Petite carte */}
              <div className='col-span-3'>
                {recettesArticles[2] && (
                  <FeaturedCard article={recettesArticles[2]} />
                )}
              </div>
            </div>
          </motion.section>

          {/* Section Conseils pratiques - 3 colonnes - Style Finary */}
          <motion.section
            ref={conseilsRef}
            style={
              isFirstVisit ? { opacity: 0, transform: 'translateY(30px)' } : {}
            }
            animate={
              isReady && isConseilsInView
                ? { opacity: 1, y: 0 }
                : { opacity: 0, y: 30 }
            }
            transition={
              isFirstVisit && isReady ? { duration: 0.6 } : { duration: 0 }
            }
            className='mb-16 mt-[125px]'
          >
            {/* Header principal */}
            <div className='flex items-center justify-between mb-8'>
              <h2
                className='text-2xl font-bold'
                style={{
                  fontFamily: "'Marcellus', serif",
                  color: '#1a1a1a',
                }}
              >
                Conseils pratiques
              </h2>
              <Link
                href={'/blog/conseils' as any}
                className='flex items-center gap-2 px-4 py-2 text-sm border border-[#d0d0d0] rounded-full transition-all duration-300'
                style={{
                  color: '#1a1a1a',
                  fontFamily: "'Plus Jakarta Sans', sans-serif",
                }}
                onMouseEnter={e =>
                  (e.currentTarget.style.backgroundColor =
                    'rgba(27, 153, 139, 0.08)')
                }
                onMouseLeave={e =>
                  (e.currentTarget.style.backgroundColor = 'transparent')
                }
              >
                Voir plus
                <ChevronRight className='w-4 h-4' />
              </Link>
            </div>

            {/* Grille 3 colonnes */}
            <div className='grid md:grid-cols-3 gap-x-6'>
              {conseilsArticles.slice(0, 3).map(article => (
                <FeaturedCard key={article.slug} article={article} />
              ))}
            </div>
          </motion.section>
        </div>
      </main>

      {/* Footer */}
      <MarketingFooter />

      {/* Hide scrollbar CSS */}
      <style jsx global>{`
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </div>
  );
}
