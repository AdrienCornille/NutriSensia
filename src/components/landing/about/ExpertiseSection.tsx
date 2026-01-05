'use client';

import { useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import Image from 'next/image';
import { cn } from '@/lib/utils';
import { useFirstVisit } from '@/hooks/useFirstVisit';

/**
 * Section Expertise - Une expertise au service de votre bien-être
 *
 * Layout: Texte à gauche, photo à droite (Option 3)
 * - Titre de section
 * - Photo professionnelle de Lucie à droite
 * - Informations et paragraphes à gauche
 */
export function ExpertiseSection() {
  const ref = useRef(null);
  const isInView = useInView(ref, {
    once: true,
    amount: 0.2,
    margin: '-100px',
  });
  const { isFirstVisit } = useFirstVisit();

  // Animation conditionnelle basée sur première visite
  const shouldAnimate = isFirstVisit && isInView;
  const showContent = !isFirstVisit || isInView;

  // Helpers pour les animations conditionnelles
  const getHiddenStyle = (yOffset: number, xOffset: number = 0) => {
    if (!isFirstVisit) return {};
    return {
      opacity: 0,
      transform: `translateY(${yOffset}px) translateX(${xOffset}px)`,
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
      ref={ref}
      className={cn(
        'relative w-full',
        'py-[100px] px-10',
        'max-md:py-[60px] max-md:px-6'
      )}
      style={{ backgroundColor: '#FBF9F7' }} /* Warm Cream - Méditerranée */
    >
      <div className='container mx-auto max-w-[1200px]'>
        {/* Titre de section */}
        <motion.h2
          style={{
            fontFamily: "'Marcellus', serif",
            fontSize: '48px',
            lineHeight: '57.6px',
            fontWeight: 700,
            color: '#1B998B' /* Turquoise Azur */,
            textAlign: 'center',
            marginBottom: '60px',
            ...getHiddenStyle(30),
          }}
          animate={showContent ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
          transition={getTransition(0)}
          className='max-md:!text-[32px] max-md:!leading-[1.3]'
        >
          Une expertise au service de votre bien-être
        </motion.h2>

        {/* Layout horizontal : Texte à gauche, Photo à droite */}
        <div className='flex flex-col lg:flex-row gap-12 lg:gap-16 items-start'>
          {/* LEFT SIDE - Contenu textuel */}
          <motion.div
            style={getHiddenStyle(0, -30)}
            animate={
              showContent ? { opacity: 1, x: 0 } : { opacity: 0, x: -30 }
            }
            transition={getTransition(0.2)}
            className='flex-1'
          >
            {/* Nom et titre */}
            <div className='mb-8'>
              <h3
                style={{
                  fontFamily: "'Marcellus', serif",
                  fontSize: '32px',
                  lineHeight: '1.3',
                  fontWeight: 700,
                  color: '#1B998B' /* Turquoise Azur */,
                  marginBottom: '8px',
                }}
                className='max-md:!text-[28px]'
              >
                Lucie Cornille
              </h3>
              <p
                style={{
                  fontFamily: "'Plus Jakarta Sans', sans-serif",
                  fontSize: '20px',
                  fontWeight: 600,
                  color: '#1B998B' /* Turquoise Azur */,
                  marginBottom: '16px',
                }}
                className='max-md:!text-[18px]'
              >
                Nutritionniste
              </p>

              {/* Qualifications placeholder */}
              <div
                style={{
                  fontFamily: "'Plus Jakarta Sans', sans-serif",
                  fontSize: '16px',
                  color: '#6B7280',
                  fontStyle: 'italic',
                }}
              >
                [Vos qualifications/formations]
              </div>
            </div>

            {/* Paragraphe 1 */}
            <motion.p
              style={{
                fontFamily: "'Plus Jakarta Sans', sans-serif",
                fontSize: '16px',
                lineHeight: '1.8',
                color: '#4B5563',
                marginBottom: '24px',
                ...getHiddenStyle(20),
              }}
              animate={
                showContent ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }
              }
              transition={getTransition(0.3)}
              className='max-md:!text-[15px]'
            >
              J'ai fondé NutriSensia avec une conviction profonde : la nutrition
              ne devrait jamais être une source de frustration ou de
              culpabilité, mais un outil d'épanouissement et de santé.
            </motion.p>

            {/* Paragraphe 2 */}
            <motion.p
              style={{
                fontFamily: "'Plus Jakarta Sans', sans-serif",
                fontSize: '16px',
                lineHeight: '1.8',
                color: '#4B5563',
                marginBottom: '24px',
                ...getHiddenStyle(20),
              }}
              animate={
                showContent ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }
              }
              transition={getTransition(0.4)}
              className='max-md:!text-[15px]'
            >
              Forte d'une formation approfondie en nutrition et d'une expérience
              d'accompagnement diversifiée, j'accompagne mes patient·e·s avec
              empathie, rigueur et pragmatisme. Je crois fermement au pouvoir de
              la nutrition personnalisée pour améliorer durablement votre
              qualité de vie.
            </motion.p>

            {/* Paragraphe 3 */}
            <motion.p
              style={{
                fontFamily: "'Plus Jakarta Sans', sans-serif",
                fontSize: '16px',
                lineHeight: '1.8',
                color: '#4B5563',
                marginBottom: '24px',
                ...getHiddenStyle(20),
              }}
              animate={
                showContent ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }
              }
              transition={getTransition(0.5)}
              className='max-md:!text-[15px]'
            >
              Spécialisée dans l'accompagnement nutritionnel pour la gestion du
              poids durable, l'optimisation de la santé métabolique et
              l'alimentation adaptée aux besoins spécifiques, je continue à me
              former régulièrement pour vous offrir les meilleures
              recommandations basées sur les connaissances actuelles en
              nutrition.
            </motion.p>

            {/* Paragraphe 4 */}
            <motion.p
              style={{
                fontFamily: "'Plus Jakarta Sans', sans-serif",
                fontSize: '16px',
                lineHeight: '1.8',
                color: '#4B5563',
                ...getHiddenStyle(20),
              }}
              animate={
                showContent ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }
              }
              transition={getTransition(0.6)}
              className='max-md:!text-[15px]'
            >
              Je reste profondément engagée dans ma pratique quotidienne car
              c'est au contact de mes patient·e·s que je trouve le plus de sens
              à mon métier.
            </motion.p>
          </motion.div>

          {/* RIGHT SIDE - Photo professionnelle */}
          <motion.div
            style={getHiddenStyle(0, 30)}
            animate={showContent ? { opacity: 1, x: 0 } : { opacity: 0, x: 30 }}
            transition={getTransition(0.2)}
            className='flex-shrink-0 w-full lg:w-[400px]'
          >
            <div
              style={{
                borderRadius: '16px',
                overflow: 'hidden',
                border: '1px solid #e5e5e5',
                boxShadow: '8px 8px 0 #E5DED6' /* Beige Sand */,
                width: '100%',
                aspectRatio: '3/4',
              }}
              className='relative'
            >
              <Image
                src='/images/lucie-cornille-profile.jpg'
                alt='Lucie Cornille, Nutritionniste certifiée'
                fill
                className='object-cover object-center'
                sizes='(max-width: 768px) 100vw, 400px'
              />
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

export default ExpertiseSection;
