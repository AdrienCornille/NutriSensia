'use client';

import { useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import { cn } from '@/lib/utils';
import { Check, X } from 'lucide-react';

/**
 * Section Qualification Client - Est-Ce Que Je Suis La Bonne Personne Pour Vous ?
 *
 * Cette section aide les visiteurs à déterminer s'ils sont un bon match
 * tout en étant transparent sur les limitations et ce qui n'est pas couvert.
 *
 * Features:
 * - Layout 2 colonnes (60/40) responsive
 * - Colonne positive (clients idéaux) - vert
 * - Colonne limitations (ce qui n'est pas fait) - orange
 * - Animations au scroll avec délais échelonnés
 * - Design accessible avec codage couleur + icônes
 */
export function ClientQualificationSection() {
  const ref = useRef(null);
  const isInView = useInView(ref, {
    once: true,
    amount: 0.1,
    margin: '-100px',
  });

  // Animation variants
  const headerVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0 },
  };

  const leftColumnVariants = {
    hidden: { opacity: 0, x: -30 },
    visible: { opacity: 1, x: 0 },
  };

  const rightColumnVariants = {
    hidden: { opacity: 0, x: 30 },
    visible: { opacity: 1, x: 0 },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: { opacity: 1, y: 0 },
  };

  // Données des clients idéaux
  const idealClients = [
    "Ont des troubles hormonaux (SOPK, endométriose, troubles du cycle, résistance à l'insuline)",
    'Souffrent de problèmes digestifs chroniques (ballonnements, SII, intolérances)',
    'Veulent perdre du poids de façon durable, sans régime restrictif',
    "Sont fatiguées d'essayer des régimes qui ne marchent pas ou ne durent pas",
    'Cherchent une approche scientifique mais aussi empathique',
    'Veulent comprendre leur corps, pas juste suivre des règles aveuglément',
    "Sont prêtes à s'investir dans le processus (pas de baguette magique)",
    'Veulent un accompagnement moderne, avec outils digitaux',
    'Apprécient la transparence et la communication directe',
  ];

  // Données des limitations
  const limitations = [
    "Je ne traite pas les troubles alimentaires sévères (anorexie, boulimie) - j'oriente vers des spécialistes",
    'Je ne promets pas de résultats miracles en 2 semaines',
    'Je ne fais pas de régimes détox ou de cures « purifiantes »',
    'Je ne prescris pas de médicaments (je ne suis pas médecin)',
    'Je ne remplace pas un suivi médical, je le complète',
  ];

  return (
    <section
      ref={ref}
      className={cn(
        // Container principal
        'relative w-full',
        // Background blanc
        'bg-white',
        // Padding responsive
        'py-[100px] px-10',
        'max-md:py-[60px] max-md:px-6',
        'prevent-overflow'
      )}
    >
      {/* Container centré avec max-width */}
      <div className='container mx-auto max-w-[1100px]'>
        {/* ============================================ */}
        {/* HEADER SECTION                               */}
        {/* ============================================ */}
        <div className='text-center mb-[60px]'>
          {/* H2 Title */}
          <motion.h2
            initial='hidden'
            animate={isInView ? 'visible' : 'hidden'}
            variants={headerVariants}
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
            Est-Ce Que Je Suis La Bonne Personne Pour Vous ?
          </motion.h2>

          {/* Subheadline */}
          <motion.p
            initial='hidden'
            animate={isInView ? 'visible' : 'hidden'}
            variants={headerVariants}
            transition={{ duration: 0.6, delay: 0.2 }}
            className={cn(
              "font-['Inter',system-ui,sans-serif]",
              'text-[1.125rem]',
              'text-[#6B7280]', // Text secondary
              'text-center',
              'mb-[60px]'
            )}
          >
            Je travaille particulièrement bien avec les femmes qui...
          </motion.p>
        </div>

        {/* ============================================ */}
        {/* TWO COLUMNS LAYOUT                           */}
        {/* ============================================ */}
        <div className='grid grid-cols-1 lg:grid-cols-5 gap-8 max-md:gap-[30px]'>
          {/* ============================================ */}
          {/* LEFT COLUMN - CLIENTS IDÉAUX (60%)           */}
          {/* ============================================ */}
          <motion.div
            className='lg:col-span-3'
            initial='hidden'
            animate={isInView ? 'visible' : 'hidden'}
            variants={leftColumnVariants}
            transition={{ duration: 0.6, delay: 0.3 }}
          >
            <div
              className={cn(
                // Background success green ultra-light
                'bg-[rgba(107,165,131,0.08)]',
                // Border left success green
                'border-l-4 border-[#6BA583]',
                // Padding et styling
                'p-[35px] max-md:p-[30px]',
                'rounded-xl',
                'shadow-[0_2px_12px_rgba(44,62,60,0.06)]'
              )}
            >
              {/* Header avec icône */}
              <div className='flex items-center gap-3 mb-6'>
                <div className='w-7 h-7 flex items-center justify-center'>
                  <Check
                    className='w-7 h-7 text-[#6BA583]'
                    aria-hidden='true'
                  />
                </div>
                <h3
                  className={cn(
                    "font-['Inter',system-ui,sans-serif]",
                    'text-[1.5rem]',
                    'font-bold',
                    'uppercase',
                    'tracking-[0.5px]',
                    'text-[#5A7A64]' // Success green dark
                  )}
                >
                  Vous êtes idéale si
                </h3>
              </div>

              {/* Liste des clients idéaux */}
              <div className='flex flex-col gap-[14px]'>
                {idealClients.map((item, index) => (
                  <motion.div
                    key={index}
                    className='flex items-start gap-3'
                    initial='hidden'
                    animate={isInView ? 'visible' : 'hidden'}
                    variants={itemVariants}
                    transition={{ duration: 0.4, delay: 0.4 + index * 0.05 }}
                  >
                    {/* Checkmark */}
                    <div className='w-4 h-4 flex items-center justify-center mt-0.5 flex-shrink-0'>
                      <Check
                        className='w-4 h-4 text-[#6BA583]'
                        aria-hidden='true'
                      />
                    </div>

                    {/* Text */}
                    <p
                      className={cn(
                        "font-['Inter',system-ui,sans-serif]",
                        'text-[1rem] max-md:text-[0.95rem]',
                        'leading-[1.6]',
                        'text-[#6B7280]' // Text secondary
                      )}
                    >
                      {item}
                    </p>
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>

          {/* ============================================ */}
          {/* RIGHT COLUMN - LIMITATIONS (40%)             */}
          {/* ============================================ */}
          <motion.div
            className='lg:col-span-2'
            initial='hidden'
            animate={isInView ? 'visible' : 'hidden'}
            variants={rightColumnVariants}
            transition={{ duration: 0.6, delay: 0.5 }}
          >
            <div
              className={cn(
                // Background warning orange ultra-light
                'bg-[rgba(255,152,0,0.06)]',
                // Border left warning orange
                'border-l-4 border-[#FF9800]',
                // Padding et styling
                'p-[35px] max-md:p-[30px]',
                'rounded-xl',
                'shadow-[0_2px_12px_rgba(44,62,60,0.06)]'
              )}
            >
              {/* Header avec icône */}
              <div className='flex items-center gap-3 mb-6'>
                <div className='w-7 h-7 flex items-center justify-center'>
                  <X className='w-7 h-7 text-[#FF9800]' aria-hidden='true' />
                </div>
                <h3
                  className={cn(
                    "font-['Inter',system-ui,sans-serif]",
                    'text-[1.5rem]',
                    'font-bold',
                    'uppercase',
                    'tracking-[0.5px]',
                    'text-[#E65100]' // Warning orange dark
                  )}
                >
                  Ce que je ne fais pas
                </h3>
              </div>

              {/* Liste des limitations */}
              <div className='flex flex-col gap-4'>
                {limitations.map((item, index) => (
                  <motion.div
                    key={index}
                    className='flex items-start gap-3'
                    initial='hidden'
                    animate={isInView ? 'visible' : 'hidden'}
                    variants={itemVariants}
                    transition={{ duration: 0.4, delay: 0.6 + index * 0.05 }}
                  >
                    {/* Cross Icon */}
                    <div className='w-4 h-4 flex items-center justify-center mt-0.5 flex-shrink-0'>
                      <X
                        className='w-4 h-4 text-[#FF9800]'
                        aria-hidden='true'
                      />
                    </div>

                    {/* Text */}
                    <p
                      className={cn(
                        "font-['Inter',system-ui,sans-serif]",
                        'text-[0.95rem] max-md:text-[0.9rem]',
                        'leading-[1.6]',
                        'text-[#6B7280]' // Text secondary
                      )}
                    >
                      {item}
                    </p>
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

export default ClientQualificationSection;















