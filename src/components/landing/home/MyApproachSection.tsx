'use client';

import React from 'react';
import { cn } from '@/lib/utils';

/**
 * Section "Mon Approche" - VERSION MODERNISÉE 2025
 *
 * Présente l'histoire personnelle de Lucie Cornille avec un design moderne,
 * épuré et engageant qui utilise les dernières tendances de design :
 * - Typographie XXL impactante
 * - Glassmorphism (effet de verre)
 * - Blobs animés en arrière-plan
 * - Photo professionnelle avec effets modernes
 * - Badge flottant de preuve sociale
 * - Animations fluides
 */
export function MyApproachSection() {
  return (
    <section className='relative py-20 md:py-32 overflow-hidden bg-gradient-to-br from-background-secondary via-white to-background-accent'>
      {/* Arrière-plan moderne avec blobs animés - Créent une atmosphère dynamique */}
      <div className='absolute inset-0 overflow-hidden pointer-events-none'>
        {/* Premier blob - Coin supérieur droit */}
        <div
          className='absolute top-10 right-10 w-[500px] h-[500px] bg-gradient-to-br from-primary/10 to-accent-teal/10 rounded-full blur-3xl animate-pulse'
          style={{ animationDuration: '4s' }}
        />
        {/* Deuxième blob - Coin inférieur gauche */}
        <div
          className='absolute bottom-20 left-10 w-[600px] h-[600px] bg-gradient-to-tr from-accent-mint/10 to-secondary/10 rounded-full blur-3xl animate-pulse'
          style={{ animationDuration: '6s', animationDelay: '1s' }}
        />
        {/* Grille moderne subtile en arrière-plan */}
        <div className='absolute inset-0 bg-[linear-gradient(to_right,#80808008_1px,transparent_1px),linear-gradient(to_bottom,#80808008_1px,transparent_1px)] bg-[size:64px_64px]' />
      </div>

      <div className='container mx-auto px-6 md:px-8 lg:px-12 relative z-10'>
        {/* En-tête de section avec badge */}
        <div className='text-center mb-16 md:mb-20 animate-fadeIn'>
          {/* Badge avec glassmorphism et effet pulsant */}
          <div className='inline-flex items-center gap-2 px-4 py-2 rounded-full backdrop-blur-xl bg-white/60 border border-white/80 shadow-glass mb-6'>
            <span className='relative flex h-2 w-2'>
              <span className='animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75'></span>
              <span className='relative inline-flex rounded-full h-2 w-2 bg-primary'></span>
            </span>
            <span className='text-sm font-medium text-neutral-dark'>
              Mon Histoire
            </span>
          </div>

          {/* Titre XXL moderne avec dégradé animé */}
          <h2 className='text-4xl md:text-5xl lg:text-6xl leading-[1.1] font-bold tracking-tight mb-6'>
            <span className='block text-neutral-dark mb-2'>
              Une Nutritionniste Qui Vous Comprend,
            </span>
            <span className='block bg-gradient-to-r from-primary via-accent-teal to-primary bg-clip-text text-transparent animate-gradient bg-[length:200%_auto]'>
              Parce Qu'Elle Est Passée Par Là
            </span>
          </h2>

          {/* Sous-titre avec accentuation */}
          <p className='text-lg md:text-xl text-neutral-medium leading-relaxed max-w-[922px] mx-auto'>
            De la lutte personnelle à l'accompagnement professionnel :{' '}
            <span className='text-neutral-dark font-semibold relative inline-block'>
              mon parcours est ma force
              <span className='absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-primary to-accent-teal opacity-30'></span>
            </span>
          </p>
        </div>

        {/* Contenu principal en deux colonnes : Photo + Texte */}
        <div className='max-w-[1370px] mx-auto grid lg:grid-cols-2 gap-12 lg:gap-16 items-center mb-20'>
          {/* Colonne gauche : Photo avec effets modernes */}
          <div
            className='relative group animate-fadeIn'
            style={{ animationDelay: '0.2s' }}
          >
            {/* Effet de glow (halo lumineux) autour de la photo */}
            <div
              className='absolute -inset-4 bg-gradient-to-r from-primary/20 to-accent-teal/20 rounded-3xl blur-2xl opacity-30 animate-pulse'
              style={{ animationDuration: '3s' }}
            ></div>

            {/* Carte avec glassmorphism contenant la photo */}
            <div className='relative backdrop-blur-xl bg-white/40 rounded-3xl border border-white/60 shadow-glass-lg overflow-hidden transform transition-all duration-500 hover:scale-[1.02]'>
              {/* Aspect ratio 4:5 pour une photo portrait élégante */}
              <div className='aspect-[4/5] relative'>
                {/* Placeholder image - Remplacer par la vraie photo de Lucie */}
                <div
                  className='absolute inset-0 bg-cover bg-center bg-no-repeat transition-transform duration-700 group-hover:scale-110'
                  style={{
                    backgroundImage:
                      'url(data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 500"%3E%3Cdefs%3E%3ClinearGradient id="grad1" x1="0%25" y1="0%25" x2="100%25" y2="100%25"%3E%3Cstop offset="0%25" style="stop-color:%232E7D5E;stop-opacity:0.3" /%3E%3Cstop offset="100%25" style="stop-color:%2300A693;stop-opacity:0.3" /%3E%3C/linearGradient%3E%3C/defs%3E%3Crect width="400" height="500" fill="url(%23grad1)"/%3E%3Ctext x="50%25" y="50%25" font-family="Arial" font-size="20" fill="%23374151" text-anchor="middle" dominant-baseline="middle"%3EPhoto de Lucie Cornille%3C/text%3E%3C/svg%3E)',
                  }}
                >
                  {/* Overlay dégradé subtil */}
                  <div className='absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent-teal/5'></div>

                  {/* Reflet lumineux en haut (effet réaliste) */}
                  <div className='absolute top-0 left-0 right-0 h-32 bg-gradient-to-b from-white/20 to-transparent'></div>
                </div>
              </div>

              {/* Bordure lumineuse animée au hover */}
              <div className='absolute inset-0 rounded-3xl bg-gradient-to-r from-primary via-accent-teal to-primary opacity-0 group-hover:opacity-20 transition-opacity duration-500 bg-[length:200%_auto] animate-gradient pointer-events-none'></div>
            </div>

            {/* Badge flottant de preuve sociale */}
            <div
              className='absolute -bottom-6 -right-6 backdrop-blur-xl bg-white/90 border border-white/60 rounded-2xl px-6 py-4 shadow-xl animate-scaleIn'
              style={{ animationDelay: '0.6s' }}
            >
              <div className='flex items-center gap-3'>
                {/* Avatars empilés (représentent les patients) */}
                <div className='flex -space-x-2'>
                  <div className='w-8 h-8 rounded-full bg-gradient-to-br from-primary to-accent-teal border-2 border-white'></div>
                  <div className='w-8 h-8 rounded-full bg-gradient-to-br from-accent-teal to-secondary border-2 border-white'></div>
                  <div className='w-8 h-8 rounded-full bg-gradient-to-br from-secondary to-accent-mint border-2 border-white'></div>
                </div>
                <div>
                  <p className='text-sm font-bold text-neutral-dark'>
                    +200 patients
                  </p>
                  <p className='text-xs text-neutral-medium'>accompagnés</p>
                </div>
              </div>
            </div>
          </div>

          {/* Colonne droite : Texte narratif */}
          <div
            className='space-y-6 animate-slideInRight'
            style={{ animationDelay: '0.3s' }}
          >
            {/* Introduction avec nom en évidence */}
            <div className='relative'>
              <p className='text-xl md:text-2xl text-neutral-dark leading-relaxed font-medium'>
                Je m'appelle{' '}
                <span className='relative inline-block'>
                  <span className='text-primary font-bold'>Lucie Cornille</span>
                  {/* Soulignement décoratif */}
                  <span className='absolute -bottom-1 left-0 w-full h-0.5 bg-gradient-to-r from-primary to-accent-teal'></span>
                </span>
                , et je ne suis pas qu'une thérapeute en nutrition.
              </p>
            </div>

            {/* Paragraphes avec espacement optimal pour la lisibilité */}
            <p className='text-base md:text-lg text-neutral-medium leading-relaxed'>
              J'ai moi-même vécu des années en difficulté avec mon alimentation
              et mon corps. Les régimes restrictifs, la culpabilité à chaque
              repas, l'impression de ne jamais être "assez".
            </p>

            <p className='text-base md:text-lg text-neutral-medium leading-relaxed'>
              Jusqu'au jour où j'ai compris que{' '}
              <span className='text-neutral-dark font-semibold'>
                la nutrition n'était pas une punition, mais un outil de
                transformation
              </span>
              .
            </p>

            {/* Parcours professionnel dans une carte subtile */}
            <div className='relative p-6 rounded-2xl bg-gradient-to-br from-white/60 to-background-accent/60 backdrop-blur-sm border border-white/40 shadow-glass'>
              <p className='text-base md:text-lg text-neutral-medium leading-relaxed'>
                Après des années comme aide-soignante en EMS, puis assistante
                administrative en neurologie au CHUV, j'ai décidé de me former
                sérieusement :
              </p>

              {/* Liste des qualifications avec icônes */}
              <ul className='mt-4 space-y-2'>
                <li className='flex items-start gap-3'>
                  <svg
                    className='w-5 h-5 text-primary mt-1 flex-shrink-0'
                    fill='currentColor'
                    viewBox='0 0 20 20'
                  >
                    <path
                      fillRule='evenodd'
                      d='M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z'
                      clipRule='evenodd'
                    />
                  </svg>
                  <span className='text-neutral-dark'>
                    Diplôme en nutrition et micronutrition (TCMA)
                  </span>
                </li>
                <li className='flex items-start gap-3'>
                  <svg
                    className='w-5 h-5 text-primary mt-1 flex-shrink-0'
                    fill='currentColor'
                    viewBox='0 0 20 20'
                  >
                    <path
                      fillRule='evenodd'
                      d='M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z'
                      clipRule='evenodd'
                    />
                  </svg>
                  <span className='text-neutral-dark'>
                    Agréments ASCA et RME
                  </span>
                </li>
              </ul>
            </div>

            <p className='text-base md:text-lg text-neutral-medium leading-relaxed'>
              Mais surtout, j'ai appris à{' '}
              <span className='text-neutral-dark font-semibold'>
                écouter le corps, décoder ses signaux, et créer des changements
                qui durent
              </span>
              .
            </p>

            {/* Mission actuelle avec fond subtil */}
            <div className='relative p-6 rounded-2xl bg-gradient-to-br from-primary/5 to-accent-teal/5 border border-primary/10'>
              <p className='text-base md:text-lg text-neutral-dark leading-relaxed font-medium'>
                Aujourd'hui, j'accompagne des femmes et des actifs qui veulent
                sortir du cercle vicieux des régimes, comprendre leurs troubles
                (digestifs, hormonaux, métaboliques) et retrouver une relation
                apaisée avec leur assiette.
              </p>
            </div>
          </div>
        </div>

        {/* Citation inspirante avec glassmorphism moderne */}
        <div
          className='max-w-[1370px] mx-auto animate-scaleIn'
          style={{ animationDelay: '0.5s' }}
        >
          <div className='relative backdrop-blur-2xl bg-white/60 rounded-3xl border border-white/80 shadow-glass-lg overflow-hidden p-8 md:p-12'>
            {/* Effet de glow subtil en arrière-plan */}
            <div className='absolute -inset-4 bg-gradient-to-r from-primary/10 to-accent-teal/10 blur-3xl opacity-50'></div>

            {/* Contenu de la citation */}
            <div className='relative z-10'>
              {/* Icône de guillemets décorative */}
              <svg
                className='w-12 h-12 md:w-16 md:h-16 text-primary/20 mb-6 mx-auto'
                fill='currentColor'
                viewBox='0 0 24 24'
              >
                <path d='M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h3.983v10h-9.983z' />
              </svg>

              {/* Texte de la citation */}
              <blockquote className='text-xl md:text-2xl lg:text-3xl text-neutral-dark font-medium leading-relaxed text-center mb-6'>
                "Mon objectif n'est pas de vous donner un énième plan
                alimentaire rigide. C'est de vous apprendre à nourrir votre
                corps avec{' '}
                <span className='bg-gradient-to-r from-primary via-accent-teal to-primary bg-clip-text text-transparent font-bold'>
                  intelligence, bienveillance et résultats durables
                </span>
                ."
              </blockquote>

              {/* Auteur de la citation */}
              <div className='text-center'>
                <cite className='text-base md:text-lg text-primary font-semibold not-italic block'>
                  Lucie Cornille
                </cite>
                <p className='text-sm text-neutral-medium mt-1'>
                  Thérapeute en Nutrition & Micronutrition
                </p>
              </div>

              {/* Badges de crédibilité en dessous */}
              <div className='flex flex-wrap items-center justify-center gap-3 mt-8'>
                <div className='flex items-center gap-2 px-4 py-2 rounded-full bg-white/60 backdrop-blur-sm border border-white/80 shadow-sm'>
                  <svg
                    className='w-4 h-4 text-functional-success'
                    fill='currentColor'
                    viewBox='0 0 20 20'
                  >
                    <path
                      fillRule='evenodd'
                      d='M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z'
                      clipRule='evenodd'
                    />
                  </svg>
                  <span className='text-sm font-medium text-neutral-dark'>
                    Agréée ASCA
                  </span>
                </div>
                <div className='flex items-center gap-2 px-4 py-2 rounded-full bg-white/60 backdrop-blur-sm border border-white/80 shadow-sm'>
                  <svg
                    className='w-4 h-4 text-functional-success'
                    fill='currentColor'
                    viewBox='0 0 20 20'
                  >
                    <path
                      fillRule='evenodd'
                      d='M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z'
                      clipRule='evenodd'
                    />
                  </svg>
                  <span className='text-sm font-medium text-neutral-dark'>
                    Agréée RME
                  </span>
                </div>
                <div className='flex items-center gap-2 px-4 py-2 rounded-full bg-white/60 backdrop-blur-sm border border-white/80 shadow-sm'>
                  <svg
                    className='w-4 h-4 text-functional-success'
                    fill='currentColor'
                    viewBox='0 0 20 20'
                  >
                    <path d='M9 2a1 1 0 000 2h2a1 1 0 100-2H9z' />
                    <path
                      fillRule='evenodd'
                      d='M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm9.707 5.707a1 1 0 00-1.414-1.414L9 12.586l-1.293-1.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z'
                      clipRule='evenodd'
                    />
                  </svg>
                  <span className='text-sm font-medium text-neutral-dark'>
                    Diplômée TCMA
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
