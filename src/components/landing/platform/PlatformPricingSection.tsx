'use client';

import { ScrollAnimation } from '@/components/ui/ScrollAnimation';
import { Gift, Target, Smartphone, Check, X } from 'lucide-react';
import { Button } from '@/components/ui';

/**
 * Section Pricing pour la page Plateforme
 *
 * Présente 3 options d'accès : Essai Gratuit, Forfaits Complets, Plateforme Seule
 * avec mise en valeur de l'essai gratuit et recommandation des forfaits complets.
 */
export function PlatformPricingSection() {
  const pricingOptions = [
    {
      id: 1,
      icon: Gift,
      title: 'Essai Gratuit',
      subtitle: '7 jours pour découvrir',
      price: 'Gratuit',
      period: '7 jours',
      description: 'Testez toutes les fonctionnalités sans engagement',
      features: [
        'Accès complet à la plateforme',
        'Toutes les fonctionnalités incluses',
        'Support client inclus',
        'Aucune carte bancaire requise',
      ],
      cta: "Commencer l'essai",
      ctaVariant: 'primary' as const,
      popular: false,
    },
    {
      id: 2,
      icon: Target,
      title: 'Forfaits Complets',
      subtitle: 'Recommandé',
      price: 'À partir de 180€',
      period: 'par mois',
      description: 'Plateforme + consultations + suivi personnalisé',
      features: [
        'Accès complet à la plateforme',
        'Consultations nutritionnelles',
        'Suivi personnalisé',
        'Support prioritaire',
        'Rapports détaillés',
      ],
      cta: 'Voir les forfaits',
      ctaVariant: 'secondary' as const,
      popular: true,
    },
    {
      id: 3,
      icon: Smartphone,
      title: 'Plateforme Seule',
      subtitle: 'Accès autonome',
      price: '29€',
      period: 'par mois',
      description: "Uniquement l'accès à la plateforme numérique",
      features: [
        'Accès complet à la plateforme',
        'Toutes les fonctionnalités',
        'Support communautaire',
        'Ressources en ligne',
      ],
      cta: "S'abonner",
      ctaVariant: 'outline' as const,
      popular: false,
    },
  ];

  return (
    <section className='bg-white py-20 px-4 lg:px-8'>
      <div className='max-w-6xl mx-auto'>
        {/* Header */}
        <ScrollAnimation animation='fadeSlideUp' delay={0}>
          <div className='text-center mb-16'>
            <h2
              className='text-4xl lg:text-5xl font-bold text-primary-dark mb-4'
              style={{ fontFamily: 'Playfair Display, serif' }}
            >
              Choisissez Votre Accès
            </h2>
            <p className='text-lg text-neutral-medium leading-relaxed max-w-3xl mx-auto'>
              Commencez gratuitement, puis choisissez l'option qui correspond le
              mieux à vos besoins.
            </p>
          </div>
        </ScrollAnimation>

        {/* Pricing Cards */}
        <div className='grid grid-cols-1 md:grid-cols-3 gap-8'>
          {pricingOptions.map((option, index) => (
            <ScrollAnimation
              key={option.id}
              animation='fadeSlideUp'
              delay={index * 0.15}
            >
              <div
                className={`relative bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all duration-300 ${
                  option.popular ? 'ring-2 ring-primary scale-105' : ''
                }`}
              >
                {option.popular && (
                  <div className='absolute -top-4 left-1/2 transform -translate-x-1/2'>
                    <div className='bg-primary text-white px-4 py-2 rounded-full text-sm font-semibold'>
                      Recommandé
                    </div>
                  </div>
                )}

                <div className='text-center mb-6'>
                  <div className='w-16 h-16 bg-primary/10 rounded-xl flex items-center justify-center mx-auto mb-4'>
                    <option.icon className='w-8 h-8 text-primary' />
                  </div>
                  <h3 className='text-2xl font-bold text-primary-dark mb-2'>
                    {option.title}
                  </h3>
                  <p className='text-primary italic text-sm mb-4'>
                    {option.subtitle}
                  </p>
                  <div className='mb-4'>
                    <span className='text-4xl font-bold text-primary-dark'>
                      {option.price}
                    </span>
                    <span className='text-neutral-medium ml-2'>
                      {option.period}
                    </span>
                  </div>
                  <p className='text-neutral-medium text-sm'>
                    {option.description}
                  </p>
                </div>

                <ul className='space-y-3 mb-8'>
                  {option.features.map((feature, featureIndex) => (
                    <li
                      key={featureIndex}
                      className='flex items-start gap-3 text-sm'
                    >
                      <Check
                        className='w-4 h-4 text-primary mt-0.5 flex-shrink-0'
                        strokeWidth={2.5}
                      />
                      <span className='text-neutral-medium'>{feature}</span>
                    </li>
                  ))}
                </ul>

                <Button
                  variant={option.ctaVariant}
                  size='lg'
                  className='w-full'
                >
                  {option.cta}
                </Button>
              </div>
            </ScrollAnimation>
          ))}
        </div>

        {/* Bottom Note */}
        <ScrollAnimation animation='fadeIn' delay={0.6}>
          <div className='text-center mt-12'>
            <p className='text-sm text-neutral-medium'>
              Tous les prix incluent la TVA. Annulation possible à tout moment.
            </p>
          </div>
        </ScrollAnimation>
      </div>
    </section>
  );
}
