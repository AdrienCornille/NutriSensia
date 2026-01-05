'use client';

import { useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import { cn } from '@/lib/utils';
import { useFirstVisit } from '@/hooks/useFirstVisit';

/**
 * Section Valeurs Fondamentales - Ce qui guide notre pratique au quotidien
 *
 * Cette section présente les 6 valeurs fondamentales de NutriSensia
 * avec le design signature (border + shadow offset).
 *
 * Features:
 * - 6 cartes de valeurs en grille responsive (3x2)
 * - Design NutriSensia avec bordure verte et ombre offset
 * - Titres en vert et en gras
 * - Contenu centré sur la page
 * - Animations au scroll
 */
export function ValuesSection() {
  const ref = useRef(null);
  const isInView = useInView(ref, {
    once: true,
    amount: 0.1,
    margin: '-100px',
  });
  const { isFirstVisit } = useFirstVisit();

  // Animation conditionnelle basée sur première visite
  const shouldAnimate = isFirstVisit && isInView;
  const showContent = !isFirstVisit || isInView;

  // Helpers pour les animations conditionnelles
  const getHiddenStyle = (yOffset: number) => {
    if (!isFirstVisit) return {};
    return { opacity: 0, transform: `translateY(${yOffset}px)` };
  };

  const getTransition = (delay: number) => {
    if (shouldAnimate) {
      return { duration: 0.6, delay, ease: 'easeOut' as const };
    }
    return { duration: 0 };
  };

  // Données des 6 valeurs fondamentales
  const values = [
    {
      title: 'Accessibilité',
      description:
        "Chaque personne devrait pouvoir consulter un·e diététicien·ne diplômé·e. Nous proposons des consultations en ligne pour vous faciliter l'accès, quel que soit votre lieu de résidence en Suisse.",
    },
    {
      title: 'Bienveillance',
      description:
        'La santé est un droit, et chacun·e mérite de se sentir bien. Nous vous respectons, quelle que soit votre histoire, votre morphologie ou vos difficultés de santé. Notre approche est sans jugement.',
    },
    {
      title: 'Confiance',
      description:
        'La relation entre patient·e et thérapeute est sacrée. Nous construisons cette confiance par une communication ouverte et honnête sur votre santé, vos progrès et le coût de vos consultations.',
    },
    {
      title: 'Science',
      description:
        'Nos recommandations sont toujours fondées sur les dernières recherches en nutrition et en santé. Nous rendons la science nutritionnelle accessible et applicable à votre vie quotidienne.',
    },
    {
      title: 'Personnalisation',
      description:
        'Chaque personne est unique. Nous travaillons avec vous et non contre vous pour vous aider à développer votre confiance en matière de santé. Nous adaptons nos conseils à votre réalité, vos goûts et votre rythme de vie.',
    },
    {
      title: 'Collaboration',
      description:
        "Une meilleure santé nécessite un travail d'équipe. Nous pouvons, si vous le souhaitez, travailler en complémentarité avec votre médecin traitant et vos autres professionnel·le·s de santé pour optimiser votre bien-être global.",
    },
  ];

  return (
    <section
      ref={ref}
      className={cn(
        'relative w-full',
        'py-[100px] px-10',
        'max-md:py-[60px] max-md:px-6'
      )}
      style={{ backgroundColor: '#E5DED6' }} /* Beige Sand - Méditerranée */
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
            marginBottom: '20px',
            ...getHiddenStyle(30),
          }}
          animate={showContent ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
          transition={getTransition(0)}
          className='max-md:!text-[32px] max-md:!leading-[1.3]'
        >
          Nos Valeurs Fondamentales
        </motion.h2>

        {/* Sous-titre */}
        <motion.p
          style={{
            fontFamily: "'Plus Jakarta Sans', sans-serif",
            fontSize: '20px',
            lineHeight: '1.6',
            color: '#4B5563',
            textAlign: 'center',
            marginBottom: '60px',
            ...getHiddenStyle(20),
          }}
          animate={showContent ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
          transition={getTransition(0.1)}
          className='max-md:!text-[18px]'
        >
          Ce qui guide notre pratique au quotidien
        </motion.p>

        {/* Grille de cartes - 2 colonnes sur desktop, 1 sur mobile */}
        <div className='grid grid-cols-1 md:grid-cols-2 gap-8 max-w-[1000px] mx-auto items-stretch'>
          {values.map((value, index) => (
            <motion.div
              key={index}
              style={{
                backgroundColor: '#FBF9F7' /* Warm Cream */,
                border: '1px solid #e5e5e5',
                borderRadius: '10px',
                padding: '48px',
                textAlign: 'center',
                transition: 'all 0.3s ease',
                display: 'flex',
                flexDirection: 'column',
                height: '100%',
                ...getHiddenStyle(30),
              }}
              animate={
                showContent ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }
              }
              transition={getTransition(0.2 + index * 0.1)}
              className='hover:border-[2px] max-md:!p-8'
            >
              {/* Titre de la valeur */}
              <h3
                style={{
                  fontFamily: "'Plus Jakarta Sans', sans-serif",
                  fontSize: '24px',
                  fontWeight: 700,
                  color: '#1B998B' /* Turquoise Azur */,
                  marginBottom: '16px',
                }}
                className='max-md:!text-[22px]'
              >
                {value.title}
              </h3>

              {/* Description */}
              <p
                style={{
                  fontFamily: "'Plus Jakarta Sans', sans-serif",
                  fontSize: '16px',
                  lineHeight: '1.7',
                  color: '#4B5563',
                  margin: 0,
                }}
                className='max-md:!text-[15px]'
              >
                {value.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default ValuesSection;
