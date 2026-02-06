'use client';

import React, { useRef } from 'react';
import { cn } from '@/lib/utils';
import { motion, useInView } from 'framer-motion';
import { Check, Target, Zap, Bird } from 'lucide-react';
import { useMediaQuery } from '@/hooks/useMediaQuery';

/**
 * Section Benefits-Focused - Design 2025
 *
 * Section axée sur les résultats concrets et tangibles que les clientes
 * peuvent obtenir avec l'accompagnement NutriSensia.
 *
 * Features:
 * - 3 colonnes de bénéfices : Clarté, Énergie, Liberté
 * - Design premium avec cartes en hover effect
 * - Quote box avec citation de Lucie Cornille
 * - Animations stagger au scroll
 * - Responsive mobile avec stack vertical
 * - Checkmarks personnalisés pour les bullet points
 */
export function BenefitsSection() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-100px' });
  const isMobile = useMediaQuery('(max-width: 768px)');

  // Données des 3 colonnes de bénéfices - CE QUI CHANGE DANS VOTRE QUOTIDIEN
  const benefitColumns = [
    {
      id: 1,
      iconName: 'Target',
      iconColor: 'text-blue-500',
      iconBg: 'bg-blue-50',
      title: 'Clarté (enfin !)',
      mainBenefit:
        'Fini de chercher la bonne méthode dans les magazines et sur internet. Vous allez comprendre comment VOTRE corps fonctionne.',
      bullets: [
        'Vous décryptez vos signaux de faim, vos coups de fatigue, vos envies',
        "Vous identifiez les aliments qui VOUS donnent de l'énergie",
        'Vous comprenez POURQUOI certains choix fonctionnent pour vous',
      ],
      conclusion: 'Plus de confusion. Juste de la clarté.',
    },
    {
      id: 2,
      iconName: 'Zap',
      iconColor: 'text-amber-500',
      iconBg: 'bg-amber-50',
      title: 'Énergie retrouvée',
      mainBenefit:
        "Vous en avez marre de ces coups de barre de 15h qui vous assomment ? D'être toujours fatiguée, même après une nuit de sommeil ?",
      bullets: [
        'Une énergie stable tout au long de la journée',
        'Un sommeil vraiment réparateur qui vous régénère',
        "Une concentration qui vous permet enfin d'être présente au travail et avec vos proches",
      ],
      conclusion: "Fini l'épuisement constant. Vous retrouvez votre vitalité.",
    },
    {
      id: 3,
      iconName: 'Bird',
      iconColor: 'text-teal-500',
      iconBg: 'bg-teal-50',
      title: 'Liberté',
      mainBenefit:
        'Imaginez manger sans culpabilité. Sans calculer. Sans vous priver.',
      bullets: [
        'Une relation enfin apaisée avec la nourriture',
        "Des habitudes qui s'intègrent naturellement à votre vie, sans effort constant",
        'Des résultats qui durent, sans effet rebond',
      ],
      conclusion: 'Plus de régimes yo-yo. Juste une vraie liberté qui dure.',
    },
  ];

  // Fonction pour obtenir le composant d'icône
  const getIconComponent = (iconName: string) => {
    switch (iconName) {
      case 'Target':
        return Target;
      case 'Zap':
        return Zap;
      case 'Bird':
        return Bird;
      default:
        return Target;
    }
  };

  return (
    <section
      id='benefits'
      className={cn(
        'relative',
        // Background sage clair pour s'harmoniser avec le WaveDivider
        'bg-[#E8F3EF]',
        'py-[100px] px-10 md:px-16 lg:px-20',
        'md:py-[100px]'
      )}
    >
      {/* Container principal */}
      <div className='container mx-auto max-w-[1370px]'>
        {/* ============================================ */}
        {/* HEADER SECTION                               */}
        {/* ============================================ */}
        <div className='text-center mb-[60px]'>
          {/* Section Label */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
            transition={{ duration: 0.5 }}
            className={cn(
              "font-['Inter',system-ui,sans-serif]",
              'text-[0.875rem] uppercase',
              'letter-spacing-[1.5px]',
              'text-primary',
              'font-semibold',
              'mb-3'
            )}
          >
            CE QUI CHANGE DANS VOTRE QUOTIDIEN
          </motion.div>

          {/* H2 Title */}
          <motion.h2
            initial={{ opacity: 0, y: 30 }}
            animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className={cn(
              'font-sans',
              'text-[2rem] md:text-[2.5rem]',
              'font-bold',
              'text-[#2C3E3C]'
            )}
          >
            Des Résultats Concrets et Durables
          </motion.h2>
        </div>

        {/* ============================================ */}
        {/* CE QUE VOUS ALLEZ OBTENIR CONCRÈTEMENT       */}
        {/* ============================================ */}
        <div className='mb-[80px] max-w-[1080px] mx-auto'>
          <motion.h3
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className={cn(
              "font-['Inter',system-ui,sans-serif]",
              'text-[1.5rem] md:text-[1.75rem]',
              'font-bold',
              'text-[#2C3E3C]',
              'mb-6',
              'text-center'
            )}
          >
            Ce que vous allez obtenir concrètement
          </motion.h3>

          <motion.ul
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className='space-y-4'
          >
            {[
              {
                title: 'Une nutritionniste dédiée qui vous écoute vraiment',
                desc: 'Pas de consultation expédiée en 15 minutes. On prend le temps de comprendre VOTRE situation, vos défis, votre histoire.',
              },
              {
                title: 'Un plan alimentaire adapté à votre réalité',
                desc: 'À votre corps, vos goûts, vos contraintes, votre mode de vie. Pas un régime photocopié, mais quelque chose que vous pouvez suivre dans la vraie vie.',
              },
              {
                title: 'Des outils simples et applicables immédiatement',
                desc: 'Plans de repas personnalisés, listes de courses automatiques, journal alimentaire par photo. Tout pour vous faciliter la vie.',
              },
              {
                title: 'Un suivi continu entre les consultations',
                desc: "Vous avez une question ? Je vous réponds dans les 24h. Vous n'êtes jamais seule dans votre parcours.",
              },
              {
                title: 'Un espace sans jugement ni culpabilité',
                desc: 'Ici, vous avancez à votre rythme. Pas de pression, pas de reproches. Juste du soutien et de la bienveillance.',
              },
            ].map((item, idx) => (
              <li key={idx} className='flex items-start gap-3'>
                <div
                  className={cn(
                    'flex-shrink-0',
                    'w-6 h-6',
                    'bg-primary',
                    'rounded-full',
                    'flex items-center justify-center',
                    'mt-0.5'
                  )}
                >
                  <Check className='w-4 h-4 text-white' strokeWidth={3} />
                </div>
                <div>
                  <strong
                    className={cn(
                      "font-['Inter',system-ui,sans-serif]",
                      'text-[1rem] md:text-[1.05rem]',
                      'text-[#2C3E3C]',
                      'font-semibold'
                    )}
                  >
                    {item.title}
                  </strong>
                  <span
                    className={cn(
                      "font-['Inter',system-ui,sans-serif]",
                      'text-[0.95rem]',
                      'text-[#667674]'
                    )}
                  >
                    {' — '}
                    {item.desc}
                  </span>
                </div>
              </li>
            ))}
          </motion.ul>
        </div>

        {/* ============================================ */}
        {/* BENEFITS COLUMNS                             */}
        {/* ============================================ */}
        <div
          ref={ref}
          className={cn(
            'grid grid-cols-1 md:grid-cols-3',
            'gap-10',
            'mb-[60px]'
          )}
        >
          {benefitColumns.map((column, index) => (
            <motion.div
              key={column.id}
              initial={{ opacity: 0, y: isMobile ? 10 : 30 }}
              animate={
                isInView
                  ? { opacity: 1, y: 0 }
                  : { opacity: 0, y: isMobile ? 10 : 30 }
              }
              transition={{
                duration: isMobile ? 0.3 : 0.6,
                delay: isMobile ? 0.1 + index * 0.1 : 0.2 + index * 0.2,
                ease: 'easeOut',
              }}
              className={cn(
                // Base styling
                'bg-white',
                'p-10 md:p-10',
                'rounded-xl',
                'shadow-[0_4px_20px_rgba(44,62,60,0.08)]',
                'text-left',
                'transition-all duration-300 ease-out',
                // Hover effects (désactivés sur mobile)
                !isMobile && 'hover:-translate-y-2',
                !isMobile && 'hover:shadow-[0_8px_30px_rgba(44,62,60,0.15)]'
              )}
            >
              {/* Icon */}
              <div
                className={cn(
                  'w-20 h-20 rounded-full',
                  'flex items-center justify-center',
                  column.iconBg,
                  'mb-6'
                )}
              >
                {React.createElement(getIconComponent(column.iconName), {
                  className: cn('w-10 h-10', column.iconColor),
                  strokeWidth: 2,
                })}
              </div>

              {/* Column Title (H3) */}
              <h3
                className={cn(
                  "font-['Inter',system-ui,sans-serif]",
                  'text-[1.5rem] md:text-[1.75rem]',
                  'font-bold',
                  'text-[#2C3E3C]',
                  'mb-5'
                )}
              >
                {column.title}
              </h3>

              {/* Main Benefit Statement */}
              <p
                className={cn(
                  "font-['Inter',system-ui,sans-serif]",
                  'text-[1.125rem]',
                  'font-semibold',
                  'text-primary',
                  'leading-[1.5]',
                  'mb-4'
                )}
              >
                {column.mainBenefit}
              </p>

              {/* Bullet Points List */}
              <ul className='space-y-3 mb-5'>
                {column.bullets.map((bullet, bulletIndex) => (
                  <motion.li
                    key={bulletIndex}
                    initial={{ opacity: 0, x: -10 }}
                    animate={
                      isInView ? { opacity: 1, x: 0 } : { opacity: 0, x: -10 }
                    }
                    transition={{
                      duration: 0.4,
                      delay: 0.4 + index * 0.2 + bulletIndex * 0.1,
                    }}
                    className='flex items-start gap-3'
                  >
                    {/* Custom Checkmark */}
                    <div
                      className={cn(
                        'flex-shrink-0',
                        'w-5 h-5',
                        'bg-primary',
                        'rounded-full',
                        'flex items-center justify-center',
                        'mt-0.5'
                      )}
                    >
                      <Check
                        className='w-3 h-3 text-white'
                        strokeWidth={3}
                        aria-hidden='true'
                      />
                    </div>

                    {/* Bullet Text */}
                    <span
                      className={cn(
                        "font-['Inter',system-ui,sans-serif]",
                        'text-[0.95rem]',
                        'leading-[1.6]',
                        'text-[#667674]'
                      )}
                    >
                      {bullet}
                    </span>
                  </motion.li>
                ))}
              </ul>

              {/* Conclusion */}
              {column.conclusion && (
                <p
                  className={cn(
                    "font-['Inter',system-ui,sans-serif]",
                    'text-[0.95rem]',
                    'font-semibold',
                    'text-[#2C3E3C]',
                    'italic',
                    'mt-4'
                  )}
                >
                  {column.conclusion}
                </p>
              )}
            </motion.div>
          ))}
        </div>

        {/* ============================================ */}
        {/* QUOTE BOX                                    */}
        {/* ============================================ */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
          transition={{ duration: 0.6, delay: 0.8 }}
          className={cn(
            'max-w-[1080px]',
            'mx-auto',
            'bg-white',
            'p-10 md:p-10',
            'border-l-4 border-[#D4A574]',
            'rounded-lg',
            'shadow-[0_4px_15px_rgba(0,0,0,0.08)]'
          )}
        >
          {/* Quote Text */}
          <blockquote
            className={cn(
              "font-['Inter',system-ui,sans-serif]",
              'text-[1.125rem] md:text-[1.25rem]',
              'italic',
              'text-[#2C3E3C]',
              'leading-[1.7]',
              'mb-6'
            )}
          >
            "Chaque consultation est un espace où vous pouvez enfin avancer à
            votre rythme. Mon objectif n'est pas de vous rendre dépendante, mais
            de vous donner les clés pour comprendre votre corps et savoir
            comment le nourrir pour la vie."
          </blockquote>

          {/* Values */}
          <div
            className={cn(
              "font-['Inter',system-ui,sans-serif]",
              'text-[0.95rem]',
              'text-[#667674]',
              'leading-[1.7]',
              'mb-4'
            )}
          >
            <strong className='text-[#2C3E3C]'>Mes valeurs :</strong>{' '}
            Bienveillance, personnalisation, autonomie et résultats durables.
          </div>

          {/* Author Attribution */}
          <cite
            className={cn(
              "font-['Inter',system-ui,sans-serif]",
              'text-[0.95rem]',
              'text-[#667674]',
              'font-semibold',
              'not-italic',
              'text-right',
              'block'
            )}
          >
            — Lucie Cornille, Nutritionniste ASCA/RME
          </cite>
        </motion.div>
      </div>
    </section>
  );
}
