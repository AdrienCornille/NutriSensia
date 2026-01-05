'use client';

import { useCallback, useEffect, useState } from 'react';
import useEmblaCarousel from 'embla-carousel-react';
import Autoplay from 'embla-carousel-autoplay';
import { Star, Quote, ChevronLeft, ChevronRight, User } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { cn } from '@/lib/utils';

/**
 * Interface pour un témoignage
 */
interface Testimonial {
  id: string;
  name: string;
  role: 'patient' | 'nutritionist';
  location?: string;
  rating: number;
  comment: string;
  avatar?: string;
  date?: string;
  results?: string;
  specialty?: string;
}

/**
 * Props du composant TestimonialsSection
 */
interface TestimonialsSectionProps {
  className?: string;
  id?: string;
  title?: string;
  subtitle?: string;
  testimonials?: Testimonial[];
  filterByRole?: 'patient' | 'nutritionist' | 'all';
}

/**
 * Témoignages par défaut
 */
const DEFAULT_TESTIMONIALS: Testimonial[] = [
  {
    id: '1',
    name: 'Marie Dubois',
    role: 'patient',
    location: 'Genève',
    rating: 5,
    comment:
      "Grâce à NutriSensia, j'ai enfin trouvé un équilibre alimentaire qui me convient. Ma nutritionniste m'a accompagnée avec bienveillance et professionnalisme.",
    results: 'Perte de 8kg en 3 mois',
    date: '2024-01-15',
  },
  {
    id: '2',
    name: 'Thomas Müller',
    role: 'patient',
    location: 'Zurich',
    rating: 5,
    comment:
      "Les consultations en ligne sont très pratiques et les conseils personnalisés m'ont vraiment aidé à améliorer ma digestion et mon énergie.",
    results: 'Amélioration digestive significative',
    date: '2024-02-03',
  },
  {
    id: '3',
    name: 'Dr. Sophie Martin',
    role: 'nutritionist',
    location: 'Lausanne',
    rating: 5,
    comment:
      "La plateforme NutriSensia me permet de mieux organiser mes consultations et d'offrir un suivi plus personnalisé à mes patients.",
    specialty: 'Nutrition sportive',
    date: '2024-01-20',
  },
  {
    id: '4',
    name: 'Julie Rochat',
    role: 'patient',
    location: 'Neuchâtel',
    rating: 5,
    comment:
      "J'apprécie particulièrement les recettes personnalisées et le suivi entre les consultations. Cela m'aide à rester motivée.",
    results: "Adoption d'habitudes durables",
    date: '2024-02-10',
  },
  {
    id: '5',
    name: 'Dr. Pierre Favre',
    role: 'nutritionist',
    location: 'Fribourg',
    rating: 5,
    comment:
      'Excellent outil pour les professionnels. La gestion des patients et la facturation automatique me font gagner un temps précieux.',
    specialty: 'Nutrition clinique',
    date: '2024-01-28',
  },
  {
    id: '6',
    name: 'Anna Rossi',
    role: 'patient',
    location: 'Lugano',
    rating: 5,
    comment:
      "Mon parcours avec NutriSensia a transformé ma relation à l'alimentation. Je recommande vivement cette approche personnalisée.",
    results: "Meilleure relation à l'alimentation",
    date: '2024-02-05',
  },
];

/**
 * Composant de carte témoignage
 */
interface TestimonialCardProps {
  testimonial: Testimonial;
  onClick?: () => void;
}

function TestimonialCard({ testimonial, onClick }: TestimonialCardProps) {
  const handleClick = () => {
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('event', 'testimonial_engagement', {
        engagement_type: 'click',
        testimonial_id: testimonial.id,
        value: 1,
      });
    }
    onClick?.();
  };

  return (
    <Card
      className='p-6 h-full cursor-pointer hover:shadow-lg transition-shadow'
      onClick={handleClick}
    >
      <div className='flex flex-col h-full'>
        <div className='flex items-start gap-3 mb-4'>
          <Quote className='h-6 w-6 text-blue-600 flex-shrink-0 mt-1' />
          <p className='text-gray-700 italic leading-relaxed flex-1'>
            "{testimonial.comment}"
          </p>
        </div>

        <div className='flex items-center gap-1 mb-4'>
          {[...Array(5)].map((_, i) => (
            <Star
              key={i}
              className={cn(
                'h-4 w-4',
                i < testimonial.rating
                  ? 'text-yellow-400 fill-current'
                  : 'text-gray-300'
              )}
            />
          ))}
        </div>

        {(testimonial.results || testimonial.specialty) && (
          <div className='mb-4'>
            <span
              className={cn(
                'inline-block px-3 py-1 rounded-full text-xs font-medium',
                testimonial.role === 'patient'
                  ? 'bg-green-100 text-green-800'
                  : 'bg-blue-100 text-blue-800'
              )}
            >
              {testimonial.results || testimonial.specialty}
            </span>
          </div>
        )}

        <div className='flex items-center gap-3 mt-auto'>
          <div className='w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center'>
            {testimonial.avatar ? (
              <img
                src={testimonial.avatar}
                alt={testimonial.name}
                className='w-10 h-10 rounded-full object-cover'
              />
            ) : (
              <User className='h-5 w-5 text-gray-500' />
            )}
          </div>

          <div className='flex-1'>
            <p className='font-medium text-gray-900'>{testimonial.name}</p>
            <p className='text-sm text-gray-500'>
              {testimonial.role === 'patient' ? 'Patient' : 'Nutritionniste'}
              {testimonial.location && ` • ${testimonial.location}`}
            </p>
          </div>
        </div>
      </div>
    </Card>
  );
}

/**
 * Composant principal de la section témoignages
 */
