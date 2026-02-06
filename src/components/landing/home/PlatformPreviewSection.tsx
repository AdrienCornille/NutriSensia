'use client';

import React, { useRef } from 'react';
import { cn } from '@/lib/utils';
import { motion, useInView } from 'framer-motion';
import {
  Utensils,
  ShoppingCart,
  BookOpen,
  TrendingUp,
  MessageCircle,
  Calendar,
} from 'lucide-react';
import { BentoCard, BentoGrid } from '@/components/ui/bento-grid';

/**
 * Section Platform Preview - Design 2025 avec Bento Grid
 *
 * Section qui présente la plateforme digitale NutriSensia
 * avec ses 6 fonctionnalités principales dans un layout Bento Grid moderne.
 *
 * Features:
 * - Bento Grid layout responsive
 * - 6 cartes de fonctionnalités avec icônes Lucide
 * - Design premium avec hover effects
 * - Animations stagger au scroll
 * - Responsive mobile avec grid adaptatif
 * - CTA vers essai gratuit
 */
export function PlatformPreviewSection() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-100px' });

  // Données des 6 fonctionnalités principales pour le Bento Grid
  const features = [
    {
      Icon: Utensils,
      name: 'Plans de Repas Personnalisés',
      description:
        'Plans de repas personnalisés et listes de courses automatiques adaptés à vos besoins',
      href: '#',
      cta: 'En savoir plus',
      background: (
        <div className='absolute inset-0 bg-gradient-to-br from-primary/10 via-primary/5 to-transparent' />
      ),
      className: 'lg:row-start-1 lg:row-end-4 lg:col-start-2 lg:col-end-3',
    },
    {
      Icon: BookOpen,
      name: 'Journal Alimentaire',
      description:
        'Journal alimentaire simplifié avec photos de vos repas pour un suivi facile',
      href: '#',
      cta: 'En savoir plus',
      background: (
        <div className='absolute inset-0 bg-gradient-to-br from-accent/10 via-accent/5 to-transparent' />
      ),
      className: 'lg:col-start-1 lg:col-end-2 lg:row-start-1 lg:row-end-3',
    },
    {
      Icon: TrendingUp,
      name: 'Suivi de Progrès',
      description:
        'Suivi de vos progrès : poids, énergie, symptômes et objectifs en temps réel',
      href: '#',
      cta: 'En savoir plus',
      background: (
        <div className='absolute inset-0 bg-gradient-to-br from-secondary/10 via-secondary/5 to-transparent' />
      ),
      className: 'lg:col-start-1 lg:col-end-2 lg:row-start-3 lg:row-end-4',
    },
    {
      Icon: MessageCircle,
      name: 'Messagerie Sécurisée',
      description:
        'Messagerie sécurisée pour vos questions entre consultations, réponse garantie en 24h',
      href: '#',
      cta: 'En savoir plus',
      background: (
        <div className='absolute inset-0 bg-gradient-to-br from-mint/10 via-mint/5 to-transparent' />
      ),
      className: 'lg:col-start-3 lg:col-end-3 lg:row-start-1 lg:row-end-2',
    },
    {
      Icon: ShoppingCart,
      name: 'Ressources Éducatives',
      description:
        "Ressources éducatives complètes pour comprendre ce que vous mangez et pourquoi c'est important",
      href: '#',
      cta: 'En savoir plus',
      background: (
        <div className='absolute inset-0 bg-gradient-to-br from-orange/10 via-orange/5 to-transparent' />
      ),
      className: 'lg:col-start-3 lg:col-end-3 lg:row-start-2 lg:row-end-4',
    },
    {
      Icon: Calendar,
      name: 'Gestion de Rendez-vous',
      description:
        "Gestion simplifiée de vos rendez-vous et documents d'assurance en un seul endroit",
      href: '#',
      cta: 'En savoir plus',
      background: (
        <div className='absolute inset-0 bg-gradient-to-br from-gold/10 via-gold/5 to-transparent' />
      ),
      className: 'lg:col-start-1 lg:col-end-1 lg:row-start-4 lg:row-end-5',
    },
  ];

  return (
    <section
      id='platform'
      className={cn(
        'relative',
        'bg-white',
        'py-[100px] px-6 md:px-10 lg:px-20',
        'md:py-[120px]'
      )}
    >
      {/* Container principal */}
      <div className='container mx-auto max-w-[1400px]'>
        {/* ============================================ */}
        {/* HEADER SECTION                               */}
        {/* ============================================ */}
        <div className='text-center mb-[80px]'>
          {/* Section Label */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
            transition={{ duration: 0.5 }}
            className={cn(
              "font-['Inter',system-ui,sans-serif]",
              'text-[0.875rem] uppercase',
              'tracking-[1.5px]',
              'text-primary',
              'font-semibold',
              'mb-4'
            )}
          >
            VOTRE OUTIL
          </motion.div>

          {/* H2 Title */}
          <motion.h2
            initial={{ opacity: 0, y: 30 }}
            animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className={cn(
              'font-sans',
              'text-[2.25rem] md:text-[3rem] lg:text-[3.5rem]',
              'font-bold',
              'text-[#2C3E3C]',
              'leading-tight',
              'mb-5'
            )}
          >
            Votre Coach Nutritionnel 24/7
          </motion.h2>

          {/* Subtitle */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className={cn(
              "font-['Inter',system-ui,sans-serif]",
              'text-[1rem] md:text-[1.125rem] lg:text-[1.25rem]',
              'text-[#667674]',
              'max-w-[960px]',
              'mx-auto',
              'leading-relaxed'
            )}
          >
            La plateforme NutriSensia centralise tous vos outils nutritionnels
            au même endroit.
          </motion.p>
        </div>

        {/* ============================================ */}
        {/* BENTO GRID                                   */}
        {/* ============================================ */}
        <motion.div
          ref={ref}
          initial={{ opacity: 0, y: 40 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 40 }}
          transition={{ duration: 0.8, delay: 0.3 }}
        >
          <BentoGrid className='lg:grid-rows-4 max-w-[1370px] mx-auto'>
            {features.map((feature, index) => (
              <motion.div
                key={feature.name}
                initial={{ opacity: 0, y: 30 }}
                animate={
                  isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }
                }
                transition={{
                  duration: 0.6,
                  delay: 0.4 + index * 0.1,
                  ease: 'easeOut',
                }}
              >
                <BentoCard {...feature} />
              </motion.div>
            ))}
          </BentoGrid>
        </motion.div>

        {/* ============================================ */}
        {/* CTA SECTION                                  */}
        {/* ============================================ */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
          transition={{ duration: 0.6, delay: 1.0 }}
          className={cn('text-center', 'mt-16')}
        >
          {/* CTA Button */}
          <motion.button
            onClick={() => {
              // Redirection vers essai gratuit
              window.location.href = '/essai-gratuit';
            }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.98 }}
            className={cn(
              'inline-block',
              "font-['Inter',system-ui,sans-serif]",
              'text-[1rem] md:text-[1.125rem]',
              'font-semibold',
              'text-white',
              'bg-primary',
              'px-10 py-5',
              'rounded-xl',
              'transition-all duration-300',
              'hover:bg-primary/90',
              'hover:shadow-[0_12px_30px_rgba(124,152,133,0.3)]',
              'focus:outline-none focus:ring-2 focus:ring-primary/20 focus:ring-offset-2'
            )}
          >
            Essayer Gratuitement 7 Jours
          </motion.button>

          {/* Badge sous CTA */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={isInView ? { opacity: 1 } : { opacity: 0 }}
            transition={{ duration: 0.6, delay: 1.2 }}
            className={cn(
              "font-['Inter',system-ui,sans-serif]",
              'text-[0.875rem] md:text-[0.9375rem]',
              'text-[#667674]',
              'mt-4'
            )}
          >
            Sans engagement • Aucune carte requise
          </motion.p>
        </motion.div>
      </div>
    </section>
  );
}
