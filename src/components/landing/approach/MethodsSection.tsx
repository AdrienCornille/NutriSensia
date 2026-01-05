'use client';

import React, { useState, useRef } from 'react';
import { motion, useInView, AnimatePresence } from 'framer-motion';
import { useTranslations } from 'next-intl';
import { useFirstVisit } from '@/hooks/useFirstVisit';

/**
 * Section "Mes Méthodes" - Page L'Approche
 *
 * Design System NutriSensia (nouveau) :
 * - Police titres : Marcellus (serif)
 * - Police body : Plus Jakarta Sans (sans-serif)
 * - Couleur principale : #3f6655
 * - Couleur texte : #41556b
 * - Background : #ffffff
 * - Bordures : #b6ccae, #3f6655
 * - Accordéon avec animation fluide
 */

interface MethodItem {
  id: number;
  titleKey: string;
  descriptionKey: string;
  image: string;
}

export function MethodsSection() {
  const t = useTranslations('MethodsSection');
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-100px' });
  const { isFirstVisit } = useFirstVisit();

  // Animation conditionnelle basée sur première visite
  const shouldAnimate = isFirstVisit && isInView;
  const showContent = !isFirstVisit || isInView;

  // Style initial : cacher seulement si première visite
  const getHiddenStyle = (yOffset: number) => {
    if (!isFirstVisit) {
      return {};
    }
    return {
      opacity: 0,
      transform: `translateY(${yOffset}px)`,
    };
  };

  // Transition : animation seulement si première visite et en vue
  const getTransition = (delay: number) => {
    if (shouldAnimate) {
      return { duration: 0.6, delay, ease: 'easeOut' as const };
    }
    return { duration: 0 };
  };

  const methods: MethodItem[] = [
    {
      id: 1,
      titleKey: 'methods.micronutrition.title',
      descriptionKey: 'methods.micronutrition.description',
      image:
        'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=800&h=600&fit=crop&q=80',
    },
    {
      id: 2,
      titleKey: 'methods.functionalNutrition.title',
      descriptionKey: 'methods.functionalNutrition.description',
      image:
        'https://images.unsplash.com/photo-1505576399279-565b52d4ac71?w=800&h=600&fit=crop&q=80',
    },
    {
      id: 3,
      titleKey: 'methods.inflammation.title',
      descriptionKey: 'methods.inflammation.description',
      image:
        'https://images.unsplash.com/photo-1490645935967-10de6ba17061?w=800&h=600&fit=crop&q=80',
    },
    {
      id: 4,
      titleKey: 'methods.hormonalBalance.title',
      descriptionKey: 'methods.hormonalBalance.description',
      image:
        'https://images.unsplash.com/photo-1498837167922-ddd27525d352?w=800&h=600&fit=crop&q=80',
    },
  ];

  const [openId, setOpenId] = useState<number | null>(null);
  const [activeImage, setActiveImage] = useState(methods[0].image);

  const handleToggle = (id: number) => {
    if (openId === id) {
      setOpenId(null);
    } else {
      setOpenId(id);
      const method = methods.find(m => m.id === id);
      if (method) {
        setActiveImage(method.image);
      }
    }
  };

  return (
    <section
      ref={ref}
      id='methods'
      style={{
        backgroundColor: '#1B998B' /* Turquoise Méditerranée */,
        padding: '96px 0',
        width: '100%',
      }}
    >
      <div
        style={{
          maxWidth: '1200px',
          margin: '0 auto',
          padding: '0 24px',
        }}
      >
        {/* Header de section */}
        <motion.div
          style={{
            textAlign: 'center',
            marginBottom: '64px',
            ...getHiddenStyle(20),
          }}
          animate={showContent ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
          transition={getTransition(0)}
        >
          {/* Titre principal */}
          <h2
            style={{
              fontFamily: "'Marcellus', serif",
              fontSize: '48px',
              fontWeight: 700,
              lineHeight: '57.6px',
              color: '#ffffff' /* Blanc sur fond turquoise */,
              marginBottom: '24px',
            }}
          >
            {t('title')}
          </h2>

          {/* Sous-titre */}
          <p
            style={{
              fontFamily:
                "'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
              fontSize: '18px',
              lineHeight: '28px',
              color:
                'rgba(255, 255, 255, 0.9)' /* Blanc légèrement transparent */,
              maxWidth: '800px',
              margin: '0 auto',
            }}
          >
            {t('intro')}
          </p>
        </motion.div>

        {/* Layout Accordéon + Image */}
        <div
          className='methods-layout'
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '60px',
            alignItems: 'center',
          }}
        >
          {/* Colonne gauche - Accordéon */}
          <div>
            {methods.map((method, index) => (
              <motion.div
                key={method.id}
                style={{
                  borderBottom:
                    '1px solid rgba(255, 255, 255, 0.2)' /* Bordure blanche transparente */,
                  ...getHiddenStyle(20),
                }}
                animate={
                  showContent ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }
                }
                transition={getTransition(0.1 + index * 0.1)}
              >
                {/* Trigger de l'accordéon */}
                <button
                  onClick={() => handleToggle(method.id)}
                  style={{
                    width: '100%',
                    padding: '24px 0',
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    textAlign: 'left',
                  }}
                >
                  <h3
                    style={{
                      fontFamily: "'Marcellus', serif",
                      fontSize: '24px',
                      fontWeight: 700,
                      lineHeight: '1.3',
                      color: '#ffffff' /* Blanc */,
                      transition: 'color 0.3s ease',
                    }}
                  >
                    {t(method.titleKey)}
                  </h3>
                  <span
                    style={{
                      fontFamily:
                        "'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
                      fontSize: '24px',
                      color: '#ffffff' /* Blanc */,
                      transition: 'transform 0.3s ease',
                      transform:
                        openId === method.id
                          ? 'rotate(180deg)'
                          : 'rotate(0deg)',
                    }}
                  >
                    ∨
                  </span>
                </button>

                {/* Contenu de l'accordéon */}
                <AnimatePresence>
                  {openId === method.id && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3, ease: 'easeInOut' }}
                      style={{ overflow: 'hidden' }}
                    >
                      <p
                        style={{
                          fontFamily:
                            "'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
                          fontSize: '16px',
                          lineHeight: '26px',
                          color:
                            'rgba(255, 255, 255, 0.9)' /* Blanc légèrement transparent */,
                          paddingBottom: '24px',
                        }}
                      >
                        {t(method.descriptionKey)}
                      </p>

                      {/* Image mobile */}
                      <div
                        className='mobile-image'
                        style={{
                          display: 'none',
                          marginBottom: '24px',
                        }}
                      >
                        <img
                          src={method.image}
                          alt={t(method.titleKey)}
                          style={{
                            width: '100%',
                            height: '250px',
                            objectFit: 'cover',
                            borderRadius: '10px',
                            border: '1px solid #e5e5e5',
                            boxShadow: '8px 8px 0 #E5DED6' /* Beige sand */,
                          }}
                        />
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            ))}
          </div>

          {/* Colonne droite - Image (Desktop) */}
          <div
            className='desktop-image'
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <motion.div
              style={{
                borderRadius: '10px',
                overflow: 'hidden',
                border: '1px solid #e5e5e5',
                boxShadow: '8px 8px 0 #E5DED6' /* Beige sand */,
              }}
            >
              <AnimatePresence mode='wait'>
                <motion.img
                  key={activeImage}
                  src={activeImage}
                  alt='Méthode'
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.3 }}
                  style={{
                    width: '100%',
                    height: '500px',
                    objectFit: 'cover',
                  }}
                />
              </AnimatePresence>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Responsive Styles */}
      <style jsx>{`
        @media (max-width: 1024px) {
          .methods-layout {
            grid-template-columns: 1fr !important;
            gap: 32px !important;
          }

          .desktop-image {
            display: none !important;
          }

          .mobile-image {
            display: block !important;
          }
        }
      `}</style>
    </section>
  );
}

export default MethodsSection;