export function TestimonialsSection({
  className,
  id = 'testimonials',
  title = 'Ce que disent nos utilisateurs',
  subtitle = 'Découvrez les témoignages de nos patients et nutritionnistes partenaires',
  testimonials = DEFAULT_TESTIMONIALS,
  filterByRole = 'all',
}: TestimonialsSectionProps) {
  const [selectedIndex, setSelectedIndex] = useState(0);

  // Configuration d'Embla Carousel avec autoplay
  const [emblaRef, emblaApi] = useEmblaCarousel(
    {
      loop: true,
      align: 'start',
      slidesToScroll: 1,
    },
    [Autoplay({ delay: 5000, stopOnInteraction: false })]
  );

  // Filtrer les témoignages selon le rôle
  const filteredTestimonials =
    filterByRole === 'all'
      ? testimonials
      : testimonials.filter(t => t.role === filterByRole);

  // Navigation
  const scrollPrev = useCallback(() => {
    if (emblaApi) {
      emblaApi.scrollPrev();
      if (typeof window !== 'undefined' && window.gtag) {
        window.gtag('event', 'carousel_interaction', {
          interaction_type: 'prev',
          carousel_index: 0,
          value: 1,
        });
      }
    }
  }, [emblaApi]);

  const scrollNext = useCallback(() => {
    if (emblaApi) {
      emblaApi.scrollNext();
      if (typeof window !== 'undefined' && window.gtag) {
        window.gtag('event', 'carousel_interaction', {
          interaction_type: 'next',
          carousel_index: 0,
          value: 1,
        });
      }
    }
  }, [emblaApi]);

  const scrollTo = useCallback(
    (index: number) => {
      if (emblaApi) {
        emblaApi.scrollTo(index);
        if (typeof window !== 'undefined' && window.gtag) {
          window.gtag('event', 'carousel_interaction', {
            interaction_type: 'dot_click',
            carousel_index: index,
            value: 1,
          });
        }
      }
    },
    [emblaApi]
  );

  // Écouter les changements de slide
  useEffect(() => {
    if (!emblaApi) return;

    const onSelect = () => {
      const index = emblaApi.selectedScrollSnap();
      setSelectedIndex(index);

      if (
        typeof window !== 'undefined' &&
        window.gtag &&
        filteredTestimonials[index]?.id
      ) {
        window.gtag('event', 'testimonial_engagement', {
          engagement_type: 'view',
          testimonial_id: filteredTestimonials[index].id,
          value: 1,
        });
      }
    };

    emblaApi.on('select', onSelect);
    onSelect();

    return () => {
      emblaApi.off('select', onSelect);
    };
  }, [emblaApi, filteredTestimonials]);

  return (
    <section id={id} className={cn('py-16 bg-gray-50', className)}>
      <div className='container mx-auto px-4'>
        <div className='text-center mb-12'>
          <h2 className='text-3xl md:text-4xl font-bold text-gray-900 mb-4'>
            {title}
          </h2>
          <p className='text-lg text-gray-600 max-w-2xl mx-auto'>{subtitle}</p>
        </div>

        <div className='relative max-w-6xl mx-auto'>
          {/* Navigation buttons */}
          <Button
            variant='outline'
            size='sm'
            onClick={scrollPrev}
            disabled={filteredTestimonials.length <= 1}
            className={cn(
              'absolute top-1/2 -translate-y-1/2 -left-5 z-10 rounded-full w-10 h-10 p-0',
              'bg-white/90 hover:bg-white shadow-lg border-gray-200',
              'disabled:opacity-50 disabled:cursor-not-allowed'
            )}
          >
            <ChevronLeft className='h-4 w-4' />
          </Button>

          <Button
            variant='outline'
            size='sm'
            onClick={scrollNext}
            disabled={filteredTestimonials.length <= 1}
            className={cn(
              'absolute top-1/2 -translate-y-1/2 -right-5 z-10 rounded-full w-10 h-10 p-0',
              'bg-white/90 hover:bg-white shadow-lg border-gray-200',
              'disabled:opacity-50 disabled:cursor-not-allowed'
            )}
          >
            <ChevronRight className='h-4 w-4' />
          </Button>

          {/* Carousel */}
          <div className='overflow-hidden' ref={emblaRef}>
            <div className='flex gap-4'>
              {filteredTestimonials.map(testimonial => (
                <div
                  key={testimonial.id}
                  className='flex-[0_0_100%] min-w-0 md:flex-[0_0_50%] lg:flex-[0_0_33.333%] px-2'
                >
                  <TestimonialCard testimonial={testimonial} />
                </div>
              ))}
            </div>
          </div>

          {/* Dots navigation */}
          <div className='flex justify-center gap-2 mt-8'>
            {filteredTestimonials.map((_, index) => (
              <button
                key={index}
                onClick={() => scrollTo(index)}
                className={cn(
                  'w-3 h-3 rounded-full transition-colors',
                  index === selectedIndex ? 'bg-blue-600' : 'bg-gray-300'
                )}
                aria-label={`Go to slide ${index + 1}`}
              />
            ))}
          </div>
        </div>

        {/* Statistics */}
        <div className='mt-12 text-center'>
          <div className='grid grid-cols-1 md:grid-cols-3 gap-8 max-w-3xl mx-auto'>
            <div>
              <div className='text-3xl font-bold text-blue-600 mb-2'>98%</div>
              <div className='text-gray-600'>Taux de satisfaction</div>
            </div>
            <div>
              <div className='text-3xl font-bold text-green-600 mb-2'>500+</div>
              <div className='text-gray-600'>Patients accompagnés</div>
            </div>
            <div>
              <div className='text-3xl font-bold text-purple-600 mb-2'>50+</div>
              <div className='text-gray-600'>Nutritionnistes partenaires</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
