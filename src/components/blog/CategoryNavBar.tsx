'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Link } from '@/i18n/navigation';
import { motion } from 'framer-motion';
import { useFirstVisit } from '@/hooks/useFirstVisit';

const categories = [
  { id: 'all', label: 'Tous les articles' },
  { id: 'nutrition', label: 'Nutrition' },
  { id: 'sante', label: 'Santé' },
  { id: 'bien-etre', label: 'Bien-être' },
  { id: 'recettes', label: 'Recettes' },
  { id: 'conseils', label: 'Conseils pratiques' },
];

/**
 * Barre de navigation des catégories — DS v2 Editorial
 *
 * Pills hard-bordées ink, état actif peps avec shadow-hard-sm.
 * Sticky avec backdrop cream-50 au scroll.
 */
export function CategoryNavBar({
  activeCategory,
  topOffset = '80px',
}: {
  activeCategory: string;
  topOffset?: string;
}) {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isSticky, setIsSticky] = useState(false);
  const { isFirstVisit } = useFirstVisit();

  const SCROLL_THRESHOLD = 150;

  const handleScroll = useCallback(() => {
    const currentScrollY = window.scrollY;
    setIsScrolled(currentScrollY > 50);
    setIsSticky(currentScrollY > SCROLL_THRESHOLD);
  }, []);

  useEffect(() => {
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [handleScroll]);

  const getCategoryUrl = (categoryId: string) => {
    if (categoryId === 'all') return '/blog';
    return `/blog/${categoryId}`;
  };

  const getHidden = (offset: number) =>
    !isFirstVisit ? {} : { opacity: 0, transform: `translateY(${offset}px)` };

  const getCategoryTransition = (index: number) =>
    isFirstVisit
      ? {
          delay: 0.3 + index * 0.05,
          duration: 0.3,
          ease: [0.25, 0.46, 0.45, 0.94] as const,
        }
      : { duration: 0 };

  const getNavTransition = () =>
    isFirstVisit
      ? { duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] as const }
      : { duration: 0.4, ease: [0.4, 0, 0.2, 1] as const };

  return (
    <motion.nav
      style={{
        position: 'sticky',
        top: isSticky ? '0px' : topOffset,
        zIndex: 1001,
        transition: 'top 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
        borderBottom: isScrolled
          ? '1.5px solid var(--ns-ink)'
          : '1.5px solid transparent',
        WebkitBackdropFilter: isScrolled ? 'blur(12px) saturate(180%)' : 'none',
        ...getHidden(-20),
      }}
      animate={{
        opacity: 1,
        y: 0,
        backgroundColor: isScrolled
          ? 'rgba(255, 255, 255, 0.94)'
          : 'transparent',
        backdropFilter: isScrolled ? 'blur(12px) saturate(180%)' : 'none',
      }}
      transition={getNavTransition()}
    >
      <div className='ns2-container'>
        <div
          className='scrollbar-hide'
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 10,
            padding: '14px 0',
            overflowX: 'auto',
          }}
        >
          {categories.map((category, index) => {
            const isActive = activeCategory === category.id;

            return (
              <motion.div
                key={category.id}
                style={getHidden(-10)}
                animate={{ opacity: 1, y: 0 }}
                transition={getCategoryTransition(index)}
              >
                <Link
                  href={getCategoryUrl(category.id) as never}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    padding: '8px 18px',
                    borderRadius: 'var(--ns-r-pill)',
                    fontFamily: 'var(--ns-font-sans-stack)',
                    fontSize: 13,
                    fontWeight: 600,
                    letterSpacing: '0.01em',
                    background: isActive ? 'var(--ns-peps)' : 'transparent',
                    color: 'var(--ns-ink)',
                    border: '1.5px solid var(--ns-ink)',
                    boxShadow: isActive ? 'var(--ns-shadow-hard-sm)' : 'none',
                    whiteSpace: 'nowrap',
                    textDecoration: 'none',
                    transition:
                      'transform 150ms var(--ns-ease), box-shadow 150ms var(--ns-ease)',
                  }}
                  onMouseEnter={e => {
                    if (!isActive) {
                      e.currentTarget.style.background = 'var(--ns-cream-100)';
                    }
                    e.currentTarget.style.transform = 'translate(-1px, -1px)';
                    e.currentTarget.style.boxShadow =
                      'var(--ns-shadow-hard-sm)';
                  }}
                  onMouseLeave={e => {
                    if (!isActive) {
                      e.currentTarget.style.background = 'transparent';
                      e.currentTarget.style.boxShadow = 'none';
                    } else {
                      e.currentTarget.style.boxShadow =
                        'var(--ns-shadow-hard-sm)';
                    }
                    e.currentTarget.style.transform = 'translate(0, 0)';
                  }}
                >
                  {category.label}
                </Link>
              </motion.div>
            );
          })}
        </div>
      </div>

      <style jsx global>{`
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </motion.nav>
  );
}
