'use client';

import React, { useRef } from 'react';
import { cn } from '@/lib/utils';
import { motion, useInView } from 'framer-motion';

/**
 * Section "Ce qui va vraiment changer pour vous"
 *
 * Design inspiré de Culina Health "Nutrition counseling centered around you"
 * - Layout split-screen : Image à gauche, contenu texte à droite
 * - Titre en Marcellus (serif) aligné à gauche
 * - Liste à puces avec éléments en gras pour les points clés
 * - Bouton CTA en bas
 * - Box-shadow signature NutriSensia (8px 8px 0 #d7e1ce)
 * - Animations au scroll
 */
export function WhyNutriSensiaSection() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-100px' });

  // Points de différenciation adaptés au format liste
  const bulletPoints = [
    {
      text: "Prend le temps d'écouter votre histoire",
      isBold: true,
    },
    {
      text: 'Adapte votre plan nutritionnel selon vos besoins réels',
      isBold: false,
    },
    {
      text: 'Offre un accompagnement bienveillant, sans jugement',
      isBold: false,
    },
    {
      text: 'Propose des ajustements progressifs pour des résultats durables',
      isBold: true,
    },
    {
      text: "S'appuie sur la science et les dernières recherches en nutrition",
      isBold: false,
    },
    {
      text: 'Coordonne avec vos médecins et spécialistes de santé',
      isBold: true,
    },
    {
      text: 'Vous autonomise pour prendre vos propres décisions alimentaires',
      isBold: false,
    },
  ];

  return (
    <section
      id='ce-qui-change'
      ref={ref}
      className={cn('relative', 'bg-white', 'py-[96px]')}
      style={{ padding: 'var(--spacing-3xl, 96px) 0' }}
    >
      {/* Container principal */}
      <div className='container mx-auto max-w-[1200px] px-6'>
        {/* Layout Grid 2 colonnes */}
        <div
          className={cn(
            'grid',
            'grid-cols-1 lg:grid-cols-2',
            'gap-[96px]',
            'items-center'
          )}
        >
          {/* ============================================ */}
          {/* LEFT COLUMN - Image                          */}
          {/* ============================================ */}
          <motion.div
            initial={{ opacity: 0, x: -40 }}
            animate={isInView ? { opacity: 1, x: 0 } : { opacity: 0, x: -40 }}
            transition={{ duration: 0.7, ease: 'easeOut' }}
            className='relative'
          >
            <div
              className={cn(
                'relative',
                'rounded-[20px]',
                'overflow-hidden',
                'min-h-[400px]',
                'bg-[#E8F3EF]'
              )}
              style={{
                backgroundColor: '#E8F3EF',
                borderRadius: '20px',
              }}
            >
              <img
                src='/images/nutritionist-consultation.jpg'
                alt='Consultation nutritionniste personnalisée'
                onError={e => {
                  // Fallback vers placeholder si l'image n'existe pas
                  e.currentTarget.src =
                    'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?q=80&w=800&auto=format&fit=crop';
                }}
                className='w-full h-full object-cover min-h-[400px]'
              />
            </div>
          </motion.div>

          {/* ============================================ */}
          {/* RIGHT COLUMN - Content                       */}
          {/* ============================================ */}
          <motion.div
            initial={{ opacity: 0, x: 40 }}
            animate={isInView ? { opacity: 1, x: 0 } : { opacity: 0, x: 40 }}
            transition={{ duration: 0.7, delay: 0.2, ease: 'easeOut' }}
            className='nutrition-care-content'
          >
            {/* H2 Title - Marcellus serif */}
            <h2
              className={cn(
                "font-['Marcellus',serif]",
                'text-[36px] lg:text-[48px]',
                'leading-[1.2]',
                'text-[#3f6655]',
                'font-normal',
                'text-left',
                'mb-6'
              )}
              style={{
                fontFamily: "'Marcellus', serif",
                color: '#3f6655',
                fontSize: '48px',
                lineHeight: '57.6px',
                textAlign: 'left',
                marginBottom: 'var(--spacing-md, 24px)',
                fontWeight: 700,
              }}
            >
              Ce qui va vraiment changer pour vous
            </h2>

            {/* Subtitle */}
            <p
              className={cn(
                "font-['Plus_Jakarta_Sans',sans-serif]",
                'text-base',
                'text-[#2D3748]',
                'text-left',
                'mb-6'
              )}
              style={{
                fontFamily:
                  "'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
                color: '#2D3748',
                textAlign: 'left',
                marginBottom: 'var(--spacing-md, 24px)',
                fontWeight: 400,
              }}
            >
              Votre nutritionniste certifiée ASCA/RME :
            </p>

            {/* Bullet List */}
            <ul
              className='mb-8 space-y-2'
              style={{
                listStyle: 'disc',
                marginBottom: 'var(--spacing-lg, 32px)',
              }}
            >
              {bulletPoints.map((point, index) => (
                <motion.li
                  key={index}
                  initial={{ opacity: 0, x: 20 }}
                  animate={
                    isInView ? { opacity: 1, x: 0 } : { opacity: 0, x: 20 }
                  }
                  transition={{
                    duration: 0.5,
                    delay: 0.4 + index * 0.1,
                    ease: 'easeOut',
                  }}
                  className={cn(
                    "font-['Plus_Jakarta_Sans',sans-serif]",
                    'text-[#41556b]',
                    'leading-[20.8px]',
                    'ml-4',
                    'pl-[1.6px]',
                    'text-left'
                  )}
                  style={{
                    fontFamily:
                      "'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
                    color: '#41556b',
                    lineHeight: '20.8px',
                    margin: '0 0 0 16px',
                    padding: '0 0 0 1.6px',
                    textAlign: 'left',
                  }}
                >
                  {point.isBold ? (
                    <strong style={{ color: '#2D3748' }}>{point.text}</strong>
                  ) : (
                    point.text
                  )}
                </motion.li>
              ))}
            </ul>

            {/* CTA Button */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
              transition={{ duration: 0.5, delay: 1.1, ease: 'easeOut' }}
            >
              <a
                href='#contact'
                className={cn(
                  'inline-block',
                  'bg-[#3f6655]',
                  'text-white',
                  'rounded-[35px]',
                  'px-8 py-[14px]',
                  'text-sm',
                  'font-bold',
                  'text-center',
                  'transition-all duration-300 ease-in-out',
                  'hover:bg-[#2d5042]'
                )}
                style={{
                  backgroundColor: '#3f6655',
                  borderRadius: '35px',
                  lineHeight: '16px',
                  color: '#fff',
                  display: 'inline-block',
                  fontFamily:
                    "'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
                  fontSize: '14px',
                  fontWeight: 700,
                  textAlign: 'center',
                  padding: '14px 32px',
                  border: 'none',
                  cursor: 'pointer',
                  textDecoration: 'none',
                  transition: 'all 0.3s ease',
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.backgroundColor = '#2d5042';
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.backgroundColor = '#3f6655';
                }}
              >
                Réserver ma consultation gratuite →
              </a>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
