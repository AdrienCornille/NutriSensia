'use client';

import { useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import { cn } from '@/lib/utils';

/**
 * Section Humanisante - Quand Je Ne Suis Pas Nutritionniste
 *
 * Cette section révèle la personnalité authentique de Lucie au-delà
 * de son rôle professionnel pour créer une connexion humaine.
 *
 * Features:
 * - 5 items lifestyle avec emojis et descriptions personnelles
 * - Citation inspirante sur l'équilibre personnel
 * - Design chaleureux et accessible
 * - Animations au scroll avec délais échelonnés
 * - Ton décontracté et authentique
 */
export function HumanizingSection() {
  const ref = useRef(null);
  const isInView = useInView(ref, {
    once: true,
    amount: 0.1,
    margin: '-100px',
  });

  // Données des activités personnelles
  const lifestyleItems = [
    {
      emoji: '☕',
      text: 'Dans un café de Lausanne, un bon livre à la main (souvent un polar ou un essai sur la santé, je sais, difficile de décrocher complètement)',
    },
    {
      emoji: '🥾',
      text: "En randonnée dans les Alpes, parce que j'ai besoin de nature pour me ressourcer",
    },
    {
      emoji: '🧘‍♀️',
      text: 'Sur mon tapis de yoga, à pratiquer ce que je prêche : prendre soin de son corps ET de son esprit',
    },
    {
      emoji: '🍳',
      text: "En train d'expérimenter de nouvelles recettes dans ma cuisine (pas toujours avec succès, mais toujours avec plaisir)",
    },
    {
      emoji: '🌱',
      text: "Au marché local, parce que j'adore discuter avec les producteurs et découvrir des légumes de saison",
    },
  ];

  return (
    <section
      ref={ref}
      className={cn(
        // Container principal
        'relative w-full',
        // Background sage léger
        'bg-[#F8FAF9]',
        // Padding responsive
        'py-20 px-10',
        'max-md:py-[60px] max-md:px-6',
        'prevent-overflow'
      )}
    >
      {/* Container centré avec max-width */}
      <div className='container mx-auto max-w-[900px]'>
        {/* ============================================ */}
        {/* HEADER SECTION                               */}
        {/* ============================================ */}
        <div className='text-center mb-[50px]'>
          {/* H2 Title */}
          <motion.h2
            initial={{ opacity: 0, y: 30 }}
            animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            style={{
              fontFamily: "'Marcellus', serif",
              fontSize: '48px',
              lineHeight: '57.6px',
              fontWeight: 700,
              color: '#3f6655',
              textAlign: 'center',
              marginBottom: '16px',
            }}
            className='max-md:!text-[2rem] max-md:!leading-[2.4rem]'
          >
            Quand Je Ne Suis Pas Nutritionniste
          </motion.h2>

          {/* Subheadline */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className={cn(
              "font-['Inter',system-ui,sans-serif]",
              'text-[1.125rem]',
              'italic',
              'text-[#6B7280]', // Text secondary
              'text-center',
              'mb-[50px]'
            )}
          >
            Parce que je suis humaine aussi (et que ça compte)
          </motion.p>
        </div>

        {/* ============================================ */}
        {/* INTRO PARAGRAPH                              */}
        {/* ============================================ */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className={cn(
            "font-['Inter',system-ui,sans-serif]",
            'text-[1.125rem] max-md:text-[1rem]',
            'leading-[1.7]',
            'text-[#6B7280]', // Text secondary
            'text-center',
            'max-w-[700px]',
            'mx-auto',
            'mb-10'
          )}
        >
          Quand je ne suis pas en consultation ou en train de créer des plans de
          repas, vous me trouverez probablement :
        </motion.p>

        {/* ============================================ */}
        {/* LIFESTYLE ITEMS LIST                         */}
        {/* ============================================ */}
        <div className='max-w-[700px] mx-auto mb-[50px]'>
          <div className='flex flex-col gap-5'>
            {lifestyleItems.map((item, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -30 }}
                animate={
                  isInView ? { opacity: 1, x: 0 } : { opacity: 0, x: -30 }
                }
                transition={{ duration: 0.6, delay: 0.4 + index * 0.1 }}
                className={cn(
                  'flex items-start',
                  'gap-5 max-md:gap-4',
                  'p-5 max-md:p-4',
                  'bg-white',
                  'rounded-lg',
                  'shadow-[0_2px_10px_rgba(44,62,60,0.04)]',
                  'transition-all duration-300 ease-out',
                  'hover:translate-x-2 hover:shadow-[0_4px_20px_rgba(44,62,60,0.08)]'
                )}
              >
                {/* Emoji Icon */}
                <div
                  className={cn(
                    'text-[2rem] max-md:text-[1.75rem]',
                    'leading-none',
                    'flex-shrink-0',
                    'mt-0.5' // Align with first line of text
                  )}
                >
                  {item.emoji}
                </div>

                {/* Text Content */}
                <p
                  className={cn(
                    "font-['Inter',system-ui,sans-serif]",
                    'text-[1rem] max-md:text-[0.95rem]',
                    'leading-[1.7]',
                    'text-[#6B7280]', // Text secondary
                    'flex-1'
                  )}
                >
                  {item.text}
                </p>
              </motion.div>
            ))}
          </div>
        </div>

        {/* ============================================ */}
        {/* QUOTE BOX                                    */}
        {/* ============================================ */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={
            isInView ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.95 }
          }
          transition={{
            duration: 0.6,
            delay: 0.4 + lifestyleItems.length * 0.1 + 0.2,
          }}
          className={cn(
            'bg-white',
            'border-2 border-primary',
            'rounded-lg',
            'p-8 max-md:p-6',
            'max-w-[700px]',
            'mx-auto',
            'shadow-[0_4px_15px_rgba(44,62,60,0.08)]'
          )}
        >
          <blockquote
            className={cn(
              "font-['Inter',system-ui,sans-serif]",
              'text-[1.125rem] max-md:text-[1rem]',
              'italic',
              'leading-[1.7]',
              'text-[#2C3E3C]', // Primary dark
              'text-center'
            )}
          >
            Je crois profondément qu'on ne peut pas bien accompagner les autres
            si on ne prend pas soin de soi d'abord. C'est pour ça que je
            pratique ce que j'enseigne : équilibre, écoute de son corps, et
            bienveillance envers soi-même.
          </blockquote>
        </motion.div>
      </div>
    </section>
  );
}

export default HumanizingSection;















