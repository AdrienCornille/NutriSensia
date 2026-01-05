'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Link } from '@/i18n/navigation';
import { motion } from 'framer-motion';
import { useFirstVisit } from '@/hooks/useFirstVisit';

// Catégories disponibles
const categories = [
  { id: 'all', label: 'Tous les articles' },
  { id: 'nutrition', label: 'Nutrition' },
  { id: 'sante', label: 'Santé' },
  { id: 'bien-etre', label: 'Bien-être' },
  { id: 'recettes', label: 'Recettes' },
  { id: 'conseils', label: 'Conseils pratiques' },
];

/**
 * Barre de navigation des catégories - Style NutriSensia Méditerranée
 *
 * Design moderne avec :
 * - Pills arrondies pour les catégories actives
 * - Glassmorphism au scroll avec border subtile turquoise
 * - Typographie Plus Jakarta Sans
 * - Transitions fluides Framer Motion
 * - Hover states élégants
 * - Animations d'entrée uniquement à la première visite de session
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
  const [hoveredCategory, setHoveredCategory] = useState<string | null>(null);
  const { isFirstVisit } = useFirstVisit();

  // Seuil de scroll pour activer le mode sticky
  const SCROLL_THRESHOLD = 150;

  const handleScroll = useCallback(() => {
    const currentScrollY = window.scrollY;

    // Activer le fond quand on scroll
    setIsScrolled(currentScrollY > 50);

    // Passer en mode sticky (top: 0) quand on scroll assez
    setIsSticky(currentScrollY > SCROLL_THRESHOLD);
  }, []);

  useEffect(() => {
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [handleScroll]);

  // Mapping des catégories vers leurs URLs
  const getCategoryUrl = (categoryId: string) => {
    if (categoryId === 'all') return '/blog';
    return `/blog/${categoryId}`;
  };

  // Style initial : cacher seulement si première visite
  const getHiddenStyle = (offset: number) => {
    if (!isFirstVisit) {
      // Pas première visite : éléments toujours visibles (pas de clignotement)
      return {};
    }
    // Première visite : cacher l'élément pour l'animation d'entrée
    return {
      opacity: 0,
      transform: `translateY(${offset}px)`,
    };
  };

  // Transition avec stagger pour les catégories
  const getCategoryTransition = (index: number) => {
    if (isFirstVisit) {
      return {
        delay: 0.3 + index * 0.05,
        duration: 0.3,
        ease: [0.25, 0.46, 0.45, 0.94] as const,
      };
    }
    return { duration: 0 };
  };

  // Transition pour la nav principale
  const getNavTransition = () => {
    if (isFirstVisit) {
      return { duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] as const };
    }
    return { duration: 0.4, ease: [0.4, 0, 0.2, 1] as const };
  };

  return (
    <motion.nav
      style={{
        position: 'sticky',
        top: isSticky ? '0px' : topOffset,
        zIndex: 1001,
        transition: 'top 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
        borderBottom: isScrolled
          ? '1px solid rgba(27, 153, 139, 0.12)'
          : '1px solid transparent',
        WebkitBackdropFilter: isScrolled ? 'blur(16px) saturate(180%)' : 'none',
        ...getHiddenStyle(-20),
      }}
      animate={{
        opacity: 1,
        y: 0,
        backgroundColor: isScrolled
          ? 'rgba(255, 255, 255, 0.92)'
          : 'transparent',
        backdropFilter: isScrolled ? 'blur(16px) saturate(180%)' : 'none',
        boxShadow: isScrolled
          ? '0 1px 0 rgba(27, 153, 139, 0.08), 0 8px 32px rgba(27, 153, 139, 0.06)'
          : 'none',
      }}
      transition={getNavTransition()}
    >
      <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
        <div
          className='flex items-center justify-center overflow-x-auto scrollbar-hide'
          style={{
            gap: '8px',
            padding: '16px 0',
          }}
        >
          {categories.map((category, index) => {
            const isActive = activeCategory === category.id;
            const isHovered = hoveredCategory === category.id;

            return (
              <motion.div
                key={category.id}
                style={getHiddenStyle(-10)}
                animate={{ opacity: 1, y: 0 }}
                transition={getCategoryTransition(index)}
              >
                <Link
                  href={getCategoryUrl(category.id) as any}
                  className='relative whitespace-nowrap'
                  style={{
                    textDecoration: 'none',
                  }}
                  onMouseEnter={() => setHoveredCategory(category.id)}
                  onMouseLeave={() => setHoveredCategory(null)}
                >
                  <motion.div
                    style={{
                      position: 'relative',
                      padding: '10px 20px',
                      borderRadius: '35px',
                      fontFamily:
                        "'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
                      fontSize: '14px',
                      fontWeight: isActive ? 600 : 500,
                      letterSpacing: '0.01em',
                      cursor: 'pointer',
                      transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                      backgroundColor: isActive
                        ? 'rgba(27, 153, 139, 0.1)'
                        : isHovered
                          ? 'rgba(27, 153, 139, 0.05)'
                          : 'transparent',
                      color: isActive
                        ? '#1B998B'
                        : isHovered
                          ? '#1B998B'
                          : '#41556b',
                      border: isActive
                        ? '1px solid rgba(27, 153, 139, 0.25)'
                        : '1px solid transparent',
                    }}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    {category.label}
                  </motion.div>
                </Link>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Hide scrollbar CSS */}
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
