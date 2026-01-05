'use client';

import React, { useRef } from 'react';
import { cn } from '@/lib/utils';
import { motion, useInView } from 'framer-motion';
import { Button } from '@/components/ui/Button';
import { Check, ArrowRight, Sparkles, Flame } from 'lucide-react';

/**
 * Section Pricing - Forfaits & Tarifs 2025
 *
 * Section de tarification avec 3 forfaits comparatifs.
 * Design moderne avec badges, highlights et informations de remboursement.
 *
 * Features:
 * - 3 cartes de forfaits comparatives
 * - Badge "Le plus populaire" sur le forfait recommandé
 * - Prix avec estimation après remboursement
 * - Liste de features avec checkmarks
 * - Informations sur les remboursements
 * - CTA vers page dédiée
 * - Animations au scroll
 * - Responsive mobile/desktop
 */

interface PricingFeature {
  text: string;
}

interface PricingPlan {
  id: number;
  name: string;
  subtitle?: string;
  price: string;
  features: PricingFeature[];
  idealFor: string;
  ctaText: string;
  ctaLink: string;
  isPopular?: boolean;
  badge?: {
    icon: React.ElementType;
    text: string;
    color: string;
  };
}

const pricingPlans: PricingPlan[] = [
  {
    id: 1,
    name: 'Bilan Complet',
    subtitle: '1 Séance (1h30)',
    price: 'CHF 159',
    features: [
      { text: 'Analyse complète de votre situation (symptômes, habitudes, objectifs)' },
      { text: 'Compréhension des causes de vos déséquilibres' },
      { text: 'Plan d\'action personnalisé avec premières recommandations' },
      { text: 'Programme nutritionnel complet (livré sous 48-72h)' },
      { text: 'Accès immédiat à votre espace plateforme' },
      { text: 'Support continu par messagerie sécurisée' },
    ],
    idealFor: 'Découvrir l\'approche et obtenir un premier plan d\'action',
    ctaText: 'Réserver ma consultation',
    ctaLink: '/contact?type=consultation',
    badge: {
      icon: Check,
      text: 'Aucun engagement sur le long terme',
      color: 'text-primary',
    },
  },
  {
    id: 2,
    name: 'Bilan et Suivi Complet',
    subtitle: '5 Séances',
    price: 'CHF 499',
    features: [
      { text: '5 consultations au total (1 bilan complet 1h30 + 4 suivis personnalisés 1h)' },
      { text: 'Plan nutritionnel évolutif adapté à vos progrès' },
      { text: 'Ajustements réguliers selon vos résultats' },
      { text: 'Optimisation de la complémentation (vitamines, minéraux, plantes)' },
      { text: 'Accès illimité plateforme + messagerie sécurisée' },
      { text: 'Support continu entre consultations (réponse 24h)' },
    ],
    idealFor: 'Créer des changements durables et ancrer vos nouvelles habitudes',
    ctaText: 'Choisir ce forfait',
    ctaLink: '/contact?type=package&plan=3months',
    isPopular: true,
    badge: {
      icon: Flame,
      text: '15% de réduction vs consultations individuelles',
      color: 'text-orange-600',
    },
  },
  {
    id: 3,
    name: 'Bilan et Suivi Complet',
    subtitle: '9 Séances',
    price: 'CHF 799',
    features: [
      { text: '9 consultations au total (1 bilan complet 1h30 + 8 suivis personnalisés 1h)' },
      { text: 'Plan nutritionnel évolutif adapté à vos progrès' },
      { text: 'Ajustements réguliers selon vos résultats' },
      { text: 'Optimisation de la complémentation (vitamines, minéraux, plantes)' },
      { text: 'Accès illimité plateforme + messagerie sécurisée' },
      { text: 'Support continu entre consultations (réponse 24h)' },
    ],
    idealFor: 'Une transformation profonde avec accompagnement complet',
    ctaText: 'Choisir ce forfait',
    ctaLink: '/contact?type=package&plan=6months',
    badge: {
      icon: Sparkles,
      text: '20% de réduction vs consultations individuelles',
      color: 'text-purple-600',
    },
  },
];

