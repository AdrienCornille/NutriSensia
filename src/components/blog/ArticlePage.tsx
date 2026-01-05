'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Link } from '@/i18n/navigation';
import { MarketingHeader } from '@/components/landing/MarketingHeader';
import { MarketingFooter } from '@/components/landing/MarketingFooter';
import { CategoryNavBar } from '@/components/blog/CategoryNavBar';
import { motion, useInView } from 'framer-motion';
import { Mail, BookOpen } from 'lucide-react';
import { useFirstVisit } from '@/hooks/useFirstVisit';
import { nameToSlug } from '@/data/authors';

/**
 * Composant Article Page - Style Finary
 */

// Types
export interface RelatedArticle {
  slug: string;
  category: string;
  title: string;
  image: string;
  author: string;
}

export interface ArticleContent {
  slug: string;
  category: string;
  title: string;
  image: string;
  publishedAt: string;
  readingTime: number;
  author: {
    name: string;
    title: string;
  };
  editor: {
    name: string;
    title: string;
  };
  sections: {
    id: string;
    title: string;
    content: string[];
  }[];
  relatedArticles?: RelatedArticle[];
}

// Mapping des catégories
const categoryMapping: Record<string, string> = {
  nutrition: 'Nutrition',
  sante: 'Santé',
  'bien-etre': 'Bien-être',
  recettes: 'Recettes',
  conseils: 'Conseils pratiques',
};

// Composant pour les articles liés avec gestion hover
function RelatedArticleCard({
  relatedArticle,
}: {
  relatedArticle: RelatedArticle;
}) {
  return (
    <Link
      href={`/blog/${relatedArticle.category}/${relatedArticle.slug}` as any}
      className='block'
    >
      <article
        style={{
          backgroundColor: '#ffffff',
          border: '1px solid #e5e5e5',
          borderRadius: '10px',
          overflow: 'hidden',
          boxShadow: '8px 8px 0 #E5DED6',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          transition: 'transform 0.3s ease-out, box-shadow 0.3s ease-out',
          transform: 'translateY(0)',
        }}
        onMouseEnter={e => {
          e.currentTarget.style.transform = 'translateY(-4px)';
          e.currentTarget.style.boxShadow = '10px 10px 0 #E5DED6';
        }}
        onMouseLeave={e => {
          e.currentTarget.style.transform = 'translateY(0)';
          e.currentTarget.style.boxShadow = '8px 8px 0 #E5DED6';
        }}
      >
        <div
          style={{
            position: 'relative',
            width: '100%',
            height: '220px',
            overflow: 'hidden',
          }}
        >
          {relatedArticle.image ? (
            <>
              <img
                src={relatedArticle.image}
                alt={relatedArticle.title}
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
              <div
                className='absolute inset-0 pointer-events-none'
                style={{ backgroundColor: 'rgba(27, 153, 139, 0.2)' }}
              />
            </>
          ) : (
            <div className='w-full h-full flex items-center justify-center bg-gradient-to-br from-[#E8F3EF] to-[#E5DED6]'>
              <BookOpen className='w-20 h-20 text-[#1B998B] opacity-30' />
            </div>
          )}
        </div>
        <div
          style={{
            padding: '24px',
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
          }}
        >
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
              {categoryMapping[relatedArticle.category] ||
                relatedArticle.category}
            </span>
          </div>
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
            {relatedArticle.title}
          </h3>
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
              {relatedArticle.author}
            </span>
          </p>
        </div>
      </article>
    </Link>
  );
}

/**
 * Formater la date
 */
function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'numeric',
    year: 'numeric',
  });
}

/**
 * Composant ArticlePage
 */
