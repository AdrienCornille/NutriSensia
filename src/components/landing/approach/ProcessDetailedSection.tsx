"use client";

import React from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import {
  Check,
  Lightbulb,
  Clock,
  Video,
  Mail,
  Calendar,
  MessageCircle,
  Target,
  GraduationCap,
} from "lucide-react";

interface ChecklistItem {
  title: string;
  description: string;
}

interface SubStep {
  duration: string;
  title: string;
  description: string;
}

interface Phase {
  icon: string;
  iconComponent?: React.ReactNode;
  title: string;
  duration: string;
  introText?: string;
  checklistItems?: ChecklistItem[];
  tip?: string;
  subSteps?: SubStep[];
  afterItems?: {
    immediately: ChecklistItem[];
    within48h: ChecklistItem[];
    fromNow: ChecklistItem[];
  };
}

interface Step {
  number: number;
  title: string;
  badge: string;
  phases?: Phase[];
  // For Step 2
  mainIntro?: string;
  mainChecklistItems?: ChecklistItem[];
  betweenSection?: {
    title: string;
    items: ChecklistItem[];
  };
  // For Step 3
  autonomyIntro?: string;
  autonomyLearnItems?: ChecklistItem[];
  finalSection?: {
    title: string;
    text: string;
    bulletPoints: string[];
  };
}

export interface ProcessDetailedSectionProps {
  className?: string;
}

