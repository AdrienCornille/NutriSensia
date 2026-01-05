'use client';

import { ScrollAnimation } from '@/components/ui/ScrollAnimation';

/**
 * Section Problème pour la page Plateforme
 *
 * Explique le contexte et les défis de la vraie vie après consultation
 * pour créer une identification immédiate avec les points de douleur du lecteur.
 */
export function PlatformProblemSection() {
  return (
    <section className='bg-white py-20 px-4 lg:px-8'>
      <div className='max-w-3xl mx-auto text-center mb-10'>
        <ScrollAnimation animation='fadeSlideUp' delay={0}>
          <h2
            className='text-4xl lg:text-5xl font-bold text-primary-dark mb-4'
            style={{ fontFamily: 'Playfair Display, serif' }}
          >
            La Vraie Vie Après la Consultation
          </h2>
        </ScrollAnimation>
      </div>

      <div className='max-w-4xl mx-auto space-y-8 text-lg leading-relaxed'>
        {/* Paragraphe 1 */}
        <ScrollAnimation animation='fadeIn' delay={0.05}>
          <p className='text-neutral-medium'>
            Vous sortez du cabinet avec votre plan nutritionnel. Vous êtes
            motivée, déterminée.
            <strong className='text-primary-dark'>
              {' '}
              Vous allez enfin y arriver.
            </strong>
          </p>
        </ScrollAnimation>

        {/* Paragraphe 2 */}
        <ScrollAnimation animation='fadeIn' delay={0.1}>
          <p className='text-neutral-medium'>
            Mais dès le lendemain, les questions commencent :{' '}
            <em className='text-primary'>
              "Combien de grammes de quinoa déjà ? Cette recette, c'était pour
              combien de personnes ? Et si je n'aime pas les courgettes, je les
              remplace par quoi ?"
            </em>
          </p>
        </ScrollAnimation>

        {/* Paragraphe 3 */}
        <ScrollAnimation animation='fadeIn' delay={0.15}>
          <p className='text-neutral-medium'>
            Vous fouillez dans vos notes, vous relisez le PDF pour la énième
            fois.
            <strong className='text-primary-dark'>
              {' '}
              Vous vous sentez perdue.
            </strong>
          </p>
        </ScrollAnimation>

        {/* Paragraphe 4 */}
        <ScrollAnimation animation='fadeIn' delay={0.2}>
          <p className='text-neutral-medium'>
            Au supermarché, vous hésitez devant les rayons.{' '}
            <em className='text-primary'>
              "Est-ce que ce yaourt convient ? Cette huile, c'était autorisée ou
              pas ?"
            </em>{' '}
            Vous finissez par acheter au hasard, en espérant ne pas vous
            tromper.
          </p>
        </ScrollAnimation>

        {/* Paragraphe 5 */}
        <ScrollAnimation animation='fadeIn' delay={0.25}>
          <p className='text-neutral-medium'>
            Les semaines passent. Vous aimeriez savoir si vous progressez
            vraiment, mais comment mesurer autre chose que le poids ?{' '}
            <strong className='text-primary-dark'>
              Votre énergie, votre sommeil, votre digestion... tout ça compte
              aussi, non ?
            </strong>
          </p>
        </ScrollAnimation>

        {/* Paragraphe 6 */}
        <ScrollAnimation animation='fadeIn' delay={0.3}>
          <p className='text-neutral-medium'>
            Et quand vous avez une question urgente, vous attendez le prochain
            rendez-vous.
            <em className='text-primary'>
              Deux semaines, c'est long quand on doute.
            </em>
          </p>
        </ScrollAnimation>

        {/* Citation finale mise en valeur */}
        <ScrollAnimation animation='scaleIn' delay={0.35}>
          <div className='bg-primary-pale/10 border-l-4 border-primary rounded-lg p-8 mt-12 text-center'>
            <blockquote className='text-xl lg:text-2xl font-medium text-primary-dark italic leading-relaxed'>
              "J'ai besoin de plus qu'un PDF. J'ai besoin d'un vrai
              accompagnement au quotidien."
            </blockquote>
            <footer className='mt-4 text-sm text-neutral-medium'>
              — Ce que pensent 9 patientes sur 10
            </footer>
          </div>
        </ScrollAnimation>
      </div>
    </section>
  );
}
