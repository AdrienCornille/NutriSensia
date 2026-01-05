'use client';

import { useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import Image from 'next/image';
import { cn } from '@/lib/utils';
import { useFirstVisit } from '@/hooks/useFirstVisit';

/**
 * Section Parcours - Transformer votre santé par la nutrition
 *
 * Layout: Image en haut, contenu textuel centré en dessous
 * - Image principale
 * - Titre H2
 * - Paragraphes explicatifs
 * - Information remboursement
 * - CTA "Premier pas"
 */
export function PersonalJourneySection() {
  const ref = useRef(null);
  const isInView = useInView(ref, {
    once: true,
    amount: 0.2,
    margin: '-100px',
  });
  const { isFirstVisit } = useFirstVisit();

  // Animation conditionnelle basée sur première visite
  const shouldAnimate = isFirstVisit && isInView;
  const showContent = !isFirstVisit || isInView;

  // Helpers pour les animations conditionnelles
  const getHiddenStyle = (yOffset: number) => {
    if (!isFirstVisit) return {};
    return { opacity: 0, transform: `translateY(${yOffset}px)` };
  };

  const getTransition = (delay: number) => {
    if (shouldAnimate) {
      return { duration: 0.6, delay, ease: 'easeOut' as const };
    }
    return { duration: 0 };
  };

  return (
    <section
      ref={ref}
      className={cn(
        'relative w-full',
        'py-[100px] px-10',
        'max-md:py-[60px] max-md:px-6'
      )}
      style={{ backgroundColor: '#FBF9F7' }} /* Warm Cream - Méditerranée */
    >
      <div className='container mx-auto max-w-[900px]'>
        {/* Image en haut */}
        <motion.div
          style={getHiddenStyle(30)}
          animate={showContent ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
          transition={getTransition(0)}
          className='flex justify-center mb-12'
        >
          <div
            style={{
              borderRadius: '16px',
              overflow: 'hidden',
              boxShadow: '0 8px 30px rgba(0, 0, 0, 0.12)',
              width: '100%',
              maxWidth: '700px',
              aspectRatio: '16/9',
            }}
            className='relative'
          >
            <Image
              src='/images/nutritionist-consultation.jpg'
              alt='Consultation nutritionnelle personnalisée avec Lucie Cornille'
              fill
              className='object-cover object-center'
              sizes='(max-width: 768px) 100vw, 700px'
            />
          </div>
        </motion.div>

        {/* Contenu textuel centré */}
        <div className='text-center max-w-[800px] mx-auto'>
          {/* Titre H2 */}
          <motion.h2
            style={{
              fontFamily: "'Marcellus', serif",
              fontSize: '42px',
              lineHeight: '1.2',
              fontWeight: 700,
              color: '#1B998B' /* Turquoise Azur */,
              marginBottom: '32px',
              ...getHiddenStyle(30),
            }}
            animate={showContent ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
            transition={getTransition(0.1)}
            className='max-md:!text-[28px] max-md:!leading-[1.3]'
          >
            Transformer votre santé par la nutrition, une consultation à la fois
          </motion.h2>

          {/* Paragraphe 1 */}
          <motion.p
            style={{
              fontFamily: "'Plus Jakarta Sans', sans-serif",
              fontSize: '16px',
              lineHeight: '1.8',
              color: '#4B5563',
              marginBottom: '24px',
              ...getHiddenStyle(20),
            }}
            animate={showContent ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
            transition={getTransition(0.2)}
            className='max-md:!text-[14px]'
          >
            En Suisse, des milliers de personnes vivent avec des problématiques
            de santé liées à leur alimentation, pourtant peu ont accès à un
            accompagnement nutritionnel personnalisé et de qualité. Beaucoup
            pensent que consulter un·e professionnel·le de la nutrition signifie
            renoncer aux plaisirs de la table ou suivre un régime restrictif.
            C'est faux.
          </motion.p>

          {/* Paragraphe 2 */}
          <motion.p
            style={{
              fontFamily: "'Plus Jakarta Sans', sans-serif",
              fontSize: '16px',
              lineHeight: '1.8',
              color: '#4B5563',
              marginBottom: '24px',
              ...getHiddenStyle(20),
            }}
            animate={showContent ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
            transition={getTransition(0.3)}
            className='max-md:!text-[14px]'
          >
            Chez NutriSensia, nous croyons que chaque personne mérite un
            accompagnement nutritionnel accessible, professionnel et
            bienveillant. Nous proposons des consultations personnalisées en
            ligne avec Lucie Cornille, nutritionniste, pour un suivi fondé sur
            les connaissances actuelles en nutrition, inclusif et respectueux de
            votre culture alimentaire.
          </motion.p>

          {/* Paragraphe 3 */}
          <motion.p
            style={{
              fontFamily: "'Plus Jakarta Sans', sans-serif",
              fontSize: '16px',
              lineHeight: '1.8',
              color: '#4B5563',
              marginBottom: '40px',
              ...getHiddenStyle(20),
            }}
            animate={showContent ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
            transition={getTransition(0.4)}
            className='max-md:!text-[14px]'
          >
            Notre approche est non-jugeante, durable et adaptée à votre réalité
            quotidienne. Nous honorons vos habitudes, vos goûts et vos
            contraintes pour construire ensemble un chemin vers une meilleure
            santé.
          </motion.p>

          {/* Encadré Remboursement */}
          <motion.div
            style={{
              backgroundColor: 'rgba(27, 153, 139, 0.08)' /* Turquoise pale */,
              borderRadius: '12px',
              padding: '24px 32px',
              ...getHiddenStyle(20),
            }}
            animate={showContent ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
            transition={getTransition(0.5)}
            className='max-md:!px-5 max-md:!py-5'
          >
            <h3
              style={{
                fontFamily: "'Plus Jakarta Sans', sans-serif",
                fontSize: '20px',
                fontWeight: 600,
                color: '#1B998B' /* Turquoise Azur */,
                marginBottom: '12px',
              }}
              className='max-md:!text-[18px]'
            >
              Remboursement possible par les assurances complémentaires
            </h3>
            <p
              style={{
                fontFamily: "'Plus Jakarta Sans', sans-serif",
                fontSize: '16px',
                lineHeight: '1.6',
                color: '#4B5563',
                margin: 0,
              }}
              className='max-md:!text-[15px]'
            >
              De nombreuses assurances complémentaires prennent en charge tout
              ou partie des consultations en nutrition. Nous vous invitons à
              vérifier votre couverture auprès de votre assurance.
            </p>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

export default PersonalJourneySection;