export function PricingSection() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-100px' });

  return (
    <section
      id='pricing'
      className={cn(
        'relative',
        'bg-gradient-to-r from-[#E8F3EF] via-[#B8D4C7]/50 to-[#E8F3EF]',
        'pt-[100px] pb-[80px]',
        'md:pt-[120px] md:pb-[100px]'
      )}
    >
      {/* Container principal */}
      <div className='container mx-auto max-w-[1370px] px-6 md:px-10 lg:px-14 xl:px-20'>
        {/* ============================================ */}
        {/* HEADER SECTION                               */}
        {/* ============================================ */}
        <div className='mb-[60px] text-center'>
          {/* H2 Title */}
          <motion.h2
            initial={{ opacity: 0, y: 30 }}
            animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
            transition={{ duration: 0.6 }}
            className={cn(
              "font-sans",
              'text-[2rem] md:text-[2.5rem] lg:text-[3rem]',
              'font-bold',
              'text-[#2C3E3C]',
              'mb-4'
            )}
          >
            Commencez aujourd'hui
          </motion.h2>

          {/* Sous-titre */}
          <motion.p
            initial={{ opacity: 0, y: 30 }}
            animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className={cn(
              "font-['Inter',system-ui,sans-serif]",
              'text-[1.125rem] md:text-[1.25rem]',
              'text-[#667674]',
              'max-w-[840px]',
              'mx-auto'
            )}
          >
            Des forfaits flexibles, pensés pour vous accompagner selon vos
            besoins
          </motion.p>
        </div>

        {/* ============================================ */}
        {/* PRICING CARDS                                */}
        {/* ============================================ */}
        <div
          ref={ref}
          className={cn(
            'grid grid-cols-1 md:grid-cols-3',
            'gap-8',
            'mb-16',
            'items-stretch' // Toutes les cartes auront la même hauteur
          )}
        >
          {pricingPlans.map((plan, index) => (
            <motion.div
              key={plan.id}
              initial={{ opacity: 0, y: 50 }}
              animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 50 }}
              transition={{ duration: 0.6, delay: 0.2 + index * 0.15 }}
              className={cn(
                'h-full', // Prend toute la hauteur disponible
                plan.isPopular && 'md:-my-6' // Étend la carte populaire vers le haut et le bas
              )}
            >
              <div
                className={cn(
                  'relative',
                  'rounded-2xl',
                  'border-2',
                  'transition-all duration-300',
                  'hover:shadow-[0_12px_40px_rgba(44,62,60,0.2)]',
                  'hover:-translate-y-2',
                  // Toutes les cartes ont le même fond blanc
                  'bg-white',
                  // Styles différenciés selon le forfait
                  plan.isPopular
                    ? 'border-primary shadow-[0_12px_40px_rgba(46,125,94,0.25)] z-10 p-10 md:py-12'
                    : 'border-primary/30 shadow-[0_4px_20px_rgba(44,62,60,0.08)] p-8',
                  // Utiliser flex column pour alignement et hauteur complète
                  'flex flex-col h-full'
                )}
              >
              {/* Popular Badge - Hauteur réservée pour toutes les cartes */}
              <div className='h-[32px] -mb-4'>
                {plan.isPopular && (
                  <div
                    className={cn(
                      'absolute -top-4 left-1/2 -translate-x-1/2',
                      'px-4 py-2',
                      'bg-primary',
                      'text-white',
                      'text-sm font-semibold',
                      'rounded-full',
                      'shadow-lg',
                      'whitespace-nowrap'
                    )}
                  >
                    ⭐ Le plus populaire
                  </div>
                )}
              </div>

              {/* Plan Name */}
              <div className='mb-3 h-[48px] flex flex-col justify-center'>
                <h3 className='font-sans text-[1.5rem] md:text-[1.75rem] font-bold text-[#2C3E3C] leading-tight'>
                  {plan.name}
                </h3>
                {plan.subtitle && (
                  <p className="font-['Inter',system-ui,sans-serif] text-[0.95rem] text-[#667674] mt-1 mb-2">
                    {plan.subtitle}
                  </p>
                )}
              </div>

              {/* Price */}
              <div className='mb-5 h-[50px] flex items-center' style={{ marginTop: plan.subtitle ? '0.75rem' : '0' }}>
                <span className="font-['Inter',system-ui,sans-serif] text-[2.5rem] font-bold text-[#2C3E3C]">
                  {plan.price}
                </span>
              </div>

              {/* Features List */}
              <ul className='space-y-2.5 mb-8 min-h-[250px]'>
                {plan.features.map((feature, idx) => (
                  <li key={idx} className='flex items-start gap-3'>
                    <div className='flex-shrink-0 w-5 h-5 rounded-full flex items-center justify-center mt-0.5 bg-primary'>
                      <Check className='w-3 h-3 text-white' strokeWidth={3} />
                    </div>
                    <span className="font-['Inter',system-ui,sans-serif] text-[0.95rem] leading-[1.6] text-[#2C3E3C]">
                      {feature.text}
                    </span>
                  </li>
                ))}
              </ul>

              {/* Ideal For */}
              <div className='p-3.5 rounded-lg mb-4 h-[85px] flex items-center bg-[#E8F3EF]/30'>
                <p className="font-['Inter',system-ui,sans-serif] text-[0.875rem] font-medium text-[#2C3E3C]">
                  <span className='font-bold'>Idéal pour :</span>{' '}
                  {plan.idealFor}
                </p>
              </div>

              {/* Badge (réduction) */}
              {plan.badge && (
                <div className='mb-5 h-[32px] flex items-center justify-center'>
                  <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full bg-white border-2 ${
                    plan.id === 1 ? 'border-primary/30' : plan.id === 2 ? 'border-orange-200' : 'border-purple-200'
                  }`}>
                    <plan.badge.icon className={`w-4 h-4 ${plan.badge.color}`} />
                    <span className={`font-['Inter',system-ui,sans-serif] text-[0.8rem] font-semibold ${plan.badge.color}`}>
                      {plan.badge.text}
                    </span>
                  </div>
                </div>
              )}

              {/* CTA Button - Toujours en bas */}
              <div className='mt-auto'>
                <Button
                  variant={plan.isPopular ? 'primary' : 'secondary'}
                  className='w-full'
                  onClick={() => {
                    window.location.href = plan.ctaLink;
                  }}
                >
                  {plan.ctaText} →
                </Button>
              </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* ============================================ */}
        {/* REFUND INFORMATION - Modern Bento Style      */}
        {/* ============================================ */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
          transition={{ duration: 0.6, delay: 0.8 }}
          className={cn('mb-12 md:mb-16')}
        >
          <div className='max-w-[1000px] mx-auto'>
          {/* Header avec icône */}
          <div className='flex items-center gap-3 mb-6'>
            <div
              className={cn(
                'w-10 h-10',
                'rounded-xl',
                'bg-primary/10',
                'flex items-center justify-center'
              )}
            >
              <svg
                className='w-5 h-5 text-primary'
                fill='none'
                stroke='currentColor'
                viewBox='0 0 24 24'
              >
                <path
                  strokeLinecap='round'
                  strokeLinejoin='round'
                  strokeWidth={2}
                  d='M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z'
                />
              </svg>
            </div>
            <h4
              className={cn(
                "font-['Inter',system-ui,sans-serif]",
                'text-[1.125rem]',
                'font-semibold',
                'text-[#2C3E3C]'
              )}
            >
              Informations sur les remboursements
            </h4>
          </div>

          {/* Bento Grid Layout */}
          <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
            {/* Card 1 - Taux de remboursement */}
            <div
              className={cn(
                'p-6',
                'bg-white',
                'border border-[#E8F3EF]',
                'rounded-xl',
                'hover:border-primary/30',
                'transition-all duration-300',
                'hover:shadow-[0_4px_20px_rgba(44,62,60,0.08)]'
              )}
            >
              <div className='mb-3'>
                <span
                  className={cn(
                    'text-[2rem]',
                    'font-bold',
                    'text-primary',
                    "font-['Inter',system-ui,sans-serif]"
                  )}
                >
                  70-90%
                </span>
              </div>
              <p
                className={cn(
                  "font-['Inter',system-ui,sans-serif]",
                  'text-[0.875rem]',
                  'text-[#667674]',
                  'leading-[1.6]'
                )}
              >
                de remboursement selon votre assurance complémentaire
              </p>
            </div>

            {/* Card 2 - Assurances partenaires */}
            <div
              className={cn(
                'p-6',
                'bg-white',
                'border border-[#E8F3EF]',
                'rounded-xl',
                'hover:border-primary/30',
                'transition-all duration-300',
                'hover:shadow-[0_4px_20px_rgba(44,62,60,0.08)]'
              )}
            >
              <div className='mb-3'>
                <span
                  className={cn(
                    "font-['Inter',system-ui,sans-serif]",
                    'text-[0.875rem]',
                    'font-semibold',
                    'text-[#2C3E3C]'
                  )}
                >
                  Assurances partenaires
                </span>
              </div>
              <p
                className={cn(
                  "font-['Inter',system-ui,sans-serif]",
                  'text-[0.875rem]',
                  'text-[#667674]',
                  'leading-[1.6]'
                )}
              >
                Visana, Swica, CSS, Helsana, Sanitas, et la plupart des
                assurances suisses
              </p>
            </div>

            {/* Card 3 - Factures */}
            <div
              className={cn(
                'p-6',
                'bg-white',
                'border border-[#E8F3EF]',
                'rounded-xl',
                'hover:border-primary/30',
                'transition-all duration-300',
                'hover:shadow-[0_4px_20px_rgba(44,62,60,0.08)]'
              )}
            >
              <div className='mb-3'>
                <span
                  className={cn(
                    "font-['Inter',system-ui,sans-serif]",
                    'text-[0.875rem]',
                    'font-semibold',
                    'text-[#2C3E3C]'
                  )}
                >
                  Factures conformes
                </span>
              </div>
              <p
                className={cn(
                  "font-['Inter',system-ui,sans-serif]",
                  'text-[0.875rem]',
                  'text-[#667674]',
                  'leading-[1.6]'
                )}
              >
                ASCA/RME fournies immédiatement après chaque consultation
              </p>
            </div>
          </div>
          </div>
        </motion.div>

        {/* ============================================ */}
        {/* CTA SECTION                                  */}
        {/* ============================================ */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
          transition={{ duration: 0.6, delay: 0.9 }}
          className='text-center'
        >
          <p
            className={cn(
              "font-['Inter',system-ui,sans-serif]",
              'text-[0.95rem]',
              'text-[#667674]',
              'mb-4'
            )}
          >
            Questions sur les tarifs ou besoin d'un forfait sur mesure ?
          </p>

          <Button
            variant='secondary'
            className={cn(
              'inline-flex items-center gap-2',
              'group',
              'transition-all duration-300'
            )}
            onClick={() => {
              window.location.href = '/forfaits';
            }}
          >
            <span>Voir tous les détails de tarification</span>
            <ArrowRight
              className={cn(
                'w-4 h-4',
                'transition-transform duration-300',
                'group-hover:translate-x-1'
              )}
            />
          </Button>
        </motion.div>
      </div>
      {/* Fin du container principal */}
    </section>
  );
}

