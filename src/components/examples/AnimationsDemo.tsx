'use client';

import React from 'react';
import {
  ScrollAnimation,
  StaggerAnimation,
  StaggerItem,
  AnimatedCard,
} from '@/components/ui/ScrollAnimation';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Heart, Microscope, Calendar } from 'lucide-react';

/**
 * Démonstration du système d'animations
 *
 * Ce composant montre tous les types d'animations disponibles
 * pour la page L'Approche.
 */
export function AnimationsDemo() {
  return (
    <div className='min-h-screen bg-white py-20 px-6'>
      <div className='max-w-4xl mx-auto space-y-20'>
        {/* Section 1: Animations de base */}
        <section>
          <ScrollAnimation animation='fadeIn'>
            <h2 className='text-3xl font-bold text-center mb-10'>
              Animations de Base
            </h2>
          </ScrollAnimation>

          <div className='grid md:grid-cols-2 gap-8'>
            <ScrollAnimation animation='fadeSlideLeft' delay={0.1}>
              <Card className='p-6'>
                <h3 className='text-xl font-semibold mb-4'>
                  Fade + Slide Left
                </h3>
                <p>Cette carte apparaît en glissant depuis la droite.</p>
              </Card>
            </ScrollAnimation>

            <ScrollAnimation animation='fadeSlideRight' delay={0.2}>
              <Card className='p-6'>
                <h3 className='text-xl font-semibold mb-4'>
                  Fade + Slide Right
                </h3>
                <p>Cette carte apparaît en glissant depuis la gauche.</p>
              </Card>
            </ScrollAnimation>
          </div>
        </section>

        {/* Section 2: Animation Stagger */}
        <section>
          <ScrollAnimation animation='fadeSlideUp'>
            <h2 className='text-3xl font-bold text-center mb-10'>
              Animation Stagger
            </h2>
          </ScrollAnimation>

          <StaggerAnimation staggerDelay={0.15}>
            <div className='grid md:grid-cols-3 gap-6'>
              {[1, 2, 3].map(num => (
                <StaggerItem key={num}>
                  <Card className='p-6 text-center'>
                    <div className='w-12 h-12 bg-primary rounded-full flex items-center justify-center text-white font-bold text-xl mx-auto mb-4'>
                      {num}
                    </div>
                    <h3 className='text-lg font-semibold mb-2'>
                      Élément {num}
                    </h3>
                    <p>Apparaît avec un délai de {num * 0.15}s</p>
                  </Card>
                </StaggerItem>
              ))}
            </div>
          </StaggerAnimation>
        </section>

        {/* Section 3: Cartes animées avec hover */}
        <section>
          <ScrollAnimation animation='fadeSlideUp'>
            <h2 className='text-3xl font-bold text-center mb-10'>
              Cartes avec Animations Hover
            </h2>
          </ScrollAnimation>

          <div className='grid md:grid-cols-3 gap-6'>
            <ScrollAnimation animation='scaleIn' delay={0.1}>
              <AnimatedCard hoverType='lift' className='bg-white'>
                <Card className='p-6 text-center'>
                  <Heart className='w-8 h-8 text-primary mx-auto mb-4' />
                  <h3 className='text-lg font-semibold mb-2'>Hover Lift</h3>
                  <p>Survole pour voir l'effet de lift léger</p>
                </Card>
              </AnimatedCard>
            </ScrollAnimation>

            <ScrollAnimation animation='scaleIn' delay={0.2}>
              <AnimatedCard hoverType='liftStrong' className='bg-white'>
                <Card className='p-6 text-center'>
                  <Microscope className='w-8 h-8 text-primary mx-auto mb-4' />
                  <h3 className='text-lg font-semibold mb-2'>
                    Hover Lift Strong
                  </h3>
                  <p>Survole pour voir l'effet de lift fort</p>
                </Card>
              </AnimatedCard>
            </ScrollAnimation>

            <ScrollAnimation animation='scaleIn' delay={0.3}>
              <AnimatedCard hoverType='scale' className='bg-white'>
                <Card className='p-6 text-center'>
                  <Calendar className='w-8 h-8 text-primary mx-auto mb-4' />
                  <h3 className='text-lg font-semibold mb-2'>Hover Scale</h3>
                  <p>Survole pour voir l'effet de scale</p>
                </Card>
              </AnimatedCard>
            </ScrollAnimation>
          </div>
        </section>

        {/* Section 4: Boutons animés */}
        <section>
          <ScrollAnimation animation='fadeSlideUp'>
            <h2 className='text-3xl font-bold text-center mb-10'>
              Boutons avec Animations
            </h2>
          </ScrollAnimation>

          <div className='flex flex-col md:flex-row gap-4 justify-center'>
            <ScrollAnimation animation='fadeSlideUp' delay={0.1}>
              <Button variant='primary' size='lg'>
                Bouton Primaire
              </Button>
            </ScrollAnimation>

            <ScrollAnimation animation='fadeSlideUp' delay={0.2}>
              <Button variant='outline' size='lg'>
                Bouton Outline
              </Button>
            </ScrollAnimation>
          </div>
        </section>

        {/* Section 5: Timeline animation */}
        <section>
          <ScrollAnimation animation='fadeSlideUp'>
            <h2 className='text-3xl font-bold text-center mb-10'>
              Animation Timeline
            </h2>
          </ScrollAnimation>

          <div className='relative max-w-md mx-auto'>
            {/* Ligne de timeline */}
            <ScrollAnimation animation='fadeIn' delay={0.2}>
              <div className='absolute left-8 top-0 bottom-0 w-0.5 bg-primary timeline-draw' />
            </ScrollAnimation>

            {/* Étapes */}
            <div className='space-y-8'>
              {['Étape 1', 'Étape 2', 'Étape 3'].map((step, index) => (
                <ScrollAnimation
                  key={step}
                  animation='fadeSlideLeft'
                  delay={0.3 + index * 0.2}
                >
                  <div className='flex items-center'>
                    <div className='w-16 h-16 bg-primary rounded-full flex items-center justify-center text-white font-bold z-10'>
                      {index + 1}
                    </div>
                    <div className='ml-6'>
                      <h3 className='text-lg font-semibold'>{step}</h3>
                      <p className='text-gray-600'>
                        Description de l'étape {index + 1}
                      </p>
                    </div>
                  </div>
                </ScrollAnimation>
              ))}
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}

export default AnimationsDemo;
