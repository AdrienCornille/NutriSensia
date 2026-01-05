'use client';

import React, { useEffect, useRef, useState } from 'react';
import { cn } from '@/lib/utils';
import { motion, useInView } from 'framer-motion';

/**
 * Section Problem Identification & Segmentation - Design 2025
 * 
 * Section combinée qui permet aux visiteurs de s'identifier immédiatement
 * à leur situation et de voir qu'il y a une solution spécifique pour eux.
 * 
 * Features:
 * - 4 cartes de problèmes en grid 2x2 (mobile: stack vertical)
 * - Animations d'apparition au scroll avec stagger
 * - Hover effects élégants
 * - Design premium avec bordures colorées
 * - Transition text et mini CTA
 */
export function ProblemSolutionSection() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  // Données des 4 cartes de problèmes
  const problemCards = [
    {
      id: 1,
      icon: '🌸',
      title: 'Vous Souffrez de Troubles Hormonaux',
      problem: 'SOPK, endométriose, SPM intenses, règles irrégulières... Vous sentez que votre alimentation joue un rôle, mais personne ne vous a expliqué lequel. Les symptômes vous épuisent et impactent votre quotidien.',
      solution: 'Je vous aide à réduire l\'inflammation et rééquilibrer vos hormones naturellement.'
    },
    {
      id: 2,
      icon: '⚖️',
      title: 'Vous Êtes Fatiguée des Régimes',
      problem: 'Plusieurs régimes essayés, aucun résultat durable. Votre poids fluctue, votre énergie aussi. Culpabilité à chaque repas, impression de ne jamais être « assez ». Vous voulez sortir de ce cercle vicieux.',
      solution: 'Je vous apprends à transformer votre corps sans restriction ni effet rebond.'
    },
    {
      id: 3,
      icon: '⚡',
      title: 'Vous Manquez d\'Énergie Malgré Vos Efforts',
      problem: 'Performante professionnellement, mais votre corps tire la langue. Fatigue chronique, coups de barre à 15h, ballonnements, brouillard mental. Vous méritez de vous sentir bien en travaillant.',
      solution: 'Je vous montre comment nourrir votre corps pour retrouver énergie et concentration.'
    },
    {
      id: 4,
      icon: '❤️',
      title: 'Vous Devez Contrôler Votre Glycémie',
      problem: 'Diabétique ou prédiabétique, vous craignez les complications. Vous voulez stabiliser votre glycémie sans vous sentir privée, comprendre l\'impact réel de chaque aliment sur votre corps.',
      solution: 'Je vous accompagne vers un équilibre glycémique stable et sans frustration.'
    }
  ];

  return (
    <section 
      id="problem-solution" 
      className={cn(
        "relative",
        "bg-white",
        "py-[100px] px-10 md:px-16 lg:px-20",
        "md:py-[100px]"
      )}
    >
      {/* Container principal */}
      <div className="container mx-auto max-w-[1370px]">
        
        {/* ============================================ */}
        {/* HEADER SECTION                               */}
        {/* ============================================ */}
        <div className="text-center mb-[60px]">
          {/* Section Label */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
            transition={{ duration: 0.5 }}
            className={cn(
              "font-['Inter',system-ui,sans-serif]",
              "text-[0.875rem] uppercase",
              "letter-spacing-[1.5px]",
              "text-primary",
              "font-semibold",
              "mb-3"
            )}
          >
            POUR QUI ?
          </motion.div>

          {/* H2 Title */}
          <motion.h2
            initial={{ opacity: 0, y: 30 }}
            animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className={cn(
              "font-sans",
              "text-[2rem] md:text-[2.5rem]",
              "font-bold",
              "text-[#2C3E3C]",
              "mb-4"
            )}
          >
            Vous Vous Reconnaissez ?
          </motion.h2>

          {/* Subheadline */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className={cn(
              "font-['Inter',system-ui,sans-serif]",
              "text-[1.125rem]",
              "text-[#667674]",
              "max-w-[840px]",
              "mx-auto"
            )}
          >
            Quel que soit votre défi, il y a une solution adaptée.
          </motion.p>
        </div>

        {/* ============================================ */}
        {/* CARDS GRID                                   */}
        {/* ============================================ */}
        <div 
          ref={ref}
          className={cn(
            "grid grid-cols-1 md:grid-cols-2",
            "gap-[30px]",
            "mb-[50px]"
          )}
        >
          {problemCards.map((card, index) => (
            <motion.div
              key={card.id}
              initial={{ opacity: 0, y: 30 }}
              animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
              transition={{ 
                duration: 0.6, 
                delay: 0.3 + (index * 0.15),
                ease: "easeOut"
              }}
              className={cn(
                // Base styling
                "bg-[#F8FAF9]",
                "p-10 md:p-10",
                "rounded-xl",
                "border-l-4 border-primary",
                "shadow-[0_2px_10px_rgba(44,62,60,0.06)]",
                "transition-all duration-300 ease-out",
                "cursor-default",
                // Hover effects
                "hover:-translate-y-[5px]",
                "hover:shadow-[0_8px_25px_rgba(44,62,60,0.12)]",
                "hover:border-l-[6px]"
              )}
            >
              {/* Icon */}
              <div className={cn(
                "text-[2.5rem]",
                "mb-5"
              )}>
                {card.icon}
              </div>

              {/* Card Title (H3) */}
              <h3 className={cn(
                "font-['Inter',system-ui,sans-serif]",
                "text-[1.25rem] md:text-[1.5rem]",
                "font-bold",
                "text-[#2C3E3C]",
                "mb-4",
                "leading-[1.3]"
              )}>
                {card.title}
              </h3>

              {/* Problem Text */}
              <p className={cn(
                "font-['Inter',system-ui,sans-serif]",
                "text-[0.95rem]",
                "leading-[1.7]",
                "text-[#667674]",
                "mb-5"
              )}>
                {card.problem}
              </p>

              {/* Separator Line */}
              <div className={cn(
                "w-[60px]",
                "h-[2px]",
                "bg-gradient-to-r from-primary to-primary/60",
                "my-5"
              )} />

              {/* Solution Text */}
              <div className={cn(
                "flex items-start gap-2"
              )}>
                <span className={cn(
                  "text-primary",
                  "font-semibold",
                  "text-[1rem]",
                  "flex-shrink-0"
                )}>
                  →
                </span>
                <p className={cn(
                  "font-['Inter',system-ui,sans-serif]",
                  "text-[1rem]",
                  "font-semibold",
                  "text-primary",
                  "leading-[1.5]"
                )}>
                  {card.solution}
                </p>
              </div>
            </motion.div>
          ))}
        </div>

        {/* ============================================ */}
        {/* TRANSITION TEXT & MINI CTA                   */}
        {/* ============================================ */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
          transition={{ duration: 0.6, delay: 0.9 }}
          className={cn(
            "text-center",
            "max-w-[840px]",
            "mx-auto"
          )}
        >
          {/* Transition Text */}
          <p className={cn(
            "font-['Inter',system-ui,sans-serif]",
            "text-[1.125rem]",
            "italic",
            "text-primary",
            "leading-[1.6]",
            "mb-6"
          )}>
            Quelle que soit votre situation, l'alimentation peut devenir votre meilleure alliée.
          </p>

          {/* Mini CTA */}
          <motion.button
            className={cn(
              "inline-flex items-center gap-2",
              "font-['Inter',system-ui,sans-serif]",
              "text-[1rem]",
              "font-semibold",
              "text-primary",
              "transition-all duration-300",
              "hover:gap-3",
              "group"
            )}
            onClick={() => {
              window.location.href = '/contact?type=consultation';
            }}
            whileHover={{ scale: 1.02 }}
          >
            <span className="border-b-2 border-transparent group-hover:border-primary transition-all">
              Réserver ma consultation découverte
            </span>
            <span className="transition-transform group-hover:translate-x-1">
              →
            </span>
          </motion.button>
        </motion.div>
      </div>
    </section>
  );
}