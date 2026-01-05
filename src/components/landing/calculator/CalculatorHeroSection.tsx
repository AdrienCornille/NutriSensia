'use client';

import React, { useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import { useTranslations } from 'next-intl';
import { useFirstVisit } from '@/hooks/useFirstVisit';
import { Calculator } from 'lucide-react';
import Image from 'next/image';

/**
 * Section Hero du calculateur de calories
 * Design Méditerranée avec fond crème #FBF9F7
 * Layout split: texte à gauche, image à droite
 */
export function CalculatorHeroSection() {
  const t = useTranslations('CalorieCalculator');
  const { isFirstVisit } = useFirstVisit();

  const sectionRef = useRef(null);
  const isInView = useInView(sectionRef, { once: true, margin: '-50px' });

  const shouldAnimate = isFirstVisit && isInView;
  const showContent = !isFirstVisit || isInView;

  const getHiddenStyle = (yOffset: number) => {
    if (!isFirstVisit) return {};
    return {
      opacity: 0,
      transform: `translateY(${yOffset}px)`,
    };
  };

  const getTransition = (delay: number) => {
    if (shouldAnimate) {
      return { duration: 0.6, delay, ease: 'easeOut' as const };
    }
    return { duration: 0 };
  };

  return (
    <section
      ref={sectionRef}
      style={{
        backgroundColor: '#FBF9F7',
        paddingTop: '140px',
        paddingBottom: '80px',
      }}
    >
      <div
        style={{
          maxWidth: '1280px',
          margin: '0 auto',
          padding: '0 48px',
        }}
      >
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '64px',
            alignItems: 'center',
          }}
          className='hero-grid'
        >
          {/* Colonne gauche - Contenu textuel */}
          <div>
            {/* Badge */}
            <motion.div
              style={getHiddenStyle(20)}
              animate={
                showContent ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }
              }
              transition={getTransition(0)}
            >
              <span
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px',
                  backgroundColor: 'rgba(27, 153, 139, 0.08)',
                  color: '#1B998B',
                  padding: '8px 20px',
                  borderRadius: '35px',
                  fontSize: '14px',
                  fontWeight: 600,
                  fontFamily: "'Plus Jakarta Sans', sans-serif",
                  marginBottom: '24px',
                }}
              >
                <Calculator size={16} />
                {t('hero.badge')}
              </span>
            </motion.div>

            {/* Titre principal */}
            <motion.h1
              style={{
                ...getHiddenStyle(30),
                fontFamily: "'Marcellus', serif",
                fontSize: '48px',
                fontWeight: 700,
                lineHeight: 1.2,
                color: '#1B998B',
                marginBottom: '20px',
              }}
              animate={
                showContent ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }
              }
              transition={getTransition(0.1)}
            >
              {t('hero.title')}
            </motion.h1>

            {/* Sous-titre */}
            <motion.p
              style={{
                ...getHiddenStyle(30),
                fontFamily: "'Plus Jakarta Sans', sans-serif",
                fontSize: '22px',
                fontWeight: 500,
                lineHeight: 1.4,
                color: '#147569',
                marginBottom: '24px',
              }}
              animate={
                showContent ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }
              }
              transition={getTransition(0.2)}
            >
              {t('hero.subtitle')}
            </motion.p>

            {/* Description */}
            <motion.p
              style={{
                ...getHiddenStyle(30),
                fontFamily: "'Plus Jakarta Sans', sans-serif",
                fontSize: '16px',
                lineHeight: 1.7,
                color: '#41556b',
              }}
              animate={
                showContent ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }
              }
              transition={getTransition(0.3)}
            >
              {t('hero.description')}
            </motion.p>
          </div>

          {/* Colonne droite - Image */}
          <motion.div
            style={getHiddenStyle(40)}
            animate={showContent ? { opacity: 1, y: 0 } : { opacity: 0, y: 40 }}
            transition={getTransition(0.2)}
          >
            <div
              style={{
                borderRadius: '20px',
                overflow: 'hidden',
                boxShadow: '12px 12px 0 #E5DED6',
                position: 'relative',
                aspectRatio: '4/3',
              }}
            >
              <Image
                src='/images/hero-healthy-plate.jpg'
                alt='Assiette équilibrée représentant une alimentation saine'
                fill
                style={{
                  objectFit: 'cover',
                }}
                priority
              />
            </div>
          </motion.div>
        </div>
      </div>

      {/* Responsive styles */}
      <style jsx>{`
        @media (max-width: 1024px) {
          .hero-grid {
            grid-template-columns: 1fr !important;
            gap: 48px !important;
          }
        }
        @media (max-width: 768px) {
          h1 {
            font-size: 32px !important;
          }
          p {
            font-size: 16px !important;
          }
        }
      `}</style>
    </section>
  );
}

export default CalculatorHeroSection;
