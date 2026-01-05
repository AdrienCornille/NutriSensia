'use client';

import { useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import Image from 'next/image';
import { useFirstVisit } from '@/hooks/useFirstVisit';

/**
 * Section Hero pour la page À propos
 *
 * Design conforme au style guide NutriSensia :
 * - Texte à gauche avec titre et sous-titre
 * - Deux images à droite en composition décalée
 * - Background #f8f7ef du style guide
 * - Typography Marcellus pour les titres
 */
export function AboutHeroSection() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, amount: 0.2 });
  const { isFirstVisit } = useFirstVisit();

  // Animation conditionnelle basée sur première visite
  const shouldAnimate = isFirstVisit && isInView;
  const showContent = !isFirstVisit || isInView;

  // Variants conditionnels selon première visite
  const fadeSlideUp = {
    hidden: isFirstVisit ? { opacity: 0, y: 30 } : { opacity: 1, y: 0 },
    visible: { opacity: 1, y: 0 },
  };

  const fadeSlideRight = {
    hidden: isFirstVisit ? { opacity: 0, x: 50 } : { opacity: 1, x: 0 },
    visible: { opacity: 1, x: 0 },
  };

  const fadeSlideLeft = {
    hidden: isFirstVisit ? { opacity: 0, x: -30 } : { opacity: 1, x: 0 },
    visible: { opacity: 1, x: 0 },
  };

  // Transition conditionnelle
  const getTransition = (delay: number) => {
    if (shouldAnimate) {
      return { duration: 0.6, delay, ease: 'easeOut' as const };
    }
    return { duration: 0 };
  };

  return (
    <section
      ref={ref}
      style={{
        backgroundColor: '#FBF9F7' /* Warm Cream - Méditerranée */,
        padding: '130px 0 120px',
        minHeight: '600px',
      }}
      className='w-full'
    >
      <div className='container mx-auto max-w-[1200px] px-8'>
        <div className='flex flex-col lg:flex-row gap-6 lg:gap-12 items-center justify-center'>
          {/* LEFT SIDE - Contenu textuel */}
          <motion.div
            variants={fadeSlideLeft}
            initial='hidden'
            animate={showContent ? 'visible' : 'hidden'}
            transition={getTransition(0)}
            className='max-w-[520px] flex-shrink-0'
          >
            {/* Titre principal */}
            <h1
              style={{
                fontFamily: "'Marcellus', serif",
                fontSize: '48px',
                lineHeight: '57.6px',
                fontWeight: 700,
                color: '#1B998B' /* Turquoise Azur */,
                marginBottom: '24px',
                whiteSpace: 'nowrap',
              }}
              className='max-md:!text-[36px] max-md:!leading-[1.3] max-md:!whitespace-normal'
            >
              À propos de NutriSensia
            </h1>

            {/* Sous-titre */}
            <h2
              style={{
                fontFamily: "'Plus Jakarta Sans', sans-serif",
                fontSize: '26px',
                lineHeight: '1.5',
                color: '#1a1a1a' /* Noir */,
                fontWeight: 500,
                marginBottom: '0',
              }}
              className='max-md:!text-[20px]'
            >
              Rendre l'expertise nutritionnelle accessible à tous, avec
              bienveillance et science.
            </h2>
          </motion.div>

          {/* RIGHT SIDE - Images en composition décalée */}
          <div
            className='relative flex-shrink-0'
            style={{ width: '420px', height: '380px' }}
          >
            {/* Image principale (grande) - en haut à gauche */}
            <motion.div
              variants={fadeSlideRight}
              initial='hidden'
              animate={showContent ? 'visible' : 'hidden'}
              transition={getTransition(0.2)}
              className='absolute top-0 left-0 z-10'
            >
              <div
                style={{
                  borderRadius: '10px',
                  overflow: 'hidden',
                  border: '1px solid #e5e5e5',
                  boxShadow: '8px 8px 0 #E5DED6' /* Beige Sand */,
                  width: '280px',
                  height: '220px',
                }}
                className='relative max-md:w-[200px] max-md:h-[160px]'
              >
                <Image
                  src='/images/nutritionist-consultation.jpg'
                  alt='Consultation nutritionnelle personnalisée'
                  fill
                  className='object-cover object-center'
                  priority
                  sizes='(max-width: 768px) 200px, 280px'
                />
              </div>
            </motion.div>

            {/* Image secondaire - en bas à droite, chevauchant */}
            <motion.div
              variants={fadeSlideUp}
              initial='hidden'
              animate={showContent ? 'visible' : 'hidden'}
              transition={getTransition(0.4)}
              className='absolute bottom-0 right-0 z-20'
            >
              <div
                style={{
                  borderRadius: '10px',
                  overflow: 'hidden',
                  border: '1px solid #e5e5e5',
                  boxShadow: '8px 8px 0 #E5DED6' /* Beige Sand */,
                  width: '240px',
                  height: '200px',
                }}
                className='relative max-md:w-[180px] max-md:h-[150px]'
              >
                <Image
                  src='/images/hero-healthy-plate.jpg'
                  alt='Plat sain et équilibré'
                  fill
                  className='object-cover object-center'
                  sizes='(max-width: 768px) 180px, 240px'
                />
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
}