export function ArticlePage({ article }: { article: ArticleContent }) {
  const categoryLabel = categoryMapping[article.category] || article.category;
  const [scrollProgress, setScrollProgress] = useState(0);
  const [activeSection, setActiveSection] = useState<string>('');
  const [barStyle, setBarStyle] = useState({ top: 0, height: 0 });
  const tocLinksRef = React.useRef<{ [key: string]: HTMLAnchorElement | null }>(
    {}
  );

  // Refs pour les animations
  const headerRef = useRef(null);
  const imageRef = useRef(null);
  const contentRef = useRef(null);

  // Hooks useInView
  const isHeaderInView = useInView(headerRef, { once: true, margin: '-100px' });
  const isImageInView = useInView(imageRef, { once: true, margin: '-100px' });
  const isContentInView = useInView(contentRef, {
    once: true,
    margin: '-100px',
  });

  // Hook first visit pour animations conditionnelles
  const { isFirstVisit, isReady } = useFirstVisit();

  // Fonction pour scroller vers une section avec offset
  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      // Offset pour CategoryNavBar sticky (~58px) + marge supplémentaire (20px)
      const offset = 78;
      const elementPosition =
        element.getBoundingClientRect().top + window.scrollY;
      const offsetPosition = elementPosition - offset;

      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth',
      });
    }
  };

  useEffect(() => {
    const handleScroll = () => {
      const windowHeight = window.innerHeight;
      const documentHeight = document.documentElement.scrollHeight;
      const scrollTop = window.scrollY;
      const trackLength = documentHeight - windowHeight;
      const progress = (scrollTop / trackLength) * 100;
      setScrollProgress(Math.min(progress, 100));
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Détection de la section active basée sur le scroll
  useEffect(() => {
    const handleScrollForActiveSection = () => {
      // Offset pour CategoryNavBar sticky (~58px) + petite marge (30px)
      const offset = 88;

      // Trouver la section active (celle dont le top est le plus proche de l'offset, mais toujours au-dessus)
      let currentSection = '';
      let minDistance = Infinity;

      article.sections.forEach(section => {
        const element = document.getElementById(section.id);
        if (element) {
          const rect = element.getBoundingClientRect();
          const distance = rect.top - offset;

          // Si la section est au-dessus ou proche de l'offset et plus proche que les précédentes
          if (distance <= 0 && Math.abs(distance) < minDistance) {
            minDistance = Math.abs(distance);
            currentSection = section.id;
          }
        }
      });

      // Si aucune section n'est au-dessus de l'offset, prendre la première
      if (!currentSection && article.sections.length > 0) {
        currentSection = article.sections[0].id;
      }

      if (currentSection && currentSection !== activeSection) {
        setActiveSection(currentSection);
      }
    };

    // Vérifier au chargement
    handleScrollForActiveSection();

    // Vérifier au scroll
    window.addEventListener('scroll', handleScrollForActiveSection);

    return () => {
      window.removeEventListener('scroll', handleScrollForActiveSection);
    };
  }, [article.sections, activeSection]);

  // Mettre à jour la position et la hauteur de la barre en fonction de la section active
  useEffect(() => {
    if (activeSection && tocLinksRef.current[activeSection]) {
      const activeLink = tocLinksRef.current[activeSection];
      if (activeLink) {
        const parentNav = activeLink.parentElement;
        if (parentNav) {
          const linkRect = activeLink.getBoundingClientRect();
          const navRect = parentNav.getBoundingClientRect();
          const top = linkRect.top - navRect.top;
          const height = linkRect.height;
          setBarStyle({ top, height });
        }
      }
    }
  }, [activeSection]);

  return (
    <div
      className='min-h-screen'
      style={{
        backgroundColor: '#FBF9F7',
      }}
    >
      {/* Barre de progression de lecture */}
      <div
        className='fixed top-0 left-0 right-0 h-1 z-[1001]'
        style={{
          backgroundColor: 'rgba(27, 153, 139, 0.1)',
        }}
      >
        <div
          className='h-full transition-all duration-150 ease-out'
          style={{
            width: `${scrollProgress}%`,
            backgroundColor: '#1B998B',
          }}
        />
      </div>

      {/* Header - disparaît au scroll, réapparaît uniquement en haut */}
      <MarketingHeader hideOnScroll={true} hideAnnouncementBar={true} />

      {/* Spacer pour le header flottant fixe */}
      <div style={{ height: '100px' }} />

      {/* Barre de navigation des catégories */}
      <CategoryNavBar activeCategory={article.category} topOffset='80px' />

      {/* Main Content */}
      <main className='pt-8 pb-24'>
        <div className='max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8'>
          {/* Breadcrumb */}
          <div
            className='mb-8 flex items-center gap-2 text-sm'
            style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
          >
            <Link
              href={'/blog' as any}
              className='transition-colors hover:text-[#1B998B]'
              style={{ color: '#666666' }}
            >
              Blog
            </Link>
            <span style={{ color: '#666666' }}>›</span>
            <Link
              href={`/blog/${article.category}` as any}
              className='transition-colors hover:text-[#1B998B]'
              style={{ color: '#666666' }}
            >
              {categoryLabel}
            </Link>
          </div>

          {/* Grid layout: Sidebar gauche + Contenu principal */}
          <div className='grid lg:grid-cols-[255px_660px] gap-[60px]'>
            {/* Sidebar gauche : Auteur, Éditeur et Table des matières */}
            <aside className='hidden lg:block'>
              {/* Auteur et Éditeur - Non sticky */}
              <div className='space-y-8 mb-8'>
                {/* Auteur */}
                <div>
                  <div
                    className='text-xs uppercase tracking-wider mb-3'
                    style={{
                      fontFamily: "'Plus Jakarta Sans', sans-serif",
                      color: '#666666',
                      fontWeight: '600',
                      letterSpacing: '0.05em',
                    }}
                  >
                    AUTEUR
                  </div>
                  <Link
                    href={
                      `/blog/auteurs/${nameToSlug(article.author.name)}` as any
                    }
                    className='flex items-start gap-3 group'
                  >
                    <div
                      className='w-10 h-10 rounded-full bg-[#1B998B] flex-shrink-0'
                      style={{
                        backgroundImage: 'url(https://i.pravatar.cc/150?img=1)',
                        backgroundSize: 'cover',
                        backgroundPosition: 'center',
                      }}
                    />
                    <div>
                      <div
                        className='text-sm font-bold transition-colors group-hover:text-[#1B998B]'
                        style={{
                          fontFamily: "'Plus Jakarta Sans', sans-serif",
                          color: '#1a1a1a',
                          fontWeight: '700',
                        }}
                      >
                        {article.author.name}
                      </div>
                      <div
                        className='text-xs'
                        style={{
                          fontFamily: "'Plus Jakarta Sans', sans-serif",
                          color: '#666666',
                        }}
                      >
                        {article.author.title}
                      </div>
                    </div>
                  </Link>
                </div>

                {/* Éditeur */}
                <div>
                  <div
                    className='text-xs uppercase tracking-wider mb-3'
                    style={{
                      fontFamily: "'Plus Jakarta Sans', sans-serif",
                      color: '#666666',
                      fontWeight: '600',
                      letterSpacing: '0.05em',
                    }}
                  >
                    ÉDITEUR
                  </div>
                  <Link
                    href={
                      `/blog/auteurs/${nameToSlug(article.editor.name)}` as any
                    }
                    className='flex items-start gap-3 group'
                  >
                    <div
                      className='w-10 h-10 rounded-full bg-[#1B998B] flex-shrink-0'
                      style={{
                        backgroundImage: 'url(https://i.pravatar.cc/150?img=2)',
                        backgroundSize: 'cover',
                        backgroundPosition: 'center',
                      }}
                    />
                    <div>
                      <div
                        className='text-sm font-bold transition-colors group-hover:text-[#1B998B]'
                        style={{
                          fontFamily: "'Plus Jakarta Sans', sans-serif",
                          color: '#1a1a1a',
                          fontWeight: '700',
                        }}
                      >
                        {article.editor.name}
                      </div>
                      <div
                        className='text-xs'
                        style={{
                          fontFamily: "'Plus Jakarta Sans', sans-serif",
                          color: '#666666',
                        }}
                      >
                        {article.editor.title}
                      </div>
                    </div>
                  </Link>
                </div>
              </div>

              {/* Table des matières - Sticky avec offset pour CategoryNavBar */}
              <div className='sticky' style={{ top: '85px' }}>
                <h3
                  className='text-xs uppercase tracking-wider font-semibold mb-4'
                  style={{
                    fontFamily: "'Plus Jakarta Sans', sans-serif",
                    color: '#666666',
                  }}
                >
                  DANS CET ARTICLE
                </h3>
                <nav className='relative'>
                  {/* Barre de fond grise */}
                  <div
                    className='absolute left-0 top-0 bottom-0 w-0.5'
                    style={{ backgroundColor: '#e5e5e5' }}
                  />

                  {/* Barre verte pour la section active */}
                  <div
                    className='absolute left-0 w-0.5 transition-all duration-300 ease-out'
                    style={{
                      backgroundColor: '#1B998B',
                      top: `${barStyle.top}px`,
                      height: `${barStyle.height}px`,
                    }}
                  />

                  {/* Liste des sections */}
                  <div className='space-y-2 pl-4'>
                    {article.sections.map(section => (
                      <a
                        key={section.id}
                        ref={el => {
                          tocLinksRef.current[section.id] = el;
                        }}
                        href={`#${section.id}`}
                        onClick={e => {
                          e.preventDefault();
                          scrollToSection(section.id);
                        }}
                        className='block transition-colors hover:text-[#1B998B] cursor-pointer'
                        style={{
                          fontFamily: "'Plus Jakarta Sans', sans-serif",
                          color:
                            section.id === activeSection
                              ? '#1B998B'
                              : '#1a1a1a',
                          fontSize: '12px',
                          lineHeight: '1.4',
                          fontWeight:
                            section.id === activeSection ? '600' : '400',
                        }}
                      >
                        {section.title}
                      </a>
                    ))}
                  </div>
                </nav>

                {/* Section Partager - Sticky également */}
                <div className='mt-8'>
                  <h3
                    className='text-xs uppercase tracking-wider font-semibold mb-4'
                    style={{
                      fontFamily: "'Plus Jakarta Sans', sans-serif",
                      color: '#666666',
                    }}
                  >
                    PARTAGER
                  </h3>
                  <div className='flex gap-3'>
                    {/* LinkedIn */}
                    <button
                      className='flex items-center justify-center transition-all hover:opacity-70'
                      aria-label='Partager sur LinkedIn'
                    >
                      <svg
                        width='20'
                        height='20'
                        viewBox='0 0 24 24'
                        fill='#E5DED6'
                      >
                        <path d='M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z' />
                      </svg>
                    </button>

                    {/* Twitter */}
                    <button
                      className='flex items-center justify-center transition-all hover:opacity-70'
                      aria-label='Partager sur Twitter'
                    >
                      <svg
                        width='20'
                        height='20'
                        viewBox='0 0 24 24'
                        fill='#E5DED6'
                      >
                        <path d='M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z' />
                      </svg>
                    </button>

                    {/* Facebook */}
                    <button
                      className='flex items-center justify-center transition-all hover:opacity-70'
                      aria-label='Partager sur Facebook'
                    >
                      <svg
                        width='20'
                        height='20'
                        viewBox='0 0 24 24'
                        fill='#E5DED6'
                      >
                        <path d='M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z' />
                      </svg>
                    </button>

                    {/* Email */}
                    <button
                      className='flex items-center justify-center transition-all hover:opacity-70'
                      aria-label='Partager par email'
                    >
                      <Mail className='w-5 h-5' style={{ color: '#E5DED6' }} />
                    </button>
                  </div>
                </div>
              </div>
            </aside>

            {/* Colonne principale : Article */}
            <article>
              {/* Temps de lecture et date + Titre */}
              <motion.div
                ref={headerRef}
                style={
                  isFirstVisit
                    ? { opacity: 0, transform: 'translateY(30px)' }
                    : {}
                }
                animate={
                  isReady && isHeaderInView
                    ? { opacity: 1, y: 0 }
                    : { opacity: 0, y: 30 }
                }
                transition={
                  isFirstVisit && isReady ? { duration: 0.6 } : { duration: 0 }
                }
              >
                <div
                  className='mb-6 flex items-center gap-4 text-sm'
                  style={{
                    fontFamily: "'Plus Jakarta Sans', sans-serif",
                    color: '#666666',
                  }}
                >
                  <span>{article.readingTime} min</span>
                  <span>·</span>
                  <span>{formatDate(article.publishedAt)}</span>
                </div>

                {/* Titre */}
                <h1
                  className='text-5xl font-bold mb-8'
                  style={{
                    fontFamily: "'Marcellus', serif",
                    color: '#1a1a1a',
                    lineHeight: '1.1',
                  }}
                >
                  {article.title}
                </h1>
              </motion.div>

              {/* Image principale */}
              <motion.div
                ref={imageRef}
                style={
                  isFirstVisit
                    ? { opacity: 0, transform: 'translateY(30px)' }
                    : {}
                }
                animate={
                  isReady && isImageInView
                    ? { opacity: 1, y: 0 }
                    : { opacity: 0, y: 30 }
                }
                transition={
                  isFirstVisit && isReady
                    ? { duration: 0.6, delay: 0.2 }
                    : { duration: 0 }
                }
                className='mb-12 rounded-2xl overflow-hidden'
              >
                <img
                  src={article.image}
                  alt={article.title}
                  className='w-full h-auto'
                  style={{ maxHeight: '500px', objectFit: 'cover' }}
                />
              </motion.div>

              {/* Contenu de l'article */}
              <motion.div
                ref={contentRef}
                style={
                  isFirstVisit
                    ? { opacity: 0, transform: 'translateY(30px)' }
                    : {}
                }
                animate={
                  isReady && isContentInView
                    ? { opacity: 1, y: 0 }
                    : { opacity: 0, y: 30 }
                }
                transition={
                  isFirstVisit && isReady
                    ? { duration: 0.6, delay: 0.4 }
                    : { duration: 0 }
                }
                className='prose max-w-none'
              >
                {article.sections.map(section => (
                  <section key={section.id} id={section.id} className='mb-10'>
                    <h2
                      className='text-3xl font-bold mb-6'
                      style={{
                        fontFamily: "'Marcellus', serif",
                        color: '#1a1a1a',
                        lineHeight: '1.2',
                      }}
                    >
                      {section.title}
                    </h2>
                    {section.content.map((paragraph, idx) => (
                      <p
                        key={idx}
                        className='mb-4 text-lg leading-relaxed'
                        style={{
                          fontFamily: "'Plus Jakarta Sans', sans-serif",
                          color: '#1a1a1a',
                          lineHeight: '1.8',
                        }}
                      >
                        {paragraph}
                      </p>
                    ))}
                  </section>
                ))}
              </motion.div>
            </article>
          </div>

          {/* Section Auteur et Éditeur - Pleine largeur en bas de l'article */}
          <div className='mt-16 pt-8 pb-8 border-t border-b border-[#e5e5e5]'>
            <div className='grid md:grid-cols-[1fr_2fr_auto] gap-8 items-start'>
              {/* Éditeur */}
              <div>
                <div
                  className='text-xs uppercase tracking-wider mb-4'
                  style={{
                    fontFamily: "'Plus Jakarta Sans', sans-serif",
                    color: '#666666',
                    fontWeight: '600',
                    letterSpacing: '0.05em',
                  }}
                >
                  ÉDITÉ PAR
                </div>
                <Link
                  href={
                    `/blog/auteurs/${nameToSlug(article.editor.name)}` as any
                  }
                  className='flex items-start gap-3 group'
                >
                  <div
                    className='w-12 h-12 rounded-full bg-[#1B998B] flex-shrink-0'
                    style={{
                      backgroundImage: 'url(https://i.pravatar.cc/150?img=2)',
                      backgroundSize: 'cover',
                      backgroundPosition: 'center',
                    }}
                  />
                  <div>
                    <div
                      className='text-sm font-bold mb-0.5 transition-colors group-hover:text-[#1B998B]'
                      style={{
                        fontFamily: "'Plus Jakarta Sans', sans-serif",
                        color: '#1a1a1a',
                        fontWeight: '700',
                      }}
                    >
                      {article.editor.name}
                    </div>
                    <div
                      className='text-xs'
                      style={{
                        fontFamily: "'Plus Jakarta Sans', sans-serif",
                        color: '#666666',
                      }}
                    >
                      {article.editor.title}
                    </div>
                  </div>
                </Link>
              </div>

              {/* Rédacteur avec description */}
              <div>
                <div
                  className='text-xs uppercase tracking-wider mb-4'
                  style={{
                    fontFamily: "'Plus Jakarta Sans', sans-serif",
                    color: '#666666',
                    fontWeight: '600',
                    letterSpacing: '0.05em',
                  }}
                >
                  RÉDIGÉ PAR
                </div>
                <Link
                  href={
                    `/blog/auteurs/${nameToSlug(article.author.name)}` as any
                  }
                  className='flex items-start gap-4 group'
                >
                  <div
                    className='w-16 h-16 rounded-full bg-[#1B998B] flex-shrink-0'
                    style={{
                      backgroundImage: 'url(https://i.pravatar.cc/150?img=1)',
                      backgroundSize: 'cover',
                      backgroundPosition: 'center',
                    }}
                  />
                  <div>
                    <div
                      className='text-sm font-bold mb-0.5 transition-colors group-hover:text-[#1B998B]'
                      style={{
                        fontFamily: "'Plus Jakarta Sans', sans-serif",
                        color: '#1a1a1a',
                        fontWeight: '700',
                      }}
                    >
                      {article.author.name}
                    </div>
                    <div
                      className='text-xs mb-2'
                      style={{
                        fontFamily: "'Plus Jakarta Sans', sans-serif",
                        color: '#666666',
                      }}
                    >
                      {article.author.title}
                    </div>
                    <p
                      className='text-sm leading-relaxed'
                      style={{
                        fontFamily: "'Plus Jakarta Sans', sans-serif",
                        color: '#666666',
                        lineHeight: '1.6',
                      }}
                    >
                      Lucie est nutritionniste diplômée (ASCA/RME) passionnée
                      par l'alimentation santé. Elle partage ses connaissances
                      et conseils pratiques pour vous aider à adopter une
                      alimentation équilibrée et durable au quotidien.
                    </p>
                  </div>
                </Link>
              </div>

              {/* Icônes de partage */}
              <div className='flex gap-3'>
                {/* LinkedIn */}
                <button
                  className='flex items-center justify-center transition-all hover:opacity-70'
                  aria-label='Partager sur LinkedIn'
                >
                  <svg
                    width='20'
                    height='20'
                    viewBox='0 0 24 24'
                    fill='#E5DED6'
                  >
                    <path d='M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z' />
                  </svg>
                </button>

                {/* Twitter */}
                <button
                  className='flex items-center justify-center transition-all hover:opacity-70'
                  aria-label='Partager sur Twitter'
                >
                  <svg
                    width='20'
                    height='20'
                    viewBox='0 0 24 24'
                    fill='#E5DED6'
                  >
                    <path d='M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z' />
                  </svg>
                </button>

                {/* Email */}
                <button
                  className='flex items-center justify-center transition-all hover:opacity-70'
                  aria-label='Partager par email'
                >
                  <Mail className='w-5 h-5' style={{ color: '#E5DED6' }} />
                </button>
              </div>
            </div>
          </div>

          {/* Section Articles Similaires */}
          {article.relatedArticles && article.relatedArticles.length > 0 && (
            <div className='mt-24'>
              {/* Titre de la section */}
              <h2
                className='text-3xl font-bold mb-12'
                style={{
                  fontFamily: "'Marcellus', serif",
                  color: '#1a1a1a',
                }}
              >
                Ces articles pourraient vous intéresser
              </h2>

              {/* Grille d'articles - 2 lignes de 3 articles */}
              <div className='grid md:grid-cols-2 lg:grid-cols-3 gap-8'>
                {article.relatedArticles.slice(0, 6).map(relatedArticle => (
                  <RelatedArticleCard
                    key={relatedArticle.slug}
                    relatedArticle={relatedArticle}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Footer */}
      <MarketingFooter />
    </div>
  );
}