export function ProcessDetailedSection({
  className,
}: ProcessDetailedSectionProps) {
  const steps: Step[] = [
    // STEP 1: Consultation Découverte
    {
      number: 1,
      title: "Consultation Découverte",
      badge: "1h30",
      phases: [
        {
          icon: "🕐",
          iconComponent: <Clock className="h-6 w-6" />,
          title: "AVANT LA CONSULTATION - Chez Vous",
          duration: "15 min",
          introText:
            "Une fois votre rendez-vous réservé, vous recevez par email :",
          checklistItems: [
            {
              title: "Questionnaire de santé en ligne",
              description:
                "Histoire médicale, symptômes actuels, objectifs, habitudes alimentaires. Je veux tout savoir pour être préparée.",
            },
            {
              title: "Accès à votre espace plateforme",
              description:
                "Vous pouvez déjà explorer l'interface et préparer vos questions.",
            },
            {
              title: "Instructions pour la visioconférence",
              description:
                "Lien Zoom, conseils pour un bon setup (endroit calme, bon éclairage).",
            },
          ],
          tip: "Préparez une liste de questions. Rien n'est trop bête. C'est VOTRE moment.",
        },
        {
          icon: "💻",
          iconComponent: <Video className="h-6 w-6" />,
          title: "PENDANT LA CONSULTATION - En Visioconférence",
          duration: "1h30",
          subSteps: [
            {
              duration: "0-20 min",
              title: "Accueil et Contexte",
              description:
                "On fait connaissance. Je vous mets à l'aise. On discute de ce qui vous amène, de vos attentes, de vos inquiétudes. C'est votre espace, sans jugement.",
            },
            {
              duration: "20-50 min",
              title: "Anamnèse Approfondie",
              description:
                "Je pose beaucoup de questions. Votre historique médical, vos symptômes, votre énergie, votre sommeil, votre digestion, votre cycle hormonal, votre stress, vos habitudes alimentaires actuelles, vos goûts, vos contraintes. Je creuse pour comprendre VOTRE situation unique.",
            },
            {
              duration: "50-70 min",
              title: "Analyse et Premières Recommandations",
              description:
                "Je vous explique ce que j'observe, les pistes que je vois, les liens que je fais. Je vous donne des premières recommandations immédiates que vous pouvez appliquer dès le lendemain.",
            },
            {
              duration: "70-90 min",
              title: "Questions et Plan d'Action",
              description:
                "Vous me posez toutes vos questions. On discute du programme personnalisé que je vais créer pour vous. On définit ensemble la fréquence de suivi idéale selon vos besoins et votre budget.",
            },
          ],
        },
        {
          icon: "📧",
          iconComponent: <Mail className="h-6 w-6" />,
          title: "APRÈS LA CONSULTATION - Suivi Immédiat",
          duration: "48-72h",
          afterItems: {
            immediately: [
              {
                title: "Récapitulatif par email de ce qu'on a dit",
                description: "",
              },
              {
                title: "Vos premières actions à mettre en place",
                description: "",
              },
              {
                title: "Accès complet à votre plateforme NutriSensia",
                description: "",
              },
            ],
            within48h: [
              {
                title: "Votre programme personnalisé complet",
                description:
                  "plan alimentaire adapté à vos goûts et contraintes, recommandations spécifiques pour votre corps, explications détaillées du pourquoi",
              },
              {
                title:
                  "Plans de repas et listes de courses générés automatiquement selon vos préférences",
                description: "",
              },
              {
                title: "Ressources éducatives pour approfondir",
                description: "",
              },
            ],
            fromNow: [
              {
                title:
                  "Messagerie sécurisée disponible pour toutes vos questions entre les consultations",
                description: "",
              },
            ],
          },
        },
      ],
    },
    // STEP 2: Suivi Régulier
    {
      number: 2,
      title: "Suivi Régulier",
      badge: "Toutes les 2-3 semaines",
      mainIntro:
        "C'est dans le suivi que la transformation se fait vraiment. À chaque consultation :",
      mainChecklistItems: [
        {
          title: "Analyse de vos progrès",
          description:
            "On regarde ce qui fonctionne, ce qui est difficile, ce qui a changé dans votre énergie, votre digestion, votre sommeil, votre poids.",
        },
        {
          title: "Ajustements du plan",
          description:
            "Votre plan n'est pas figé. On l'adapte selon vos résultats, votre évolution, les défis que vous rencontrez.",
        },
        {
          title: "Résolution des difficultés",
          description:
            "Vous avez des questions ? Des blocages ? On en parle, on trouve des solutions ensemble.",
        },
        {
          title: "Éducation continue",
          description:
            "Je vous explique le \"pourquoi\" de chaque recommandation. Vous apprenez à comprendre votre corps.",
        },
        {
          title: "Motivation et encouragement",
          description:
            "Les petites victoires comptent. On les célèbre. Les difficultés sont normales. On les traverse ensemble.",
        },
      ],
      betweenSection: {
        title: "ENTRE LES CONSULTATIONS",
        items: [
          {
            title: "Messagerie sécurisée (réponse en 24h)",
            description:
              "Une question ? Un doute ? Une victoire à partager ? Vous m'écrivez. Je vous réponds dans les 24h.",
          },
          {
            title: "Plateforme accessible 24/7",
            description:
              "Vos plans de repas, votre journal alimentaire, vos ressources, votre suivi de progrès. Tout est là, tout le temps.",
          },
          {
            title: "Ajustements en temps réel",
            description:
              "Si quelque chose ne fonctionne pas, on n'attend pas 3 semaines. On ajuste.",
          },
        ],
      },
    },
    // STEP 3: Autonomisation
    {
      number: 3,
      title: "Autonomisation",
      badge: "Mon Objectif",
      autonomyIntro:
        "Mon but n'est pas de vous rendre dépendante de moi. Mon but est de vous donner les clés pour continuer seule.",
      autonomyLearnItems: [
        {
          title: "Comprendre les signaux de votre corps",
          description:
            "Vraie faim vs fausse faim, fatigue normale vs fatigue pathologique, quand vous avez besoin de repos vs quand vous avez besoin de bouger.",
        },
        {
          title: "Faire les bons choix partout",
          description:
            "Au restaurant, en voyage, lors d'une fête, face au distributeur de l'open space. Vous savez adapter, improviser.",
        },
        {
          title: "Ajuster vous-même selon vos besoins",
          description:
            "Vous connaissez désormais votre corps. Si quelque chose change, vous savez quoi faire.",
        },
        {
          title: "Maintenir vos résultats sur le long terme",
          description:
            "Les habitudes sont ancrées. Elles font partie de vous. Vous n'avez plus besoin de réfléchir, c'est devenu naturel.",
        },
      ],
      finalSection: {
        title: "À la fin de l'accompagnement :",
        text: "Vous n'êtes plus la même personne qu'au début. Vous avez :",
        bulletPoints: [
          "Une compréhension claire de comment VOTRE corps fonctionne",
          "Des habitudes durables qui s'intègrent à votre vie",
          "Une relation apaisée avec la nourriture",
          "Les outils pour continuer seule",
        ],
      },
    },
  ];

  return (
    <section
      className={cn(
        "relative w-full bg-background-primary py-64dp",
        "overflow-hidden",
        className
      )}
    >
      <div className="container mx-auto px-16dp sm:px-24dp lg:px-32dp">
        {/* Header */}
        <motion.div
          className="mb-48dp text-center"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.5, ease: [0.4, 0.0, 0.2, 1] }}
        >
          <p className="mb-12dp font-sans text-caption uppercase tracking-wider text-primary">
            COMMENT ÇA MARCHE
          </p>

          <h2 className="mb-16dp font-sans text-h2 text-primary-dark sm:text-4xl sm:leading-[1.2]">
            Comment Nous Travaillons Ensemble
          </h2>

          <p className="mx-auto max-w-3xl font-sans text-body-large leading-relaxed text-neutral-dark">
            Voici le déroulé complet de votre accompagnement, de la première
            prise de contact jusqu&apos;à votre autonomie. Tout est pensé pour
            vous faciliter la vie et maximiser vos résultats.
          </p>
        </motion.div>

        {/* Steps Timeline */}
        <div className="mx-auto max-w-5xl space-y-48dp">
          {steps.map((step, stepIndex) => (
            <motion.div
              key={stepIndex}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{
                duration: 0.6,
                delay: stepIndex * 0.1,
                ease: [0.4, 0.0, 0.2, 1],
              }}
            >
              {/* Step Header */}
              <div className="mb-32dp">
                <div className="flex items-center gap-16dp">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-accent-teal text-2xl font-bold text-white">
                    {step.number}
                  </div>
                  <div className="flex-1">
                    <h3 className="mb-4dp font-sans text-h3 text-primary-dark">
                      {step.title}
                    </h3>
                    <div className="inline-flex items-center gap-8dp rounded-full bg-accent-teal/10 px-12dp py-4dp">
                      <Clock className="h-4 w-4 text-accent-teal" />
                      <span className="font-sans text-sm font-semibold text-accent-teal">
                        {step.badge}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Step Content */}
              {step.phases && (
                /* Timeline for Step 1 */
                <div className="relative space-y-32dp pl-24dp">
                  {/* Vertical Line */}
                  <div className="absolute left-6 top-0 h-full w-0.5 bg-neutral-border" />

                  {/* Phases */}
                  {step.phases.map((phase, phaseIndex) => (
                    <motion.div
                      key={phaseIndex}
                      className="relative"
                      initial={{ opacity: 0, x: -20 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true, margin: "-50px" }}
                      transition={{
                        duration: 0.5,
                        delay: phaseIndex * 0.15,
                        ease: [0.4, 0.0, 0.2, 1],
                      }}
                    >
                      {/* Timeline Dot */}
                      <div className="absolute -left-[26px] top-0 flex h-6 w-6 items-center justify-center rounded-full border-2 border-accent-teal bg-background-primary">
                        <div className="h-3 w-3 rounded-full bg-accent-teal" />
                      </div>

                      {/* Phase Card */}
                      <div
                        className={cn(
                          "rounded-16dp bg-background-accent p-24dp",
                          "border border-neutral-border",
                          "transition-shadow duration-emphasis",
                          "hover:shadow-card-primary"
                        )}
                      >
                        {/* Phase Header */}
                        <div className="mb-16dp flex items-center justify-between gap-16dp">
                          <div className="flex items-center gap-12dp">
                            <span className="text-3xl">{phase.icon}</span>
                            <h4 className="font-sans text-lg font-semibold text-primary-dark">
                              {phase.title}
                            </h4>
                          </div>
                          <div className="flex items-center gap-8dp rounded-full bg-primary/10 px-12dp py-4dp">
                            <Clock className="h-4 w-4 text-primary" />
                            <span className="font-sans text-sm font-semibold text-primary">
                              {phase.duration}
                            </span>
                          </div>
                        </div>

                        {/* Phase Content */}
                        <div className="space-y-16dp">
                          {phase.introText && (
                            <p className="font-sans text-body leading-relaxed text-neutral-dark">
                              {phase.introText}
                            </p>
                          )}

                          {phase.checklistItems && (
                            <ul className="space-y-12dp">
                              {phase.checklistItems.map((item, itemIndex) => (
                                <li key={itemIndex} className="flex gap-12dp">
                                  <div className="mt-1 flex-shrink-0">
                                    <div className="flex h-5 w-5 items-center justify-center rounded-full bg-accent-teal">
                                      <Check className="h-3 w-3 text-white" />
                                    </div>
                                  </div>
                                  <div>
                                    <p className="mb-4dp font-sans text-body font-semibold text-neutral-dark">
                                      {item.title}
                                    </p>
                                    <p className="font-sans text-body-small leading-relaxed text-neutral-medium">
                                      {item.description}
                                    </p>
                                  </div>
                                </li>
                              ))}
                            </ul>
                          )}

                          {phase.subSteps && (
                            <div className="space-y-16dp">
                              {phase.subSteps.map((subStep, subIndex) => (
                                <div
                                  key={subIndex}
                                  className="flex gap-12dp border-l-2 border-primary/20 pl-16dp"
                                >
                                  <div className="flex-1">
                                    <div className="mb-4dp flex items-center gap-8dp">
                                      <span className="font-sans text-sm font-semibold text-accent-teal">
                                        {subStep.duration}
                                      </span>
                                      <span className="text-neutral-border">
                                        •
                                      </span>
                                      <span className="font-sans text-body font-semibold text-primary-dark">
                                        {subStep.title}
                                      </span>
                                    </div>
                                    <p className="font-sans text-body leading-relaxed text-neutral-dark">
                                      {subStep.description}
                                    </p>
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}

                          {phase.afterItems && (
                            <div className="space-y-16dp">
                              <div>
                                <p className="mb-8dp font-sans text-body font-semibold text-primary-dark">
                                  Immédiatement après :
                                </p>
                                <ul className="space-y-8dp">
                                  {phase.afterItems.immediately.map(
                                    (item, itemIndex) => (
                                      <li
                                        key={itemIndex}
                                        className="flex items-start gap-8dp"
                                      >
                                        <div className="mt-1 flex-shrink-0">
                                          <div className="flex h-5 w-5 items-center justify-center rounded-full bg-accent-teal">
                                            <Check className="h-3 w-3 text-white" />
                                          </div>
                                        </div>
                                        <span className="font-sans text-body leading-relaxed text-neutral-dark">
                                          {item.title}
                                        </span>
                                      </li>
                                    )
                                  )}
                                </ul>
                              </div>

                              <div>
                                <p className="mb-8dp font-sans text-body font-semibold text-primary-dark">
                                  Dans les 48-72h :
                                </p>
                                <ul className="space-y-8dp">
                                  {phase.afterItems.within48h.map(
                                    (item, itemIndex) => (
                                      <li
                                        key={itemIndex}
                                        className="flex items-start gap-8dp"
                                      >
                                        <div className="mt-1 flex-shrink-0">
                                          <div className="flex h-5 w-5 items-center justify-center rounded-full bg-accent-teal">
                                            <Check className="h-3 w-3 text-white" />
                                          </div>
                                        </div>
                                        <div>
                                          <span className="font-sans text-body font-semibold leading-relaxed text-neutral-dark">
                                            {item.title}
                                          </span>
                                          {item.description && (
                                            <span className="font-sans text-body leading-relaxed text-neutral-dark">
                                              {" "}
                                              : {item.description}
                                            </span>
                                          )}
                                        </div>
                                      </li>
                                    )
                                  )}
                                </ul>
                              </div>

                              <div>
                                <p className="mb-8dp font-sans text-body font-semibold text-primary-dark">
                                  Dès maintenant :
                                </p>
                                <ul className="space-y-8dp">
                                  {phase.afterItems.fromNow.map(
                                    (item, itemIndex) => (
                                      <li
                                        key={itemIndex}
                                        className="flex items-start gap-8dp"
                                      >
                                        <div className="mt-1 flex-shrink-0">
                                          <div className="flex h-5 w-5 items-center justify-center rounded-full bg-accent-teal">
                                            <Check className="h-3 w-3 text-white" />
                                          </div>
                                        </div>
                                        <span className="font-sans text-body leading-relaxed text-neutral-dark">
                                          {item.title}
                                        </span>
                                      </li>
                                    )
                                  )}
                                </ul>
                              </div>
                            </div>
                          )}

                          {phase.tip && (
                            <div
                              className={cn(
                                "flex gap-12dp rounded-12dp bg-accent-teal/5 p-16dp",
                                "border-l-4 border-accent-teal"
                              )}
                            >
                              <Lightbulb className="h-5 w-5 flex-shrink-0 text-accent-teal" />
                              <p className="font-sans text-body leading-relaxed text-neutral-dark">
                                <span className="font-semibold">Conseil :</span>{" "}
                                {phase.tip}
                              </p>
                            </div>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}

              {/* Step 2: Suivi Régulier */}
              {step.mainChecklistItems && (
                <div className="space-y-32dp">
                  {/* Main Card */}
                  <div
                    className={cn(
                      "rounded-16dp bg-background-accent p-32dp",
                      "border border-neutral-border",
                      "transition-shadow duration-emphasis",
                      "hover:shadow-card-primary"
                    )}
                  >
                    <div className="mb-24dp flex items-center gap-12dp">
                      <Calendar className="h-8 w-8 text-accent-teal" />
                      <h4 className="font-sans text-xl font-semibold text-primary-dark">
                        Consultations de Suivi
                      </h4>
                      <div className="ml-auto flex items-center gap-8dp rounded-full bg-primary/10 px-12dp py-4dp">
                        <Clock className="h-4 w-4 text-primary" />
                        <span className="font-sans text-sm font-semibold text-primary">
                          1h
                        </span>
                      </div>
                    </div>

                    <p className="mb-24dp font-sans text-body leading-relaxed text-neutral-dark">
                      {step.mainIntro}
                    </p>

                    <ul className="space-y-16dp">
                      {step.mainChecklistItems.map((item, itemIndex) => (
                        <li key={itemIndex} className="flex gap-12dp">
                          <div className="mt-1 flex-shrink-0">
                            <div className="flex h-5 w-5 items-center justify-center rounded-full bg-accent-teal">
                              <Check className="h-3 w-3 text-white" />
                            </div>
                          </div>
                          <div>
                            <p className="mb-4dp font-sans text-body font-semibold text-neutral-dark">
                              {item.title}
                            </p>
                            <p className="font-sans text-body leading-relaxed text-neutral-medium">
                              {item.description}
                            </p>
                          </div>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Between Consultations Section */}
                  {step.betweenSection && (
                    <div
                      className={cn(
                        "rounded-16dp bg-primary/5 p-32dp",
                        "border-l-4 border-primary"
                      )}
                    >
                      <div className="mb-24dp flex items-center gap-12dp">
                        <MessageCircle className="h-8 w-8 text-primary" />
                        <h4 className="font-sans text-xl font-semibold text-primary-dark">
                          {step.betweenSection.title}
                        </h4>
                      </div>

                      <div className="space-y-16dp">
                        {step.betweenSection.items.map((item, itemIndex) => (
                          <div key={itemIndex}>
                            <p className="mb-4dp font-sans text-body font-semibold text-neutral-dark">
                              {item.title}
                            </p>
                            <p className="font-sans text-body leading-relaxed text-neutral-medium">
                              {item.description}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Step 3: Autonomisation */}
              {step.autonomyLearnItems && (
                <div className="space-y-32dp">
                  {/* Main Card */}
                  <div
                    className={cn(
                      "rounded-16dp bg-gradient-to-br from-accent-teal/10 to-primary/10 p-32dp",
                      "border-2 border-accent-teal/30",
                      "transition-shadow duration-emphasis",
                      "hover:shadow-[0_8px_30px_rgba(0,166,147,0.2)]"
                    )}
                  >
                    <div className="mb-24dp flex items-center gap-12dp">
                      <Target className="h-8 w-8 text-accent-teal" />
                      <h4 className="font-sans text-xl font-semibold text-primary-dark">
                        Mon Objectif : Vous Rendre Autonome
                      </h4>
                    </div>

                    <p className="mb-24dp font-sans text-body-large leading-relaxed text-neutral-dark">
                      {step.autonomyIntro}
                    </p>

                    <div className="mb-24dp">
                      <p className="mb-16dp font-sans text-lg font-semibold text-primary-dark">
                        Au fil de l&apos;accompagnement, vous apprenez à :
                      </p>

                      <ul className="space-y-16dp">
                        {step.autonomyLearnItems.map((item, itemIndex) => (
                          <li key={itemIndex} className="flex gap-12dp">
                            <div className="mt-1 flex-shrink-0">
                              <div className="flex h-5 w-5 items-center justify-center rounded-full bg-accent-teal">
                                <Check className="h-3 w-3 text-white" />
                              </div>
                            </div>
                            <div>
                              <p className="mb-4dp font-sans text-body font-semibold text-neutral-dark">
                                {item.title}
                              </p>
                              <p className="font-sans text-body leading-relaxed text-neutral-medium">
                                {item.description}
                              </p>
                            </div>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  {/* Final Section */}
                  {step.finalSection && (
                    <div
                      className={cn(
                        "rounded-16dp bg-primary p-32dp text-white",
                        "shadow-[0_8px_30px_rgba(46,125,94,0.25)]"
                      )}
                    >
                      <div className="mb-24dp flex items-center gap-12dp">
                        <GraduationCap className="h-8 w-8 text-white" />
                        <h4 className="font-sans text-xl font-semibold text-white">
                          {step.finalSection.title}
                        </h4>
                      </div>

                      <p className="mb-16dp font-sans text-body-large leading-relaxed text-white/90">
                        {step.finalSection.text}
                      </p>

                      <ul className="mb-24dp space-y-12dp">
                        {step.finalSection.bulletPoints.map(
                          (point, pointIndex) => (
                            <li
                              key={pointIndex}
                              className="flex items-start gap-8dp"
                            >
                              <span className="mt-1 text-accent-mint">•</span>
                              <span className="font-sans text-body leading-relaxed text-white/90">
                                {point}
                              </span>
                            </li>
                          )
                        )}
                      </ul>

                      <p className="font-sans text-body italic leading-relaxed text-white/80">
                        Et si un jour vous avez besoin d&apos;un coup de pouce,
                        je suis toujours là. Mais vous n&apos;en aurez
                        probablement plus besoin.
                      </p>
                    </div>
                  )}
                </div>
              )}
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default ProcessDetailedSection;
