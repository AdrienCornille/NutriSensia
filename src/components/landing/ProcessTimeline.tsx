'use client';

import { motion } from 'framer-motion';
import { Button } from '@/components/ui/Button';
import { Check } from 'lucide-react';
import { cn } from '@/lib/utils';

interface TimelineStep {
  number: string;
  title: string;
  duration: string;
  description: string;
  highlight: {
    title: string;
    items: string[];
  };
}

/**
 * Section ProcessTimeline - Comment nous travaillons ensemble
 *
 * Timeline verticale progressive en 3 étapes pour présenter le processus d'accompagnement.
 *
 * Design System NutriSensia :
 * - Police : Inter (famille sans-serif du design system)
 * - Couleurs : Primary (#2E7D5E), Secondary (#4A9B7B), Accent Teal (#00A693), Sage palette
 * - Typographie : text-h2, text-h3, text-h4, text-body-large, text-caption
 * - Spacing : 16dp, 24dp, 32dp, 48dp, 64dp
 * - Animations : duration-emphasis (300ms) avec timing-emphasis
 * - Borders : rounded-16dp, rounded-12dp
 * - Shadows : card-primary
 */

const steps: TimelineStep[] = [
  {
    number: '01',
    title: 'Consultation Découverte',
    duration: '1h30 en visioconférence',
    description:
      "Avant notre première rencontre, vous remplissez un questionnaire de santé pour que je puisse bien préparer notre échange. Pendant la consultation, nous prenons le temps d'explorer votre situation en profondeur : vos symptômes, votre parcours, vos habitudes, vos contraintes du quotidien, ce qui est important pour vous. Je vous propose des premières pistes concrètes à intégrer progressivement. Dans les 48-72h, vous recevez votre programme personnalisé sur la plateforme NutriSensia : un plan alimentaire adapté à votre réalité, des listes de courses, et les explications qui donnent du sens.",
    highlight: {
      title: 'Ce qui est inclus',
      items: [
        'Programme nutritionnel personnalisé',
        'Accès plateforme 24/7',
        'Messagerie sécurisée (réponse sous 24h)',
      ],
    },
  },
  {
    number: '02',
    title: 'Suivi Régulier',
    duration: '1h toutes les 2-3 semaines',
    description:
      "Le suivi est là pour ancrer les transformations dans la durée. À chaque consultation, nous regardons ensemble ce qui fonctionne, ce qui demande plus d'attention, comment votre corps évolue. Nous ajustons votre plan selon votre progression et vos besoins du moment. Vous apprenez progressivement à décoder les signaux de votre corps et à comprendre la logique derrière chaque ajustement. Entre les consultations, vous pouvez m'écrire pour toute question ou doute. Nous restons en lien pour adapter en temps réel si nécessaire.",
    highlight: {
      title: 'Ce qui change',
      items: [
        'Vous comprenez mieux votre corps',
        'Vous gagnez en confiance pour adapter',
        'Les résultats s\'installent naturellement',
      ],
    },
  },
  {
    number: '03',
    title: 'Autonomisation',
    duration: "L'objectif final",
    description:
      "Mon accompagnement vise à vous transmettre les clés pour continuer en toute autonomie. Au fil de notre travail ensemble, vous développez cette capacité à reconnaître vos vrais besoins, à faire des choix adaptés dans différentes situations, à ajuster quand votre vie change. Les nouvelles habitudes s'intègrent progressivement, deviennent de plus en plus naturelles. Vous gagnez en clarté et en confiance pour avancer seul·e.",
    highlight: {
      title: 'Le résultat',
      items: [
        'Vous gagnez en autonomie',
        'Les changements s\'inscrivent durablement',
        'Vous trouvez votre équilibre personnel',
      ],
    },
  },
];

export default function ProcessTimeline() {
  return (
    <section className={cn(
      'relative w-full bg-gradient-to-b from-background-primary to-sage-50',
      'py-64dp'
    )}>
      <div className="container mx-auto px-16dp sm:px-24dp lg:px-32dp max-w-5xl">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-100px' }}
          transition={{ duration: 0.3, ease: [0.4, 0.0, 0.2, 1] }}
          className="text-center mb-48dp"
        >
          <p className="mb-12dp font-sans text-caption uppercase tracking-wider text-primary">
            LE PROCESSUS
          </p>
          <h2 className="mb-16dp font-sans text-h2 text-primary-dark sm:text-4xl sm:leading-[1.2]">
            Comment nous travaillons ensemble
          </h2>
          <p className="mx-auto max-w-3xl font-sans text-body-large leading-relaxed text-neutral-dark">
            Un accompagnement en 3 étapes pour des résultats durables
          </p>
        </motion.div>

        {/* Timeline */}
        <div className="relative">
          {/* Vertical line */}
          <div className="absolute left-32dp md:left-48dp top-0 bottom-0 w-[2px] bg-gradient-to-b from-primary via-secondary to-accent-teal" />

          {/* Steps */}
          <div className="space-y-48dp">
            {steps.map((step, index) => (
              <motion.div
                key={step.number}
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, margin: '-50px' }}
                transition={{
                  duration: 0.3,
                  delay: index * 0.1,
                  ease: [0.4, 0.0, 0.2, 1]
                }}
                className="relative"
              >
                {/* Number Circle */}
                <div className="absolute left-16dp md:left-32dp flex items-center justify-center w-64dp h-64dp bg-primary text-white rounded-full shadow-card-primary border-4 border-white z-10">
                  <span className="font-sans text-h3 font-bold">{step.number}</span>
                </div>

                {/* Content Card */}
                <div className="ml-96dp md:ml-[120px] bg-background-primary rounded-16dp shadow-card-primary hover:shadow-card-dashboard transition-shadow duration-emphasis overflow-hidden">
                  {/* Card Header */}
                  <div className="bg-gradient-to-r from-sage-50 to-background-primary p-24dp border-b border-neutral-border">
                    <h3 className="font-sans text-h3 text-primary-dark mb-8dp sm:text-3xl">
                      {step.number} • {step.title}
                    </h3>
                    <p className="font-sans text-body-small text-neutral-medium font-medium">
                      {step.duration}
                    </p>
                  </div>

                  {/* Card Body */}
                  <div className="p-24dp space-y-24dp">
                    {/* Description */}
                    <p className="font-sans text-body-large leading-relaxed text-neutral-dark">
                      {step.description}
                    </p>

                    {/* Highlight Box */}
                    <div className="bg-sage-50 rounded-12dp p-16dp border border-sage-100">
                      <h4 className="font-sans text-caption font-bold text-primary uppercase tracking-wider mb-12dp">
                        {step.highlight.title}
                      </h4>
                      <ul className="space-y-8dp">
                        {step.highlight.items.map((item, idx) => (
                          <li key={idx} className="flex items-start gap-8dp">
                            <Check className="w-16dp h-16dp text-accent-teal flex-shrink-0 mt-4dp" />
                            <span className="font-sans text-body text-neutral-dark">
                              {item}
                            </span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-50px' }}
          transition={{ duration: 0.3, delay: 0.3, ease: [0.4, 0.0, 0.2, 1] }}
          className="mt-64dp text-center"
        >
          <Button
            size="lg"
            className="bg-primary hover:bg-primary-dark text-white px-32dp py-16dp font-sans text-button rounded-full shadow-card-primary hover:shadow-card-dashboard transition-all duration-emphasis"
          >
            Réserver ma consultation
          </Button>
          <p className="mt-16dp font-sans text-body-small text-neutral-medium">
            Première consultation découverte • 1h30 en visioconférence
          </p>
        </motion.div>
      </div>
    </section>
  );
}
