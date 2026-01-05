'use client';

import { useState, useEffect, useCallback } from 'react';
import { ScrollAnimation } from '@/components/ui/ScrollAnimation';
import { ChevronLeft, ChevronRight, Eye, X } from 'lucide-react';
import Image from 'next/image';

/**
 * Section Galerie Visuelle pour la page Plateforme
 *
 * Présente 8 captures d'écran de l'interface de la plateforme
 * dans un carousel interactif avec thumbnails et lightbox.
 */
export function PlatformGallerySection() {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);

  // Screenshots data - utilisant des SVG temporaires
  const screenshots = [
    {
      id: 1,
      title: 'Tableau de bord principal',
      description: "Vue d'ensemble complète avec widgets personnalisés",
      image: '/images/platform/dashboard-main.svg',
      alt: "Capture d'écran du tableau de bord principal NutriSensia",
    },
    {
      id: 2,
      title: 'Plan de repas hebdomadaire',
      description:
        'Planification des repas avec alternatives et informations nutritionnelles',
      image: '/images/platform/meal-plan-weekly.svg',
      alt: "Capture d'écran du plan de repas hebdomadaire",
    },
    {
      id: 3,
      title: 'Liste de courses organisée',
      description: 'Génération automatique par rayons avec cases à cocher',
      image: '/images/platform/dashboard-main.svg', // Temporary placeholder
      alt: "Capture d'écran de la liste de courses organisée par rayons",
    },
    {
      id: 4,
      title: 'Journal alimentaire avec photo',
      description:
        'Enregistrement rapide par photo ou recherche dans la base de données',
      image: '/images/platform/meal-plan-weekly.svg', // Temporary placeholder
      alt: "Capture d'écran du journal alimentaire avec entrée photo",
    },
    {
      id: 5,
      title: 'Graphiques de progression',
      description: 'Suivi détaillé de vos progrès au-delà de la balance',
      image: '/images/platform/dashboard-main.svg', // Temporary placeholder
      alt: "Capture d'écran des graphiques de progression et métriques",
    },
    {
      id: 6,
      title: 'Messagerie avec Lucie',
      description: 'Communication sécurisée et réponses personnalisées',
      image: '/images/platform/meal-plan-weekly.svg', // Temporary placeholder
      alt: "Capture d'écran de l'interface de messagerie",
    },
    {
      id: 7,
      title: 'Bibliothèque de ressources',
      description: 'Articles, guides et recettes adaptés à votre forfait',
      image: '/images/platform/dashboard-main.svg', // Temporary placeholder
      alt: "Capture d'écran de la bibliothèque de ressources",
    },
    {
      id: 8,
      title: 'Espace consultations',
      description: 'Gestion des rendez-vous et accès visio direct',
      image: '/images/platform/meal-plan-weekly.svg', // Temporary placeholder
      alt: "Capture d'écran de l'espace gestion des consultations",
    },
  ];

  const goToNext = useCallback(() => {
    setActiveIndex(prev => (prev + 1) % screenshots.length);
  }, [screenshots.length]);

  const goToPrevious = useCallback(() => {
    setActiveIndex(
      prev => (prev - 1 + screenshots.length) % screenshots.length
    );
  }, [screenshots.length]);

  const openLightbox = useCallback((index: number) => {
    setLightboxIndex(index);
    setIsLightboxOpen(true);
    document.body.style.overflow = 'hidden';
  }, []);

  const closeLightbox = useCallback(() => {
    setIsLightboxOpen(false);
    document.body.style.overflow = '';
  }, []);

  const goToNextLightbox = useCallback(() => {
    setLightboxIndex(prev => (prev + 1) % screenshots.length);
  }, [screenshots.length]);

  const goToPreviousLightbox = useCallback(() => {
    setLightboxIndex(
      prev => (prev - 1 + screenshots.length) % screenshots.length
    );
  }, [screenshots.length]);

  // Auto-play functionality
  useEffect(() => {
    if (!isLightboxOpen) {
      const timer = setInterval(goToNext, 5000);
      return () => clearInterval(timer);
    }
  }, [activeIndex, goToNext, isLightboxOpen]);

  // Keyboard navigation for carousel
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'ArrowRight') {
        goToNext();
      } else if (event.key === 'ArrowLeft') {
        goToPrevious();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [goToNext, goToPrevious]);

  // Keyboard navigation for lightbox
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (!isLightboxOpen) return;

      if (event.key === 'Escape') {
        closeLightbox();
      } else if (event.key === 'ArrowRight') {
        goToNextLightbox();
      } else if (event.key === 'ArrowLeft') {
        goToPreviousLightbox();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isLightboxOpen, closeLightbox, goToNextLightbox, goToPreviousLightbox]);

  return (
    <section className='bg-white py-20 px-4 lg:px-8'>
      <div className='max-w-[1300px] mx-auto'>
        {/* Section Header */}
        <ScrollAnimation animation='fadeSlideUp' delay={0}>
          <div className='text-center mb-16'>
            <h2
              className='text-4xl lg:text-5xl font-bold text-primary-dark mb-4'
              style={{ fontFamily: 'Playfair Display, serif' }}
            >
              Découvrez la Plateforme en Images
            </h2>
            <p className='text-lg text-neutral-medium leading-relaxed max-w-2xl mx-auto'>
              Un aperçu complet de toutes les fonctionnalités
            </p>
          </div>
        </ScrollAnimation>

        {/* Carousel */}
        <div className='relative max-w-5xl mx-auto bg-secondary-pale/20 p-5 rounded-xl shadow-xl'>
          <div
            key={activeIndex}
            className='relative w-full h-[400px] md:h-[550px] lg:h-[650px] flex items-center justify-center overflow-hidden rounded-lg cursor-pointer group transition-all duration-500 ease-out'
            onClick={() => openLightbox(activeIndex)}
          >
            <Image
              src={screenshots[activeIndex].image}
              alt={screenshots[activeIndex].alt}
              fill
              style={{ objectFit: 'contain' }}
              priority={activeIndex === 0}
              sizes='(max-width: 768px) 100vw, (max-width: 1200px) 80vw, 700px'
              className='rounded-lg transition-opacity duration-500 ease-out'
            />
            {/* Overlay for "Voir en grand" */}
            <div className='absolute inset-0 bg-primary-dark/70 flex items-center justify-center rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300'>
              <Eye className='w-12 h-12 text-white' />
              <span className='sr-only'>Voir en grand</span>
            </div>
          </div>

          {/* Image Title & Description */}
          <div className='text-center mt-6'>
            <h3 className='text-xl font-semibold text-primary-dark'>
              {screenshots[activeIndex].title}
            </h3>
            <p className='text-neutral-medium text-sm'>
              {screenshots[activeIndex].description}
            </p>
          </div>

          {/* Navigation Arrows */}
          <button
            onClick={goToPrevious}
            className='absolute left-3 top-1/2 -translate-y-1/2 bg-white p-3 rounded-full shadow-md hover:bg-primary-pale/50 hover-scale z-10 focus:outline-none focus:ring-2 focus:ring-primary'
            aria-label='Image précédente'
          >
            <ChevronLeft className='w-6 h-6 text-primary' />
          </button>
          <button
            onClick={goToNext}
            className='absolute right-3 top-1/2 -translate-y-1/2 bg-white p-3 rounded-full shadow-md hover:bg-primary-pale/50 hover-scale z-10 focus:outline-none focus:ring-2 focus:ring-primary'
            aria-label='Image suivante'
          >
            <ChevronRight className='w-6 h-6 text-primary' />
          </button>

          {/* Thumbnails Navigation */}
          <div className='flex justify-center gap-3 mt-8 overflow-x-auto py-2 scrollbar-hide'>
            {screenshots.map((screenshot, index) => (
              <button
                key={screenshot.id}
                onClick={() => setActiveIndex(index)}
                className={`flex-shrink-0 w-24 h-16 rounded-md cursor-pointer relative overflow-hidden border-2 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-primary ${
                  activeIndex === index
                    ? 'opacity-100 scale-105 border-primary'
                    : 'opacity-50 scale-100 border-transparent hover:opacity-100'
                }`}
                aria-label={`Voir l'image ${index + 1}: ${screenshot.title}`}
              >
                <Image
                  src={screenshot.image}
                  alt={`Thumbnail for ${screenshot.title}`}
                  fill
                  style={{ objectFit: 'cover' }}
                  sizes='100px'
                  className='rounded-md'
                />
              </button>
            ))}
          </div>

          {/* Progress Indicators (Dots) */}
          <div className='flex justify-center gap-2 mt-6'>
            {screenshots.map((_, index) => (
              <div
                key={index}
                className={`h-2 rounded-full transition-all duration-300 ${
                  activeIndex === index
                    ? 'bg-primary w-6'
                    : 'bg-neutral-medium w-2'
                }`}
                aria-label={`Aller à l'image ${index + 1}`}
              />
            ))}
          </div>
        </div>

        {/* Lightbox Modal */}
        {isLightboxOpen && (
          <div
            className='fixed inset-0 bg-black/95 z-50 flex items-center justify-center p-4 animate-in fade-in-0'
            onClick={closeLightbox}
          >
            <div
              className='relative max-w-screen-xl max-h-screen-xl animate-in zoom-in-95'
              onClick={e => e.stopPropagation()}
            >
              <Image
                src={screenshots[lightboxIndex].image}
                alt={screenshots[lightboxIndex].alt}
                width={1200}
                height={800}
                style={{ objectFit: 'contain' }}
                className='rounded-lg shadow-2xl max-w-[90vw] max-h-[80vh]'
              />
              <button
                onClick={closeLightbox}
                className='absolute top-4 right-4 bg-white/20 backdrop-blur-sm p-2 rounded-full text-white hover:bg-white/40 transition-colors focus:outline-none focus:ring-2 focus:ring-white'
                aria-label='Fermer la lightbox'
              >
                <X className='w-6 h-6' />
              </button>
              <button
                onClick={goToPreviousLightbox}
                className='absolute left-4 top-1/2 -translate-y-1/2 bg-white/20 backdrop-blur-sm p-2 rounded-full text-white hover:bg-white/40 transition-colors focus:outline-none focus:ring-2 focus:ring-white'
                aria-label='Image précédente'
              >
                <ChevronLeft className='w-6 h-6' />
              </button>
              <button
                onClick={goToNextLightbox}
                className='absolute right-4 top-1/2 -translate-y-1/2 bg-white/20 backdrop-blur-sm p-2 rounded-full text-white hover:bg-white/40 transition-colors focus:outline-none focus:ring-2 focus:ring-white'
                aria-label='Image suivante'
              >
                <ChevronRight className='w-6 h-6' />
              </button>
              <div className='absolute bottom-4 left-1/2 -translate-x-1/2 text-white text-center bg-black/50 px-4 py-2 rounded-lg'>
                <p className='font-semibold'>
                  {screenshots[lightboxIndex].title}
                </p>
                <p className='text-sm'>
                  {screenshots[lightboxIndex].description}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
